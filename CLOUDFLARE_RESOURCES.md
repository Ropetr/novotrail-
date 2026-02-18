# Recursos Cloudflare - ERP Trail System

**Account ID:** `f14d821b52a4f6ecbad7fb0e0afba8e5`
**Account:** Planacacabamentos@gmail.com

---

## D1 Databases (13 databases)

### Databases ERP Trail System

| Nome | UUID | Criação | Tables | Size |
|------|------|---------|--------|------|
| **trailsystem-erp-v4** | `c5ead135-b40d-48fc-925b-6c2cf7499055` | 2026-02-09 | 0 | 400 KB |
| trailsystem-erp-database | `ca804682-2a6e-4fae-b8a6-12fa923f1560` | 2026-01-02 | 0 | 4.8 MB |
| trailsystem-erp-ibpt | `f407e97c-e319-4687-962d-976a8c2babf5` | 2026-01-02 | 0 | 108 KB |
| erp-basico | `7ed0f500-ce78-405a-af9d-3a1b1e6b11cd` | 2026-01-30 | 0 | 104 KB |
| financeiro-db | `ea14c348-d5a8-4536-813b-7bef99f8927c` | 2026-01-10 | 0 | 256 KB |

### Outros Databases

| Nome | UUID | Criação | Tables | Size |
|------|------|---------|--------|------|
| claude-developers-db | `602413c9-1229-4b25-a7b3-9032c5481232` | 2026-02-02 | 0 | 12 KB |
| developers-db | `f546b0a4-a939-4d40-87d9-ace5a7323c51` | 2026-02-02 | 0 | 112 KB |
| finance_ai | `994d8310-673b-4bc5-8aae-7327d104ead9` | 2026-01-09 | 0 | 12 KB |
| cms-site-db | `8961e5db-b486-4bc5-bf35-be81240be063` | 2026-01-03 | 0 | 336 KB |
| bain-memory-db | `870d23b7-1b0c-4e3c-a6e3-50aad0986eee` | 2025-12-27 | 0 | 76 KB |
| bain-main-db | `0ebc35f2-aa5a-4462-8b05-7f61931efea0` | 2025-12-27 | 0 | 108 KB |
| HF-d1 | `6a370ef7-3993-43bc-b7bc-c22dc561cb89` | 2025-12-17 | 0 | 156 KB |
| CriadordeSites-database | `8c5caaff-0457-46af-848f-9098b6d30b91` | 2025-12-02 | 0 | 176 KB |

---

## KV Namespaces (24+ namespaces)

### Trail System KV Namespaces

| Nome | ID | Uso |
|------|----|----|
| **trailsystem-erp-cache** | `d053dab81a554dc6961884eae41f75f7` | Cache do ERP |
| **trailsystem-erp-sessions** | `80c6322699844ba1bb99e841f0c84306` | Sessões do ERP |
| trailsystem-cache | `3624a1bd100f444ca272412900fd38b3` | Cache geral |
| trailsystem-sessions | `9844aa10fb204fb6b4cbd69e8c6ca212` | Sessões gerais |
| trailsystem-rate-limit | `58fbf9e640ea45be8d513bdb093982a4` | Rate limiting |
| trailsystem-usage | `8e4f61b1f3be43aba8a5cd797270e277` | Usage metrics |
| NUVEM_FISCAL_TOKEN_CACHE | `8dc647f3a07c4359b5db4773ad69e9f1` | Tokens Nuvem Fiscal |

### Outros KV Namespaces

| Nome | ID | Projeto |
|------|----|----|
| bain-cache | `1c189c8e62ce4226a9e210575392484b` | Bain |
| bain-sessions | `a8dfbac6123c42a69ab1da4f72483ed6` | Bain |
| cms-site-sessions | `1e35f7e79bc645d09441f6200efb0183` | CMS |
| criadordesites-cache | `634c9ea0fa0a465b8bdd5445255a2441` | Criador de Sites |
| criadordesites-sessions | `d42aad69b6984107b41527f2dabde1f0` | Criador de Sites |
| devcom-cache | `3f624c32674c4900a10b44dc55d325ec` | DevCom |
| devcom-context-cache | `8b3f7496d19746a2b5c3b65f433eb3c0` | DevCom |
| HF-sessions | `00ddb56c11304579a2ca44030ca2ea33` | HF |
| orquestrador-cache | `634851ed06c44a5fb6b678e2c76a332f` | Orquestrador |
| orquestrador-sessions | `d29dbeb9920547ce9df2d3839444bd28` | Orquestrador |
| Organizador-cache | `c542c9a4c5fe4d80891e3c3e3fe2c504` | Organizador |

