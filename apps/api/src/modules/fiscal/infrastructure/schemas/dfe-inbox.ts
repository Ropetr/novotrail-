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
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { tenants } from '../../../tenant/infrastructure/schema';
import { products } from '../../../produtos/infrastructure/schema';
import { suppliers } from '../../../cadastros/infrastructure/schema';

// ==================== DF-e Inbox - Documentos Recebidos ====================
export const dfeInboxDocuments = pgTable(
  'dfe_inbox_documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    // --- Tipo de Documento ---
    tipo: text('tipo', {
      enum: ['nfe', 'cte', 'nfse'],
    }).notNull(),

    // --- Identificação ---
    chaveAcesso: varchar('chave_acesso', { length: 44 }),
    numero: integer('numero'),
    serie: integer('serie'),
    dataEmissao: timestamp('data_emissao', { withTimezone: true }),
    dataRecebimento: timestamp('data_recebimento', { withTimezone: true }).notNull().defaultNow(),

    // --- Emitente ---
    emitenteCnpj: varchar('emitente_cnpj', { length: 14 }).notNull(),
    emitenteRazaoSocial: varchar('emitente_razao_social', { length: 500 }),
    emitenteIe: varchar('emitente_ie', { length: 50 }),
    emitenteUf: varchar('emitente_uf', { length: 2 }),

    // --- Valores ---
    valorTotal: numeric('valor_total', { precision: 15, scale: 2 }),
    valorProdutos: numeric('valor_produtos', { precision: 15, scale: 2 }),
    valorFrete: numeric('valor_frete', { precision: 15, scale: 2 }),
    valorSeguro: numeric('valor_seguro', { precision: 15, scale: 2 }),
    valorDesconto: numeric('valor_desconto', { precision: 15, scale: 2 }),
    valorOutros: numeric('valor_outros', { precision: 15, scale: 2 }),

    // --- Impostos ---
    icmsTotal: numeric('icms_total', { precision: 15, scale: 2 }),
    icmsStTotal: numeric('icms_st_total', { precision: 15, scale: 2 }),
    ipiTotal: numeric('ipi_total', { precision: 15, scale: 2 }),
    pisTotal: numeric('pis_total', { precision: 15, scale: 2 }),
    cofinsTotal: numeric('cofins_total', { precision: 15, scale: 2 }),

    // --- CFOP Principal ---
    cfopPrincipal: varchar('cfop_principal', { length: 4 }),
    naturezaOperacao: varchar('natureza_operacao', { length: 200 }),

    // --- CT-e Específico ---
    cteRemetenteCnpj: varchar('cte_remetente_cnpj', { length: 14 }),
    cteDestinatarioCnpj: varchar('cte_destinatario_cnpj', { length: 14 }),
    ctePlaca: varchar('cte_placa', { length: 8 }),
    cteNfesReferenciadas: jsonb('cte_nfes_referenciadas'), // Array de chaves de acesso

    // --- NFS-e Específico ---
    nfseCodigoServico: varchar('nfse_codigo_servico', { length: 20 }),
    nfseDescricaoServico: text('nfse_descricao_servico'),
    nfseMunicipioIbge: varchar('nfse_municipio_ibge', { length: 7 }),

    // --- Pipeline Status ---
    pipelineStatus: text('pipeline_status', {
      enum: [
        'capturado',        // Recém-capturado da SEFAZ/Nuvem Fiscal
        'parseado',         // XML parseado com sucesso
        'deduplicado',      // Verificado que não é duplicata
        'matched',          // Produtos vinculados (De-Para)
        'proposta_gerada',  // Proposta de lançamento gerada
        'aprovado',         // Aprovado pelo usuário
        'lancado',          // Lançado no sistema (estoque, financeiro, etc.)
        'rejeitado',        // Rejeitado pelo usuário
        'erro',             // Erro no processamento
      ],
    })
      .notNull()
      .default('capturado'),
    pipelineErro: text('pipeline_erro'),
    pipelineEtapaAtual: integer('pipeline_etapa_atual').notNull().default(1),

    // --- Manifestação ---
    manifestacaoStatus: text('manifestacao_status', {
      enum: ['pendente', 'ciencia', 'confirmada', 'desconhecida', 'nao_realizada'],
    }).default('pendente'),
    manifestacaoData: timestamp('manifestacao_data', { withTimezone: true }),
    manifestacaoProtocolo: varchar('manifestacao_protocolo', { length: 50 }),

    // --- Lançamento ---
    lancado: boolean('lancado').notNull().default(false),
    lancadoEm: timestamp('lancado_em', { withTimezone: true }),
    lancadoPor: uuid('lancado_por'),

    // --- Vinculações ---
    supplierId: uuid('supplier_id').references(() => suppliers.id),
    pedidoCompraId: uuid('pedido_compra_id'), // FK futura para módulo de compras

    // --- XML e PDF ---
    xmlOriginal: text('xml_original'),
    pdfUrl: varchar('pdf_url', { length: 1000 }),

    // --- Nuvem Fiscal ---
    nuvemFiscalDocId: varchar('nuvem_fiscal_doc_id', { length: 100 }),
    nuvemFiscalDistId: varchar('nuvem_fiscal_dist_id', { length: 100 }),

    // --- Origem ---
    origemCaptura: text('origem_captura', {
      enum: ['nuvem_fiscal', 'sefaz_direta', 'padrao_nacional', 'api_municipal', 'scraping', 'manual'],
    }).notNull(),

    // --- Timestamps ---
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    chaveAcessoIdx: uniqueIndex('dfe_inbox_chave_acesso_idx').on(
      table.tenantId,
      table.chaveAcesso
    ),
    emitenteIdx: index('dfe_inbox_emitente_idx').on(table.tenantId, table.emitenteCnpj),
    statusIdx: index('dfe_inbox_status_idx').on(table.tenantId, table.pipelineStatus),
    tipoIdx: index('dfe_inbox_tipo_idx').on(table.tenantId, table.tipo),
    dataIdx: index('dfe_inbox_data_idx').on(table.tenantId, table.dataEmissao),
  })
);

