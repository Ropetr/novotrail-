import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { tenants } from '../../../tenant/infrastructure/schema';
import { clients } from '../../../cadastros/infrastructure/schema';

// ==================== Documentos Fiscais Emitidos ====================
export const dfeEmitidos = pgTable(
  'dfe_emitidos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    // --- Tipo ---
    tipo: text('tipo', {
      enum: ['nfe', 'nfce', 'nfse', 'cte'],
    }).notNull(),

    // --- Identificação ---
    chaveAcesso: varchar('chave_acesso', { length: 44 }),
    numero: integer('numero').notNull(),
    serie: integer('serie').notNull(),
    dataEmissao: timestamp('data_emissao', { withTimezone: true }).notNull(),
    naturezaOperacao: varchar('natureza_operacao', { length: 200 }).notNull(),
    cfopPrincipal: varchar('cfop_principal', { length: 4 }).notNull(),

    // --- Destinatário ---
    destinatarioCpfCnpj: varchar('destinatario_cpf_cnpj', { length: 14 }),
    destinatarioRazaoSocial: varchar('destinatario_razao_social', { length: 500 }),
    destinatarioIe: varchar('destinatario_ie', { length: 50 }),
    destinatarioUf: varchar('destinatario_uf', { length: 2 }),
    clientId: uuid('client_id').references(() => clients.id),

    // --- Valores ---
    valorProdutos: numeric('valor_produtos', { precision: 15, scale: 2 }).notNull(),
    valorFrete: numeric('valor_frete', { precision: 15, scale: 2 }).default('0'),
    valorSeguro: numeric('valor_seguro', { precision: 15, scale: 2 }).default('0'),
    valorDesconto: numeric('valor_desconto', { precision: 15, scale: 2 }).default('0'),
    valorOutros: numeric('valor_outros', { precision: 15, scale: 2 }).default('0'),
    valorTotal: numeric('valor_total', { precision: 15, scale: 2 }).notNull(),

    // --- Impostos Totais ---
    icmsBase: numeric('icms_base', { precision: 15, scale: 2 }).default('0'),
    icmsValor: numeric('icms_valor', { precision: 15, scale: 2 }).default('0'),
    icmsStBase: numeric('icms_st_base', { precision: 15, scale: 2 }).default('0'),
    icmsStValor: numeric('icms_st_valor', { precision: 15, scale: 2 }).default('0'),
    ipiValor: numeric('ipi_valor', { precision: 15, scale: 2 }).default('0'),
    pisValor: numeric('pis_valor', { precision: 15, scale: 2 }).default('0'),
    cofinsValor: numeric('cofins_valor', { precision: 15, scale: 2 }).default('0'),
    issValor: numeric('iss_valor', { precision: 15, scale: 2 }).default('0'),

    // --- Status / Ciclo de Vida ---
    status: text('status', {
      enum: [
        'rascunho',         // Em edição
        'validando',        // Pré-validação em andamento
        'aguardando_envio', // Validado, aguardando envio
        'enviado',          // Enviado para SEFAZ/Nuvem Fiscal
        'autorizado',       // Autorizado pela SEFAZ
        'rejeitado',        // Rejeitado pela SEFAZ
        'cancelado',        // Cancelado
        'inutilizado',      // Número inutilizado
        'denegado',         // Denegado pela SEFAZ
      ],
    })
      .notNull()
      .default('rascunho'),
    motivoRejeicao: text('motivo_rejeicao'),
    codigoRejeicao: varchar('codigo_rejeicao', { length: 10 }),

    // --- Protocolo SEFAZ ---
    protocoloAutorizacao: varchar('protocolo_autorizacao', { length: 50 }),
    dataAutorizacao: timestamp('data_autorizacao', { withTimezone: true }),

    // --- NFS-e Específico ---
    nfseCodigoServico: varchar('nfse_codigo_servico', { length: 20 }),
    nfseDescricaoServico: text('nfse_descricao_servico'),
    nfseMunicipioIbge: varchar('nfse_municipio_ibge', { length: 7 }),
    nfseNumeroRps: integer('nfse_numero_rps'),
    nfseSerieRps: varchar('nfse_serie_rps', { length: 10 }),

    // --- CT-e Específico ---
    cteModal: text('cte_modal', {
      enum: ['rodoviario', 'aereo', 'aquaviario', 'ferroviario', 'dutoviario', 'multimodal'],
    }),
    cteTipoServico: text('cte_tipo_servico', {
      enum: ['normal', 'subcontratacao', 'redespacho', 'redespacho_intermediario', 'multimodal'],
    }),

    // --- XML e PDF ---
    xmlAutorizado: text('xml_autorizado'),
    pdfUrl: varchar('pdf_url', { length: 1000 }),

    // --- Nuvem Fiscal ---
    nuvemFiscalId: varchar('nuvem_fiscal_id', { length: 100 }),

    // --- Vinculações ---
    saleId: uuid('sale_id'), // FK futura para módulo comercial
    pedidoCompraId: uuid('pedido_compra_id'), // FK futura para módulo compras

    // --- Payload original enviado ---
    payloadEnvio: jsonb('payload_envio'),

    // --- Timestamps ---
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    chaveAcessoIdx: uniqueIndex('dfe_emitidos_chave_idx').on(table.tenantId, table.chaveAcesso),
    statusIdx: index('dfe_emitidos_status_idx').on(table.tenantId, table.status),
    tipoIdx: index('dfe_emitidos_tipo_idx').on(table.tenantId, table.tipo),
    dataIdx: index('dfe_emitidos_data_idx').on(table.tenantId, table.dataEmissao),
    clientIdx: index('dfe_emitidos_client_idx').on(table.tenantId, table.clientId),
  })
);

