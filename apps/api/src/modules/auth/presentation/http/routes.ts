import { Hono } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';
import { AuthController } from './controller';

/**
 * Creates the auth module route definitions.
 * These routes are PUBLIC (no auth middleware required).
 */
export function createAuthRoutes() {
  const router = new Hono<HonoContext>();

  const getController = (c: any) => c.get('authController') as AuthController;

  router.post('/register', (c) => getController(c).register(c));
  router.post('/login', (c) => getController(c).login(c));

  return router;
}
