/**
 * Shared database schema - re-exports all module schemas.
 * This file is the single import point for Drizzle ORM schema objects.
 * Each module owns its own table definitions; this file aggregates them.
 */

// Tenant module schema
export { tenants } from '../../modules/tenant/infrastructure/schema';

// Auth module schema
export { users, uniqueEmailPerTenant } from '../../modules/auth/infrastructure/schema';

// Cadastros module schema
export { clients, suppliers, partners, employees } from '../../modules/cadastros/infrastructure/schema';

// Produtos module schema
export { categories, products } from '../../modules/produtos/infrastructure/schema';

// Comercial module schema
export { quotes, quoteItems, sales, saleItems, salePayments, returns, returnItems } from '../../modules/comercial/infrastructure/schema';

// Configuracoes module schema
export { tenantSettings } from '../../modules/configuracoes/infrastructure/schema';

// CRM module schema
export { crmPipelineStages, crmOpportunities, crmActivities, crmScoringRules } from '../../modules/crm/infrastructure/schema';

// Estoque module schema
export {
  warehouses, stockLevels, stockMovements,
  stockTransfers, stockTransferItems,
  inventoryCounts, inventoryCountItems,
  stockSettings,
} from '../../modules/estoque/infrastructure/schema';

// Omnichannel module schema
export {
  channels, businessHours,
  contacts, tags, contactTags,
  conversations, messages, conversationTags, conversationAssignments, attachments,
  queues, queueMembers, slaRules,
  aiConfig, aiPrompts, aiKnowledgeItems, aiFeedback,
  csatResponses, auditLog,
} from '../../modules/omnichannel/infrastructure/schema';

// Financeiro module schema
export {
  chartOfAccounts, bankAccounts, costCenters,
  financialTitles, financialSettlements,
  financialTransactions, financialLogs,
} from '../../modules/financeiro/infrastructure/schema';
