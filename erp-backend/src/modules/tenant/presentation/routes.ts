import { Hono } from 'hono';
import type { HonoContext } from '../../../shared/cloudflare/types';

/**
 * Creates the tenant module routes.
 * Currently a placeholder for future tenant management endpoints.
 */
export function createTenantRoutes() {
  const router = new Hono<HonoContext>();

  // Future: GET /tenants, POST /tenants, PUT /tenants/:id, DELETE /tenants/:id

  return router;
}
