import { eq, and, or, like, sql } from 'drizzle-orm';
import type { IProductRepository, ListResult } from '../../domain/repositories';
import type { Product, CreateProductDTO, UpdateProductDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import type { PaginationInput } from '@erp/shared';
import { products } from '../schema';

export class ProductRepository implements IProductRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput): Promise<ListResult<Product>> {
    const { page, limit, search } = params;
    const offset = (page - 1) * limit;

    const baseWhere = eq(products.tenantId, tenantId);

    const whereClause = search
      ? and(
          baseWhere,
          or(
            like(products.name, `%${search}%`),
            like(products.code, `%${search}%`),
            like(products.sku, `%${search}%`),
            like(products.barcode, `%${search}%`)
          )
        )
      : baseWhere;

    const [data, countResult] = await Promise.all([
      this.db.select().from(products).where(whereClause).limit(limit).offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause),
    ]);

    return {
      data: data as Product[],
      total: Number(countResult[0].count),
    };
  }

  async getById(id: string, tenantId: string): Promise<Product | null> {
    const result = await this.db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .limit(1);

    return (result[0] as Product) || null;
  }

  async create(tenantId: string, data: CreateProductDTO): Promise<Product> {
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.tenantId, tenantId));

    const code = data.code || `PRD-${String(Number(countResult[0].count) + 1).padStart(3, '0')}`;

    const newRecord = {
      id: crypto.randomUUID(),
      tenantId,
      code,
      name: data.name,
      description: data.description ?? null,
      categoryId: data.categoryId ?? null,
      sku: data.sku ?? null,
      barcode: data.barcode ?? null,
      unit: data.unit,
      costPrice: data.costPrice,
      salePrice: data.salePrice,
      status: 'active' as const,
      minStock: data.minStock ?? 0,
      currentStock: 0,
      notes: data.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(products).values(newRecord);

    return newRecord as Product;
  }

  async update(id: string, tenantId: string, data: UpdateProductDTO): Promise<Product> {
    await this.db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)));

    const updated = await this.getById(id, tenantId);
    if (!updated) throw new Error('Product not found after update');

    return updated;
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    await this.db
      .update(products)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)));
  }
}
