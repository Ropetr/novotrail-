import { eq, and, sql, gte, lte, or, ne } from 'drizzle-orm';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { financialTitles, financialTransactions, chartOfAccounts } from '../schema';
import type { IReportRepository } from '../../domain/repositories';
import type { DREReport, DRELine, AgingReport, AgingBucket, CashFlowRealized } from '../../domain/entities';

export class ReportRepository implements IReportRepository {
  constructor(private db: DatabaseConnection) {}

  async getDRE(tenantId: string, startDate: string, endDate: string, costCenterId?: string): Promise<DREReport> {
    // Get settled titles in the period grouped by chart of account type
    const conditions: any[] = [
      eq(financialTitles.tenantId, tenantId),
      eq(financialTitles.status, 'paid'),
      sql`EXISTS (SELECT 1 FROM financial_settlements fs WHERE fs.title_id = ${financialTitles.id} AND fs.settlement_date BETWEEN ${startDate} AND ${endDate})`,
    ];
    if (costCenterId) conditions.push(eq(financialTitles.costCenterId, costCenterId));

    // Revenue: receivable titles paid in period
    const revenueRows = await this.db.execute(sql`
      SELECT COALESCE(ca.code, 'SEM-CONTA') as account_code,
             COALESCE(ca.name, 'Sem classificação') as account_name,
             COALESCE(ca.type, 'revenue') as account_type,
             SUM(CAST(ft.value AS NUMERIC)) as total
      FROM financial_titles ft
      LEFT JOIN chart_of_accounts ca ON ft.account_id = ca.id
      WHERE ft.tenant_id = ${tenantId}
        AND ft.type = 'receivable'
        AND ft.status = 'paid'
        AND EXISTS (SELECT 1 FROM financial_settlements fs WHERE fs.title_id = ft.id AND fs.settlement_date BETWEEN ${startDate} AND ${endDate})
        ${costCenterId ? sql`AND ft.cost_center_id = ${costCenterId}` : sql``}
      GROUP BY ca.code, ca.name, ca.type
      ORDER BY ca.code
    `);

    // Expenses: payable titles paid in period
    const expenseRows = await this.db.execute(sql`
      SELECT COALESCE(ca.code, 'SEM-CONTA') as account_code,
             COALESCE(ca.name, 'Sem classificação') as account_name,
             COALESCE(ca.type, 'expense') as account_type,
             SUM(CAST(ft.value AS NUMERIC)) as total
      FROM financial_titles ft
      LEFT JOIN chart_of_accounts ca ON ft.account_id = ca.id
      WHERE ft.tenant_id = ${tenantId}
        AND ft.type = 'payable'
        AND ft.status = 'paid'
        AND EXISTS (SELECT 1 FROM financial_settlements fs WHERE fs.title_id = ft.id AND fs.settlement_date BETWEEN ${startDate} AND ${endDate})
        ${costCenterId ? sql`AND ft.cost_center_id = ${costCenterId}` : sql``}
      GROUP BY ca.code, ca.name, ca.type
      ORDER BY ca.code
    `);

    const revenue: DRELine[] = (revenueRows.rows || []).map((r: any) => ({
      accountCode: r.account_code,
      accountName: r.account_name,
      accountType: r.account_type,
      total: Number(r.total),
    }));

    const expenses: DRELine[] = (expenseRows.rows || []).map((r: any) => ({
      accountCode: r.account_code,
      accountName: r.account_name,
      accountType: r.account_type,
      total: Number(r.total),
    }));

    const totalRevenue = revenue.reduce((sum, r) => sum + r.total, 0);
    const totalExpenses = expenses.reduce((sum, r) => sum + r.total, 0);

    return {
      period: { startDate, endDate },
      revenue,
      totalRevenue,
      expenses,
      totalExpenses,
      operationalResult: totalRevenue - totalExpenses,
      costCenterId,
    };
  }

