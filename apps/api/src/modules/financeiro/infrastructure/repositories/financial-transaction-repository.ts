import { eq, and, sql, gte, lte, desc } from 'drizzle-orm';
import type { IFinancialTransactionRepository } from '../../domain/repositories';
import type { FinancialTransaction, CreateTransactionDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { financialTransactions } from '../schema';

export class FinancialTransactionRepository implements IFinancialTransactionRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, filters?: {
    bankAccountId?: string; type?: string;
    startDate?: string; endDate?: string;
    page?: number; limit?: number;
  }): Promise<{ data: FinancialTransaction[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(financialTransactions.tenantId, tenantId)];
    if (filters?.bankAccountId) conditions.push(eq(financialTransactions.bankAccountId, filters.bankAccountId));
    if (filters?.type) conditions.push(eq(financialTransactions.type, filters.type));
    if (filters?.startDate) conditions.push(gte(financialTransactions.occurredAt, new Date(filters.startDate)));
    if (filters?.endDate) conditions.push(lte(financialTransactions.occurredAt, new Date(filters.endDate)));

    const whereClause = and(...conditions);

    const [data, countResult] = await Promise.all([
      this.db.select().from(financialTransactions)
        .where(whereClause)
        .orderBy(desc(financialTransactions.occurredAt))
        .limit(limit).offset(offset),
      this.db.select({ count: sql<string>`count(*)` }).from(financialTransactions)
        .where(whereClause),
    ]);

    return {
      data: data as unknown as FinancialTransaction[],
      total: Number(countResult[0]?.count || 0),
    };
  }

  async create(tenantId: string, data: CreateTransactionDTO): Promise<FinancialTransaction> {
    const result = await this.db.insert(financialTransactions).values({
      tenantId,
      bankAccountId: data.bankAccountId,
      type: data.type,
      value: String(data.value),
      description: data.description || null,
      referenceId: data.referenceId || null,
      referenceType: data.referenceType || null,
      occurredAt: data.occurredAt ? new Date(data.occurredAt) : new Date(),
    }).returning();
    return result[0] as unknown as FinancialTransaction;
  }
}
