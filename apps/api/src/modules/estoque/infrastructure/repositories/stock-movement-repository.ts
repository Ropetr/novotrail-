import { eq, and, sql, desc } from 'drizzle-orm';
import type {
  IStockMovementRepository,
  ListResult,
} from '../../domain/repositories';
import type {
  StockMovement,
  CreateMovementDTO,
  MovementType,
} from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import type { PaginationInput } from '@trailsystem/types';
import { stockMovements, stockLevels } from '../schema';

/**
 * Tipos de movimentação que ADICIONAM estoque.
 */
const INBOUND_TYPES: MovementType[] = ['purchase_in', 'return_in', 'transfer_in', 'adjustment'];

/**
 * Tipos de movimentação que RETIRAM estoque.
 */
const OUTBOUND_TYPES: MovementType[] = ['sale_out', 'transfer_out', 'damage', 'loss', 'bonus_out'];

export class StockMovementRepository implements IStockMovementRepository {
  constructor(private db: DatabaseConnection) {}

  async list(
    tenantId: string,
    params: PaginationInput & { productId?: string; warehouseId?: string; type?: string }
  ): Promise<ListResult<StockMovement>> {
    const { page, limit, productId, warehouseId, type } = params;
    const offset = (page - 1) * limit;

    const conditions = [eq(stockMovements.tenantId, tenantId)];
    if (productId) conditions.push(eq(stockMovements.productId, productId));
    if (warehouseId) conditions.push(eq(stockMovements.warehouseId, warehouseId));
    if (type) conditions.push(eq(stockMovements.type, type as MovementType));

    const whereClause = and(...conditions);

    const [data, countResult] = await Promise.all([
      this.db
        .select()
        .from(stockMovements)
        .where(whereClause)
        .orderBy(desc(stockMovements.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(stockMovements)
        .where(whereClause),
    ]);

    return {
      data: data as unknown as StockMovement[],
      total: Number(countResult[0].count),
    };
  }

  async getById(id: string, tenantId: string): Promise<StockMovement | null> {
    const result = await this.db
      .select()
      .from(stockMovements)
      .where(and(eq(stockMovements.id, id), eq(stockMovements.tenantId, tenantId)))
      .limit(1);
    return (result[0] as unknown as StockMovement) || null;
  }

  /**
   * Cria uma movimentação e atualiza o saldo (stock_levels) automaticamente.
   * Implementa Custo Médio Ponderado (RN-01) para entradas de compra.
   */
  async create(
    tenantId: string,
    data: CreateMovementDTO,
    userId?: string
  ): Promise<StockMovement> {
    const totalCost = data.unitCost
      ? (data.quantity * data.unitCost).toFixed(4)
      : null;

    // 1. Inserir a movimentação (imutável)
    const [movement] = await this.db
      .insert(stockMovements)
      .values({
        tenantId,
        productId: data.productId,
        warehouseId: data.warehouseId,
        type: data.type,
        quantity: data.quantity.toString(),
        unitCost: data.unitCost?.toString() || null,
        totalCost,
        referenceType: data.referenceType || null,
        referenceId: data.referenceId || null,
        batchId: data.batchId || null,
        reason: data.reason || null,
        notes: data.notes || null,
        createdBy: userId || null,
      })
      .returning();

    // 2. Atualizar o saldo (stock_levels)
    await this.updateStockLevel(tenantId, data);

    return movement as unknown as StockMovement;
  }

  /**
   * Atualiza o stock_level com base no tipo de movimentação.
   * Cria o registro se não existir (upsert).
   */
  private async updateStockLevel(tenantId: string, data: CreateMovementDTO): Promise<void> {
    const isInbound = INBOUND_TYPES.includes(data.type);
    const quantityChange = isInbound ? data.quantity : -data.quantity;

    // Buscar saldo atual
    const existing = await this.db
      .select()
      .from(stockLevels)
      .where(
        and(
          eq(stockLevels.tenantId, tenantId),
          eq(stockLevels.productId, data.productId),
          eq(stockLevels.warehouseId, data.warehouseId)
        )
      )
      .limit(1);

    if (existing[0]) {
      const currentQty = Number(existing[0].quantity);
      const newQty = currentQty + quantityChange;

      const updates: Record<string, any> = {
        quantity: Math.max(0, newQty).toString(),
      };

      // RN-01: Custo Médio Ponderado para entradas de compra
      if (data.type === 'purchase_in' && data.unitCost) {
        const currentCost = Number(existing[0].averageCost);
        const newAvgCost =
          currentQty + data.quantity > 0
            ? (currentQty * currentCost + data.quantity * data.unitCost) /
              (currentQty + data.quantity)
            : data.unitCost;
        updates.averageCost = newAvgCost.toFixed(4);
        updates.lastPurchaseCost = data.unitCost.toString();
      }

      await this.db
        .update(stockLevels)
        .set(updates)
        .where(eq(stockLevels.id, existing[0].id));
    } else {
      // Criar novo registro de saldo
      await this.db.insert(stockLevels).values({
        tenantId,
        productId: data.productId,
        warehouseId: data.warehouseId,
        quantity: Math.max(0, quantityChange).toString(),
        reservedQty: '0',
        averageCost: data.unitCost?.toString() || '0',
        lastPurchaseCost: data.unitCost?.toString() || null,
      });
    }
  }
}
