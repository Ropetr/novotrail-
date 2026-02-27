import { eq, and, sql } from 'drizzle-orm';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { paymentRules } from '../schema';
import type { IPaymentRuleRepository } from '../../domain/repositories';
import type { PaymentRule, CreatePaymentRuleDTO, UpdatePaymentRuleDTO } from '../../domain/entities';

export class PaymentRuleRepository implements IPaymentRuleRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string): Promise<PaymentRule[]> {
    const rows = await this.db.select().from(paymentRules)
      .where(eq(paymentRules.tenantId, tenantId))
      .orderBy(sql`${paymentRules.trigger} ASC, ${paymentRules.daysOffset} ASC`);
    return rows as any[];
  }

  async getById(id: string, tenantId: string): Promise<PaymentRule | null> {
    const [row] = await this.db.select().from(paymentRules)
      .where(and(eq(paymentRules.id, id), eq(paymentRules.tenantId, tenantId)));
    return (row as any) || null;
  }

  async create(tenantId: string, data: CreatePaymentRuleDTO): Promise<PaymentRule> {
    const [row] = await this.db.insert(paymentRules).values({
      tenantId,
      name: data.name,
      trigger: data.trigger,
      daysOffset: data.daysOffset,
      channel: data.channel,
      template: data.template,
    }).returning();
    return row as any;
  }

  async update(id: string, tenantId: string, data: UpdatePaymentRuleDTO): Promise<PaymentRule | null> {
    const updateData: any = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.trigger !== undefined) updateData.trigger = data.trigger;
    if (data.daysOffset !== undefined) updateData.daysOffset = data.daysOffset;
    if (data.channel !== undefined) updateData.channel = data.channel;
    if (data.template !== undefined) updateData.template = data.template;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [row] = await this.db.update(paymentRules)
      .set(updateData)
      .where(and(eq(paymentRules.id, id), eq(paymentRules.tenantId, tenantId)))
      .returning();
    return (row as any) || null;
  }

  async remove(id: string, tenantId: string): Promise<boolean> {
    const [row] = await this.db.delete(paymentRules)
      .where(and(eq(paymentRules.id, id), eq(paymentRules.tenantId, tenantId)))
      .returning();
    return !!row;
  }
}
