/**
 * Emissão Service
 * Gerencia o ciclo de vida completo de documentos fiscais emitidos via Nuvem Fiscal.
 * Suporta NF-e, NFS-e e CT-e.
 *
 * Ciclo de vida: Rascunho → Validação → Envio → Autorizada → (Cancelamento | Correção | Inutilização)
 */
import { eq, and, desc, sql } from 'drizzle-orm';
import { dfeEmitidos, dfeEmitidosEventos } from '../../infrastructure/schemas/dfe-emitidos';
import { FiscalAuditService } from '../services/fiscal-audit';
import { FiscalValidator } from '../services/fiscal-validator';
import { RetryService } from '../services/retry-service';
import type { NuvemFiscalService } from '../../infrastructure/nuvem-fiscal/service';

// ============================================
// Tipos
// ============================================

interface EmissaoNFePayload {
  naturezaOperacao: string;
  tipoOperacao: 'entrada' | 'saida';
  finalidade: 'normal' | 'complementar' | 'ajuste' | 'devolucao';
  destinatario: {
    cpfCnpj: string;
    razaoSocial: string;
    ie?: string;
    endereco: {
      logradouro: string;
      numero: string;
      bairro: string;
      codigoMunicipio: string;
      municipio: string;
      uf: string;
      cep: string;
    };
  };
  itens: Array<{
    productId: string;
    codigoProduto: string;
    descricao: string;
    ncm: string;
    cfop: string;
    unidade: string;
    quantidade: number;
    valorUnitario: number;
    impostos: {
      icmsOrigem: string;
      icmsCst: string;
      icmsBase?: number;
      icmsAliquota?: number;
      ipiCst?: string;
      ipiAliquota?: number;
      pisCst: string;
      pisAliquota?: number;
      cofinsCst: string;
      cofinsAliquota?: number;
    };
  }>;
  frete?: {
    modalidade: number;
    transportadorCnpj?: string;
    transportadorNome?: string;
    volumes?: number;
    pesoLiquido?: number;
    pesoBruto?: number;
  };
  cobranca?: {
    duplicatas: Array<{
      numero: string;
      vencimento: string;
      valor: number;
    }>;
  };
  informacoesComplementares?: string;
}

interface EmissaoResult {
  sucesso: boolean;
  documentId?: string;
  chaveAcesso?: string;
  protocolo?: string;
  erro?: string;
  errosValidacao?: string[];
}

export class EmissaoService {
  private retryService: RetryService;

  constructor(
    private db: any,
    private nuvemFiscalService: NuvemFiscalService,
    private auditService: FiscalAuditService,
    private validator: FiscalValidator
  ) {
    this.retryService = new RetryService();
  }

  // ============================================
  // EMISSÃO NF-e
  // ============================================

  /**
   * Emitir NF-e via Nuvem Fiscal
   */
  async emitirNFe(
    tenantId: string,
    userId: string,
    payload: EmissaoNFePayload
  ): Promise<EmissaoResult> {
    // 1. Validação prévia
    const errosValidacao = this.validator.validarNFe(payload);
    if (errosValidacao.length > 0) {
      return { sucesso: false, errosValidacao };
    }

    // 2. Calcular totais
    const totais = this.calcularTotaisNFe(payload.itens);

    // 3. Montar payload da Nuvem Fiscal
    const nuvemPayload = this.montarPayloadNFe(payload, totais);

    // 4. Salvar rascunho no banco
    const [rascunho] = await this.db
      .insert(dfeEmitidos)
      .values({
        tenantId,
        tipo: 'nfe',
        status: 'rascunho',
        naturezaOperacao: payload.naturezaOperacao,
        destinatarioCpfCnpj: payload.destinatario.cpfCnpj,
        destinatarioRazaoSocial: payload.destinatario.razaoSocial,
        destinatarioUf: payload.destinatario.endereco.uf,
        valorTotal: totais.valorTotal.toString(),
        valorProdutos: totais.valorProdutos.toString(),
        icmsValor: totais.icmsValor.toString(),
        icmsStValor: totais.icmsStValor.toString(),
        ipiValor: totais.ipiValor.toString(),
        pisValor: totais.pisValor.toString(),
        cofinsValor: totais.cofinsValor.toString(),
        totalItens: payload.itens.length,
        payloadEnvio: JSON.stringify(nuvemPayload),
        criadoPor: userId,
      })
      .returning();

    // 5. Enviar para a Nuvem Fiscal
    try {
      const result = await this.retryService.executeWithRetry(
        () => this.nuvemFiscalService.client.post<any>('/nfe', nuvemPayload),
        { maxRetries: 2 },
        'nuvem_fiscal_emissao_nfe'
      );

      if (result.success && result.data) {
        const nfeData = result.data;

        // 6. Atualizar com dados da autorização
        await this.db
          .update(dfeEmitidos)
          .set({
            status: nfeData.status === 'autorizada' ? 'autorizada' : 'processando',
            chaveAcesso: nfeData.chave,
            numero: nfeData.numero,
            serie: nfeData.serie,
            protocolo: nfeData.protocolo,
            nuvemFiscalId: nfeData.id,
            dataAutorizacao: nfeData.data_autorizacao ? new Date(nfeData.data_autorizacao) : null,
          })
          .where(eq(dfeEmitidos.id, rascunho.id));

        // 7. Registrar auditoria
        await this.auditService.registrar({
          tenantId,
          userId,
          action: 'nfe_emitida',
          details: {
            documentId: rascunho.id,
            chaveAcesso: nfeData.chave,
            valorTotal: totais.valorTotal,
            status: nfeData.status,
          },
        });

        return {
          sucesso: true,
          documentId: rascunho.id,
          chaveAcesso: nfeData.chave,
          protocolo: nfeData.protocolo,
        };
      }

      // Erro na emissão
      await this.db
        .update(dfeEmitidos)
        .set({
          status: 'rejeitada',
          motivoRejeicao: result.error,
        })
        .where(eq(dfeEmitidos.id, rascunho.id));

      return { sucesso: false, documentId: rascunho.id, erro: result.error };
    } catch (error: any) {
      await this.db
        .update(dfeEmitidos)
        .set({
          status: 'erro',
          motivoRejeicao: error.message,
        })
        .where(eq(dfeEmitidos.id, rascunho.id));

      return { sucesso: false, documentId: rascunho.id, erro: error.message };
    }
  }

