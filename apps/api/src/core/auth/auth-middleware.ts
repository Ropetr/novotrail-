import { Context, Next } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { AuthService } from './AuthService';
import { getAccessToken } from './cookie-helper';

/**
 * Middleware de autenticação.
 * Suporta httpOnly cookies (prioridade) e Bearer token (fallback/compatibilidade).
 */
export function createAuthMiddleware(authService: AuthService) {
  return async (c: Context<HonoContext>, next: Next) => {
    const token = getAccessToken(c);

    if (!token) {
      return c.json(
        {
          success: false,
          error: 'Missing or invalid authorization',
        },
        401
      );
    }

    try {
      const decoded = authService.verifyToken(token);
      const resolvedTenantId = c.get('tenantId');

      if (resolvedTenantId && decoded.tenantId !== resolvedTenantId) {
        return c.json({ success: false, error: 'Tenant mismatch' }, 403);
      }

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
