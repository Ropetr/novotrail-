import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from '../../tenant/infrastructure/schema';

// ==================== Tenant Settings (Configurações da Empresa) ====================
export const tenantSettings = pgTable('tenant_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' })
    .unique(),

  // Dados da Empresa
  razaoSocial: varchar('razao_social', { length: 255 }),
  nomeFantasia: varchar('nome_fantasia', { length: 255 }),
  cnpj: varchar('cnpj', { length: 20 }),
  ie: varchar('ie', { length: 20 }),
  im: varchar('im', { length: 20 }),

  // Endereço
  endereco: varchar('endereco', { length: 255 }),
  numero: varchar('numero', { length: 20 }),
  complemento: varchar('complemento', { length: 100 }),
  bairro: varchar('bairro', { length: 100 }),
  cidade: varchar('cidade', { length: 100 }),
  uf: varchar('uf', { length: 2 }),
  cep: varchar('cep', { length: 10 }),

  // Contato
  telefone: varchar('telefone', { length: 20 }),
  celular: varchar('celular', { length: 20 }),
  email: varchar('email', { length: 255 }),
  site: varchar('site', { length: 255 }),

  // Logos (URLs no R2)
  logoUrl: text('logo_url'),
  logoFiscalUrl: text('logo_fiscal_url'),

  // Observações Padrão por Tipo de Documento
  obsPadraoOrcamento: text('obs_padrao_orcamento'),
  obsPadraoVenda: text('obs_padrao_venda'),
  obsPadraoNfe: text('obs_padrao_nfe'),

  // Rodapé dos documentos
  mensagemRodape: text('mensagem_rodape'),

  // Regime Tributário (futuro - NF-e)
  regimeTributario: varchar('regime_tributario', { length: 50 }),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
