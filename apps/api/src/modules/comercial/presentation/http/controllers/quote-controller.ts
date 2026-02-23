import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IQuoteRepository } from '../../../domain/repositories';
import {
  createQuoteSchema,
  updateQuoteSchema,
  paginationSchema,
  idParamSchema,
} from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class QuoteController {
  constructor(private quoteRepository: IQuoteRepository) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = paginationSchema.parse(c.req.query());

      const result = await this.quoteRepository.list(user.tenantId, query);

      return ok(c, result.data, 200, {
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list quotes', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const quote = await this.quoteRepository.getById(id, user.tenantId);

      if (!quote) {
        return fail(c, 'Quote not found', 404);
      }

      return ok(c, quote);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get quote', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createQuoteSchema.parse(body);

      const quote = await this.quoteRepository.create(user.tenantId, data);

      return ok(c, quote, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create quote', 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const data = updateQuoteSchema.parse(body);

      const existing = await this.quoteRepository.getById(id, user.tenantId);
      if (!existing) {
        return fail(c, 'Quote not found', 404);
      }

      const quote = await this.quoteRepository.update(id, user.tenantId, data);

      return ok(c, quote);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update quote', 400);
    }
  }

  async remove(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const existing = await this.quoteRepository.getById(id, user.tenantId);
      if (!existing) {
        return fail(c, 'Quote not found', 404);
      }

      await this.quoteRepository.softDelete(id, user.tenantId);

      return ok(c, { message: 'Quote cancelled successfully' });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to cancel quote', 400);
    }
  }

  async approve(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const existing = await this.quoteRepository.getById(id, user.tenantId);
      if (!existing) {
        return fail(c, 'Quote not found', 404);
      }

      if (existing.status !== 'draft' && existing.status !== 'sent') {
        return fail(c, 'Only draft or sent quotes can be approved', 422);
      }

      const quote = await this.quoteRepository.approve(id, user.tenantId);

      return ok(c, quote);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to approve quote', 400);
    }
  }

  async convertToSale(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const existing = await this.quoteRepository.getById(id, user.tenantId);
      if (!existing) {
        return fail(c, 'Quote not found', 404);
      }

      const sale = await this.quoteRepository.convertToSale(id, user.tenantId);

      return ok(c, sale, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to convert quote to sale', 400);
    }
  }

  async merge(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();

      if (!body.quoteIds || body.quoteIds.length < 2) {
        return fail(c, 'At least 2 quotes are required to merge', 400);
      }
      if (!body.mainClientId) {
        return fail(c, 'mainClientId is required', 400);
      }

      const merged = await this.quoteRepository.merge(user.tenantId, body);

      return ok(c, merged, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to merge quotes', 400);
    }
  }

  async split(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();

      if (!body.itemIds || body.itemIds.length === 0) {
        return fail(c, 'At least 1 item must be selected to split', 400);
      }

      const results = await this.quoteRepository.split(id, user.tenantId, body);

      return ok(c, results, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to split quote', 400);
    }
  }
}
