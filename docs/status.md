# Status do Projeto — NovoTrail ERP

**Última atualização:** 2026-02-27
**Sprint atual:** Backbone Operacional completo + Início Omnichannel

---

## O que está funcionando em produção
- **API:** https://novotrail-api.planacacabamentos.workers.dev
- **Módulos ativos:** Auth, Cadastros, Produtos, Comercial, Fiscal, CRM, Estoque, Financeiro
- **Banco:** Neon PostgreSQL com 74 tabelas (via Hyperdrive)
- **Login teste:** <CREDENCIAIS_EM_ENV_VARS -- ver .dev.vars>

## O que foi feito (24/02/2026)
- [x] Validação completa do banco Neon via API REST (41 tabelas confirmadas)
- [x] Confirmação das 18 tabelas omni_* do módulo Omnichannel
- [x] Pesquisa de governança CI/CD (GitHub Actions + Neon + Cloudflare)
- [x] Reestruturação do repositório: CLAUDE.md, docs/, .github/, configs

## O que foi feito (27/02/2026)
- [x] Expansão do schema para 74 tabelas (Estoque 16, Financeiro 10, Fiscal 3, Configurações 1)
- [x] Backend de Estoque e Financeiro implementados
- [x] Backend de Configurações e Tenant implementados (parcial)
- [x] Atualização da documentação (CLAUDE.md, status.md, Apostila-ERP/README.md) para refletir estado real
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
- Sem CI/CD — deploys são manuais via `wrangler deploy`
- JWT em localStorage sem refresh token (vulnerabilidade)

## Problemas corrigidos
- CLAUDE.md atualizado: contagem de tabelas corrigida de 41 para 74
- Apostila-ERP/README.md atualizado: referência a D1 substituída por Neon PostgreSQL via Hyperdrive
- status.md removida referência a PLANO_DE_ACAO.md (arquivo inexistente)
