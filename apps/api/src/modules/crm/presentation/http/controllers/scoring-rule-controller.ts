import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IScoringRuleRepository } from '../../../domain/repositories';
import { createScoringRuleSchema, updateScoringRuleSchema } from '@trailsystem/types';
import { ok, fail } from '../../../../../shared/http/response';

export class ScoringRuleController {
  constructor(private repo: IScoringRuleRepository) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const data = await this.repo.list(user.tenantId);
      return ok(c, data);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list scoring rules', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const rule = await this.repo.getById(id, user.tenantId);
      if (!rule) return fail(c, 'Scoring rule not found', 404);
      return ok(c, rule);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get scoring rule', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = createScoringRuleSchema.parse(await c.req.json());
      const rule = await this.repo.create(user.tenantId, body);
      return ok(c, rule, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create scoring rule', 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const body = updateScoringRuleSchema.parse(await c.req.json());
      const rule = await this.repo.update(id, user.tenantId, body);
      if (!rule) return fail(c, 'Scoring rule not found', 404);
      return ok(c, rule);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update scoring rule', 400);
    }
  }

  async remove(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const deleted = await this.repo.remove(id, user.tenantId);
      if (!deleted) return fail(c, 'Scoring rule not found', 404);
      return ok(c, { deleted: true });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to delete scoring rule', 400);
    }
  }

  async seedDefaults(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const rules = await this.repo.seedDefaults(user.tenantId);
      return ok(c, rules, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to seed defaults', 400);
    }
  }
}
