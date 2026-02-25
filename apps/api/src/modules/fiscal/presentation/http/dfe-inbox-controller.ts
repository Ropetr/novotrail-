/**
 * DF-e Inbox Controller
 * Endpoints para gerenciamento de documentos fiscais recebidos.
 */
import { Context } from 'hono';
import { eq, and, desc, like, sql } from 'drizzle-orm';
import { dfeInboxDocuments, dfeInboxItems, dfeManifestations } from '../../infrastructure/schemas/dfe-inbox';
import type { NFeCollector } from '../../application/collectors/nfe-collector';
import type { PipelineProcessor } from '../../application/pipeline/pipeline-processor';
import type { ProductMatchingService } from '../../application/services/product-matching';
import type { FiscalAuditService } from '../../application/services/fiscal-audit';
import type { FiscalConfigService } from '../../application/services/fiscal-config-service';

export class DFeInboxController {
  constructor(
    private db: any,
    private nfeCollector: NFeCollector,
    private pipelineProcessor: PipelineProcessor,
    private matchingService: ProductMatchingService,
    private auditService: FiscalAuditService,
    private configService: FiscalConfigService
  ) {}

  // ============================================
  // DOCUMENTOS RECEBIDOS
  // ============================================

  /**
   * GET /fiscal/inbox - Listar documentos recebidos
   */
  listar = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const { tipo, status, emitente, page = '1', limit = '20' } = c.req.query();

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = this.db
      .select()
      .from(dfeInboxDocuments)
      .where(eq(dfeInboxDocuments.tenantId, tenantId));

    // Filtros
    const conditions = [eq(dfeInboxDocuments.tenantId, tenantId)];
    if (tipo) conditions.push(eq(dfeInboxDocuments.tipo, tipo));
    if (status) conditions.push(eq(dfeInboxDocuments.status, status));
    if (emitente) conditions.push(like(dfeInboxDocuments.emitenteRazaoSocial, `%${emitente}%`));

    const documentos = await this.db
      .select()
      .from(dfeInboxDocuments)
      .where(and(...conditions))
      .orderBy(desc(dfeInboxDocuments.dataEmissao))
      .limit(parseInt(limit))
      .offset(offset);

    // Contagem total
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(dfeInboxDocuments)
      .where(and(...conditions));

