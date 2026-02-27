import { pgTable, uuid, varchar, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { tenants } from '../../tenant/infrastructure/schema';

// ==================== Fiscal Config (Configurações Fiscais por Tenant) ====================
export const fiscalConfig = pgTable('fiscal_config', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' })
    .unique(),

  // Empresa
  cnpjEmpresa: varchar('cnpj_empresa', { length: 14 }),
  ieEmpresa: varchar('ie_empresa', { length: 20 }),
  razaoSocial: varchar('razao_social', { length: 500 }),
  regimeTributario: text('regime_tributario', {
    enum: ['simples_nacional', 'lucro_presumido', 'lucro_real'],
  }),
  ufEmpresa: varchar('uf_empresa', { length: 2 }),
  codigoMunicipioIbge: varchar('codigo_municipio_ibge', { length: 7 }),

  // DF-e Inbox
  inboxSyncAutomatico: boolean('inbox_sync_automatico').default(true),
  inboxIntervaloMinutos: integer('inbox_intervalo_minutos').default(60),
  inboxManifestacaoAutomatica: boolean('inbox_manifestacao_automatica').default(false),
  inboxTipoManifestacaoAuto: text('inbox_tipo_manifestacao_auto').default('ciencia'),

  // Emissão
  emissaoAmbiente: text('emissao_ambiente', { enum: ['homologacao', 'producao'] }).default('homologacao'),
  emissaoSerieNfe: integer('emissao_serie_nfe').default(1),
  emissaoSerieNfse: integer('emissao_serie_nfse').default(1),
  emissaoSerieCte: integer('emissao_serie_cte').default(1),

  // GNRE
  gnreGeracaoAutomatica: boolean('gnre_geracao_automatica').default(false),

  // ADRC-ST
  adrcstOpcaoRecuperacao: boolean('adrcst_opcao_recuperacao').default(true),
  adrcstOpcaoRessarcimento: boolean('adrcst_opcao_ressarcimento').default(true),
  adrcstOpcaoComplementacao: boolean('adrcst_opcao_complementacao').default(true),

  // Onboarding
  onboardingCompleto: boolean('onboarding_completo').default(false),
  onboardingEtapaAtual: integer('onboarding_etapa_atual').default(0),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Fiscal Audit Log (Auditoria Fiscal) ====================
export const fiscalAuditLog = pgTable('fiscal_audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id'),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  details: jsonb('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ==================== Fiscal Digital Certificates (Certificados Digitais A1) ====================
export const fiscalDigitalCertificates = pgTable('fiscal_digital_certificates', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  cnpj: varchar('cnpj', { length: 14 }).notNull(),
  razaoSocial: varchar('razao_social', { length: 500 }),
  tipo: text('tipo', { enum: ['a1', 'a3'] }).default('a1'),
  dataValidade: timestamp('data_validade', { withTimezone: true }),
  r2Key: varchar('r2_key', { length: 200 }),
  nuvemFiscalCertId: varchar('nuvem_fiscal_cert_id', { length: 100 }),
  ativo: boolean('ativo').default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
