
**URL:** https://dev.nuvemfiscal.com.br/docs/api

---

Pular para o conteúdo principal
Documentação
Referência API
Planos
Suporte
GERAL
Empresa
Conta
DOCUMENTOS FISCAIS
CteOs
Nfse
Dce
Nfcom
Cte
Mdfe
Nfe
Nfce
DISTRIBUIÇÃO DF-E
Distribuição NF-e
AUXILIARES
Debug
Email
Cnpj
Cep
Documentation Powered by Redocly
API Nuvem Fiscal (2.70.0)

Download OpenAPI specification:Download

API para automação comercial e documentos fiscais.

Empresa

Cadastre e administre todas as empresas vinculadas à sua conta.

Listar empresas

Retorna a lista das empresas associadas à sua conta. As empresas são retornadas ordenadas pela data da criação, com as mais recentes aparecendo primeiro.

AUTHORIZATIONS:
jwtoauth2
QUERY PARAMETERS
$top	
integer
Default: 10

Limite no número de objetos a serem retornados pela API, entre 1 e 100.


$skip	
integer
Default: 0

Quantidade de objetos que serão ignorados antes da lista começar a ser retornada.


$inlinecount	
boolean
Default: false

Inclui no JSON de resposta, na propriedade @count, o número total de registros que o filtro retornaria, independente dos filtros de paginação.


cpf_cnpj	
string

Filtrar pelo CPF ou CNPJ da empresa.

Utilize o valor sem máscara.


nome_razao_social	
string

Filtrar pelo nome ou razão social da empresa.

Esse filtro realiza uma correspondência pelo início do texto, retornando apenas empresas cujo nome ou razão social começam com o valor informado.

Caso o filtro pelo CPF ou CNPJ também seja informado na requisição, este filtro é ignorado.

Responses
200 

Successful response

GET
/empresas
Response samples
200
Content type
application/json
Copy
Expand allCollapse all
{
"@count": 0,
"data": 
[
{}
]
}
Cadastrar empresa

Cadastre uma nova empresa (emitente ou prestador) à sua conta.

AUTHORIZATIONS:
jwtoauth2
REQUEST BODY SCHEMA: application/json
cpf_cnpj
required
	
string

CPF ou CNPJ da empresa.

Utilize o valor sem máscara.


created_at	
string <date-time>

Data/hora em que o objeto foi criado na API. Representado no formato ISO 8601.

A API gerencia esse campo automaticamente. Caso algum valor seja enviado, ele será ignorado.


updated_at	
string <date-time>

Data e hora que o objeto foi alterado pela última vez na API. Representado no formato ISO 8601.

A API gerencia esse campo automaticamente. Caso algum valor seja enviado, ele será ignorado.


inscricao_estadual	
string <= 50 characters

Inscrição estadual da empresa.


inscricao_municipal	
string <= 50 characters

Inscrição municipal da empresa.


nome_razao_social
required
	
string <= 500 characters

Razão social da empresa.


nome_fantasia	
string <= 500 characters

Nome fantasia da empresa.


fone	
string

Telefone da empresa.


email
required
	
string

Email da empresa.


endereco
required
	
object (EmpresaEndereco)

Endereço da empresa.

Responses
200 

Successful response

POST
/empresas
Request samples
Payload
Content type
application/json
Copy
Expand allCollapse all
{
"cpf_cnpj": "string",
"created_at": "2019-08-24T14:15:22Z",
"updated_at": "2019-08-24T14:15:22Z",
"inscricao_estadual": "string",
"inscricao_municipal": "string",
"nome_razao_social": "string",
"nome_fantasia": "string",
"fone": "string",
"email": "string",
"endereco": 
{
"logradouro": "string",
"numero": "string",
"complemento": "string",
"bairro": "string",
"codigo_municipio": "string",
"cidade": "string",
"uf": "string",
"codigo_pais": "1058",
"pais": "Brasil",
"cep": "string"
}
}
Response samples
200
Content type
application/json
Copy
Expand allCollapse all
{
"cpf_cnpj": "string",
"created_at": "2019-08-24T14:15:22Z",
"updated_at": "2019-08-24T14:15:22Z",
"inscricao_estadual": "string",
"inscricao_municipal": "string",
"nome_razao_social": "string",
"nome_fantasia": "string",
"fone": "string",
"email": "string",
"endereco": 
{
"logradouro": "string",
"numero": "string",
"complemento": "string",
"bairro": "string",
"codigo_municipio": "string",
"cidade": "string",
"uf": "string",
"codigo_pais": "1058",
"pais": "Brasil",
"cep": "string"
}
}
Listar certificados

Retorna a lista dos certificados associadas à sua conta. Os certificados são retornados ordenados pela data da criação, com as mais recentes aparecendo primeiro.

