import { Hono } from 'hono';
import { HonoContext } from '../../infrastructure/cloudflare/types';
import { AuthController } from '../controllers/AuthController';

export function createAuthRoutes(authController: AuthController) {
  const auth = new Hono<HonoContext>();

  auth.post('/register', (c) => authController.register(c));
  auth.post('/login', (c) => authController.login(c));

  return auth;
}
