import { eq, and, sql } from 'drizzle-orm';
import type { IKitRepository } from '../../domain/repositories';
import type { ProductKit, CreateKitDTO, UpdateKitDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { productKits } from '../schema';
import { products } from '../../../produtos/infrastructure/schema';

export class KitRepository implements IKitRepository {
  constructor(private db: DatabaseConnection) {}

  async listKits(tenantId: string): Promise<Array<{ kitProductId: string; kitName: string; kitCode: string; components: ProductKit[] }>> {
    // Get all kit product IDs
    const kitsRaw = await this.db
      .select({
        kitProductId: productKits.kitProductId,
        kitName: products.name,
        kitCode: products.code,
      })
      .from(productKits)
      .innerJoin(products, eq(productKits.kitProductId, products.id))
      .where(eq(productKits.tenantId, tenantId))
      .groupBy(productKits.kitProductId, products.name, products.code);

    const result = [];
    for (const kit of kitsRaw) {
      const components = await this.getComponents(kit.kitProductId, tenantId);
      result.push({ ...kit, components });
    }
    return result;
  }

  async getKit(kitProductId: string, tenantId: string) {
    const components = await this.getComponents(kitProductId, tenantId);
    if (components.length === 0) return null;

    const product = await this.db.select({ name: products.name, code: products.code })
      .from(products)
      .where(eq(products.id, kitProductId))
      .limit(1);

    return {
      kitProductId,
      kitName: product[0]?.name || '',
      components,
    };
  }

  async getComponents(kitProductId: string, tenantId: string): Promise<ProductKit[]> {
    const rows = await this.db
      .select({
        id: productKits.id,
        tenantId: productKits.tenantId,
        kitProductId: productKits.kitProductId,
        componentProductId: productKits.componentProductId,
        quantity: productKits.quantity,
        createdAt: productKits.createdAt,
        componentName: products.name,
        componentCode: products.code,
        componentUnit: products.unit,
      })
      .from(productKits)
      .innerJoin(products, eq(productKits.componentProductId, products.id))
      .where(and(
        eq(productKits.kitProductId, kitProductId),
        eq(productKits.tenantId, tenantId)
      ));

    return rows as unknown as ProductKit[];
  }

  async createKit(tenantId: string, data: CreateKitDTO): Promise<ProductKit[]> {
    // Delete existing components if any
    await this.db.delete(productKits).where(and(
      eq(productKits.kitProductId, data.kitProductId),
      eq(productKits.tenantId, tenantId)
    ));

    // Insert new components
    const inserts = data.components.map(c => ({
      tenantId,
      kitProductId: data.kitProductId,
      componentProductId: c.componentProductId,
      quantity: String(c.quantity),
    }));

    await this.db.insert(productKits).values(inserts);

    // Mark product as kit
    await this.db.execute(
      sql`UPDATE products SET is_kit = true WHERE id = ${data.kitProductId} AND tenant_id = ${tenantId}`
    );

    return this.getComponents(data.kitProductId, tenantId);
  }

  async updateKit(kitProductId: string, tenantId: string, data: UpdateKitDTO): Promise<ProductKit[]> {
    return this.createKit(tenantId, { kitProductId, components: data.components });
  }

  async deleteKit(kitProductId: string, tenantId: string): Promise<void> {
    await this.db.delete(productKits).where(and(
      eq(productKits.kitProductId, kitProductId),
      eq(productKits.tenantId, tenantId)
    ));
    await this.db.execute(
      sql`UPDATE products SET is_kit = false WHERE id = ${kitProductId} AND tenant_id = ${tenantId}`
    );
  }
}