    return c.json({
      data: documentos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Number(count),
        totalPages: Math.ceil(Number(count) / parseInt(limit)),
      },
    });
  };

  /**
   * GET /fiscal/inbox/:id - Consultar documento com itens
   */
  consultar = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const documentId = c.req.param('id');

    const [documento] = await this.db
      .select()
      .from(dfeInboxDocuments)
      .where(
        and(
          eq(dfeInboxDocuments.tenantId, tenantId),
          eq(dfeInboxDocuments.id, documentId)
        )
      )
      .limit(1);

    if (!documento) {
      return c.json({ error: 'Documento não encontrado' }, 404);
    }

    // Buscar itens
    const itens = await this.db
      .select()
      .from(dfeInboxItems)
      .where(
        and(
          eq(dfeInboxItems.tenantId, tenantId),
          eq(dfeInboxItems.documentId, documentId)
        )
      );

    // Buscar manifestações
    const manifestacoes = await this.db
      .select()
      .from(dfeManifestations)
      .where(
        and(
          eq(dfeManifestations.tenantId, tenantId),
          eq(dfeManifestations.documentId, documentId)
        )
      )
      .orderBy(desc(dfeManifestations.createdAt));

    return c.json({
      ...documento,
      itens,
      manifestacoes,
    });
  };

  /**
   * GET /fiscal/inbox/:id/xml - Baixar XML do documento
   */
  baixarXml = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const documentId = c.req.param('id');

    const [documento] = await this.db
      .select({ xmlCompleto: dfeInboxDocuments.xmlCompleto })
      .from(dfeInboxDocuments)
      .where(
        and(
          eq(dfeInboxDocuments.tenantId, tenantId),
          eq(dfeInboxDocuments.id, documentId)
        )
      )
      .limit(1);

    if (!documento?.xmlCompleto) {
      return c.json({ error: 'XML não disponível' }, 404);
    }

    return new Response(documento.xmlCompleto, {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="nfe_${documentId}.xml"`,
      },
    });
  };

  // ============================================
  // CAPTURA
  // ============================================

  /**
   * POST /fiscal/inbox/capturar - Iniciar captura manual de NF-e
   */
  capturar = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');

    // Obter CNPJ da empresa das configurações
    const config = await this.configService.obterConfiguracoes(tenantId);
    if (!config.cnpjEmpresa) {
      return c.json({ error: 'CNPJ da empresa não configurado' }, 400);
    }

    const resultado = await this.nfeCollector.executarCaptura(tenantId, config.cnpjEmpresa);

    await this.auditService.registrar({
      tenantId,
      userId,
      action: 'dfe_capturado',
      details: {
        tipo: 'captura_manual',
        novosDocumentos: resultado.novosDocumentos,
        erros: resultado.erros,
      },
    });

    return c.json(resultado);
  };

  /**
   * POST /fiscal/inbox/processar-fila - Processar fila de documentos pendentes
   */
  processarFila = async (c: Context) => {
    const tenantId = c.get('tenantId');

    const resultado = await this.pipelineProcessor.processarFila(tenantId);

    return c.json(resultado);
  };

  // ============================================
  // MANIFESTAÇÃO
  // ============================================

  /**
   * POST /fiscal/inbox/:id/manifestar - Manifestar nota
   */
  manifestar = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const documentId = c.req.param('id');
    const body = await c.req.json();

    const { tipo, justificativa } = body;

    if (!['ciencia', 'confirmacao', 'desconhecimento', 'nao_realizada'].includes(tipo)) {
      return c.json({ error: 'Tipo de manifestação inválido' }, 400);
    }

    // Buscar documento
    const [documento] = await this.db
      .select()
      .from(dfeInboxDocuments)
      .where(
        and(
          eq(dfeInboxDocuments.tenantId, tenantId),
          eq(dfeInboxDocuments.id, documentId)
        )
      )
      .limit(1);

    if (!documento) {
      return c.json({ error: 'Documento não encontrado' }, 404);
    }

    if (documento.tipo !== 'nfe') {
      return c.json({ error: 'Manifestação disponível apenas para NF-e' }, 400);
    }

    // Obter CNPJ da empresa
    const config = await this.configService.obterConfiguracoes(tenantId);

    const resultado = await this.nfeCollector.manifestarNota(
      tenantId,
      userId,
      config.cnpjEmpresa!,
      documentId,
      documento.chaveAcesso,
      tipo,
      justificativa
    );

    if (!resultado.sucesso) {
      return c.json({ error: resultado.erro }, 400);
    }

    return c.json({ sucesso: true, tipo });
  };

  // ============================================
  // DE-PARA DE PRODUTOS
  // ============================================

  /**
   * POST /fiscal/inbox/items/:id/vincular - Vincular item a produto interno
   */
  vincularProduto = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const itemId = c.req.param('id');
    const body = await c.req.json();

    const { productId } = body;
    if (!productId) {
      return c.json({ error: 'productId é obrigatório' }, 400);
    }

    // Buscar item
    const [item] = await this.db
      .select()
      .from(dfeInboxItems)
      .where(
        and(
          eq(dfeInboxItems.tenantId, tenantId),
          eq(dfeInboxItems.id, itemId)
        )
      )
      .limit(1);

    if (!item) {
      return c.json({ error: 'Item não encontrado' }, 404);
    }

    // Buscar documento para obter CNPJ do fornecedor
    const [documento] = await this.db
      .select()
      .from(dfeInboxDocuments)
      .where(eq(dfeInboxDocuments.id, item.documentId))
      .limit(1);

    // Vincular manualmente
    await this.matchingService.vincularManualmente(
      tenantId,
      documento.emitenteCpfCnpj,
      item.codigoProdutoEmitente,
      item.descricao,
      productId,
      item.ean || undefined,
      item.ncm
    );

    // Atualizar item
    await this.db
      .update(dfeInboxItems)
      .set({
        productId,
        statusMatching: 'vinculado',
        matchScore: 100,
        matchMetodo: 'manual',
      })
      .where(eq(dfeInboxItems.id, itemId));

    return c.json({ sucesso: true });
  };

  /**
   * GET /fiscal/inbox/de-para - Listar mapeamentos De-Para
   */
  listarDePara = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const { supplierCnpj } = c.req.query();

    const mapeamentos = await this.matchingService.listarMapeamentos(
      tenantId,
      supplierCnpj || undefined
    );

    return c.json({ data: mapeamentos });
  };

  // ============================================
  // LANÇAMENTO
  // ============================================

  /**
   * POST /fiscal/inbox/:id/lancar - Lançar documento no sistema
   */
  lancar = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const documentId = c.req.param('id');
    const body = await c.req.json();

    const {
      atualizarEstoque = true,
      gerarContaPagar = true,
      atualizarCustoMedio = true,
      criarFornecedor = false,
    } = body;

    // Buscar documento
    const [documento] = await this.db
      .select()
      .from(dfeInboxDocuments)
      .where(
        and(
          eq(dfeInboxDocuments.tenantId, tenantId),
          eq(dfeInboxDocuments.id, documentId)
        )
      )
      .limit(1);

    if (!documento) {
      return c.json({ error: 'Documento não encontrado' }, 404);
    }

    if (documento.status === 'lancada') {
      return c.json({ error: 'Documento já foi lançado' }, 400);
    }

    // Verificar se todos os itens estão vinculados
    const itens = await this.db
      .select()
      .from(dfeInboxItems)
      .where(eq(dfeInboxItems.documentId, documentId));

    const itensNaoVinculados = itens.filter((i: any) => i.statusMatching !== 'vinculado');
    if (itensNaoVinculados.length > 0) {
      return c.json({
        error: `${itensNaoVinculados.length} item(ns) ainda não vinculado(s) a produtos internos`,
        itensNaoVinculados: itensNaoVinculados.map((i: any) => ({
          id: i.id,
          descricao: i.descricao,
          statusMatching: i.statusMatching,
        })),
      }, 400);
    }

    // TODO: Integrar com módulo de Estoque (atualizar saldos e custo médio)
    // TODO: Integrar com módulo Financeiro (gerar contas a pagar)
    // TODO: Integrar com módulo de Cadastros (criar fornecedor se necessário)

    // Atualizar status do documento
    await this.db
      .update(dfeInboxDocuments)
      .set({
        status: 'lancada',
        lancadoPor: userId,
        lancadoEm: new Date(),
      })
      .where(eq(dfeInboxDocuments.id, documentId));

    // Registrar auditoria
    await this.auditService.registrarLancamento(
      tenantId,
      userId,
      documentId,
      documento.chaveAcesso,
      {
        atualizarEstoque,
        gerarContaPagar,
        atualizarCustoMedio,
        criarFornecedor,
        totalItens: itens.length,
        valorTotal: documento.valorTotal,
      }
    );

    return c.json({
      sucesso: true,
      documentId,
      acoes: {
        estoqueAtualizado: atualizarEstoque,
        contaPagarGerada: gerarContaPagar,
        custoMedioAtualizado: atualizarCustoMedio,
        fornecedorCriado: criarFornecedor,
      },
    });
  };

  // ============================================
  // DASHBOARD / MÉTRICAS
  // ============================================

  /**
   * GET /fiscal/inbox/dashboard - Métricas do Inbox
   */
  dashboard = async (c: Context) => {
    const tenantId = c.get('tenantId');

    const metricas = await this.db
      .select({
        status: dfeInboxDocuments.status,
        count: sql<number>`count(*)`,
        valorTotal: sql<number>`sum(${dfeInboxDocuments.valorTotal}::numeric)`,
      })
      .from(dfeInboxDocuments)
      .where(eq(dfeInboxDocuments.tenantId, tenantId))
      .groupBy(dfeInboxDocuments.status);

    const porTipo = await this.db
      .select({
        tipo: dfeInboxDocuments.tipo,
        count: sql<number>`count(*)`,
      })
      .from(dfeInboxDocuments)
      .where(eq(dfeInboxDocuments.tenantId, tenantId))
      .groupBy(dfeInboxDocuments.tipo);

    return c.json({
      porStatus: metricas,
      porTipo,
    });
  };

  /**
   * POST /fiscal/inbox/importar-xml - Importar XML manualmente
   */
  importarXml = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = await c.req.json();

    const { xml, tipo = 'nfe' } = body;
    if (!xml) {
      return c.json({ error: 'XML é obrigatório' }, 400);
    }

    try {
      // Parse do XML
      const parsed = (await import('../../application/pipeline/xml-parser')).XMLParser.parseNFe(xml);

      // Verificar duplicidade
      const existente = await this.db
        .select({ id: dfeInboxDocuments.id })
        .from(dfeInboxDocuments)
        .where(
          and(
            eq(dfeInboxDocuments.tenantId, tenantId),
            eq(dfeInboxDocuments.chaveAcesso, parsed.chaveAcesso)
          )
        )
        .limit(1);

      if (existente.length > 0) {
        return c.json({ error: 'Documento já existe no sistema', documentId: existente[0].id }, 409);
      }

      // Inserir documento
      const [inserted] = await this.db
        .insert(dfeInboxDocuments)
        .values({
          tenantId,
          tipo,
          chaveAcesso: parsed.chaveAcesso,
          numero: parsed.numero,
          serie: parsed.serie,
          dataEmissao: new Date(parsed.dataEmissao),
          emitenteCpfCnpj: parsed.emitente.cnpj,
          emitenteRazaoSocial: parsed.emitente.razaoSocial,
          emitenteNomeFantasia: parsed.emitente.nomeFantasia,
          emitenteIe: parsed.emitente.ie,
          emitenteUf: parsed.emitente.uf,
          destinatarioCpfCnpj: parsed.destinatario.cpfCnpj,
          valorTotal: parsed.totais.valorTotal.toString(),
          valorProdutos: parsed.totais.valorProdutos.toString(),
          status: 'pendente',
          origemCaptura: 'importacao_manual',
          xmlCompleto: xml,
          totalItens: parsed.itens.length,
        })
        .returning();

      // Adicionar à fila de processamento
      await this.db.insert((await import('../../infrastructure/schemas/dfe-inbox')).dfeProcessingQueue).values({
        tenantId,
        documentId: inserted.id,
        tipo: 'parse_xml',
        status: 'pendente',
        tentativas: 0,
        dadosEntrada: { xml },
      });

      // Registrar auditoria
      await this.auditService.registrarCaptura(
        tenantId,
        inserted.id,
        parsed.chaveAcesso,
        'importacao_manual'
      );

      return c.json({ sucesso: true, documentId: inserted.id }, 201);
    } catch (error: any) {
      return c.json({ error: `Erro ao processar XML: ${error.message}` }, 400);
    }
  };
}
