# Checklist Técnico (Antes de Release)

## 1) Qualidade de Código
- Rodar lint/format (quando definido)
- Sem erros de TypeScript
- Sem warnings críticos no console

## 2) Backend
- `pnpm db:migrate` executado sem erro
- `pnpm dev` inicia sem erros
- Endpoints principais respondem (auth + cadastros)

## 3) Frontend
- `pnpm dev` inicia sem erros
- Login funciona
- Telas principais abrem sem erro
- Paginação e filtros funcionam

## 4) Integração
- Frontend acessa backend (`VITE_API_URL` ok)
- Header `x-tenant-id` enviado em dev
- Resposta segue padrão definido

## 5) Segurança
- Nenhum segredo em docs públicas
- `.env` e `.dev.vars` fora do Git

---

Este checklist deve ser preenchido antes de cada entrega ou release.
