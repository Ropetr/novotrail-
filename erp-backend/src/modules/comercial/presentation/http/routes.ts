import { Hono } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';
import type { QuoteController } from './controllers/quote-controller';
import type { SaleController } from './controllers/sale-controller';
import type { ReturnController } from './controllers/return-controller';

export function createComercialRoutes() {
  const router = new Hono<HonoContext>();
  const getQuoteCtrl = (c: any) => c.get('quoteController') as QuoteController;
  const getSaleCtrl = (c: any) => c.get('saleController') as SaleController;
  const getReturnCtrl = (c: any) => c.get('returnController') as ReturnController;

  // Orçamentos (Quotes)
  router.get('/orcamentos', (c) => getQuoteCtrl(c).list(c));
  router.post('/orcamentos', (c) => getQuoteCtrl(c).create(c));
  router.get('/orcamentos/:id', (c) => getQuoteCtrl(c).getById(c));
  router.put('/orcamentos/:id', (c) => getQuoteCtrl(c).update(c));
  router.delete('/orcamentos/:id', (c) => getQuoteCtrl(c).remove(c));
  router.post('/orcamentos/:id/aprovar', (c) => getQuoteCtrl(c).approve(c));
  router.post('/orcamentos/:id/venda', (c) => getQuoteCtrl(c).convertToSale(c));

  // Vendas (Sales)
  router.get('/vendas', (c) => getSaleCtrl(c).list(c));
  router.post('/vendas', (c) => getSaleCtrl(c).create(c));
  router.get('/vendas/:id', (c) => getSaleCtrl(c).getById(c));
  router.put('/vendas/:id', (c) => getSaleCtrl(c).update(c));
  router.post('/vendas/:id/cancelar', (c) => getSaleCtrl(c).cancel(c));

  // Devoluções (Returns)
  router.get('/devolucoes', (c) => getReturnCtrl(c).list(c));
  router.post('/devolucoes', (c) => getReturnCtrl(c).create(c));
  router.get('/devolucoes/:id', (c) => getReturnCtrl(c).getById(c));
  router.put('/devolucoes/:id', (c) => getReturnCtrl(c).update(c));
  router.post('/devolucoes/:id/aprovar', (c) => getReturnCtrl(c).approve(c));

  return router;
}
