import { Context } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';
import type { ICategoryRepository } from '../../../domain/repositories';
import {
  createCategorySchema,
  updateCategorySchema,
  paginationSchema,
  idParamSchema,
} from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class CategoryController {
  constructor(private categoryRepository: ICategoryRepository) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = paginationSchema.parse(c.req.query());

      const result = await this.categoryRepository.list(user.tenantId, query);

      return ok(c, result.data, 200, {
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list categories', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const category = await this.categoryRepository.getById(id, user.tenantId);

      if (!category) {
        return fail(c, 'Category not found', 404);
      }

      return ok(c, category);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get category', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createCategorySchema.parse(body);

      const category = await this.categoryRepository.create(user.tenantId, data);

      return ok(c, category, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create category', 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const data = updateCategorySchema.parse(body);

      const existing = await this.categoryRepository.getById(id, user.tenantId);
      if (!existing) {
        return fail(c, 'Category not found', 404);
      }

      const category = await this.categoryRepository.update(id, user.tenantId, data);

      return ok(c, category);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update category', 400);
    }
  }

  async remove(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const existing = await this.categoryRepository.getById(id, user.tenantId);
      if (!existing) {
        return fail(c, 'Category not found', 404);
      }

      await this.categoryRepository.softDelete(id, user.tenantId);

      return ok(c, { message: 'Category deactivated successfully' });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to delete category', 400);
    }
  }
}
