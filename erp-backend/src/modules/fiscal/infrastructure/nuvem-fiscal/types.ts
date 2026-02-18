/**
 * Tipos e interfaces da API Nuvem Fiscal
 * Baseado na documentacao v2.70.0
 */

// ============================================
// TIPOS GERAIS
// ============================================

export type AmbienteNuvemFiscal = 'homologacao' | 'producao';

export type RegimeTributario = 1 | 2 | 3 | 4;
// 1 = Simples Nacional
// 2 = Simples Nacional - Excesso de Sublimite
// 3 = Regime Normal
// 4 = MEI (Microempreendedor Individual)

export interface PaginacaoRequest {
  $top?: number; // Limite entre 1 e 100 (padrao: 10)
  $skip?: number; // Numero de registros a ignorar (padrao: 0)
  $inlinecount?: boolean; // Incluir total de registros (padrao: false)
}

export interface PaginacaoResponse<T> {
  '@count'?: number;
  data: T[];
}

// ============================================
// EMPRESA
// ============================================

export interface EmpresaEndereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  codigo_municipio: string;
  cidade: string;
  uf: string;
  codigo_pais: string; // Padrao: "1058" (Brasil)
  pais: string; // Padrao: "Brasil"
  cep: string;
}

export interface Empresa {
  cpf_cnpj: string; // Sem mascara
  created_at?: string; // ISO 8601 (gerenciado pela API)
  updated_at?: string; // ISO 8601 (gerenciado pela API)
  inscricao_estadual?: string; // Max 50 caracteres
  inscricao_municipal?: string; // Max 50 caracteres
  nome_razao_social: string; // Max 500 caracteres
  nome_fantasia?: string; // Max 500 caracteres
  fone?: string;
  email: string;
  endereco: EmpresaEndereco;
}

export interface ListarEmpresasRequest extends PaginacaoRequest {
  cpf_cnpj?: string; // Filtrar por CPF/CNPJ (sem mascara)
  nome_razao_social?: string; // Filtrar por nome/razao social (inicio do texto)
}

export type ListarEmpresasResponse = PaginacaoResponse<Empresa>;

// ============================================
// CERTIFICADO DIGITAL
// ============================================

export interface CertificadoDigital {
  id: string;
  created_at: string; // ISO 8601
  serial_number: string;
  issuer_name: string;
  not_valid_before: string; // ISO 8601
  not_valid_after: string; // ISO 8601
  thumbprint: string;
  subject_name: string;
  cpf_cnpj: string;
  nome_razao_social: string;
}

export interface CadastrarCertificadoBase64Request {
  certificado: string; // Base64 do arquivo .pfx ou .p12
  password: string; // Senha do certificado
}

export interface ListarCertificadosRequest extends PaginacaoRequest {
  expires_in?: number; // Filtrar por dias ate expiracao (ex: 30, 7)
  include_expired?: boolean; // Incluir certificados vencidos (padrao: true)
}

export type ListarCertificadosResponse = PaginacaoResponse<CertificadoDigital>;

// ============================================
// CONFIGURACOES DE DOCUMENTOS FISCAIS
// ============================================

export interface ConfiguracaoCTe {
  CRT: RegimeTributario; // Padrao: 3 (Regime Normal)
  ambiente: AmbienteNuvemFiscal;
}

export interface ConfiguracaoCTeOS {
  CRT: RegimeTributario; // Padrao: 3 (Regime Normal)
  ambiente: AmbienteNuvemFiscal;
}

export interface ConfiguracaoDCe {
  ambiente: AmbienteNuvemFiscal;
}

export interface ConfiguracaoDistribuicaoNFe {
  distribuicao_automatica?: boolean | null; // Padrao: false
  distribuicao_intervalo_horas?: number | null; // 1-24, Padrao: 24
  ciencia_automatica?: boolean | null; // Padrao: false
  ambiente: AmbienteNuvemFiscal;
}

export interface ConfiguracaoNFe {
  CRT: RegimeTributario;
  ambiente: AmbienteNuvemFiscal;
}

export interface ConfiguracaoNFCe {
  CRT: RegimeTributario;
  CSC: string; // Codigo de Seguranca do Contribuinte
  CSC_id: string; // ID do CSC
  ambiente: AmbienteNuvemFiscal;
}

export interface ConfiguracaoNFSe {
  ambiente: AmbienteNuvemFiscal;
  provedor?: string; // Provedor do municipio
}

// ============================================
// CNPJ (CONSULTA)
// ============================================

export interface NaturezaJuridica {
  codigo: string;
  descricao: string;
}

export interface Porte {
  codigo: string;
  descricao: string;
}

export interface SituacaoCadastral {
  data: string; // YYYY-MM-DD
  codigo: string;
  descricao: string;
}

export interface MotivoSituacaoCadastral {
  data: string; // YYYY-MM-DD
  codigo: string;
  descricao: string;
}

export interface AtividadeEconomica {
  codigo: string;
  descricao: string;
}

export interface EnderecoCNPJ {
  tipo_logradouro: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  municipio: string;
  uf: string;
}

export interface Pais {
  codigo: string;
  descricao: string;
}

export interface ConsultaCNPJResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  data_inicio_atividade: string; // YYYY-MM-DD
  matriz: boolean;
  natureza_juridica: NaturezaJuridica;
  capital_social: number;
  porte: Porte;
  ente_federativo_responsavel: string;
  situacao_cadastral: SituacaoCadastral;
  motivo_situacao_cadastral: MotivoSituacaoCadastral;
  atividade_principal: AtividadeEconomica;
  atividades_secundarias: AtividadeEconomica[];
  endereco: EnderecoCNPJ;
  pais: Pais;
}

// ============================================
// OAUTH2 / AUTENTICACAO
// ============================================

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // Segundos ate expiracao
  scope?: string;
}

export interface OAuth2Config {
  client_id: string;
  client_secret: string;
  token_url: string;
  api_url: string;
}

// ============================================
// ERROS E RESPOSTAS GENERICAS
// ============================================

export interface NuvemFiscalError {
  status: number;
  error: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}
