import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IStockTransferRepository, IStockMovementRepository } from '../../../domain/repositories';
import { transferListSchema, createTransferSchema, idParamSchema } from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class StockTransferController {
  constructor(
    private transferRepository: IStockTransferRepository,
    private movementRepository: IStockMovementRepository,
  ) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = transferListSchema.parse(c.req.query());
      const result = await this.transferRepository.list(user.tenantId, query);
      return ok(c, result.data, 200, {
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list transfers', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const transfer = await this.transferRepository.getById(id, user.tenantId);
      if (!transfer) return fail(c, 'Transfer not found', 404);
      return ok(c, transfer);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get transfer', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createTransferSchema.parse(body);
      const transfer = await this.transferRepository.create(user.tenantId, user.id, data);
      return ok(c, transfer, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create transfer', 400);
    }
  }

  /**
   * Passo 1: Enviar — marca como "em trânsito" e gera saída no depósito de origem
   */
  async ship(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const transfer = await this.transferRepository.getById(id, user.tenantId);
      if (!transfer) return fail(c, 'Transfer not found', 404);
      if (transfer.status !== 'draft') return fail(c, 'Transfer can only be shipped from draft status', 422);

      // Gerar movimentação de saída para cada item no depósito de origem
      for (const item of (transfer.items || [])) {
        await this.movementRepository.create(user.tenantId, user.id, {
          warehouseId: transfer.fromWarehouseId,
          productId: item.productId,
          type: 'transfer_out',
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost),
          referenceType: 'transfer',
          referenceId: transfer.id,
          referenceNumber: transfer.number,
        });
      }

      const updated = await this.transferRepository.updateStatus(id, user.tenantId, 'in_transit');
      return ok(c, updated);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to ship transfer', 400);
    }
  }

  /**
   * Passo 2: Receber — marca como "recebida" e gera entrada no depósito de destino
   */
  async receive(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const transfer = await this.transferRepository.getById(id, user.tenantId);
      if (!transfer) return fail(c, 'Transfer not found', 404);
      if (transfer.status !== 'in_transit') return fail(c, 'Transfer can only be received from in_transit status', 422);

      // Gerar movimentação de entrada para cada item no depósito de destino
      for (const item of (transfer.items || [])) {
        await this.movementRepository.create(user.tenantId, user.id, {
          warehouseId: transfer.toWarehouseId,
          productId: item.productId,
          type: 'transfer_in',
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost),
          referenceType: 'transfer',
          referenceId: transfer.id,
          referenceNumber: transfer.number,
        });
      }

      const updated = await this.transferRepository.updateStatus(id, user.tenantId, 'received');
      return ok(c, updated);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to receive transfer', 400);
    }
  }
}
