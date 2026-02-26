import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IReportRepository } from '../../../domain/repositories';
import { ok, fail } from '../../../../../shared/http/response';

export class ReportController {
  constructor(private reportRepo: IReportRepository) {}

  async getDRE(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const startDate = c.req.query('startDate');
      const endDate = c.req.query('endDate');
      if (!startDate || !endDate) return fail(c, 'startDate and endDate are required (YYYY-MM-DD)', 400);
      const costCenterId = c.req.query('costCenterId') || undefined;
      const dre = await this.reportRepo.getDRE(user.tenantId, startDate, endDate, costCenterId);
      return ok(c, dre);
    } catch (error: any) {
      return fail(c, error.message, 500);
    }
  }

  async getAging(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const type = c.req.query('type') as 'payable' | 'receivable';
      if (!type || !['payable', 'receivable'].includes(type)) {
        return fail(c, 'type is required (payable or receivable)', 400);
      }
      const referenceDate = c.req.query('referenceDate') || undefined;
      const aging = await this.reportRepo.getAging(user.tenantId, type, referenceDate);
      return ok(c, aging);
    } catch (error: any) {
      return fail(c, error.message, 500);
    }
  }

  async getCashFlowRealized(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const startDate = c.req.query('startDate');
      const endDate = c.req.query('endDate');
      if (!startDate || !endDate) return fail(c, 'startDate and endDate are required (YYYY-MM-DD)', 400);
      const bankAccountId = c.req.query('bankAccountId') || undefined;
      const data = await this.reportRepo.getCashFlowRealized(user.tenantId, startDate, endDate, bankAccountId);
      return ok(c, data);
    } catch (error: any) {
      return fail(c, error.message, 500);
    }
  }
}
