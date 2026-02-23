import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IReturnRepository } from '../../../domain/repositories';
import {
  createReturnSchema,
  updateReturnSchema,
  paginationSchema,
  idParamSchema,
} from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class ReturnController {
  constructor(private returnRepository: IReturnRepository) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = paginationSchema.parse(c.req.query());

      const result = await this.returnRepository.list(user.tenantId, query);

      return ok(c, result.data, 200, {
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list returns', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const returnRecord = await this.returnRepository.getById(id, user.tenantId);

      if (!returnRecord) {
        return fail(c, 'Return not found', 404);
      }

      return ok(c, returnRecord);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get return', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createReturnSchema.parse(body);

      const returnRecord = await this.returnRepository.create(user.tenantId, data);

      return ok(c, returnRecord, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create return', 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const data = updateReturnSchema.parse(body);

      const existing = await this.returnRepository.getById(id, user.tenantId);
      if (!existing) {
        return fail(c, 'Return not found', 404);
      }

      if (existing.status === 'completed' || existing.status === 'rejected') {
        return fail(c, 'Cannot update a completed or rejected return', 422);
      }

      const returnRecord = await this.returnRepository.update(id, user.tenantId, data);

      return ok(c, returnRecord);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update return', 400);
    }
  }

  async approve(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const existing = await this.returnRepository.getById(id, user.tenantId);
      if (!existing) {
        return fail(c, 'Return not found', 404);
      }

      if (existing.status !== 'pending') {
        return fail(c, 'Only pending returns can be approved', 422);
      }

      const returnRecord = await this.returnRepository.approve(id, user.tenantId);

      return ok(c, returnRecord);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to approve return', 400);
    }
  }
}
