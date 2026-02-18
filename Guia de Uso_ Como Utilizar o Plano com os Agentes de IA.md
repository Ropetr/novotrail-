# Guia de Uso: Como Utilizar o Plano com os Agentes de IA

**Autor:** Manus AI
**Data:** 9 de Fevereiro de 2026

---

## 1. Preparação Inicial

Antes de começar, certifique-se de que:

1. ✅ Você tem a pasta `.claude/` com os 16 agentes instalados em `Code1/`
2. ✅ O projeto `Template-Trailsystem-Completo-main` está dentro de `Code1/`
3. ✅ Você tem uma conta Cloudflare com plano **Pro**
4. ✅ Você tem o Claude Code instalado e funcionando

## 2. Estrutura do Projeto

Crie as seguintes pastas dentro de `Code1/`:

```bash
mkdir erp-frontend
mkdir erp-backend
```

Você pode copiar os componentes do `Template-Trailsystem-Completo-main` para o `erp-frontend` depois que o backend estiver pronto.

## 3. Iniciando a Fase 1

### Passo 1: Abra o Claude Code

```powershell
cd "C:\Users\WINDOWS GAMER\Desktop\Code1\Template-Trailsystem-Completo-main"
claude
```

### Passo 2: Digite o Prompt de Inicialização

Copie e cole este prompt no Claude Code:

```
Use o tech-lead para iniciar a Fase 1 do plano de transformação para uma arquitetura Cloudflare Pro.

O objetivo é criar a fundação do nosso ERP com frontend e backend desacoplados.

Tarefas:

1. **devops-engineer**: Crie a estrutura de monorepo com as pastas `erp-frontend` e `erp-backend` em `Code1/`. Configure os arquivos `package.json` básicos em cada uma e um `wrangler.toml` inicial para o backend.

2. **architect**: Projete a Clean Architecture para o backend Hono, definindo os layers (Domain, Application, Infrastructure, Presentation) e como eles interagem com os serviços da Cloudflare (D1, KV, Queues, Durable Objects, Analytics Engine).

3. **database-manager**: Configure o Drizzle ORM para se conectar a um banco de dados Cloudflare D1. Crie o schema inicial para multi-tenancy com as tabelas:
   - `tenants` (id, name, slug, created_at, updated_at)
   - `users` (id, tenant_id, email, password_hash, name, role, created_at, updated_at)
   - Adicione `tenant_id` a todas as futuras tabelas para isolamento de dados

4. **backend-developer**: Implemente a autenticação com registro e login usando Hono. Use Durable Objects para gerenciar as sessões de usuário (em vez de JWTs stateless, para permitir logout forçado e revogação de sessão).

5. **doc-writer**: Crie um documento com a arquitetura definida, os endpoints de autenticação (POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout) e as próximas instruções para a equipe de frontend.

Ao final, quero um relatório detalhado do que foi feito, os arquivos criados e os próximos passos para integração do frontend.
```

### Passo 3: Acompanhe a Execução

O Claude Code vai:

1. Invocar o `tech-lead` automaticamente
2. O `tech-lead` vai decompor as tarefas e chamar os agentes na sequência correta
3. Você verá o progresso em tempo real

**Tempo estimado:** 30-60 minutos, dependendo da complexidade.

## 4. Após a Fase 1

Quando a Fase 1 estiver completa, você terá:

- ✅ Estrutura de monorepo criada
- ✅ Backend Hono com autenticação funcionando
- ✅ Banco de dados D1 com schema de multi-tenancy
- ✅ Durable Objects para gerenciar sessões
- ✅ Documentação da arquitetura

### Próximo Passo: Fase 2

Para iniciar a Fase 2 (Módulo de Cadastros), use este prompt:

```
Use o tech-lead para iniciar a Fase 2 do plano de transformação: Módulo de Cadastros.

O objetivo é refatorar o módulo de Cadastros (Clientes, Fornecedores, Produtos) para usar a nova arquitetura Cloudflare, servindo como blueprint para todos os outros módulos.

Tarefas:

1. **architect**: Projete as entidades de domínio para `Client`, `Supplier` e `Product` com suas regras de negócio.

2. **database-manager**: Adicione as tabelas ao schema do D1 e crie as migrations do Drizzle.

3. **backend-developer**: Implemente os casos de uso (CRUD) e os endpoints da API no Hono para cada entidade. Use Cloudflare KV para cachear as listas.

4. **frontend-developer**: Refatore as telas de cadastro do template para consumir as novas APIs, removendo os dados estáticos.

5. **tester**: Escreva testes unitários para os casos de uso e testes de integração para os endpoints.

Ao final, quero um relatório com os endpoints implementados, exemplos de requisições e as instruções para testar.
```

## 5. Fluxo Recomendado de Trabalho

```
Fase 1 (Fundação)
    ↓
Fase 2 (Cadastros - Blueprint)
    ↓
Fase 3 (Módulos Core: Financeiro + Comercial)
    ↓
Fase 4 (Expansão: Estoque, Compras, Fiscal)
```

Cada fase deve ser completada e testada antes de iniciar a próxima.

## 6. Dicas Importantes

### 6.1 Mantendo o Contexto

Os agentes têm memória do projeto enquanto o Claude Code está aberto. Se fechar e reabrir, eles perderão o contexto. Para manter a continuidade:

- **Opção 1:** Deixe o Claude Code aberto entre as fases (mais fácil)
- **Opção 2:** Crie um arquivo `CONTEXT.md` na raiz do projeto com um resumo do que foi feito em cada fase

### 6.2 Comunicação entre Agentes

Os agentes se comunicam automaticamente. Por exemplo:

1. O `architect` define a estrutura
2. O `database-manager` lê a estrutura e cria o schema
3. O `backend-developer` lê o schema e implementa os endpoints
4. O `frontend-developer` lê os endpoints e integra no frontend

Não é necessário passar manualmente informações entre eles.

### 6.3 Revisão de Código

Após cada fase, o `code-reviewer` vai revisar todo o código produzido. Ele pode sugerir melhorias ou apontar problemas. Nesse caso:

1. Leia as sugestões
2. Peça ao agente responsável para corrigir
3. Peça ao `code-reviewer` para revisar novamente

### 6.4 Documentação

O `doc-writer` cria documentação automaticamente. Você pode pedir para:

- Gerar um README para o projeto
- Documentar os endpoints da API com OpenAPI/Swagger
- Criar um guia de contribuição para novos desenvolvedores

## 7. Troubleshooting

### Problema: O agente não entendeu a tarefa

**Solução:** Reescreva o prompt de forma mais clara e específica. Os agentes respondem melhor a instruções detalhadas.

### Problema: Faltam dependências ou pacotes

**Solução:** Peça ao `devops-engineer` para instalar as dependências necessárias. Ele tem acesso ao npm/pnpm.

### Problema: Erro ao conectar ao D1

**Solução:** Verifique se:
1. Você está logado na Cloudflare CLI (`wrangler login`)
2. A variável de ambiente `CLOUDFLARE_API_TOKEN` está configurada
3. O banco de dados foi criado na conta Cloudflare

### Problema: Os agentes estão lentos

**Solução:** Isso é normal em tarefas complexas. Deixe-os trabalharem. Se realmente travar, você pode interromper (Ctrl+C) e reiniciar o prompt.

## 8. Próximas Fases (Resumo)

| Fase | Objetivo | Duração Estimada |
|---|---|---|
| **Fase 1** | Fundação (Auth, D1, Durable Objects) | 1-2 dias |
| **Fase 2** | Cadastros (CRUD, Cache, Testes) | 2-3 dias |
| **Fase 3** | Módulos Core (Financeiro, Comercial, Queues) | 3-5 dias |
| **Fase 4** | Expansão (Estoque, Compras, Fiscal, Neon) | 5-7 dias |

**Total:** 11-17 dias de desenvolvimento com a equipe de agentes.

---

## 9. Suporte e Perguntas

Se tiver dúvidas durante o desenvolvimento:

1. Pergunte ao `tech-lead` (ele orquestra tudo)
2. Pergunte ao agente específico (ex: `architect` para questões de design)
3. Consulte a documentação gerada pelo `doc-writer`

Boa sorte com a transformação do seu ERP! 🚀
