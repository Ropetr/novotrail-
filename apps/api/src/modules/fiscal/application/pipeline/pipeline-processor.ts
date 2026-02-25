/**
 * Pipeline Processor
 * Processa documentos fiscais recebidos em 7 etapas:
 * 1. Ingest → 2. Parse → 3. Dedup → 4. Match → 5. Proposta → 6. Aprovação → 7. Postagem
 *
 * Este serviço processa a fila (dfe_processing_queue) de forma assíncrona.
 */
import { eq, and, sql, lte } from 'drizzle-orm';
import { dfeProcessingQueue, dfeInboxDocuments, dfeInboxItems } from '../../infrastructure/schemas/dfe-inbox';
import { XMLParser, type NFeParseResult, type NFeItemParsed } from './xml-parser';
import { ProductMatchingService } from '../services/product-matching';
import { FiscalAuditService } from '../services/fiscal-audit';

const MAX_RETRIES = 3;

export class PipelineProcessor {
  constructor(
    private db: any,
    private matchingService: ProductMatchingService,
    private auditService: FiscalAuditService
  ) {}

  /**
   * Processa todos os itens pendentes na fila
   */
  async processarFila(tenantId: string): Promise<{
    processados: number;
    erros: number;
  }> {
    let processados = 0;
    let erros = 0;

    // Buscar itens pendentes na fila
    const itensFila = await this.db
      .select()
      .from(dfeProcessingQueue)
      .where(
        and(
          eq(dfeProcessingQueue.tenantId, tenantId),
          eq(dfeProcessingQueue.status, 'pendente'),
          lte(dfeProcessingQueue.tentativas, MAX_RETRIES)
        )
      )
      .limit(50);

    for (const item of itensFila) {
      try {
        // Marcar como processando
        await this.db
          .update(dfeProcessingQueue)
          .set({ status: 'processando' })
          .where(eq(dfeProcessingQueue.id, item.id));

        // Processar conforme o tipo
        switch (item.tipo) {
          case 'parse_xml':
            await this.processarParseXML(tenantId, item);
            break;
          case 'match_produtos':
            await this.processarMatchProdutos(tenantId, item);
            break;
          case 'gerar_proposta':
            await this.processarGerarProposta(tenantId, item);
            break;
          default:
            throw new Error(`Tipo de processamento desconhecido: ${item.tipo}`);
        }

        // Marcar como concluído
        await this.db
          .update(dfeProcessingQueue)
          .set({
            status: 'concluido',
            processadoEm: new Date(),
          })
          .where(eq(dfeProcessingQueue.id, item.id));

        processados++;
      } catch (error: any) {
        erros++;
        console.error(`[Pipeline] Erro ao processar item ${item.id}:`, error.message);

        // Incrementar tentativas e registrar erro
        await this.db
          .update(dfeProcessingQueue)
          .set({
            status: item.tentativas + 1 >= MAX_RETRIES ? 'erro' : 'pendente',
            tentativas: sql`${dfeProcessingQueue.tentativas} + 1`,
            erro: error.message,
          })
          .where(eq(dfeProcessingQueue.id, item.id));
      }
    }

    return { processados, erros };
  }

  /**
   * Etapa 2: Parse XML — Extrai itens e dados estruturados do XML
   */
  private async processarParseXML(tenantId: string, queueItem: any): Promise<void> {
    const xmlString = queueItem.dadosEntrada?.xml;
    if (!xmlString) {
      throw new Error('XML não encontrado nos dados de entrada');
    }

    // Parse do XML
    const parsed = XMLParser.parseNFe(xmlString);

    // Atualizar documento com dados extraídos
    await this.db
      .update(dfeInboxDocuments)
      .set({
        naturezaOperacao: parsed.naturezaOperacao,
        emitenteRazaoSocial: parsed.emitente.razaoSocial,
        emitenteNomeFantasia: parsed.emitente.nomeFantasia,
        emitenteIe: parsed.emitente.ie,
        emitenteUf: parsed.emitente.uf,
        emitenteCrt: parsed.emitente.crt,
        valorProdutos: parsed.totais.valorProdutos.toString(),
        valorFrete: parsed.totais.valorFrete.toString(),
        valorSeguro: parsed.totais.valorSeguro.toString(),
        valorDesconto: parsed.totais.valorDesconto.toString(),
        valorOutros: parsed.totais.valorOutros.toString(),
        valorTotal: parsed.totais.valorTotal.toString(),
        icmsBase: parsed.totais.icmsBase.toString(),
        icmsValor: parsed.totais.icmsValor.toString(),
        icmsStBase: parsed.totais.icmsStBase.toString(),
        icmsStValor: parsed.totais.icmsStValor.toString(),
        ipiValor: parsed.totais.ipiValor.toString(),
        pisValor: parsed.totais.pisValor.toString(),
        cofinsValor: parsed.totais.cofinsValor.toString(),
        totalItens: parsed.itens.length,
        informacoesComplementares: parsed.informacoesComplementares,
        dadosTransporte: parsed.transporte ? JSON.stringify(parsed.transporte) : null,
        duplicatas: parsed.cobranca ? JSON.stringify(parsed.cobranca.duplicatas) : null,
      })
      .where(eq(dfeInboxDocuments.id, queueItem.documentId));

    // Inserir itens
    if (parsed.itens.length > 0) {
      const itensParaInserir = parsed.itens.map((item) => ({
        tenantId,
        documentId: queueItem.documentId,
        nItem: item.nItem,
        codigoProdutoEmitente: item.codigoProduto,
        descricao: item.descricao,
        ncm: item.ncm,
        cest: item.cest,
        cfop: item.cfop,
        unidade: item.unidade,
        ean: item.ean !== 'SEM GTIN' ? item.ean : null,
        quantidade: item.quantidade.toString(),
        valorUnitario: item.valorUnitario.toString(),
        valorTotal: item.valorTotal.toString(),
        valorDesconto: item.valorDesconto.toString(),
        // ICMS
        icmsOrigem: item.icmsOrigem,
        icmsCst: item.icmsCst,
        icmsBase: item.icmsBase?.toString(),
        icmsAliquota: item.icmsAliquota?.toString(),
        icmsValor: item.icmsValor?.toString(),
        icmsStBase: item.icmsStBase?.toString(),
        icmsStAliquota: item.icmsStAliquota?.toString(),
        icmsStValor: item.icmsStValor?.toString(),
        // IPI
        ipiCst: item.ipiCst,
        ipiBase: item.ipiBase?.toString(),
        ipiAliquota: item.ipiAliquota?.toString(),
        ipiValor: item.ipiValor?.toString(),
        // PIS
        pisCst: item.pisCst,
        pisBase: item.pisBase?.toString(),
        pisAliquota: item.pisAliquota?.toString(),
        pisValor: item.pisValor?.toString(),
        // COFINS
        cofinsCst: item.cofinsCst,
        cofinsBase: item.cofinsBase?.toString(),
        cofinsAliquota: item.cofinsAliquota?.toString(),
        cofinsValor: item.cofinsValor?.toString(),
        // Status
        statusMatching: 'pendente',
      }));

      await this.db.insert(dfeInboxItems).values(itensParaInserir);
    }

    // Adicionar próxima etapa na fila: match de produtos
    await this.db.insert(dfeProcessingQueue).values({
      tenantId,
      documentId: queueItem.documentId,
      tipo: 'match_produtos',
      status: 'pendente',
      tentativas: 0,
      dadosEntrada: { supplierCnpj: parsed.emitente.cnpj },
    });
  }

