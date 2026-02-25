import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IStockSettingsRepository } from '../../../domain/repositories';
import { updateStockSettingsSchema } from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class StockSettingsController {
  constructor(private settingsRepository: IStockSettingsRepository) {}

  async get(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const settings = await this.settingsRepository.get(user.tenantId);
      return ok(c, settings);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get stock settings', 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = updateStockSettingsSchema.parse(body);
      const settings = await this.settingsRepository.update(user.tenantId, data);
      return ok(c, settings);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update stock settings', 400);
    }
  }
}
