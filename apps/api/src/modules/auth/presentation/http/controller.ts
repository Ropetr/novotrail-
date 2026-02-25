import { Context } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';
import { RegisterUserUseCase } from '../../application/use-cases/register-user';
import { LoginUserUseCase } from '../../application/use-cases/login-user';
import { AuthService } from '../../../../core/auth/AuthService';
import { setAuthCookies, getRefreshToken, clearAuthCookies } from '../../../../core/auth/cookie-helper';
import { z } from 'zod';
import { ok, fail } from '../../../../shared/http/response';

const registerSchema = z.object({
  email: z.string(),
  password: z.string(),
  name: z.string(),
  role: z.enum(['admin', 'manager', 'user']).optional(),
});

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export class AuthController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUserUseCase: LoginUserUseCase,
    private authService: AuthService
  ) {}

  async register(c: Context<HonoContext>) {
    try {
      const body = await c.req.json();
      const validatedData = registerSchema.parse(body);
      const tenantId = c.get('tenantId');

      if (!tenantId) {
        return fail(c, 'Tenant not resolved', 400);
      }

      const user = await this.registerUserUseCase.execute({
        ...validatedData,
        tenantId,
      });

      // Don't return password hash
      const { passwordHash, ...userWithoutPassword } = user;

      const { accessToken, refreshToken } = this.authService.generateTokenPair(user);

      // Definir cookies httpOnly
      setAuthCookies(c, accessToken, refreshToken);

      return ok(
        c,
        {
          user: userWithoutPassword,
          token: accessToken, // Mantido para compatibilidade com frontend atual
        },
        201
      );
    } catch (error: any) {
      return fail(c, error.message || 'Registration failed', 400);
    }
  }

  async login(c: Context<HonoContext>) {
    try {
      const body = await c.req.json();
      const validatedData = loginSchema.parse(body);
      const tenantId = c.get('tenantId');

      if (!tenantId) {
        return fail(c, 'Tenant not resolved', 400);
      }

      const user = await this.loginUserUseCase.execute({
        ...validatedData,
        tenantId,
      });

      // Verify password
      const isValid = await this.authService.comparePassword(
        validatedData.password,
        user.passwordHash
      );

      if (!isValid) {
        return fail(c, 'Invalid credentials', 401);
      }

      const { accessToken, refreshToken } = this.authService.generateTokenPair(user);

      // Definir cookies httpOnly
      setAuthCookies(c, accessToken, refreshToken);

      // Don't return password hash
      const { passwordHash, ...userWithoutPassword } = user;

      return ok(c, {
        user: userWithoutPassword,
        token: accessToken, // Mantido para compatibilidade com frontend atual
      });
    } catch (error: any) {
      return fail(c, error.message || 'Login failed', 401);
    }
  }

  /**
   * Renova o access token usando o refresh token.
   * POST /auth/refresh
   */
  async refresh(c: Context<HonoContext>) {
    try {
      const refreshTokenValue = getRefreshToken(c);

      if (!refreshTokenValue) {
        return fail(c, 'Refresh token not found', 401);
      }

      const decoded = this.authService.verifyRefreshToken(refreshTokenValue);

      // Gerar novo par de tokens
      const newTokens = this.authService.generateTokenPair(decoded as any);
      setAuthCookies(c, newTokens.accessToken, newTokens.refreshToken);

      return ok(c, {
        token: newTokens.accessToken,
        message: 'Token refreshed successfully',
      });
    } catch (error: any) {
      clearAuthCookies(c);
      return fail(c, 'Invalid refresh token', 401);
    }
  }

  /**
   * Logout — limpa os cookies de autenticação.
   * POST /auth/logout
   */
  async logout(c: Context<HonoContext>) {
    clearAuthCookies(c);
    return ok(c, { message: 'Logged out successfully' });
  }
}
