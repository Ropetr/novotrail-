import type { Context } from 'hono';
import type { IDeliveryRepository } from '../../../domain/repositories';

export class DeliveryController {
  constructor(private deliveryRepo: IDeliveryRepository) {}

  async listBySale(c: Context) {
    try {
      const saleId = c.req.param('saleId');
      const deliveries = await this.deliveryRepo.listBySale(saleId);

      return c.json({ success: true, data: deliveries });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500);
    }
  }

  async getById(c: Context) {
    try {
      const id = c.req.param('id');
      const delivery = await this.deliveryRepo.getById(id);

      if (!delivery) {
        return c.json({ success: false, error: 'Entrega não encontrada' }, 404);
      }

      return c.json({ success: true, data: delivery });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500);
    }
  }

  async create(c: Context) {
    try {
      const tenantId = c.get('tenantId' as any);
      const body = await c.req.json();

      if (!body.saleId) {
        return c.json({ success: false, error: 'saleId é obrigatório' }, 400);
      }
      if (!body.items || body.items.length === 0) {
        return c.json({ success: false, error: 'Selecione pelo menos um item' }, 400);
      }

      const delivery = await this.deliveryRepo.create(tenantId, body);

      return c.json({ success: true, data: delivery }, 201);
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500);
    }
  }

  async startSeparation(c: Context) {
    try {
      const id = c.req.param('id');
      const delivery = await this.deliveryRepo.getById(id);

      if (!delivery) {
        return c.json({ success: false, error: 'Entrega não encontrada' }, 404);
      }
      if (delivery.status !== 'pending') {
        return c.json({ success: false, error: 'Entrega não está pendente' }, 400);
      }

      const updated = await this.deliveryRepo.startSeparation(id);
      return c.json({ success: true, data: updated });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500);
    }
  }

  async confirmSeparation(c: Context) {
    try {
      const id = c.req.param('id');
      const delivery = await this.deliveryRepo.getById(id);

      if (!delivery) {
        return c.json({ success: false, error: 'Entrega não encontrada' }, 404);
      }
      if (delivery.status !== 'separating') {
        return c.json({ success: false, error: 'Entrega não está em separação' }, 400);
      }

      const updated = await this.deliveryRepo.confirmSeparation(id);
      return c.json({ success: true, data: updated });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500);
    }
  }

  async confirmDelivery(c: Context) {
    try {
      const id = c.req.param('id');
      const body = await c.req.json();
      const delivery = await this.deliveryRepo.getById(id);

      if (!delivery) {
        return c.json({ success: false, error: 'Entrega não encontrada' }, 404);
      }
      if (delivery.status !== 'separated' && delivery.status !== 'in_transit') {
        return c.json({ success: false, error: 'Entrega precisa estar separada ou em trânsito' }, 400);
      }
      if (!body.receiverName) {
        return c.json({ success: false, error: 'Nome do recebedor é obrigatório' }, 400);
      }

      const updated = await this.deliveryRepo.confirmDelivery(
        id,
        body.receiverName,
        body.receiverDocument
      );
      return c.json({ success: true, data: updated });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500);
    }
  }

  async cancel(c: Context) {
    try {
      const id = c.req.param('id');
      const delivery = await this.deliveryRepo.getById(id);

      if (!delivery) {
        return c.json({ success: false, error: 'Entrega não encontrada' }, 404);
      }
      if (delivery.status === 'delivered' || delivery.status === 'invoiced') {
        return c.json({ success: false, error: 'Entrega já finalizada não pode ser cancelada' }, 400);
      }

      const updated = await this.deliveryRepo.cancel(id);
      return c.json({ success: true, data: updated });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500);
    }
  }
}
