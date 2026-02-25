/**
 * ADRC-ST Controller
 * Endpoints para geração e gerenciamento de arquivos ADRC-ST.
 */
import { Context } from 'hono';
import { eq, and, desc, sql } from 'drizzle-orm';
import { adrcstArquivos } from '../../infrastructure/schemas/gnre-adrcst';
import type { AdrcstService } from '../../application/adrcst/adrcst-service';

export class AdrcstController {
  constructor(
    private db: any,
    private adrcstService: AdrcstService
  ) {}

  /**
   * GET /fiscal/adrcst - Listar arquivos ADRC-ST gerados
   */
  listar = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const { page = '1', limit = '20' } = c.req.query();
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const arquivos = await this.db
      .select()
      .from(adrcstArquivos)
      .where(eq(adrcstArquivos.tenantId, tenantId))
      .orderBy(desc(adrcstArquivos.createdAt))
      .limit(parseInt(limit))
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(adrcstArquivos)
      .where(eq(adrcstArquivos.tenantId, tenantId));

    return c.json({
      data: arquivos.map((a: any) => ({
        ...a,
        conteudoArquivo: undefined, // Não enviar conteúdo na listagem
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Number(count),
        totalPages: Math.ceil(Number(count) / parseInt(limit)),
      },
    });
  };

  /**
   * POST /fiscal/adrcst/gerar - Gerar arquivo ADRC-ST
   */
  gerar = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = await c.req.json();

    const resultado = await this.adrcstService.gerarArquivo(tenantId, userId, body);

    if (!resultado.sucesso) {
      return c.json(resultado, 400);
    }

    return c.json({
      sucesso: true,
      arquivoId: resultado.arquivoId,
      totalRegistros: resultado.totalRegistros,
      valorRecuperacao: resultado.valorRecuperacao,
      valorRessarcimento: resultado.valorRessarcimento,
      valorComplementacao: resultado.valorComplementacao,
    }, 201);
  };

  /**
   * GET /fiscal/adrcst/:id - Consultar arquivo ADRC-ST
   */
  consultar = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const arquivoId = c.req.param('id');

    const [arquivo] = await this.db
      .select()
      .from(adrcstArquivos)
      .where(
        and(
          eq(adrcstArquivos.tenantId, tenantId),
          eq(adrcstArquivos.id, arquivoId)
        )
      )
      .limit(1);

    if (!arquivo) {
      return c.json({ error: 'Arquivo não encontrado' }, 404);
    }

    return c.json(arquivo);
  };

  /**
   * GET /fiscal/adrcst/:id/download - Baixar arquivo ADRC-ST (TXT)
   */
  download = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const arquivoId = c.req.param('id');

    const [arquivo] = await this.db
      .select()
      .from(adrcstArquivos)
      .where(
        and(
          eq(adrcstArquivos.tenantId, tenantId),
          eq(adrcstArquivos.id, arquivoId)
        )
      )
      .limit(1);

    if (!arquivo?.conteudoArquivo) {
      return c.json({ error: 'Arquivo não encontrado' }, 404);
    }

    const nomeArquivo = `ADRCST_${arquivo.cnpjEmpresa}_${arquivo.periodoInicio.toISOString().slice(0, 7).replace('-', '')}.txt`;

    return new Response(arquivo.conteudoArquivo, {
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
        'Content-Disposition': `attachment; filename="${nomeArquivo}"`,
      },
    });
  };
}
