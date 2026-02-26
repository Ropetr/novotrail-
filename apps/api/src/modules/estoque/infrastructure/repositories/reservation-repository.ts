import { eq, and, sql, desc } from 'drizzle-orm';
import type { IReservationRepository, ListResult, PaginationInput } from '../../domain/repositories';
import type { StockReservation, CreateReservationDTO, ReservationStatus } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { stockReservations, stockLevels, warehouses } from '../schema';
import { products } from '../../../produtos/infrastructure/schema';

export class ReservationRepository implements IReservationRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput & { productId?: string; status?: string; orderId?: string }): Promise<ListResult<StockReservation>> {
    const { page, limit, productId, status, orderId } = params;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(stockReservations.tenantId, tenantId)];
    if (productId) conditions.push(eq(stockReservations.productId, productId));
    if (status) conditions.push(eq(stockReservations.status, status as any));
    if (orderId) conditions.push(eq(stockReservations.orderId, orderId));
    const whereClause = and(...conditions);

    const [data, countResult] = await Promise.all([
      this.db.select({
        id: stockReservations.id,
        tenantId: stockReservations.tenantId,
        orderId: stockReservations.orderId,
        orderType: stockReservations.orderType,
        productId: stockReservations.productId,
        warehouseId: stockReservations.warehouseId,
        quantity: stockReservations.quantity,
        status: stockReservations.status,
        expiresAt: stockReservations.expiresAt,
        userId: stockReservations.userId,
        createdAt: stockReservations.createdAt,
        updatedAt: stockReservations.updatedAt,
        productName: products.name,
        warehouseName: warehouses.name,
      })
        .from(stockReservations)
        .innerJoin(products, eq(stockReservations.productId, products.id))
        .innerJoin(warehouses, eq(stockReservations.warehouseId, warehouses.id))
        .where(whereClause)
        .orderBy(desc(stockReservations.createdAt))
        .limit(limit)
        .offset(offset),
      this.db.select({ count: sql<number>`count(*)` }).from(stockReservations).where(whereClause),
    ]);

    return { data: data as unknown as StockReservation[], total: Number(countResult[0].count) };
  }

  async getById(id: string, tenantId: string): Promise<StockReservation | null> {
    const rows = await this.db.select()
      .from(stockReservations)
      .where(and(eq(stockReservations.id, id), eq(stockReservations.tenantId, tenantId)))
      .limit(1);
    return (rows[0] as unknown as StockReservation) || null;
  }

  async create(tenantId: string, userId: string, data: CreateReservationDTO): Promise<StockReservation> {
    // Update stock_levels: increase reserved, decrease available
    await this.db.execute(sql`
      UPDATE stock_levels
      SET reserved_quantity = reserved_quantity + ${data.quantity},
          available_quantity = available_quantity - ${data.quantity},
          updated_at = NOW()
      WHERE product_id = ${data.productId}
        AND warehouse_id = ${data.warehouseId}
        AND tenant_id = ${tenantId}
    `);

    const [row] = await this.db.insert(stockReservations).values({
      tenantId,
      orderId: data.orderId,
      orderType: data.orderType,
      productId: data.productId,
      warehouseId: data.warehouseId,
      quantity: String(data.quantity),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      userId,
    }).returning();

    return row as unknown as StockReservation;
  }

  async updateStatus(id: string, tenantId: string, status: ReservationStatus): Promise<StockReservation> {
    const reservation = await this.getById(id, tenantId);
    if (!reservation) throw new Error('Reservation not found');

    // Only release/cancel revert the reserved quantity
    if (status === 'released' || status === 'cancelled' || status === 'expired') {
      const qty = Number(reservation.quantity);
      await this.db.execute(sql`
        UPDATE stock_levels
        SET reserved_quantity = reserved_quantity - ${qty},
            available_quantity = available_quantity + ${qty},
            updated_at = NOW()
        WHERE product_id = ${reservation.productId}
          AND warehouse_id = ${reservation.warehouseId}
          AND tenant_id = ${tenantId}
      `);
    }

    // consumed: reserved stays consumed (stock_movement will reduce quantity)
    if (status === 'consumed') {
      const qty = Number(reservation.quantity);
      await this.db.execute(sql`
        UPDATE stock_levels
        SET reserved_quantity = reserved_quantity - ${qty},
            updated_at = NOW()
        WHERE product_id = ${reservation.productId}
          AND warehouse_id = ${reservation.warehouseId}
          AND tenant_id = ${tenantId}
      `);
    }

    await this.db.update(stockReservations)
      .set({ status })
      .where(and(eq(stockReservations.id, id), eq(stockReservations.tenantId, tenantId)));

    return this.getById(id, tenantId) as Promise<StockReservation>;
  }

  async getByOrder(orderId: string, tenantId: string): Promise<StockReservation[]> {
    const rows = await this.db.select()
      .from(stockReservations)
      .where(and(
        eq(stockReservations.orderId, orderId),
        eq(stockReservations.tenantId, tenantId),
        eq(stockReservations.status, 'reserved')
      ));
    return rows as unknown as StockReservation[];
  }
}
