import { eq, and, sql } from 'drizzle-orm';
import type { IProductTaxRulesRepository } from '../../domain/repositories';
import type { ProductTaxRule, CreateProductTaxRuleDTO, UpdateProductTaxRuleDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { productTaxRules } from '../../../produtos/infrastructure/schema';

export class ProductTaxRulesRepository implements IProductTaxRulesRepository {
  constructor(private db: DatabaseConnection) {}

  async getByProductId(tenantId: string, productId: string): Promise<ProductTaxRule[]> {
    const result = await this.db
      .select()
      .from(productTaxRules)
      .where(
        and(
          eq(productTaxRules.tenantId, tenantId),
          eq(productTaxRules.productId, productId)
        )
      );

    return result as unknown as ProductTaxRule[];
  }

  async getById(tenantId: string, id: string): Promise<ProductTaxRule | null> {
    const result = await this.db
      .select()
      .from(productTaxRules)
      .where(
        and(
          eq(productTaxRules.tenantId, tenantId),
          eq(productTaxRules.id, id)
        )
      )
      .limit(1);

    return (result[0] as unknown as ProductTaxRule) || null;
  }

  async create(tenantId: string, data: CreateProductTaxRuleDTO): Promise<ProductTaxRule> {
    const newRecord = {
      id: crypto.randomUUID(),
      tenantId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(productTaxRules).values(newRecord as any);
    return newRecord as unknown as ProductTaxRule;
  }

  async update(tenantId: string, id: string, data: UpdateProductTaxRuleDTO): Promise<ProductTaxRule> {
    await this.db
      .update(productTaxRules)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(
        and(
          eq(productTaxRules.tenantId, tenantId),
          eq(productTaxRules.id, id)
        )
      );

    const updated = await this.getById(tenantId, id);
    if (!updated) throw new Error('Tax rule not found after update');
    return updated;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db
      .delete(productTaxRules)
      .where(
        and(
          eq(productTaxRules.tenantId, tenantId),
          eq(productTaxRules.id, id)
        )
      );
  }

  async deleteAllForProduct(tenantId: string, productId: string): Promise<void> {
    await this.db
      .delete(productTaxRules)
      .where(
        and(
          eq(productTaxRules.tenantId, tenantId),
          eq(productTaxRules.productId, productId)
        )
      );
  }

  async countByTenant(tenantId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(productTaxRules)
      .where(eq(productTaxRules.tenantId, tenantId));

    return result[0]?.count || 0;
  }
}
