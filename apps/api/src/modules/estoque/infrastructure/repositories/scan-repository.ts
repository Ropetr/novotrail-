import { eq, and, sql } from 'drizzle-orm';
import type { IScanRepository } from '../../domain/repositories';
import type { InventoryScan, CreateScanDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { inventoryScans } from '../schema';
import { products } from '../../../produtos/infrastructure/schema';

export class ScanRepository implements IScanRepository {
  constructor(private db: DatabaseConnection) {}

  async listByInventory(inventoryCountId: string, tenantId: string): Promise<InventoryScan[]> {
    const rows = await this.db.select()
      .from(inventoryScans)
      .where(and(
        eq(inventoryScans.inventoryCountId, inventoryCountId),
        eq(inventoryScans.tenantId, tenantId)
      ))
      .orderBy(inventoryScans.scannedAt);
    return rows as unknown as InventoryScan[];
  }

  async create(tenantId: string, userId: string, inventoryCountId: string, data: CreateScanDTO): Promise<InventoryScan> {
    let productId = data.productId;

    // If barcode provided, find product
    if (data.barcode && !productId) {
      const found = await this.db.select({ id: products.id })
        .from(products)
        .where(and(
          eq(products.barcode, data.barcode),
          eq(products.tenantId, tenantId)
        ))
        .limit(1);
      if (!found[0]) throw new Error(`Product not found for barcode: ${data.barcode}`);
      productId = found[0].id;
    }

    if (!productId) throw new Error('Either productId or barcode is required');

    const [row] = await this.db.insert(inventoryScans).values({
      tenantId,
      inventoryCountId,
      productId,
      barcode: data.barcode,
      quantity: String(data.quantity || 1),
      userId,
    }).returning();

    return row as unknown as InventoryScan;
  }
}
