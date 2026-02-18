import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createDatabaseConnection } from '../../shared/database/connection';

// Repositories
import { ClientRepository } from './infrastructure/repositories/client-repository';
import { SupplierRepository } from './infrastructure/repositories/supplier-repository';
import { PartnerRepository } from './infrastructure/repositories/partner-repository';
import { EmployeeRepository } from './infrastructure/repositories/employee-repository';

// Controllers
import { ClientController } from './presentation/controllers/client-controller';
import { SupplierController } from './presentation/controllers/supplier-controller';
import { PartnerController } from './presentation/controllers/partner-controller';
import { EmployeeController } from './presentation/controllers/employee-controller';

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
    const db = createDatabaseConnection(c.env.DB);

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

  const getClientCtrl = (c: any) => c.get('clientController') as unknown as ClientController;
  const getSupplierCtrl = (c: any) => c.get('supplierController') as unknown as SupplierController;
  const getPartnerCtrl = (c: any) => c.get('partnerController') as unknown as PartnerController;
  const getEmployeeCtrl = (c: any) => c.get('employeeController') as unknown as EmployeeController;

  // Clientes routes
  router.get('/clientes', (c) => getClientCtrl(c).list(c));
  router.post('/clientes', (c) => getClientCtrl(c).create(c));
  router.get('/clientes/:id', (c) => getClientCtrl(c).getById(c));
  router.put('/clientes/:id', (c) => getClientCtrl(c).update(c));
  router.delete('/clientes/:id', (c) => getClientCtrl(c).remove(c));

  // Fornecedores routes
  router.get('/fornecedores', (c) => getSupplierCtrl(c).list(c));
  router.post('/fornecedores', (c) => getSupplierCtrl(c).create(c));
  router.get('/fornecedores/:id', (c) => getSupplierCtrl(c).getById(c));
  router.put('/fornecedores/:id', (c) => getSupplierCtrl(c).update(c));
  router.delete('/fornecedores/:id', (c) => getSupplierCtrl(c).remove(c));

  // Parceiros routes
  router.get('/parceiros', (c) => getPartnerCtrl(c).list(c));
  router.post('/parceiros', (c) => getPartnerCtrl(c).create(c));
  router.get('/parceiros/:id', (c) => getPartnerCtrl(c).getById(c));
  router.put('/parceiros/:id', (c) => getPartnerCtrl(c).update(c));
  router.delete('/parceiros/:id', (c) => getPartnerCtrl(c).remove(c));

  // Colaboradores routes
  router.get('/colaboradores', (c) => getEmployeeCtrl(c).list(c));
  router.post('/colaboradores', (c) => getEmployeeCtrl(c).create(c));
  router.get('/colaboradores/:id', (c) => getEmployeeCtrl(c).getById(c));
  router.put('/colaboradores/:id', (c) => getEmployeeCtrl(c).update(c));
  router.delete('/colaboradores/:id', (c) => getEmployeeCtrl(c).remove(c));

  return router;
}

// Re-export domain contracts for inter-module communication
export type { IClientRepository, ISupplierRepository, IPartnerRepository, IEmployeeRepository } from './domain/repositories';
export { ClientRepository } from './infrastructure/repositories/client-repository';
export { SupplierRepository } from './infrastructure/repositories/supplier-repository';
export { PartnerRepository } from './infrastructure/repositories/partner-repository';
export { EmployeeRepository } from './infrastructure/repositories/employee-repository';
export { clients, suppliers, partners, employees } from './infrastructure/schema';
