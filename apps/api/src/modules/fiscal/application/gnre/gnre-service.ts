/**
 * GNRE Service
 * Integração com o WebService do Portal GNRE para geração e consulta de guias.
 * Referência: https://www.gnre.pe.gov.br/gnre/portal/GNRE_WebService.jsp
 *
 * Tipos de guia suportados:
 * - ICMS-ST (Substituição Tributária)
 * - DIFAL (Diferencial de Alíquota)
 * - FECP (Fundo de Combate à Pobreza)
 * - ICMS Importação
 */
import { eq, and, desc, sql } from 'drizzle-orm';
import { gnreGuias, gnreGuiaItens } from '../../infrastructure/schemas/gnre-adrcst';
import { FiscalAuditService } from '../services/fiscal-audit';
import { RetryService } from '../services/retry-service';

// ============================================
// Tipos
// ============================================

interface GnreGuiaPayload {
  ufFavorecida: string;
  tipoGnre: 'icms_st' | 'difal' | 'fecp' | 'icms_importacao';
  receita: string; // Código da receita estadual
  documentoOrigem: {
    tipo: 'nfe' | 'cte';
    chaveAcesso: string;
    numero: number;
  };
  contribuinte: {
    cpfCnpj: string;
    razaoSocial: string;
    ie?: string;
    uf: string;
  };
  destinatario: {
    cpfCnpj: string;
    ie?: string;
    municipio: string;
    uf: string;
  };
  periodo: {
    referencia: string; // MM/YYYY
    dataVencimento: string; // YYYY-MM-DD
  };
  valores: {
    principal: number;
    atualizacaoMonetaria?: number;
    juros?: number;
    multa?: number;
    total: number;
  };
  informacoesComplementares?: string;
}

interface GnreResult {
  sucesso: boolean;
  guiaId?: string;
  numeroControle?: string;
  codigoBarras?: string;
  linhaDigitavel?: string;
  pdfUrl?: string;
  erro?: string;
}

// ============================================
// Constantes
// ============================================

const RECEITAS_GNRE: Record<string, { codigo: string; descricao: string }> = {
  icms_st: { codigo: '100099', descricao: 'ICMS Substituição Tributária' },
  difal: { codigo: '100129', descricao: 'ICMS DIFAL - EC 87/2015' },
  fecp: { codigo: '100145', descricao: 'FECP - Fundo de Combate à Pobreza' },
  icms_importacao: { codigo: '100102', descricao: 'ICMS Importação' },
};

const UF_CODIGOS: Record<string, string> = {
  AC: '12', AL: '27', AM: '13', AP: '16', BA: '29', CE: '23', DF: '53',
  ES: '32', GO: '52', MA: '21', MG: '31', MS: '50', MT: '51', PA: '15',
  PB: '25', PE: '26', PI: '22', PR: '41', RJ: '33', RN: '24', RO: '11',
  RR: '14', RS: '43', SC: '42', SE: '28', SP: '35', TO: '17',
};

export class GnreService {
  private retryService: RetryService;

  constructor(
    private db: any,
    private auditService: FiscalAuditService
  ) {
    this.retryService = new RetryService();
  }

  // ============================================
  // GERAÇÃO DE GUIA
  // ============================================