  /**
   * Etapa 4: Match de Produtos — Vincula itens do fornecedor aos produtos internos
   */
  private async processarMatchProdutos(tenantId: string, queueItem: any): Promise<void> {
    const supplierCnpj = queueItem.dadosEntrada?.supplierCnpj;

    // Buscar itens do documento
    const itens = await this.db
      .select()
      .from(dfeInboxItems)
      .where(
        and(
          eq(dfeInboxItems.tenantId, tenantId),
          eq(dfeInboxItems.documentId, queueItem.documentId)
        )
      );

    let matchedCount = 0;
    let pendingCount = 0;

    for (const item of itens) {
      const result = await this.matchingService.match(tenantId, {
        codigoProdutoEmitente: item.codigoProdutoEmitente,
        descricao: item.descricao,
        ncm: item.ncm,
        ean: item.ean || undefined,
        supplierCnpj,
      });

      if (result.productId && result.score >= 70) {
        // Match encontrado com confiança suficiente
        await this.db
          .update(dfeInboxItems)
          .set({
            productId: result.productId,
            statusMatching: 'vinculado',
            matchScore: result.score,
            matchMetodo: result.metodo,
          })
          .where(eq(dfeInboxItems.id, item.id));
        matchedCount++;
      } else {
        // Sem match ou confiança baixa
        await this.db
          .update(dfeInboxItems)
          .set({
            statusMatching: result.sugestoes?.length ? 'sugestao' : 'nao_encontrado',
            matchScore: result.score,
            matchMetodo: result.metodo,
            sugestoes: result.sugestoes ? JSON.stringify(result.sugestoes) : null,
          })
          .where(eq(dfeInboxItems.id, item.id));
        pendingCount++;
      }
    }

    // Atualizar status do documento
    const novoStatus = pendingCount === 0 ? 'pronta_lancamento' : 'pendente_matching';
    await this.db
      .update(dfeInboxDocuments)
      .set({
        itensVinculados: matchedCount,
        itensPendentes: pendingCount,
        status: novoStatus,
      })
      .where(eq(dfeInboxDocuments.id, queueItem.documentId));
  }

  /**
   * Etapa 5: Gerar Proposta de Lançamento
   */
  private async processarGerarProposta(tenantId: string, queueItem: any): Promise<void> {
    // Buscar documento e itens
    const [documento] = await this.db
      .select()
      .from(dfeInboxDocuments)
      .where(eq(dfeInboxDocuments.id, queueItem.documentId))
      .limit(1);

    if (!documento) {
      throw new Error('Documento não encontrado');
    }

    const itens = await this.db
      .select()
      .from(dfeInboxItems)
      .where(eq(dfeInboxItems.documentId, queueItem.documentId));

    // Gerar proposta de lançamento
    const proposta = {
      documentId: documento.id,
      tipo: documento.tipo,
      fornecedor: {
        cnpj: documento.emitenteCpfCnpj,
        razaoSocial: documento.emitenteRazaoSocial,
      },
      itens: itens.map((item: any) => ({
        itemId: item.id,
        descricao: item.descricao,
        productId: item.productId,
        statusMatching: item.statusMatching,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        valorTotal: item.valorTotal,
      })),
      acoes: {
        atualizarEstoque: true,
        gerarContaPagar: documento.duplicatas ? true : false,
        atualizarCustoMedio: true,
        criarFornecedor: !documento.supplierId,
      },
      geradoEm: new Date().toISOString(),
    };

    // Salvar proposta no documento
    await this.db
      .update(dfeInboxDocuments)
      .set({
        propostaLancamento: JSON.stringify(proposta),
        status: 'pronta_lancamento',
      })
      .where(eq(dfeInboxDocuments.id, queueItem.documentId));
  }
}
