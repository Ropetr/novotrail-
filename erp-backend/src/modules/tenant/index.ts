import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createDatabaseConnection } from '../../shared/database/connection';
import { TenantRepository } from './infrastructure/tenant-repository';

/**
 * Creates and configures the Tenant bounded context module.
 * Currently provides the tenant repository for inter-module use
 * and a placeholder route group for future tenant management endpoints.
 */
export function createTenantModule() {
  const router = new Hono<HonoContext>();

  // DI middleware - initialize dependencies from Cloudflare env
  router.use('*', async (c, next) => {
    const db = createDatabaseConnection(c.env.DB);
    const tenantRepository = new TenantRepository(db);
    c.set('tenantRepository' as any, tenantRepository);
    await next();
  });

  // Future: Mount tenant management routes here

  return router;
}

// Re-export domain contracts for inter-module communication
export type { ITenantRepository } from './domain/repositories';
export { TenantRepository } from './infrastructure/tenant-repository';
export { tenants } from './infrastructure/schema';
