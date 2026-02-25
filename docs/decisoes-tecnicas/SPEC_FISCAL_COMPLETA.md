# Especificação Técnica — Módulo Fiscal Completo
## NovoTrail ERP (TrailSystem)

> **Propósito deste documento:** Especificação técnica completa e autocontida para programação do módulo fiscal do ERP NovoTrail. Contém todas as decisões aprovadas, arquitetura, schemas, endpoints, regras de negócio, integrações externas e padrões de código. O desenvolvedor deve seguir este documento para implementar o módulo sem ambiguidades.

---

## 1. CONTEXTO DO PROJETO

### 1.1 Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Runtime** | Cloudflare Workers |
| **Framework API** | Hono (TypeScript) |
| **ORM** | Drizzle ORM |
| **Banco de Dados** | Neon PostgreSQL (sa-east-1) |
| **Cache** | Cloudflare KV |
| **Storage** | Cloudflare R2 (arquivos e certificados) |
| **Queue** | Cloudflare Queues (processamento assíncrono) |
| **Frontend** | React 18 + Vite + TailwindCSS + shadcn/ui |
| **Monorepo** | Turborepo (apps/api + apps/web + packages/shared) |
| **Hyperdrive** | Ponte Cloudflare → Neon PostgreSQL |

### 1.2 Arquitetura de Módulos

Cada módulo segue **Clean Architecture** com a seguinte estrutura:

```
apps/api/src/modules/{modulo}/
├── application/          # Casos de uso, services, lógica de negócio
│   ├── services/         # Serviços compartilhados do módulo
│   ├── use-cases/        # Casos de uso específicos
│   └── {submodulo}/      # Subdomínios (ex: collectors, pipeline, emissao)
├── domain/               # Entidades e interfaces de repositório
│   ├── entities.ts
│   └── repositories.ts
├── infrastructure/       # Implementações concretas
│   ├── schemas/          # Schemas Drizzle (tabelas do banco)
│   ├── repositories/     # Implementações de repositório
│   └── {integracao}/     # Clientes de APIs externas
├── presentation/         # Controllers e rotas HTTP
│   └── http/
│       ├── controller.ts
│       ├── routes.ts
│       └── validators.ts
├── module.ts             # Composição e DI do módulo
└── index.ts              # Re-exports
```

### 1.3 Padrões Obrigatórios

- **Schemas:** Drizzle ORM com `pgTable`, sempre com `tenantId` (multi-tenant), `createdAt`, `updatedAt`
- **IDs:** UUID v4 gerados pelo banco (`uuid('id').defaultRandom().primaryKey()`)
- **Timestamps:** `timestamp('created_at', { withTimezone: true }).notNull().defaultNow()`
- **Valores monetários:** `numeric('campo', { precision: 15, scale: 2 })`
- **Quantidades:** `numeric('campo', { precision: 15, scale: 4 })`
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `security:`)
- **Idioma do código:** Inglês para nomes de variáveis/funções, português para strings de negócio
- **Resposta da API:** `{ data: T, pagination?: {...} }` para listagens, objeto direto para consultas
- **Erros:** `{ error: string, details?: any }` com HTTP status codes corretos
- **Auth:** JWT via httpOnly cookies (`trail_access`, `trail_refresh`), Bearer token como fallback
- **Tenant:** Sempre filtrar por `tenantId` obtido do contexto autenticado (`c.get('tenantId')`)

### 1.4 Bindings Cloudflare Disponíveis

```typescript
// Em wrangler.toml (referência, NÃO colocar secrets aqui)
interface Env {
  DB: Hyperdrive;           // Neon PostgreSQL via Hyperdrive
  CACHE: KVNamespace;       // Cache geral
  SESSIONS: KVNamespace;    // Sessões
  NUVEM_FISCAL_CACHE: KVNamespace; // Cache Nuvem Fiscal
  STORAGE: R2Bucket;        // Arquivos gerais
  CERTIFICATES: R2Bucket;   // Certificados digitais A1
  TASKS: Queue;             // Fila de processamento assíncrono
  // Secrets (via wrangler secret put):
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  NUVEM_FISCAL_CLIENT_ID: string;
  NUVEM_FISCAL_CLIENT_SECRET: string;
}
```

### 1.5 Referências de Módulos Existentes

Os seguintes módulos já estão implementados e servem como referência de padrão:

