import { NuvemFiscalService } from '../../../infrastructure/external-apis/nuvem-fiscal/NuvemFiscalService';
import { ApiResponse, ConsultaCNPJResponse } from '../../entities/nuvem-fiscal/NuvemFiscalTypes';

export interface ConsultarCNPJDTO {
  cnpj: string;
}

/**
 * Use Case: Consultar dados completos de um CNPJ
 */
export class ConsultarCNPJUseCase {
  constructor(private nuvemFiscalService: NuvemFiscalService) {}

  async execute(dto: ConsultarCNPJDTO): Promise<ApiResponse<ConsultaCNPJResponse>> {
    // Validação básica
    if (!dto.cnpj || dto.cnpj.trim().length === 0) {
      return {
        success: false,
        error: 'CNPJ é obrigatório',
      };
    }

    // Chamar serviço
    const resultado = await this.nuvemFiscalService.consultarCNPJ(dto.cnpj);

    // Log de auditoria
    if (resultado.success && resultado.data) {
      console.log(`[AUDIT] CNPJ consultado: ${dto.cnpj} - Razão Social: ${resultado.data.razao_social}`);
    } else {
      console.log(`[AUDIT] Falha ao consultar CNPJ: ${dto.cnpj} - Erro: ${resultado.error}`);
    }

    return resultado;
  }
}
