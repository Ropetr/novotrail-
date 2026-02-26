import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IKitRepository } from '../../../domain/repositories';
import { createKitSchema, updateKitSchema, idParamSchema } from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class KitController {
  constructor(private kitRepo: IKitRepository) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const kits = await this.kitRepo.listKits(user.tenantId);
      return ok(c, kits);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list kits', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const kit = await this.kitRepo.getKit(id, user.tenantId);
      if (!kit) return fail(c, 'Kit not found', 404);
      return ok(c, kit);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get kit', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createKitSchema.parse(body);
      const components = await this.kitRepo.createKit(user.tenantId, data);
      return ok(c, { kitProductId: data.kitProductId, components }, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create kit', 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const data = updateKitSchema.parse(body);
      const components = await this.kitRepo.updateKit(id, user.tenantId, data);
      return ok(c, { kitProductId: id, components });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update kit', 400);
    }
  }

  async remove(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      await this.kitRepo.deleteKit(id, user.tenantId);
      return ok(c, { message: 'Kit removed' });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to delete kit', 400);
    }
  }
}
