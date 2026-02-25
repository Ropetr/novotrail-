import { eq, and, sql, gte, lte, desc } from 'drizzle-orm';
import type { IStockMovementRepository, ListResult, PaginationInput } from '../../domain/repositories';
import type { StockMovement, CreateMovementDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { stockMovements, stockLevels } from '../schema';

export class StockMovementRepository implements IStockMovementRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput & {
    warehouseId?: string;
    productId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ListResult<StockMovement>> {
    const { page, limit, warehouseId, productId, type, startDate, endDate } = params;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(stockMovements.tenantId, tenantId)];
    if (warehouseId) conditions.push(eq(stockMovements.warehouseId, warehouseId));
    if (productId) conditions.push(eq(stockMovements.productId, productId));
    if (type) conditions.push(eq(stockMovements.type, type as any));
    if (startDate) conditions.push(gte(stockMovements.createdAt, new Date(startDate)));
    if (endDate) conditions.push(lte(stockMovements.createdAt, new Date(endDate)));

    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

    const [data, countResult] = await Promise.all([
      this.db.select().from(stockMovements)
        .where(whereClause)
        .orderBy(desc(stockMovements.createdAt))
        .limit(limit).offset(offset),
      this.db.select({ count: sql<number>`count(*)` })
        .from(stockMovements).where(whereClause),
    ]);

    return { data: data as unknown as StockMovement[], total: Number(countResult[0].count) };
  }

  async getById(id: string, tenantId: string): Promise<StockMovement | null> {
    const result = await this.db.select().from(stockMovements)
      .where(and(eq(stockMovements.id, id), eq(stockMovements.tenantId, tenantId)))
      .limit(1);
    return (result[0] as unknown as StockMovement) || null;
  }

  async create(tenantId: string, userId: string, data: CreateMovementDTO): Promise<StockMovement> {
    // Determinar se é entrada ou saída
    const isEntry = ['purchase_entry', 'transfer_in', 'adjustment_in', 'return_in', 'production'].includes(data.type);

    // Buscar ou criar o saldo atual
    const existingLevel = await this.db.select().from(stockLevels)
      .where(and(
        eq(stockLevels.tenantId, tenantId),
        eq(stockLevels.productId, data.productId),
        eq(stockLevels.warehouseId, data.warehouseId),
      ))
      .limit(1);

    let level = existingLevel[0];
    if (!level) {
      const created = await this.db.insert(stockLevels).values({
        tenantId,
        productId: data.productId,
        warehouseId: data.warehouseId,
        quantity: '0',
        reservedQuantity: '0',
        availableQuantity: '0',
        averageCost: '0',
      }).returning();
      level = created[0];
    }

    const previousQuantity = Number(level.quantity);
    const previousAverageCost = Number(level.averageCost);
    const movementQty = data.quantity;
    const unitCost = data.unitCost ?? 0;
    const totalCost = movementQty * unitCost;

    let newQuantity: number;
    let newAverageCost: number;

    if (isEntry) {
      newQuantity = previousQuantity + movementQty;
      // Custo médio ponderado: (saldo × custo_atual + entrada × custo_entrada) / novo_saldo
      if (newQuantity > 0 && unitCost > 0) {
        newAverageCost = ((previousQuantity * previousAverageCost) + (movementQty * unitCost)) / newQuantity;
      } else {
        newAverageCost = previousAverageCost;
      }
    } else {
      newQuantity = previousQuantity - movementQty;
      // Saída não altera custo médio
      newAverageCost = previousAverageCost;
    }

    // Criar movimentação (imutável)
    const result = await this.db.insert(stockMovements).values({
      tenantId,
      warehouseId: data.warehouseId,
      productId: data.productId,
      type: data.type,
      quantity: String(movementQty),
      unitCost: String(unitCost),
      totalCost: String(totalCost),
      previousQuantity: String(previousQuantity),
      newQuantity: String(newQuantity),
      previousAverageCost: String(previousAverageCost),
      newAverageCost: String(newAverageCost),
      referenceType: data.referenceType ?? null,
      referenceId: data.referenceId ?? null,
      referenceNumber: data.referenceNumber ?? null,
      reason: data.reason ?? null,
      userId,
    }).returning();

    // Atualizar saldo
    const reserved = Number(level.reservedQuantity);
    await this.db.update(stockLevels).set({
      quantity: String(newQuantity),
      availableQuantity: String(newQuantity - reserved),
      averageCost: String(Number(newAverageCost.toFixed(2))),
      lastMovementAt: new Date(),
    }).where(eq(stockLevels.id, level.id));

    return result[0] as unknown as StockMovement;
  }
}
