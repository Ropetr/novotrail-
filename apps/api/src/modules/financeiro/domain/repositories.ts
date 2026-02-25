import {
  ChartOfAccount, CreateChartOfAccountDTO, UpdateChartOfAccountDTO,
  BankAccount, CreateBankAccountDTO, UpdateBankAccountDTO,
  CostCenter, CreateCostCenterDTO, UpdateCostCenterDTO,
  FinancialTitle, CreateTitleDTO, UpdateTitleDTO, SettleTitleDTO,
  FinancialTransaction, CreateTransactionDTO,
  FinancialSettlement,
  FinancialLog, LogAction,
  FinancialDashboard, CashFlowItem, DueSoonTitle,
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
