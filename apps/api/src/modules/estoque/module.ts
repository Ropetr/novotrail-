import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createDatabaseConnection } from '../../shared/database/connection';

// Repositories
import { WarehouseRepository } from './infrastructure/repositories/warehouse-repository';
import { StockLevelRepository } from './infrastructure/repositories/stock-level-repository';
import { StockMovementRepository } from './infrastructure/repositories/stock-movement-repository';
import { InventoryCountRepository } from './infrastructure/repositories/inventory-count-repository';

// Controllers
import { WarehouseController } from './presentation/http/controllers/warehouse-controller';
import { StockController } from './presentation/http/controllers/stock-controller';
import { InventoryController } from './presentation/http/controllers/inventory-controller';

import { createEstoqueRoutes } from './presentation/http/routes';

/**
 * Creates and configures the Estoque (Stock) bounded context module.
 * Manages warehouses, stock levels, movements, inventory counts, and settings.
 *
 * All routes are PROTECTED — auth middleware must be applied externally.
 *
 * Features:
 *   - Warehouses: CRUD de depósitos (main, branch, transit, defective)
 *   - Stock Levels: saldo por produto/depósito com estoque mínimo/máximo
 *   - Movements: histórico imutável de movimentações com custo médio ponderado
 *   - Transfers: transferência entre depósitos (gera 2 movimentações)
 *   - Alerts: produtos abaixo do estoque mínimo
 *   - Inventory: contagem cega com workflow draft → counting → review → approved
 *   - Settings: configurações personalizáveis por tenant (custeio, alertas, automações)
 */
export function createEstoqueModule() {
  const router = new Hono<HonoContext>();

  // DI middleware - create all dependencies per-request from Cloudflare env
  router.use('*', async (c, next) => {
    const db = await createDatabaseConnection(c.env.HYPERDRIVE);

    // Repositories
    const warehouseRepository = new WarehouseRepository(db);
    const stockLevelRepository = new StockLevelRepository(db);
    const stockMovementRepository = new StockMovementRepository(db);
    const inventoryCountRepository = new InventoryCountRepository(db);

    // Controllers
    const warehouseController = new WarehouseController(warehouseRepository);
    const stockController = new StockController(stockLevelRepository, stockMovementRepository);
    const inventoryController = new InventoryController(inventoryCountRepository);

    c.set('warehouseController' as any, warehouseController);
    c.set('stockController' as any, stockController);
    c.set('inventoryController' as any, inventoryController);

    await next();
  });

  router.route('/', createEstoqueRoutes());

  return router;
}
