import { Hono } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';
import type { WarehouseController } from './controllers/warehouse-controller';
import type { StockLevelController } from './controllers/stock-level-controller';
import type { StockMovementController } from './controllers/stock-movement-controller';
import type { StockTransferController } from './controllers/stock-transfer-controller';
import type { InventoryCountController } from './controllers/inventory-count-controller';
import type { StockSettingsController } from './controllers/stock-settings-controller';
import type { KitController } from './controllers/kit-controller';
import type { ProductionOrderController } from './controllers/production-order-controller';
import type { BatchController } from './controllers/batch-controller';
import type { SerialController } from './controllers/serial-controller';
import type { ReservationController } from './controllers/reservation-controller';
import type { IntegrationController } from './controllers/integration-controller';
import type { ScanController } from './controllers/scan-controller';

export function createEstoqueRoutes() {
  const router = new Hono<HonoContext>();

  const getWarehouseCtrl = (c: any) => c.get('warehouseController') as WarehouseController;
  const getStockLevelCtrl = (c: any) => c.get('stockLevelController') as StockLevelController;
  const getMovementCtrl = (c: any) => c.get('stockMovementController') as StockMovementController;
  const getTransferCtrl = (c: any) => c.get('stockTransferController') as StockTransferController;
  const getInventoryCtrl = (c: any) => c.get('inventoryCountController') as InventoryCountController;
  const getSettingsCtrl = (c: any) => c.get('stockSettingsController') as StockSettingsController;
  const getKitCtrl = (c: any) => c.get('kitController') as KitController;
  const getProductionCtrl = (c: any) => c.get('productionOrderController') as ProductionOrderController;
  const getBatchCtrl = (c: any) => c.get('batchController') as BatchController;
  const getSerialCtrl = (c: any) => c.get('serialController') as SerialController;
  const getReservationCtrl = (c: any) => c.get('reservationController') as ReservationController;
  const getIntegrationCtrl = (c: any) => c.get('integrationController') as IntegrationController;
  const getScanCtrl = (c: any) => c.get('scanController') as ScanController;

  // ==================== Depósitos (5) ====================
  router.get('/depositos', (c) => getWarehouseCtrl(c).list(c));
  router.post('/depositos', (c) => getWarehouseCtrl(c).create(c));
  router.get('/depositos/:id', (c) => getWarehouseCtrl(c).getById(c));
  router.put('/depositos/:id', (c) => getWarehouseCtrl(c).update(c));
  router.delete('/depositos/:id', (c) => getWarehouseCtrl(c).remove(c));

  // ==================== Saldos (3) ====================
  router.get('/saldos', (c) => getStockLevelCtrl(c).list(c));
  router.get('/saldos/dashboard', (c) => getStockLevelCtrl(c).dashboard(c));
  router.get('/saldos/produto/:productId', (c) => getStockLevelCtrl(c).getByProduct(c));

  // ==================== Movimentações (3) ====================
  router.get('/movimentacoes', (c) => getMovementCtrl(c).list(c));
  router.post('/movimentacoes', (c) => getMovementCtrl(c).create(c));
  router.get('/movimentacoes/:id', (c) => getMovementCtrl(c).getById(c));

  // ==================== Transferências (5) ====================
  router.get('/transferencias', (c) => getTransferCtrl(c).list(c));
  router.post('/transferencias', (c) => getTransferCtrl(c).create(c));
  router.get('/transferencias/:id', (c) => getTransferCtrl(c).getById(c));
  router.patch('/transferencias/:id/enviar', (c) => getTransferCtrl(c).ship(c));
  router.patch('/transferencias/:id/receber', (c) => getTransferCtrl(c).receive(c));

  // ==================== Inventários (4) ====================
  router.get('/inventarios', (c) => getInventoryCtrl(c).list(c));
  router.post('/inventarios', (c) => getInventoryCtrl(c).create(c));
  router.get('/inventarios/:id', (c) => getInventoryCtrl(c).getById(c));
  router.post('/inventarios/:id/itens', (c) => getInventoryCtrl(c).registerItem(c));
  router.patch('/inventarios/:id/aprovar', (c) => getInventoryCtrl(c).approve(c));

  // ==================== Configurações (2) ====================
  router.get('/configuracoes', (c) => getSettingsCtrl(c).get(c));
  router.put('/configuracoes', (c) => getSettingsCtrl(c).update(c));

  // ==================== Kits / BOM (5) ====================
  router.get('/kits', (c) => getKitCtrl(c).list(c));
  router.post('/kits', (c) => getKitCtrl(c).create(c));
  router.get('/kits/:id', (c) => getKitCtrl(c).getById(c));
  router.put('/kits/:id', (c) => getKitCtrl(c).update(c));
  router.delete('/kits/:id', (c) => getKitCtrl(c).remove(c));

  // ==================== Produção (4) ====================
  router.get('/producao', (c) => getProductionCtrl(c).list(c));
  router.post('/producao', (c) => getProductionCtrl(c).create(c));
  router.get('/producao/:id', (c) => getProductionCtrl(c).getById(c));
  router.patch('/producao/:id/status', (c) => getProductionCtrl(c).updateStatus(c));

  // ==================== Lotes (3) ====================
  router.get('/lotes', (c) => getBatchCtrl(c).list(c));
  router.post('/lotes', (c) => getBatchCtrl(c).create(c));
  router.get('/lotes/:id', (c) => getBatchCtrl(c).getById(c));

  // ==================== Séries (2) ====================
  router.get('/series', (c) => getSerialCtrl(c).list(c));
  router.post('/series', (c) => getSerialCtrl(c).create(c));

  // ==================== Reservas (3) ====================
  router.get('/reservas', (c) => getReservationCtrl(c).list(c));
  router.post('/reservas', (c) => getReservationCtrl(c).create(c));
  router.patch('/reservas/:id/status', (c) => getReservationCtrl(c).updateStatus(c));

  // ==================== Bipagem (1) ====================
  router.post('/inventarios/:id/bipagem', (c) => getScanCtrl(c).scan(c));

  // ==================== Integração (1) ====================
  router.post('/movimentacoes/from-sale', (c) => getIntegrationCtrl(c).fromSale(c));

  return router;
}
