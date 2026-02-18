import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createDatabaseConnection } from '../../shared/database/connection';
import { AuthService } from '../../shared/services/AuthService';
import { UserRepository } from './infrastructure/user-repository';
import { TenantRepository } from '../tenant/infrastructure/tenant-repository';
import { RegisterUserUseCase } from './domain/use-cases/register-user';
import { LoginUserUseCase } from './domain/use-cases/login-user';
import { AuthController } from './presentation/controller';

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
    const db = createDatabaseConnection(c.env.DB);
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
  router.post('/register', (c) => (c.get('authController' as any) as AuthController).register(c));
  router.post('/login', (c) => (c.get('authController' as any) as AuthController).login(c));

  return router;
}

// Re-export domain contracts for inter-module communication
export type { IUserRepository } from './domain/repositories';
export { UserRepository } from './infrastructure/user-repository';
export { users } from './infrastructure/schema';