  async getAging(tenantId: string, type: 'payable' | 'receivable', referenceDate?: string): Promise<AgingReport> {
    const refDate = referenceDate || new Date().toISOString().split('T')[0];

    // Get overdue + open titles
    const rows = await this.db.execute(sql`
      SELECT id, person_id, description, due_date, open_value,
             (${refDate}::DATE - due_date::DATE) as days_overdue
      FROM financial_titles
      WHERE tenant_id = ${tenantId}
        AND type = ${type}
        AND status IN ('open', 'partial', 'overdue')
      ORDER BY due_date ASC
    `);

    const titles = (rows.rows || []) as any[];

    // Define buckets
    const bucketDefs = [
      { label: 'A vencer', minDays: -99999, maxDays: 0 },
      { label: '1-30 dias', minDays: 1, maxDays: 30 },
      { label: '31-60 dias', minDays: 31, maxDays: 60 },
      { label: '61-90 dias', minDays: 61, maxDays: 90 },
      { label: '90+ dias', minDays: 91, maxDays: null },
    ];

    let totalOverdue = 0;
    const buckets: AgingBucket[] = bucketDefs.map(def => {
      const filtered = titles.filter(t => {
        const days = Number(t.days_overdue);
        if (def.maxDays === null) return days >= def.minDays;
        return days >= def.minDays && days <= def.maxDays;
      });
      const total = filtered.reduce((sum: number, t: any) => sum + Number(t.open_value), 0);
      if (def.minDays > 0) totalOverdue += total;
      return {
        label: def.label,
        minDays: def.minDays,
        maxDays: def.maxDays,
        count: filtered.length,
        total,
        percentage: 0, // calculated below
        titles: filtered.map((t: any) => ({
          id: t.id,
          personId: t.person_id,
          description: t.description,
          dueDate: t.due_date,
          openValue: t.open_value,
          daysOverdue: Number(t.days_overdue),
        })),
      };
    });

    const grandTotal = buckets.reduce((sum, b) => sum + b.total, 0);
    buckets.forEach(b => {
      b.percentage = grandTotal > 0 ? Math.round((b.total / grandTotal) * 10000) / 100 : 0;
    });

    return {
      type,
      referenceDate: refDate,
      totalOverdue,
      totalCount: titles.length,
      buckets,
    };
  }

  async getCashFlowRealized(tenantId: string, startDate: string, endDate: string, bankAccountId?: string): Promise<CashFlowRealized[]> {
    // Forecast: titles with due_date in the period
    const forecastRows = await this.db.execute(sql`
      SELECT due_date, type,
             SUM(CAST(open_value AS NUMERIC)) as total
      FROM financial_titles
      WHERE tenant_id = ${tenantId}
        AND status IN ('open', 'partial', 'overdue')
        AND due_date BETWEEN ${startDate} AND ${endDate}
      GROUP BY due_date, type
      ORDER BY due_date
    `);

    // Realized: actual transactions in the period
    const realizedConditions = bankAccountId
      ? sql`AND bank_account_id = ${bankAccountId}`
      : sql``;

    const realizedRows = await this.db.execute(sql`
      SELECT CAST(occurred_at AS DATE) as tx_date, type,
             SUM(CAST(value AS NUMERIC)) as total
      FROM financial_transactions
      WHERE tenant_id = ${tenantId}
        AND occurred_at BETWEEN ${startDate}::TIMESTAMP AND (${endDate}::TIMESTAMP + INTERVAL '1 day')
        ${realizedConditions}
      GROUP BY CAST(occurred_at AS DATE), type
      ORDER BY tx_date
    `);

    // Build date map
    const dateMap = new Map<string, CashFlowRealized>();
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      dateMap.set(key, {
        date: key,
        forecastReceivable: 0,
        forecastPayable: 0,
        realizedInflow: 0,
        realizedOutflow: 0,
        cumulativeBalance: 0,
      });
    }

    // Fill forecast
    for (const row of (forecastRows.rows || []) as any[]) {
      const item = dateMap.get(row.due_date);
      if (item) {
        if (row.type === 'receivable') item.forecastReceivable += Number(row.total);
        else item.forecastPayable += Number(row.total);
      }
    }

    // Fill realized
    for (const row of (realizedRows.rows || []) as any[]) {
      const key = typeof row.tx_date === 'string' ? row.tx_date : new Date(row.tx_date).toISOString().split('T')[0];
      const item = dateMap.get(key);
      if (item) {
        const val = Number(row.total);
        if (['inflow', 'transfer_in'].includes(row.type)) item.realizedInflow += val;
        else if (['outflow', 'transfer_out'].includes(row.type)) item.realizedOutflow += val;
      }
    }

    // Calculate cumulative balance
    const result = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    let cumulative = 0;
    for (const item of result) {
      cumulative += item.realizedInflow - item.realizedOutflow;
      item.cumulativeBalance = Math.round(cumulative * 100) / 100;
    }

    return result;
  }
}