- **Auth:** `apps/api/src/core/auth/` — JWT, httpOnly cookies, refresh tokens
- **Cadastros:** `apps/api/src/modules/cadastros/` — CRUD de clientes, fornecedores, parceiros
- **Produtos:** `apps/api/src/modules/produtos/` — Categorias e produtos
- **Comercial:** `apps/api/src/modules/comercial/` — Orçamentos, vendas, devoluções, entregas
- **CRM:** `apps/api/src/modules/crm/` — Pipeline, oportunidades, atividades
- **Configurações:** `apps/api/src/modules/configuracoes/` — Settings por tenant

---

## 2. MÓDULO FISCAL — VISÃO GERAL

### 2.1 Submódulos

O módulo fiscal é dividido em **5 submódulos**:

| # | Submódulo | Rota Base | Função |
|---|-----------|-----------|--------|
| 1 | **Nuvem Fiscal** | `/fiscal/nuvem-fiscal` | Integração base (CNPJ, empresas, certificados, config) |
| 2 | **DF-e Inbox** | `/fiscal/inbox` | Captura e processamento de documentos fiscais recebidos |
| 3 | **Emissão** | `/fiscal/emissao` | Emissão de NF-e, NFS-e, CT-e via Nuvem Fiscal |
| 4 | **GNRE** | `/fiscal/gnre` | Geração de guias GNRE (ICMS-ST, DIFAL, FECP) |
| 5 | **ADRC-ST** | `/fiscal/adrcst` | Gerador de arquivo ADRC-ST conforme SEFAZ-PR |

### 2.2 Integrações Externas

| Serviço | Uso | Autenticação | Documentação |
|---------|-----|-------------|--------------|
| **Nuvem Fiscal** | Emissão de NF-e/NFS-e/CT-e + Captura de NF-e recebidas | OAuth2 (client_credentials) | https://dev.nuvemfiscal.com.br/docs/api |
| **Portal GNRE** | Geração de guias GNRE | Certificado digital A1 (SOAP/XML) | https://www.gnre.pe.gov.br |
| **SEFAZ Nacional** | CT-e recebidos (Distribuição DF-e CT-e) | Certificado digital A1 (SOAP/XML) | MOC CT-e |

### 2.3 Capacidades da Nuvem Fiscal (mapeamento real)

| Tipo | Emissão | Captura Recebidas | Manifestação |
|------|---------|-------------------|--------------|
| **NF-e** | SIM | SIM (Distribuição DF-e) | SIM |
| **NFS-e** | SIM | NÃO | N/A |
| **CT-e** | SIM | NÃO | N/A |
| **NFC-e** | SIM | N/A | N/A |
| **MDF-e** | SIM | N/A | N/A |

**Implicação:** Para NFS-e e CT-e recebidos, o sistema precisa de soluções alternativas (APIs municipais, SEFAZ direta, importação manual).

---

## 3. SCHEMAS DO BANCO DE DADOS

### 3.1 Tabelas do DF-e Inbox (8 tabelas)

#### `dfe_inbox_documents` — Documentos fiscais recebidos (NF-e, CT-e, NFS-e)

