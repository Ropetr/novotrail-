import { eq, and } from 'drizzle-orm';
import type { IChartOfAccountsRepository } from '../../domain/repositories';
import type { ChartOfAccount, CreateChartOfAccountDTO, UpdateChartOfAccountDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { chartOfAccounts } from '../schema';

export class ChartOfAccountsRepository implements IChartOfAccountsRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string): Promise<ChartOfAccount[]> {
    const result = await this.db.select().from(chartOfAccounts)
      .where(eq(chartOfAccounts.tenantId, tenantId))
      .orderBy(chartOfAccounts.code);
    return result as unknown as ChartOfAccount[];
  }

  async getById(id: string, tenantId: string): Promise<ChartOfAccount | null> {
    const result = await this.db.select().from(chartOfAccounts)
      .where(and(eq(chartOfAccounts.id, id), eq(chartOfAccounts.tenantId, tenantId)))
      .limit(1);
    return (result[0] as unknown as ChartOfAccount) || null;
  }

  async create(tenantId: string, data: CreateChartOfAccountDTO): Promise<ChartOfAccount> {
    const result = await this.db.insert(chartOfAccounts).values({
      tenantId,
      code: data.code,
      name: data.name,
      type: data.type,
      parentId: data.parentId || null,
      isAnalytical: data.isAnalytical ?? true,
    }).returning();
    return result[0] as unknown as ChartOfAccount;
  }

  async update(id: string, tenantId: string, data: UpdateChartOfAccountDTO): Promise<ChartOfAccount | null> {
    const updates: Record<string, any> = {};
    if (data.code !== undefined) updates.code = data.code;
    if (data.name !== undefined) updates.name = data.name;
    if (data.type !== undefined) updates.type = data.type;
    if (data.parentId !== undefined) updates.parentId = data.parentId;
    if (data.isAnalytical !== undefined) updates.isAnalytical = data.isAnalytical;

    if (Object.keys(updates).length === 0) return this.getById(id, tenantId);

    const result = await this.db.update(chartOfAccounts).set(updates)
      .where(and(eq(chartOfAccounts.id, id), eq(chartOfAccounts.tenantId, tenantId)))
      .returning();
    return (result[0] as unknown as ChartOfAccount) || null;
  }

  async remove(id: string, tenantId: string): Promise<boolean> {
    const result = await this.db.delete(chartOfAccounts)
      .where(and(eq(chartOfAccounts.id, id), eq(chartOfAccounts.tenantId, tenantId)))
      .returning();
    return result.length > 0;
  }
}
