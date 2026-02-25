/**
 * DF-e Inbox Routes
 * Rotas para gerenciamento de documentos fiscais recebidos.
 */
import { Hono } from 'hono';
import type { DFeInboxController } from './dfe-inbox-controller';

export function createDFeInboxRoutes(controller: DFeInboxController): Hono {
  const router = new Hono();

  // ============================================
  // DOCUMENTOS RECEBIDOS
  // ============================================

  // Listar documentos recebidos (com filtros e paginação)
  router.get('/', controller.listar);

  // Dashboard / métricas do Inbox
  router.get('/dashboard', controller.dashboard);

  // Listar mapeamentos De-Para
  router.get('/de-para', controller.listarDePara);

  // Consultar documento específico com itens e manifestações
  router.get('/:id', controller.consultar);

  // Baixar XML do documento
  router.get('/:id/xml', controller.baixarXml);

  // ============================================
  // CAPTURA
  // ============================================

  // Iniciar captura manual de NF-e via Nuvem Fiscal
  router.post('/capturar', controller.capturar);

  // Importar XML manualmente
  router.post('/importar-xml', controller.importarXml);

  // Processar fila de documentos pendentes
  router.post('/processar-fila', controller.processarFila);

  // ============================================
  // MANIFESTAÇÃO
  // ============================================

  // Manifestar nota (ciência, confirmação, desconhecimento, não realizada)
  router.post('/:id/manifestar', controller.manifestar);

  // ============================================
  // DE-PARA / VINCULAÇÃO
  // ============================================

  // Vincular item a produto interno
  router.post('/items/:id/vincular', controller.vincularProduto);

  // ============================================
  // LANÇAMENTO
  // ============================================

  // Lançar documento no sistema (estoque, financeiro, etc.)
  router.post('/:id/lancar', controller.lancar);

  return router;
}
