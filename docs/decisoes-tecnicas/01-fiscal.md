# Módulo 01: Fiscal

**Status:** Em Andamento

Este documento consolida as decisões técnicas para o módulo Fiscal do NovoTrail ERP, cobrindo o recebimento de documentos (DF-e Inbox), a emissão de documentos via Nuvem Fiscal, a geração de GNRE e a geração da ADRC-ST para o Paraná.

---

## 1. DF-e Inbox (Recebimento de Documentos)

**Status:** Aprovado

### 1.1. Visão Geral

O módulo DF-e Inbox é responsável por automatizar a captura, processamento e lançamento de todos os documentos fiscais eletrônicos recebidos pela empresa (NF-e, NFS-e, CT-e).

### 1.2. Decisões Aprovadas

- **Coleta Híbrida:** Utilizar uma combinação de serviços para maximizar a cobertura:
  - **NF-e:** Via API de Distribuição DF-e da **Nuvem Fiscal**.
  - **CT-e:** Via WebService **`CTeDistribuicaoDFe`** direto da SEFAZ Nacional (requer certificado A1).
  - **NFS-e:** Estratégia em cascata:
    1. API do **Padrão Nacional NFS-e (Gov.br)**.
    2. APIs de **padrões municipais** (ABRASF, Ginfes, Betha, etc.).
    3. **Scraping defensivo** de portais municipais com Playwright.
    4. Importação manual de XML como fallback.
- **Pipeline Idempotente de 7 Etapas:**
  1. **Ingestão:** Coleta dos documentos das fontes.
  2. **Parsing:** Extração e normalização dos dados do XML.
  3. **Deduplicação:** Verificação de chave de acesso para evitar duplicatas.
  4. **Matching (De-Para):** Vinculação de produtos e fornecedores.
  5. **Proposta de Lançamento:** Geração de uma pré-nota de entrada.
  6. **Aprovação do Usuário:** Interface para o usuário validar e ajustar.
  7. **Postagem:** Lançamento definitivo no Estoque e Financeiro.
- **Inbox Unificado:** Uma única tela (`dfe_inbox`) para o usuário gerenciar todos os tipos de documentos recebidos.
- **Central de Divergências:** Tela dedicada para resolver problemas de matching, validação ou regras de negócio.
- **Job de Refresh:** Processo em background para resolver vínculos entre documentos que chegam em ordens diferentes (ex: CT-e antes da NF-e).

### 1.3. Arquitetura de Dados

| Tabela | Função |
|---|---|
| `dfe_inbox_documents` | Tabela única para todos os documentos (NF-e, NFS-e, CT-e) com campo `tipo` e `status` (pipeline). |
| `dfe_inbox_items` | Itens de cada documento. |
| `supplier_product_mapping` | Tabela de "De-Para" para vincular produto do fornecedor ao produto interno. |
| `dfe_capture_settings` | Configurações de captura por tenant e por tipo de documento. |
| `digital_certificates` | Armazenamento seguro dos certificados A1 dos clientes. |

---

## 2. Emissão de Documentos Fiscais

**Status:** Aprovado

### 2.1. Visão Geral

A emissão de documentos (NF-e, NFS-e, CT-e) será orquestrada pelo NovoTrail, mas a comunicação final com os webservices da SEFAZ/Prefeituras será feita exclusivamente pela **API da Nuvem Fiscal**.

### 2.2. Decisões Aprovadas

- **Motor de Emissão:** Nuvem Fiscal.
- **Responsabilidade do NovoTrail:**
  - Montar o payload JSON completo para a API da Nuvem Fiscal.
  - Realizar pré-validações internas para evitar erros e gastos desnecessários na API.
  - Gerenciar o ciclo de vida completo do documento (rascunho → emitido → autorizado → cancelado → carta de correção → inutilizado).
  - Armazenar o XML e o PDF autorizados.
  - Gerar o DANFE/DANFSE para visualização e impressão.

---

## 3. GNRE (Guia Nacional de Recolhimento de Tributos Estaduais)

**Status:** Aprovado

### 3.1. Visão Geral

Geração da GNRE para recolhimento de ICMS em operações interestaduais (DIFAL, ICMS-ST).

### 3.2. Decisões Aprovadas

- **Motor de Emissão:** Integração direta com o **WebService oficial do Portal GNRE (SEFAZ)**, que é gratuito.
- **Fallback:** Não haverá intermediários (TecnoSpeed, etc.) no MVP.
- **Processo:** O sistema irá calcular o valor devido, montar o XML no padrão do Portal GNRE, transmitir via WebService, e armazenar a guia gerada.

---

## 4. ADRC-ST (Arquivo Digital - ICMS-ST - Paraná)

**Status:** Aprovado

### 4.1. Visão Geral

Geração do arquivo mensal para apuração de recuperação, ressarcimento e complementação do ICMS-ST, conforme **Manual ADRC-ST v1.6** e **NPF 003/2020** da SEFAZ-PR.

### 4.2. Decisões Aprovadas

- **Escopo:** Foco exclusivo no leiaute do Paraná (versão 1.6) no MVP.
- **Processo:**
  1. O sistema irá cruzar todas as notas de entrada com ST com as notas de saída do mesmo produto no período.
  2. Calculará as diferenças de ICMS-ST para cada tipo de operação (consumidor final, interestadual, etc.).
  3. Gerará o arquivo texto (`.txt`) delimitado por pipe (`|`) com todos os 19 registros obrigatórios (0000, 1000, 1100, 1110, 1115, etc.).
  4. O arquivo será disponibilizado para o usuário fazer o download e transmitir via portal da Receita/PR.
- **Novo Registro 1115:** Incluir o novo "Registro 1115 - Identificação da Guia de Recolhimento" (GNRE/GR-PR), obrigatório a partir de 01/06/2025.

### 4.3. Arquitetura de Dados (Resumo)

O gerador da ADRC-ST irá consumir dados dos módulos de:
- **Estoque:** Saldos, movimentações.
- **DF-e Inbox:** Notas de entrada e seus itens.
- **Comercial:** Notas de saída e seus itens.
- **Cadastros:** Produtos (NCM, CEST), clientes, fornecedores.