  // ============================================
  // CANCELAMENTO
  // ============================================

  /**
   * Cancelar NF-e autorizada
   */
  async cancelarNFe(
    tenantId: string,
    userId: string,
    documentId: string,
    justificativa: string
  ): Promise<EmissaoResult> {
    if (!justificativa || justificativa.length < 15) {
      return { sucesso: false, erro: 'Justificativa deve ter no mínimo 15 caracteres' };
    }

    const [documento] = await this.db
      .select()
      .from(dfeEmitidos)
      .where(
        and(
          eq(dfeEmitidos.tenantId, tenantId),
          eq(dfeEmitidos.id, documentId)
        )
      )
      .limit(1);

    if (!documento) {
      return { sucesso: false, erro: 'Documento não encontrado' };
    }

    if (documento.status !== 'autorizada') {
      return { sucesso: false, erro: 'Apenas documentos autorizados podem ser cancelados' };
    }

    // Verificar prazo de cancelamento (24h para NF-e)
    const horasDesdeAutorizacao = documento.dataAutorizacao
      ? (Date.now() - new Date(documento.dataAutorizacao).getTime()) / (1000 * 60 * 60)
      : 999;

    if (horasDesdeAutorizacao > 24) {
      return { sucesso: false, erro: 'Prazo de cancelamento excedido (máximo 24h)' };
    }

    try {
      const result = await this.retryService.executeWithRetry(
        () => this.nuvemFiscalService.client.post<any>(
          `/nfe/${documento.nuvemFiscalId}/cancelamento`,
          { justificativa }
        ),
        { maxRetries: 2 },
        'nuvem_fiscal_cancelamento_nfe'
      );

      if (result.success) {
        await this.db
          .update(dfeEmitidos)
          .set({ status: 'cancelada' })
          .where(eq(dfeEmitidos.id, documentId));

        // Registrar evento
        await this.db.insert(dfeEmitidosEventos).values({
          tenantId,
          documentId,
          tipoEvento: 'cancelamento',
          descricao: justificativa,
          protocolo: result.data?.protocolo,
          userId,
        });

        await this.auditService.registrar({
          tenantId,
          userId,
          action: 'nfe_cancelada',
          details: { documentId, chaveAcesso: documento.chaveAcesso, justificativa },
        });

        return { sucesso: true, documentId };
      }

      return { sucesso: false, erro: result.error };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }

  // ============================================
  // CARTA DE CORREÇÃO
  // ============================================

  /**
   * Emitir Carta de Correção (CC-e)
   */
  async cartaCorrecao(
    tenantId: string,
    userId: string,
    documentId: string,
    correcao: string
  ): Promise<EmissaoResult> {
    if (!correcao || correcao.length < 15) {
      return { sucesso: false, erro: 'Correção deve ter no mínimo 15 caracteres' };
    }

    const [documento] = await this.db
      .select()
      .from(dfeEmitidos)
      .where(
        and(
          eq(dfeEmitidos.tenantId, tenantId),
          eq(dfeEmitidos.id, documentId)
        )
      )
      .limit(1);

    if (!documento) {
      return { sucesso: false, erro: 'Documento não encontrado' };
    }

    if (documento.status !== 'autorizada') {
      return { sucesso: false, erro: 'Apenas documentos autorizados podem receber CC-e' };
    }

    try {
      const result = await this.retryService.executeWithRetry(
        () => this.nuvemFiscalService.client.post<any>(
          `/nfe/${documento.nuvemFiscalId}/correcao`,
          { correcao }
        ),
        { maxRetries: 2 },
        'nuvem_fiscal_cce_nfe'
      );

      if (result.success) {
        // Registrar evento
        await this.db.insert(dfeEmitidosEventos).values({
          tenantId,
          documentId,
          tipoEvento: 'carta_correcao',
          descricao: correcao,
          protocolo: result.data?.protocolo,
          sequencia: result.data?.sequencia || 1,
          userId,
        });

        await this.auditService.registrar({
          tenantId,
          userId,
          action: 'nfe_cce',
          details: { documentId, chaveAcesso: documento.chaveAcesso, correcao },
        });

        return { sucesso: true, documentId };
      }

      return { sucesso: false, erro: result.error };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }

  // ============================================
  // INUTILIZAÇÃO
  // ============================================

  /**
   * Inutilizar faixa de numeração
   */
  async inutilizar(
    tenantId: string,
    userId: string,
    cnpjEmpresa: string,
    serie: number,
    numeroInicial: number,
    numeroFinal: number,
    justificativa: string
  ): Promise<EmissaoResult> {
    if (!justificativa || justificativa.length < 15) {
      return { sucesso: false, erro: 'Justificativa deve ter no mínimo 15 caracteres' };
    }

    try {
      const result = await this.retryService.executeWithRetry(
        () => this.nuvemFiscalService.client.post<any>('/nfe/inutilizacoes', {
          cpf_cnpj: cnpjEmpresa,
          serie,
          numero_inicial: numeroInicial,
          numero_final: numeroFinal,
          justificativa,
        }),
        { maxRetries: 2 },
        'nuvem_fiscal_inutilizacao_nfe'
      );

      if (result.success) {
        await this.auditService.registrar({
          tenantId,
          userId,
          action: 'nfe_inutilizada',
          details: { serie, numeroInicial, numeroFinal, justificativa },
        });

        return { sucesso: true, protocolo: result.data?.protocolo };
      }

      return { sucesso: false, erro: result.error };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }

  // ============================================
  // CONSULTAS
  // ============================================

  /**
   * Listar documentos emitidos
   */
  async listar(
    tenantId: string,
    filtros: {
      tipo?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filtros.page || 1;
    const limit = filtros.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(dfeEmitidos.tenantId, tenantId)];
    if (filtros.tipo) conditions.push(eq(dfeEmitidos.tipo, filtros.tipo));
    if (filtros.status) conditions.push(eq(dfeEmitidos.status, filtros.status));

    const documentos = await this.db
      .select()
      .from(dfeEmitidos)
      .where(and(...conditions))
      .orderBy(desc(dfeEmitidos.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(dfeEmitidos)
      .where(and(...conditions));

    return {
      data: documentos,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  /**
   * Baixar PDF (DANFE) via Nuvem Fiscal
   */
  async baixarPdf(tenantId: string, documentId: string): Promise<{ data?: any; error?: string }> {
    const [documento] = await this.db
      .select()
      .from(dfeEmitidos)
      .where(
        and(
          eq(dfeEmitidos.tenantId, tenantId),
          eq(dfeEmitidos.id, documentId)
        )
      )
      .limit(1);

    if (!documento?.nuvemFiscalId) {
      return { error: 'Documento não encontrado ou sem ID na Nuvem Fiscal' };
    }

    const result = await this.nuvemFiscalService.client.get<any>(
      `/nfe/${documento.nuvemFiscalId}/pdf`
    );

    return result.success ? { data: result.data } : { error: result.error };
  }

  // ============================================
  // Helpers
  // ============================================

  private calcularTotaisNFe(itens: EmissaoNFePayload['itens']) {
    let valorProdutos = 0;
    let icmsValor = 0;
    let icmsStValor = 0;
    let ipiValor = 0;
    let pisValor = 0;
    let cofinsValor = 0;

    for (const item of itens) {
      const valorItem = item.quantidade * item.valorUnitario;
      valorProdutos += valorItem;

      if (item.impostos.icmsAliquota) {
        const base = item.impostos.icmsBase || valorItem;
        icmsValor += base * (item.impostos.icmsAliquota / 100);
      }
      if (item.impostos.ipiAliquota) {
        ipiValor += valorItem * (item.impostos.ipiAliquota / 100);
      }
      if (item.impostos.pisAliquota) {
        pisValor += valorItem * (item.impostos.pisAliquota / 100);
      }
      if (item.impostos.cofinsAliquota) {
        cofinsValor += valorItem * (item.impostos.cofinsAliquota / 100);
      }
    }

    return {
      valorProdutos: Math.round(valorProdutos * 100) / 100,
      valorTotal: Math.round((valorProdutos + ipiValor) * 100) / 100,
      icmsValor: Math.round(icmsValor * 100) / 100,
      icmsStValor: Math.round(icmsStValor * 100) / 100,
      ipiValor: Math.round(ipiValor * 100) / 100,
      pisValor: Math.round(pisValor * 100) / 100,
      cofinsValor: Math.round(cofinsValor * 100) / 100,
    };
  }

  private montarPayloadNFe(payload: EmissaoNFePayload, totais: any): any {
    // Montar payload no formato esperado pela Nuvem Fiscal
    // Referência: https://dev.nuvemfiscal.com.br/docs/api#tag/Nfe/operation/EmitirNfe
    return {
      ambiente: 'producao',
      infNFe: {
        versao: '4.00',
        ide: {
          natOp: payload.naturezaOperacao,
          mod: 55,
          tpNF: payload.tipoOperacao === 'saida' ? 1 : 0,
          finNFe: { normal: 1, complementar: 2, ajuste: 3, devolucao: 4 }[payload.finalidade],
          tpEmis: 1,
          idDest: 1, // TODO: calcular baseado na UF
        },
        dest: {
          CNPJ: payload.destinatario.cpfCnpj.length === 14 ? payload.destinatario.cpfCnpj : undefined,
          CPF: payload.destinatario.cpfCnpj.length === 11 ? payload.destinatario.cpfCnpj : undefined,
          xNome: payload.destinatario.razaoSocial,
          IE: payload.destinatario.ie,
          enderDest: {
            xLgr: payload.destinatario.endereco.logradouro,
            nro: payload.destinatario.endereco.numero,
            xBairro: payload.destinatario.endereco.bairro,
            cMun: payload.destinatario.endereco.codigoMunicipio,
            xMun: payload.destinatario.endereco.municipio,
            UF: payload.destinatario.endereco.uf,
            CEP: payload.destinatario.endereco.cep,
            cPais: '1058',
            xPais: 'Brasil',
          },
        },
        det: payload.itens.map((item, index) => ({
          nItem: index + 1,
          prod: {
            cProd: item.codigoProduto,
            xProd: item.descricao,
            NCM: item.ncm,
            CFOP: item.cfop,
            uCom: item.unidade,
            qCom: item.quantidade,
            vUnCom: item.valorUnitario,
            vProd: Math.round(item.quantidade * item.valorUnitario * 100) / 100,
          },
          imposto: {
            ICMS: {
              [`ICMS${item.impostos.icmsCst}`]: {
                orig: item.impostos.icmsOrigem,
                CST: item.impostos.icmsCst,
                vBC: item.impostos.icmsBase || Math.round(item.quantidade * item.valorUnitario * 100) / 100,
                pICMS: item.impostos.icmsAliquota || 0,
                vICMS: 0, // Calculado pela SEFAZ
              },
            },
            PIS: {
              PISAliq: {
                CST: item.impostos.pisCst,
                vBC: Math.round(item.quantidade * item.valorUnitario * 100) / 100,
                pPIS: item.impostos.pisAliquota || 0,
                vPIS: 0,
              },
            },
            COFINS: {
              COFINSAliq: {
                CST: item.impostos.cofinsCst,
                vBC: Math.round(item.quantidade * item.valorUnitario * 100) / 100,
                pCOFINS: item.impostos.cofinsAliquota || 0,
                vCOFINS: 0,
              },
            },
          },
        })),
        total: {
          ICMSTot: {
            vBC: totais.icmsValor > 0 ? totais.valorProdutos : 0,
            vICMS: totais.icmsValor,
            vBCST: 0,
            vST: totais.icmsStValor,
            vProd: totais.valorProdutos,
            vFrete: 0,
            vSeg: 0,
            vDesc: 0,
            vII: 0,
            vIPI: totais.ipiValor,
            vPIS: totais.pisValor,
            vCOFINS: totais.cofinsValor,
            vOutro: 0,
            vNF: totais.valorTotal,
          },
        },
        transp: payload.frete
          ? {
              modFrete: payload.frete.modalidade,
              transporta: payload.frete.transportadorCnpj
                ? {
                    CNPJ: payload.frete.transportadorCnpj,
                    xNome: payload.frete.transportadorNome,
                  }
                : undefined,
            }
          : { modFrete: 9 }, // Sem frete
        cobr: payload.cobranca
          ? {
              dup: payload.cobranca.duplicatas.map((d) => ({
                nDup: d.numero,
                dVenc: d.vencimento,
                vDup: d.valor,
              })),
            }
          : undefined,
        infAdic: payload.informacoesComplementares
          ? { infCpl: payload.informacoesComplementares }
          : undefined,
      },
    };
  }
}
