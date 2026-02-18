import { Context } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';
import type { ISaleRepository } from '../../domain/repositories';
import {
  createSaleSchema,
  updateSaleSchema,
  paginationSchema,
  idParamSchema,
} from '../validators';

export class SaleController {
  constructor(private saleRepository: ISaleRepository) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = paginationSchema.parse(c.req.query());

      const result = await this.saleRepository.list(user.tenantId, query);

      return c.json({
        success: true,
        data: result.data,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error: any) {
      return c.json({ success: false, error: error.message || 'Failed to list sales' }, 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const sale = await this.saleRepository.getById(id, user.tenantId);

      if (!sale) {
        return c.json({ success: false, error: 'Sale not found' }, 404);
      }

      return c.json({ success: true, data: sale });
    } catch (error: any) {
      return c.json({ success: false, error: error.message || 'Failed to get sale' }, 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createSaleSchema.parse(body);

      const sale = await this.saleRepository.create(user.tenantId, data);

      return c.json({ success: true, data: sale }, 201);
    } catch (error: any) {
      return c.json({ success: false, error: error.message || 'Failed to create sale' }, 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const data = updateSaleSchema.parse(body);

      const existing = await this.saleRepository.getById(id, user.tenantId);
      if (!existing) {
        return c.json({ success: false, error: 'Sale not found' }, 404);
      }

      if (existing.status === 'cancelled') {
        return c.json({ success: false, error: 'Cannot update a cancelled sale' }, 422);
      }

      const sale = await this.saleRepository.update(id, user.tenantId, data);

      return c.json({ success: true, data: sale });
    } catch (error: any) {
      return c.json({ success: false, error: error.message || 'Failed to update sale' }, 400);
    }
  }

  async cancel(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const existing = await this.saleRepository.getById(id, user.tenantId);
      if (!existing) {
        return c.json({ success: false, error: 'Sale not found' }, 404);
      }

      if (existing.status === 'cancelled') {
        return c.json({ success: false, error: 'Sale is already cancelled' }, 422);
      }

      if (existing.status === 'invoiced') {
        return c.json(
          { success: false, error: 'Cannot cancel an invoiced sale' },
          422
        );
      }

      const sale = await this.saleRepository.cancel(id, user.tenantId);

      return c.json({ success: true, data: sale });
    } catch (error: any) {
      return c.json({ success: false, error: error.message || 'Failed to cancel sale' }, 400);
    }
  }
}
