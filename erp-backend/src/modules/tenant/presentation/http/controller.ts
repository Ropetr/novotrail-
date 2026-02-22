import { Context } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';

// Placeholder controller for future tenant CRUD operations.
// Currently the tenant module only provides its repository
// to other modules (e.g. auth for user registration).

export class TenantController {
  async list(c: Context<HonoContext>) {
    return c.json({ success: true, message: 'Tenant list endpoint - not yet implemented' });
  }
}
