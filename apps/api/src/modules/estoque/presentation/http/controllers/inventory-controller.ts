import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IInventoryCountRepository } from '../../../domain/repositories';
import {
  createInventoryCountSchema,
  countItemSchema,
  paginationSchema,
  idParamSchema,
} from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class InventoryController {
  constructor(private inventoryCountRepository: IInventoryCountRepository) {}

  /**
   * Listar inventários do tenant.
   */
  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = paginationSchema.parse(c.req.query());
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
      return fail(c, error.message || 'Falha ao listar inventários', 400);
    }
  }

  /**
   * Buscar inventário por ID com todos os itens contados.
   */
  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const inventory = await this.inventoryCountRepository.getById(id, user.tenantId);
      if (!inventory) {
        return fail(c, 'Inventário não encontrado', 404);
      }
      return ok(c, inventory);
    } catch (error: any) {
      return fail(c, error.message || 'Falha ao buscar inventário', 400);
    }
  }

  /**
   * Criar novo inventário para um depósito.
   */
  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createInventoryCountSchema.parse(body);
      const inventory = await this.inventoryCountRepository.create(
        user.tenantId,
        data,
        user.id
      );
      return ok(c, inventory, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Falha ao criar inventário', 400);
    }
  }

  /**
   * Iniciar contagem (draft → counting).
   */
  async startCounting(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const inventory = await this.inventoryCountRepository.updateStatus(
        id,
        user.tenantId,
        'counting',
        user.id
      );
      if (!inventory) {
        return fail(c, 'Inventário não encontrado', 404);
      }
      return ok(c, inventory);
    } catch (error: any) {
      return fail(c, error.message || 'Falha ao iniciar contagem', 400);
    }
  }

  /**
   * Registrar contagem de um item (contagem CEGA).
   */
  async countItem(c: Context<HonoContext>) {
    try {
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const data = countItemSchema.parse(body);
      await this.inventoryCountRepository.addCountItem(id, data);
      return ok(c, { message: 'Item contado com sucesso' });
    } catch (error: any) {
      return fail(c, error.message || 'Falha ao registrar contagem', 400);
    }
  }

  /**
   * Finalizar contagem e enviar para revisão (counting → review).
   * Neste momento, o sistema calcula as diferenças.
   */
  async submitForReview(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const inventory = await this.inventoryCountRepository.updateStatus(
        id,
        user.tenantId,
        'review',
        user.id
      );
      if (!inventory) {
        return fail(c, 'Inventário não encontrado', 404);
      }
      return ok(c, inventory);
    } catch (error: any) {
      return fail(c, error.message || 'Falha ao enviar para revisão', 400);
    }
  }

  /**
   * Aprovar inventário (review → approved).
   * Gera movimentações de ajuste automaticamente.
   */
  async approve(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const inventory = await this.inventoryCountRepository.updateStatus(
        id,
        user.tenantId,
        'approved',
        user.id
      );
      if (!inventory) {
        return fail(c, 'Inventário não encontrado', 404);
      }
      return ok(c, {
        ...inventory,
        message: 'Inventário aprovado. Ajustes de estoque gerados automaticamente.',
      });
    } catch (error: any) {
      return fail(c, error.message || 'Falha ao aprovar inventário', 400);
    }
  }

  /**
   * Cancelar inventário.
   */
  async cancel(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const inventory = await this.inventoryCountRepository.updateStatus(
        id,
        user.tenantId,
        'cancelled',
        user.id
      );
      if (!inventory) {
        return fail(c, 'Inventário não encontrado', 404);
      }
      return ok(c, inventory);
    } catch (error: any) {
      return fail(c, error.message || 'Falha ao cancelar inventário', 400);
    }
  }
}
