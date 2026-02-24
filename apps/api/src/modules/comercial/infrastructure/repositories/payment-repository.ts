import { eq, and } from 'drizzle-orm';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { salePayments } from '../schema';

export interface SalePaymentRecord {
  id: string;
  tenantId: string;
  saleId?: string | null;
  quoteId?: string | null;
  paymentMethod: string;
  installmentNumber: number;
  totalInstallments: number;
  documentNumber?: string | null;
  dueDate?: Date | null;
  amount: number;
  status: string;
  paidAt?: Date | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class PaymentRepository {
  constructor(private db: DatabaseConnection) {}

  async listBySale(saleId: string, tenantId: string): Promise<SalePaymentRecord[]> {
    const result = await this.db
      .select()
      .from(salePayments)
      .where(and(eq(salePayments.saleId, saleId), eq(salePayments.tenantId, tenantId)));
    return result as unknown as SalePaymentRecord[];
  }

  async listByQuote(quoteId: string, tenantId: string): Promise<SalePaymentRecord[]> {
    const result = await this.db
      .select()
      .from(salePayments)
      .where(and(eq(salePayments.quoteId, quoteId), eq(salePayments.tenantId, tenantId)));
    return result as unknown as SalePaymentRecord[];
  }

  async createMany(
    tenantId: string,
    payments: Array<{
      saleId?: string;
      quoteId?: string;
      paymentMethod: string;
      installmentNumber?: number;
      totalInstallments?: number;
      documentNumber?: string;
      dueDate?: string;
      amount: number;
      notes?: string;
    }>
  ): Promise<SalePaymentRecord[]> {
    if (payments.length === 0) return [];

    const records = payments.map((p) => ({
      id: crypto.randomUUID(),
      tenantId,
      saleId: p.saleId ?? null,
      quoteId: p.quoteId ?? null,
      paymentMethod: p.paymentMethod,
      installmentNumber: p.installmentNumber ?? 1,
      totalInstallments: p.totalInstallments ?? 1,
      documentNumber: p.documentNumber ?? null,
      dueDate: p.dueDate ? new Date(p.dueDate) : null,
      amount: p.amount,
      status: 'pending' as const,
      paidAt: null,
      notes: p.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await this.db.insert(salePayments).values(records as any);
    return records as unknown as SalePaymentRecord[];
  }

  async deleteBySale(saleId: string, tenantId: string): Promise<void> {
    await this.db
      .delete(salePayments)
      .where(and(eq(salePayments.saleId, saleId), eq(salePayments.tenantId, tenantId)));
  }

  async deleteByQuote(quoteId: string, tenantId: string): Promise<void> {
    await this.db
      .delete(salePayments)
      .where(and(eq(salePayments.quoteId, quoteId), eq(salePayments.tenantId, tenantId)));
  }
}
