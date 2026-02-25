import { Hono } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';
import { WarehouseController } from './controllers/warehouse-controller';
import { StockController } from './controllers/stock-controller';
import { InventoryController } from './controllers/inventory-controller';

/**
 * Rotas do módulo de Estoque.
 * Todas as rotas são PROTEGIDAS (auth middleware aplicado externamente).
 *
 * Depósitos:
 *   GET    /depositos              → Listar depósitos
 *   GET    /depositos/:id          → Buscar depósito por ID
 *   POST   /depositos              → Criar depósito
 *   PUT    /depositos/:id          → Atualizar depósito
 *   DELETE /depositos/:id          → Remover depósito
 *
 * Saldos:
 *   GET    /saldos                 → Listar saldos (com filtro por depósito)
 *   GET    /saldos/alertas         → Produtos abaixo do estoque mínimo
 *   GET    /saldos/produto/:id     → Saldo de um produto em todos os depósitos
 *
 * Movimentações:
 *   GET    /movimentacoes          → Listar movimentações (com filtros)
 *   GET    /movimentacoes/:id      → Buscar movimentação por ID
 *   POST   /movimentacoes          → Criar movimentação manual
 *   POST   /movimentacoes/transferencia → Transferir entre depósitos
 *
 * Inventário:
 *   GET    /inventarios            → Listar inventários
 *   GET    /inventarios/:id        → Buscar inventário com itens
 *   POST   /inventarios            → Criar novo inventário
 *   POST   /inventarios/:id/iniciar     → Iniciar contagem (draft → counting)
 *   POST   /inventarios/:id/contar      → Registrar contagem de item (cega)
 *   POST   /inventarios/:id/revisar     → Enviar para revisão (counting → review)
 *   POST   /inventarios/:id/aprovar     → Aprovar e gerar ajustes (review → approved)
 *   POST   /inventarios/:id/cancelar    → Cancelar inventário
 */
export function createEstoqueRoutes() {
  const router = new Hono<HonoContext>();

  const getWarehouseCtrl = (c: any) => c.get('warehouseController') as WarehouseController;
  const getStockCtrl = (c: any) => c.get('stockController') as StockController;
  const getInventoryCtrl = (c: any) => c.get('inventoryController') as InventoryController;

  // --- Depósitos ---
  router.get('/depositos', (c) => getWarehouseCtrl(c).list(c));
  router.get('/depositos/:id', (c) => getWarehouseCtrl(c).getById(c));
  router.post('/depositos', (c) => getWarehouseCtrl(c).create(c));
  router.put('/depositos/:id', (c) => getWarehouseCtrl(c).update(c));
  router.delete('/depositos/:id', (c) => getWarehouseCtrl(c).delete(c));

  // --- Saldos ---
  router.get('/saldos', (c) => getStockCtrl(c).listLevels(c));
  router.get('/saldos/alertas', (c) => getStockCtrl(c).getAlerts(c));
  router.get('/saldos/produto/:id', (c) => getStockCtrl(c).getProductStock(c));

  // --- Movimentações ---
  router.get('/movimentacoes', (c) => getStockCtrl(c).listMovements(c));
  router.get('/movimentacoes/:id', (c) => getStockCtrl(c).getMovement(c));
  router.post('/movimentacoes', (c) => getStockCtrl(c).createMovement(c));
  router.post('/movimentacoes/transferencia', (c) => getStockCtrl(c).transfer(c));

  // --- Inventário ---
  router.get('/inventarios', (c) => getInventoryCtrl(c).list(c));
  router.get('/inventarios/:id', (c) => getInventoryCtrl(c).getById(c));
  router.post('/inventarios', (c) => getInventoryCtrl(c).create(c));
  router.post('/inventarios/:id/iniciar', (c) => getInventoryCtrl(c).startCounting(c));
  router.post('/inventarios/:id/contar', (c) => getInventoryCtrl(c).countItem(c));
  router.post('/inventarios/:id/revisar', (c) => getInventoryCtrl(c).submitForReview(c));
  router.post('/inventarios/:id/aprovar', (c) => getInventoryCtrl(c).approve(c));
  router.post('/inventarios/:id/cancelar', (c) => getInventoryCtrl(c).cancel(c));

  return router;
}
