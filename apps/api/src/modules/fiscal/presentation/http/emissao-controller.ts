/**
 * Emissão Controller
 * Endpoints para emissão e gerenciamento de documentos fiscais.
 */
import { Context } from 'hono';
import type { EmissaoService } from '../../application/emissao/emissao-service';
import type { FiscalConfigService } from '../../application/services/fiscal-config-service';

export class EmissaoController {
  constructor(
    private emissaoService: EmissaoService,
    private configService: FiscalConfigService
  ) {}

  /**
   * GET /fiscal/emissao - Listar documentos emitidos
   */
  listar = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const { tipo, status, page = '1', limit = '20' } = c.req.query();

    const resultado = await this.emissaoService.listar(tenantId, {
      tipo,
      status,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return c.json(resultado);
  };

  /**
   * GET /fiscal/emissao/:id - Consultar documento emitido
   */
  consultar = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const documentId = c.req.param('id');

    // Delegar para o service
    const resultado = await this.emissaoService.listar(tenantId, { page: 1, limit: 1 });
    const doc = resultado.data.find((d: any) => d.id === documentId);

    if (!doc) {
      return c.json({ error: 'Documento não encontrado' }, 404);
    }

    return c.json(doc);
  };

  /**
   * POST /fiscal/emissao/nfe - Emitir NF-e
   */
  emitirNFe = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = await c.req.json();

    const resultado = await this.emissaoService.emitirNFe(tenantId, userId, body);

    if (!resultado.sucesso) {
      return c.json(resultado, 400);
    }

    return c.json(resultado, 201);
  };

  /**
   * POST /fiscal/emissao/:id/cancelar - Cancelar documento
   */
  cancelar = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const documentId = c.req.param('id');
    const { justificativa } = await c.req.json();

    const resultado = await this.emissaoService.cancelarNFe(
      tenantId,
      userId,
      documentId,
      justificativa
    );

    if (!resultado.sucesso) {
      return c.json(resultado, 400);
    }

    return c.json(resultado);
  };

  /**
   * POST /fiscal/emissao/:id/carta-correcao - Emitir CC-e
   */
  cartaCorrecao = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const documentId = c.req.param('id');
    const { correcao } = await c.req.json();

    const resultado = await this.emissaoService.cartaCorrecao(
      tenantId,
      userId,
      documentId,
      correcao
    );

    if (!resultado.sucesso) {
      return c.json(resultado, 400);
    }

    return c.json(resultado);
  };

  /**
   * POST /fiscal/emissao/inutilizar - Inutilizar faixa de numeração
   */
  inutilizar = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const { serie, numeroInicial, numeroFinal, justificativa } = await c.req.json();

    const config = await this.configService.obterConfiguracoes(tenantId);
    if (!config.cnpjEmpresa) {
      return c.json({ error: 'CNPJ da empresa não configurado' }, 400);
    }

    const resultado = await this.emissaoService.inutilizar(
      tenantId,
      userId,
      config.cnpjEmpresa,
      serie,
      numeroInicial,
      numeroFinal,
      justificativa
    );

    if (!resultado.sucesso) {
      return c.json(resultado, 400);
    }

    return c.json(resultado);
  };

  /**
   * GET /fiscal/emissao/:id/pdf - Baixar DANFE
   */
  baixarPdf = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const documentId = c.req.param('id');

    const resultado = await this.emissaoService.baixarPdf(tenantId, documentId);

    if (resultado.error) {
      return c.json({ error: resultado.error }, 404);
    }

    return new Response(resultado.data, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="danfe_${documentId}.pdf"`,
      },
    });
  };
}
