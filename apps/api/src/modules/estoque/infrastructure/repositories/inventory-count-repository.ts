import { eq, and, sql, desc } from 'drizzle-orm';
import type {
  IInventoryCountRepository,
  ListResult,
} from '../../domain/repositories';
import type {
  InventoryCount,
  InventoryCountWithItems,
  CreateInventoryCountDTO,
  CountItemDTO,
} from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import type { PaginationInput } from '@trailsystem/types';
import { inventoryCounts, inventoryCountItems, stockLevels, stockMovements } from '../schema';

export class InventoryCountRepository implements IInventoryCountRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput): Promise<ListResult<InventoryCount>> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;
    const whereClause = eq(inventoryCounts.tenantId, tenantId);

    const [data, countResult] = await Promise.all([
      this.db
        .select()
        .from(inventoryCounts)
        .where(whereClause)
        .orderBy(desc(inventoryCounts.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(inventoryCounts)
        .where(whereClause),
    ]);

    return {
      data: data as unknown as InventoryCount[],
      total: Number(countResult[0].count),
    };
  }

  async getById(id: string, tenantId: string): Promise<InventoryCountWithItems | null> {
    const result = await this.db
      .select()
      .from(inventoryCounts)
      .where(and(eq(inventoryCounts.id, id), eq(inventoryCounts.tenantId, tenantId)))
      .limit(1);

    if (!result[0]) return null;

    const items = await this.db
      .select()
      .from(inventoryCountItems)
      .where(eq(inventoryCountItems.inventoryCountId, id));

    return {
      ...(result[0] as unknown as InventoryCount),
      items: items as any[],
    };
  }

  /**
   * Cria um novo inventário e gera automaticamente um número sequencial.
   */
  async create(
    tenantId: string,
    data: CreateInventoryCountDTO,
    userId?: string
  ): Promise<InventoryCount> {
    // Gerar número sequencial
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(inventoryCounts)
      .where(eq(inventoryCounts.tenantId, tenantId));
    const nextNumber = `INV-${String(Number(countResult[0].count) + 1).padStart(5, '0')}`;

    const [inventory] = await this.db
      .insert(inventoryCounts)
      .values({
        tenantId,
        warehouseId: data.warehouseId,
        number: nextNumber,
        status: 'draft',
        notes: data.notes || null,
        createdBy: userId || null,
      })
      .returning();

    return inventory as unknown as InventoryCount;
  }

  /**
   * Atualiza o status do inventário.
   * Quando aprovado, gera movimentações de ajuste automaticamente.
   */
  async updateStatus(
    id: string,
    tenantId: string,
    status: string,
    userId?: string
  ): Promise<InventoryCount | null> {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;

    // Validar transições de status
    const validTransitions: Record<string, string[]> = {
      draft: ['counting'],
      counting: ['review', 'cancelled'],
      review: ['approved', 'counting', 'cancelled'],
      approved: [],
      cancelled: [],
    };

    if (!validTransitions[existing.status]?.includes(status)) {
      throw new Error(
        `Transição inválida: ${existing.status} → ${status}. Permitidas: ${validTransitions[existing.status]?.join(', ')}`
      );
    }

    const updates: Record<string, any> = { status };

    if (status === 'counting') {
      updates.startedAt = new Date();
    }

    if (status === 'review') {
      updates.completedAt = new Date();
      // Calcular diferenças: preencher systemQty e difference para cada item
      await this.calculateDifferences(id, tenantId, existing.warehouseId);
    }

    if (status === 'approved') {
      updates.approvedBy = userId || null;
      // Gerar movimentações de ajuste para itens com diferença
      await this.generateAdjustments(id, tenantId, existing.warehouseId, userId);
    }

    const [updated] = await this.db
      .update(inventoryCounts)
      .set(updates)
      .where(and(eq(inventoryCounts.id, id), eq(inventoryCounts.tenantId, tenantId)))
      .returning();

    return updated as unknown as InventoryCount;
  }

  /**
   * Adiciona um item contado ao inventário (contagem CEGA — sem ver saldo do sistema).
   */
  async addCountItem(inventoryCountId: string, data: CountItemDTO): Promise<void> {
    // Verificar se já existe contagem para este produto
    const existing = await this.db
      .select()
      .from(inventoryCountItems)
      .where(
        and(
          eq(inventoryCountItems.inventoryCountId, inventoryCountId),
          eq(inventoryCountItems.productId, data.productId)
        )
      )
      .limit(1);

    if (existing[0]) {
      // Atualizar contagem existente
      await this.db
        .update(inventoryCountItems)
        .set({
          countedQty: data.countedQty.toString(),
          notes: data.notes || null,
          countedAt: new Date(),
        })
        .where(eq(inventoryCountItems.id, existing[0].id));
    } else {
      // Inserir nova contagem (systemQty será preenchido na revisão)
      await this.db.insert(inventoryCountItems).values({
        inventoryCountId,
        productId: data.productId,
        countedQty: data.countedQty.toString(),
        notes: data.notes || null,
        countedAt: new Date(),
      });
    }
  }

  /**
   * Calcula as diferenças entre contagem e sistema (ao entrar em revisão).
   */
  private async calculateDifferences(
    inventoryCountId: string,
    tenantId: string,
    warehouseId: string
  ): Promise<void> {
    const items = await this.db
      .select()
      .from(inventoryCountItems)
      .where(eq(inventoryCountItems.inventoryCountId, inventoryCountId));

    for (const item of items) {
      // Buscar saldo do sistema
      const levels = await this.db
        .select()
        .from(stockLevels)
        .where(
          and(
            eq(stockLevels.tenantId, tenantId),
            eq(stockLevels.productId, item.productId),
            eq(stockLevels.warehouseId, warehouseId)
          )
        )
        .limit(1);

      const systemQty = levels[0] ? Number(levels[0].quantity) : 0;
      const countedQty = Number(item.countedQty || 0);
      const difference = countedQty - systemQty;

      await this.db
        .update(inventoryCountItems)
        .set({
          systemQty: systemQty.toString(),
          difference: difference.toString(),
        })
        .where(eq(inventoryCountItems.id, item.id));
    }
  }

  /**
   * Gera movimentações de ajuste para itens com diferença (ao aprovar).
   */
  private async generateAdjustments(
    inventoryCountId: string,
    tenantId: string,
    warehouseId: string,
    userId?: string
  ): Promise<void> {
    const items = await this.db
      .select()
      .from(inventoryCountItems)
      .where(eq(inventoryCountItems.inventoryCountId, inventoryCountId));

    for (const item of items) {
      const difference = Number(item.difference || 0);
      if (difference === 0) continue;

      // Criar movimentação de ajuste
      await this.db.insert(stockMovements).values({
        tenantId,
        productId: item.productId,
        warehouseId,
        type: 'adjustment',
        quantity: Math.abs(difference).toString(),
        referenceType: 'inventory_count',
        referenceId: inventoryCountId,
        reason: `Ajuste de inventário ${difference > 0 ? '(sobra)' : '(falta)'}`,
        notes: item.notes,
        createdBy: userId || null,
      });

      // Atualizar saldo
      const levels = await this.db
        .select()
        .from(stockLevels)
        .where(
          and(
            eq(stockLevels.tenantId, tenantId),
            eq(stockLevels.productId, item.productId),
            eq(stockLevels.warehouseId, warehouseId)
          )
        )
        .limit(1);

      if (levels[0]) {
        const newQty = Number(levels[0].quantity) + difference;
        await this.db
          .update(stockLevels)
          .set({ quantity: Math.max(0, newQty).toString() })
          .where(eq(stockLevels.id, levels[0].id));
      } else if (difference > 0) {
        await this.db.insert(stockLevels).values({
          tenantId,
          productId: item.productId,
          warehouseId,
          quantity: difference.toString(),
          reservedQty: '0',
          averageCost: '0',
        });
      }
    }
  }
}
