import type { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import { ok, fail } from '../../../../../shared/http/response';
import type { IChartOfAccountsRepository, IFinancialLogRepository } from '../../../domain/repositories';
import { idParamSchema, createChartOfAccountSchema, updateChartOfAccountSchema } from '../validators';

export class ChartOfAccountsController {
  constructor(
    private chartRepo: IChartOfAccountsRepository,
    private logRepo: IFinancialLogRepository,
  ) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const accounts = await this.chartRepo.list(user.tenantId);

      // Montar árvore
      const map = new Map(accounts.map(a => [a.id, { ...a, children: [] as any[] }]));
      const tree: any[] = [];
      for (const a of map.values()) {
        if (a.parentId && map.has(a.parentId)) {
          map.get(a.parentId)!.children.push(a);
        } else {
          tree.push(a);
        }
      }
      return ok(c, tree);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list chart of accounts', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createChartOfAccountSchema.parse(body);
      const account = await this.chartRepo.create(user.tenantId, data);
      await this.logRepo.create(user.tenantId, user.id, 'chart_of_accounts', account.id, 'create', `Created account: ${data.code} - ${data.name}`);
      return ok(c, account, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create account', 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const data = updateChartOfAccountSchema.parse(body);
      const account = await this.chartRepo.update(id, user.tenantId, data);
      if (!account) return fail(c, 'Account not found', 404);
      await this.logRepo.create(user.tenantId, user.id, 'chart_of_accounts', id, 'update', JSON.stringify(data));
      return ok(c, account);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update account', 400);
    }
  }

  async remove(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const removed = await this.chartRepo.remove(id, user.tenantId);
      if (!removed) return fail(c, 'Account not found', 404);
      await this.logRepo.create(user.tenantId, user.id, 'chart_of_accounts', id, 'delete');
      return ok(c, { message: 'Account removed' });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to remove account', 400);
    }
  }
}
