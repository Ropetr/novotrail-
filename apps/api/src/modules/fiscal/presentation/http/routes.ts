import { Hono } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';
import { NuvemFiscalController } from './controller';
import { FiscalConfigController } from './fiscal-config-controller';

/**
 * Creates the fiscal module route definitions.
 * - /nuvem-fiscal/* → Nuvem Fiscal integration (existing)
 * - /config/* → Fiscal config per tenant (Onda 0)
 * - /produtos/* → Product tax rules (Onda 0)
 */
export function createNuvemFiscalRoutes() {
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

/**
 * Creates the fiscal config routes (Onda 0).
 * These routes manage fiscal configuration per tenant and product tax rules.
 */
export function createFiscalConfigRoutes() {
  const router = new Hono<HonoContext>();

  const getCtrl = (c: any) => c.get('fiscalConfigController' as any) as FiscalConfigController;

  // ============================================
  // FISCAL CONFIG - Empresa
  // ============================================
  router.get('/empresa', (c) => getCtrl(c).getConfig(c));
  router.put('/empresa', (c) => getCtrl(c).updateConfig(c));
  router.get('/status', (c) => getCtrl(c).getOnboardingStatus(c));

  return router;
}

/**
 * Creates the product tax rules routes (Onda 0).
 */
export function createProductTaxRulesRoutes() {
  const router = new Hono<HonoContext>();

  const getCtrl = (c: any) => c.get('fiscalConfigController' as any) as FiscalConfigController;

  // ============================================
  // TAX RULES per product
  // ============================================
  router.post('/tax-rules/seed', (c) => getCtrl(c).seedTaxRules(c));
  router.post('/:id/tax-rules', (c) => getCtrl(c).createTaxRule(c));
  router.get('/:id/tax-rules', (c) => getCtrl(c).listTaxRules(c));
  router.put('/:id/tax-rules/:ruleId', (c) => getCtrl(c).updateTaxRule(c));
  router.delete('/:id/tax-rules/:ruleId', (c) => getCtrl(c).deleteTaxRule(c));

  return router;
}
