import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IBatchRepository } from '../../../domain/repositories';
import { createBatchSchema, batchListSchema, idParamSchema } from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class BatchController {
  constructor(private batchRepo: IBatchRepository) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = batchListSchema.parse(c.req.query());
      const result = await this.batchRepo.list(user.tenantId, query);
      return ok(c, result.data, 200, {
        pagination: { page: query.page, limit: query.limit, total: result.total, totalPages: Math.ceil(result.total / query.limit) },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list batches', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const batch = await this.batchRepo.getById(id, user.tenantId);
      if (!batch) return fail(c, 'Batch not found', 404);
      return ok(c, batch);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get batch', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createBatchSchema.parse(body);
      const batch = await this.batchRepo.create(user.tenantId, data);
      return ok(c, batch, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create batch', 400);
    }
  }
}
