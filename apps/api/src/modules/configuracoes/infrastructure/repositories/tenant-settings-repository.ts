import { eq } from 'drizzle-orm';
import type { ITenantSettingsRepository } from '../../domain/repositories';
import type { TenantSettings, UpdateTenantSettingsDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { tenantSettings } from '../schema';

export class TenantSettingsRepository implements ITenantSettingsRepository {
  constructor(private db: DatabaseConnection) {}

  async getByTenantId(tenantId: string): Promise<TenantSettings | null> {
    const result = await this.db
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, tenantId))
      .limit(1);

    return (result[0] as unknown as TenantSettings) || null;
  }

  async upsert(tenantId: string, data: UpdateTenantSettingsDTO): Promise<TenantSettings> {
    // Verificar se já existe
    const existing = await this.getByTenantId(tenantId);

    if (existing) {
      // UPDATE
      await this.db
        .update(tenantSettings)
        .set({ ...data, updatedAt: new Date() } as any)
        .where(eq(tenantSettings.tenantId, tenantId));

      const updated = await this.getByTenantId(tenantId);
      if (!updated) throw new Error('Settings not found after update');
      return updated;
    } else {
      // INSERT
      const newRecord = {
        id: crypto.randomUUID(),
        tenantId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.db.insert(tenantSettings).values(newRecord as any);

      return newRecord as unknown as TenantSettings;
    }
  }

  async updateLogoUrl(
    tenantId: string,
    field: 'logoUrl' | 'logoFiscalUrl',
    url: string | null
  ): Promise<void> {
    const existing = await this.getByTenantId(tenantId);

    if (existing) {
      await this.db
        .update(tenantSettings)
        .set({ [field]: url, updatedAt: new Date() } as any)
        .where(eq(tenantSettings.tenantId, tenantId));
    } else {
      // Cria registro mínimo com a logo
      await this.db.insert(tenantSettings).values({
        id: crypto.randomUUID(),
        tenantId,
        [field]: url,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
    }
  }
}