```typescript
export const dfeInboxDocuments = pgTable('dfe_inbox_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  // Tipo
  tipo: text('tipo', { enum: ['nfe', 'cte', 'nfse'] }).notNull(),
  // Identificação
  chaveAcesso: varchar('chave_acesso', { length: 44 }),
  numero: integer('numero'),
  serie: integer('serie'),
  dataEmissao: timestamp('data_emissao', { withTimezone: true }),
  dataRecebimento: timestamp('data_recebimento', { withTimezone: true }).notNull().defaultNow(),
  // Emitente
  emitenteCnpj: varchar('emitente_cnpj', { length: 14 }).notNull(),
  emitenteRazaoSocial: varchar('emitente_razao_social', { length: 500 }),
  emitenteIe: varchar('emitente_ie', { length: 50 }),
  emitenteUf: varchar('emitente_uf', { length: 2 }),
  // Valores
  valorTotal: numeric('valor_total', { precision: 15, scale: 2 }),
  valorProdutos: numeric('valor_produtos', { precision: 15, scale: 2 }),
  valorFrete: numeric('valor_frete', { precision: 15, scale: 2 }),
  valorSeguro: numeric('valor_seguro', { precision: 15, scale: 2 }),
  valorDesconto: numeric('valor_desconto', { precision: 15, scale: 2 }),
  valorOutros: numeric('valor_outros', { precision: 15, scale: 2 }),
  // Impostos
  icmsTotal: numeric('icms_total', { precision: 15, scale: 2 }),
  icmsStTotal: numeric('icms_st_total', { precision: 15, scale: 2 }),
  ipiTotal: numeric('ipi_total', { precision: 15, scale: 2 }),
  pisTotal: numeric('pis_total', { precision: 15, scale: 2 }),
  cofinsTotal: numeric('cofins_total', { precision: 15, scale: 2 }),
  // CFOP
  cfopPrincipal: varchar('cfop_principal', { length: 4 }),
  naturezaOperacao: varchar('natureza_operacao', { length: 200 }),
  // CT-e Específico
  cteRemetenteCnpj: varchar('cte_remetente_cnpj', { length: 14 }),
  cteDestinatarioCnpj: varchar('cte_destinatario_cnpj', { length: 14 }),
  ctePlaca: varchar('cte_placa', { length: 8 }),
  cteNfesReferenciadas: jsonb('cte_nfes_referenciadas'),
  // NFS-e Específico
  nfseCodigoServico: varchar('nfse_codigo_servico', { length: 20 }),
  nfseDescricaoServico: text('nfse_descricao_servico'),
  nfseMunicipioIbge: varchar('nfse_municipio_ibge', { length: 7 }),
  // Pipeline
  pipelineStatus: text('pipeline_status', {
    enum: ['capturado', 'parseado', 'deduplicado', 'matched', 'proposta_gerada', 'aprovado', 'lancado', 'rejeitado', 'erro'],
  }).notNull().default('capturado'),
  pipelineErro: text('pipeline_erro'),
  // Manifestação
  manifestacaoStatus: text('manifestacao_status', {
    enum: ['pendente', 'ciencia', 'confirmada', 'desconhecida', 'nao_realizada'],
  }).default('pendente'),
  manifestacaoData: timestamp('manifestacao_data', { withTimezone: true }),
  manifestacaoProtocolo: varchar('manifestacao_protocolo', { length: 50 }),
  // Vinculação
  fornecedorId: uuid('fornecedor_id').references(() => suppliers.id),
  pedidoCompraId: uuid('pedido_compra_id'),
  // Nuvem Fiscal
  nuvemFiscalId: varchar('nuvem_fiscal_id', { length: 100 }),
  nuvemFiscalNsu: varchar('nuvem_fiscal_nsu', { length: 50 }),
  // XML
  xmlOriginal: text('xml_original'),
  xmlParsed: jsonb('xml_parsed'),
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
// Indexes: tenantId+chaveAcesso (unique), tenantId+pipelineStatus, tenantId+emitenteCnpj
```

#### `dfe_inbox_items` — Itens dos documentos recebidos