// ==================== Itens dos Documentos Emitidos ====================
export const dfeEmitidoItems = pgTable(
  'dfe_emitido_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    documentId: uuid('document_id')
      .notNull()
      .references(() => dfeEmitidos.id, { onDelete: 'cascade' }),

    // --- Item ---
    nItem: integer('n_item').notNull(),
    productId: uuid('product_id'),
    codigoProduto: varchar('codigo_produto', { length: 60 }).notNull(),
    descricao: varchar('descricao', { length: 500 }).notNull(),
    ncm: varchar('ncm', { length: 8 }).notNull(),
    cest: varchar('cest', { length: 7 }),
    cfop: varchar('cfop', { length: 4 }).notNull(),
    unidade: varchar('unidade', { length: 10 }).notNull(),
    ean: varchar('ean', { length: 14 }),

    // --- Valores ---
    quantidade: numeric('quantidade', { precision: 15, scale: 4 }).notNull(),
    valorUnitario: numeric('valor_unitario', { precision: 15, scale: 6 }).notNull(),
    valorTotal: numeric('valor_total', { precision: 15, scale: 2 }).notNull(),
    valorDesconto: numeric('valor_desconto', { precision: 15, scale: 2 }).default('0'),
    valorFrete: numeric('valor_frete', { precision: 15, scale: 2 }).default('0'),

    // --- ICMS ---
    icmsOrigem: varchar('icms_origem', { length: 1 }).default('0'),
    icmsCst: varchar('icms_cst', { length: 3 }),
    icmsBase: numeric('icms_base', { precision: 15, scale: 2 }),
    icmsAliquota: numeric('icms_aliquota', { precision: 5, scale: 2 }),
    icmsValor: numeric('icms_valor', { precision: 15, scale: 2 }),
    icmsStBase: numeric('icms_st_base', { precision: 15, scale: 2 }),
    icmsStAliquota: numeric('icms_st_aliquota', { precision: 5, scale: 2 }),
    icmsStValor: numeric('icms_st_valor', { precision: 15, scale: 2 }),

    // --- IPI ---
    ipiCst: varchar('ipi_cst', { length: 2 }),
    ipiBase: numeric('ipi_base', { precision: 15, scale: 2 }),
    ipiAliquota: numeric('ipi_aliquota', { precision: 5, scale: 2 }),
    ipiValor: numeric('ipi_valor', { precision: 15, scale: 2 }),

    // --- PIS ---
    pisCst: varchar('pis_cst', { length: 2 }),
    pisBase: numeric('pis_base', { precision: 15, scale: 2 }),
    pisAliquota: numeric('pis_aliquota', { precision: 5, scale: 4 }),
    pisValor: numeric('pis_valor', { precision: 15, scale: 2 }),

    // --- COFINS ---
    cofinsCst: varchar('cofins_cst', { length: 2 }),
    cofinsBase: numeric('cofins_base', { precision: 15, scale: 2 }),
    cofinsAliquota: numeric('cofins_aliquota', { precision: 5, scale: 4 }),
    cofinsValor: numeric('cofins_valor', { precision: 15, scale: 2 }),

    // --- Timestamps ---
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    documentIdx: index('dfe_emitido_items_doc_idx').on(table.documentId),
  })
);

// ==================== Eventos dos Documentos Emitidos ====================
export const dfeEmitidoEvents = pgTable('dfe_emitido_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  documentId: uuid('document_id')
    .notNull()
    .references(() => dfeEmitidos.id, { onDelete: 'cascade' }),

  // --- Evento ---
  tipoEvento: text('tipo_evento', {
    enum: ['cancelamento', 'carta_correcao', 'inutilizacao'],
  }).notNull(),
  sequenciaEvento: integer('sequencia_evento').notNull().default(1),

  // --- Dados ---
  justificativa: text('justificativa'),
  correcao: text('correcao'), // Texto da CC-e
  protocoloEvento: varchar('protocolo_evento', { length: 50 }),
  dataEvento: timestamp('data_evento', { withTimezone: true }),
  codigoStatus: integer('codigo_status'),
  motivoStatus: text('motivo_status'),
  sucesso: boolean('sucesso').notNull().default(false),

  // --- Inutilização ---
  inutNumeroInicial: integer('inut_numero_inicial'),
  inutNumeroFinal: integer('inut_numero_final'),
  inutSerie: integer('inut_serie'),

  // --- XML ---
  xmlEvento: text('xml_evento'),

  // --- Nuvem Fiscal ---
  nuvemFiscalEventoId: varchar('nuvem_fiscal_evento_id', { length: 100 }),

  userId: uuid('user_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
