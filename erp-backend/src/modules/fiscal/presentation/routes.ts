import { Hono } from 'hono';
import type { HonoContext } from '../../../shared/cloudflare/types';
import { NuvemFiscalController } from './controller';

/**
 * Creates the fiscal module route definitions for Nuvem Fiscal integration.
 * All routes are prefixed with /nuvem-fiscal when mounted.
 */
export function createFiscalRoutes() {
  const router = new Hono<HonoContext>();

  // Middleware para inicializar controller com env do contexto
  router.use('*', async (c, next) => {
    const controller = new NuvemFiscalController(c.env);
    c.set('nuvemFiscalController' as any, controller);
    await next();
  });

  // Helper para pegar controller
  const getController = (c: any) => c.get('nuvemFiscalController' as any) as NuvemFiscalController;

  // ============================================
  // CNPJ
  // ============================================
  router.post('/cnpj/consultar', (c) => getController(c).consultarCNPJ(c));

  // ============================================
  // EMPRESA
  // ============================================
  router.get('/empresas', (c) => getController(c).listarEmpresas(c));
  router.post('/empresas', (c) => getController(c).cadastrarEmpresa(c));
  router.get('/empresas/:cpf_cnpj', (c) => getController(c).consultarEmpresa(c));
  router.put('/empresas/:cpf_cnpj', (c) => getController(c).alterarEmpresa(c));
  router.delete('/empresas/:cpf_cnpj', (c) => getController(c).deletarEmpresa(c));

  // ============================================
  // CERTIFICADO DIGITAL
  // ============================================
  router.get('/certificados', (c) => getController(c).listarCertificados(c));
  router.get('/empresas/:cpf_cnpj/certificado', (c) => getController(c).consultarCertificado(c));
  router.put('/empresas/:cpf_cnpj/certificado', (c) => getController(c).cadastrarCertificadoBase64(c));
  router.delete('/empresas/:cpf_cnpj/certificado', (c) => getController(c).deletarCertificado(c));

  // ============================================
  // CONFIGURACOES - CT-e
  // ============================================
  router.get('/empresas/:cpf_cnpj/cte/config', (c) => getController(c).consultarConfiguracaoCTe(c));
  router.put('/empresas/:cpf_cnpj/cte/config', (c) => getController(c).alterarConfiguracaoCTe(c));

  return router;
}
