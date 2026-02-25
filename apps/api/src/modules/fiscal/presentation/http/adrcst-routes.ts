/**
 * ADRC-ST Routes
 */
import { Hono } from 'hono';
import type { AdrcstController } from './adrcst-controller';

export function createAdrcstRoutes(controller: AdrcstController): Hono {
  const router = new Hono();

  // Listar arquivos ADRC-ST gerados
  router.get('/', controller.listar);

  // Gerar novo arquivo ADRC-ST
  router.post('/gerar', controller.gerar);

  // Consultar arquivo específico
  router.get('/:id', controller.consultar);

  // Baixar arquivo ADRC-ST (TXT)
  router.get('/:id/download', controller.download);

  return router;
}
