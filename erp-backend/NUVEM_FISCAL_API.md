# Integração Nuvem Fiscal - Documentação de Endpoints

## Visão Geral

Implementação completa da integração com a API Nuvem Fiscal v2.70.0, seguindo Clean Architecture e DDD.

**Base URL**: `/api/v1/nuvem-fiscal`

**Autenticação**: Todas as rotas requerem autenticação via JWT (Bearer Token)

---

## Índice

1. [CNPJ](#cnpj)
2. [Empresa](#empresa)
3. [Certificado Digital](#certificado-digital)
4. [Configurações](#configuracoes)

---

## CNPJ

### Consultar CNPJ

Consulta dados completos de um CNPJ na Receita Federal via Nuvem Fiscal.

**Endpoint**: `POST /cnpj/consultar`

**Request Body**:
```json
{
  "cnpj": "11222333000181"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "cnpj": "11222333000181",
    "razao_social": "EMPRESA EXEMPLO LTDA",
    "nome_fantasia": "Exemplo Comércio",
    "inscricao_estadual": "123.456.789.012",
    "inscricao_municipal": "1234567",
    "data_inicio_atividade": "2010-05-15",
    "matriz": true,
    "natureza_juridica": {
      "codigo": "2062",
      "descricao": "Sociedade Limitada"
    },
    "capital_social": 100000.00,
    "porte": {
      "codigo": "03",
      "descricao": "Pequena Empresa"
    },
    "ente_federativo_responsavel": "SP",
    "situacao_cadastral": {
      "data": "2010-05-15",
      "codigo": "01",
      "descricao": "Ativa"
    },
    "motivo_situacao_cadastral": {
      "data": "2010-05-15",
      "codigo": "00",
      "descricao": "Sem motivo"
    },
    "atividade_principal": {
      "codigo": "4711301",
      "descricao": "Comércio varejista de mercadorias em geral"
    },
    "atividades_secundarias": [
      {
        "codigo": "4711302",
        "descricao": "Comércio varejista de mercadorias em geral"
      }
    ],
    "endereco": {
      "tipo_logradouro": "Rua",
      "logradouro": "Exemplo",
      "numero": "123",
      "complemento": "Sala 10",
      "bairro": "Centro",
      "cep": "01310100",
      "municipio": "São Paulo",
      "uf": "SP"
    },
    "pais": {
      "codigo": "1058",
      "descricao": "Brasil"
    }
  }
}
```

**Response (400)** - CNPJ Inválido:
```json
{
  "success": false,
  "error": "CNPJ inválido",
  "details": { "cnpj": "11222333000182" }
}
```

---

## Empresa

### Listar Empresas

Lista todas as empresas cadastradas na conta Nuvem Fiscal.

**Endpoint**: `GET /empresas`

**Query Parameters**:
- `$top` (optional, number): Limite de resultados (1-100, padrão: 10)
- `$skip` (optional, number): Número de registros a ignorar (padrão: 0)
- `$inlinecount` (optional, boolean): Incluir contagem total (padrão: false)
- `cpf_cnpj` (optional, string): Filtrar por CPF/CNPJ (sem máscara)
- `nome_razao_social` (optional, string): Filtrar por nome/razão social

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "@count": 10,
    "data": [
      {
        "cpf_cnpj": "11222333000181",
        "nome_razao_social": "EMPRESA EXEMPLO LTDA",
        "nome_fantasia": "Exemplo",
        "email": "contato@exemplo.com.br",
        "inscricao_estadual": "123456789",
        "inscricao_municipal": "987654",
        "fone": "11999999999",
        "endereco": {
          "logradouro": "Rua Exemplo",
          "numero": "123",
          "complemento": "Sala 10",
          "bairro": "Centro",
          "codigo_municipio": "3550308",
          "cidade": "São Paulo",
          "uf": "SP",
          "codigo_pais": "1058",
          "pais": "Brasil",
          "cep": "01310100"
        },
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### Cadastrar Empresa

Cadastra uma nova empresa (emitente/prestador) na Nuvem Fiscal.

**Endpoint**: `POST /empresas`

**Request Body**:
```json
{
  "cpf_cnpj": "11222333000181",
  "nome_razao_social": "EMPRESA EXEMPLO LTDA",
  "nome_fantasia": "Exemplo",
  "email": "contato@exemplo.com.br",
  "inscricao_estadual": "123456789",
  "inscricao_municipal": "987654",
  "fone": "11999999999",
  "endereco": {
    "logradouro": "Rua Exemplo",
    "numero": "123",
    "complemento": "Sala 10",
    "bairro": "Centro",
    "codigo_municipio": "3550308",
    "cidade": "São Paulo",
    "uf": "SP",
    "codigo_pais": "1058",
    "pais": "Brasil",
    "cep": "01310100"
  }
}
```

**Response (200)**: Retorna a empresa criada

---

### Consultar Empresa

Consulta dados de uma empresa específica.

**Endpoint**: `GET /empresas/:cpf_cnpj`

**Path Parameters**:
- `cpf_cnpj`: CPF/CNPJ da empresa (sem máscara)

**Response (200)**: Retorna dados completos da empresa

---

### Alterar Empresa

Altera dados de uma empresa existente.

**ATENÇÃO**: Este é um método PUT - campos não informados serão apagados!

**Endpoint**: `PUT /empresas/:cpf_cnpj`

**Path Parameters**:
- `cpf_cnpj`: CPF/CNPJ da empresa (sem máscara)

**Request Body**: Mesmo formato do POST

**Response (200)**: Retorna empresa atualizada

---

### Deletar Empresa

Remove uma empresa da conta Nuvem Fiscal.

**Endpoint**: `DELETE /empresas/:cpf_cnpj`

**Path Parameters**:
- `cpf_cnpj`: CPF/CNPJ da empresa (sem máscara)

**Response (204)**: Sem conteúdo

---

## Certificado Digital

### Listar Certificados

Lista todos os certificados cadastrados na conta.

**Endpoint**: `GET /certificados`

**Query Parameters**:
- `$top` (optional, number): Limite de resultados (1-100, padrão: 10)
- `$skip` (optional, number): Número de registros a ignorar (padrão: 0)
- `$inlinecount` (optional, boolean): Incluir contagem total
- `expires_in` (optional, number): Filtrar por dias até expiração (ex: 30, 7)
- `include_expired` (optional, boolean): Incluir certificados vencidos (padrão: true)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "@count": 5,
    "data": [
      {
        "id": "cert-123",
        "created_at": "2024-01-01T00:00:00Z",
        "serial_number": "123456789",
        "issuer_name": "AC SERASA RFB v5",
        "not_valid_before": "2024-01-01T00:00:00Z",
        "not_valid_after": "2025-01-01T00:00:00Z",
        "thumbprint": "ABC123...",
        "subject_name": "EMPRESA EXEMPLO LTDA:11222333000181",
        "cpf_cnpj": "11222333000181",
        "nome_razao_social": "EMPRESA EXEMPLO LTDA"
      }
    ]
  }
}
```

---

### Consultar Certificado

Consulta certificado de uma empresa específica.

**Endpoint**: `GET /empresas/:cpf_cnpj/certificado`

**Path Parameters**:
- `cpf_cnpj`: CPF/CNPJ da empresa (sem máscara)

**Response (200)**: Retorna dados do certificado

---

### Cadastrar Certificado (Base64)

Cadastra ou atualiza certificado digital enviando arquivo em base64.

**Endpoint**: `PUT /empresas/:cpf_cnpj/certificado`

**Path Parameters**:
- `cpf_cnpj`: CPF/CNPJ da empresa (sem máscara)

**Request Body**:
```json
{
  "certificado": "MIIKcAIBAz...", // Base64 do arquivo .pfx ou .p12
  "password": "senha-do-certificado"
}
```

**Response (200)**: Retorna dados do certificado cadastrado

---

### Deletar Certificado

Remove certificado de uma empresa.

**Endpoint**: `DELETE /empresas/:cpf_cnpj/certificado`

**Path Parameters**:
- `cpf_cnpj`: CPF/CNPJ da empresa (sem máscara)

**Response (204)**: Sem conteúdo

---

## Configurações

### CT-e (Conhecimento de Transporte Eletrônico)

#### Consultar Configuração

**Endpoint**: `GET /empresas/:cpf_cnpj/cte/config`

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "CRT": 3,
    "ambiente": "homologacao"
  }
}
```

#### Alterar Configuração

**Endpoint**: `PUT /empresas/:cpf_cnpj/cte/config`

**Request Body**:
```json
{
  "CRT": 3,
  "ambiente": "homologacao"
}
```

**CRT Values**:
- `1`: Simples Nacional
- `2`: Simples Nacional - Excesso de Sublimite
- `3`: Regime Normal (padrão)
- `4`: MEI (Microempreendedor Individual)

**ambiente Values**: `"homologacao"` | `"producao"`

---

## Tratamento de Erros

Todos os endpoints retornam erros no formato:

```json
{
  "success": false,
  "error": "Descrição do erro",
  "details": {
    // Informações adicionais sobre o erro
  }
}
```

**Códigos de Status**:
- `200`: Sucesso
- `204`: Sucesso sem conteúdo (DELETE)
- `400`: Dados inválidos
- `401`: Não autenticado
- `404`: Recurso não encontrado
- `422`: Erro de validação
- `429`: Limite de requisições atingido
- `500`: Erro interno do servidor

---

## Variáveis de Ambiente

Configure no `wrangler.toml` ou `.env`:

```toml
# Nuvem Fiscal - SANDBOX
NUVEM_FISCAL_CLIENT_ID = "r1QOKi55XgwNI3oHVoyH"
NUVEM_FISCAL_CLIENT_SECRET = "9jsQ8Ii9wMdZFZ4KX0YAycKqGryP6ho1ZFJqj9Cu"
NUVEM_FISCAL_API_URL = "https://api-sandbox.nuvemfiscal.com.br"
NUVEM_FISCAL_TOKEN_URL = "https://api-sandbox.nuvemfiscal.com.br/oauth/token"
```

Para **PRODUÇÃO**, altere para:
```toml
NUVEM_FISCAL_CLIENT_ID = "Wj2Ij3NZOZcUPHjTvtpA"
NUVEM_FISCAL_CLIENT_SECRET = "IRji37MTWZrF1M7OSgemmPYXX0syiwqvNmZVlyDF"
NUVEM_FISCAL_API_URL = "https://api.nuvemfiscal.com.br"
NUVEM_FISCAL_TOKEN_URL = "https://api.nuvemfiscal.com.br/oauth/token"
```

---

## Funcionalidades Implementadas

✅ **OAuth2** com cache de token
✅ **Consulta de CNPJ** completa
✅ **CRUD de Empresas** na Nuvem Fiscal
✅ **Gerenciamento de Certificado Digital** (Base64)
✅ **Configurações de CT-e**

## Próximas Funcionalidades

⏳ Emissão de NFe
⏳ Emissão de NFCe
⏳ Emissão de NFSe
⏳ Emissão de CTe
⏳ Distribuição e Manifestação de NF-e
⏳ Webhooks para eventos fiscais
⏳ Upload de Certificado via Multipart/Form-Data

---

## Arquitetura

```
src/
├── domain/
│   ├── entities/nuvem-fiscal/
│   │   └── NuvemFiscalTypes.ts
│   └── use-cases/nuvem-fiscal/
│       ├── ConsultarCNPJ.ts
│       ├── GerenciarEmpresa.ts
│       └── GerenciarCertificado.ts
│
├── infrastructure/
│   └── external-apis/nuvem-fiscal/
│       ├── NuvemFiscalAuthService.ts
│       ├── NuvemFiscalClient.ts
│       └── NuvemFiscalService.ts
│
└── presentation/
    ├── controllers/nuvem-fiscal/
    │   └── NuvemFiscalController.ts
    ├── routes/
    │   └── nuvem-fiscal.ts
    └── validators/nuvem-fiscal/
        └── schemas.ts
```

---

**Versão**: 1.0.0
**Última Atualização**: 12 de Fevereiro de 2026
**Desenvolvido com**: Clean Architecture + DDD
