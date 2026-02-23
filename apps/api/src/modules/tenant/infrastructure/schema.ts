import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

// Tenants table
export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  subdomain: varchar('subdomain', { length: 100 }).notNull().unique(),
  status: text('status', { enum: ['active', 'suspended', 'cancelled'] })
    .notNull()
    .default('active'),
  plan: text('plan', { enum: ['free', 'starter', 'professional', 'enterprise'] })
    .notNull()
    .default('free'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
