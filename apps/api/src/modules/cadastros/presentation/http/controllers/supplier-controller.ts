import { Context } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';
import type { ISupplierRepository } from '../../../domain/repositories';
import {
  createSupplierSchema,
  updateSupplierSchema,
  paginationSchema,
  idParamSchema,
} from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class SupplierController {
  constructor(private supplierRepository: ISupplierRepository) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = paginationSchema.parse(c.req.query());

      const result = await this.supplierRepository.list(user.tenantId, query);

      return ok(c, result.data, 200, {
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list suppliers', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const supplier = await this.supplierRepository.getById(id, user.tenantId);

      if (!supplier) {
        return fail(c, 'Supplier not found', 404);
      }

      return ok(c, supplier);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get supplier', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createSupplierSchema.parse(body);

      const supplier = await this.supplierRepository.create(user.tenantId, data);

      return ok(c, supplier, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create supplier', 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const data = updateSupplierSchema.parse(body);

      const existing = await this.supplierRepository.getById(id, user.tenantId);
      if (!existing) {
        return fail(c, 'Supplier not found', 404);
      }

      const supplier = await this.supplierRepository.update(id, user.tenantId, data);

      return ok(c, supplier);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update supplier', 400);
    }
  }

  async remove(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const existing = await this.supplierRepository.getById(id, user.tenantId);
      if (!existing) {
        return fail(c, 'Supplier not found', 404);
      }

      await this.supplierRepository.softDelete(id, user.tenantId);

      return ok(c, { message: 'Supplier deactivated successfully' });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to delete supplier', 400);
    }
  }
}
