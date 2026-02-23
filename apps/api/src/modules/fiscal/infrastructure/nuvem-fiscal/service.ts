import type {
  OAuth2Config,
  ApiResponse,
  Empresa,
  ListarEmpresasRequest,
  ListarEmpresasResponse,
  CertificadoDigital,
  ListarCertificadosRequest,
  ListarCertificadosResponse,
  CadastrarCertificadoBase64Request,
  ConsultaCNPJResponse,
  ConfiguracaoCTe,
  ConfiguracaoCTeOS,
  ConfiguracaoDCe,
  ConfiguracaoDistribuicaoNFe,
} from './types';
import { NuvemFiscalClient } from './client';

/**
 * Servico principal da API Nuvem Fiscal
 * Centraliza todas as operacoes disponiveis
 */
export class NuvemFiscalService {
  private client: NuvemFiscalClient;

  constructor(config: OAuth2Config) {
    this.client = new NuvemFiscalClient(config);
  }

  // ============================================
  // EMPRESA
  // ============================================

  /**
   * Lista todas as empresas associadas a conta
   */
  async listarEmpresas(params?: ListarEmpresasRequest): Promise<ApiResponse<ListarEmpresasResponse>> {
    return this.client.get<ListarEmpresasResponse>('/empresas', params);
  }

  /**
   * Cadastra uma nova empresa (emitente/prestador)
   */
  async cadastrarEmpresa(empresa: Empresa): Promise<ApiResponse<Empresa>> {
    return this.client.post<Empresa>('/empresas', empresa);
  }

  /**
   * Consulta dados de uma empresa especifica
   */
  async consultarEmpresa(cpfCnpj: string): Promise<ApiResponse<Empresa>> {
    const cpfCnpjLimpo = this.limparCpfCnpj(cpfCnpj);
    return this.client.get<Empresa>(`/empresas/${cpfCnpjLimpo}`);
  }

  /**
   * Altera dados de uma empresa existente
   * ATENCAO: Campos nao informados serao apagados (PUT)
   */
  async alterarEmpresa(cpfCnpj: string, empresa: Empresa): Promise<ApiResponse<Empresa>> {
    const cpfCnpjLimpo = this.limparCpfCnpj(cpfCnpj);
    return this.client.put<Empresa>(`/empresas/${cpfCnpjLimpo}`, empresa);
  }

  /**
   * Deleta uma empresa
   */
  async deletarEmpresa(cpfCnpj: string): Promise<ApiResponse<void>> {
    const cpfCnpjLimpo = this.limparCpfCnpj(cpfCnpj);
    return this.client.delete<void>(`/empresas/${cpfCnpjLimpo}`);
  }

  // ============================================
  // CERTIFICADO DIGITAL
  // ============================================

  /**
   * Lista todos os certificados associados a conta
   */
  async listarCertificados(params?: ListarCertificadosRequest): Promise<ApiResponse<ListarCertificadosResponse>> {
    return this.client.get<ListarCertificadosResponse>('/empresas/certificados', params);
  }

  /**
   * Consulta certificado de uma empresa especifica
   */
  async consultarCertificado(cpfCnpj: string): Promise<ApiResponse<CertificadoDigital>> {
    const cpfCnpjLimpo = this.limparCpfCnpj(cpfCnpj);
    return this.client.get<CertificadoDigital>(`/empresas/${cpfCnpjLimpo}/certificado`);
  }

  /**
   * Cadastra ou atualiza certificado digital (Base64)
   */
  async cadastrarCertificadoBase64(
    cpfCnpj: string,
    dados: CadastrarCertificadoBase64Request
  ): Promise<ApiResponse<CertificadoDigital>> {
    const cpfCnpjLimpo = this.limparCpfCnpj(cpfCnpj);
    return this.client.put<CertificadoDigital>(`/empresas/${cpfCnpjLimpo}/certificado`, dados);
  }

  /**
   * Upload de certificado digital via multipart/form-data
   */
  async uploadCertificado(
    cpfCnpj: string,
    file: Blob,
    password: string
  ): Promise<ApiResponse<CertificadoDigital>> {
    const cpfCnpjLimpo = this.limparCpfCnpj(cpfCnpj);
    return this.client.uploadFile(
      `/empresas/${cpfCnpjLimpo}/certificado/upload`,
      file,
      'certificado.pfx',
      { password }
    );
  }

  /**
   * Deleta certificado de uma empresa
   */
  async deletarCertificado(cpfCnpj: string): Promise<ApiResponse<void>> {
    const cpfCnpjLimpo = this.limparCpfCnpj(cpfCnpj);
    return this.client.delete<void>(`/empresas/${cpfCnpjLimpo}/certificado`);
  }

