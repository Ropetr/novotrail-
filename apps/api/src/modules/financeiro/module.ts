import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createDatabaseConnection } from '../../shared/database/connection';

// Repositories
import { ChartOfAccountsRepository } from './infrastructure/repositories/chart-of-accounts-repository';
import { BankAccountRepository } from './infrastructure/repositories/bank-account-repository';
import { CostCenterRepository } from './infrastructure/repositories/cost-center-repository';
import { FinancialTitleRepository } from './infrastructure/repositories/financial-title-repository';
import { FinancialTransactionRepository } from './infrastructure/repositories/financial-transaction-repository';
import { FinancialLogRepository } from './infrastructure/repositories/financial-log-repository';
import { ReconciliationRepository } from './infrastructure/repositories/reconciliation-repository';
import { PaymentRuleRepository } from './infrastructure/repositories/payment-rule-repository';
import { ReportRepository } from './infrastructure/repositories/report-repository';

// Controllers
import { ChartOfAccountsController } from './presentation/http/controllers/chart-of-accounts-controller';
import { BankAccountController } from './presentation/http/controllers/bank-account-controller';
import { CostCenterController } from './presentation/http/controllers/cost-center-controller';
import { FinancialTitleController } from './presentation/http/controllers/financial-title-controller';
import { FinancialTransactionController } from './presentation/http/controllers/financial-transaction-controller';
import { DashboardController } from './presentation/http/controllers/dashboard-controller';
import { ReconciliationController } from './presentation/http/controllers/reconciliation-controller';
import { ReportController } from './presentation/http/controllers/report-controller';
import { PaymentRuleController } from './presentation/http/controllers/payment-rule-controller';
import { IntegrationController } from './presentation/http/controllers/integration-controller';
import { AttachmentController } from './presentation/http/controllers/attachment-controller';
import { createFinanceiroRoutes } from './presentation/http/routes';

/**
 * Creates and configures the Financeiro bounded context module.
 * Manages chart of accounts, bank accounts, cost centers, titles (payable/receivable),
 * settlements, financial transactions, reconciliation, reports, payment rules, and audit logs.
 */
export function createFinanceiroModule() {
  const router = new Hono<HonoContext>();

  // Middleware de DI
  router.use('*', async (c, next) => {
    const db = await createDatabaseConnection(c.env.HYPERDRIVE);

    // Repositories (base)
    const chartOfAccountsRepository = new ChartOfAccountsRepository(db);
    const bankAccountRepository = new BankAccountRepository(db);
    const costCenterRepository = new CostCenterRepository(db);
    const financialTitleRepository = new FinancialTitleRepository(db);
    const financialTransactionRepository = new FinancialTransactionRepository(db);
    const financialLogRepository = new FinancialLogRepository(db);

    // Repositories (avançado)
    const reconciliationRepository = new ReconciliationRepository(db);
    const paymentRuleRepository = new PaymentRuleRepository(db);
    const reportRepository = new ReportRepository(db);

    // Controllers (base - todos recebem logRepo para auditoria automática)
    const chartOfAccountsController = new ChartOfAccountsController(chartOfAccountsRepository, financialLogRepository);
    const bankAccountController = new BankAccountController(bankAccountRepository, financialLogRepository);
    const costCenterController = new CostCenterController(costCenterRepository, financialLogRepository);
    const financialTitleController = new FinancialTitleController(financialTitleRepository, financialLogRepository);
    const financialTransactionController = new FinancialTransactionController(financialTransactionRepository, financialLogRepository);
    const dashboardController = new DashboardController(financialTitleRepository, financialLogRepository);

    // Controllers (avançado)
    const reconciliationController = new ReconciliationController(reconciliationRepository, financialLogRepository);
    const reportController = new ReportController(reportRepository);
    const paymentRuleController = new PaymentRuleController(paymentRuleRepository, financialLogRepository);
    const integrationController = new IntegrationController(financialTitleRepository, financialLogRepository, db);
    const attachmentController = new AttachmentController(financialTitleRepository, financialLogRepository);

    // Base
    c.set('chartOfAccountsController' as any, chartOfAccountsController);
    c.set('bankAccountController' as any, bankAccountController);
    c.set('costCenterController' as any, costCenterController);
    c.set('financialTitleController' as any, financialTitleController);
    c.set('financialTransactionController' as any, financialTransactionController);
    c.set('dashboardController' as any, dashboardController);

    // Avançado
    c.set('reconciliationController' as any, reconciliationController);
    c.set('reportController' as any, reportController);
    c.set('paymentRuleController' as any, paymentRuleController);
    c.set('integrationController' as any, integrationController);
    c.set('attachmentController' as any, attachmentController);

    await next();
  });

  router.route('/', createFinanceiroRoutes());

  return router;
}