// ==================== DF-e Inbox - Itens do Documento ====================
export const dfeInboxItems = pgTable(
  'dfe_inbox_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    documentId: uuid('document_id')
      .notNull()
      .references(() => dfeInboxDocuments.id, { onDelete: 'cascade' }),

    // --- Dados do Item no XML ---
    nItem: integer('n_item').notNull(),
    codigoProdutoEmitente: varchar('codigo_produto_emitente', { length: 60 }),
    descricao: varchar('descricao', { length: 500 }).notNull(),
    ncm: varchar('ncm', { length: 8 }),
    cest: varchar('cest', { length: 7 }),
    cfop: varchar('cfop', { length: 4 }),
    unidade: varchar('unidade', { length: 10 }),
    ean: varchar('ean', { length: 14 }),

    // --- Valores ---
    quantidade: numeric('quantidade', { precision: 15, scale: 4 }).notNull(),
    valorUnitario: numeric('valor_unitario', { precision: 15, scale: 6 }).notNull(),
    valorTotal: numeric('valor_total', { precision: 15, scale: 2 }).notNull(),
    valorDesconto: numeric('valor_desconto', { precision: 15, scale: 2 }),
    valorFrete: numeric('valor_frete', { precision: 15, scale: 2 }),

    // --- Impostos do Item ---
    icmsBase: numeric('icms_base', { precision: 15, scale: 2 }),
    icmsAliquota: numeric('icms_aliquota', { precision: 5, scale: 2 }),
    icmsValor: numeric('icms_valor', { precision: 15, scale: 2 }),
    icmsCst: varchar('icms_cst', { length: 3 }),
    icmsStBase: numeric('icms_st_base', { precision: 15, scale: 2 }),
    icmsStAliquota: numeric('icms_st_aliquota', { precision: 5, scale: 2 }),
    icmsStValor: numeric('icms_st_valor', { precision: 15, scale: 2 }),
    ipiBase: numeric('ipi_base', { precision: 15, scale: 2 }),
    ipiAliquota: numeric('ipi_aliquota', { precision: 5, scale: 2 }),
    ipiValor: numeric('ipi_valor', { precision: 15, scale: 2 }),
    pisBase: numeric('pis_base', { precision: 15, scale: 2 }),
    pisAliquota: numeric('pis_aliquota', { precision: 5, scale: 4 }),
    pisValor: numeric('pis_valor', { precision: 15, scale: 2 }),
    cofinsBase: numeric('cofins_base', { precision: 15, scale: 2 }),
    cofinsAliquota: numeric('cofins_aliquota', { precision: 5, scale: 4 }),
    cofinsValor: numeric('cofins_valor', { precision: 15, scale: 2 }),

    // --- Matching (De-Para) ---
    matchStatus: text('match_status', {
      enum: ['pendente', 'automatico', 'manual', 'nao_encontrado'],
    })
      .notNull()
      .default('pendente'),
    matchScore: numeric('match_score', { precision: 5, scale: 2 }), // 0-100
    matchMetodo: text('match_metodo', {
      enum: ['codigo_fornecedor', 'ean', 'ncm_fuzzy', 'manual'],
    }),
    productId: uuid('product_id').references(() => products.id),

    // --- Timestamps ---
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    documentIdx: index('dfe_inbox_items_doc_idx').on(table.documentId),
    productIdx: index('dfe_inbox_items_product_idx').on(table.tenantId, table.productId),
    eanIdx: index('dfe_inbox_items_ean_idx').on(table.tenantId, table.ean),
  })
);

