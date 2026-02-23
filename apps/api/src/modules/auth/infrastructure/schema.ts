import { pgTable, uuid, varchar, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { tenants } from '../../tenant/infrastructure/schema';

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: text('role', { enum: ['admin', 'manager', 'user'] })
    .notNull()
    .default('user'),
  status: text('status', { enum: ['active', 'inactive'] })
    .notNull()
    .default('active'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex('idx_users_email_tenant').on(table.email, table.tenantId),
]);

// Backward compat export (was raw SQL, now proper index above)
export const uniqueEmailPerTenant = null;
