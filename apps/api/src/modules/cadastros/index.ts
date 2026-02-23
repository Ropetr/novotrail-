export { createCadastrosModule } from './module';
export type {
  IClientRepository,
  ISupplierRepository,
  IPartnerRepository,
  IEmployeeRepository,
} from './domain/repositories';
export { ClientRepository } from './infrastructure/repositories/client-repository';
export { SupplierRepository } from './infrastructure/repositories/supplier-repository';
export { PartnerRepository } from './infrastructure/repositories/partner-repository';
export { EmployeeRepository } from './infrastructure/repositories/employee-repository';
export { clients, suppliers, partners, employees } from './infrastructure/schema';