  /**
   * Gerar guia GNRE
   */
  async gerarGuia(
    tenantId: string,
    userId: string,
    payload: GnreGuiaPayload
  ): Promise<GnreResult> {
    // Validações
    if (!UF_CODIGOS[payload.ufFavorecida]) {
      return { sucesso: false, erro: `UF inválida: ${payload.ufFavorecida}` };
    }

    if (payload.valores.total <= 0) {
      return { sucesso: false, erro: 'Valor total deve ser maior que zero' };
    }

    const receita = RECEITAS_GNRE[payload.tipoGnre];
    if (!receita) {
      return { sucesso: false, erro: `Tipo de GNRE inválido: ${payload.tipoGnre}` };
    }

    try {
      // Montar XML SOAP para o WebService GNRE
      const xmlSoap = this.montarXmlGuia(payload, receita);

      // Salvar guia no banco como rascunho
      const [guia] = await this.db
        .insert(gnreGuias)
        .values({
          tenantId,
          ufFavorecida: payload.ufFavorecida,
          tipoGnre: payload.tipoGnre,
          codigoReceita: receita.codigo,
          descricaoReceita: receita.descricao,
          contribuinteCpfCnpj: payload.contribuinte.cpfCnpj,
          contribuinteRazaoSocial: payload.contribuinte.razaoSocial,
          contribuinteUf: payload.contribuinte.uf,
          destinatarioCpfCnpj: payload.destinatario.cpfCnpj,
          destinatarioUf: payload.destinatario.uf,
          destinatarioMunicipio: payload.destinatario.municipio,
          periodoReferencia: payload.periodo.referencia,
          dataVencimento: new Date(payload.periodo.dataVencimento),
          valorPrincipal: payload.valores.principal.toString(),
          valorAtualizacao: (payload.valores.atualizacaoMonetaria || 0).toString(),
          valorJuros: (payload.valores.juros || 0).toString(),
          valorMulta: (payload.valores.multa || 0).toString(),
          valorTotal: payload.valores.total.toString(),
          chaveAcessoOrigem: payload.documentoOrigem.chaveAcesso,
          tipoDocOrigem: payload.documentoOrigem.tipo,
          status: 'rascunho',
          xmlEnvio: xmlSoap,
          criadoPor: userId,
        })
        .returning();

      // Enviar para o WebService GNRE
      const resultado = await this.enviarParaWebService(xmlSoap, payload.ufFavorecida);

      if (resultado.sucesso) {
        // Atualizar com dados do retorno
        await this.db
          .update(gnreGuias)
          .set({
            status: 'gerada',
            numeroControle: resultado.numeroControle,
            codigoBarras: resultado.codigoBarras,
            linhaDigitavel: resultado.linhaDigitavel,
            xmlRetorno: resultado.xmlRetorno,
          })
          .where(eq(gnreGuias.id, guia.id));

        await this.auditService.registrar({
          tenantId,
          userId,
          action: 'gnre_gerada',
          details: {
            guiaId: guia.id,
            tipo: payload.tipoGnre,
            uf: payload.ufFavorecida,
            valor: payload.valores.total,
          },
        });

        return {
          sucesso: true,
          guiaId: guia.id,
          numeroControle: resultado.numeroControle,
          codigoBarras: resultado.codigoBarras,
          linhaDigitavel: resultado.linhaDigitavel,
        };
      }

      // Erro no WebService
      await this.db
        .update(gnreGuias)
        .set({
          status: 'erro',
          motivoRejeicao: resultado.erro,
        })
        .where(eq(gnreGuias.id, guia.id));

      return { sucesso: false, guiaId: guia.id, erro: resultado.erro };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }

  // ============================================
  // CÁLCULOS
  // ============================================

  /**
   * Calcular ICMS-ST para operação interestadual
   */
  calcularIcmsSt(params: {
    valorProduto: number;
    icmsInternoDestino: number; // Alíquota interna do estado destino
    icmsInterestadual: number; // Alíquota interestadual (4%, 7% ou 12%)
    mva: number; // Margem de Valor Agregado (%)
    ipi?: number; // Valor do IPI
    frete?: number;
    seguro?: number;
    outros?: number;
  }): {
    baseCalculo: number;
    baseCalculoSt: number;
    icmsProprio: number;
    icmsSt: number;
    total: number;
  } {
    const baseCalculo = params.valorProduto + (params.ipi || 0) +
      (params.frete || 0) + (params.seguro || 0) + (params.outros || 0);

    const icmsProprio = baseCalculo * (params.icmsInterestadual / 100);

    // Base de cálculo ST = (Valor + IPI + Frete + Seguro + Outros) * (1 + MVA/100)
    const baseCalculoSt = baseCalculo * (1 + params.mva / 100);

    // ICMS-ST = (Base ST * Alíquota Interna Destino) - ICMS Próprio
    const icmsStBruto = baseCalculoSt * (params.icmsInternoDestino / 100);
    const icmsSt = Math.max(0, icmsStBruto - icmsProprio);

    return {
      baseCalculo: Math.round(baseCalculo * 100) / 100,
      baseCalculoSt: Math.round(baseCalculoSt * 100) / 100,
      icmsProprio: Math.round(icmsProprio * 100) / 100,
      icmsSt: Math.round(icmsSt * 100) / 100,
      total: Math.round(icmsSt * 100) / 100,
    };
  }

  /**
   * Calcular DIFAL para operação interestadual a consumidor final
   */
  calcularDifal(params: {
    valorOperacao: number;
    icmsInternoDestino: number;
    icmsInterestadual: number;
    fecpDestino?: number; // Alíquota FECP do estado destino
  }): {
    baseCalculo: number;
    difalDestino: number;
    fecp: number;
    total: number;
  } {
    const baseCalculo = params.valorOperacao;
    const diferencaAliquota = params.icmsInternoDestino - params.icmsInterestadual;
    const difalDestino = baseCalculo * (diferencaAliquota / 100);
    const fecp = params.fecpDestino ? baseCalculo * (params.fecpDestino / 100) : 0;

    return {
      baseCalculo: Math.round(baseCalculo * 100) / 100,
      difalDestino: Math.round(difalDestino * 100) / 100,
      fecp: Math.round(fecp * 100) / 100,
      total: Math.round((difalDestino + fecp) * 100) / 100,
    };
  }

  // ============================================
  // CONSULTAS
  // ============================================

  /**
   * Listar guias GNRE
   */
  async listar(tenantId: string, filtros?: { status?: string; uf?: string; page?: number; limit?: number }) {
    const page = filtros?.page || 1;
    const limit = filtros?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(gnreGuias.tenantId, tenantId)];
    if (filtros?.status) conditions.push(eq(gnreGuias.status, filtros.status));
    if (filtros?.uf) conditions.push(eq(gnreGuias.ufFavorecida, filtros.uf));

    const guias = await this.db
      .select()
      .from(gnreGuias)
      .where(and(...conditions))
      .orderBy(desc(gnreGuias.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(gnreGuias)
      .where(and(...conditions));

    return {
      data: guias,
      pagination: { page, limit, total: Number(count), totalPages: Math.ceil(Number(count) / limit) },
    };
  }

  // ============================================
  // WebService GNRE (SOAP)
  // ============================================

  private async enviarParaWebService(
    xmlSoap: string,
    ufFavorecida: string
  ): Promise<{
    sucesso: boolean;
    numeroControle?: string;
    codigoBarras?: string;
    linhaDigitavel?: string;
    xmlRetorno?: string;
    erro?: string;
  }> {
    // URL do WebService GNRE (produção)
    const wsUrl = 'https://www.gnre.pe.gov.br/gnreWS/GnreRecepcaoLote';

    try {
      const response = await fetch(wsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          SOAPAction: 'http://www.gnre.pe.gov.br/webservice/GnreRecepcaoLote',
        },
        body: xmlSoap,
      });

      const xmlRetorno = await response.text();

      if (!response.ok) {
        return { sucesso: false, erro: `HTTP ${response.status}: ${response.statusText}`, xmlRetorno };
      }

      // Parse do retorno SOAP
      const getTag = (xml: string, tag: string): string => {
        const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
        const match = xml.match(regex);
        return match ? match[1].trim() : '';
      };

      const situacao = getTag(xmlRetorno, 'situacaoGuia');
      if (situacao === '0' || situacao === '1') {
        return {
          sucesso: true,
          numeroControle: getTag(xmlRetorno, 'nossoNumero'),
          codigoBarras: getTag(xmlRetorno, 'codigoBarras'),
          linhaDigitavel: getTag(xmlRetorno, 'linhaDigitavel'),
          xmlRetorno,
        };
      }

      return {
        sucesso: false,
        erro: getTag(xmlRetorno, 'motivo') || 'Erro desconhecido no WebService GNRE',
        xmlRetorno,
      };
    } catch (error: any) {
      return { sucesso: false, erro: `Erro de comunicação: ${error.message}` };
    }
  }

