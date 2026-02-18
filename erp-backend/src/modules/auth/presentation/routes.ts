import { Hono } from 'hono';
import type { HonoContext } from '../../../shared/cloudflare/types';
import { AuthController } from './controller';

/**
 * Creates the auth module route definitions.
 * These routes are PUBLIC (no auth middleware required).
 */
export function createAuthRoutes(authController: AuthController) {
  const router = new Hono<HonoContext>();

  router.post('/register', (c) => authController.register(c));
  router.post('/login', (c) => authController.login(c));

  return router;
}
