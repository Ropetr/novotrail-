import { Hono } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';
import { ChartOfAccountsController } from './controllers/chart-of-accounts-controller';
import { BankAccountController } from './controllers/bank-account-controller';
import { CostCenterController } from './controllers/cost-center-controller';
import { FinancialTitleController } from './controllers/financial-title-controller';
import { FinancialTransactionController } from './controllers/financial-transaction-controller';
import { DashboardController } from './controllers/dashboard-controller';
import { ReconciliationController } from './controllers/reconciliation-controller';
import { ReportController } from './controllers/report-controller';
import { PaymentRuleController } from './controllers/payment-rule-controller';
import { IntegrationController } from './controllers/integration-controller';
import { AttachmentController } from './controllers/attachment-controller';

export function createFinanceiroRoutes() {
  const router = new Hono<HonoContext>();

  // Helpers para buscar controllers do contexto
  const getChartCtrl = (c: any) => c.get('chartOfAccountsController') as ChartOfAccountsController;
  const getBankCtrl = (c: any) => c.get('bankAccountController') as BankAccountController;
  const getCostCenterCtrl = (c: any) => c.get('costCenterController') as CostCenterController;
  const getTitleCtrl = (c: any) => c.get('financialTitleController') as FinancialTitleController;
  const getTransactionCtrl = (c: any) => c.get('financialTransactionController') as FinancialTransactionController;
  const getDashboardCtrl = (c: any) => c.get('dashboardController') as DashboardController;
  const getReconCtrl = (c: any) => c.get('reconciliationController') as ReconciliationController;
  const getReportCtrl = (c: any) => c.get('reportController') as ReportController;
  const getRuleCtrl = (c: any) => c.get('paymentRuleController') as PaymentRuleController;
  const getIntegrationCtrl = (c: any) => c.get('integrationController') as IntegrationController;
  const getAttachmentCtrl = (c: any) => c.get('attachmentController') as AttachmentController;

  // ==================== Plano de Contas (4) ====================
  router.get('/plano-contas', (c) => getChartCtrl(c).list(c));
  router.post('/plano-contas', (c) => getChartCtrl(c).create(c));
  router.put('/plano-contas/:id', (c) => getChartCtrl(c).update(c));
  router.delete('/plano-contas/:id', (c) => getChartCtrl(c).remove(c));

  // ==================== Contas Bancárias (5) ====================
  router.get('/contas-bancarias', (c) => getBankCtrl(c).list(c));
  router.post('/contas-bancarias', (c) => getBankCtrl(c).create(c));
  router.get('/contas-bancarias/:id', (c) => getBankCtrl(c).getById(c));
  router.put('/contas-bancarias/:id', (c) => getBankCtrl(c).update(c));
  router.delete('/contas-bancarias/:id', (c) => getBankCtrl(c).deactivate(c));

  // ==================== Centros de Custo (4) ====================
  router.get('/centros-custo', (c) => getCostCenterCtrl(c).list(c));
  router.post('/centros-custo', (c) => getCostCenterCtrl(c).create(c));
  router.put('/centros-custo/:id', (c) => getCostCenterCtrl(c).update(c));
  router.delete('/centros-custo/:id', (c) => getCostCenterCtrl(c).deactivate(c));

  // ==================== Títulos - Contas a Pagar/Receber (6) ====================
  router.get('/titulos', (c) => getTitleCtrl(c).list(c));
  router.post('/titulos', (c) => getTitleCtrl(c).create(c));
  router.get('/titulos/:id', (c) => getTitleCtrl(c).getById(c));
  router.put('/titulos/:id', (c) => getTitleCtrl(c).update(c));
  router.delete('/titulos/:id', (c) => getTitleCtrl(c).cancel(c));
  router.post('/titulos/:id/baixar', (c) => getTitleCtrl(c).settle(c));

  // ==================== Anexos de Títulos (2) ====================
  router.post('/titulos/:id/anexo', (c) => getAttachmentCtrl(c).upload(c));
  router.get('/titulos/:id/anexo', (c) => getAttachmentCtrl(c).download(c));

  // ==================== Integração Comercial→Financeiro (2) ====================
  router.post('/titulos/from-sale', (c) => getIntegrationCtrl(c).fromSale(c));
  router.post('/titulos/from-purchase', (c) => getIntegrationCtrl(c).fromPurchase(c));

  // ==================== Movimentação Financeira (3) ====================
  router.get('/movimentacoes', (c) => getTransactionCtrl(c).list(c));
  router.post('/movimentacoes', (c) => getTransactionCtrl(c).create(c));
  router.post('/movimentacoes/transferencia', (c) => getTransactionCtrl(c).transfer(c));

  // ==================== Conciliação Bancária (6) ====================
  router.get('/conciliacoes', (c) => getReconCtrl(c).list(c));
  router.post('/conciliacoes', (c) => getReconCtrl(c).create(c));
  router.get('/conciliacoes/:id', (c) => getReconCtrl(c).getById(c));
  router.post('/conciliacoes/:id/importar', (c) => getReconCtrl(c).importOFX(c));
  router.post('/conciliacoes/:id/conciliar', (c) => getReconCtrl(c).matchEntries(c));
  router.patch('/conciliacoes/:id/finalizar', (c) => getReconCtrl(c).finalize(c));

  // ==================== Relatórios Avançados (3) ====================
  router.get('/relatorios/dre', (c) => getReportCtrl(c).getDRE(c));
  router.get('/relatorios/aging', (c) => getReportCtrl(c).getAging(c));
  router.get('/relatorios/fluxo-realizado', (c) => getReportCtrl(c).getCashFlowRealized(c));

  // ==================== Régua de Cobrança (4) ====================
  router.get('/regua-cobranca', (c) => getRuleCtrl(c).list(c));
  router.post('/regua-cobranca', (c) => getRuleCtrl(c).create(c));
  router.put('/regua-cobranca/:id', (c) => getRuleCtrl(c).update(c));
  router.delete('/regua-cobranca/:id', (c) => getRuleCtrl(c).remove(c));

  // ==================== Dashboard (3) ====================
  router.get('/dashboard', (c) => getDashboardCtrl(c).getDashboard(c));
  router.get('/dashboard/fluxo-caixa', (c) => getDashboardCtrl(c).getCashFlow(c));
  router.get('/dashboard/vencimentos', (c) => getDashboardCtrl(c).getDueSoon(c));

  // ==================== Logs (1) ====================
  router.get('/logs', (c) => getDashboardCtrl(c).getLogs(c));

  return router;
}