---

## R2 Buckets (16 buckets)

### Trail System R2 Buckets

| Nome | Criação | Uso |
|------|---------|-----|
| **trailsystem-storage** | 2025-12-18 | Armazenamento geral |
| **trailsystem-certificates** | 2025-12-18 | Certificados digitais (A1/A3) |
| **trailsystem-images** | 2025-12-23 | Imagens |
| **trailsystem-cms-media** | 2025-12-23 | Media do CMS |

### Outros R2 Buckets

| Nome | Criação | Projeto |
|------|---------|---------|
| bain-storage | 2025-12-28 | Bain |
| cms-site-media | 2026-01-03 | CMS Site |
| criadordesites-media | 2025-12-02 | Criador de Sites |
| devcom-storage | 2025-12-02 | DevCom |
| finance-ai-statements | 2026-01-09 | Finance AI |
| financeiro-invoices | 2026-01-13 | Financeiro |
| financeiro-invoices-preview | 2026-01-13 | Financeiro Preview |
| hf-r2-attachments | 2025-12-17 | HF |
| organizador-storage | 2025-12-30 | Organizador |
| planac-images | 2025-10-28 | Planac |
| planac-projetos | 2026-01-20 | Planac Projetos |
| projetos-cotacao | 2026-01-20 | Cotações |

---

## Recomendações para o Projeto

### Database Recomendado
**`trailsystem-erp-v4`** - Database mais recente (criado em 09/02/2026)
- UUID: `c5ead135-b40d-48fc-925b-6c2cf7499055`
- Status: Limpo (0 tables) - pronto para migrations

### KV Namespaces Recomendados
1. **Cache:** `trailsystem-erp-cache` (ID: `d053dab81a554dc6961884eae41f75f7`)
2. **Sessões:** `trailsystem-erp-sessions` (ID: `80c6322699844ba1bb99e841f0c84306`)
3. **Nuvem Fiscal:** `NUVEM_FISCAL_TOKEN_CACHE` (ID: `8dc647f3a07c4359b5db4773ad69e9f1`)

### R2 Buckets Recomendados
1. **Arquivos Gerais:** `trailsystem-storage`
2. **Certificados Digitais:** `trailsystem-certificates`
3. **Imagens:** `trailsystem-images`

---

## Comandos Úteis

### Verificar Database
```bash
export CLOUDFLARE_API_TOKEN="fevwOGy0f_0RFP80L7EUZgxvVttRQpMST1IkJp7T"
wrangler d1 execute trailsystem-erp-v4 --command "SELECT name FROM sqlite_master WHERE type='table';"
```

### Query via API
```bash
curl -X GET "https://api.cloudflare.com/client/v4/accounts/f14d821b52a4f6ecbad7fb0e0afba8e5/d1/database/c5ead135-b40d-48fc-925b-6c2cf7499055" \
  -H "Authorization: Bearer fevwOGy0f_0RFP80L7EUZgxvVttRQpMST1IkJp7T"
```

### Acessar KV
```bash
# Listar keys
wrangler kv:key list --namespace-id=d053dab81a554dc6961884eae41f75f7

# Get value
wrangler kv:key get "key-name" --namespace-id=d053dab81a554dc6961884eae41f75f7
```

### Gerenciar R2
```bash
# Listar objetos
wrangler r2 object list trailsystem-storage

# Upload arquivo
wrangler r2 object put trailsystem-storage/path/file.pdf --file=local-file.pdf
```

---

**Última atualização:** 2026-02-13
