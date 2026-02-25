import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IStockLevelRepository, IStockMovementRepository } from '../../../domain/repositories';
import {
  createMovementSchema,
  transferSchema,
  stockLevelQuerySchema,
  movementQuerySchema,
  idParamSchema,
} from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class StockController {
  constructor(
    private stockLevelRepository: IStockLevelRepository,
    private stockMovementRepository: IStockMovementRepository
  ) {}

  // ==================== Saldos ====================

  async listLevels(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = stockLevelQuerySchema.parse(c.req.query());
      const result = await this.stockLevelRepository.list(user.tenantId, query);
      return ok(c, result.data, 200, {
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Falha ao listar saldos', 400);
    }
  }

  async getProductStock(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id: productId } = idParamSchema.parse(c.req.param());
      const warehouseId = c.req.query('warehouseId');
      const levels = await this.stockLevelRepository.getByProduct(
        productId,
        user.tenantId,
        warehouseId || undefined
      );
      return ok(c, levels);
    } catch (error: any) {
      return fail(c, error.message || 'Falha ao buscar saldo do produto', 400);
    }
  }

  async getAlerts(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const warehouseId = c.req.query('warehouseId');
      const alerts = await this.stockLevelRepository.getAlerts(
        user.tenantId,
        warehouseId || undefined
      );
      return ok(c, alerts);
    } catch (error: any) {
      return fail(c, error.message || 'Falha ao buscar alertas de estoque', 400);
    }
  }

  // ==================== Movimentações ====================

  async listMovements(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = movementQuerySchema.parse(c.req.query());
      const result = await this.stockMovementRepository.list(user.tenantId, query);
      return ok(c, result.data, 200, {
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Falha ao listar movimentações', 400);
    }
  }

  async getMovement(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const movement = await this.stockMovementRepository.getById(id, user.tenantId);
      if (!movement) {
        return fail(c, 'Movimentação não encontrada', 404);
      }
      return ok(c, movement);
    } catch (error: any) {
      return fail(c, error.message || 'Falha ao buscar movimentação', 400);
    }
  }

  async createMovement(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createMovementSchema.parse(body);

      // Validar saldo disponível para saídas
      const outboundTypes = ['sale_out', 'transfer_out', 'damage', 'loss', 'bonus_out'];
      if (outboundTypes.includes(data.type)) {
        const levels = await this.stockLevelRepository.getByProduct(
          data.productId,
          user.tenantId,
          data.warehouseId
        );
        const level = levels[0];
        if (level) {
          const available = Number(level.quantity) - Number(level.reservedQty);
          if (available < data.quantity) {
            return fail(
              c,
              `Saldo insuficiente. Disponível: ${available.toFixed(4)}, Solicitado: ${data.quantity}`,
              422
            );
          }
        } else {
          return fail(c, 'Produto sem saldo neste depósito', 422);
        }
      }

      const movement = await this.stockMovementRepository.create(
        user.tenantId,
        data,
        user.id
      );
      return ok(c, movement, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Falha ao criar movimentação', 400);
    }
  }

  // ==================== Transferências ====================

  async transfer(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = transferSchema.parse(body);

      if (data.sourceWarehouseId === data.destinationWarehouseId) {
        return fail(c, 'Depósito de origem e destino devem ser diferentes', 422);
      }

      // Validar saldo na origem
      const levels = await this.stockLevelRepository.getByProduct(
        data.productId,
        user.tenantId,
        data.sourceWarehouseId
      );
      const sourceLevel = levels[0];
      if (sourceLevel) {
        const available = Number(sourceLevel.quantity) - Number(sourceLevel.reservedQty);
        if (available < data.quantity) {
          return fail(
            c,
            `Saldo insuficiente na origem. Disponível: ${available.toFixed(4)}, Solicitado: ${data.quantity}`,
            422
          );
        }
      } else {
        return fail(c, 'Produto sem saldo no depósito de origem', 422);
      }

      // Criar movimentação de saída na origem
      const outMovement = await this.stockMovementRepository.create(
        user.tenantId,
        {
          productId: data.productId,
          warehouseId: data.sourceWarehouseId,
          type: 'transfer_out',
          quantity: data.quantity,
          reason: data.reason,
          notes: data.notes,
        },
        user.id
      );

      // Criar movimentação de entrada no destino
      const inMovement = await this.stockMovementRepository.create(
        user.tenantId,
        {
          productId: data.productId,
          warehouseId: data.destinationWarehouseId,
          type: 'transfer_in',
          quantity: data.quantity,
          referenceType: 'transfer',
          referenceId: outMovement.id,
          reason: data.reason,
          notes: data.notes,
        },
        user.id
      );

      return ok(c, {
        outMovement,
        inMovement,
        message: 'Transferência realizada com sucesso',
      }, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Falha ao realizar transferência', 400);
    }
  }
}
