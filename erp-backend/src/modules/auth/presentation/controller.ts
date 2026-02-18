import { Context } from 'hono';
import type { HonoContext } from '../../../shared/cloudflare/types';
import { RegisterUserUseCase } from '../domain/use-cases/register-user';
import { LoginUserUseCase } from '../domain/use-cases/login-user';
import { AuthService } from '../../../shared/services/AuthService';
import { z } from 'zod';

const registerSchema = z.object({
  tenantId: z.string(),
  email: z.string(),
  password: z.string(),
  name: z.string(),
  role: z.enum(['admin', 'manager', 'user']).optional(),
});

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
  tenantId: z.string(),
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

      const user = await this.registerUserUseCase.execute(validatedData);

      // Don't return password hash
      const { passwordHash, ...userWithoutPassword } = user;

      const token = this.authService.generateToken(user);

      return c.json({
        success: true,
        data: {
          user: userWithoutPassword,
          token,
        },
      }, 201);
    } catch (error: any) {
      return c.json(
        {
          success: false,
          error: error.message || 'Registration failed',
        },
        400
      );
    }
  }

  async login(c: Context<HonoContext>) {
    try {
      const body = await c.req.json();
      const validatedData = loginSchema.parse(body);

      const user = await this.loginUserUseCase.execute(validatedData);

      // Verify password
      const isValid = await this.authService.comparePassword(
        validatedData.password,
        user.passwordHash
      );

      if (!isValid) {
        return c.json(
          {
            success: false,
            error: 'Invalid credentials',
          },
          401
        );
      }

      const token = this.authService.generateToken(user);

      // Don't return password hash
      const { passwordHash, ...userWithoutPassword } = user;

      return c.json({
        success: true,
        data: {
          user: userWithoutPassword,
          token,
        },
      });
    } catch (error: any) {
      return c.json(
        {
          success: false,
          error: error.message || 'Login failed',
        },
        401
      );
    }
  }
}
