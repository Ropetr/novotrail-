import type { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import { ok, fail } from '../../../../../shared/http/response';
import type { IFinancialTitleRepository, IFinancialLogRepository } from '../../../domain/repositories';
import { idParamSchema, createTitleSchema, updateTitleSchema, settleTitleSchema } from '../validators';

export class FinancialTitleController {
  constructor(
    private titleRepo: IFinancialTitleRepository,
    private logRepo: IFinancialLogRepository,
  ) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = c.req.query();
      const { data, total } = await this.titleRepo.list(user.tenantId, {
        type: query.type,
        status: query.status,
        personId: query.personId,
        dueDateFrom: query.dueDateFrom,
        dueDateTo: query.dueDateTo,
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 20,
      });
      const page = query.page ? Number(query.page) : 1;
      const limit = query.limit ? Number(query.limit) : 20;
      return ok(c, data, 200, {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list titles', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const title = await this.titleRepo.getById(id, user.tenantId);
      if (!title) return fail(c, 'Title not found', 404);
      return ok(c, title);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get title', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createTitleSchema.parse(body);
      const title = await this.titleRepo.create(user.tenantId, data);
      await this.logRepo.create(user.tenantId, user.id, 'financial_titles', title.id, 'create',
        `Created ${data.type}: R$${data.value} due ${data.dueDate}`);
      return ok(c, title, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create title', 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const data = updateTitleSchema.parse(body);
      const title = await this.titleRepo.update(id, user.tenantId, data);
      if (!title) return fail(c, 'Title not found', 404);
      await this.logRepo.create(user.tenantId, user.id, 'financial_titles', id, 'update', JSON.stringify(data));
      return ok(c, title);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update title', 400);
    }
  }

  async cancel(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const cancelled = await this.titleRepo.cancel(id, user.tenantId);
      if (!cancelled) return fail(c, 'Title not found', 404);
      await this.logRepo.create(user.tenantId, user.id, 'financial_titles', id, 'cancel');
      return ok(c, { message: 'Title cancelled' });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to cancel title', 400);
    }
  }

  /**
   * ★ Baixa de título — parcial ou total
   * Calcula desconto/juros/multa, atualiza saldo, gera movimentação bancária
   */
  async settle(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const data = settleTitleSchema.parse(body);

      const result = await this.titleRepo.settle(id, user.tenantId, data);

      await this.logRepo.create(user.tenantId, user.id, 'financial_titles', id, 'settle',
        `Settled R$${data.value} (discount: ${data.discount || 0}, interest: ${data.interest || 0}, fine: ${data.fine || 0}). Remaining: R$${result.title.openValue}`);

      return ok(c, {
        title: result.title,
        settlement: result.settlement,
        message: result.title.status === 'paid' ? 'Title fully settled' : 'Partial settlement recorded',
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to settle title', 400);
    }
  }
}
