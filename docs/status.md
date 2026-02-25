# Status do Projeto — NovoTrail ERP

**Última atualização:** 2026-02-25
**Sprint atual:** Sprint 1 — Segurança + Documentação + Módulo Estoque MVP

---

## O que está funcionando em produção
- **API:** https://novotrail-api.planacacabamentos.workers.dev
- **Módulos ativos:** Auth, Cadastros, Produtos, Comercial, Configurações, Fiscal (parcial), CRM
- **Banco:** Neon PostgreSQL com 43 tabelas (via Hyperdrive)
- **Login teste:** admin@demo.com / 123456

## Sprint 1 — Em andamento (25/02/2026)
- [x] Implementar httpOnly cookies + refresh tokens
- [x] Remover secrets expostos do wrangler.toml
- [x] Remover token Cloudflare do .claude/settings.local.json
- [x] Criar rotas POST /auth/refresh e POST /auth/logout
- [x] Atualizar CLAUDE.md com estado real (43 tabelas, status corretos)
- [x] Atualizar docs/status.md
- [ ] Desenvolver módulo Estoque MVP (schema, domain, repositories, controllers)
- [ ] Conectar frontend do Estoque à API real
- [ ] Criar testes automatizados para Estoque
- [ ] Criar PR estruturado

## Histórico recente
- **24/02/2026:** Reestruturação do repositório, governança CI/CD, confirmação de 43 tabelas
- **23/02/2026:** Documentação completa (24 módulos na Apostila-ERP)
- **22/02/2026:** Módulos Fase 1 e 2 documentados, auditoria código vs docs

## Roadmap (definido por Mesa Redonda GPT + Claude)
| Fase | Sprints | Módulos | Status |
|------|---------|---------|--------|
| Fase 1: MVP Operacional | 1-6 | Estoque, Financeiro, Compras, Omnichannel | Em andamento |
| Fase 2: Gestão Completa | 7-12 | Logística, BI, Auditoria, Comissões, Billing, Multi-Empresa | Planejado |

## Decisões técnicas pendentes
- Configurar ambientes staging/production no Wrangler
- Definir estratégia de testes (Vitest com @cloudflare/vitest-pool-workers)
- Configurar secrets de produção via `wrangler secret put`

## Problemas resolvidos (Sprint 1)
- ~~JWT em localStorage sem refresh token~~ → httpOnly cookies implementado
- ~~Secrets expostos no wrangler.toml~~ → Movidos para .dev.vars / wrangler secret
- ~~Token Cloudflare no settings.local.json~~ → Removido
- ~~Documentação desatualizada~~ → CLAUDE.md e status.md atualizados
