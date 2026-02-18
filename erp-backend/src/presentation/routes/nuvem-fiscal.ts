import { Hono } from 'hono';
import { NuvemFiscalController } from '../controllers/nuvem-fiscal/NuvemFiscalController';
import { HonoContext } from '../../infrastructure/cloudflare/types';

/**
 * Rotas da integração Nuvem Fiscal
 * Todas as rotas são prefixadas com /api/v1/nuvem-fiscal
 */
export function createNuvemFiscalRoutes(env?: any) {
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
  // CONFIGURAÇÕES - CT-e
  // ============================================
  router.get('/empresas/:cpf_cnpj/cte/config', (c) => getController(c).consultarConfiguracaoCTe(c));
  router.put('/empresas/:cpf_cnpj/cte/config', (c) => getController(c).alterarConfiguracaoCTe(c));

  // TODO: Adicionar rotas para:
  // - NFe (emissão, consulta, cancelamento, carta de correção)
  // - NFCe (emissão, consulta, cancelamento)
  // - NFSe (emissão, consulta, cancelamento)
  // - CTe (emissão, consulta, cancelamento)
  // - Distribuição NF-e (listar, manifestar)
  // - Webhooks

  return router;
}
