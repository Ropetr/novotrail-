import { eq, and, or, like, sql } from 'drizzle-orm';
import type { IClientRepository, ListResult } from '../../domain/repositories';
import type { Client, CreateClientDTO, UpdateClientDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import type { PaginationInput } from '@trailsystem/types';
import { clients } from '../schema';

export class ClientRepository implements IClientRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput): Promise<ListResult<Client>> {
    const { page, limit, search } = params;
    const offset = (page - 1) * limit;

    const baseWhere = eq(clients.tenantId, tenantId);

    const whereClause = search
      ? and(
          baseWhere,
          or(
            like(clients.name, `%${search}%`),
            like(clients.code, `%${search}%`),
            like(clients.document, `%${search}%`),
            like(clients.email, `%${search}%`)
          )
        )
      : baseWhere;

    const [data, countResult] = await Promise.all([
      this.db.select().from(clients).where(whereClause).limit(limit).offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(clients)
        .where(whereClause),
    ]);

    return {
      data: data as Client[],
      total: Number(countResult[0].count),
    };
  }

  async getById(id: string, tenantId: string): Promise<Client | null> {
    const result = await this.db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.tenantId, tenantId)))
      .limit(1);

    return (result[0] as Client) || null;
  }

  async create(tenantId: string, data: CreateClientDTO): Promise<Client> {
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(clients)
      .where(eq(clients.tenantId, tenantId));

    const code = data.code || `CLI-${String(Number(countResult[0].count) + 1).padStart(3, '0')}`;

    const newRecord = {
      id: crypto.randomUUID(),
      tenantId,
      code,
      name: data.name,
      tradeName: data.tradeName ?? null,
      type: data.type,
      document: data.document,
      rg: data.rg ?? null,
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
      creditLimit: data.creditLimit ?? 0,
      balance: 0,
      lastPurchase: null,
      notes: data.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(clients).values(newRecord);

    return newRecord as unknown as Client;
  }

  async update(id: string, tenantId: string, data: UpdateClientDTO): Promise<Client> {
    await this.db
      .update(clients)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(clients.id, id), eq(clients.tenantId, tenantId)));

    const updated = await this.getById(id, tenantId);
    if (!updated) throw new Error('Client not found after update');

    return updated;
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    await this.db
      .update(clients)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(and(eq(clients.id, id), eq(clients.tenantId, tenantId)));
  }
}
