import { pgTable, uuid, varchar, text, timestamp, integer, boolean, real, uniqueIndex, index, jsonb } from 'drizzle-orm/pg-core';
import { tenants } from '../../tenant/infrastructure/schema';
import { users } from '../../auth/infrastructure/schema';
import { clients } from '../../cadastros/infrastructure/schema';

// ============================================================
// DOMÍNIO: CANAIS E CONFIGURAÇÃO
// ============================================================

/** Canais de comunicação integrados (WhatsApp, Instagram, Facebook, E-mail) */
export const channels = pgTable('omni_channels', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  type: text('type', { enum: ['whatsapp', 'instagram', 'facebook', 'email', 'voip', 'web'] }).notNull(),
  status: text('status', { enum: ['active', 'inactive', 'error', 'connecting'] }).notNull().default('inactive'),
  configJson: jsonb('config_json'),
  phoneNumber: varchar('phone_number', { length: 30 }),
  apiCredentialsEncrypted: text('api_credentials_encrypted'),
  webhookUrl: text('webhook_url'),
  isDefault: boolean('is_default').notNull().default(false),
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

/** Horários de atendimento por dia da semana */
export const businessHours = pgTable('omni_business_hours', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(), // 0=Dom, 1=Seg ... 6=Sáb
  isOpen: boolean('is_open').notNull().default(true),
  openTime: varchar('open_time', { length: 5 }), // HH:MM
  closeTime: varchar('close_time', { length: 5 }),
  breakStart: varchar('break_start', { length: 5 }),
  breakEnd: varchar('break_end', { length: 5 }),
  isHoliday: boolean('is_holiday').notNull().default(false),
  holidayName: varchar('holiday_name', { length: 100 }),
  holidayDate: varchar('holiday_date', { length: 10 }), // YYYY-MM-DD
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ============================================================
// DOMÍNIO: CONTATOS E CLASSIFICAÇÃO
// ============================================================

/** Contatos omnichannel — pode vincular ao cadastro ERP */
export const contacts = pgTable('omni_contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  erpCustomerId: uuid('erp_customer_id')
    .references(() => clients.id),
  name: varchar('name', { length: 255 }),
  phone: varchar('phone', { length: 30 }),
  email: varchar('email', { length: 255 }),
  document: varchar('document', { length: 20 }),
  documentType: text('document_type', { enum: ['cpf', 'cnpj'] }),
  companyName: varchar('company_name', { length: 255 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 2 }),
  source: text('source', { enum: ['whatsapp_organic', 'click_to_whatsapp', 'instagram', 'facebook', 'website', 'referral', 'import', 'email'] }),
  leadScore: integer('lead_score').notNull().default(0),
  engagementScore: integer('engagement_score').notNull().default(0),
  ltv: real('ltv').notNull().default(0),
  status: text('status', { enum: ['active', 'inactive', 'blocked'] }).notNull().default('active'),
  lastInteractionAt: timestamp('last_interaction_at', { withTimezone: true }),
  totalConversations: integer('total_conversations').notNull().default(0),
  totalPurchases: integer('total_purchases').notNull().default(0),
  totalSpent: real('total_spent').notNull().default(0),
  hasFinancialPending: boolean('has_financial_pending').notNull().default(false),
  lgpdConsent: boolean('lgpd_consent').notNull().default(false),
  lgpdConsentAt: timestamp('lgpd_consent_at', { withTimezone: true }),
  optInBroadcast: boolean('opt_in_broadcast').notNull().default(false),
  notes: text('notes'),
  metadataJson: jsonb('metadata_json'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
  index('idx_omni_contacts_phone').on(table.tenantId, table.phone),
  index('idx_omni_contacts_document').on(table.tenantId, table.document),
  index('idx_omni_contacts_erp').on(table.tenantId, table.erpCustomerId),
]);

/** Tags para classificar contatos e conversas */
export const tags = pgTable('omni_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull(),
  category: text('category', { enum: ['client_type', 'region', 'interest', 'priority', 'custom'] }),
  color: varchar('color', { length: 7 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Relação N:N contatos ↔ tags */
export const contactTags = pgTable('omni_contact_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  contactId: uuid('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// DOMÍNIO: CONVERSAS E MENSAGENS
// ============================================================

/** Tabela central — cada conversa = sessão de atendimento */
export const conversations = pgTable('omni_conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  contactId: uuid('contact_id')
    .notNull()
    .references(() => contacts.id),
  channelId: uuid('channel_id')
    .notNull()
    .references(() => channels.id),
  queueId: uuid('queue_id')
    .references(() => queues.id),
  assignedTo: uuid('assigned_to'),
  // Integração com CRM existente (Módulo 13)
  crmOpportunityId: uuid('crm_opportunity_id'),
  status: text('status', { enum: ['open', 'waiting', 'ai_handling', 'assigned', 'resolved', 'closed'] }).notNull().default('open'),
  priority: text('priority', { enum: ['urgent', 'high', 'normal', 'low'] }).notNull().default('normal'),
  subject: varchar('subject', { length: 255 }),
  department: text('department', { enum: ['commercial', 'financial', 'support', 'logistics', 'general'] }),
  sentiment: text('sentiment', { enum: ['positive', 'neutral', 'negative', 'frustrated'] }),
  aiResolved: boolean('ai_resolved').notNull().default(false),
  aiSummary: text('ai_summary'),
  aiConfidence: real('ai_confidence'),
  firstResponseAt: timestamp('first_response_at', { withTimezone: true }),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  slaBreached: boolean('sla_breached').notNull().default(false),
  messageCount: integer('message_count').notNull().default(0),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
  lastMessagePreview: varchar('last_message_preview', { length: 200 }),
  isBotActive: boolean('is_bot_active').notNull().default(true),
  transferCount: integer('transfer_count').notNull().default(0),
  metadataJson: jsonb('metadata_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index('idx_omni_conv_contact').on(table.tenantId, table.contactId, table.status),
  index('idx_omni_conv_queue').on(table.tenantId, table.queueId, table.status),
  index('idx_omni_conv_assigned').on(table.tenantId, table.assignedTo, table.status),
  index('idx_omni_conv_status').on(table.tenantId, table.status, table.updatedAt),
  index('idx_omni_conv_last_msg').on(table.tenantId, table.lastMessageAt),
]);

/** Mensagens de todas as conversas */
export const messages = pgTable('omni_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  contactId: uuid('contact_id')
    .references(() => contacts.id),
  senderType: text('sender_type', { enum: ['customer', 'agent', 'ai', 'system'] }).notNull(),
  senderId: uuid('sender_id'),
  senderName: varchar('sender_name', { length: 100 }),
  content: text('content'),
  contentType: text('content_type', { enum: ['text', 'image', 'audio', 'video', 'document', 'location', 'sticker', 'template'] }).notNull().default('text'),
  mediaUrl: text('media_url'),
  mediaMimeType: varchar('media_mime_type', { length: 100 }),
  mediaSizeBytes: integer('media_size_bytes'),
  externalId: text('external_id'),
  status: text('status', { enum: ['pending', 'sent', 'delivered', 'read', 'failed'] }).notNull().default('sent'),
  isInternalNote: boolean('is_internal_note').notNull().default(false),
  aiGenerated: boolean('ai_generated').notNull().default(false),
  aiConfidence: real('ai_confidence'),
  aiSourcesJson: jsonb('ai_sources_json'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  readAt: timestamp('read_at', { withTimezone: true }),
}, (table) => [
  index('idx_omni_msg_conv').on(table.conversationId, table.createdAt),
  index('idx_omni_msg_external').on(table.externalId),
]);

/** Relação N:N conversas ↔ tags */
export const conversationTags = pgTable('omni_conversation_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Histórico de atribuições/transferências de conversas */
export const conversationAssignments = pgTable('omni_conversation_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  assignedTo: uuid('assigned_to').notNull(),
  assignedBy: varchar('assigned_by', { length: 50 }),
  queueId: uuid('queue_id').references(() => queues.id),
  reason: text('reason', { enum: ['auto_route', 'manual_transfer', 'escalation', 'ai_handoff'] }),
  note: text('note'),
  aiSummary: text('ai_summary'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
});

/** Anexos de mídia (armazenados no R2) */
export const attachments = pgTable('omni_attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  messageId: uuid('message_id')
    .notNull()
    .references(() => messages.id, { onDelete: 'cascade' }),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileType: text('file_type', { enum: ['image', 'audio', 'video', 'document', 'other'] }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  r2Key: text('r2_key').notNull(),
  r2Url: text('r2_url').notNull(),
  thumbnailR2Key: text('thumbnail_r2_key'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// DOMÍNIO: FILAS E ROTEAMENTO
// ============================================================

/** Filas de atendimento por departamento */
export const queues = pgTable('omni_queues', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  department: text('department', { enum: ['commercial', 'financial', 'support', 'logistics', 'general'] }).notNull(),
  description: text('description'),
  isDefault: boolean('is_default').notNull().default(false),
  maxConcurrentPerAgent: integer('max_concurrent_per_agent').notNull().default(5),
  routingMethod: text('routing_method', { enum: ['round_robin', 'least_busy', 'manual'] }).notNull().default('least_busy'),
  autoAssign: boolean('auto_assign').notNull().default(true),
  keywordsJson: jsonb('keywords_json'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

/** Membros de cada fila */
export const queueMembers = pgTable('omni_queue_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  queueId: uuid('queue_id')
    .notNull()
    .references(() => queues.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  role: text('role', { enum: ['agent', 'supervisor'] }).notNull().default('agent'),
  isAvailable: boolean('is_available').notNull().default(true),
  currentConversations: integer('current_conversations').notNull().default(0),
  priority: integer('priority').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Regras de SLA por prioridade */
export const slaRules = pgTable('omni_sla_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  priority: text('priority', { enum: ['urgent', 'high', 'normal', 'low'] }).notNull(),
  firstResponseMinutes: integer('first_response_minutes').notNull(),
  resolutionMinutes: integer('resolution_minutes').notNull(),
  escalationAfterMinutes: integer('escalation_after_minutes').notNull(),
  escalationTo: uuid('escalation_to'),
  appliesToQueueId: uuid('applies_to_queue_id').references(() => queues.id),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// DOMÍNIO: CÉREBRO DA IA
// ============================================================

/** Configuração geral do Agente IA — 1 registro por tenant */
export const aiConfig = pgTable('omni_ai_config', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  // Personalidade
  agentName: varchar('agent_name', { length: 50 }).notNull().default('Assistente'),
  tone: text('tone', { enum: ['formal', 'balanced', 'casual'] }).notNull().default('balanced'),
  greetingMessage: text('greeting_message'),
  farewellMessage: text('farewell_message'),
  useEmojis: boolean('use_emojis').notNull().default(true),
  emojiFrequency: text('emoji_frequency', { enum: ['low', 'moderate', 'high'] }).notNull().default('moderate'),
  language: varchar('language', { length: 10 }).notNull().default('pt-BR'),
  // Alçadas e Limites
  maxDiscountPercent: real('max_discount_percent').notNull().default(5.0),
  maxQuoteValue: real('max_quote_value').notNull().default(10000),
  canConfirmDelivery: boolean('can_confirm_delivery').notNull().default(true),
  deliveryMarginDays: integer('delivery_margin_days').notNull().default(1),
  financialDetailLevel: text('financial_detail_level', { enum: ['none', 'exists_only', 'full'] }).notNull().default('exists_only'),
  canSendBoleto: boolean('can_send_boleto').notNull().default(true),
  canScheduleVisit: boolean('can_schedule_visit').notNull().default(false),
  minValueHumanRequired: real('min_value_human_required').notNull().default(50000),
  // Transferência
  frustrationSensitivity: text('frustration_sensitivity', { enum: ['low', 'medium', 'high'] }).notNull().default('medium'),
  maxMessagesBeforeTransfer: integer('max_messages_before_transfer').notNull().default(8),
  transferKeywordsJson: jsonb('transfer_keywords_json'),
  aiHours: text('ai_hours', { enum: ['24h', 'business_hours_only'] }).notNull().default('24h'),
  defaultTransferQueueId: uuid('default_transfer_queue_id').references(() => queues.id),
  transferMessageTemplate: text('transfer_message_template'),
  // Base de conhecimento
  knowledgeSyncFrequency: text('knowledge_sync_frequency', { enum: ['realtime', '1h', '6h', 'daily'] }).notNull().default('1h'),
  // Métricas
  resolutionTargetPercent: integer('resolution_target_percent').notNull().default(60),
  maxResponseTimeSeconds: integer('max_response_time_seconds').notNull().default(5),
  minCsatThreshold: real('min_csat_threshold').notNull().default(4.0),
  reviewPercentage: integer('review_percentage').notNull().default(100),
  learningFromHumans: boolean('learning_from_humans').notNull().default(true),
  // Segurança e LGPD
  rateLimitPerMinute: integer('rate_limit_per_minute').notNull().default(10),
  contentFilterActive: boolean('content_filter_active').notNull().default(true),
  dataRetentionMonths: integer('data_retention_months').notNull().default(12),
  lgpdConsentMessage: text('lgpd_consent_message'),
  allowOptOut: boolean('allow_opt_out').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex('idx_omni_ai_config_tenant').on(table.tenantId),
]);

/** Instruções descritivas (prompts) — Cérebro: regras escritas pela equipe */
export const aiPrompts = pgTable('omni_ai_prompts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['general', 'context', 'department', 'quick_answer', 'restriction'] }).notNull(),
  contextName: varchar('context_name', { length: 100 }),
  department: text('department', { enum: ['commercial', 'financial', 'support', 'logistics'] }),
  instruction: text('instruction').notNull(),
  triggerQuestion: text('trigger_question'),
  priority: integer('priority').notNull().default(100),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index('idx_omni_prompts_type').on(table.tenantId, table.type, table.isActive),
]);

/** Base de conhecimento — Cérebro: URLs, textos, docs, aprendizado */
export const aiKnowledgeItems = pgTable('omni_ai_knowledge_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  source: text('source', { enum: ['manual', 'human_learning', 'faq_detected', 'document_import', 'url_import'] }).notNull(),
  category: text('category', { enum: ['product', 'pricing', 'delivery', 'payment', 'technical', 'policy', 'faq', 'brand', 'general'] }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  // Cérebro: URLs e documentos
  sourceUrl: text('source_url'),
  sourceFileName: varchar('source_file_name', { length: 255 }),
  sourceR2Key: text('source_r2_key'),
  // Aprendizado com humanos
  sourceConversationId: uuid('source_conversation_id'),
  sourceMessageId: uuid('source_message_id'),
  sourceUserId: uuid('source_user_id'),
  isModelResponse: boolean('is_model_response').notNull().default(false),
  // Vetorização (Vectorize/RAG)
  vectorizeId: text('vectorize_id'),
  isIndexed: boolean('is_indexed').notNull().default(false),
  // Efetividade
  usageCount: integer('usage_count').notNull().default(0),
  effectivenessScore: real('effectiveness_score'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index('idx_omni_knowledge_cat').on(table.tenantId, table.category, table.isActive),
]);

/** Feedback dos atendentes sobre respostas da IA — aprendizado contínuo */
export const aiFeedback = pgTable('omni_ai_feedback', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  messageId: uuid('message_id')
    .notNull()
    .references(() => messages.id),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id),
  reviewerId: uuid('reviewer_id').notNull(),
  rating: text('rating', { enum: ['correct', 'incorrect', 'partially_correct'] }).notNull(),
  correction: text('correction'),
  feedbackNote: text('feedback_note'),
  wasProcessed: boolean('was_processed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_omni_feedback_pending').on(table.tenantId, table.wasProcessed),
]);

// ============================================================
// DOMÍNIO: MÉTRICAS
// ============================================================

/** Pesquisa de satisfação (CSAT) pós-atendimento */
export const csatResponses = pgTable('omni_csat_responses', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id),
  contactId: uuid('contact_id')
    .notNull()
    .references(() => contacts.id),
  agentId: uuid('agent_id'),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  wasAiOnly: boolean('was_ai_only').notNull().default(false),
  channel: text('channel', { enum: ['whatsapp', 'instagram', 'facebook', 'email', 'web'] }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// DOMÍNIO: AUDITORIA
// ============================================================

/** Log de auditoria — todas as ações sensíveis */
export const auditLog = pgTable('omni_audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id'),
  action: text('action', { enum: ['create', 'update', 'delete', 'view', 'export', 'transfer', 'escalate', 'ai_response', 'config_change'] }).notNull(),
  entityType: text('entity_type', { enum: ['conversation', 'message', 'contact', 'opportunity', 'ai_config', 'ai_prompt', 'knowledge_item', 'queue'] }).notNull(),
  entityId: uuid('entity_id').notNull(),
  changesJson: jsonb('changes_json'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_omni_audit_entity').on(table.tenantId, table.entityType, table.entityId),
  index('idx_omni_audit_date').on(table.tenantId, table.createdAt),
]);
