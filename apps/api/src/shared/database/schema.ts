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
export { quotes, quoteItems, sales, saleItems, returns, returnItems } from '../../modules/comercial/infrastructure/schema';
