import { Hono } from 'hono';
import type { HonoContext } from '../../../shared/cloudflare/types';
import type { QuoteController } from './controllers/quote-controller';
import type { SaleController } from './controllers/sale-controller';
import type { ReturnController } from './controllers/return-controller';

export function createComercialRoutes(
  quoteController: QuoteController,
  saleController: SaleController,
  returnController: ReturnController
) {
  const router = new Hono<HonoContext>();

  // Orçamentos (Quotes)
  router.get('/orcamentos', (c) => quoteController.list(c));
  router.post('/orcamentos', (c) => quoteController.create(c));
  router.get('/orcamentos/:id', (c) => quoteController.getById(c));
  router.put('/orcamentos/:id', (c) => quoteController.update(c));
  router.delete('/orcamentos/:id', (c) => quoteController.remove(c));
  router.post('/orcamentos/:id/aprovar', (c) => quoteController.approve(c));
  router.post('/orcamentos/:id/venda', (c) => quoteController.convertToSale(c));

  // Vendas (Sales)
  router.get('/vendas', (c) => saleController.list(c));
  router.post('/vendas', (c) => saleController.create(c));
  router.get('/vendas/:id', (c) => saleController.getById(c));
  router.put('/vendas/:id', (c) => saleController.update(c));
  router.post('/vendas/:id/cancelar', (c) => saleController.cancel(c));

  // Devoluções (Returns)
  router.get('/devolucoes', (c) => returnController.list(c));
  router.post('/devolucoes', (c) => returnController.create(c));
  router.get('/devolucoes/:id', (c) => returnController.getById(c));
  router.put('/devolucoes/:id', (c) => returnController.update(c));
  router.post('/devolucoes/:id/aprovar', (c) => returnController.approve(c));

  return router;
}
