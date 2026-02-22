import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createDatabaseConnection } from '../../shared/database/connection';

// Repositories
import { QuoteRepository } from './infrastructure/repositories/quote-repository';
import { SaleRepository } from './infrastructure/repositories/sale-repository';
import { ReturnRepository } from './infrastructure/repositories/return-repository';

// Controllers
import { QuoteController } from './presentation/http/controllers/quote-controller';
import { SaleController } from './presentation/http/controllers/sale-controller';
import { ReturnController } from './presentation/http/controllers/return-controller';
import { createComercialRoutes } from './presentation/http/routes';

/**
 * Creates and configures the Comercial bounded context module.
 * Manages quotes (orçamentos), sales (vendas) and returns (devoluções).
 *
 * All routes are PROTECTED — auth middleware must be applied externally.
 *
 * Business rules enforced:
 *   - Quotes must be approved before conversion to sale
 *   - Invoiced sales cannot be cancelled
 *   - Only pending returns can be approved
 *
 * Dependency graph (Clean Architecture):
 *   Controller -> Repository interfaces
 *                       ^
 *            Infrastructure (implementations)
 */
export function createComercialModule() {
  const router = new Hono<HonoContext>();

  // DI middleware - create all dependencies per-request from Cloudflare env
  router.use('*', async (c, next) => {
    const db = createDatabaseConnection(c.env.DB);

    // Repositories
    const quoteRepository = new QuoteRepository(db);
    const saleRepository = new SaleRepository(db);
    const returnRepository = new ReturnRepository(db);

    // Controllers
    const quoteController = new QuoteController(quoteRepository);
    const saleController = new SaleController(saleRepository);
    const returnController = new ReturnController(returnRepository);

    c.set('quoteController' as any, quoteController);
    c.set('saleController' as any, saleController);
    c.set('returnController' as any, returnController);

    await next();
  });

  router.route('/', createComercialRoutes());

  return router;
}

// Re-export domain contracts for inter-module communication
