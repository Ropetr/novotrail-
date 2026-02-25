import type { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import { ok, fail } from '../../../../../shared/http/response';
import type { IFinancialTitleRepository, IFinancialLogRepository } from '../../../domain/repositories';

export class DashboardController {
  constructor(
    private titleRepo: IFinancialTitleRepository,
    private logRepo: IFinancialLogRepository,
  ) {}

  async getDashboard(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const dashboard = await this.titleRepo.getDashboard(user.tenantId);
      return ok(c, dashboard);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get dashboard', 400);
    }
  }

  async getCashFlow(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const days = Number(c.req.query('days') || 30);
      const cashFlow = await this.titleRepo.getCashFlow(user.tenantId, days);
      return ok(c, cashFlow);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get cash flow', 400);
    }
  }

  async getDueSoon(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const days = Number(c.req.query('days') || 7);
      const dueSoon = await this.titleRepo.getDueSoon(user.tenantId, days);
      return ok(c, dueSoon);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get due soon', 400);
    }
  }

  async getLogs(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = c.req.query();
      const { data, total } = await this.logRepo.list(user.tenantId, {
        entity: query.entity,
        entityId: query.entityId,
        action: query.action,
        userId: query.userId,
        startDate: query.startDate,
        endDate: query.endDate,
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 20,
      });
      const page = query.page ? Number(query.page) : 1;
      const limit = query.limit ? Number(query.limit) : 20;
      return ok(c, data, 200, {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get logs', 400);
    }
  }
}
