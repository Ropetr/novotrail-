import { pgTable, uuid, varchar, text, timestamp, numeric, integer, boolean } from 'drizzle-orm/pg-core';
import { tenants } from '../../tenant/infrastructure/schema';
import { clients } from '../../cadastros/infrastructure/schema';
import { employees } from '../../cadastros/infrastructure/schema';

// ==================== CRM Pipeline Stages ====================
// RN-01: 5 estágios padrão + Ganho/Perdido. Customizável pelo tenant.
export const crmPipelineStages = pgTable('crm_pipeline_stages', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  order: integer('order').notNull().default(0),
  probability: integer('probability').notNull().default(0), // 0-100
  color: varchar('color', { length: 20 }).notNull().default('#6b7280'),
  isDefault: boolean('is_default').notNull().default(false),
  isWon: boolean('is_won').notNull().default(false),
  isLost: boolean('is_lost').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== CRM Opportunities ====================
// Oportunidades de venda no pipeline. Vinculada a cliente e vendedor.
export const crmOpportunities = pgTable('crm_opportunities', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id),
  contactName: varchar('contact_name', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 30 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  sellerId: uuid('seller_id')
    .references(() => employees.id),
  stageId: uuid('stage_id')
    .notNull()
    .references(() => crmPipelineStages.id),
  status: text('status', { enum: ['open', 'won', 'lost'] })
    .notNull()
    .default('open'),
  estimatedValue: numeric('estimated_value', { precision: 12, scale: 2 }).notNull().default('0'),
  probability: integer('probability').notNull().default(0),
  expectedCloseDate: timestamp('expected_close_date', { withTimezone: true }),
  actualCloseDate: timestamp('actual_close_date', { withTimezone: true }),
  source: varchar('source', { length: 50 }), // site, indicacao, telefone, whatsapp, feira, instagram, facebook
  sourceDetail: text('source_detail'),
  lossReason: text('loss_reason'),
  tags: text('tags'), // comma-separated
  notes: text('notes'),
  lastActivityAt: timestamp('last_activity_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== CRM Activities ====================
// Histórico de interações: ligação, e-mail, WhatsApp, visita, reunião, tarefa, nota.
export const crmActivities = pgTable('crm_activities', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  opportunityId: uuid('opportunity_id')
    .references(() => crmOpportunities.id, { onDelete: 'cascade' }),
  clientId: uuid('client_id')
    .references(() => clients.id),
  type: text('type', { enum: ['call', 'email', 'whatsapp', 'visit', 'meeting', 'task', 'note'] })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  status: text('status', { enum: ['pending', 'completed', 'cancelled'] })
    .notNull()
    .default('pending'),
  result: text('result'),
  userId: uuid('user_id'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== CRM Scoring Rules ====================
// RN-04: Score calculado sob demanda. Regras configuráveis pelo tenant.
export const crmScoringRules = pgTable('crm_scoring_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  ruleType: text('rule_type', {
    enum: ['purchase_frequency', 'purchase_volume', 'overdue_payment', 'inactivity', 'engagement', 'custom'],
  }).notNull(),
  condition: text('condition').notNull(), // JSON string with rule parameters
  points: integer('points').notNull(), // positive = add, negative = subtract
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
