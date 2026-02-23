import { Context } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';
import type { IPartnerRepository } from '../../../domain/repositories';
import {
  createPartnerSchema,
  updatePartnerSchema,
  paginationSchema,
  idParamSchema,
} from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class PartnerController {
  constructor(private partnerRepository: IPartnerRepository) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = paginationSchema.parse(c.req.query());

      const result = await this.partnerRepository.list(user.tenantId, query);

      return ok(c, result.data, 200, {
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list partners', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const partner = await this.partnerRepository.getById(id, user.tenantId);

      if (!partner) {
        return fail(c, 'Partner not found', 404);
      }

      return ok(c, partner);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get partner', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createPartnerSchema.parse(body);

      const partner = await this.partnerRepository.create(user.tenantId, data);

      return ok(c, partner, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create partner', 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const data = updatePartnerSchema.parse(body);

      const existing = await this.partnerRepository.getById(id, user.tenantId);
      if (!existing) {
        return fail(c, 'Partner not found', 404);
      }

      const partner = await this.partnerRepository.update(id, user.tenantId, data);

      return ok(c, partner);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update partner', 400);
    }
  }

  async remove(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const existing = await this.partnerRepository.getById(id, user.tenantId);
      if (!existing) {
        return fail(c, 'Partner not found', 404);
      }

      await this.partnerRepository.softDelete(id, user.tenantId);

      return ok(c, { message: 'Partner deactivated successfully' });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to delete partner', 400);
    }
  }
}
