import { eq, and, sql } from 'drizzle-orm';
import type { IBankAccountRepository } from '../../domain/repositories';
import type { BankAccount, CreateBankAccountDTO, UpdateBankAccountDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { bankAccounts, financialTransactions } from '../schema';

export class BankAccountRepository implements IBankAccountRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string): Promise<BankAccount[]> {
    const result = await this.db.select().from(bankAccounts)
      .where(eq(bankAccounts.tenantId, tenantId))
      .orderBy(bankAccounts.description);

    // Calcular saldo de cada conta
    const accounts = result as unknown as BankAccount[];
    for (const account of accounts) {
      account.currentBalance = await this.calculateBalance(account.id, tenantId);
    }
    return accounts;
  }

  async getById(id: string, tenantId: string): Promise<BankAccount | null> {
    const result = await this.db.select().from(bankAccounts)
      .where(and(eq(bankAccounts.id, id), eq(bankAccounts.tenantId, tenantId)))
      .limit(1);
    if (!result[0]) return null;

    const account = result[0] as unknown as BankAccount;
    account.currentBalance = await this.calculateBalance(id, tenantId);
    return account;
  }

  async create(tenantId: string, data: CreateBankAccountDTO): Promise<BankAccount> {
    const result = await this.db.insert(bankAccounts).values({
      tenantId,
      bankCode: data.bankCode,
      agency: data.agency,
      accountNumber: data.accountNumber,
      accountType: data.accountType,
      description: data.description || null,
      initialBalance: String(data.initialBalance ?? 0),
    }).returning();

    const account = result[0] as unknown as BankAccount;
    account.currentBalance = Number(account.initialBalance);
    return account;
  }

  async update(id: string, tenantId: string, data: UpdateBankAccountDTO): Promise<BankAccount | null> {
    const updates: Record<string, any> = {};
    if (data.bankCode !== undefined) updates.bankCode = data.bankCode;
    if (data.agency !== undefined) updates.agency = data.agency;
    if (data.accountNumber !== undefined) updates.accountNumber = data.accountNumber;
    if (data.accountType !== undefined) updates.accountType = data.accountType;
    if (data.description !== undefined) updates.description = data.description;
    if (data.isActive !== undefined) updates.isActive = data.isActive;

    if (Object.keys(updates).length === 0) return this.getById(id, tenantId);

    const result = await this.db.update(bankAccounts).set(updates)
      .where(and(eq(bankAccounts.id, id), eq(bankAccounts.tenantId, tenantId)))
      .returning();

    if (!result[0]) return null;
    const account = result[0] as unknown as BankAccount;
    account.currentBalance = await this.calculateBalance(id, tenantId);
    return account;
  }

  async deactivate(id: string, tenantId: string): Promise<boolean> {
    const result = await this.db.update(bankAccounts)
      .set({ isActive: false })
      .where(and(eq(bankAccounts.id, id), eq(bankAccounts.tenantId, tenantId)))
      .returning();
    return result.length > 0;
  }

  async calculateBalance(id: string, tenantId: string): Promise<number> {
    // Buscar saldo inicial
    const accountResult = await this.db.select({ initialBalance: bankAccounts.initialBalance })
      .from(bankAccounts)
      .where(and(eq(bankAccounts.id, id), eq(bankAccounts.tenantId, tenantId)))
      .limit(1);

    if (!accountResult[0]) return 0;
    const initialBalance = Number(accountResult[0].initialBalance);

    // Somar entradas
    const inflowResult = await this.db.select({
      total: sql<string>`COALESCE(SUM(${financialTransactions.value}), 0)`,
    }).from(financialTransactions)
      .where(and(
        eq(financialTransactions.bankAccountId, id),
        eq(financialTransactions.tenantId, tenantId),
        sql`${financialTransactions.type} IN ('inflow', 'transfer_in', 'adjustment')`,
      ));

    // Somar saídas
    const outflowResult = await this.db.select({
      total: sql<string>`COALESCE(SUM(${financialTransactions.value}), 0)`,
    }).from(financialTransactions)
      .where(and(
        eq(financialTransactions.bankAccountId, id),
        eq(financialTransactions.tenantId, tenantId),
        sql`${financialTransactions.type} IN ('outflow', 'transfer_out')`,
      ));

    const inflows = Number(inflowResult[0]?.total || 0);
    const outflows = Number(outflowResult[0]?.total || 0);

    return initialBalance + inflows - outflows;
  }
}
