import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IActivityRepository } from '../../../domain/repositories';
import { createActivitySchema, updateActivitySchema, completeActivitySchema } from '@trailsystem/types';
import { ok, fail } from '../../../../../shared/http/response';

export class ActivityController {
  constructor(private repo: IActivityRepository) {}

  async listByOpportunity(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const opportunityId = c.req.param('opportunityId');
      const data = await this.repo.listByOpportunity(opportunityId, user.tenantId);
      return ok(c, data);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list activities', 400);
    }
  }

  async listByClient(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const clientId = c.req.param('clientId');
      const data = await this.repo.listByClient(clientId, user.tenantId);
      return ok(c, data);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list activities', 400);
    }
  }

  async listPending(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const userId = c.req.query('userId');
      const data = await this.repo.listPending(user.tenantId, userId);
      return ok(c, data);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list pending activities', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const activity = await this.repo.getById(id, user.tenantId);
      if (!activity) return fail(c, 'Activity not found', 404);
      return ok(c, activity);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get activity', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = createActivitySchema.parse(await c.req.json());
      const activity = await this.repo.create(user.tenantId, body);
      return ok(c, activity, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create activity', 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const body = updateActivitySchema.parse(await c.req.json());
      const activity = await this.repo.update(id, user.tenantId, body);
      if (!activity) return fail(c, 'Activity not found', 404);
      return ok(c, activity);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update activity', 400);
    }
  }

  async complete(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const body = completeActivitySchema.parse(await c.req.json());
      const activity = await this.repo.complete(id, user.tenantId, body.result);
      if (!activity) return fail(c, 'Activity not found', 404);
      return ok(c, activity);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to complete activity', 400);
    }
  }

  async remove(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const deleted = await this.repo.remove(id, user.tenantId);
      if (!deleted) return fail(c, 'Activity not found', 404);
      return ok(c, { deleted: true });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to delete activity', 400);
    }
  }
}
