import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createDatabaseConnection } from '../../shared/database/connection';
import { TenantRepository } from './infrastructure/tenant-repository';
import { createTenantRoutes } from './presentation/http/routes';

/**
 * Creates and configures the Tenant bounded context module.
 * Currently provides the tenant repository for inter-module use
 * and a placeholder route group for future tenant management endpoints.
 */
export function createTenantModule() {
  const router = new Hono<HonoContext>();

  // DI middleware - initialize dependencies from Cloudflare env
  router.use('*', async (c, next) => {
    const db = createDatabaseConnection(c.env.HYPERDRIVE);
    const tenantRepository = new TenantRepository(db);
    c.set('tenantRepository' as any, tenantRepository);
    await next();
  });

  // Tenant routes (currently placeholders)
  router.route('/', createTenantRoutes());

  return router;
}

// Re-export domain contracts for inter-module communication
