import type { Context } from 'hono';
import type { ICreditRepository } from '../../../domain/repositories';

export class CreditController {
  constructor(private creditRepo: ICreditRepository) {}

  async listByClient(c: Context) {
    try {
      const tenantId = c.get('tenantId' as any);
      const clientId = c.req.param('clientId');

      const credits = await this.creditRepo.listByClient(clientId, tenantId);
      return c.json({ success: true, data: credits });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500);
    }
  }

  async getSummary(c: Context) {
    try {
      const tenantId = c.get('tenantId' as any);
      const clientId = c.req.param('clientId');

      const summary = await this.creditRepo.getSummary(clientId, tenantId);
      return c.json({ success: true, data: summary });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500);
    }
  }

  async getById(c: Context) {
    try {
      const tenantId = c.get('tenantId' as any);
      const id = c.req.param('id');

      const credit = await this.creditRepo.getById(id, tenantId);
      if (!credit) {
        return c.json({ success: false, error: 'Crédito não encontrado' }, 404);
      }

      return c.json({ success: true, data: credit });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500);
    }
  }

  async create(c: Context) {
    try {
      const tenantId = c.get('tenantId' as any);
      const body = await c.req.json();

      if (!body.clientId || !body.amount || !body.origin) {
        return c.json({ success: false, error: 'clientId, amount e origin são obrigatórios' }, 400);
      }

      if (body.amount <= 0) {
        return c.json({ success: false, error: 'Valor deve ser maior que zero' }, 400);
      }

      const credit = await this.creditRepo.create(tenantId, body);
      return c.json({ success: true, data: credit }, 201);
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500);
    }
  }

  async use(c: Context) {
    try {
      const tenantId = c.get('tenantId' as any);
      const id = c.req.param('id');
      const body = await c.req.json();

      if (!body.amount || body.amount <= 0) {
        return c.json({ success: false, error: 'Valor deve ser maior que zero' }, 400);
      }

      const credit = await this.creditRepo.use(id, tenantId, body);
      return c.json({ success: true, data: credit });
    } catch (error: any) {
      if (error.message.includes('Insufficient') || error.message.includes('expired') || error.message.includes('not active')) {
        return c.json({ success: false, error: error.message }, 400);
      }
      return c.json({ success: false, error: error.message }, 500);
    }
  }

  async cancel(c: Context) {
    try {
      const tenantId = c.get('tenantId' as any);
      const id = c.req.param('id');

      const credit = await this.creditRepo.cancel(id, tenantId);
      return c.json({ success: true, data: credit });
    } catch (error: any) {
      if (error.message.includes('partially used') || error.message.includes('Only active')) {
        return c.json({ success: false, error: error.message }, 400);
      }
      return c.json({ success: false, error: error.message }, 500);
    }
  }
}
