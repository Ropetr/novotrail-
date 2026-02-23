import { Context } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';
import type { IClientRepository } from '../../../domain/repositories';
import {
  createClientSchema,
  updateClientSchema,
  paginationSchema,
  idParamSchema,
} from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class ClientController {
  constructor(private clientRepository: IClientRepository) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = paginationSchema.parse(c.req.query());

      const result = await this.clientRepository.list(user.tenantId, query);

      return ok(c, result.data, 200, {
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list clients', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const client = await this.clientRepository.getById(id, user.tenantId);

      if (!client) {
        return fail(c, 'Client not found', 404);
      }

      return ok(c, client);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get client', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createClientSchema.parse(body);

      const client = await this.clientRepository.create(user.tenantId, data);

      return ok(c, client, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create client', 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const data = updateClientSchema.parse(body);

      const existing = await this.clientRepository.getById(id, user.tenantId);
      if (!existing) {
        return fail(c, 'Client not found', 404);
      }

      const client = await this.clientRepository.update(id, user.tenantId, data);

      return ok(c, client);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update client', 400);
    }
  }

  async remove(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const existing = await this.clientRepository.getById(id, user.tenantId);
      if (!existing) {
        return fail(c, 'Client not found', 404);
      }

      await this.clientRepository.softDelete(id, user.tenantId);

      return ok(c, { message: 'Client deactivated successfully' });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to delete client', 400);
    }
  }
}
