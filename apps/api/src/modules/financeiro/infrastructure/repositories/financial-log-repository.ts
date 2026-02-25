import { eq, and, sql, gte, lte, desc } from 'drizzle-orm';
import type { IFinancialLogRepository } from '../../domain/repositories';
import type { FinancialLog, LogAction } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { financialLogs } from '../schema';

export class FinancialLogRepository implements IFinancialLogRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, filters?: {
    entity?: string; entityId?: string; action?: string; userId?: string;
    startDate?: string; endDate?: string;
    page?: number; limit?: number;
  }): Promise<{ data: FinancialLog[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(financialLogs.tenantId, tenantId)];
    if (filters?.entity) conditions.push(eq(financialLogs.entity, filters.entity));
    if (filters?.entityId) conditions.push(eq(financialLogs.entityId, filters.entityId));
    if (filters?.action) conditions.push(eq(financialLogs.action, filters.action));
    if (filters?.userId) conditions.push(eq(financialLogs.userId, filters.userId));
    if (filters?.startDate) conditions.push(gte(financialLogs.createdAt, new Date(filters.startDate)));
    if (filters?.endDate) conditions.push(lte(financialLogs.createdAt, new Date(filters.endDate)));

    const whereClause = and(...conditions);

    const [data, countResult] = await Promise.all([
      this.db.select().from(financialLogs)
        .where(whereClause)
        .orderBy(desc(financialLogs.createdAt))
        .limit(limit).offset(offset),
      this.db.select({ count: sql<string>`count(*)` }).from(financialLogs)
        .where(whereClause),
    ]);

    return {
      data: data as unknown as FinancialLog[],
      total: Number(countResult[0]?.count || 0),
    };
  }

  async create(tenantId: string, userId: string, entity: string, entityId: string, action: LogAction, details?: string): Promise<FinancialLog> {
    const result = await this.db.insert(financialLogs).values({
      tenantId,
      entity,
      entityId,
      action,
      userId,
      details: details || null,
    }).returning();
    return result[0] as unknown as FinancialLog;
  }
}
