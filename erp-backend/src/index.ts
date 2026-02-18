import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { HonoContext } from './infrastructure/cloudflare/types';
import { createDatabaseConnection } from './infrastructure/database/connection';
import { TenantRepository } from './infrastructure/repositories/TenantRepository';
import { UserRepository } from './infrastructure/repositories/UserRepository';
import { RegisterUserUseCase } from './domain/use-cases/RegisterUser';
import { LoginUserUseCase } from './domain/use-cases/LoginUser';
import { AuthService } from './application/services/AuthService';
import { AuthController } from './presentation/controllers/AuthController';
import { createAuthRoutes } from './presentation/routes/auth';
import { createAuthMiddleware } from './presentation/middlewares/auth';
import { createNuvemFiscalRoutes } from './presentation/routes/nuvem-fiscal';

const app = new Hono<HonoContext>();

// Middlewares
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT,
  });
});

// Seed endpoint (development only)
app.post('/seed', async (c) => {
  if (c.env.ENVIRONMENT !== 'development') {
    return c.json({ error: 'Not allowed in production' }, 403);
  }

  const db = createDatabaseConnection(c.env.DB);
  const { seed } = await import('../scripts/seed');

  try {
    await seed(db);
    return c.json({ success: true, message: 'Database seeded successfully' });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update password endpoint (development only)
app.post('/update-password', async (c) => {
  if (c.env.ENVIRONMENT !== 'development') {
    return c.json({ error: 'Not allowed in production' }, 403);
  }

  try {
    const { email, passwordHash, tenantId } = await c.req.json();

    if (!email || !passwordHash) {
      return c.json({ error: 'Email and passwordHash are required' }, 400);
    }

    const db = createDatabaseConnection(c.env.DB);
    const { users } = await import('./infrastructure/database/schema');
    const { eq, and } = await import('drizzle-orm');

    // Update password hash directly
    const whereClause = tenantId
      ? and(eq(users.email, email), eq(users.tenantId, tenantId))
      : eq(users.email, email);

    await db.update(users).set({
      passwordHash,
      updatedAt: new Date()
    }).where(whereClause);

    return c.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// API v1 routes
const apiV1 = new Hono<HonoContext>();

// Initialize dependencies
apiV1.use('*', async (c, next) => {
  const db = createDatabaseConnection(c.env.DB);
  const authService = new AuthService(c.env.JWT_SECRET);

  // Repositories
  const tenantRepository = new TenantRepository(db);
  const userRepository = new UserRepository(db);

  // Use cases
  const registerUserUseCase = new RegisterUserUseCase(userRepository, tenantRepository);
  const loginUserUseCase = new LoginUserUseCase(userRepository);

  // Controllers
  const authController = new AuthController(registerUserUseCase, loginUserUseCase, authService);

  // Store in context for routes
  c.set('authController' as any, authController);
  c.set('authService' as any, authService);

  await next();
});

// Auth routes (public)
const authRoutes = new Hono<HonoContext>();
authRoutes.post('/register', (c) => (c.get('authController' as any) as AuthController).register(c));
authRoutes.post('/login', (c) => (c.get('authController' as any) as AuthController).login(c));
apiV1.route('/auth', authRoutes);

// Protected routes example
const protectedRoutes = new Hono<HonoContext>();
protectedRoutes.use('*', (c, next) => {
  const authService = c.get('authService' as any) as AuthService;
  const authMiddleware = createAuthMiddleware(authService);
  return authMiddleware(c, next);
});
protectedRoutes.get('/me', (c) => {
  return c.json({
    success: true,
    data: c.get('user'),
  });
});
apiV1.route('/protected', protectedRoutes);

// Nuvem Fiscal routes (protected)
apiV1.use('/nuvem-fiscal/*', (c, next) => {
  const authService = c.get('authService' as any) as AuthService;
  const authMiddleware = createAuthMiddleware(authService);
  return authMiddleware(c, next);
});
apiV1.route('/nuvem-fiscal', createNuvemFiscalRoutes(undefined as any));

app.route('/api/v1', apiV1);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Not found',
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json(
    {
      success: false,
      error: err.message || 'Internal server error',
    },
    500
  );
});

export default app;
export { SessionManager } from './infrastructure/cloudflare/SessionManager';
