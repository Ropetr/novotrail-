import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createDatabaseConnection } from '../../shared/database/connection';
import { AuthService } from '../../core/auth/AuthService';
import { UserRepository } from './infrastructure/user-repository';
import { TenantRepository } from '../tenant/infrastructure/tenant-repository';
import { RegisterUserUseCase } from './application/use-cases/register-user';
import { LoginUserUseCase } from './application/use-cases/login-user';
import { AuthController } from './presentation/http/controller';
import { createAuthRoutes } from './presentation/http/routes';

/**
 * Creates and configures the Auth bounded context module.
 * Auth routes are PUBLIC -- no auth middleware is applied.
 *
 * Dependency graph (Clean Architecture):
 *   Controller -> Use Cases -> Repositories (interfaces)
 *                                     ^
 *                          Infrastructure (implementations)
 */
export function createAuthModule() {
  const router = new Hono<HonoContext>();

  // DI middleware - create all dependencies per-request from Cloudflare env
  router.use('*', async (c, next) => {
    const db = await createDatabaseConnection(c.env.HYPERDRIVE);
    const authService = new AuthService(c.env.JWT_SECRET);

    // Repositories
    const userRepository = new UserRepository(db);
    const tenantRepository = new TenantRepository(db);

    // Use cases
    const registerUserUseCase = new RegisterUserUseCase(userRepository, tenantRepository);
    const loginUserUseCase = new LoginUserUseCase(userRepository);

    // Controller
    const authController = new AuthController(registerUserUseCase, loginUserUseCase, authService);

    c.set('authController' as any, authController);
    c.set('authService' as any, authService);

    await next();
  });

  // Routes (public)
  router.route('/', createAuthRoutes());

  return router;
}

// Re-export domain contracts for inter-module communication
