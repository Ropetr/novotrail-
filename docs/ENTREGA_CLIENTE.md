## Entrega para cliente (resumo executivo)

Este roteiro serve para entregar o sistema funcionando para um cliente.

### 1) Configurar ambiente
- Definir dominio/subdominio do cliente
- Definir variaveis:
  - `JWT_SECRET`
  - `BASE_DOMAIN` (quando usar subdominios)

### 2) Banco de dados
- Criar D1 do cliente
- Aplicar migracoes
- (Opcional) Rodar seed inicial

### 3) Usuario inicial
- Criar usuario admin (email e senha do cliente)
- Confirmar login no frontend

### 4) Validacao rapida
- Acessar dashboard
- Abrir clientes/fornecedores/produtos
- Criar um cadastro simples e salvar

### 5) Entregar credenciais
- Enviar URL, usuario e senha
- Orientar troca de senha no primeiro acesso

