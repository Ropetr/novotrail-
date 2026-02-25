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
} from 'drizzle-orm/pg-core';
import { tenants } from '../../../tenant/infrastructure/schema';

// ==================== GNRE - Guias de Recolhimento ====================
export const gnreGuias = pgTable(
  'gnre_guias',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    // --- Identificação ---
    ufFavorecida: varchar('uf_favorecida', { length: 2 }).notNull(),
    codigoReceita: varchar('codigo_receita', { length: 10 }).notNull(),
    descricaoReceita: varchar('descricao_receita', { length: 200 }),

    // --- Contribuinte ---
    cpfCnpjContribuinte: varchar('cpf_cnpj_contribuinte', { length: 14 }).notNull(),
    inscricaoEstadual: varchar('inscricao_estadual', { length: 50 }),
    razaoSocial: varchar('razao_social', { length: 500 }),

    // --- Valores ---
    valorPrincipal: numeric('valor_principal', { precision: 15, scale: 2 }).notNull(),
    valorMulta: numeric('valor_multa', { precision: 15, scale: 2 }).default('0'),
    valorJuros: numeric('valor_juros', { precision: 15, scale: 2 }).default('0'),
    valorAtualizacao: numeric('valor_atualizacao', { precision: 15, scale: 2 }).default('0'),
    valorTotal: numeric('valor_total', { precision: 15, scale: 2 }).notNull(),

    // --- Referência ---
    periodoReferencia: varchar('periodo_referencia', { length: 7 }), // YYYY-MM
    dataVencimento: timestamp('data_vencimento', { withTimezone: true }).notNull(),
    dataPagamento: timestamp('data_pagamento', { withTimezone: true }),

    // --- Documento Fiscal Vinculado ---
    chaveAcessoNfe: varchar('chave_acesso_nfe', { length: 44 }),
    numeroNfe: integer('numero_nfe'),

    // --- Tipo de Recolhimento ---
    tipoRecolhimento: text('tipo_recolhimento', {
      enum: ['difal', 'icms_st', 'icms_importacao', 'fecop', 'outros'],
    }).notNull(),

    // --- Status ---
    status: text('status', {
      enum: ['rascunho', 'gerada', 'enviada', 'processando', 'paga', 'rejeitada', 'cancelada'],
    })
      .notNull()
      .default('rascunho'),

    // --- WebService GNRE ---
    numeroControle: varchar('numero_controle', { length: 50 }),
    codigoBarras: varchar('codigo_barras', { length: 100 }),
    linhaDigitavel: varchar('linha_digitavel', { length: 100 }),
    protocoloEnvio: varchar('protocolo_envio', { length: 50 }),
    protocoloConsulta: varchar('protocolo_consulta', { length: 50 }),
    situacaoGuia: varchar('situacao_guia', { length: 50 }),

    // --- XML ---
    xmlEnvio: text('xml_envio'),
    xmlRetorno: text('xml_retorno'),
    pdfGuia: text('pdf_guia'), // Base64 ou URL

    // --- Erros ---
    codigoErro: varchar('codigo_erro', { length: 10 }),
    mensagemErro: text('mensagem_erro'),

    // --- Retry ---
    tentativas: integer('tentativas').notNull().default(0),

    userId: uuid('user_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    statusIdx: index('gnre_guias_status_idx').on(table.tenantId, table.status),
    ufIdx: index('gnre_guias_uf_idx').on(table.tenantId, table.ufFavorecida),
    vencimentoIdx: index('gnre_guias_vencimento_idx').on(table.tenantId, table.dataVencimento),
  })
);

