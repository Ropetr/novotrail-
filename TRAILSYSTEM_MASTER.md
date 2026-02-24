# TrailSystem ERP — Documento Master

**Última atualização:** 2026-02-24

> Este documento contém dados sensíveis de infraestrutura.
> Para contexto do projeto, ver `CLAUDE.md`.
> Para status atual, ver `docs/status.md`.
> Para decisões técnicas, ver `docs/decisions/`.

---

## Credenciais e Acessos

> ⚠️ Dados sensíveis: nunca commitar senhas/tokens no Git.
> Usar `.dev.vars` localmente e `wrangler secret put` em produção.

### Cloudflare
- **Conta:** Planacacabamentos@gmail.com
- **Account ID:** ver dashboard Cloudflare

### Neon PostgreSQL
- **Região:** sa-east-1 (São Paulo)
- **Database:** neondb
- **Pooler:** ep-gentle-voice-ac69mvb9-pooler.sa-east-1.aws.neon.tech
- **API REST:** https://ep-gentle-voice-ac69mvb9-pooler.sa-east-1.aws.neon.tech/sql

### API em Produção
- **URL:** https://novotrail-api.planacacabamentos.workers.dev
- **Tenant demo:** 00000000-0000-0000-0000-000000000001
- **Login demo:** admin@demo.com / 123456

### Integrações Externas
- **Nuvem Fiscal:** Sandbox (credenciais em .dev.vars)
- **API Brasil:** Planejado (WhatsApp Baileys R$9,90/conexão)

---

## Recursos Cloudflare

### Hyperdrive
| Nome | ID | Destino |
|------|-----|---------|
| trailsystem-neon | 05c0084815424cd1ba53a7fe6b1dad82 | Neon PostgreSQL |

### KV Namespaces
| Binding | Título | ID |
|---------|--------|----|
| CACHE | novotraildesktop-cache | e478cdb5adf5465db25655cac18eae02 |
| SESSIONS | novotraildesktop-sessions | 54a1ed65d14d40a4b4aeecfa478a77ae |
| NUVEM_FISCAL_CACHE | novotraildesktop-nuvemfiscal | 879c23b8835b47f4a038031afbda505c |

### R2 Buckets
| Binding | Nome | Uso |
|---------|------|-----|
| STORAGE | novotraildesktop-storage | Arquivos gerais |
| CERTIFICATES | novotraildesktop-certificates | Certificados A1/A3 |
| IMAGES | novotraildesktop-images | Imagens |

### Queue
| Nome | Uso |
|------|-----|
| novotrail-tasks | Processamento assíncrono |

---

## Schema do Banco (41 tabelas)

| Grupo | Tabelas | Qtd |
|-------|---------|-----|
| Auth | tenants, users | 2 |
| Cadastros | clients, suppliers, partners, employees, client_credits, client_credit_movements | 6 |
| Produtos | categories, products | 2 |
| Comercial | quotes, quote_items, sales, sale_items, returns, return_items, sale_deliveries, sale_delivery_items | 8 |
| CRM | crm_pipeline_stages, crm_opportunities, crm_activities, crm_scoring_rules | 4 |
| Omnichannel | 19 tabelas omni_* | 19 |
| **Total** | | **41** |
