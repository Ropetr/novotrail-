import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IProductRepository } from '../../../domain/repositories';
import {
  createProductSchema,
  updateProductSchema,
  paginationSchema,
  idParamSchema,
} from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class ProductController {
  constructor(private productRepository: IProductRepository) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = paginationSchema.parse(c.req.query());

      const result = await this.productRepository.list(user.tenantId, query);

      return ok(c, result.data, 200, {
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list products', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const product = await this.productRepository.getById(id, user.tenantId);

      if (!product) {
        return fail(c, 'Product not found', 404);
      }

      return ok(c, product);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get product', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createProductSchema.parse(body);

      const product = await this.productRepository.create(user.tenantId, data);

      return ok(c, product, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create product', 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const data = updateProductSchema.parse(body);

      const existing = await this.productRepository.getById(id, user.tenantId);
      if (!existing) {
        return fail(c, 'Product not found', 404);
      }

      const product = await this.productRepository.update(id, user.tenantId, data);

      return ok(c, product);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update product', 400);
    }
  }

  async remove(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const existing = await this.productRepository.getById(id, user.tenantId);
      if (!existing) {
        return fail(c, 'Product not found', 404);
      }

      await this.productRepository.softDelete(id, user.tenantId);

      return ok(c, { message: 'Product deactivated successfully' });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to delete product', 400);
    }
  }
}
