# ADR-003: Governança e CI/CD com GitHub Actions

**Data:** 2026-02-24
**Status:** Aceita — implementação em andamento

## Contexto
Deploys manuais sem verificação, documentação desatualizada, sem testes automáticos.

## Decisão
Implementar 4 pilares de governança:

### 1. GitHub Actions (CI/CD automático)
- **ci.yml:** A cada push/PR → typecheck + lint + test + build
- **deploy.yml:** Merge em main → migration Neon + deploy Workers
- Branch protection em `main`: requer CI verde antes de merge

### 2. Migrations seguras
- `drizzle-kit generate` local → gera SQL de migration
- `drizzle-kit migrate` no CI → aplica no Neon antes do deploy
- Nunca usar `drizzle-kit push` em produção

### 3. Qualidade de código
- ESLint 9 flat config + Prettier
- Husky pre-commit hooks (lint-staged)
- commitlint com Conventional Commits
- Vitest para testes unitários

### 4. Documentação viva
- CLAUDE.md como contexto para IA (atualizado a cada mudança)
- docs/status.md atualizado ao fim de cada sessão
- ADRs para decisões técnicas
- Conventional commits alimentam histórico
