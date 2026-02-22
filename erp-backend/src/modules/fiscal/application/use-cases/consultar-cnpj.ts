import { NuvemFiscalService } from '../../infrastructure/nuvem-fiscal/service';
import type { ApiResponse, ConsultaCNPJResponse } from '../../infrastructure/nuvem-fiscal/types';

export interface ConsultarCNPJDTO {
  cnpj: string;
}

/**
 * Use Case: Consultar dados completos de um CNPJ
 */
export class ConsultarCNPJUseCase {
  constructor(private nuvemFiscalService: NuvemFiscalService) {}

  async execute(dto: ConsultarCNPJDTO): Promise<ApiResponse<ConsultaCNPJResponse>> {
    // Validacao basica
    if (!dto.cnpj || dto.cnpj.trim().length === 0) {
      return {
        success: false,
        error: 'CNPJ e obrigatorio',
      };
    }

    // Chamar servico
    const resultado = await this.nuvemFiscalService.consultarCNPJ(dto.cnpj);

    // Log de auditoria
    if (resultado.success && resultado.data) {
      console.log(`[AUDIT] CNPJ consultado: ${dto.cnpj} - Razao Social: ${resultado.data.razao_social}`);
    } else {
      console.log(`[AUDIT] Falha ao consultar CNPJ: ${dto.cnpj} - Erro: ${resultado.error}`);
    }

    return resultado;
  }
}
