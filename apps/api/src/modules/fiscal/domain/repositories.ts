import type { FiscalConfig, UpdateFiscalConfigDTO, ProductTaxRule, CreateProductTaxRuleDTO, UpdateProductTaxRuleDTO } from './entities';

export interface IFiscalConfigRepository {
  getByTenantId(tenantId: string): Promise<FiscalConfig | null>;
  upsert(tenantId: string, data: UpdateFiscalConfigDTO): Promise<FiscalConfig>;
}

export interface IProductTaxRulesRepository {
  getByProductId(tenantId: string, productId: string): Promise<ProductTaxRule[]>;
  getById(tenantId: string, id: string): Promise<ProductTaxRule | null>;
  create(tenantId: string, data: CreateProductTaxRuleDTO): Promise<ProductTaxRule>;
  update(tenantId: string, id: string, data: UpdateProductTaxRuleDTO): Promise<ProductTaxRule>;
  delete(tenantId: string, id: string): Promise<void>;
  deleteAllForProduct(tenantId: string, productId: string): Promise<void>;
  countByTenant(tenantId: string): Promise<number>;
}

export interface IFiscalAuditLogRepository {
  log(tenantId: string, userId: string | null, action: string, entityType?: string, entityId?: string, details?: any, ipAddress?: string): Promise<void>;
}
