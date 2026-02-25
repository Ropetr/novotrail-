import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IInventoryCountRepository, IStockMovementRepository } from '../../../domain/repositories';
import type { InventoryCountItem } from '../../../domain/entities';
import { inventoryListSchema, createInventoryCountSchema, registerCountItemSchema, idParamSchema } from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class InventoryCountController {
  constructor(
    private inventoryCountRepository: IInventoryCountRepository,
    private movementRepository: IStockMovementRepository,
  ) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = inventoryListSchema.parse(c.req.query());
      const result = await this.inventoryCountRepository.list(user.tenantId, query);
      return ok(c, result.data, 200, {
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list inventory counts', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const count = await this.inventoryCountRepository.getById(id, user.tenantId);
      if (!count) return fail(c, 'Inventory count not found', 404);

      // Se contagem cega, esconder systemQuantity dos itens que ainda não foram contados
      if (count.blindCount && count.items) {
        count.items = count.items.map((item: InventoryCountItem) => ({
          ...item,
          systemQuantity: item.status === 'pending' ? undefined : item.systemQuantity,
        })) as InventoryCountItem[];
      }

      return ok(c, count);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get inventory count', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createInventoryCountSchema.parse(body);
      const count = await this.inventoryCountRepository.create(user.tenantId, user.id, data);

      // Aplicar blind count: esconder systemQuantity dos itens pendentes
      if (count.blindCount && count.items) {
        count.items = count.items.map((item: InventoryCountItem) => ({
          ...item,
          systemQuantity: item.status === 'pending' ? undefined : item.systemQuantity,
        })) as InventoryCountItem[];
      }

      return ok(c, count, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create inventory count', 400);
    }
  }

  async registerItem(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      // Verificar se inventário existe e está em status de contagem
      const count = await this.inventoryCountRepository.getById(id, user.tenantId);
      if (!count) return fail(c, 'Inventory count not found', 404);
      if (count.status !== 'counting') {
        return fail(c, 'Inventory count is not in counting status', 422);
      }

      const body = await c.req.json();
      const data = registerCountItemSchema.parse(body);
      await this.inventoryCountRepository.registerItem(id, user.id, data);

      return ok(c, { message: 'Item count registered' });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to register count item', 400);
    }
  }

  /**
   * Aprovar inventário — gera ajustes automáticos (adjustment_in/out)
   * para cada item cuja contagem difere do sistema
   */
  async approve(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const count = await this.inventoryCountRepository.getById(id, user.tenantId);
      if (!count) return fail(c, 'Inventory count not found', 404);
      if (count.status !== 'counting' && count.status !== 'review') {
        return fail(c, 'Inventory count must be in counting or review status to approve', 422);
      }

      // Gerar ajustes automáticos para itens com diferença
      const countedItems = (count.items || []).filter(
        (item: InventoryCountItem) => item.status === 'counted' && item.difference !== null && Number(item.difference) !== 0
      );

      for (const item of countedItems) {
        const diff = Number(item.difference);
        await this.movementRepository.create(user.tenantId, user.id, {
          warehouseId: count.warehouseId,
          productId: item.productId,
          type: diff > 0 ? 'adjustment_in' : 'adjustment_out',
          quantity: Math.abs(diff),
          referenceType: 'inventory_count',
          referenceId: count.id,
          referenceNumber: count.number,
          reason: `Inventory count adjustment: system=${item.systemQuantity}, counted=${item.countedQuantity}`,
        }, { allowNegativeStock: true }); // Ajustes de inventário são correções — sempre permitidos
      }

      const approved = await this.inventoryCountRepository.approve(id, user.tenantId, user.id);
      return ok(c, approved, 200, {
        adjustments: countedItems.length,
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to approve inventory count', 400);
    }
  }
}
