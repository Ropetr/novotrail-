import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IPipelineStageRepository } from '../../../domain/repositories';
import { createPipelineStageSchema, updatePipelineStageSchema } from '@trailsystem/types';
import { ok, fail } from '../../../../../shared/http/response';

export class PipelineStageController {
  constructor(private repo: IPipelineStageRepository) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const data = await this.repo.list(user.tenantId);
      return ok(c, data);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list pipeline stages', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const stage = await this.repo.getById(id, user.tenantId);
      if (!stage) return fail(c, 'Stage not found', 404);
      return ok(c, stage);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get stage', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = createPipelineStageSchema.parse(await c.req.json());
      const stage = await this.repo.create(user.tenantId, body);
      return ok(c, stage, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create stage', 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const body = updatePipelineStageSchema.parse(await c.req.json());
      const stage = await this.repo.update(id, user.tenantId, body);
      if (!stage) return fail(c, 'Stage not found', 404);
      return ok(c, stage);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update stage', 400);
    }
  }

  async remove(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const deleted = await this.repo.remove(id, user.tenantId);
      if (!deleted) return fail(c, 'Stage not found', 404);
      return ok(c, { deleted: true });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to delete stage', 400);
    }
  }

  async seedDefaults(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const stages = await this.repo.seedDefaults(user.tenantId);
      return ok(c, stages, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to seed defaults', 400);
    }
  }
}
