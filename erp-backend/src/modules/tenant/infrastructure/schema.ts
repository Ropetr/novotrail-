import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Tenants table
export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  subdomain: text('subdomain').notNull().unique(),
  status: text('status', { enum: ['active', 'suspended', 'cancelled'] })
    .notNull()
    .default('active'),
  plan: text('plan', { enum: ['free', 'starter', 'professional', 'enterprise'] })
    .notNull()
    .default('free'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});