  // ============================================
  // CONFIGURACOES DE DOCUMENTOS FISCAIS
  // ============================================

  // CT-e
  async consultarConfiguracaoCTe(cpfCnpj: string): Promise<ApiResponse<ConfiguracaoCTe>> {
    const cpfCnpjLimpo = this.limparCpfCnpj(cpfCnpj);
    return this.client.get<ConfiguracaoCTe>(`/empresas/${cpfCnpjLimpo}/cte`);
  }

  async alterarConfiguracaoCTe(cpfCnpj: string, config: ConfiguracaoCTe): Promise<ApiResponse<ConfiguracaoCTe>> {
    const cpfCnpjLimpo = this.limparCpfCnpj(cpfCnpj);
    return this.client.put<ConfiguracaoCTe>(`/empresas/${cpfCnpjLimpo}/cte`, config);
  }

  // CT-e OS
  async consultarConfiguracaoCTeOS(cpfCnpj: string): Promise<ApiResponse<ConfiguracaoCTeOS>> {
    const cpfCnpjLimpo = this.limparCpfCnpj(cpfCnpj);
    return this.client.get<ConfiguracaoCTeOS>(`/empresas/${cpfCnpjLimpo}/cteos`);
  }

  async alterarConfiguracaoCTeOS(cpfCnpj: string, config: ConfiguracaoCTeOS): Promise<ApiResponse<ConfiguracaoCTeOS>> {
    const cpfCnpjLimpo = this.limparCpfCnpj(cpfCnpj);
    return this.client.put<ConfiguracaoCTeOS>(`/empresas/${cpfCnpjLimpo}/cteos`, config);
  }

  // DC-e
  async consultarConfiguracaoDCe(cpfCnpj: string): Promise<ApiResponse<ConfiguracaoDCe>> {
    const cpfCnpjLimpo = this.limparCpfCnpj(cpfCnpj);
    return this.client.get<ConfiguracaoDCe>(`/empresas/${cpfCnpjLimpo}/dce`);
  }

  async alterarConfiguracaoDCe(cpfCnpj: string, config: ConfiguracaoDCe): Promise<ApiResponse<ConfiguracaoDCe>> {
    const cpfCnpjLimpo = this.limparCpfCnpj(cpfCnpj);
    return this.client.put<ConfiguracaoDCe>(`/empresas/${cpfCnpjLimpo}/dce`, config);
  }

  // Distribuicao NF-e
  async consultarConfiguracaoDistribuicaoNFe(cpfCnpj: string): Promise<ApiResponse<ConfiguracaoDistribuicaoNFe>> {
    const cpfCnpjLimpo = this.limparCpfCnpj(cpfCnpj);
    return this.client.get<ConfiguracaoDistribuicaoNFe>(`/empresas/${cpfCnpjLimpo}/distnfe`);
  }

  async alterarConfiguracaoDistribuicaoNFe(
    cpfCnpj: string,
    config: ConfiguracaoDistribuicaoNFe
  ): Promise<ApiResponse<ConfiguracaoDistribuicaoNFe>> {
    const cpfCnpjLimpo = this.limparCpfCnpj(cpfCnpj);
    return this.client.put<ConfiguracaoDistribuicaoNFe>(`/empresas/${cpfCnpjLimpo}/distnfe`, config);
  }

  // ============================================
  // CNPJ (CONSULTA)
  // ============================================

  /**
   * Consulta dados completos de um CNPJ na Receita Federal
   */
  async consultarCNPJ(cnpj: string): Promise<ApiResponse<ConsultaCNPJResponse>> {
    const cnpjLimpo = this.limparCpfCnpj(cnpj);

    if (!this.validarCNPJ(cnpjLimpo)) {
      return {
        success: false,
        error: 'CNPJ invalido',
        details: { cnpj: cnpjLimpo },
      };
    }

    return this.client.get<ConsultaCNPJResponse>(`/cnpj/${cnpjLimpo}`);
  }

  // ============================================
  // UTILITARIOS
  // ============================================

  /**
   * Remove mascara de CPF/CNPJ
   */
  private limparCpfCnpj(cpfCnpj: string): string {
    return cpfCnpj.replace(/\D/g, '');
  }

  /**
   * Valida CNPJ usando digitos verificadores
   */
  private validarCNPJ(cnpj: string): boolean {
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    if (cnpjLimpo.length !== 14) {
      return false;
    }

    if (/^(\d)\1{13}$/.test(cnpjLimpo)) {
      return false;
    }

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
}
