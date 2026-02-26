import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IPaymentRuleRepository, IFinancialLogRepository } from '../../../domain/repositories';
import { createPaymentRuleSchema, updatePaymentRuleSchema } from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class PaymentRuleController {
  constructor(
    private ruleRepo: IPaymentRuleRepository,
    private logRepo: IFinancialLogRepository,
  ) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const data = await this.ruleRepo.list(user.tenantId);
      return ok(c, data);
    } catch (error: any) {
      return fail(c, error.message, 500);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createPaymentRuleSchema.parse(body);
      const rule = await this.ruleRepo.create(user.tenantId, data);
      await this.logRepo.create(user.tenantId, user.id, 'payment_rule', rule.id, 'create', `Rule: ${data.name} (${data.trigger} ${data.daysOffset}d via ${data.channel})`);
      return ok(c, rule, 201);
    } catch (error: any) {
      return fail(c, error.message, 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const body = await c.req.json();
      const data = updatePaymentRuleSchema.parse(body);
      const rule = await this.ruleRepo.update(id, user.tenantId, data);
      if (!rule) return fail(c, 'Payment rule not found', 404);
      await this.logRepo.create(user.tenantId, user.id, 'payment_rule', id, 'update');
      return ok(c, rule);
    } catch (error: any) {
      return fail(c, error.message, 400);
    }
  }

  async remove(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const removed = await this.ruleRepo.remove(id, user.tenantId);
      if (!removed) return fail(c, 'Payment rule not found', 404);
      await this.logRepo.create(user.tenantId, user.id, 'payment_rule', id, 'delete');
      return ok(c, { message: 'Payment rule removed' });
    } catch (error: any) {
      return fail(c, error.message, 500);
    }
  }
}
