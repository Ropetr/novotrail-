import { z } from 'zod';

// ============================================
// SCHEMAS DE VALIDACAO - EMPRESA
// ============================================

export const empresaEnderecoSchema = z.object({
  logradouro: z.string().min(1, 'Logradouro e obrigatorio'),
  numero: z.string().min(1, 'Numero e obrigatorio'),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro e obrigatorio'),
  codigo_municipio: z.string().min(1, 'Codigo do municipio e obrigatorio'),
  cidade: z.string().min(1, 'Cidade e obrigatoria'),
  uf: z.string().length(2, 'UF deve ter 2 caracteres'),
  codigo_pais: z.string().default('1058'),
  pais: z.string().default('Brasil'),
  cep: z.string().min(8, 'CEP invalido'),
});

export const empresaSchema = z.object({
  cpf_cnpj: z.string().min(11).max(14, 'CPF/CNPJ invalido'),
  inscricao_estadual: z.string().max(50).optional(),
  inscricao_municipal: z.string().max(50).optional(),
  nome_razao_social: z.string().min(1).max(500, 'Nome/Razao Social e obrigatorio'),
  nome_fantasia: z.string().max(500).optional(),
  fone: z.string().optional(),
  email: z.string().email('Email invalido'),
  endereco: empresaEnderecoSchema,
});

export const listarEmpresasSchema = z.object({
  $top: z.number().int().min(1).max(100).optional(),
  $skip: z.number().int().min(0).optional(),
  $inlinecount: z.boolean().optional(),
  cpf_cnpj: z.string().optional(),
  nome_razao_social: z.string().optional(),
});

// ============================================
// SCHEMAS DE VALIDACAO - CERTIFICADO
// ============================================

export const cadastrarCertificadoBase64Schema = z.object({
  certificado: z.string().min(1, 'Certificado (base64) e obrigatorio'),
  password: z.string().min(1, 'Senha e obrigatoria'),
});

export const listarCertificadosSchema = z.object({
  $top: z.number().int().min(1).max(100).optional(),
  $skip: z.number().int().min(0).optional(),
  $inlinecount: z.boolean().optional(),
  expires_in: z.number().int().positive().optional(),
  include_expired: z.boolean().optional(),
});

// ============================================
// SCHEMAS DE VALIDACAO - CNPJ
// ============================================

export const consultarCNPJSchema = z.object({
  cnpj: z.string().min(11).max(18, 'CNPJ invalido'),
});

// ============================================
// SCHEMAS DE VALIDACAO - CONFIGURACOES
// ============================================

export const configuracaoCTeSchema = z.object({
  CRT: z.number().int().min(1).max(4).default(3),
  ambiente: z.enum(['homologacao', 'producao']),
});

export const configuracaoDCeSchema = z.object({
  ambiente: z.enum(['homologacao', 'producao']),
});

export const configuracaoDistribuicaoNFeSchema = z.object({
  distribuicao_automatica: z.boolean().nullable().optional(),
  distribuicao_intervalo_horas: z.number().int().min(1).max(24).nullable().optional(),
  ciencia_automatica: z.boolean().nullable().optional(),
  ambiente: z.enum(['homologacao', 'producao']),
});

// ============================================
// SCHEMAS DE VALIDACAO - FISCAL CONFIG (Onda 0)
// ============================================

export const updateFiscalConfigSchema = z.object({
  cnpjEmpresa: z.string().length(14).optional(),
  ieEmpresa: z.string().max(20).optional(),
  razaoSocial: z.string().max(500).optional(),
  regimeTributario: z.enum(['simples_nacional', 'lucro_presumido', 'lucro_real']).optional(),
  ufEmpresa: z.string().length(2).optional(),
  codigoMunicipioIbge: z.string().length(7).optional(),
  inboxSyncAutomatico: z.boolean().optional(),
  inboxIntervaloMinutos: z.number().int().min(15).max(1440).optional(),
  inboxManifestacaoAutomatica: z.boolean().optional(),
  inboxTipoManifestacaoAuto: z.string().optional(),
  emissaoAmbiente: z.enum(['homologacao', 'producao']).optional(),
  emissaoSerieNfe: z.number().int().min(1).max(999).optional(),
  emissaoSerieNfse: z.number().int().min(1).max(999).optional(),
  emissaoSerieCte: z.number().int().min(1).max(999).optional(),
  gnreGeracaoAutomatica: z.boolean().optional(),
  adrcstOpcaoRecuperacao: z.boolean().optional(),
  adrcstOpcaoRessarcimento: z.boolean().optional(),
  adrcstOpcaoComplementacao: z.boolean().optional(),
  onboardingCompleto: z.boolean().optional(),
  onboardingEtapaAtual: z.number().int().min(0).max(5).optional(),
});

// ============================================
// SCHEMAS DE VALIDACAO - PRODUCT TAX RULES (Onda 0)
// ============================================

export const createProductTaxRuleSchema = z.object({
  ufDestino: z.string().length(2).nullable().optional(),
  tipoOperacao: z.string().max(20).default('venda'),
  tipoCliente: z.string().max(20).nullable().default('contribuinte'),
  cfopDentroEstado: z.string().length(4),
  cfopForaEstado: z.string().length(4),
  cstIcms: z.string().max(3).nullable().optional(),
  csosn: z.string().max(4).nullable().optional(),
  aliquotaIcms: z.string().optional().default('0'),
  aliquotaIcmsSt: z.string().optional().default('0'),
  reducaoBc: z.string().optional().default('0'),
  mva: z.string().optional().default('0'),
  aliquotaIcmsInterestadual: z.string().nullable().optional(),
  cstIpi: z.string().max(2).optional().default('99'),
  aliquotaIpi: z.string().optional().default('0'),
  cstPis: z.string().max(2).optional().default('49'),
  aliquotaPis: z.string().optional().default('0'),
  cstCofins: z.string().max(2).optional().default('49'),
  aliquotaCofins: z.string().optional().default('0'),
  codigoBeneficio: z.string().max(10).nullable().optional(),
  isDefault: z.boolean().optional().default(true),
});

export const updateProductTaxRuleSchema = createProductTaxRuleSchema.partial();

export const seedTaxRulesSchema = z.object({
  tipoOperacao: z.string().max(20).default('venda'),
  overwrite: z.boolean().default(false),
});
