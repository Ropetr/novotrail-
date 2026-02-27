# Status do Projeto — NovoTrail ERP

**Última atualização:** 2026-02-24
**Sprint atual:** Reestruturação de Governança + Início Omnichannel

---

## O que está funcionando em produção
- **API:** https://novotrail-api.planacacabamentos.workers.dev
- **Módulos ativos:** Auth, Cadastros, Produtos, Comercial, Fiscal, CRM
- **Banco:** Neon PostgreSQL com 41 tabelas (via Hyperdrive)
- **Login teste:** admin@demo.com / 123456

## O que foi feito hoje (24/02/2026)
- [x] Validação completa do banco Neon via API REST (41 tabelas confirmadas)
- [x] Confirmação das 19 tabelas omni_* do módulo Omnichannel
- [x] Pesquisa de governança CI/CD (GitHub Actions + Neon + Cloudflare)
- [x] Reestruturação do repositório: CLAUDE.md, docs/, .github/, configs
- [ ] Backend do Omnichannel (próximo passo)

## Backlog prioritário
1. **Reestruturação do repo** — CI/CD, linting, docs atualizados
2. **Backend Omnichannel** — CRUDs de canais, contatos, conversas, mensagens, filas
3. **Frontend Omnichannel** — Inbox unificado conectado à API real
4. **Segurança** — JWT com refresh tokens em httpOnly cookies

## Decisões técnicas pendentes
- Migrar JWT de localStorage para httpOnly cookies
- Configurar ambientes staging/production no Wrangler
- Definir estratégia de testes (Vitest com @cloudflare/vitest-pool-workers)

## Problemas conhecidos
- Scripts do package.json da API ainda referenciam D1 (db:migrate)
- TRAILSYSTEM_MASTER.md referencia D1 como banco principal
- PLANO_DE_ACAO.md desatualizado (etapas não refletem estado real)
- Sem CI/CD — deploys são manuais via `wrangler deploy`
- JWT em localStorage sem refresh token (vulnerabilidade)
