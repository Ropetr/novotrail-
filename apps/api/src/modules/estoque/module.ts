import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createDatabaseConnection } from '../../shared/database/connection';

// Repositories — Base
import { WarehouseRepository } from './infrastructure/repositories/warehouse-repository';
import { StockLevelRepository } from './infrastructure/repositories/stock-level-repository';
import { StockMovementRepository } from './infrastructure/repositories/stock-movement-repository';
import { StockTransferRepository } from './infrastructure/repositories/stock-transfer-repository';
import { InventoryCountRepository } from './infrastructure/repositories/inventory-count-repository';
import { StockSettingsRepository } from './infrastructure/repositories/stock-settings-repository';

// Repositories — Avançado
import { KitRepository } from './infrastructure/repositories/kit-repository';
import { ProductionOrderRepository } from './infrastructure/repositories/production-order-repository';
import { BatchRepository } from './infrastructure/repositories/batch-repository';
import { SerialRepository } from './infrastructure/repositories/serial-repository';
import { ReservationRepository } from './infrastructure/repositories/reservation-repository';
import { ScanRepository } from './infrastructure/repositories/scan-repository';

// Controllers — Base
import { WarehouseController } from './presentation/http/controllers/warehouse-controller';
import { StockLevelController } from './presentation/http/controllers/stock-level-controller';
import { StockMovementController } from './presentation/http/controllers/stock-movement-controller';
import { StockTransferController } from './presentation/http/controllers/stock-transfer-controller';
import { InventoryCountController } from './presentation/http/controllers/inventory-count-controller';
import { StockSettingsController } from './presentation/http/controllers/stock-settings-controller';

// Controllers — Avançado
import { KitController } from './presentation/http/controllers/kit-controller';
import { ProductionOrderController } from './presentation/http/controllers/production-order-controller';
import { BatchController } from './presentation/http/controllers/batch-controller';
import { SerialController } from './presentation/http/controllers/serial-controller';
import { ReservationController } from './presentation/http/controllers/reservation-controller';
import { IntegrationController } from './presentation/http/controllers/integration-controller';
import { ScanController } from './presentation/http/controllers/scan-controller';
import { createEstoqueRoutes } from './presentation/http/routes';

/**
 * Creates and configures the Estoque (Stock/Inventory) bounded context module.
 * Manages warehouses, stock levels, movements, transfers, inventory counts, settings,
 * kits/BOM, production orders, batches, serials, reservations, scans, and integrations.
 *
 * All routes are PROTECTED — auth middleware must be applied externally.
 */
export function createEstoqueModule() {
  const router = new Hono<HonoContext>();

  // DI middleware — create all dependencies per-request from Cloudflare env
  router.use('*', async (c, next) => {
    const db = await createDatabaseConnection(c.env.HYPERDRIVE);

    // Repositories — Base
    const warehouseRepository = new WarehouseRepository(db);
    const stockLevelRepository = new StockLevelRepository(db);
    const stockMovementRepository = new StockMovementRepository(db);
    const stockTransferRepository = new StockTransferRepository(db);
    const inventoryCountRepository = new InventoryCountRepository(db);
    const stockSettingsRepository = new StockSettingsRepository(db);

    // Repositories — Avançado
    const kitRepository = new KitRepository(db);
    const productionOrderRepository = new ProductionOrderRepository(db);
    const batchRepository = new BatchRepository(db);
    const serialRepository = new SerialRepository(db);
    const reservationRepository = new ReservationRepository(db);
    const scanRepository = new ScanRepository(db);

    // Controllers — Base
    const warehouseController = new WarehouseController(warehouseRepository);
    const stockLevelController = new StockLevelController(stockLevelRepository);
    const stockMovementController = new StockMovementController(stockMovementRepository, stockSettingsRepository);
    const stockTransferController = new StockTransferController(stockTransferRepository, stockMovementRepository);
    const inventoryCountController = new InventoryCountController(inventoryCountRepository, stockMovementRepository);
    const stockSettingsController = new StockSettingsController(stockSettingsRepository);

    // Controllers — Avançado
    const kitController = new KitController(kitRepository);
    const productionOrderController = new ProductionOrderController(productionOrderRepository, stockMovementRepository, kitRepository);
    const batchController = new BatchController(batchRepository);
    const serialController = new SerialController(serialRepository);
    const reservationController = new ReservationController(reservationRepository);
    const integrationController = new IntegrationController(stockMovementRepository, kitRepository, reservationRepository);
    const scanController = new ScanController(scanRepository);

    // Set — Base
    c.set('warehouseController' as any, warehouseController);
    c.set('stockLevelController' as any, stockLevelController);
    c.set('stockMovementController' as any, stockMovementController);
    c.set('stockTransferController' as any, stockTransferController);
    c.set('inventoryCountController' as any, inventoryCountController);
    c.set('stockSettingsController' as any, stockSettingsController);

    // Set — Avançado
    c.set('kitController' as any, kitController);
    c.set('productionOrderController' as any, productionOrderController);
    c.set('batchController' as any, batchController);
    c.set('serialController' as any, serialController);
    c.set('reservationController' as any, reservationController);
    c.set('integrationController' as any, integrationController);
    c.set('scanController' as any, scanController);

    await next();
  });

  router.route('/', createEstoqueRoutes());

  return router;
}
