import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { HonoContext } from './shared/cloudflare/types';
import { createDatabaseConnection } from './shared/database/connection';
import { fail } from './shared/http/response';
import { AuthService } from './core/auth/AuthService';
import { createAuthMiddleware } from './core/auth/auth-middleware';
import { resolveTenant } from './core/tenancy/resolve-tenant';

// Modules
import { createAuthModule } from './modules/auth/index';
import { createFiscalModule } from './modules/fiscal/index';
import { createCadastrosModule } from './modules/cadastros/index';
import { createProdutosModule } from './modules/produtos/index';
import { createComercialModule } from './modules/comercial/index';

const app = new Hono<HonoContext>();

// ============================================
// GLOBAL MIDDLEWARES
// ============================================
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'https://novotrail-web.planacacabamentos.workers.dev',
    ],
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT,
  });
});

// ============================================
// DEV-ONLY ENDPOINTS
// ============================================

// Seed endpoint (development only)
app.post('/seed', async (c) => {
  if (c.env.ENVIRONMENT !== 'development') {
    return c.json({ error: 'Not allowed in production' }, 403);
  }

  const db = await createDatabaseConnection(c.env.HYPERDRIVE);
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

    const db = await createDatabaseConnection(c.env.HYPERDRIVE);
    const { users } = await import('./shared/database/schema');
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

// ============================================
// API v1 - MODULE REGISTRATION
// ============================================
const apiV1 = new Hono<HonoContext>();

// Tenant resolution for all API routes
apiV1.use('*', resolveTenant);

// Auth module (PUBLIC routes - no auth middleware)
apiV1.route('/auth', createAuthModule());

// Protected routes - shared auth middleware setup
apiV1.use('/protected/*', async (c, next) => {
  const authService = new AuthService(c.env.JWT_SECRET);
  const authMiddleware = createAuthMiddleware(authService);
  return authMiddleware(c, next);
});
apiV1.get('/protected/me', (c) => {
  return c.json({
    success: true,
    data: c.get('user'),
  });
});

// Fiscal module (PROTECTED routes)
apiV1.use('/nuvem-fiscal/*', async (c, next) => {
  const authService = new AuthService(c.env.JWT_SECRET);
  const authMiddleware = createAuthMiddleware(authService);
  return authMiddleware(c, next);
});
apiV1.route('/nuvem-fiscal', createFiscalModule());

// Cadastros module (PROTECTED routes)
apiV1.use('/cadastros/*', async (c, next) => {
  const authService = new AuthService(c.env.JWT_SECRET);
  const authMiddleware = createAuthMiddleware(authService);
  return authMiddleware(c, next);
});
apiV1.route('/cadastros', createCadastrosModule());

// Produtos module (PROTECTED routes)
apiV1.use('/produtos/*', async (c, next) => {
  const authService = new AuthService(c.env.JWT_SECRET);
  const authMiddleware = createAuthMiddleware(authService);
  return authMiddleware(c, next);
});
apiV1.route('/produtos', createProdutosModule());

// Comercial module (PROTECTED routes)
apiV1.use('/comercial/*', async (c, next) => {
  const authService = new AuthService(c.env.JWT_SECRET);
  const authMiddleware = createAuthMiddleware(authService);
  return authMiddleware(c, next);
});
apiV1.route('/comercial', createComercialModule());

// Mount API v1
app.route('/api/v1', apiV1);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.notFound((c) => {
  return fail(c, 'Not found', 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return fail(c, err.message || 'Internal server error', 500);
});

// ============================================
// QUEUE CONSUMER (Domain Events)
// ============================================
import { EventHandlerRegistry } from './shared/events/event-bus';
import type { DomainEvent } from './shared/events/events';
import type { CloudflareEnv } from './shared/cloudflare/types';

const eventRegistry = new EventHandlerRegistry();

// Register event handlers here as modules grow:
// eventRegistry.register('sale.created', async (event) => { /* update stock, create receivable */ });
// eventRegistry.register('return.approved', async (event) => { /* restore stock */ });
// eventRegistry.register('product.stock_low', async (event) => { /* send notification */ });

export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch<DomainEvent>, env: CloudflareEnv): Promise<void> {
    for (const message of batch.messages) {
      const event = message.body;
      console.log(`[Queue] Processing event: ${event.type}`, {
        tenantId: event.tenantId,
        timestamp: event.metadata.timestamp,
      });

      const handlers = eventRegistry.getHandlers(event.type);
      if (handlers.length === 0) {
        console.log(`[Queue] No handlers registered for event: ${event.type}`);
        message.ack();
        continue;
      }

      try {
        await Promise.all(handlers.map(handler => handler(event)));
        message.ack();
      } catch (error) {
        console.error(`[Queue] Error processing event ${event.type}:`, error);
        message.retry();
      }
    }
  },
};
export { SessionManager } from './shared/cloudflare/SessionManager';
