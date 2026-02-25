// ==================== Plano de Contas ====================

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface ChartOfAccount {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: AccountType;
  parentId: string | null;
  isAnalytical: boolean;
  createdAt: Date;
}

export interface CreateChartOfAccountDTO {
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
  isAnalytical?: boolean;
}

export interface UpdateChartOfAccountDTO {
  code?: string;
  name?: string;
  type?: AccountType;
  parentId?: string | null;
  isAnalytical?: boolean;
}

// ==================== Contas Bancárias ====================

export type BankAccountType = 'checking' | 'savings' | 'cash';

export interface BankAccount {
  id: string;
  tenantId: string;
  bankCode: string;
  agency: string;
  accountNumber: string;
  accountType: BankAccountType;
  description: string | null;
  initialBalance: string;
  isActive: boolean;
  createdAt: Date;
  // Calculado
  currentBalance?: number;
}

export interface CreateBankAccountDTO {
  bankCode: string;
  agency: string;
  accountNumber: string;
  accountType: BankAccountType;
  description?: string;
  initialBalance?: number;
}

export interface UpdateBankAccountDTO {
  bankCode?: string;
  agency?: string;
  accountNumber?: string;
  accountType?: BankAccountType;
  description?: string;
  isActive?: boolean;
}

// ==================== Centros de Custo ====================

export interface CostCenter {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  parentId: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateCostCenterDTO {
  code: string;
  name: string;
  parentId?: string;
}

export interface UpdateCostCenterDTO {
  code?: string;
  name?: string;
  parentId?: string | null;
  isActive?: boolean;
}

// ==================== Títulos (Contas a Pagar/Receber) ====================

export type TitleType = 'payable' | 'receivable';
export type TitleOrigin = 'purchase' | 'sale' | 'manual' | 'adjustment';
export type TitleStatus = 'open' | 'partial' | 'paid' | 'cancelled' | 'overdue';

export interface FinancialTitle {
  id: string;
  tenantId: string;
  type: TitleType;
  origin: TitleOrigin;
  originId: string | null;
  documentNumber: string | null;
  description: string | null;
  personId: string;
  dueDate: string;
  issueDate: string;
  value: string;
  openValue: string;
  discount: string;
  interest: string;
  fine: string;
  status: TitleStatus;
  costCenterId: string | null;
  accountId: string | null;
  bankAccountId: string | null;
  attachmentUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Joined
  settlements?: FinancialSettlement[];
  personName?: string;
}

export interface CreateTitleDTO {
  type: TitleType;
  origin?: TitleOrigin;
  originId?: string;
  documentNumber?: string;
  description?: string;
  personId: string;
  dueDate: string;
  issueDate: string;
  value: number;
  costCenterId?: string;
  accountId?: string;
  bankAccountId?: string;
}

export interface UpdateTitleDTO {
  documentNumber?: string;
  description?: string;
  dueDate?: string;
  costCenterId?: string | null;
  accountId?: string | null;
  bankAccountId?: string | null;
}

export interface SettleTitleDTO {
  value: number;
  discount?: number;
  interest?: number;
  fine?: number;
  bankAccountId: string;
  settlementDate: string;
}

// ==================== Baixas/Liquidações ====================

export interface FinancialSettlement {
  id: string;
  titleId: string;
  settlementDate: string;
  value: string;
  discount: string;
  interest: string;
  fine: string;
  bankAccountId: string | null;
  attachmentUrl: string | null;
  createdAt: Date;
}

// ==================== Movimentação Financeira ====================

export type TransactionType = 'inflow' | 'outflow' | 'transfer_in' | 'transfer_out' | 'adjustment';

export interface FinancialTransaction {
  id: string;
  tenantId: string;
  bankAccountId: string;
  type: TransactionType;
  value: string;
  description: string | null;
  referenceId: string | null;
  referenceType: string | null;
  occurredAt: Date;
  createdAt: Date;
  // Joined
  bankAccountName?: string;
}

export interface CreateTransactionDTO {
  bankAccountId: string;
  type: TransactionType;
  value: number;
  description?: string;
  referenceId?: string;
  referenceType?: string;
  occurredAt?: string;
}

export interface CreateTransferDTO {
  fromBankAccountId: string;
  toBankAccountId: string;
  value: number;
  description?: string;
  occurredAt?: string;
}

// ==================== Logs ====================

export type LogAction = 'create' | 'update' | 'delete' | 'settle' | 'cancel';

export interface FinancialLog {
  id: string;
  tenantId: string;
  entity: string;
  entityId: string;
  action: LogAction;
  userId: string;
  details: string | null;
  createdAt: Date;
  // Joined
  userName?: string;
}

// ==================== Dashboard ====================

export interface FinancialDashboard {
  totalBankBalance: number;
  totalReceivable: number;
  totalPayable: number;
  overdueReceivable: number;
  overduePayable: number;
  receivableCount: number;
  payableCount: number;
  overdueCount: number;
}

export interface CashFlowItem {
  date: string;
  inflows: number;
  outflows: number;
  balance: number;
}

export interface DueSoonTitle {
  id: string;
  type: TitleType;
  personId: string;
  personName?: string;
  documentNumber: string | null;
  description: string | null;
  dueDate: string;
  openValue: string;
  daysUntilDue: number;
}
