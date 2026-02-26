import { eq, and, sql, gte, lte, desc } from 'drizzle-orm';
import type { IFinancialTitleRepository } from '../../domain/repositories';
import type {
  FinancialTitle, CreateTitleDTO, UpdateTitleDTO, SettleTitleDTO,
  FinancialSettlement, FinancialDashboard, CashFlowItem, DueSoonTitle,
} from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { financialTitles, financialSettlements, financialTransactions } from '../schema';

export class FinancialTitleRepository implements IFinancialTitleRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, filters?: {
    type?: string; status?: string; personId?: string;
    dueDateFrom?: string; dueDateTo?: string;
    page?: number; limit?: number;
  }): Promise<{ data: FinancialTitle[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(financialTitles.tenantId, tenantId)];
    if (filters?.type) conditions.push(eq(financialTitles.type, filters.type));
    if (filters?.status) conditions.push(eq(financialTitles.status, filters.status));
    if (filters?.personId) conditions.push(eq(financialTitles.personId, filters.personId));
    if (filters?.dueDateFrom) conditions.push(gte(financialTitles.dueDate, filters.dueDateFrom));
    if (filters?.dueDateTo) conditions.push(lte(financialTitles.dueDate, filters.dueDateTo));

    const whereClause = and(...conditions);

    const [data, countResult] = await Promise.all([
      this.db.select().from(financialTitles)
        .where(whereClause)
        .orderBy(financialTitles.dueDate)
        .limit(limit).offset(offset),
      this.db.select({ count: sql<string>`count(*)` }).from(financialTitles)
        .where(whereClause),
    ]);

    // Marcar vencidos virtualmente
    const today = new Date().toISOString().split('T')[0];
    const titles = (data as unknown as FinancialTitle[]).map(t => {
      if ((t.status === 'open' || t.status === 'partial') && t.dueDate < today) {
        return { ...t, status: 'overdue' as const };
      }
      return t;
    });

    return { data: titles, total: Number(countResult[0]?.count || 0) };
  }

  async getById(id: string, tenantId: string): Promise<FinancialTitle | null> {
    const result = await this.db.select().from(financialTitles)
      .where(and(eq(financialTitles.id, id), eq(financialTitles.tenantId, tenantId)))
      .limit(1);
    if (!result[0]) return null;

    const title = result[0] as unknown as FinancialTitle;

    // Buscar baixas
    const settlements = await this.db.select().from(financialSettlements)
      .where(eq(financialSettlements.titleId, id))
      .orderBy(financialSettlements.settlementDate);

    title.settlements = settlements as unknown as FinancialSettlement[];

    // Marcar vencido virtualmente
    const today = new Date().toISOString().split('T')[0];
    if ((title.status === 'open' || title.status === 'partial') && title.dueDate < today) {
      title.status = 'overdue';
    }

    return title;
  }

  async create(tenantId: string, data: CreateTitleDTO): Promise<FinancialTitle> {
    const result = await this.db.insert(financialTitles).values({
      tenantId,
      type: data.type,
      origin: data.origin || 'manual',
      originId: data.originId || null,
      documentNumber: data.documentNumber || null,
      description: data.description || null,
      personId: data.personId,
      dueDate: data.dueDate,
      issueDate: data.issueDate,
      value: String(data.value),
      openValue: String(data.value), // Inicia com valor total em aberto
      costCenterId: data.costCenterId || null,
      accountId: data.accountId || null,
      bankAccountId: data.bankAccountId || null,
    }).returning();
    return result[0] as unknown as FinancialTitle;
  }

  async update(id: string, tenantId: string, data: UpdateTitleDTO): Promise<FinancialTitle | null> {
    // Só permite editar títulos open ou partial
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    if (existing.status !== 'open' && existing.status !== 'partial' && existing.status !== 'overdue') {
      throw new Error(`Cannot update title with status "${existing.status}"`);
    }

    const updates: Record<string, any> = { updatedAt: new Date() };
    if (data.documentNumber !== undefined) updates.documentNumber = data.documentNumber;
    if (data.description !== undefined) updates.description = data.description;
    if (data.dueDate !== undefined) updates.dueDate = data.dueDate;
    if (data.costCenterId !== undefined) updates.costCenterId = data.costCenterId;
    if (data.accountId !== undefined) updates.accountId = data.accountId;
    if (data.bankAccountId !== undefined) updates.bankAccountId = data.bankAccountId;
    if ((data as any).attachmentUrl !== undefined) updates.attachmentUrl = (data as any).attachmentUrl;

    const result = await this.db.update(financialTitles).set(updates)
      .where(and(eq(financialTitles.id, id), eq(financialTitles.tenantId, tenantId)))
      .returning();
    return (result[0] as unknown as FinancialTitle) || null;
  }

  async cancel(id: string, tenantId: string): Promise<boolean> {
    const existing = await this.getById(id, tenantId);
    if (!existing) return false;
    if (existing.status === 'paid' || existing.status === 'cancelled') {
      throw new Error(`Cannot cancel title with status "${existing.status}"`);
    }

    const result = await this.db.update(financialTitles)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(and(eq(financialTitles.id, id), eq(financialTitles.tenantId, tenantId)))
      .returning();
    return result.length > 0;
  }

  async settle(id: string, tenantId: string, data: SettleTitleDTO): Promise<{
    title: FinancialTitle;
    settlement: FinancialSettlement;
  }> {
    const existing = await this.getById(id, tenantId);
    if (!existing) throw new Error('Title not found');
    if (existing.status === 'paid' || existing.status === 'cancelled') {
      throw new Error(`Cannot settle title with status "${existing.status}"`);
    }

    const currentOpenValue = Number(existing.openValue);
    const discount = data.discount || 0;
    const interest = data.interest || 0;
    const fine = data.fine || 0;

    // Validar: não pode pagar mais que o saldo aberto
    if (data.value > currentOpenValue) {
      throw new Error(`Settlement value (${data.value}) exceeds open value (${currentOpenValue})`);
    }

    const newOpenValue = currentOpenValue - data.value;
    const newStatus = newOpenValue === 0 ? 'paid' : 'partial';

    // 1. Criar registro de baixa
    const settlementResult = await this.db.insert(financialSettlements).values({
      titleId: id,
      settlementDate: data.settlementDate,
      value: String(data.value),
      discount: String(discount),
      interest: String(interest),
      fine: String(fine),
      bankAccountId: data.bankAccountId,
    }).returning();

    // 2. Atualizar título
    const effectiveTotal = Number(existing.discount || 0) + discount;
    const interestTotal = Number(existing.interest || 0) + interest;
    const fineTotal = Number(existing.fine || 0) + fine;

    const titleResult = await this.db.update(financialTitles).set({
      openValue: String(newOpenValue),
      status: newStatus,
      discount: String(effectiveTotal),
      interest: String(interestTotal),
      fine: String(fineTotal),
      paidAt: newStatus === 'paid' ? new Date() : undefined,
      updatedAt: new Date(),
    } as any).where(and(eq(financialTitles.id, id), eq(financialTitles.tenantId, tenantId)))
      .returning();

    // 3. Gerar movimentação financeira na conta bancária
    const transactionType = existing.type === 'receivable' ? 'inflow' : 'outflow';
    const effectiveValue = data.value - discount + interest + fine;

    await this.db.insert(financialTransactions).values({
      tenantId,
      bankAccountId: data.bankAccountId,
      type: transactionType,
      value: String(effectiveValue),
      description: `Baixa título ${existing.documentNumber || id.slice(0, 8)}`,
      referenceId: id,
      referenceType: 'settlement',
    });

    return {
      title: titleResult[0] as unknown as FinancialTitle,
      settlement: settlementResult[0] as unknown as FinancialSettlement,
    };
  }

  async getDashboard(tenantId: string): Promise<FinancialDashboard> {
    const today = new Date().toISOString().split('T')[0];

    const [receivable, payable, overdueRec, overduePay] = await Promise.all([
      this.db.select({
        total: sql<string>`COALESCE(SUM(${financialTitles.openValue}), 0)`,
        count: sql<string>`COUNT(*)`,
      }).from(financialTitles).where(and(
        eq(financialTitles.tenantId, tenantId),
        eq(financialTitles.type, 'receivable'),
        sql`${financialTitles.status} IN ('open', 'partial')`,
      )),
      this.db.select({
        total: sql<string>`COALESCE(SUM(${financialTitles.openValue}), 0)`,
        count: sql<string>`COUNT(*)`,
      }).from(financialTitles).where(and(
        eq(financialTitles.tenantId, tenantId),
        eq(financialTitles.type, 'payable'),
        sql`${financialTitles.status} IN ('open', 'partial')`,
      )),
      this.db.select({
        total: sql<string>`COALESCE(SUM(${financialTitles.openValue}), 0)`,
        count: sql<string>`COUNT(*)`,
      }).from(financialTitles).where(and(
        eq(financialTitles.tenantId, tenantId),
        eq(financialTitles.type, 'receivable'),
        sql`${financialTitles.status} IN ('open', 'partial')`,
        sql`${financialTitles.dueDate} < ${today}`,
      )),
      this.db.select({
        total: sql<string>`COALESCE(SUM(${financialTitles.openValue}), 0)`,
        count: sql<string>`COUNT(*)`,
      }).from(financialTitles).where(and(
        eq(financialTitles.tenantId, tenantId),
        eq(financialTitles.type, 'payable'),
        sql`${financialTitles.status} IN ('open', 'partial')`,
        sql`${financialTitles.dueDate} < ${today}`,
      )),
    ]);

    // Saldo total das contas bancárias
    const bankResult = await this.db.select({
      total: sql<string>`COALESCE(SUM(${sql`CAST(initial_balance AS numeric)`}), 0)`,
    }).from(sql`bank_accounts`)
      .where(and(
        sql`tenant_id = ${tenantId}`,
        sql`is_active = true`,
      ));

    const transInflow = await this.db.select({
      total: sql<string>`COALESCE(SUM(${financialTransactions.value}), 0)`,
    }).from(financialTransactions).where(and(
      eq(financialTransactions.tenantId, tenantId),
      sql`${financialTransactions.type} IN ('inflow', 'transfer_in', 'adjustment')`,
    ));

    const transOutflow = await this.db.select({
      total: sql<string>`COALESCE(SUM(${financialTransactions.value}), 0)`,
    }).from(financialTransactions).where(and(
      eq(financialTransactions.tenantId, tenantId),
      sql`${financialTransactions.type} IN ('outflow', 'transfer_out')`,
    ));

    const bankBalance = Number(bankResult[0]?.total || 0)
      + Number(transInflow[0]?.total || 0)
      - Number(transOutflow[0]?.total || 0);

    return {
      totalBankBalance: bankBalance,
      totalReceivable: Number(receivable[0]?.total || 0),
      totalPayable: Number(payable[0]?.total || 0),
      overdueReceivable: Number(overdueRec[0]?.total || 0),
      overduePayable: Number(overduePay[0]?.total || 0),
      receivableCount: Number(receivable[0]?.count || 0),
      payableCount: Number(payable[0]?.count || 0),
      overdueCount: Number(overdueRec[0]?.count || 0) + Number(overduePay[0]?.count || 0),
    };
  }

  async getCashFlow(tenantId: string, days: number): Promise<CashFlowItem[]> {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + days);

    const todayStr = today.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // Títulos a receber por dia de vencimento
    const receivables = await this.db.select({
      date: financialTitles.dueDate,
      total: sql<string>`COALESCE(SUM(${financialTitles.openValue}), 0)`,
    }).from(financialTitles).where(and(
      eq(financialTitles.tenantId, tenantId),
      eq(financialTitles.type, 'receivable'),
      sql`${financialTitles.status} IN ('open', 'partial')`,
      gte(financialTitles.dueDate, todayStr),
      lte(financialTitles.dueDate, endStr),
    )).groupBy(financialTitles.dueDate);

    // Títulos a pagar por dia de vencimento
    const payables = await this.db.select({
      date: financialTitles.dueDate,
      total: sql<string>`COALESCE(SUM(${financialTitles.openValue}), 0)`,
    }).from(financialTitles).where(and(
      eq(financialTitles.tenantId, tenantId),
      eq(financialTitles.type, 'payable'),
      sql`${financialTitles.status} IN ('open', 'partial')`,
      gte(financialTitles.dueDate, todayStr),
      lte(financialTitles.dueDate, endStr),
    )).groupBy(financialTitles.dueDate);

    // Montar map de datas
    const flowMap = new Map<string, CashFlowItem>();
    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      flowMap.set(dateStr, { date: dateStr, inflows: 0, outflows: 0, balance: 0 });
    }

    for (const r of receivables) {
      const item = flowMap.get(r.date as string);
      if (item) item.inflows = Number(r.total);
    }

    for (const p of payables) {
      const item = flowMap.get(p.date as string);
      if (item) item.outflows = Number(p.total);
    }

    // Calcular saldo acumulado
    const items = Array.from(flowMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    let runningBalance = 0;
    for (const item of items) {
      runningBalance += item.inflows - item.outflows;
      item.balance = runningBalance;
    }

    return items;
  }

  async getDueSoon(tenantId: string, days: number): Promise<DueSoonTitle[]> {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    const todayStr = today.toISOString().split('T')[0];
    const futureStr = futureDate.toISOString().split('T')[0];

    const result = await this.db.select().from(financialTitles)
      .where(and(
        eq(financialTitles.tenantId, tenantId),
        sql`${financialTitles.status} IN ('open', 'partial')`,
        gte(financialTitles.dueDate, todayStr),
        lte(financialTitles.dueDate, futureStr),
      ))
      .orderBy(financialTitles.dueDate)
      .limit(50);

    return (result as unknown as FinancialTitle[]).map(t => ({
      id: t.id,
      type: t.type,
      personId: t.personId,
      documentNumber: t.documentNumber,
      description: t.description,
      dueDate: t.dueDate,
      openValue: t.openValue,
      daysUntilDue: Math.ceil((new Date(t.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    }));
  }
}
