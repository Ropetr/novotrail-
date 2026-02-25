/**
 * GNRE Routes
 */
import { Hono } from 'hono';
import type { GnreController } from './gnre-controller';

export function createGnreRoutes(controller: GnreController): Hono {
  const router = new Hono();

  // Listar guias GNRE
  router.get('/', controller.listar);

  // Gerar guia GNRE
  router.post('/', controller.gerar);

  // Calcular ICMS-ST
  router.post('/calcular-icms-st', controller.calcularIcmsSt);

  // Calcular DIFAL
  router.post('/calcular-difal', controller.calcularDifal);

  return router;
}
