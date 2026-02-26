import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IFinancialTitleRepository, IFinancialLogRepository } from '../../../domain/repositories';
import { fromSaleSchema, fromPurchaseSchema } from '../validators';
import { ok, fail } from '../../../../../shared/http/response';
import { sql } from 'drizzle-orm';

export class IntegrationController {
  constructor(
    private titleRepo: IFinancialTitleRepository,
    private logRepo: IFinancialLogRepository,
    private db: any, // DrizzleDatabase for raw queries
  ) {}

  async fromSale(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = fromSaleSchema.parse(body);

      // Fetch the sale and its payments
      const saleRows = await this.db.execute(sql`
        SELECT s.id, s.client_id, s.status, s.number
        FROM sales s
        WHERE s.id = ${data.saleId} AND s.tenant_id = ${user.tenantId}
      `);
      const sale = (saleRows.rows || [])[0];
      if (!sale) return fail(c, 'Sale not found', 404);

      const paymentRows = await this.db.execute(sql`
        SELECT sp.id, sp.amount, sp.due_date, sp.installment_number,
               sp.total_installments, sp.document_number, sp.payment_method
        FROM sale_payments sp
        WHERE sp.sale_id = ${data.saleId} AND sp.tenant_id = ${user.tenantId}
        ORDER BY sp.installment_number ASC
      `);
      const payments = (paymentRows.rows || []) as any[];
      if (payments.length === 0) return fail(c, 'No payments found for this sale', 400);

      const titles: any[] = [];
      for (const payment of payments) {
        const dueDate = payment.due_date
          ? (typeof payment.due_date === 'string' ? payment.due_date.split('T')[0] : new Date(payment.due_date).toISOString().split('T')[0])
          : new Date().toISOString().split('T')[0];

        const title = await this.titleRepo.create(user.tenantId, {
          type: 'receivable',
          origin: 'sale',
          originId: data.saleId,
          personId: sale.client_id,
          value: Number(payment.amount),
          dueDate,
          issueDate: new Date().toISOString().split('T')[0],
          documentNumber: payment.document_number || `${sale.number || 'V'}-${payment.installment_number}/${payment.total_installments}`,
          description: `Venda ${sale.number || data.saleId.substring(0, 8)} - Parcela ${payment.installment_number}/${payment.total_installments}`,
        });
        titles.push(title);
      }

      const totalValue = titles.reduce((sum: number, t: any) => sum + Number(t.value), 0);
      await this.logRepo.create(user.tenantId, user.id, 'integration', data.saleId, 'create', `from-sale: ${titles.length} titles, total R$${totalValue.toFixed(2)}`);

      return ok(c, {
        message: `Created ${titles.length} receivable titles from sale`,
        saleId: data.saleId,
        titlesCreated: titles.length,
        totalValue,
        titles,
      }, 201);
    } catch (error: any) {
      return fail(c, error.message, 400);
    }
  }

  async fromPurchase(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = fromPurchaseSchema.parse(body);

      const titles: any[] = [];
      for (const installment of data.installments) {
        const title = await this.titleRepo.create(user.tenantId, {
          type: 'payable',
          origin: data.origin || 'purchase',
          originId: data.purchaseId || undefined,
          personId: data.supplierId,
          value: installment.value,
          dueDate: installment.dueDate,
          issueDate: data.issueDate || new Date().toISOString().split('T')[0],
          documentNumber: data.documentNumber || undefined,
          description: data.description || `Compra - Parcela ${installment.number}/${data.installments.length}`,
        });
        titles.push(title);
      }

      const totalValue = titles.reduce((sum: number, t: any) => sum + Number(t.value), 0);
      await this.logRepo.create(user.tenantId, user.id, 'integration', data.purchaseId || titles[0]?.id || 'manual', 'create', `from-purchase: ${titles.length} titles, total R$${totalValue.toFixed(2)}`);

      return ok(c, {
        message: `Created ${titles.length} payable titles`,
        titlesCreated: titles.length,
        totalValue,
        titles,
      }, 201);
    } catch (error: any) {
      return fail(c, error.message, 400);
    }
  }
}
