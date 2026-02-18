import { Context, Next } from 'hono';
import { HonoContext } from '../cloudflare/types';
import { AuthService } from '../services/AuthService';

export function createAuthMiddleware(authService: AuthService) {
  return async (c: Context<HonoContext>, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(
        {
          success: false,
          error: 'Missing or invalid authorization header',
        },
        401
      );
    }

    const token = authHeader.substring(7);

    try {
      const decoded = authService.verifyToken(token);
      c.set('user', decoded);
      await next();
    } catch (error) {
      return c.json(
        {
          success: false,
          error: 'Invalid or expired token',
        },
        401
      );
    }
  };
}
