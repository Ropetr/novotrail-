import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createDatabaseConnection } from '../../shared/database/connection';

// Repositories
import { ClientRepository } from './infrastructure/repositories/client-repository';
import { SupplierRepository } from './infrastructure/repositories/supplier-repository';
import { PartnerRepository } from './infrastructure/repositories/partner-repository';
import { EmployeeRepository } from './infrastructure/repositories/employee-repository';

// Controllers
import { ClientController } from './presentation/http/controllers/client-controller';
import { SupplierController } from './presentation/http/controllers/supplier-controller';
import { PartnerController } from './presentation/http/controllers/partner-controller';
import { EmployeeController } from './presentation/http/controllers/employee-controller';
import { createCadastrosRoutes } from './presentation/http/routes';

/**
 * Creates and configures the Cadastros bounded context module.
 * Manages clients, suppliers, partners and employees.
 *
 * All routes are PROTECTED — auth middleware must be applied externally.
 *
 * Dependency graph (Clean Architecture):
 *   Controller -> Repository interfaces
 *                       ^
 *            Infrastructure (implementations)
 */
export function createCadastrosModule() {
  const router = new Hono<HonoContext>();

  // DI middleware - create all dependencies per-request from Cloudflare env
  router.use('*', async (c, next) => {
    const db = await createDatabaseConnection(c.env.HYPERDRIVE);

    // Repositories
    const clientRepository = new ClientRepository(db);
    const supplierRepository = new SupplierRepository(db);
    const partnerRepository = new PartnerRepository(db);
    const employeeRepository = new EmployeeRepository(db);

    // Controllers
    const clientController = new ClientController(clientRepository);
    const supplierController = new SupplierController(supplierRepository);
    const partnerController = new PartnerController(partnerRepository);
    const employeeController = new EmployeeController(employeeRepository);

    c.set('clientController' as any, clientController);
    c.set('supplierController' as any, supplierController);
    c.set('partnerController' as any, partnerController);
    c.set('employeeController' as any, employeeController);

    await next();
  });

  router.route('/', createCadastrosRoutes());

  return router;
}

// Re-export domain contracts for inter-module communication