// ==================== ADRC-ST - Controle de Arquivos ====================
export const adrcstArquivos = pgTable(
  'adrcst_arquivos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    // --- Período ---
    competencia: varchar('competencia', { length: 7 }).notNull(), // YYYY-MM
    cnpjEstabelecimento: varchar('cnpj_estabelecimento', { length: 14 }).notNull(),
    inscricaoEstadual: varchar('inscricao_estadual', { length: 50 }).notNull(),

    // --- Tipo ---
    tipoLeiaute: text('tipo_leiaute', {
      enum: ['contribuinte_substituido', 'centro_distribuicao'],
    })
      .notNull()
      .default('contribuinte_substituido'),

    // --- Opções (Registro 0000 campos A11-A14) ---
    opcaoRecuperacao: boolean('opcao_recuperacao').notNull().default(true),
    opcaoRessarcimento: boolean('opcao_ressarcimento').notNull().default(false),
    opcaoComplementacao: boolean('opcao_complementacao').notNull().default(true),
    opcaoRessarcimentoComplementacao: boolean('opcao_ressarcimento_complementacao')
      .notNull()
      .default(false),

    // --- Valores Apurados (Registro 9000) ---
    totalRecuperacao: numeric('total_recuperacao', { precision: 15, scale: 2 }),
    totalRessarcimento: numeric('total_ressarcimento', { precision: 15, scale: 2 }),
    totalComplementacao: numeric('total_complementacao', { precision: 15, scale: 2 }),
    totalProdutosAnalisados: integer('total_produtos_analisados'),
    totalRegistros: integer('total_registros'),

    // --- Status ---
    status: text('status', {
      enum: [
        'rascunho',
        'calculando',
        'calculado',
        'validando',
        'validado',
        'erro_validacao',
        'gerado',
        'transmitido',
      ],
    })
      .notNull()
      .default('rascunho'),

    // --- Validação ---
    errosValidacao: jsonb('erros_validacao'), // Array de erros
    totalErros: integer('total_erros').default(0),
    totalAvisos: integer('total_avisos').default(0),

    // --- Arquivo Gerado ---
    arquivoConteudo: text('arquivo_conteudo'), // Conteúdo do arquivo pipe-delimited
    arquivoHash: varchar('arquivo_hash', { length: 64 }), // SHA-256
    arquivoTamanho: integer('arquivo_tamanho'), // Bytes

    // --- Versão do Manual ---
    versaoLeiaute: varchar('versao_leiaute', { length: 10 }).notNull().default('1.6'),

    userId: uuid('user_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    competenciaIdx: index('adrcst_competencia_idx').on(
      table.tenantId,
      table.competencia,
      table.cnpjEstabelecimento
    ),
    statusIdx: index('adrcst_status_idx').on(table.tenantId, table.status),
  })
);

// ==================== ADRC-ST - Produtos por Competência ====================
export const adrcstProdutos = pgTable(
  'adrcst_produtos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    arquivoId: uuid('arquivo_id')
      .notNull()
      .references(() => adrcstArquivos.id, { onDelete: 'cascade' }),

    // --- Produto (Registro 1000) ---
    ncm: varchar('ncm', { length: 8 }).notNull(),
    cest: varchar('cest', { length: 7 }),
    ean: varchar('ean', { length: 14 }),
    descricaoProduto: varchar('descricao_produto', { length: 500 }).notNull(),
    unidade: varchar('unidade', { length: 10 }).notNull(),

    // --- Entradas do Período ---
    quantidadeEntrada: numeric('quantidade_entrada', { precision: 15, scale: 4 }),
    valorEntrada: numeric('valor_entrada', { precision: 15, scale: 2 }),
    icmsStRetidoEntrada: numeric('icms_st_retido_entrada', { precision: 15, scale: 2 }),
    baseStEntrada: numeric('base_st_entrada', { precision: 15, scale: 2 }),

    // --- Saídas Consumidor Final ---
    quantidadeSaidaCf: numeric('quantidade_saida_cf', { precision: 15, scale: 4 }),
    valorSaidaCf: numeric('valor_saida_cf', { precision: 15, scale: 2 }),
    icmsEfetivoCf: numeric('icms_efetivo_cf', { precision: 15, scale: 2 }),

    // --- Saídas Interestaduais ---
    quantidadeSaidaInter: numeric('quantidade_saida_inter', { precision: 15, scale: 4 }),
    valorSaidaInter: numeric('valor_saida_inter', { precision: 15, scale: 2 }),

    // --- Cálculos ---
    valorRecuperacao: numeric('valor_recuperacao', { precision: 15, scale: 2 }),
    valorRessarcimento: numeric('valor_ressarcimento', { precision: 15, scale: 2 }),
    valorComplementacao: numeric('valor_complementacao', { precision: 15, scale: 2 }),

    // --- FECOP ---
    fecopRetido: numeric('fecop_retido', { precision: 15, scale: 2 }),
    fecopEfetivo: numeric('fecop_efetivo', { precision: 15, scale: 2 }),

    // --- Dados auxiliares ---
    detalhesEntradas: jsonb('detalhes_entradas'), // NF-e de entrada detalhadas
    detalhesSaidas: jsonb('detalhes_saidas'), // NF-e de saída detalhadas

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    arquivoIdx: index('adrcst_produtos_arquivo_idx').on(table.arquivoId),
    ncmIdx: index('adrcst_produtos_ncm_idx').on(table.tenantId, table.ncm),
  })
);
