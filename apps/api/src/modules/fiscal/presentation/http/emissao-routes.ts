/**
 * Emissão Routes
 * Rotas para emissão e gerenciamento de documentos fiscais.
 */
import { Hono } from 'hono';
import type { EmissaoController } from './emissao-controller';

export function createEmissaoRoutes(controller: EmissaoController): Hono {
  const router = new Hono();

  // Listar documentos emitidos
  router.get('/', controller.listar);

  // Consultar documento emitido
  router.get('/:id', controller.consultar);

  // Baixar DANFE (PDF)
  router.get('/:id/pdf', controller.baixarPdf);

  // Emitir NF-e
  router.post('/nfe', controller.emitirNFe);

  // Cancelar documento
  router.post('/:id/cancelar', controller.cancelar);

  // Carta de Correção
  router.post('/:id/carta-correcao', controller.cartaCorrecao);

  // Inutilizar faixa de numeração
  router.post('/inutilizar', controller.inutilizar);

  return router;
}