```typescript
export const dfeInboxItems = pgTable('dfe_inbox_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  documentId: uuid('document_id').notNull().references(() => dfeInboxDocuments.id, { onDelete: 'cascade' }),
  // Item
  numeroItem: integer('numero_item').notNull(),
  codigoProdutoFornecedor: varchar('codigo_produto_fornecedor', { length: 60 }),
  descricao: varchar('descricao', { length: 500 }).notNull(),
  ncm: varchar('ncm', { length: 8 }),
  cest: varchar('cest', { length: 7 }),
  cfop: varchar('cfop', { length: 4 }),
  ean: varchar('ean', { length: 14 }),
  unidade: varchar('unidade', { length: 6 }),
  // Valores
  quantidade: numeric('quantidade', { precision: 15, scale: 4 }).notNull(),
  valorUnitario: numeric('valor_unitario', { precision: 15, scale: 4 }).notNull(),
  valorTotal: numeric('valor_total', { precision: 15, scale: 2 }).notNull(),
  valorDesconto: numeric('valor_desconto', { precision: 15, scale: 2 }),
  valorFrete: numeric('valor_frete', { precision: 15, scale: 2 }),
  // Impostos por item
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
  pisAliquota: numeric('pis_aliquota', { precision: 5, scale: 2 }),
  pisValor: numeric('pis_valor', { precision: 15, scale: 2 }),
  cofinsBase: numeric('cofins_base', { precision: 15, scale: 2 }),
  cofinsAliquota: numeric('cofins_aliquota', { precision: 5, scale: 2 }),
  cofinsValor: numeric('cofins_valor', { precision: 15, scale: 2 }),
  // Matching
  matchStatus: text('match_status', {
    enum: ['pendente', 'automatico', 'manual', 'novo_produto', 'ignorado'],
  }).default('pendente'),
  matchConfianca: numeric('match_confianca', { precision: 5, scale: 2 }),
  matchMetodo: varchar('match_metodo', { length: 50 }),
  produtoVinculadoId: uuid('produto_vinculado_id').references(() => products.id),
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

#### `dfe_inbox_manifestacoes` — Histórico de manifestações

```typescript
export const dfeInboxManifestacoes = pgTable('dfe_inbox_manifestacoes', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  documentId: uuid('document_id').notNull().references(() => dfeInboxDocuments.id),
  tipoEvento: text('tipo_evento', {
    enum: ['ciencia', 'confirmacao', 'desconhecimento', 'nao_realizada'],
  }).notNull(),
  codigoEvento: varchar('codigo_evento', { length: 6 }).notNull(), // 210200, 210210, 210220, 210240
  protocolo: varchar('protocolo', { length: 50 }),
  dataEvento: timestamp('data_evento', { withTimezone: true }).notNull().defaultNow(),
  justificativa: text('justificativa'),
  xmlEvento: text('xml_evento'),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

#### `dfe_supplier_product_mapping` — De-Para de produtos por fornecedor

```typescript
export const dfeSupplierProductMapping = pgTable('dfe_supplier_product_mapping', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  fornecedorCnpj: varchar('fornecedor_cnpj', { length: 14 }).notNull(),
  codigoProdutoFornecedor: varchar('codigo_produto_fornecedor', { length: 60 }).notNull(),
  descricaoProdutoFornecedor: varchar('descricao_produto_fornecedor', { length: 500 }),
  ean: varchar('ean', { length: 14 }),
  ncm: varchar('ncm', { length: 8 }),
  produtoInternoId: uuid('produto_interno_id').notNull().references(() => products.id),
  confianca: numeric('confianca', { precision: 5, scale: 2 }).default('1.00'),
  metodoVinculacao: varchar('metodo_vinculacao', { length: 50 }).default('manual'),
  vezesMapeado: integer('vezes_mapeado').default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
// Index UNIQUE: tenantId + fornecedorCnpj + codigoProdutoFornecedor
```

#### `dfe_processing_queue` — Fila de processamento

```typescript
export const dfeProcessingQueue = pgTable('dfe_processing_queue', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  documentId: uuid('document_id').notNull().references(() => dfeInboxDocuments.id),
  etapa: text('etapa', {
    enum: ['parse', 'dedup', 'match', 'proposta', 'aprovacao', 'lancamento'],
  }).notNull(),
  status: text('status', {
    enum: ['pendente', 'processando', 'concluido', 'erro', 'retry'],
  }).notNull().default('pendente'),
  tentativas: integer('tentativas').default(0),
  maxTentativas: integer('max_tentativas').default(3),
  erro: text('erro'),
  agendadoPara: timestamp('agendado_para', { withTimezone: true }),
  processadoEm: timestamp('processado_em', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

### 3.2 Tabelas de Emissão (2 tabelas)

#### `dfe_emitidos` — Documentos fiscais emitidos

```typescript
export const dfeEmitidos = pgTable('dfe_emitidos', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  tipo: text('tipo', { enum: ['nfe', 'nfse', 'cte', 'nfce', 'mdfe'] }).notNull(),
  status: text('status', {
    enum: ['rascunho', 'validando', 'processando', 'autorizada', 'rejeitada', 'cancelada', 'erro', 'inutilizada'],
  }).notNull().default('rascunho'),
  // Identificação
  chaveAcesso: varchar('chave_acesso', { length: 44 }),
  numero: integer('numero'),
  serie: integer('serie'),
  naturezaOperacao: varchar('natureza_operacao', { length: 200 }),
  // Destinatário
  destinatarioCpfCnpj: varchar('destinatario_cpf_cnpj', { length: 14 }),
  destinatarioRazaoSocial: varchar('destinatario_razao_social', { length: 500 }),
  destinatarioUf: varchar('destinatario_uf', { length: 2 }),
  // Valores
  valorTotal: numeric('valor_total', { precision: 15, scale: 2 }),
  valorProdutos: numeric('valor_produtos', { precision: 15, scale: 2 }),
  icmsValor: numeric('icms_valor', { precision: 15, scale: 2 }),
  icmsStValor: numeric('icms_st_valor', { precision: 15, scale: 2 }),
  ipiValor: numeric('ipi_valor', { precision: 15, scale: 2 }),
  pisValor: numeric('pis_valor', { precision: 15, scale: 2 }),
  cofinsValor: numeric('cofins_valor', { precision: 15, scale: 2 }),
  totalItens: integer('total_itens'),
  // Nuvem Fiscal
  nuvemFiscalId: varchar('nuvem_fiscal_id', { length: 100 }),
  protocolo: varchar('protocolo', { length: 50 }),
  dataAutorizacao: timestamp('data_autorizacao', { withTimezone: true }),
  motivoRejeicao: text('motivo_rejeicao'),
  // Payload
  payloadEnvio: jsonb('payload_envio'),
  xmlAutorizado: text('xml_autorizado'),
  // Controle
  criadoPor: uuid('criado_por'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
```

#### `dfe_emitidos_eventos` — Eventos dos documentos emitidos

```typescript
export const dfeEmitidosEventos = pgTable('dfe_emitidos_eventos', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  documentId: uuid('document_id').notNull().references(() => dfeEmitidos.id),
  tipoEvento: text('tipo_evento', {
    enum: ['cancelamento', 'carta_correcao', 'inutilizacao'],
  }).notNull(),
  descricao: text('descricao'),
  protocolo: varchar('protocolo', { length: 50 }),
  sequencia: integer('sequencia'),
  xmlEvento: text('xml_evento'),
  userId: uuid('user_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

### 3.3 Tabelas de Configuração Fiscal (3 tabelas)

#### `fiscal_config` — Configurações fiscais por tenant

```typescript
export const fiscalConfig = pgTable('fiscal_config', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().unique(),
  // Empresa
  cnpjEmpresa: varchar('cnpj_empresa', { length: 14 }),
  ieEmpresa: varchar('ie_empresa', { length: 20 }),
  razaoSocial: varchar('razao_social', { length: 500 }),
  regimeTributario: text('regime_tributario', {
    enum: ['simples_nacional', 'lucro_presumido', 'lucro_real'],
  }),
  ufEmpresa: varchar('uf_empresa', { length: 2 }),
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
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
```

#### `fiscal_audit_log` — Auditoria fiscal

```typescript
export const fiscalAuditLog = pgTable('fiscal_audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  userId: uuid('user_id'),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  details: jsonb('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

#### `fiscal_digital_certificates` — Certificados digitais A1

```typescript
export const fiscalDigitalCertificates = pgTable('fiscal_digital_certificates', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  cnpj: varchar('cnpj', { length: 14 }).notNull(),
  razaoSocial: varchar('razao_social', { length: 500 }),
  tipo: text('tipo', { enum: ['a1', 'a3'] }).default('a1'),
  dataValidade: timestamp('data_validade', { withTimezone: true }),
  r2Key: varchar('r2_key', { length: 200 }), // Chave no R2 CERTIFICATES
  nuvemFiscalCertId: varchar('nuvem_fiscal_cert_id', { length: 100 }),
  ativo: boolean('ativo').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

### 3.4 Tabelas GNRE (2 tabelas)

#### `gnre_guias` — Guias GNRE geradas

```typescript
export const gnreGuias = pgTable('gnre_guias', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  ufFavorecida: varchar('uf_favorecida', { length: 2 }).notNull(),
  tipoGnre: text('tipo_gnre', {
    enum: ['icms_st', 'difal', 'fecp', 'icms_importacao'],
  }).notNull(),
  codigoReceita: varchar('codigo_receita', { length: 10 }).notNull(),
  descricaoReceita: varchar('descricao_receita', { length: 200 }),
  // Contribuinte
  contribuinteCpfCnpj: varchar('contribuinte_cpf_cnpj', { length: 14 }).notNull(),
  contribuinteRazaoSocial: varchar('contribuinte_razao_social', { length: 500 }),
  contribuinteUf: varchar('contribuinte_uf', { length: 2 }),
  // Destinatário
  destinatarioCpfCnpj: varchar('destinatario_cpf_cnpj', { length: 14 }),
  destinatarioUf: varchar('destinatario_uf', { length: 2 }),
  destinatarioMunicipio: varchar('destinatario_municipio', { length: 200 }),
  // Período
  periodoReferencia: varchar('periodo_referencia', { length: 7 }), // MM/YYYY
  dataVencimento: timestamp('data_vencimento', { withTimezone: true }),
  // Valores
  valorPrincipal: numeric('valor_principal', { precision: 15, scale: 2 }).notNull(),
  valorAtualizacao: numeric('valor_atualizacao', { precision: 15, scale: 2 }).default('0'),
  valorJuros: numeric('valor_juros', { precision: 15, scale: 2 }).default('0'),
  valorMulta: numeric('valor_multa', { precision: 15, scale: 2 }).default('0'),
  valorTotal: numeric('valor_total', { precision: 15, scale: 2 }).notNull(),
  // Documento origem
  chaveAcessoOrigem: varchar('chave_acesso_origem', { length: 44 }),
  tipoDocOrigem: varchar('tipo_doc_origem', { length: 10 }),
  // Status
  status: text('status', {
    enum: ['rascunho', 'gerada', 'paga', 'vencida', 'cancelada', 'erro'],
  }).notNull().default('rascunho'),
  numeroControle: varchar('numero_controle', { length: 50 }),
  codigoBarras: varchar('codigo_barras', { length: 100 }),
  linhaDigitavel: varchar('linha_digitavel', { length: 100 }),
  motivoRejeicao: text('motivo_rejeicao'),
  // XML
  xmlEnvio: text('xml_envio'),
  xmlRetorno: text('xml_retorno'),
  // Controle
  criadoPor: uuid('criado_por'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
```

### 3.5 Tabelas ADRC-ST (2 tabelas)

#### `adrcst_arquivos` — Arquivos ADRC-ST gerados

```typescript
export const adrcstArquivos = pgTable('adrcst_arquivos', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  periodoInicio: timestamp('periodo_inicio', { withTimezone: true }).notNull(),
  periodoFim: timestamp('periodo_fim', { withTimezone: true }).notNull(),
  cnpjEmpresa: varchar('cnpj_empresa', { length: 14 }).notNull(),
  ieEmpresa: varchar('ie_empresa', { length: 20 }).notNull(),
  versaoLeiaute: varchar('versao_leiaute', { length: 3 }).default('016'),
  status: text('status', {
    enum: ['gerando', 'gerado', 'validado', 'enviado', 'aceito', 'rejeitado', 'erro'],
  }).notNull().default('gerando'),
  totalRegistros: integer('total_registros'),
  totalProdutos: integer('total_produtos'),
  valorRecuperacao: numeric('valor_recuperacao', { precision: 15, scale: 2 }),
  valorRessarcimento: numeric('valor_ressarcimento', { precision: 15, scale: 2 }),
  valorComplementacao: numeric('valor_complementacao', { precision: 15, scale: 2 }),
  conteudoArquivo: text('conteudo_arquivo'),
  criadoPor: uuid('criado_por'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

---

## 4. ENDPOINTS DA API NUVEM FISCAL

### 4.1 Distribuição NF-e (Captura de notas recebidas)

| Método | Endpoint | Função |
|--------|----------|--------|
| `GET` | `/distribuicao/nfe` | Listar documentos distribuídos |
| `POST` | `/distribuicao/nfe` | Solicitar distribuição de DF-e |
| `GET` | `/distribuicao/nfe/sem-manifestacao` | Listar NF-e sem manifestação |
| `POST` | `/distribuicao/nfe/manifestacoes` | Manifestar destinatário |
| `GET` | `/distribuicao/nfe/documentos/{id}` | Consultar documento |
| `GET` | `/distribuicao/nfe/documentos/{id}/xml` | Baixar XML |
| `GET` | `/distribuicao/nfe/documentos/{id}/pdf` | Baixar PDF |

**Autenticação:** OAuth2 com scope `distribuicao-nfe`

**Códigos de manifestação:**
- `210200` — Ciência da Operação
- `210210` — Confirmação da Operação
- `210220` — Desconhecimento da Operação
- `210240` — Operação Não Realizada

### 4.2 Emissão NF-e

| Método | Endpoint | Função |
|--------|----------|--------|
| `POST` | `/nfe` | Emitir NF-e |
| `GET` | `/nfe/{id}` | Consultar NF-e |
| `GET` | `/nfe/{id}/pdf` | Baixar DANFE |
| `GET` | `/nfe/{id}/xml` | Baixar XML |
| `POST` | `/nfe/{id}/cancelamento` | Cancelar NF-e |
| `POST` | `/nfe/{id}/correcao` | Carta de Correção |
| `POST` | `/nfe/inutilizacoes` | Inutilizar numeração |

### 4.3 Emissão NFS-e

| Método | Endpoint | Função |
|--------|----------|--------|
| `POST` | `/nfse` | Emitir NFS-e |
| `GET` | `/nfse/{id}` | Consultar NFS-e |
| `GET` | `/nfse/{id}/pdf` | Baixar DANFSE |
| `POST` | `/nfse/{id}/cancelamento` | Cancelar NFS-e |

### 4.4 Emissão CT-e

| Método | Endpoint | Função |
|--------|----------|--------|
| `POST` | `/cte` | Emitir CT-e |
| `GET` | `/cte/{id}` | Consultar CT-e |
| `GET` | `/cte/{id}/pdf` | Baixar DACTE |
| `POST` | `/cte/{id}/cancelamento` | Cancelar CT-e |
| `POST` | `/cte/{id}/correcao` | Carta de Correção |

---

## 5. REGRAS DE NEGÓCIO

### 5.1 DF-e Inbox — Pipeline de 7 Etapas

```
1. CAPTURA → Buscar NF-e na Nuvem Fiscal (Distribuição DF-e)
2. PARSE → Extrair itens, impostos, totais do XML
3. DEDUP → Verificar se chave de acesso já existe (evitar duplicatas)
4. MATCH → Algoritmo cascata para vincular produtos:
   a) Código do fornecedor (dfe_supplier_product_mapping)
   b) EAN/código de barras
   c) NCM + descrição fuzzy (similaridade > 80%)
   d) Se nenhum match: marcar como "novo_produto"
5. PROPOSTA → Gerar proposta de lançamento com produtos vinculados
6. APROVAÇÃO → Usuário revisa e aprova/ajusta a proposta
7. LANÇAMENTO → Gerar movimentação de estoque + conta a pagar
```

### 5.2 Emissão — Ciclo de Vida

```
RASCUNHO → VALIDAÇÃO → ENVIO → AUTORIZADA
                                    ├── CANCELAMENTO (até 24h)
                                    ├── CARTA DE CORREÇÃO (ilimitadas)
                                    └── (sem alteração possível)
RASCUNHO → VALIDAÇÃO → REJEITADA (corrigir e reenviar)
```

**Regras de cancelamento:**
- Prazo máximo: 24 horas após autorização
- Justificativa mínima: 15 caracteres
- Não é possível cancelar se já houver CT-e vinculado

### 5.3 GNRE — Cálculos

**ICMS-ST:**
```
Base Cálculo = Valor Produto + IPI + Frete + Seguro + Outros
Base ST = Base Cálculo × (1 + MVA/100)
ICMS Próprio = Base Cálculo × Alíquota Interestadual
ICMS-ST = (Base ST × Alíquota Interna Destino) - ICMS Próprio
```

**DIFAL (EC 87/2015):**
```
DIFAL = Valor Operação × (Alíquota Interna Destino - Alíquota Interestadual)
FECP = Valor Operação × Alíquota FECP Destino
Total = DIFAL + FECP
```

### 5.4 ADRC-ST — Conforme Manual v1.6 SEFAZ-PR

**Formato:** Texto delimitado por pipe (`|`), codificação UTF-8, extensão `.txt`, compactado em ZIP.

**Registros:**

| Registro | Descrição | Obrigatório |
|----------|-----------|-------------|
| 0000 | Abertura (CNPJ, IE, período, opções) | Sim |
| 1000 | Identificação do produto (NCM, CEST, EAN) | Sim (por produto) |
| 1100 | Entradas com ICMS-ST retido | Sim |
| 1115 | Guias de recolhimento (GNRE/GR-PR) — **novo na v1.6** | Obrigatório a partir de 01/06/2025 |
| 1200 | Saídas para consumidor final | Condicional |
| 1300 | Saídas interestaduais (ressarcimento) | Condicional |
| 1400 | Saídas Art. 119 RICMS | Condicional |
| 1500 | Saídas para Simples Nacional | Condicional |
| 9000 | Apuração (totais recuperação/ressarcimento/complementação) | Sim |
| 9999 | Encerramento (total de registros) | Sim |

**Cálculo de recuperação/ressarcimento/complementação:**
- Custo médio ponderado do ICMS-ST retido nas entradas por produto
- Comparação com ICMS efetivo nas saídas
- Se ST retido > ICMS efetivo → Recuperação (conta gráfica)
- Se venda interestadual → Ressarcimento (para fornecedor)
- Se ICMS efetivo > ST retido → Complementação (pagar diferença)

---

## 6. ENDPOINTS DO MÓDULO (RESUMO COMPLETO)

### 6.1 DF-e Inbox (`/fiscal/inbox`)

| Método | Rota | Função |
|--------|------|--------|
| `GET` | `/sync` | Sincronizar NF-e da SEFAZ via Nuvem Fiscal |
| `GET` | `/` | Listar documentos recebidos (com filtros e paginação) |
| `GET` | `/:id` | Consultar documento específico |
| `GET` | `/:id/itens` | Listar itens do documento |
| `POST` | `/:id/manifestar` | Manifestar destinatário (ciência, confirmação, etc.) |
| `POST` | `/:id/matching` | Executar matching de produtos |
| `POST` | `/:id/matching/manual` | Vincular produto manualmente |
| `POST` | `/:id/lancar` | Lançar no sistema (estoque + financeiro) |
| `GET` | `/dashboard` | Dashboard fiscal com métricas |
| `GET` | `/sem-manifestacao` | Listar NF-e pendentes de manifestação |
| `POST` | `/processar-fila` | Processar fila de documentos pendentes |

### 6.2 Emissão (`/fiscal/emissao`)

| Método | Rota | Função |
|--------|------|--------|
| `GET` | `/` | Listar documentos emitidos |
| `GET` | `/:id` | Consultar documento emitido |
| `GET` | `/:id/pdf` | Baixar DANFE/DANFSE/DACTE |
| `POST` | `/nfe` | Emitir NF-e |
| `POST` | `/:id/cancelar` | Cancelar documento |
| `POST` | `/:id/carta-correcao` | Emitir CC-e |
| `POST` | `/inutilizar` | Inutilizar faixa de numeração |

### 6.3 GNRE (`/fiscal/gnre`)

| Método | Rota | Função |
|--------|------|--------|
| `GET` | `/` | Listar guias GNRE |
| `POST` | `/` | Gerar guia GNRE |
| `POST` | `/calcular-icms-st` | Calculadora de ICMS-ST |
| `POST` | `/calcular-difal` | Calculadora de DIFAL |

### 6.4 ADRC-ST (`/fiscal/adrcst`)

| Método | Rota | Função |
|--------|------|--------|
| `GET` | `/` | Listar arquivos ADRC-ST gerados |
| `POST` | `/gerar` | Gerar arquivo ADRC-ST |
| `GET` | `/:id` | Consultar arquivo |
| `GET` | `/:id/download` | Baixar arquivo TXT |

---

## 7. TELAS DO FRONTEND (DESCRIÇÃO)

### 7.1 DF-e Inbox

- **Dashboard Fiscal:** Cards com totais (NF-e pendentes, valor total, alertas), gráfico de notas por período
- **Lista de Documentos:** Tabela com filtros (tipo, status, período, fornecedor), ações em lote
- **Detalhe do Documento:** Cabeçalho com dados do emitente, lista de itens com matching, botões de manifestação
- **Wizard de Lançamento:** 4 etapas (Revisão → Matching → Financeiro → Confirmação)
- **Central de Divergências:** Documentos com problemas de matching ou valores inconsistentes

### 7.2 Emissão

- **Lista de Documentos Emitidos:** Tabela com filtros (tipo, status, período)
- **Formulário de Emissão NF-e:** Dados do destinatário, itens com impostos, frete, cobrança
- **Detalhe do Documento:** Status, dados completos, botões de ação (cancelar, CC-e, PDF)

### 7.3 GNRE

- **Lista de Guias:** Tabela com filtros (UF, tipo, status)
- **Formulário de Geração:** Dados do contribuinte, destinatário, valores, documento origem
- **Calculadoras:** ICMS-ST e DIFAL com campos de entrada e resultado em tempo real

### 7.4 ADRC-ST

- **Lista de Arquivos:** Tabela com período, totais, status
- **Formulário de Geração:** Seleção de período, opções (recuperação/ressarcimento/complementação)
- **Preview:** Visualização do arquivo antes de gerar

---

## 8. TODOs E PONTOS DE ATENÇÃO

1. **CT-e Recebidos:** Implementar collector via SEFAZ Nacional (WebService CTeDistribuicaoDFe) — requer certificado digital A1
2. **NFS-e Recebidas:** Implementar estratégia híbrida (Padrão Nacional Gov.br + APIs municipais + importação manual)
3. **Registro 1115 ADRC-ST:** Vincular com guias GNRE geradas no módulo — obrigatório a partir de 01/06/2025
4. **Tabela de alíquotas ICMS por UF/NCM:** Necessária para cálculos precisos de ICMS-ST e ADRC-ST
5. **Integração com módulo de Estoque:** Lançamento de entrada no estoque ao aprovar documento no Inbox
6. **Integração com módulo Financeiro:** Geração de conta a pagar ao aprovar documento no Inbox
7. **Testes automatizados:** Vitest para unit tests, Playwright para E2E
8. **GNRE com certificado digital:** A geração real de GNRE requer assinatura digital do XML com certificado A1

---

*Documento gerado em 25/02/2026 pela equipe de IAs (Manus + GPT-4.1 + Claude Sonnet 4) com base em pesquisa da API Nuvem Fiscal, Manual ADRC-ST v1.6 SEFAZ-PR, e benchmarking de 6 ERPs brasileiros (VHSYS, Bling, Conta Azul, Omie, Tray, Tiny).*
