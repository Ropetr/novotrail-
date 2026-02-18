import { eq, and, like, sql } from 'drizzle-orm';
import type { ICategoryRepository, ListResult } from '../../domain/repositories';
import type { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import type { PaginationInput } from '@erp/shared';
import { categories } from '../schema';

export class CategoryRepository implements ICategoryRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput): Promise<ListResult<Category>> {
    const { page, limit, search } = params;
    const offset = (page - 1) * limit;

    const baseWhere = eq(categories.tenantId, tenantId);

    const whereClause = search
      ? and(baseWhere, like(categories.name, `%${search}%`))
      : baseWhere;

    const [data, countResult] = await Promise.all([
      this.db.select().from(categories).where(whereClause).limit(limit).offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(categories)
        .where(whereClause),
    ]);

    return {
      data: data as Category[],
      total: Number(countResult[0].count),
    };
  }

  async getById(id: string, tenantId: string): Promise<Category | null> {
    const result = await this.db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)))
      .limit(1);

    return (result[0] as Category) || null;
  }

  async create(tenantId: string, data: CreateCategoryDTO): Promise<Category> {
    const newRecord = {
      id: crypto.randomUUID(),
      tenantId,
      name: data.name,
      parentId: data.parentId ?? null,
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(categories).values(newRecord);

    return newRecord as Category;
  }

  async update(id: string, tenantId: string, data: UpdateCategoryDTO): Promise<Category> {
    await this.db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)));

    const updated = await this.getById(id, tenantId);
    if (!updated) throw new Error('Category not found after update');

    return updated;
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    await this.db
      .update(categories)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)));
  }
}
