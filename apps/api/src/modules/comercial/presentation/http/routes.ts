import { Hono } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';
import type { QuoteController } from './controllers/quote-controller';
import type { SaleController } from './controllers/sale-controller';
import type { ReturnController } from './controllers/return-controller';
import type { DeliveryController } from './controllers/delivery-controller';
import type { CreditController } from './controllers/credit-controller';

export function createComercialRoutes() {
  const router = new Hono<HonoContext>();
  const getQuoteCtrl = (c: any) => c.get('quoteController') as QuoteController;
  const getSaleCtrl = (c: any) => c.get('saleController') as SaleController;
  const getReturnCtrl = (c: any) => c.get('returnController') as ReturnController;
  const getDeliveryCtrl = (c: any) => c.get('deliveryController') as DeliveryController;
  const getCreditCtrl = (c: any) => c.get('creditController') as CreditController;

  // Orçamentos (Quotes)
  router.get('/orcamentos', (c) => getQuoteCtrl(c).list(c));
  router.post('/orcamentos', (c) => getQuoteCtrl(c).create(c));
  router.get('/orcamentos/:id', (c) => getQuoteCtrl(c).getById(c));
  router.put('/orcamentos/:id', (c) => getQuoteCtrl(c).update(c));
  router.delete('/orcamentos/:id', (c) => getQuoteCtrl(c).remove(c));
  router.post('/orcamentos/:id/aprovar', (c) => getQuoteCtrl(c).approve(c));
  router.post('/orcamentos/:id/venda', (c) => getQuoteCtrl(c).convertToSale(c));
  router.post('/orcamentos/mesclar', (c) => getQuoteCtrl(c).merge(c));
  router.post('/orcamentos/:id/desmembrar', (c) => getQuoteCtrl(c).split(c));

  // Vendas (Sales)
  router.get('/vendas', (c) => getSaleCtrl(c).list(c));
  router.post('/vendas', (c) => getSaleCtrl(c).create(c));
  router.get('/vendas/:id', (c) => getSaleCtrl(c).getById(c));
  router.put('/vendas/:id', (c) => getSaleCtrl(c).update(c));
  router.post('/vendas/:id/cancelar', (c) => getSaleCtrl(c).cancel(c));

  // Entregas Fracionadas (Deliveries)
  router.get('/vendas/:saleId/entregas', (c) => getDeliveryCtrl(c).listBySale(c));
  router.post('/entregas', (c) => getDeliveryCtrl(c).create(c));
  router.get('/entregas/:id', (c) => getDeliveryCtrl(c).getById(c));
  router.post('/entregas/:id/separar', (c) => getDeliveryCtrl(c).startSeparation(c));
  router.post('/entregas/:id/confirmar-separacao', (c) => getDeliveryCtrl(c).confirmSeparation(c));
  router.post('/entregas/:id/confirmar-entrega', (c) => getDeliveryCtrl(c).confirmDelivery(c));
  router.post('/entregas/:id/cancelar', (c) => getDeliveryCtrl(c).cancel(c));

  // Créditos do Cliente (Credits)
  router.get('/creditos/cliente/:clientId', (c) => getCreditCtrl(c).listByClient(c));
  router.get('/creditos/cliente/:clientId/resumo', (c) => getCreditCtrl(c).getSummary(c));
  router.get('/creditos/:id', (c) => getCreditCtrl(c).getById(c));
  router.post('/creditos', (c) => getCreditCtrl(c).create(c));
  router.post('/creditos/:id/usar', (c) => getCreditCtrl(c).use(c));
  router.post('/creditos/:id/cancelar', (c) => getCreditCtrl(c).cancel(c));

  // Devoluções (Returns)
  router.get('/devolucoes', (c) => getReturnCtrl(c).list(c));
  router.post('/devolucoes', (c) => getReturnCtrl(c).create(c));
  router.get('/devolucoes/:id', (c) => getReturnCtrl(c).getById(c));
  router.put('/devolucoes/:id', (c) => getReturnCtrl(c).update(c));
  router.post('/devolucoes/:id/aprovar', (c) => getReturnCtrl(c).approve(c));

  return router;
}
