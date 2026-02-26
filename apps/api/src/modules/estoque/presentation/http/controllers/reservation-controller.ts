import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IReservationRepository } from '../../../domain/repositories';
import { createReservationSchema, reservationListSchema, reservationStatusSchema, idParamSchema } from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class ReservationController {
  constructor(private reservationRepo: IReservationRepository) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = reservationListSchema.parse(c.req.query());
      const result = await this.reservationRepo.list(user.tenantId, query);
      return ok(c, result.data, 200, {
        pagination: { page: query.page, limit: query.limit, total: result.total, totalPages: Math.ceil(result.total / query.limit) },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list reservations', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createReservationSchema.parse(body);
      const reservation = await this.reservationRepo.create(user.tenantId, user.id, data);
      return ok(c, reservation, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create reservation', 400);
    }
  }

  async updateStatus(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const { status } = reservationStatusSchema.parse(body);

      const existing = await this.reservationRepo.getById(id, user.tenantId);
      if (!existing) return fail(c, 'Reservation not found', 404);
      if (existing.status !== 'reserved') {
        return fail(c, `Cannot change status from "${existing.status}"`, 400);
      }

      const updated = await this.reservationRepo.updateStatus(id, user.tenantId, status);
      return ok(c, updated);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update reservation', 400);
    }
  }
}
