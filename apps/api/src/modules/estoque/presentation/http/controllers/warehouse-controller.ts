import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IWarehouseRepository } from '../../../domain/repositories';
import { createWarehouseSchema, updateWarehouseSchema, paginationSchema, idParamSchema } from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class WarehouseController {
  constructor(private warehouseRepository: IWarehouseRepository) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = paginationSchema.parse(c.req.query());
      const result = await this.warehouseRepository.list(user.tenantId, query);
      return ok(c, result.data, 200, {
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list warehouses', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const warehouse = await this.warehouseRepository.getById(id, user.tenantId);
      if (!warehouse) return fail(c, 'Warehouse not found', 404);
      return ok(c, warehouse);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get warehouse', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createWarehouseSchema.parse(body);
      const warehouse = await this.warehouseRepository.create(user.tenantId, data);
      return ok(c, warehouse, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create warehouse', 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const data = updateWarehouseSchema.parse(body);
      const existing = await this.warehouseRepository.getById(id, user.tenantId);
      if (!existing) return fail(c, 'Warehouse not found', 404);
      const warehouse = await this.warehouseRepository.update(id, user.tenantId, data);
      return ok(c, warehouse);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update warehouse', 400);
    }
  }

  async remove(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const existing = await this.warehouseRepository.getById(id, user.tenantId);
      if (!existing) return fail(c, 'Warehouse not found', 404);
      await this.warehouseRepository.remove(id, user.tenantId);
      return ok(c, { message: 'Warehouse deactivated' });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to remove warehouse', 400);
    }
  }
}