  private montarXmlGuia(payload: GnreGuiaPayload, receita: { codigo: string }): string {
    const codigoUf = UF_CODIGOS[payload.ufFavorecida] || '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"
  xmlns:gnr="http://www.gnre.pe.gov.br">
  <soap12:Body>
    <gnr:GnreRecepcaoLote>
      <gnr:lote_guias>
        <guia>
          <ufFavorecida>${codigoUf}</ufFavorecida>
          <tipoGnre>0</tipoGnre>
          <contribuinteEmitente>
            <identificacao>
              <CNPJ>${payload.contribuinte.cpfCnpj}</CNPJ>
            </identificacao>
            <razaoSocial>${payload.contribuinte.razaoSocial}</razaoSocial>
            <endereco>${payload.contribuinte.uf}</endereco>
          </contribuinteEmitente>
          <itensGNRE>
            <item>
              <receita>${receita.codigo}</receita>
              <documentoOrigem tipo="22">${payload.documentoOrigem.chaveAcesso}</documentoOrigem>
              <referencia>
                <periodo>${payload.periodo.referencia.replace('/', '')}</periodo>
              </referencia>
              <dataVencimento>${payload.periodo.dataVencimento.replace(/-/g, '')}</dataVencimento>
              <valor tipo="11">${payload.valores.principal.toFixed(2)}</valor>
              ${payload.valores.atualizacaoMonetaria ? `<valor tipo="12">${payload.valores.atualizacaoMonetaria.toFixed(2)}</valor>` : ''}
              ${payload.valores.juros ? `<valor tipo="13">${payload.valores.juros.toFixed(2)}</valor>` : ''}
              ${payload.valores.multa ? `<valor tipo="14">${payload.valores.multa.toFixed(2)}</valor>` : ''}
              <contribuinteDestinatario>
                <identificacao>
                  <CNPJ>${payload.destinatario.cpfCnpj}</CNPJ>
                </identificacao>
                <municipio>${payload.destinatario.municipio}</municipio>
              </contribuinteDestinatario>
            </item>
          </itensGNRE>
        </guia>
      </gnr:lote_guias>
    </gnr:GnreRecepcaoLote>
  </soap12:Body>
</soap12:Envelope>`;
  }
}
