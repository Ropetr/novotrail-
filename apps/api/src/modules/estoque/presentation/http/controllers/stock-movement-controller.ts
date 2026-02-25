import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IStockMovementRepository, IStockSettingsRepository } from '../../../domain/repositories';
import { movementListSchema, createMovementSchema, idParamSchema } from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class StockMovementController {
  constructor(
    private movementRepository: IStockMovementRepository,
    private settingsRepository: IStockSettingsRepository,
  ) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = movementListSchema.parse(c.req.query());
      const result = await this.movementRepository.list(user.tenantId, query);
      return ok(c, result.data, 200, {
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list movements', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const movement = await this.movementRepository.getById(id, user.tenantId);
      if (!movement) return fail(c, 'Movement not found', 404);
      return ok(c, movement);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get movement', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createMovementSchema.parse(body);

      // Buscar configuração de estoque negativo
      const settings = await this.settingsRepository.get(user.tenantId);

      const movement = await this.movementRepository.create(
        user.tenantId,
        user.id,
        data,
        { allowNegativeStock: settings.allowNegativeStock },
      );

      return ok(c, movement, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create movement', 400);
    }
  }
}
