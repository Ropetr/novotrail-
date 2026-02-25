/**
 * ADRC-ST Service
 * Gerador de Arquivo Digital da Recuperação, Ressarcimento e Complementação do ICMS-ST.
 * Conforme Manual ADRC-ST versão 1.6 (abril/2024) - SEFAZ-PR.
 *
 * Estrutura do arquivo:
 * - Bloco 0: Abertura e identificação
 * - Bloco 1: Dados por produto (entradas, saídas, cálculos)
 * - Bloco 9: Apuração e encerramento
 *
 * Formato: texto delimitado por pipe (|), codificação UTF-8, extensão .txt, compactado em ZIP.
 */
import { eq, and, between, sql } from 'drizzle-orm';
import { adrcstArquivos, adrcstRegistros } from '../../infrastructure/schemas/gnre-adrcst';
import { dfeInboxDocuments, dfeInboxItems } from '../../infrastructure/schemas/dfe-inbox';
import { dfeEmitidos } from '../../infrastructure/schemas/dfe-emitidos';
import { FiscalAuditService } from '../services/fiscal-audit';

// ============================================
// Tipos
// ============================================

interface AdrcstConfig {
  cnpjEmpresa: string;
  ieEmpresa: string;
  razaoSocial: string;
  periodoInicio: string; // YYYY-MM-DD
  periodoFim: string; // YYYY-MM-DD
  opcaoRecuperacao: boolean;
  opcaoRessarcimento: boolean;
  opcaoComplementacao: boolean;
  versaoLeiaute: string; // '016'
}

interface AdrcstProduto {
  ncm: string;
  cest: string;
  ean?: string;
  descricao: string;
  unidade: string;
  entradas: AdrcstEntrada[];
  saidasConsumidorFinal: AdrcstSaida[];
  saidasInterestadual: AdrcstSaida[];
  saidasArt119: AdrcstSaida[];
  saidasSimplesNacional: AdrcstSaida[];
}

interface AdrcstEntrada {
  chaveAcesso: string;
  numero: number;
  serie: number;
  dataEmissao: string;
  cnpjEmitente: string;
  ufOrigem: string;
  cfop: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  icmsStRetido: number;
  baseCalculoSt: number;
  aliquotaInterna: number;
}

interface AdrcstSaida {
  chaveAcesso: string;
  numero: number;
  serie: number;
  dataEmissao: string;
  cnpjDestinatario: string;
  ufDestino: string;
  cfop: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

interface AdrcstResult {
  sucesso: boolean;
  arquivoId?: string;
  conteudo?: string;
  totalRegistros?: number;
  valorRecuperacao?: number;
  valorRessarcimento?: number;
  valorComplementacao?: number;
  erro?: string;
}

export class AdrcstService {
  constructor(
    private db: any,
    private auditService: FiscalAuditService
  ) {}

  // ============================================
  // GERAÇÃO DO ARQUIVO
  // ============================================

