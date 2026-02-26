import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IStockMovementRepository, IKitRepository, IReservationRepository } from '../../../domain/repositories';
import { fromSaleSchema } from '../validators';
import { ok, fail } from '../../../../../shared/http/response';
import { sql } from 'drizzle-orm';

export class IntegrationController {
  constructor(
    private movementRepo: IStockMovementRepository,
    private kitRepo: IKitRepository,
    private reservationRepo: IReservationRepository
  ) {}

  async fromSale(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = fromSaleSchema.parse(body);
      const movements: any[] = [];

      for (const item of data.items) {
        // Check if product is a kit
        const components = await this.kitRepo.getComponents(item.productId, user.tenantId);

        if (components.length > 0) {
          // Kit: explode into components
          for (const comp of components) {
            const qty = Number(comp.quantity) * item.quantity;
            const mov = await this.movementRepo.create(user.tenantId, user.id, {
              warehouseId: data.warehouseId,
              productId: comp.componentProductId,
              type: 'sale_exit',
              quantity: -qty,
              unitCost: item.unitCost || 0,
              referenceType: 'sale',
              referenceId: data.saleId,
              reason: `Venda kit - componente ${comp.componentName || comp.componentProductId}`,
            });
            movements.push(mov);
          }
        } else {
          // Normal product: direct exit
          const mov = await this.movementRepo.create(user.tenantId, user.id, {
            warehouseId: data.warehouseId,
            productId: item.productId,
            type: 'sale_exit',
            quantity: -item.quantity,
            unitCost: item.unitCost || 0,
            referenceType: 'sale',
            referenceId: data.saleId,
          });
          movements.push(mov);
        }
      }

      // Consume reservations linked to this sale
      const reservations = await this.reservationRepo.getByOrder(data.saleId, user.tenantId);
      for (const res of reservations) {
        await this.reservationRepo.updateStatus(res.id, user.tenantId, 'consumed');
      }

      return ok(c, {
        message: `Processed ${movements.length} movements for sale`,
        movements,
        reservationsConsumed: reservations.length,
      }, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to process sale exit', 400);
    }
  }
}
