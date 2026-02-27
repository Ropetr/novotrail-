import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createDatabaseConnection } from '../../shared/database/connection';

// Routes
import { createNuvemFiscalRoutes, createFiscalConfigRoutes, createProductTaxRulesRoutes } from './presentation/http/routes';

// Repositories
import { FiscalConfigRepository } from './infrastructure/repositories/fiscal-config-repository';
import { ProductTaxRulesRepository } from './infrastructure/repositories/product-tax-rules-repository';
import { FiscalAuditLogRepository } from './infrastructure/repositories/fiscal-audit-log-repository';

// Controllers
import { FiscalConfigController } from './presentation/http/fiscal-config-controller';

/**
 * Creates and configures the Fiscal bounded context module.
 * 
 * Submódulos:
 * - /nuvem-fiscal/* → Integração Nuvem Fiscal (CNPJ, empresas, certificados, CT-e config)
 * - /fiscal/config/* → Configuração fiscal por tenant (Onda 0)
 * - /fiscal/produtos/* → Regras tributárias por produto (Onda 0)
 *
 * All routes require authentication (auth middleware applied externally).
 */
export function createNuvemFiscalModule() {
  return createNuvemFiscalRoutes();
}

export function createFiscalModule() {
  const router = new Hono<HonoContext>();

  // DI middleware - create all dependencies per-request from Cloudflare env
  router.use('*', async (c, next) => {
    const db = await createDatabaseConnection(c.env.HYPERDRIVE);

    const configRepo = new FiscalConfigRepository(db);
    const taxRulesRepo = new ProductTaxRulesRepository(db);
    const auditRepo = new FiscalAuditLogRepository(db);
    const configController = new FiscalConfigController(configRepo, taxRulesRepo, auditRepo, db);

    c.set('fiscalConfigController' as any, configController);

    await next();
  });

  // Mount subroutes
  router.route('/config', createFiscalConfigRoutes());
  router.route('/produtos', createProductTaxRulesRoutes());

  return router;
}
