import { eq } from 'drizzle-orm';
import type { IFiscalConfigRepository } from '../../domain/repositories';
import type { FiscalConfig, UpdateFiscalConfigDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { fiscalConfig } from '../schema';

export class FiscalConfigRepository implements IFiscalConfigRepository {
  constructor(private db: DatabaseConnection) {}

  async getByTenantId(tenantId: string): Promise<FiscalConfig | null> {
    const result = await this.db
      .select()
      .from(fiscalConfig)
      .where(eq(fiscalConfig.tenantId, tenantId))
      .limit(1);

    return (result[0] as unknown as FiscalConfig) || null;
  }

  async upsert(tenantId: string, data: UpdateFiscalConfigDTO): Promise<FiscalConfig> {
    const existing = await this.getByTenantId(tenantId);

    if (existing) {
      await this.db
        .update(fiscalConfig)
        .set({ ...data, updatedAt: new Date() } as any)
        .where(eq(fiscalConfig.tenantId, tenantId));

      const updated = await this.getByTenantId(tenantId);
      if (!updated) throw new Error('Fiscal config not found after update');
      return updated;
    } else {
      const newRecord = {
        id: crypto.randomUUID(),
        tenantId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.db.insert(fiscalConfig).values(newRecord as any);
      return newRecord as unknown as FiscalConfig;
    }
  }
}
