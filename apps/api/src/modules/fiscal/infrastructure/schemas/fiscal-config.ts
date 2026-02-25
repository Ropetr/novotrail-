import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { tenants } from '../../../tenant/infrastructure/schema';

// ==================== Configurações Fiscais por Tenant ====================
export const fiscalSettings = pgTable(
  'fiscal_settings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    // --- Nuvem Fiscal ---
    nuvemFiscalClientId: varchar('nuvem_fiscal_client_id', { length: 255 }),
    nuvemFiscalClientSecret: varchar('nuvem_fiscal_client_secret', { length: 255 }),
    nuvemFiscalAmbiente: text('nuvem_fiscal_ambiente', {
      enum: ['producao', 'homologacao'],
    })
      .notNull()
      .default('homologacao'),

    // --- Empresa Fiscal (CNPJ principal) ---
    cnpjPrincipal: varchar('cnpj_principal', { length: 14 }),
    inscricaoEstadual: varchar('inscricao_estadual', { length: 50 }),
    inscricaoMunicipal: varchar('inscricao_municipal', { length: 50 }),
    regimeTributario: text('regime_tributario', {
      enum: ['simples_nacional', 'simples_excesso', 'regime_normal'],
    })
      .notNull()
      .default('regime_normal'),
    crt: integer('crt').notNull().default(3), // 1=SN, 2=SN Excesso, 3=Normal

    // --- DF-e Inbox (Captura) ---
    capturaAutomaticaNfe: boolean('captura_automatica_nfe').notNull().default(true),
    capturaIntervaloHoras: integer('captura_intervalo_horas').notNull().default(1),
    cienciaAutomatica: boolean('ciencia_automatica').notNull().default(false),
    capturaCte: boolean('captura_cte').notNull().default(true),
    capturaNfse: boolean('captura_nfse').notNull().default(false),
    nfseMetodo: text('nfse_metodo', {
      enum: ['padrao_nacional', 'api_municipal', 'scraping', 'manual'],
    }).default('manual'),
    nfseMunicipioIbge: varchar('nfse_municipio_ibge', { length: 7 }),

    // --- Manifestação Automática ---
    manifestacaoAutoFornecedorConfiavel: boolean('manifestacao_auto_fornecedor_confiavel')
      .notNull()
      .default(false),
    manifestacaoAutoTipo: text('manifestacao_auto_tipo', {
      enum: ['ciencia', 'confirmacao'],
    }).default('ciencia'),

    // --- Emissão ---
    serieNfe: integer('serie_nfe').notNull().default(1),
    serieNfce: integer('serie_nfce').notNull().default(1),
    serieNfse: integer('serie_nfse').notNull().default(1),
    serieCte: integer('serie_cte').notNull().default(1),
    proximoNumeroNfe: integer('proximo_numero_nfe').notNull().default(1),
    proximoNumeroNfce: integer('proximo_numero_nfce').notNull().default(1),
    proximoNumeroNfse: integer('proximo_numero_nfse').notNull().default(1),
    proximoNumeroCte: integer('proximo_numero_cte').notNull().default(1),
    cscNfce: varchar('csc_nfce', { length: 100 }),
    cscIdNfce: varchar('csc_id_nfce', { length: 10 }),

    // --- GNRE ---
    gnreHabilitado: boolean('gnre_habilitado').notNull().default(false),

    // --- ADRC-ST ---
    adrcstHabilitado: boolean('adrcst_habilitado').notNull().default(false),
    adrcstOpcaoRecuperacao: text('adrcst_opcao_recuperacao', {
      enum: ['conta_grafica', 'ressarcimento_fornecedor'],
    }).default('conta_grafica'),

    // --- Timestamps ---
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqueTenant: uniqueIndex('fiscal_settings_tenant_idx').on(table.tenantId),
  })
);

// ==================== Certificados Digitais ====================
export const digitalCertificates = pgTable('digital_certificates', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  cpfCnpj: varchar('cpf_cnpj', { length: 14 }).notNull(),
  serialNumber: varchar('serial_number', { length: 100 }),
  issuerName: varchar('issuer_name', { length: 500 }),
  subjectName: varchar('subject_name', { length: 500 }),
  thumbprint: varchar('thumbprint', { length: 100 }),
  notValidBefore: timestamp('not_valid_before', { withTimezone: true }),
  notValidAfter: timestamp('not_valid_after', { withTimezone: true }),
  isActive: boolean('is_active').notNull().default(true),

  // Armazenamento seguro: o PFX é armazenado na Nuvem Fiscal, não no nosso DB
  // Aqui guardamos apenas os metadados para referência
  nuvemFiscalSynced: boolean('nuvem_fiscal_synced').notNull().default(false),
  nuvemFiscalSyncedAt: timestamp('nuvem_fiscal_synced_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Fornecedores Confiáveis (Auto-Manifestação) ====================
export const trustedSuppliers = pgTable(
  'trusted_suppliers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    cnpj: varchar('cnpj', { length: 14 }).notNull(),
    razaoSocial: varchar('razao_social', { length: 500 }),
    autoManifestacao: boolean('auto_manifestacao').notNull().default(true),
    tipoManifestacao: text('tipo_manifestacao', {
      enum: ['ciencia', 'confirmacao'],
    })
      .notNull()
      .default('ciencia'),
    autoLancamento: boolean('auto_lancamento').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqueSupplier: uniqueIndex('trusted_suppliers_tenant_cnpj_idx').on(
      table.tenantId,
      table.cnpj
    ),
  })
);

// ==================== Auditoria Fiscal ====================
export const fiscalAuditLogs = pgTable('fiscal_audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id'),
  action: text('action', {
    enum: [
      'nfe_emitida',
      'nfe_cancelada',
      'nfe_cc',
      'nfe_inutilizada',
      'nfse_emitida',
      'nfse_cancelada',
      'cte_emitido',
      'cte_cancelado',
      'dfe_capturado',
      'dfe_manifestado',
      'dfe_lancado',
      'dfe_rejeitado',
      'gnre_gerada',
      'gnre_paga',
      'adrcst_gerado',
      'certificado_upload',
      'certificado_removido',
      'config_alterada',
    ],
  }).notNull(),
  documentType: text('document_type', {
    enum: ['nfe', 'nfse', 'cte', 'nfce', 'gnre', 'adrcst', 'certificado', 'config'],
  }),
  documentId: varchar('document_id', { length: 100 }),
  chaveAcesso: varchar('chave_acesso', { length: 44 }),
  details: jsonb('details'), // JSON com detalhes adicionais
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
