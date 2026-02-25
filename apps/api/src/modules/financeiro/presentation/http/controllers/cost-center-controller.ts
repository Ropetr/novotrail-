import type { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import { ok, fail } from '../../../../../shared/http/response';
import type { ICostCenterRepository, IFinancialLogRepository } from '../../../domain/repositories';
import { idParamSchema, createCostCenterSchema, updateCostCenterSchema } from '../validators';

export class CostCenterController {
  constructor(
    private costCenterRepo: ICostCenterRepository,
    private logRepo: IFinancialLogRepository,
  ) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const centers = await this.costCenterRepo.list(user.tenantId);

      // Montar árvore
      const map = new Map(centers.map(cc => [cc.id, { ...cc, children: [] as any[] }]));
      const tree: any[] = [];
      for (const cc of map.values()) {
        if (cc.parentId && map.has(cc.parentId)) {
          map.get(cc.parentId)!.children.push(cc);
        } else {
          tree.push(cc);
        }
      }
      return ok(c, tree);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list cost centers', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createCostCenterSchema.parse(body);
      const center = await this.costCenterRepo.create(user.tenantId, data);
      await this.logRepo.create(user.tenantId, user.id, 'cost_centers', center.id, 'create', `Created: ${data.code} - ${data.name}`);
      return ok(c, center, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create cost center', 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const data = updateCostCenterSchema.parse(body);
      const center = await this.costCenterRepo.update(id, user.tenantId, data);
      if (!center) return fail(c, 'Cost center not found', 404);
      await this.logRepo.create(user.tenantId, user.id, 'cost_centers', id, 'update', JSON.stringify(data));
      return ok(c, center);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update cost center', 400);
    }
  }

  async deactivate(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const deactivated = await this.costCenterRepo.deactivate(id, user.tenantId);
      if (!deactivated) return fail(c, 'Cost center not found', 404);
      await this.logRepo.create(user.tenantId, user.id, 'cost_centers', id, 'delete');
      return ok(c, { message: 'Cost center deactivated' });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to deactivate cost center', 400);
    }
  }
}
