import { eq, and, or, like, sql } from 'drizzle-orm';
import type { ISupplierRepository, ListResult } from '../../domain/repositories';
import type { Supplier, CreateSupplierDTO, UpdateSupplierDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import type { PaginationInput } from '@trailsystem/types';
import { suppliers } from '../schema';

export class SupplierRepository implements ISupplierRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput): Promise<ListResult<Supplier>> {
    const { page, limit, search } = params;
    const offset = (page - 1) * limit;

    const baseWhere = eq(suppliers.tenantId, tenantId);

    const whereClause = search
      ? and(
          baseWhere,
          or(
            like(suppliers.name, `%${search}%`),
            like(suppliers.code, `%${search}%`),
            like(suppliers.document, `%${search}%`),
            like(suppliers.email, `%${search}%`)
          )
        )
      : baseWhere;

    const [data, countResult] = await Promise.all([
      this.db.select().from(suppliers).where(whereClause).limit(limit).offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(suppliers)
        .where(whereClause),
    ]);

    return {
      data: data as Supplier[],
      total: Number(countResult[0].count),
    };
  }

  async getById(id: string, tenantId: string): Promise<Supplier | null> {
    const result = await this.db
      .select()
      .from(suppliers)
      .where(and(eq(suppliers.id, id), eq(suppliers.tenantId, tenantId)))
      .limit(1);

    return (result[0] as Supplier) || null;
  }

  async create(tenantId: string, data: CreateSupplierDTO): Promise<Supplier> {
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(suppliers)
      .where(eq(suppliers.tenantId, tenantId));

    const code = data.code || `FOR-${String(Number(countResult[0].count) + 1).padStart(3, '0')}`;

    const newRecord = {
      id: crypto.randomUUID(),
      tenantId,
      code,
      name: data.name,
      tradeName: data.tradeName ?? null,
      type: data.type,
      document: data.document,
      stateRegistration: data.stateRegistration ?? null,
      email: data.email,
      phone: data.phone,
      cellphone: data.cellphone ?? null,
      zipCode: data.zipCode ?? null,
      address: data.address ?? null,
      number: data.number ?? null,
      complement: data.complement ?? null,
      neighborhood: data.neighborhood ?? null,
      city: data.city,
      state: data.state,
      status: 'active' as const,
      paymentTerms: data.paymentTerms ?? null,
      notes: data.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(suppliers).values(newRecord);

    return newRecord as Supplier;
  }

  async update(id: string, tenantId: string, data: UpdateSupplierDTO): Promise<Supplier> {
    await this.db
      .update(suppliers)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(suppliers.id, id), eq(suppliers.tenantId, tenantId)));

    const updated = await this.getById(id, tenantId);
    if (!updated) throw new Error('Supplier not found after update');

    return updated;
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    await this.db
      .update(suppliers)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(and(eq(suppliers.id, id), eq(suppliers.tenantId, tenantId)));
  }
}
