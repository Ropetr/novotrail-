/**
 * GNRE Controller
 * Endpoints para geração e gerenciamento de guias GNRE.
 */
import { Context } from 'hono';
import type { GnreService } from '../../application/gnre/gnre-service';

export class GnreController {
  constructor(private gnreService: GnreService) {}

  /**
   * GET /fiscal/gnre - Listar guias GNRE
   */
  listar = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const { status, uf, page = '1', limit = '20' } = c.req.query();

    const resultado = await this.gnreService.listar(tenantId, {
      status,
      uf,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return c.json(resultado);
  };

  /**
   * POST /fiscal/gnre - Gerar guia GNRE
   */
  gerar = async (c: Context) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = await c.req.json();

    const resultado = await this.gnreService.gerarGuia(tenantId, userId, body);

    if (!resultado.sucesso) {
      return c.json(resultado, 400);
    }

    return c.json(resultado, 201);
  };

  /**
   * POST /fiscal/gnre/calcular-icms-st - Calcular ICMS-ST
   */
  calcularIcmsSt = async (c: Context) => {
    const body = await c.req.json();

    const resultado = this.gnreService.calcularIcmsSt(body);

    return c.json(resultado);
  };

  /**
   * POST /fiscal/gnre/calcular-difal - Calcular DIFAL
   */
  calcularDifal = async (c: Context) => {
    const body = await c.req.json();

    const resultado = this.gnreService.calcularDifal(body);

    return c.json(resultado);
  };
}
