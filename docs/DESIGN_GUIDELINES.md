# Design Guidelines (Sistema)

Este documento define o padrão visual do ERP para garantir consistência entre telas.

## 1) Cores
- Cor primária (ícones e seleção): usar `--primary` (mesmo tom do sidebar)
- Erros/alertas: usar `--destructive`
- Texto principal: `text-foreground`
- Texto secundário: `text-muted-foreground`

## 2) Espaçamentos
- Cabeçalho de tabela: altura `h-8`, padding vertical `py-0`
- Rodapé/paginação: altura `h-8`
- Campos de formulário: altura padrão `h-8`
- Espaçamento entre seções: `space-y-3` (ou `space-y-4` quando necessário)

## 3) Tipografia
- Títulos de cards: `text-lg`
- Subtítulos: `text-sm` / `text-xs`
- Dados técnicos (CPF/CNPJ/EAN/SKU): `font-mono`

## 4) Tabelas
- Linha zebra: alternar `bg-card` e `bg-muted/10`
- Hover: `hover:bg-muted/30`
- Sem borda extra além de `border-b`

## 5) Abas (Tabs)
- Altura padrão de tabs: `h-8`
- Linha de seleção integrada (estilo chrome)
- Ícone de fechar sempre visível (exceto Dashboard)

## 6) Paginação
- Botões apenas com ícone
- Número da página como texto em `text-primary`
- Barra com altura `h-8`

## 7) Ícones
- Ícones no corpo seguem `text-primary` (sem fundo)
- Ícones informativos em `text-muted-foreground`

---

Este padrão deve ser aplicado em novos módulos e revisões futuras.
