import { eq, and, sql, between } from 'drizzle-orm';
import type { DrizzleDatabase } from '../../../../shared/database/connection';
import { bankReconciliations, bankStatementEntries, financialTransactions } from '../schema';
import type { IReconciliationRepository } from '../../domain/repositories';
import type { BankReconciliation, BankStatementEntry, CreateReconciliationDTO } from '../../domain/entities';

export class ReconciliationRepository implements IReconciliationRepository {
  constructor(private db: DrizzleDatabase) {}

  async list(tenantId: string, bankAccountId?: string): Promise<BankReconciliation[]> {
    const conditions = [eq(bankReconciliations.tenantId, tenantId)];
    if (bankAccountId) conditions.push(eq(bankReconciliations.bankAccountId, bankAccountId));
    const rows = await this.db.select().from(bankReconciliations).where(and(...conditions)).orderBy(sql`${bankReconciliations.createdAt} DESC`);
    return rows as any[];
  }

  async getById(id: string, tenantId: string): Promise<BankReconciliation | null> {
    const [row] = await this.db.select().from(bankReconciliations)
      .where(and(eq(bankReconciliations.id, id), eq(bankReconciliations.tenantId, tenantId)));
    return (row as any) || null;
  }

  async create(tenantId: string, data: CreateReconciliationDTO): Promise<BankReconciliation> {
    const [row] = await this.db.insert(bankReconciliations).values({
      tenantId,
      bankAccountId: data.bankAccountId,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      statementBalance: String(data.statementBalance),
    }).returning();
    return row as any;
  }

  async getEntries(reconciliationId: string, tenantId: string): Promise<BankStatementEntry[]> {
    const rows = await this.db.select().from(bankStatementEntries)
      .where(and(eq(bankStatementEntries.reconciliationId, reconciliationId), eq(bankStatementEntries.tenantId, tenantId)))
      .orderBy(sql`${bankStatementEntries.entryDate} ASC`);
    return rows as any[];
  }

  async importEntries(reconciliationId: string, tenantId: string, entries: any[]): Promise<number> {
    if (!entries.length) return 0;
    const values = entries.map(e => ({
      tenantId,
      reconciliationId,
      entryDate: e.entryDate,
      description: e.description || null,
      amount: String(e.amount),
      type: e.type,
      externalId: e.externalId || null,
    }));
    await this.db.insert(bankStatementEntries).values(values);
    // Update reconciliation counts
    await this.db.update(bankReconciliations)
      .set({ totalEntries: entries.length, status: 'in_progress' as any })
      .where(eq(bankReconciliations.id, reconciliationId));
    return entries.length;
  }

  async matchEntry(entryId: string, tenantId: string, transactionId: string): Promise<BankStatementEntry | null> {
    const [row] = await this.db.update(bankStatementEntries)
      .set({ matchedTransactionId: transactionId, status: 'matched' as any })
      .where(and(eq(bankStatementEntries.id, entryId), eq(bankStatementEntries.tenantId, tenantId)))
      .returning();
    if (row) {
      // Increment matched count
      await this.db.execute(sql`UPDATE bank_reconciliations SET matched_entries = matched_entries + 1 WHERE id = ${(row as any).reconciliationId}`);
    }
    return (row as any) || null;
  }

  async ignoreEntry(entryId: string, tenantId: string): Promise<boolean> {
    const [row] = await this.db.update(bankStatementEntries)
      .set({ status: 'ignored' as any })
      .where(and(eq(bankStatementEntries.id, entryId), eq(bankStatementEntries.tenantId, tenantId)))
      .returning();
    return !!row;
  }

  async autoMatch(reconciliationId: string, tenantId: string): Promise<number> {
    // Get pending entries
    const entries = await this.db.select().from(bankStatementEntries)
      .where(and(
        eq(bankStatementEntries.reconciliationId, reconciliationId),
        eq(bankStatementEntries.tenantId, tenantId),
        eq(bankStatementEntries.status, 'pending'),
      ));

    // Get reconciliation to know the bank account
    const [recon] = await this.db.select().from(bankReconciliations)
      .where(eq(bankReconciliations.id, reconciliationId));
    if (!recon) return 0;

    let matched = 0;
    for (const entry of entries) {
      // Search for transaction with same value and date ±3 days
      const entryAmount = Math.abs(Number(entry.amount));
      const txType = entry.type === 'credit' ? 'inflow' : 'outflow';

      const [tx] = await this.db.select().from(financialTransactions)
        .where(and(
          eq(financialTransactions.tenantId, tenantId),
          eq(financialTransactions.bankAccountId, (recon as any).bankAccountId),
          sql`ABS(CAST(${financialTransactions.value} AS NUMERIC)) BETWEEN ${entryAmount * 0.99} AND ${entryAmount * 1.01}`,
          sql`CAST(${financialTransactions.occurredAt} AS DATE) BETWEEN (${entry.entryDate}::DATE - INTERVAL '3 days') AND (${entry.entryDate}::DATE + INTERVAL '3 days')`,
          sql`${financialTransactions.id} NOT IN (SELECT matched_transaction_id FROM bank_statement_entries WHERE matched_transaction_id IS NOT NULL AND tenant_id = ${tenantId})`,
        ))
        .limit(1);

      if (tx) {
        await this.matchEntry(entry.id, tenantId, tx.id);
        matched++;
      }
    }
    return matched;
  }

  async finalize(id: string, tenantId: string): Promise<BankReconciliation | null> {
    // Check all entries are matched/reconciled/ignored
    const pending = await this.db.select().from(bankStatementEntries)
      .where(and(
        eq(bankStatementEntries.reconciliationId, id),
        eq(bankStatementEntries.tenantId, tenantId),
        eq(bankStatementEntries.status, 'pending'),
      ));
    if (pending.length > 0) return null; // Cannot finalize with pending entries

    const [row] = await this.db.update(bankReconciliations)
      .set({ status: 'completed' as any, completedAt: new Date() })
      .where(and(eq(bankReconciliations.id, id), eq(bankReconciliations.tenantId, tenantId)))
      .returning();
    return (row as any) || null;
  }
}
