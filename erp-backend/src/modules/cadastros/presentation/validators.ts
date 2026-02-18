// Re-export cadastros schemas from @erp/shared
export {
  createClientSchema,
  updateClientSchema,
  createSupplierSchema,
  updateSupplierSchema,
  createPartnerSchema,
  updatePartnerSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
} from '@erp/shared';

// Re-export common schemas
export { paginationSchema, idParamSchema } from '@erp/shared';
