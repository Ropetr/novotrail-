import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IScanRepository } from '../../../domain/repositories';
import { createScanSchema, idParamSchema } from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class ScanController {
  constructor(private scanRepo: IScanRepository) {}

  async scan(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const data = createScanSchema.parse(body);

      if (!data.barcode && !data.productId) {
        return fail(c, 'Either barcode or productId is required', 400);
      }

      const scan = await this.scanRepo.create(user.tenantId, user.id, id, data);
      return ok(c, scan, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to register scan', 400);
    }
  }
}
