import { NuvemFiscalService } from '../../../infrastructure/external-apis/nuvem-fiscal/NuvemFiscalService';
import { ApiResponse, Empresa, ListarEmpresasRequest, ListarEmpresasResponse } from '../../entities/nuvem-fiscal/NuvemFiscalTypes';

/**
 * Use Case: Listar empresas na Nuvem Fiscal
 */
export class ListarEmpresasUseCase {
  constructor(private nuvemFiscalService: NuvemFiscalService) {}

  async execute(params?: ListarEmpresasRequest): Promise<ApiResponse<ListarEmpresasResponse>> {
    return this.nuvemFiscalService.listarEmpresas(params);
  }
}

/**
 * Use Case: Cadastrar empresa na Nuvem Fiscal
 */
export class CadastrarEmpresaUseCase {
  constructor(private nuvemFiscalService: NuvemFiscalService) {}

  async execute(empresa: Empresa): Promise<ApiResponse<Empresa>> {
    // Validações
    if (!empresa.cpf_cnpj) {
      return { success: false, error: 'CPF/CNPJ é obrigatório' };
    }

    if (!empresa.nome_razao_social) {
      return { success: false, error: 'Nome/Razão Social é obrigatório' };
    }

    if (!empresa.email) {
      return { success: false, error: 'Email é obrigatório' };
    }

    if (!empresa.endereco) {
      return { success: false, error: 'Endereço é obrigatório' };
    }

    const resultado = await this.nuvemFiscalService.cadastrarEmpresa(empresa);

    if (resultado.success) {
      console.log(`[AUDIT] Empresa cadastrada na Nuvem Fiscal: ${empresa.cpf_cnpj} - ${empresa.nome_razao_social}`);
    }

    return resultado;
  }
}

/**
 * Use Case: Consultar empresa na Nuvem Fiscal
 */
export class ConsultarEmpresaUseCase {
  constructor(private nuvemFiscalService: NuvemFiscalService) {}

  async execute(cpfCnpj: string): Promise<ApiResponse<Empresa>> {
    if (!cpfCnpj) {
      return { success: false, error: 'CPF/CNPJ é obrigatório' };
    }

    return this.nuvemFiscalService.consultarEmpresa(cpfCnpj);
  }
}

/**
 * Use Case: Alterar empresa na Nuvem Fiscal
 */
export class AlterarEmpresaUseCase {
  constructor(private nuvemFiscalService: NuvemFiscalService) {}

  async execute(cpfCnpj: string, empresa: Empresa): Promise<ApiResponse<Empresa>> {
    if (!cpfCnpj) {
      return { success: false, error: 'CPF/CNPJ é obrigatório' };
    }

    const resultado = await this.nuvemFiscalService.alterarEmpresa(cpfCnpj, empresa);

    if (resultado.success) {
      console.log(`[AUDIT] Empresa alterada na Nuvem Fiscal: ${cpfCnpj}`);
    }

    return resultado;
  }
}

/**
 * Use Case: Deletar empresa na Nuvem Fiscal
 */
export class DeletarEmpresaUseCase {
  constructor(private nuvemFiscalService: NuvemFiscalService) {}

  async execute(cpfCnpj: string): Promise<ApiResponse<void>> {
    if (!cpfCnpj) {
      return { success: false, error: 'CPF/CNPJ é obrigatório' };
    }

    const resultado = await this.nuvemFiscalService.deletarEmpresa(cpfCnpj);

    if (resultado.success) {
      console.log(`[AUDIT] Empresa deletada da Nuvem Fiscal: ${cpfCnpj}`);
    }

    return resultado;
  }
}
