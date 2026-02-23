import { eq, and, or, like, sql } from 'drizzle-orm';
import type { IPartnerRepository, ListResult } from '../../domain/repositories';
import type { Partner, CreatePartnerDTO, UpdatePartnerDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import type { PaginationInput } from '@trailsystem/types';
import { partners } from '../schema';

export class PartnerRepository implements IPartnerRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput): Promise<ListResult<Partner>> {
    const { page, limit, search } = params;
    const offset = (page - 1) * limit;

    const baseWhere = eq(partners.tenantId, tenantId);

    const whereClause = search
      ? and(
          baseWhere,
          or(
            like(partners.name, `%${search}%`),
            like(partners.code, `%${search}%`),
            like(partners.document, `%${search}%`),
            like(partners.email, `%${search}%`)
          )
        )
      : baseWhere;

    const [data, countResult] = await Promise.all([
      this.db.select().from(partners).where(whereClause).limit(limit).offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(partners)
        .where(whereClause),
    ]);

    return {
      data: data as Partner[],
      total: Number(countResult[0].count),
    };
  }

  async getById(id: string, tenantId: string): Promise<Partner | null> {
    const result = await this.db
      .select()
      .from(partners)
      .where(and(eq(partners.id, id), eq(partners.tenantId, tenantId)))
      .limit(1);

    return (result[0] as Partner) || null;
  }

  async create(tenantId: string, data: CreatePartnerDTO): Promise<Partner> {
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(partners)
      .where(eq(partners.tenantId, tenantId));

    const code = data.code || `PAR-${String(Number(countResult[0].count) + 1).padStart(3, '0')}`;

    const newRecord = {
      id: crypto.randomUUID(),
      tenantId,
      code,
      name: data.name,
      tradeName: data.tradeName ?? null,
      type: data.type,
      document: data.document,
      email: data.email,
      phone: data.phone,
      cellphone: data.cellphone ?? null,
      city: data.city,
      state: data.state,
      status: 'active' as const,
      commissionRate: data.commissionRate ?? null,
      notes: data.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(partners).values(newRecord);

    return newRecord as Partner;
  }

  async update(id: string, tenantId: string, data: UpdatePartnerDTO): Promise<Partner> {
    await this.db
      .update(partners)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(partners.id, id), eq(partners.tenantId, tenantId)));

    const updated = await this.getById(id, tenantId);
    if (!updated) throw new Error('Partner not found after update');

    return updated;
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    await this.db
      .update(partners)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(and(eq(partners.id, id), eq(partners.tenantId, tenantId)));
  }
}
