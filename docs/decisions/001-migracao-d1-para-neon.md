# ADR-001: Migração de D1 (SQLite) para Neon PostgreSQL

**Data:** 2026-02-24
**Status:** Aceita e implementada

## Contexto
O TrailSystem ERP iniciou com Cloudflare D1 (SQLite serverless) como banco principal.
Com o crescimento para 41 tabelas e volume de 50K itens/mês da PLANAC, o D1 apresentou
limitações para as necessidades de um ERP completo (JOINs complexos, transações, tipos de dados).

## Decisão
Migrar para Neon PostgreSQL conectado via Cloudflare Hyperdrive.
- Banco: Neon PostgreSQL em sa-east-1 (São Paulo)
- Conexão em runtime: via Hyperdrive (cache de conexão na edge)
- Conexão para migrations: direta ao Neon (sem Hyperdrive)
- ORM: Drizzle ORM com dialeto postgresql

## Consequências
- ✅ PostgreSQL completo: tipos, transações, JOINs complexos, JSONB
- ✅ Hyperdrive elimina latência de conexão (6+ round-trips → 1)
- ✅ Neon branching permite bancos isolados por PR
- ✅ Custo mantém-se baixo (free tier Neon + Hyperdrive incluso)
- ⚠️ Scripts antigos do D1 precisam ser removidos do package.json
- ⚠️ TRAILSYSTEM_MASTER.md precisa ser atualizado
