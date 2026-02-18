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
