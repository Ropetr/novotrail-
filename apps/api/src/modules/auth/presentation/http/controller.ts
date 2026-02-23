import { Context } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';
import { RegisterUserUseCase } from '../../application/use-cases/register-user';
import { LoginUserUseCase } from '../../application/use-cases/login-user';
import { AuthService } from '../../../../core/auth/AuthService';
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

      const token = this.authService.generateToken(user);

      return ok(
        c,
        {
          user: userWithoutPassword,
          token,
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

      const token = this.authService.generateToken(user);

      // Don't return password hash
      const { passwordHash, ...userWithoutPassword } = user;

      return ok(c, {
        user: userWithoutPassword,
        token,
      });
    } catch (error: any) {
      return fail(c, error.message || 'Login failed', 401);
    }
  }
}
