import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createDatabaseConnection } from '../../shared/database/connection';

// Repositories
import { TenantSettingsRepository } from './infrastructure/repositories/tenant-settings-repository';

// Controllers
import { TenantSettingsController } from './presentation/http/controllers/tenant-settings-controller';
import { createConfiguracoesRoutes } from './presentation/http/routes';

/**
 * Creates and configures the Configurações bounded context module.
 * Manages tenant settings (company data, logos, default observations).
 *
 * All routes are PROTECTED — auth middleware must be applied externally.
 */
export function createConfiguracoesModule() {
  const router = new Hono<HonoContext>();

  // DI middleware - create all dependencies per-request from Cloudflare env
  router.use('*', async (c, next) => {
    const db = await createDatabaseConnection(c.env.HYPERDRIVE);

    const settingsRepo = new TenantSettingsRepository(db);
    const settingsController = new TenantSettingsController(settingsRepo);

    c.set('settingsController' as any, settingsController);

    await next();
  });

  router.route('/', createConfiguracoesRoutes());

  return router;
}