  /**
   * Gerar arquivo ADRC-ST para um período
   */
  async gerarArquivo(
    tenantId: string,
    userId: string,
    config: AdrcstConfig
  ): Promise<AdrcstResult> {
    try {
      // 1. Coletar dados de entradas e saídas do período
      const produtos = await this.coletarDadosPeriodo(tenantId, config);

      if (produtos.length === 0) {
        return { sucesso: false, erro: 'Nenhum produto com ST encontrado no período' };
      }

      // 2. Gerar registros do arquivo
      const linhas: string[] = [];
      let totalRegistros = 0;
      let totalRecuperacao = 0;
      let totalRessarcimento = 0;
      let totalComplementacao = 0;

      // Bloco 0 - Abertura
      linhas.push(this.gerarRegistro0000(config));
      totalRegistros++;

      // Bloco 1 - Por produto
      for (const produto of produtos) {
        // Registro 1000 - Identificação do produto
        linhas.push(this.gerarRegistro1000(produto));
        totalRegistros++;

        // Registro 1100 - Entradas
        for (const entrada of produto.entradas) {
          linhas.push(this.gerarRegistro1100(entrada));
          totalRegistros++;
        }

        // Registro 1115 - Guias de recolhimento (novo na v1.6)
        // TODO: Vincular com guias GNRE do módulo

        // Registro 1200 - Saídas para consumidor final
        for (const saida of produto.saidasConsumidorFinal) {
          linhas.push(this.gerarRegistro1200(saida));
          totalRegistros++;
        }

        // Registro 1300 - Saídas interestaduais (ressarcimento)
        for (const saida of produto.saidasInterestadual) {
          linhas.push(this.gerarRegistro1300(saida));
          totalRegistros++;
        }

        // Registro 1400 - Saídas Art. 119 RICMS
        for (const saida of produto.saidasArt119) {
          linhas.push(this.gerarRegistro1400(saida));
          totalRegistros++;
        }

        // Registro 1500 - Saídas para Simples Nacional
        for (const saida of produto.saidasSimplesNacional) {
          linhas.push(this.gerarRegistro1500(saida));
          totalRegistros++;
        }

        // Cálculos por produto
        const calculo = this.calcularProduto(produto, config);
        totalRecuperacao += calculo.recuperacao;
        totalRessarcimento += calculo.ressarcimento;
        totalComplementacao += calculo.complementacao;
      }

      // Bloco 9 - Apuração
      linhas.push(this.gerarRegistro9000({
        totalRecuperacao,
        totalRessarcimento,
        totalComplementacao,
      }));
      totalRegistros++;

      // Registro 9999 - Encerramento
      linhas.push(this.gerarRegistro9999(totalRegistros + 1));
      totalRegistros++;

      const conteudo = linhas.join('\r\n') + '\r\n';

      // 3. Salvar no banco
      const [arquivo] = await this.db
        .insert(adrcstArquivos)
        .values({
          tenantId,
          periodoInicio: new Date(config.periodoInicio),
          periodoFim: new Date(config.periodoFim),
          cnpjEmpresa: config.cnpjEmpresa,
          ieEmpresa: config.ieEmpresa,
          versaoLeiaute: config.versaoLeiaute || '016',
          status: 'gerado',
          totalRegistros,
          totalProdutos: produtos.length,
          valorRecuperacao: totalRecuperacao.toString(),
          valorRessarcimento: totalRessarcimento.toString(),
          valorComplementacao: totalComplementacao.toString(),
          conteudoArquivo: conteudo,
          criadoPor: userId,
        })
        .returning();

      // 4. Auditoria
      await this.auditService.registrar({
        tenantId,
        userId,
        action: 'adrcst_gerado',
        details: {
          arquivoId: arquivo.id,
          periodo: `${config.periodoInicio} a ${config.periodoFim}`,
          totalProdutos: produtos.length,
          totalRegistros,
          valorRecuperacao: totalRecuperacao,
          valorRessarcimento: totalRessarcimento,
          valorComplementacao: totalComplementacao,
        },
      });

      return {
        sucesso: true,
        arquivoId: arquivo.id,
        conteudo,
        totalRegistros,
        valorRecuperacao: totalRecuperacao,
        valorRessarcimento: totalRessarcimento,
        valorComplementacao: totalComplementacao,
      };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }

  // ============================================
  // COLETA DE DADOS
  // ============================================

  private async coletarDadosPeriodo(
    tenantId: string,
    config: AdrcstConfig
  ): Promise<AdrcstProduto[]> {
    // Buscar itens de notas de entrada com ICMS-ST no período
    const itensEntrada = await this.db
      .select({
        item: dfeInboxItems,
        doc: dfeInboxDocuments,
      })
      .from(dfeInboxItems)
      .innerJoin(dfeInboxDocuments, eq(dfeInboxItems.documentId, dfeInboxDocuments.id))
      .where(
        and(
          eq(dfeInboxItems.tenantId, tenantId),
          eq(dfeInboxDocuments.status, 'lancada'),
          between(dfeInboxDocuments.dataEmissao, new Date(config.periodoInicio), new Date(config.periodoFim)),
          sql`CAST(${dfeInboxItems.icmsStValor} AS NUMERIC) > 0`
        )
      );

    // Agrupar por produto (NCM + CEST)
    const produtosMap = new Map<string, AdrcstProduto>();

    for (const { item, doc } of itensEntrada) {
      const chave = `${item.ncm}_${item.cest || 'SEM_CEST'}`;

      if (!produtosMap.has(chave)) {
        produtosMap.set(chave, {
          ncm: item.ncm,
          cest: item.cest || '',
          ean: item.ean || undefined,
          descricao: item.descricao,
          unidade: item.unidade || 'UN',
          entradas: [],
          saidasConsumidorFinal: [],
          saidasInterestadual: [],
          saidasArt119: [],
          saidasSimplesNacional: [],
        });
      }

      const produto = produtosMap.get(chave)!;
      produto.entradas.push({
        chaveAcesso: doc.chaveAcesso,
        numero: doc.numero,
        serie: doc.serie || 1,
        dataEmissao: doc.dataEmissao.toISOString().split('T')[0],
        cnpjEmitente: doc.emitenteCpfCnpj,
        ufOrigem: doc.emitenteUf || '',
        cfop: item.cfop,
        quantidade: parseFloat(item.quantidade),
        valorUnitario: parseFloat(item.valorUnitario),
        valorTotal: parseFloat(item.valorTotal),
        icmsStRetido: parseFloat(item.icmsStValor || '0'),
        baseCalculoSt: parseFloat(item.icmsStBase || '0'),
        aliquotaInterna: 18, // TODO: buscar da tabela de alíquotas por NCM
      });
    }

    // TODO: Buscar saídas do período e classificar por tipo (consumidor final, interestadual, etc.)
    // Isso requer integração com o módulo de vendas/comercial

    return Array.from(produtosMap.values());
  }

  // ============================================
  // CÁLCULOS
  // ============================================

  private calcularProduto(
    produto: AdrcstProduto,
    config: AdrcstConfig
  ): { recuperacao: number; ressarcimento: number; complementacao: number } {
    let recuperacao = 0;
    let ressarcimento = 0;
    let complementacao = 0;

    // Custo médio ponderado do ICMS-ST retido nas entradas
    const totalQtdEntrada = produto.entradas.reduce((sum, e) => sum + e.quantidade, 0);
    const totalStRetido = produto.entradas.reduce((sum, e) => sum + e.icmsStRetido, 0);
    const custoMedioSt = totalQtdEntrada > 0 ? totalStRetido / totalQtdEntrada : 0;

    // Recuperação: vendas a consumidor final com preço abaixo da base presumida
    if (config.opcaoRecuperacao) {
      for (const saida of produto.saidasConsumidorFinal) {
        // Comparar valor efetivo vs base presumida
        const icmsEfetivo = saida.valorTotal * (18 / 100); // TODO: alíquota real
        const stProporcional = custoMedioSt * saida.quantidade;
        if (stProporcional > icmsEfetivo) {
          recuperacao += stProporcional - icmsEfetivo;
        } else {
          complementacao += icmsEfetivo - stProporcional;
        }
      }
    }

    // Ressarcimento: vendas interestaduais
    if (config.opcaoRessarcimento) {
      for (const saida of produto.saidasInterestadual) {
        ressarcimento += custoMedioSt * saida.quantidade;
      }
    }

    return {
      recuperacao: Math.round(recuperacao * 100) / 100,
      ressarcimento: Math.round(ressarcimento * 100) / 100,
      complementacao: Math.round(complementacao * 100) / 100,
    };
  }

  // ============================================
  // GERAÇÃO DE REGISTROS (formato pipe-delimited)
  // ============================================

  private gerarRegistro0000(config: AdrcstConfig): string {
    const campos = [
      '|0000',
      config.versaoLeiaute || '016',
      config.cnpjEmpresa,
      config.ieEmpresa,
      config.razaoSocial,
      config.periodoInicio.replace(/-/g, ''),
      config.periodoFim.replace(/-/g, ''),
      config.opcaoRecuperacao ? '1' : '0',
      config.opcaoRessarcimento ? '1' : '0',
      config.opcaoComplementacao ? '1' : '0',
      '|',
    ];
    return campos.join('|');
  }

  private gerarRegistro1000(produto: AdrcstProduto): string {
    const campos = [
      '|1000',
      produto.ncm,
      produto.cest,
      produto.ean || '',
      produto.descricao.substring(0, 100),
      produto.unidade,
      '|',
    ];
    return campos.join('|');
  }

  private gerarRegistro1100(entrada: AdrcstEntrada): string {
    const campos = [
      '|1100',
      entrada.chaveAcesso,
      entrada.dataEmissao.replace(/-/g, ''),
      entrada.cnpjEmitente,
      entrada.ufOrigem,
      entrada.cfop,
      this.formatarNumero(entrada.quantidade, 4),
      this.formatarNumero(entrada.valorUnitario, 4),
      this.formatarNumero(entrada.valorTotal, 2),
      this.formatarNumero(entrada.baseCalculoSt, 2),
      this.formatarNumero(entrada.icmsStRetido, 2),
      this.formatarNumero(entrada.aliquotaInterna, 2),
      '|',
    ];
    return campos.join('|');
  }

  private gerarRegistro1200(saida: AdrcstSaida): string {
    return this.gerarRegistroSaida('1200', saida);
  }

  private gerarRegistro1300(saida: AdrcstSaida): string {
    return this.gerarRegistroSaida('1300', saida);
  }

  private gerarRegistro1400(saida: AdrcstSaida): string {
    return this.gerarRegistroSaida('1400', saida);
  }

  private gerarRegistro1500(saida: AdrcstSaida): string {
    return this.gerarRegistroSaida('1500', saida);
  }

  private gerarRegistroSaida(tipo: string, saida: AdrcstSaida): string {
    const campos = [
      `|${tipo}`,
      saida.chaveAcesso,
      saida.dataEmissao.replace(/-/g, ''),
      saida.cnpjDestinatario,
      saida.ufDestino,
      saida.cfop,
      this.formatarNumero(saida.quantidade, 4),
      this.formatarNumero(saida.valorUnitario, 4),
      this.formatarNumero(saida.valorTotal, 2),
      '|',
    ];
    return campos.join('|');
  }

  private gerarRegistro9000(totais: {
    totalRecuperacao: number;
    totalRessarcimento: number;
    totalComplementacao: number;
  }): string {
    const campos = [
      '|9000',
      this.formatarNumero(totais.totalRecuperacao, 2),
      this.formatarNumero(totais.totalRessarcimento, 2),
      this.formatarNumero(totais.totalComplementacao, 2),
      '|',
    ];
    return campos.join('|');
  }

  private gerarRegistro9999(totalRegistros: number): string {
    return `|9999|${totalRegistros}|`;
  }

  // ============================================
  // Helpers
  // ============================================

  private formatarNumero(valor: number, casasDecimais: number): string {
    return valor.toFixed(casasDecimais).replace('.', ',');
  }
}
