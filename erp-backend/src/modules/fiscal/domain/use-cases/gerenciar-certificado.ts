import { NuvemFiscalService } from '../../infrastructure/nuvem-fiscal/service';
import type {
  ApiResponse,
  CertificadoDigital,
  ListarCertificadosRequest,
  ListarCertificadosResponse,
  CadastrarCertificadoBase64Request,
} from '../../infrastructure/nuvem-fiscal/types';

/**
 * Use Case: Listar certificados
 */
export class ListarCertificadosUseCase {
  constructor(private nuvemFiscalService: NuvemFiscalService) {}

  async execute(params?: ListarCertificadosRequest): Promise<ApiResponse<ListarCertificadosResponse>> {
    return this.nuvemFiscalService.listarCertificados(params);
  }
}

/**
 * Use Case: Consultar certificado de uma empresa
 */
export class ConsultarCertificadoUseCase {
  constructor(private nuvemFiscalService: NuvemFiscalService) {}

  async execute(cpfCnpj: string): Promise<ApiResponse<CertificadoDigital>> {
    if (!cpfCnpj) {
      return { success: false, error: 'CPF/CNPJ e obrigatorio' };
    }

    return this.nuvemFiscalService.consultarCertificado(cpfCnpj);
  }
}

/**
 * Use Case: Cadastrar certificado (Base64)
 */
export class CadastrarCertificadoBase64UseCase {
  constructor(private nuvemFiscalService: NuvemFiscalService) {}

  async execute(cpfCnpj: string, dados: CadastrarCertificadoBase64Request): Promise<ApiResponse<CertificadoDigital>> {
    if (!cpfCnpj) {
      return { success: false, error: 'CPF/CNPJ e obrigatorio' };
    }

    if (!dados.certificado) {
      return { success: false, error: 'Certificado (base64) e obrigatorio' };
    }

    if (!dados.password) {
      return { success: false, error: 'Senha do certificado e obrigatoria' };
    }

    const resultado = await this.nuvemFiscalService.cadastrarCertificadoBase64(cpfCnpj, dados);

    if (resultado.success) {
      console.log(`[AUDIT] Certificado cadastrado para empresa: ${cpfCnpj}`);
    }

    return resultado;
  }
}

/**
 * Use Case: Upload de certificado (Multipart)
 */
export class UploadCertificadoUseCase {
  constructor(private nuvemFiscalService: NuvemFiscalService) {}

  async execute(cpfCnpj: string, file: Blob, password: string): Promise<ApiResponse<CertificadoDigital>> {
    if (!cpfCnpj) {
      return { success: false, error: 'CPF/CNPJ e obrigatorio' };
    }

    if (!file) {
      return { success: false, error: 'Arquivo do certificado e obrigatorio' };
    }

    if (!password) {
      return { success: false, error: 'Senha do certificado e obrigatoria' };
    }

    const resultado = await this.nuvemFiscalService.uploadCertificado(cpfCnpj, file, password);

    if (resultado.success) {
      console.log(`[AUDIT] Certificado enviado via upload para empresa: ${cpfCnpj}`);
    }

    return resultado;
  }
}

/**
 * Use Case: Deletar certificado
 */
export class DeletarCertificadoUseCase {
  constructor(private nuvemFiscalService: NuvemFiscalService) {}

  async execute(cpfCnpj: string): Promise<ApiResponse<void>> {
    if (!cpfCnpj) {
      return { success: false, error: 'CPF/CNPJ e obrigatorio' };
    }

    const resultado = await this.nuvemFiscalService.deletarCertificado(cpfCnpj);

    if (resultado.success) {
      console.log(`[AUDIT] Certificado deletado da empresa: ${cpfCnpj}`);
    }

    return resultado;
  }
}
