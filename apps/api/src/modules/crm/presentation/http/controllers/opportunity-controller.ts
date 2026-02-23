import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IOpportunityRepository } from '../../../domain/repositories';
import {
  createOpportunitySchema,
  updateOpportunitySchema,
  moveOpportunitySchema,
  loseOpportunitySchema,
  paginationSchema,
} from '@trailsystem/types';
import { ok, fail } from '../../../../../shared/http/response';

export class OpportunityController {
  constructor(private repo: IOpportunityRepository) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = c.req.query();
      const pagination = paginationSchema.parse(query);
      const { stageId, sellerId, status } = query;

      const result = await this.repo.list(user.tenantId, {
        ...pagination,
        stageId,
        sellerId,
        status,
      });

      return ok(c, result.data, 200, {
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / pagination.limit),
        },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list opportunities', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const opp = await this.repo.getById(id, user.tenantId);
      if (!opp) return fail(c, 'Opportunity not found', 404);
      return ok(c, opp);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get opportunity', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = createOpportunitySchema.parse(await c.req.json());
      const opp = await this.repo.create(user.tenantId, body);
      return ok(c, opp, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create opportunity', 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const body = updateOpportunitySchema.parse(await c.req.json());
      const opp = await this.repo.update(id, user.tenantId, body);
      if (!opp) return fail(c, 'Opportunity not found', 404);
      return ok(c, opp);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update opportunity', 400);
    }
  }

  async remove(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const deleted = await this.repo.remove(id, user.tenantId);
      if (!deleted) return fail(c, 'Opportunity not found', 404);
      return ok(c, { deleted: true });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to delete opportunity', 400);
    }
  }

  async moveStage(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const { stageId } = moveOpportunitySchema.parse(await c.req.json());
      const opp = await this.repo.moveStage(id, user.tenantId, stageId);
      if (!opp) return fail(c, 'Opportunity or stage not found', 404);
      return ok(c, opp);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to move opportunity', 400);
    }
  }

  async markWon(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const opp = await this.repo.markWon(id, user.tenantId);
      if (!opp) return fail(c, 'Opportunity not found or no Won stage configured', 404);
      return ok(c, opp);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to mark won', 400);
    }
  }

  async markLost(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const { lossReason } = loseOpportunitySchema.parse(await c.req.json());
      const opp = await this.repo.markLost(id, user.tenantId, lossReason);
      if (!opp) return fail(c, 'Opportunity not found or no Lost stage configured', 404);
      return ok(c, opp);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to mark lost', 400);
    }
  }

  async getPipelineSummary(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const summary = await this.repo.getPipelineSummary(user.tenantId);
      return ok(c, summary);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get pipeline summary', 400);
    }
  }
}
