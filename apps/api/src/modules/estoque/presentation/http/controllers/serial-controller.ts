import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { ISerialRepository } from '../../../domain/repositories';
import { createSerialSchema, serialListSchema } from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class SerialController {
  constructor(private serialRepo: ISerialRepository) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = serialListSchema.parse(c.req.query());
      const result = await this.serialRepo.list(user.tenantId, query);
      return ok(c, result.data, 200, {
        pagination: { page: query.page, limit: query.limit, total: result.total, totalPages: Math.ceil(result.total / query.limit) },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list serials', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createSerialSchema.parse(body);
      const serial = await this.serialRepo.create(user.tenantId, data);
      return ok(c, serial, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create serial', 400);
    }
  }
}
