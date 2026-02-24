import type { TenantSettings, UpdateTenantSettingsDTO } from './entities';

export interface ITenantSettingsRepository {
  getByTenantId(tenantId: string): Promise<TenantSettings | null>;
  upsert(tenantId: string, data: UpdateTenantSettingsDTO): Promise<TenantSettings>;
  updateLogoUrl(tenantId: string, field: 'logoUrl' | 'logoFiscalUrl', url: string | null): Promise<void>;
}
