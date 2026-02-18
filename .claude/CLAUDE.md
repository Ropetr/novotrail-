# CLAUDE.md - Configuração Global da Software House ERP

## 1. Visão Geral

Este arquivo define as regras, workflows e convenções globais para todos os agentes que trabalham no desenvolvimento do ERP. O objetivo é garantir consistência, qualidade e eficiência em todo o processo.

## 2. Princípios Gerais

- **Clean Architecture & DDD**: Todo o desenvolvimento deve seguir os princípios da Clean Architecture e do Domain-Driven Design, conforme detalhado na skill `erp-enterprise-developer`.
- **Verificação Contínua**: Todo trabalho deve ser verificável. Agentes devem sempre solicitar ou criar testes, screenshots ou outras formas de validação para suas implementações.
- **Comunicação Clara**: A comunicação entre agentes deve ser explícita e bem documentada, especialmente ao delegar tarefas e reportar resultados.
- **Gerenciamento de Contexto**: Use `/clear` entre tarefas não relacionadas para manter o contexto limpo. Use subagentes para tarefas de pesquisa intensiva.

## 3. Workflow Padrão de Desenvolvimento

O workflow `Explore -> Plan -> Implement -> Commit` é o padrão para novas features.

1.  **Explore**: Use o `Plan Mode` para investigar o código existente e entender os requisitos.
2.  **Plan**: Crie um plano de implementação detalhado. Para tarefas complexas, exija a aprovação do plano pelo Team Lead.
3.  **Implement**: Saia do `Plan Mode` e implemente a solução, seguindo o plano aprovado.
4.  **Commit**: Crie um commit com uma mensagem descritiva e abra um Pull Request.

## 4. Comandos e Ferramentas

- **Gerenciador de Pacotes**: Use `pnpm` para todas as operações de pacotes Node.js.
- **Testes**: Use `vitest` para testes unitários e de integração. Use `playwright` para testes E2E.
- **Git**: Siga o padrão de nomenclatura de branches `feature/nome-da-feature` ou `bugfix/nome-do-bug`. As mensagens de commit devem seguir o padrão Conventional Commits.

## 5. Skills Essenciais

As seguintes skills devem ser consideradas a base de conhecimento para o desenvolvimento:

- `@/home/ubuntu/skills/erp-stack-master/SKILL.md`
- `@/home/ubuntu/skills/erp-enterprise-developer/SKILL.md`
- `@/home/ubuntu/skills/softwarehouse-competencies-master/SKILL.md`

## 6. Configuração de Agent Teams

- **Modo de Exibição**: `tmux` para visualização em painéis divididos.
- **Modo de Delegação**: O Team Lead deve operar em `delegate mode` para focar na orquestração.
- **Aprovação de Plano**: Para tarefas críticas, a aprovação do plano pelo Team Lead é obrigatória para os teammates.
