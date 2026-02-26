import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IProductionOrderRepository, IStockMovementRepository, IKitRepository } from '../../../domain/repositories';
import { createProductionOrderSchema, productionStatusSchema, productionListSchema, idParamSchema } from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class ProductionOrderController {
  constructor(
    private productionRepo: IProductionOrderRepository,
    private movementRepo: IStockMovementRepository,
    private kitRepo: IKitRepository
  ) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = productionListSchema.parse(c.req.query());
      const result = await this.productionRepo.list(user.tenantId, query);
      return ok(c, result.data, 200, {
        pagination: { page: query.page, limit: query.limit, total: result.total, totalPages: Math.ceil(result.total / query.limit) },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list production orders', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const order = await this.productionRepo.getById(id, user.tenantId);
      if (!order) return fail(c, 'Production order not found', 404);
      return ok(c, order);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get production order', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createProductionOrderSchema.parse(body);
      const order = await this.productionRepo.create(user.tenantId, user.id, data);
      return ok(c, order, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create production order', 400);
    }
  }

  async updateStatus(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const { status } = productionStatusSchema.parse(body);

      const order = await this.productionRepo.getById(id, user.tenantId);
      if (!order) return fail(c, 'Production order not found', 404);

      // Validate transitions
      const validTransitions: Record<string, string[]> = {
        draft: ['in_progress', 'cancelled'],
        in_progress: ['finished', 'cancelled'],
      };
      if (!validTransitions[order.status]?.includes(status)) {
        return fail(c, `Cannot transition from "${order.status}" to "${status}"`, 400);
      }

      // FINISHED: consume insumos + generate finished product
      if (status === 'finished') {
        if (!order.items || order.items.length === 0) {
          return fail(c, 'No components defined for this production order', 400);
        }

        // 1. Consume each component (saída tipo production)
        for (const item of order.items) {
          await this.movementRepo.create(user.tenantId, user.id, {
            warehouseId: order.warehouseId,
            productId: item.productId,
            type: 'production',
            quantity: -Number(item.quantityRequired),
            reason: `Consumo OP ${order.code}`,
            referenceType: 'production_order',
            referenceId: order.id,
            referenceNumber: order.code,
          });
        }

        // 2. Generate finished product (entrada tipo production)
        await this.movementRepo.create(user.tenantId, user.id, {
          warehouseId: order.warehouseId,
          productId: order.productId,
          type: 'production',
          quantity: Number(order.quantity),
          reason: `Produção OP ${order.code}`,
          referenceType: 'production_order',
          referenceId: order.id,
          referenceNumber: order.code,
        });
      }

      const updated = await this.productionRepo.updateStatus(id, user.tenantId, status, user.id);
      return ok(c, updated);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update production order status', 400);
    }
  }
}