AUTHORIZATIONS:
jwtoauth2
QUERY PARAMETERS
$top	
integer
Default: 10

Limite no número de objetos a serem retornados pela API, entre 1 e 100.


$skip	
integer
Default: 0

Quantidade de objetos que serão ignorados antes da lista começar a ser retornada.


$inlinecount	
boolean
Default: false

Inclui no JSON de resposta, na propriedade @count, o número total de registros que o filtro retornaria, independente dos filtros de paginação.


expires_in	
integer > 0

Filtrar certificados que expiram dentro de X dias.

Informe um número inteiro correspondente à quantidade de dias até o vencimento. Exemplos:

expires_in=30 -> certificados que vencem nos próximos 30 dias.
expires_in=7 -> certificados que vencem nos próximos 7 dias.

include_expired	
boolean
Default: true

Indicar se os certificados já vencidos devem ser incluídos no resultado.

Valores aceitos:

true: incluir certificados vencidos.
false: exibir apenas certificados válidos.
Responses
200 

Successful response

GET
/empresas/certificados
Response samples
200
Content type
application/json
Copy
Expand allCollapse all
{
"@count": 0,
"data": 
[
{}
]
}
Consultar empresa
AUTHORIZATIONS:
jwtoauth2
PATH PARAMETERS
cpf_cnpj
required
	
string

CPF ou CNPJ da empresa. Utilize o valor sem máscara.

Responses
200 

Successful response

GET
/empresas/{cpf_cnpj}
Response samples
200
Content type
application/json
Copy
Expand allCollapse all
{
"cpf_cnpj": "string",
"created_at": "2019-08-24T14:15:22Z",
"updated_at": "2019-08-24T14:15:22Z",
"inscricao_estadual": "string",
"inscricao_municipal": "string",
"nome_razao_social": "string",
"nome_fantasia": "string",
"fone": "string",
"email": "string",
"endereco": 
{
"logradouro": "string",
"numero": "string",
"complemento": "string",
"bairro": "string",
"codigo_municipio": "string",
"cidade": "string",
"uf": "string",
"codigo_pais": "1058",
"pais": "Brasil",
"cep": "string"
}
}
Alterar empresa

Altera o cadastro de uma empresa (emitente/prestador) que esteja associada a sua conta. Nesse método, por tratar-se de um PUT, caso algum campo não seja informado, o valor dele será apagado.

AUTHORIZATIONS:
jwtoauth2
PATH PARAMETERS
cpf_cnpj
required
	
string

CPF ou CNPJ da empresa. Utilize o valor sem máscara.

REQUEST BODY SCHEMA: application/json
cpf_cnpj
required
	
string

CPF ou CNPJ da empresa.

Utilize o valor sem máscara.


created_at	
string <date-time>

Data/hora em que o objeto foi criado na API. Representado no formato ISO 8601.

A API gerencia esse campo automaticamente. Caso algum valor seja enviado, ele será ignorado.


updated_at	
string <date-time>

Data e hora que o objeto foi alterado pela última vez na API. Representado no formato ISO 8601.

A API gerencia esse campo automaticamente. Caso algum valor seja enviado, ele será ignorado.


inscricao_estadual	
string <= 50 characters

Inscrição estadual da empresa.


inscricao_municipal	
string <= 50 characters

Inscrição municipal da empresa.


nome_razao_social
required
	
string <= 500 characters

Razão social da empresa.


nome_fantasia	
string <= 500 characters

Nome fantasia da empresa.


fone	
string

Telefone da empresa.


email
required
	
string

Email da empresa.


endereco
required
	
object (EmpresaEndereco)

Endereço da empresa.

Responses
200 

Successful response

PUT
/empresas/{cpf_cnpj}
Request samples
Payload
Content type
application/json
Copy
Expand allCollapse all
{
"cpf_cnpj": "string",
"created_at": "2019-08-24T14:15:22Z",
"updated_at": "2019-08-24T14:15:22Z",
"inscricao_estadual": "string",
"inscricao_municipal": "string",
"nome_razao_social": "string",
"nome_fantasia": "string",
"fone": "string",
"email": "string",
"endereco": 
{
"logradouro": "string",
"numero": "string",
"complemento": "string",
"bairro": "string",
"codigo_municipio": "string",
"cidade": "string",
"uf": "string",
"codigo_pais": "1058",
"pais": "Brasil",
"cep": "string"
}
}
Response samples
200
Content type
application/json
Copy
Expand allCollapse all
{
"cpf_cnpj": "string",
"created_at": "2019-08-24T14:15:22Z",
"updated_at": "2019-08-24T14:15:22Z",
"inscricao_estadual": "string",
"inscricao_municipal": "string",
"nome_razao_social": "string",
"nome_fantasia": "string",
"fone": "string",
"email": "string",
"endereco": 
{
"logradouro": "string",
"numero": "string",
"complemento": "string",
"bairro": "string",
"codigo_municipio": "string",
"cidade": "string",
"uf": "string",
"codigo_pais": "1058",
"pais": "Brasil",
"cep": "string"
}
}
Deletar empresa
AUTHORIZATIONS:
jwtoauth2
PATH PARAMETERS
cpf_cnpj
required
	
