-- =====================================================
-- Migration: Modelo de Impressão (Orçamento e Venda)
-- Data: 2026-02-24
-- Descrição:
--   1. Tabela tenant_settings (dados da empresa, logos, obs padrão)
--   2. Tabela sale_payments (pagamentos mix livre)
--   3. Campos novos em quotes/sales (freight, surcharge)
--   4. Campos novos em quote_items/sale_items (item_type, surcharge)
-- =====================================================

-- 1. TENANT SETTINGS
CREATE TABLE IF NOT EXISTS tenant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Dados da Empresa
  razao_social VARCHAR(255),
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(20),
  ie VARCHAR(20),
  im VARCHAR(20),
  
  -- Endereço
  endereco VARCHAR(255),
  numero VARCHAR(20),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  uf VARCHAR(2),
  cep VARCHAR(10),
  
  -- Contato
  telefone VARCHAR(20),
  celular VARCHAR(20),
  email VARCHAR(255),
  site VARCHAR(255),
  
  -- Logos (URLs no R2)
  logo_url TEXT,
  logo_fiscal_url TEXT,
  
  -- Observações Padrão por Tipo de Documento
  obs_padrao_orcamento TEXT,
  obs_padrao_venda TEXT,
  obs_padrao_nfe TEXT,
  
  -- Rodapé
  mensagem_rodape TEXT,
  
  -- Regime Tributário (futuro)
  regime_tributario VARCHAR(50),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id)
);

-- 2. SALE PAYMENTS (Pagamentos Mix Livre)
CREATE TABLE IF NOT EXISTS sale_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  payment_method VARCHAR(50) NOT NULL,
  installment_number INTEGER NOT NULL DEFAULT 1,
  total_installments INTEGER NOT NULL DEFAULT 1,
  document_number VARCHAR(50),
  due_date TIMESTAMPTZ,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para sale_payments
CREATE INDEX IF NOT EXISTS idx_sale_payments_sale ON sale_payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_payments_quote ON sale_payments(quote_id);
CREATE INDEX IF NOT EXISTS idx_sale_payments_tenant ON sale_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sale_payments_status ON sale_payments(status);

-- 3. CAMPOS NOVOS EM QUOTES
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS freight NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS surcharge NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS delivery_terms TEXT;

-- 4. CAMPOS NOVOS EM SALES
ALTER TABLE sales ADD COLUMN IF NOT EXISTS freight NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS surcharge NUMERIC(12,2) NOT NULL DEFAULT 0;

-- 5. CAMPOS NOVOS EM QUOTE_ITEMS
ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS item_type TEXT NOT NULL DEFAULT 'product'
  CHECK (item_type IN ('product', 'service'));
ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS surcharge NUMERIC(12,2) NOT NULL DEFAULT 0;

-- 6. CAMPOS NOVOS EM SALE_ITEMS
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS item_type TEXT NOT NULL DEFAULT 'product'
  CHECK (item_type IN ('product', 'service'));
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS surcharge NUMERIC(12,2) NOT NULL DEFAULT 0;
