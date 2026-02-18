import { api } from './api';

/**
 * Tipos para consulta de CNPJ
 */
export interface CNPJData {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  data_inicio_atividade: string;
  matriz: boolean;
  natureza_juridica: {
    codigo: string;
    descricao: string;
  };
  capital_social: number;
  porte: {
    codigo: string;
    descricao: string;
  };
  situacao_cadastral: {
    data: string;
    codigo: string;
    descricao: string;
  };
  atividade_principal: {
    codigo: string;
    descricao: string;
  };
  atividades_secundarias: Array<{
    codigo: string;
    descricao: string;
  }>;
  endereco: {
    tipo_logradouro: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cep: string;
    municipio: string;
    uf: string;
  };
  pais: {
    codigo: string;
    descricao: string;
  };
}

export interface CNPJResponse {
  success: boolean;
  data?: CNPJData;
  error?: string;
  details?: any;
}

/**
 * Consulta dados de um CNPJ na Nuvem Fiscal
 */
export async function consultarCNPJ(cnpj: string): Promise<CNPJResponse> {
  try {
    const response = await api.post<CNPJResponse>('/nuvem-fiscal/cnpj/consultar', {
      cnpj: cnpj.replace(/\D/g, ''), // Remove máscara
    });

    return response.data;
  } catch (error: any) {
    console.error('[NuvemFiscal] Erro ao consultar CNPJ:', error);

    // Se for erro de autenticação (401), propaga o erro para o interceptor tratar
    if (error.statusCode === 401 || error.message?.includes('authorization')) {
      throw error;
    }

    return {
      success: false,
      error: error.message || 'Erro ao consultar CNPJ',
      details: error,
    };
  }
}

/**
 * Valida CNPJ usando dígitos verificadores
 */
export function validarCNPJ(cnpj: string): boolean {
  const cnpjLimpo = cnpj.replace(/\D/g, '');

  if (cnpjLimpo.length !== 14) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) {
    return false;
  }

  // Validação do primeiro dígito verificador
  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  let digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) {
    return false;
  }

  // Validação do segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) {
    return false;
  }

  return true;
}

/**
 * Aplica máscara de CNPJ (##.###.###/####-##)
 */
export function aplicarMascaraCNPJ(value: string): string {
  const cnpjLimpo = value.replace(/\D/g, '');

  return cnpjLimpo
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18); // Limita ao tamanho máximo
}

/**
 * Remove máscara do CNPJ
 */
export function removerMascaraCNPJ(value: string): string {
  return value.replace(/\D/g, '');
}