string

CPF ou CNPJ da empresa. Utilize o valor sem máscara.

Responses
204 

Successful response

DELETE
/empresas/{cpf_cnpj}
Consultar certificado
AUTHORIZATIONS:
jwtoauth2
PATH PARAMETERS
cpf_cnpj
required
	
string

CPF ou CNPJ da empresa. Utilize o valor sem máscara.

Responses
200 

Successful response

GET
/empresas/{cpf_cnpj}/certificado
Response samples
200
Content type
application/json
Copy
{
"id": "string",
"created_at": "2019-08-24T14:15:22Z",
"serial_number": "string",
"issuer_name": "string",
"not_valid_before": "2019-08-24T14:15:22Z",
"not_valid_after": "2019-08-24T14:15:22Z",
"thumbprint": "string",
"subject_name": "string",
"cpf_cnpj": "string",
"nome_razao_social": "string"
}
Cadastrar certificado

Cadastre ou atualize um certificado digital e vincule a sua empresa, para que possa iniciar a emissão de notas.

No parâmetro certificado, envie o binário do certificado digital (.pfx ou .p12) codificado em base64.
AUTHORIZATIONS:
jwtoauth2
PATH PARAMETERS
cpf_cnpj
required
	
string

CPF ou CNPJ da empresa. Utilize o valor sem máscara.

REQUEST BODY SCHEMA: application/json
certificado
required
	
string <byte>

Binário do certificado digital (.pfx ou .p12) codificado em base64.


password
required
	
string

Senha do certificado.

Responses
200 

Successful response

PUT
/empresas/{cpf_cnpj}/certificado
Request samples
Payload
Content type
application/json
Copy
{
"certificado": "string",
"password": "string"
}
Response samples
200
Content type
application/json
Copy
{
"id": "string",
"created_at": "2019-08-24T14:15:22Z",
"serial_number": "string",
"issuer_name": "string",
"not_valid_before": "2019-08-24T14:15:22Z",
"not_valid_after": "2019-08-24T14:15:22Z",
"thumbprint": "string",
"subject_name": "string",
"cpf_cnpj": "string",
"nome_razao_social": "string"
}
Deletar certificado
AUTHORIZATIONS:
jwtoauth2
PATH PARAMETERS
cpf_cnpj
required
	
string

CPF ou CNPJ da empresa. Utilize o valor sem máscara.

Responses
204 

Successful response

DELETE
/empresas/{cpf_cnpj}/certificado
Upload de certificado

Cadastre ou atualize um certificado digital e vincule a sua empresa, para que possa iniciar a emissão de notas.

Utilize o content-type igual a multipart/form-data.
No parâmetro file, envie o binário do arquivo (.pfx ou .p12) do certificado digital.
No parâmetro password, envie a senha do certificado.
AUTHORIZATIONS:
jwtoauth2
PATH PARAMETERS
cpf_cnpj
required
	
string

CPF ou CNPJ da empresa. Utilize o valor sem máscara.

REQUEST BODY SCHEMA: multipart/form-data
Input	
string <binary>
Responses
200 

Successful response

PUT
/empresas/{cpf_cnpj}/certificado/upload
Response samples
200
Content type
application/json
Copy
{
"id": "string",
"created_at": "2019-08-24T14:15:22Z",
"serial_number": "string",
"issuer_name": "string",
"not_valid_before": "2019-08-24T14:15:22Z",
"not_valid_after": "2019-08-24T14:15:22Z",
"thumbprint": "string",
"subject_name": "string",
"cpf_cnpj": "string",
"nome_razao_social": "string"
}
Consultar configuração de CT-e
AUTHORIZATIONS:
jwtoauth2
PATH PARAMETERS
cpf_cnpj
required
	
string

CPF ou CNPJ da empresa. Utilize o valor sem máscara.

Responses
200 

Successful response

GET
/empresas/{cpf_cnpj}/cte
Response samples
200
Content type
application/json
Copy
{
"CRT": 3,
"ambiente": "homologacao"
}
Alterar configuração de CT-e
AUTHORIZATIONS:
jwtoauth2
PATH PARAMETERS
cpf_cnpj
required
	
string

CPF ou CNPJ da empresa. Utilize o valor sem máscara.

REQUEST BODY SCHEMA: application/json
CRT	
integer
Default: 3

