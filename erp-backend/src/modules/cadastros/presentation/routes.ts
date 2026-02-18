import { Hono } from 'hono';
import type { HonoContext } from '../../../shared/cloudflare/types';
import type { ClientController } from './controllers/client-controller';
import type { SupplierController } from './controllers/supplier-controller';
import type { PartnerController } from './controllers/partner-controller';
import type { EmployeeController } from './controllers/employee-controller';

export function createCadastrosRoutes(
  clientController: ClientController,
  supplierController: SupplierController,
  partnerController: PartnerController,
  employeeController: EmployeeController
) {
  const router = new Hono<HonoContext>();

  // Clientes
  router.get('/clientes', (c) => clientController.list(c));
  router.post('/clientes', (c) => clientController.create(c));
  router.get('/clientes/:id', (c) => clientController.getById(c));
  router.put('/clientes/:id', (c) => clientController.update(c));
  router.delete('/clientes/:id', (c) => clientController.remove(c));

  // Fornecedores
  router.get('/fornecedores', (c) => supplierController.list(c));
  router.post('/fornecedores', (c) => supplierController.create(c));
  router.get('/fornecedores/:id', (c) => supplierController.getById(c));
  router.put('/fornecedores/:id', (c) => supplierController.update(c));
  router.delete('/fornecedores/:id', (c) => supplierController.remove(c));

  // Parceiros
  router.get('/parceiros', (c) => partnerController.list(c));
  router.post('/parceiros', (c) => partnerController.create(c));
  router.get('/parceiros/:id', (c) => partnerController.getById(c));
  router.put('/parceiros/:id', (c) => partnerController.update(c));
  router.delete('/parceiros/:id', (c) => partnerController.remove(c));

  // Colaboradores
  router.get('/colaboradores', (c) => employeeController.list(c));
  router.post('/colaboradores', (c) => employeeController.create(c));
  router.get('/colaboradores/:id', (c) => employeeController.getById(c));
  router.put('/colaboradores/:id', (c) => employeeController.update(c));
  router.delete('/colaboradores/:id', (c) => employeeController.remove(c));

  return router;
}
