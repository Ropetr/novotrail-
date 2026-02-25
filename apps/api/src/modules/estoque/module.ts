import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createDatabaseConnection } from '../../shared/database/connection';

// Repositories
import { WarehouseRepository } from './infrastructure/repositories/warehouse-repository';
import { StockLevelRepository } from './infrastructure/repositories/stock-level-repository';
import { StockMovementRepository } from './infrastructure/repositories/stock-movement-repository';
import { StockTransferRepository } from './infrastructure/repositories/stock-transfer-repository';
import { InventoryCountRepository } from './infrastructure/repositories/inventory-count-repository';
import { StockSettingsRepository } from './infrastructure/repositories/stock-settings-repository';

// Controllers
import { WarehouseController } from './presentation/http/controllers/warehouse-controller';
import { StockLevelController } from './presentation/http/controllers/stock-level-controller';
import { StockMovementController } from './presentation/http/controllers/stock-movement-controller';
import { StockTransferController } from './presentation/http/controllers/stock-transfer-controller';
import { InventoryCountController } from './presentation/http/controllers/inventory-count-controller';
import { StockSettingsController } from './presentation/http/controllers/stock-settings-controller';
import { createEstoqueRoutes } from './presentation/http/routes';

/**
 * Creates and configures the Estoque (Stock/Inventory) bounded context module.
 * Manages warehouses, stock levels, movements, transfers, inventory counts and settings.
 *
 * All routes are PROTECTED — auth middleware must be applied externally.
 *
 * Dependency graph (Clean Architecture):
 *   Controller -> Repository interfaces
 *                       ^
 *            Infrastructure (implementations)
 */
export function createEstoqueModule() {
  const router = new Hono<HonoContext>();

  // DI middleware — create all dependencies per-request from Cloudflare env
  router.use('*', async (c, next) => {
    const db = await createDatabaseConnection(c.env.HYPERDRIVE);

    // Repositories
    const warehouseRepository = new WarehouseRepository(db);
    const stockLevelRepository = new StockLevelRepository(db);
    const stockMovementRepository = new StockMovementRepository(db);
    const stockTransferRepository = new StockTransferRepository(db);
    const inventoryCountRepository = new InventoryCountRepository(db);
    const stockSettingsRepository = new StockSettingsRepository(db);

    // Controllers (com injeção cruzada onde necessário)
    const warehouseController = new WarehouseController(warehouseRepository);
    const stockLevelController = new StockLevelController(stockLevelRepository);
    const stockMovementController = new StockMovementController(stockMovementRepository, stockSettingsRepository);
    const stockTransferController = new StockTransferController(stockTransferRepository, stockMovementRepository);
    const inventoryCountController = new InventoryCountController(inventoryCountRepository, stockMovementRepository);
    const stockSettingsController = new StockSettingsController(stockSettingsRepository);

    c.set('warehouseController' as any, warehouseController);
    c.set('stockLevelController' as any, stockLevelController);
    c.set('stockMovementController' as any, stockMovementController);
    c.set('stockTransferController' as any, stockTransferController);
    c.set('inventoryCountController' as any, inventoryCountController);
    c.set('stockSettingsController' as any, stockSettingsController);

    await next();
  });

  router.route('/', createEstoqueRoutes());

  return router;
}