Código de Regime Tributário. Este campo será preenchido com:

1 – Simples Nacional;
2 – Simples Nacional – excesso de sublimite de receita bruta;
3 – Regime Normal;
4 - Simples Nacional - Microempreendedor Individual (MEI).

ambiente
required
	
string
Enum: "homologacao" "producao"

Indica se a empresa irá emitir em produção ou homologação.

Responses
200 

Successful response

PUT
/empresas/{cpf_cnpj}/cte
Request samples
Payload
Content type
application/json
Copy
{
"CRT": 3,
"ambiente": "homologacao"
}
Response samples
200
Content type
application/json
Copy
{
"CRT": 3,
"ambiente": "homologacao"
}
Consultar configuração de CT-e OS
AUTHORIZATIONS:
jwtoauth2
PATH PARAMETERS
cpf_cnpj
required
	
string

CPF ou CNPJ da empresa. Utilize o valor sem máscara.

Responses
200 

Successful response

GET
/empresas/{cpf_cnpj}/cteos
Response samples
200
Content type
application/json
Copy
{
"CRT": 3,
"ambiente": "homologacao"
}
Alterar configuração de CT-e OS
AUTHORIZATIONS:
jwtoauth2
PATH PARAMETERS
cpf_cnpj
required
	
string

CPF ou CNPJ da empresa. Utilize o valor sem máscara.

REQUEST BODY SCHEMA: application/json
CRT	
integer
Default: 3

Código de Regime Tributário. Este campo será preenchido com:

1 – Simples Nacional;
2 – Simples Nacional – excesso de sublimite de receita bruta;
3 – Regime Normal;
4 - Simples Nacional - Microempreendedor Individual (MEI).

ambiente
required
	
string
Enum: "homologacao" "producao"

Indica se a empresa irá emitir em produção ou homologação.

Responses
200 

Successful response

PUT
/empresas/{cpf_cnpj}/cteos
Request samples
Payload
Content type
application/json
Copy
{
"CRT": 3,
"ambiente": "homologacao"
}
Response samples
200
Content type
application/json
Copy
{
"CRT": 3,
"ambiente": "homologacao"
}
Consultar configuração de DC-e
AUTHORIZATIONS:
jwtoauth2
PATH PARAMETERS
cpf_cnpj
required
	
string

CPF ou CNPJ da empresa. Utilize o valor sem máscara.

Responses
200 

Successful response

GET
/empresas/{cpf_cnpj}/dce
Response samples
200
Content type
application/json
Copy
{
"ambiente": "homologacao"
}
Alterar configuração de DC-e
AUTHORIZATIONS:
jwtoauth2
PATH PARAMETERS
cpf_cnpj
required
	
string

CPF ou CNPJ da empresa. Utilize o valor sem máscara.

REQUEST BODY SCHEMA: application/json
ambiente
required
	
string
Enum: "homologacao" "producao"

Indica se a empresa irá emitir em produção ou homologação.

Responses
200 

Successful response

PUT
/empresas/{cpf_cnpj}/dce
Request samples
Payload
Content type
application/json
Copy
{
"ambiente": "homologacao"
}
Response samples
200
Content type
application/json
Copy
{
"ambiente": "homologacao"
}
Consultar configuração de Distribuição de NF-e
AUTHORIZATIONS:
jwtoauth2
PATH PARAMETERS
cpf_cnpj
required
	
string

CPF ou CNPJ da empresa. Utilize o valor sem máscara.

Responses
200 

Successful response

GET
/empresas/{cpf_cnpj}/distnfe
Response samples
200
Content type
application/json
Copy
{
"distribuicao_automatica": false,
"distribuicao_intervalo_horas": 24,
"ciencia_automatica": false,
"ambiente": "homologacao"
}
Alterar configuração de Distribuição de NF-e
AUTHORIZATIONS:
jwtoauth2
PATH PARAMETERS
cpf_cnpj
required
	
string

CPF ou CNPJ da empresa. Utilize o valor sem máscara.

REQUEST BODY SCHEMA: application/json
distribuicao_automatica	
boolean or null
Default: false

Indica se a distribuição automática está habilitada.

Quando ativada, a API realizará automaticamente pedidos de distribuição de notas fiscais eletrônicas (NF-e) utilizando o último NSU.

A frequência dessas distribuições é controlada pelo campo distribuicao_intervalo_horas, cujo valor padrão é 24 horas (uma vez ao dia).


distribuicao_intervalo_horas	
integer or null [ 1 .. 24 ]
Default: 24

Define o intervalo mínimo, em horas, entre distribuições automáticas de documentos.

Esse valor determina com que frequência a API executará novas requisições automáticas de distribuição de notas fiscais eletrônicas (NF-e).

(Content truncated due to size limit. Use line ranges to read remaining content)