// ==================== De-Para de Produtos por Fornecedor ====================
export const supplierProductMapping = pgTable(
  'supplier_product_mapping',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    supplierCnpj: varchar('supplier_cnpj', { length: 14 }).notNull(),
    codigoProdutoFornecedor: varchar('codigo_produto_fornecedor', { length: 60 }).notNull(),
    descricaoProdutoFornecedor: varchar('descricao_produto_fornecedor', { length: 500 }),
    eanFornecedor: varchar('ean_fornecedor', { length: 14 }),
    ncmFornecedor: varchar('ncm_fornecedor', { length: 8 }),
    unidadeFornecedor: varchar('unidade_fornecedor', { length: 10 }),

    // --- Produto Interno Vinculado ---
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    fatorConversao: numeric('fator_conversao', { precision: 10, scale: 4 }).notNull().default('1'),

    // --- Aprendizado ---
    origemVinculo: text('origem_vinculo', {
      enum: ['manual', 'ean', 'ncm_fuzzy', 'automatico'],
    })
      .notNull()
      .default('manual'),
    confianca: numeric('confianca', { precision: 5, scale: 2 }).default('100'),
    vezesUtilizado: integer('vezes_utilizado').notNull().default(1),

    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqueMapping: uniqueIndex('supplier_product_mapping_unique_idx').on(
      table.tenantId,
      table.supplierCnpj,
      table.codigoProdutoFornecedor
    ),
    productIdx: index('supplier_product_mapping_product_idx').on(table.tenantId, table.productId),
  })
);

// ==================== Manifestações do Destinatário ====================
export const dfeManifestations = pgTable('dfe_manifestations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  documentId: uuid('document_id')
    .notNull()
    .references(() => dfeInboxDocuments.id, { onDelete: 'cascade' }),
  chaveAcesso: varchar('chave_acesso', { length: 44 }).notNull(),

  // --- Evento ---
  tipoEvento: text('tipo_evento', {
    enum: ['ciencia', 'confirmacao', 'desconhecimento', 'nao_realizada'],
  }).notNull(),
  codigoEvento: varchar('codigo_evento', { length: 6 }).notNull(), // 210200, 210210, 210220, 210240
  justificativa: text('justificativa'),

  // --- Resultado ---
  protocolo: varchar('protocolo', { length: 50 }),
  dataRegistro: timestamp('data_registro', { withTimezone: true }),
  codigoStatus: integer('codigo_status'),
  motivoStatus: text('motivo_status'),
  sucesso: boolean('sucesso').notNull().default(false),

  // --- Origem ---
  automatica: boolean('automatica').notNull().default(false),
  userId: uuid('user_id'),

  // --- Nuvem Fiscal ---
  nuvemFiscalManifId: varchar('nuvem_fiscal_manif_id', { length: 100 }),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ==================== Fila de Processamento ====================
export const dfeProcessingQueue = pgTable(
  'dfe_processing_queue',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    documentId: uuid('document_id')
      .references(() => dfeInboxDocuments.id, { onDelete: 'cascade' }),

    // --- Job ---
    jobType: text('job_type', {
      enum: [
        'captura_nfe',
        'captura_cte',
        'captura_nfse',
        'parse_xml',
        'deduplicacao',
        'matching',
        'manifestacao',
        'lancamento',
      ],
    }).notNull(),
    status: text('status', {
      enum: ['pendente', 'processando', 'concluido', 'erro', 'cancelado'],
    })
      .notNull()
      .default('pendente'),
    prioridade: integer('prioridade').notNull().default(5), // 1=alta, 10=baixa

    // --- Retry ---
    tentativas: integer('tentativas').notNull().default(0),
    maxTentativas: integer('max_tentativas').notNull().default(3),
    proximaTentativa: timestamp('proxima_tentativa', { withTimezone: true }),
    ultimoErro: text('ultimo_erro'),

    // --- Payload ---
    payload: jsonb('payload'), // Dados específicos do job

    // --- Timestamps ---
    iniciadoEm: timestamp('iniciado_em', { withTimezone: true }),
    concluidoEm: timestamp('concluido_em', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    statusIdx: index('dfe_queue_status_idx').on(table.status, table.prioridade),
    tenantIdx: index('dfe_queue_tenant_idx').on(table.tenantId, table.status),
  })
);
