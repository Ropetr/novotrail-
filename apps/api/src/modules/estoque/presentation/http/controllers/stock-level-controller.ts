import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IStockLevelRepository } from '../../../domain/repositories';
import { stockLevelListSchema, productIdParamSchema } from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class StockLevelController {
  constructor(private stockLevelRepository: IStockLevelRepository) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = stockLevelListSchema.parse(c.req.query());
      const result = await this.stockLevelRepository.list(user.tenantId, query);
      return ok(c, result.data, 200, {
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list stock levels', 400);
    }
  }

  async getByProduct(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { productId } = productIdParamSchema.parse(c.req.param());
      const levels = await this.stockLevelRepository.getByProduct(productId, user.tenantId);
      return ok(c, levels);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get stock by product', 400);
    }
  }

  async dashboard(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const dashboard = await this.stockLevelRepository.getDashboard(user.tenantId);
      return ok(c, dashboard);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get stock dashboard', 400);
    }
  }
}
