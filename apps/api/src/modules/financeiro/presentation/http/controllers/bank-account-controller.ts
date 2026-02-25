import type { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import { ok, fail } from '../../../../../shared/http/response';
import type { IBankAccountRepository, IFinancialLogRepository } from '../../../domain/repositories';
import { idParamSchema, createBankAccountSchema, updateBankAccountSchema } from '../validators';

export class BankAccountController {
  constructor(
    private bankRepo: IBankAccountRepository,
    private logRepo: IFinancialLogRepository,
  ) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const accounts = await this.bankRepo.list(user.tenantId);
      return ok(c, accounts);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list bank accounts', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const account = await this.bankRepo.getById(id, user.tenantId);
      if (!account) return fail(c, 'Bank account not found', 404);
      return ok(c, account);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get bank account', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createBankAccountSchema.parse(body);
      const account = await this.bankRepo.create(user.tenantId, data);
      await this.logRepo.create(user.tenantId, user.id, 'bank_accounts', account.id, 'create', `Created: ${data.description || data.accountNumber}`);
      return ok(c, account, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create bank account', 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const data = updateBankAccountSchema.parse(body);
      const account = await this.bankRepo.update(id, user.tenantId, data);
      if (!account) return fail(c, 'Bank account not found', 404);
      await this.logRepo.create(user.tenantId, user.id, 'bank_accounts', id, 'update', JSON.stringify(data));
      return ok(c, account);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update bank account', 400);
    }
  }

  async deactivate(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const deactivated = await this.bankRepo.deactivate(id, user.tenantId);
      if (!deactivated) return fail(c, 'Bank account not found', 404);
      await this.logRepo.create(user.tenantId, user.id, 'bank_accounts', id, 'delete');
      return ok(c, { message: 'Bank account deactivated' });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to deactivate bank account', 400);
    }
  }
}
