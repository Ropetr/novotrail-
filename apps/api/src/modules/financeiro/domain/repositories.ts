import {
  ChartOfAccount, CreateChartOfAccountDTO, UpdateChartOfAccountDTO,
  BankAccount, CreateBankAccountDTO, UpdateBankAccountDTO,
  CostCenter, CreateCostCenterDTO, UpdateCostCenterDTO,
  FinancialTitle, CreateTitleDTO, UpdateTitleDTO, SettleTitleDTO,
  FinancialTransaction, CreateTransactionDTO,
  FinancialSettlement,
  FinancialLog, LogAction,
  FinancialDashboard, CashFlowItem, DueSoonTitle,
  BankReconciliation, CreateReconciliationDTO, BankStatementEntry, MatchEntryDTO,
  PaymentRule, CreatePaymentRuleDTO, UpdatePaymentRuleDTO,
  DREReport, AgingReport, CashFlowRealized,
} from './entities';

export interface IChartOfAccountsRepository {
  list(tenantId: string): Promise<ChartOfAccount[]>;
  getById(id: string, tenantId: string): Promise<ChartOfAccount | null>;
  create(tenantId: string, data: CreateChartOfAccountDTO): Promise<ChartOfAccount>;
  update(id: string, tenantId: string, data: UpdateChartOfAccountDTO): Promise<ChartOfAccount | null>;
  remove(id: string, tenantId: string): Promise<boolean>;
}

export interface IBankAccountRepository {
  list(tenantId: string): Promise<BankAccount[]>;
  getById(id: string, tenantId: string): Promise<BankAccount | null>;
  create(tenantId: string, data: CreateBankAccountDTO): Promise<BankAccount>;
  update(id: string, tenantId: string, data: UpdateBankAccountDTO): Promise<BankAccount | null>;
  deactivate(id: string, tenantId: string): Promise<boolean>;
  calculateBalance(id: string, tenantId: string): Promise<number>;
}

export interface ICostCenterRepository {
  list(tenantId: string): Promise<CostCenter[]>;
  getById(id: string, tenantId: string): Promise<CostCenter | null>;
  create(tenantId: string, data: CreateCostCenterDTO): Promise<CostCenter>;
  update(id: string, tenantId: string, data: UpdateCostCenterDTO): Promise<CostCenter | null>;
  deactivate(id: string, tenantId: string): Promise<boolean>;
}

export interface IFinancialTitleRepository {
  list(tenantId: string, filters?: {
    type?: string;
    status?: string;
    personId?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: FinancialTitle[]; total: number }>;
  getById(id: string, tenantId: string): Promise<FinancialTitle | null>;
  create(tenantId: string, data: CreateTitleDTO): Promise<FinancialTitle>;
  update(id: string, tenantId: string, data: UpdateTitleDTO): Promise<FinancialTitle | null>;
  cancel(id: string, tenantId: string): Promise<boolean>;
  settle(id: string, tenantId: string, data: SettleTitleDTO): Promise<{
    title: FinancialTitle;
    settlement: FinancialSettlement;
  }>;
  getDashboard(tenantId: string): Promise<FinancialDashboard>;
  getCashFlow(tenantId: string, days: number): Promise<CashFlowItem[]>;
  getDueSoon(tenantId: string, days: number): Promise<DueSoonTitle[]>;
}

export interface IFinancialTransactionRepository {
  list(tenantId: string, filters?: {
    bankAccountId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: FinancialTransaction[]; total: number }>;
  create(tenantId: string, data: CreateTransactionDTO): Promise<FinancialTransaction>;
}

export interface IFinancialLogRepository {
  list(tenantId: string, filters?: {
    entity?: string;
    entityId?: string;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: FinancialLog[]; total: number }>;
  create(tenantId: string, userId: string, entity: string, entityId: string, action: LogAction, details?: string): Promise<FinancialLog>;
}

export interface IReconciliationRepository {
  list(tenantId: string, bankAccountId?: string): Promise<BankReconciliation[]>;
  getById(id: string, tenantId: string): Promise<BankReconciliation | null>;
  create(tenantId: string, data: CreateReconciliationDTO): Promise<BankReconciliation>;
  getEntries(reconciliationId: string, tenantId: string): Promise<BankStatementEntry[]>;
  importEntries(reconciliationId: string, tenantId: string, entries: Omit<BankStatementEntry, 'id' | 'tenantId' | 'reconciliationId' | 'matchedTransactionId' | 'status' | 'createdAt'>[]): Promise<number>;
  matchEntry(entryId: string, tenantId: string, transactionId: string): Promise<BankStatementEntry | null>;
  ignoreEntry(entryId: string, tenantId: string): Promise<boolean>;
  autoMatch(reconciliationId: string, tenantId: string): Promise<number>;
  finalize(id: string, tenantId: string): Promise<BankReconciliation | null>;
}

export interface IPaymentRuleRepository {
  list(tenantId: string): Promise<PaymentRule[]>;
  getById(id: string, tenantId: string): Promise<PaymentRule | null>;
  create(tenantId: string, data: CreatePaymentRuleDTO): Promise<PaymentRule>;
  update(id: string, tenantId: string, data: UpdatePaymentRuleDTO): Promise<PaymentRule | null>;
  remove(id: string, tenantId: string): Promise<boolean>;
}

export interface IReportRepository {
  getDRE(tenantId: string, startDate: string, endDate: string, costCenterId?: string): Promise<DREReport>;
  getAging(tenantId: string, type: 'payable' | 'receivable', referenceDate?: string): Promise<AgingReport>;
  getCashFlowRealized(tenantId: string, startDate: string, endDate: string, bankAccountId?: string): Promise<CashFlowRealized[]>;
}
