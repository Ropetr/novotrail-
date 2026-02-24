import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createDatabaseConnection } from '../../shared/database/connection';

// Repositories
import { QuoteRepository } from './infrastructure/repositories/quote-repository';
import { SaleRepository } from './infrastructure/repositories/sale-repository';
import { ReturnRepository } from './infrastructure/repositories/return-repository';
import { DeliveryRepository } from './infrastructure/repositories/delivery-repository';
import { CreditRepository } from './infrastructure/repositories/credit-repository';
import { PaymentRepository } from './infrastructure/repositories/payment-repository';

// Controllers
import { QuoteController } from './presentation/http/controllers/quote-controller';
import { SaleController } from './presentation/http/controllers/sale-controller';
import { ReturnController } from './presentation/http/controllers/return-controller';
import { DeliveryController } from './presentation/http/controllers/delivery-controller';
import { CreditController } from './presentation/http/controllers/credit-controller';
import { createComercialRoutes } from './presentation/http/routes';

/**
 * Creates and configures the Comercial bounded context module.
 * Manages quotes, sales, returns, deliveries, and client credits.
 *
 * All routes are PROTECTED — auth middleware must be applied externally.
 *
 * Features (TrailSystem-inspired):
 *   - Quotes: create, merge, split, convert to sale
 *   - Sales: granular status (invoiced/delivered/received amounts)
 *   - Deliveries: fractional deliveries .E1, .E2, .E3...
 *   - Credits: client credit wallet (referral, return, bonus, advance)
 *   - Returns: with refund type (money, credit, decide_later)
 */
export function createComercialModule() {
  const router = new Hono<HonoContext>();

  // DI middleware - create all dependencies per-request from Cloudflare env
  router.use('*', async (c, next) => {
    const db = await createDatabaseConnection(c.env.HYPERDRIVE);

    // Repositories
    const quoteRepository = new QuoteRepository(db);
    const saleRepository = new SaleRepository(db);
    const returnRepository = new ReturnRepository(db);
    const deliveryRepository = new DeliveryRepository(db);
    const creditRepository = new CreditRepository(db);
    const paymentRepository = new PaymentRepository(db);

    // Controllers
    const quoteController = new QuoteController(quoteRepository);
    const saleController = new SaleController(saleRepository, paymentRepository);
    const returnController = new ReturnController(returnRepository);
    const deliveryController = new DeliveryController(deliveryRepository);
    const creditController = new CreditController(creditRepository);

    c.set('quoteController' as any, quoteController);
    c.set('saleController' as any, saleController);
    c.set('returnController' as any, returnController);
    c.set('deliveryController' as any, deliveryController);
    c.set('creditController' as any, creditController);

    await next();
  });

  router.route('/', createComercialRoutes());

  return router;
}
