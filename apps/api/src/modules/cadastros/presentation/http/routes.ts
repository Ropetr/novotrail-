import { Hono } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';
import type { ClientController } from './controllers/client-controller';
import type { SupplierController } from './controllers/supplier-controller';
import type { PartnerController } from './controllers/partner-controller';
import type { EmployeeController } from './controllers/employee-controller';

export function createCadastrosRoutes() {
  const router = new Hono<HonoContext>();
  const getClientCtrl = (c: any) => c.get('clientController') as ClientController;
  const getSupplierCtrl = (c: any) => c.get('supplierController') as SupplierController;
  const getPartnerCtrl = (c: any) => c.get('partnerController') as PartnerController;
  const getEmployeeCtrl = (c: any) => c.get('employeeController') as EmployeeController;

  // Clientes
  router.get('/clientes', (c) => getClientCtrl(c).list(c));
  router.post('/clientes', (c) => getClientCtrl(c).create(c));
  router.get('/clientes/:id', (c) => getClientCtrl(c).getById(c));
  router.put('/clientes/:id', (c) => getClientCtrl(c).update(c));
  router.delete('/clientes/:id', (c) => getClientCtrl(c).remove(c));

  // Fornecedores
  router.get('/fornecedores', (c) => getSupplierCtrl(c).list(c));
  router.post('/fornecedores', (c) => getSupplierCtrl(c).create(c));
  router.get('/fornecedores/:id', (c) => getSupplierCtrl(c).getById(c));
  router.put('/fornecedores/:id', (c) => getSupplierCtrl(c).update(c));
  router.delete('/fornecedores/:id', (c) => getSupplierCtrl(c).remove(c));

  // Parceiros
  router.get('/parceiros', (c) => getPartnerCtrl(c).list(c));
  router.post('/parceiros', (c) => getPartnerCtrl(c).create(c));
  router.get('/parceiros/:id', (c) => getPartnerCtrl(c).getById(c));
  router.put('/parceiros/:id', (c) => getPartnerCtrl(c).update(c));
  router.delete('/parceiros/:id', (c) => getPartnerCtrl(c).remove(c));

  // Colaboradores
  router.get('/colaboradores', (c) => getEmployeeCtrl(c).list(c));
  router.post('/colaboradores', (c) => getEmployeeCtrl(c).create(c));
  router.get('/colaboradores/:id', (c) => getEmployeeCtrl(c).getById(c));
  router.put('/colaboradores/:id', (c) => getEmployeeCtrl(c).update(c));
  router.delete('/colaboradores/:id', (c) => getEmployeeCtrl(c).remove(c));

  return router;
}
