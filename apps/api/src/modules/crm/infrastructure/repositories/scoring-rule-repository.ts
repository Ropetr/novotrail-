import { eq, and } from 'drizzle-orm';
import type { IScoringRuleRepository } from '../../domain/repositories';
import type { ScoringRule, CreateScoringRuleDTO, UpdateScoringRuleDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { crmScoringRules } from '../schema';

export class ScoringRuleRepository implements IScoringRuleRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string): Promise<ScoringRule[]> {
    const data = await this.db
      .select()
      .from(crmScoringRules)
      .where(eq(crmScoringRules.tenantId, tenantId));
    return data as unknown as ScoringRule[];
  }

  async getById(id: string, tenantId: string): Promise<ScoringRule | null> {
    const result = await this.db
      .select()
      .from(crmScoringRules)
      .where(and(eq(crmScoringRules.id, id), eq(crmScoringRules.tenantId, tenantId)))
      .limit(1);
    return (result[0] as unknown as ScoringRule) || null;
  }

  async create(tenantId: string, data: CreateScoringRuleDTO): Promise<ScoringRule> {
    const result = await this.db
      .insert(crmScoringRules)
      .values({
        tenantId,
        name: data.name,
        description: data.description,
        ruleType: data.ruleType,
        condition: data.condition,
        points: data.points,
      })
      .returning();
    return result[0] as unknown as ScoringRule;
  }

  async update(id: string, tenantId: string, data: UpdateScoringRuleDTO): Promise<ScoringRule | null> {
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.condition !== undefined) updates.condition = data.condition;
    if (data.points !== undefined) updates.points = data.points;
    if (data.isActive !== undefined) updates.isActive = data.isActive;

    if (Object.keys(updates).length === 0) return this.getById(id, tenantId);

    const result = await this.db
      .update(crmScoringRules)
      .set(updates)
      .where(and(eq(crmScoringRules.id, id), eq(crmScoringRules.tenantId, tenantId)))
      .returning();
    return (result[0] as unknown as ScoringRule) || null;
  }

  async remove(id: string, tenantId: string): Promise<boolean> {
    const result = await this.db
      .delete(crmScoringRules)
      .where(and(eq(crmScoringRules.id, id), eq(crmScoringRules.tenantId, tenantId)))
      .returning();
    return result.length > 0;
  }

  /**
   * RN-04: Regras padrão pré-cadastradas por tenant.
   * +30pts compra mensal recorrente, +20pts volume acima de R$5.000/mês,
   * -20pts título vencido, -40pts inativo há 90+ dias.
   */
  async seedDefaults(tenantId: string): Promise<ScoringRule[]> {
    const existing = await this.list(tenantId);
    if (existing.length > 0) return existing;

    const defaults = [
      {
        name: 'Compra mensal recorrente',
        description: 'Cliente com compras em pelo menos 3 dos últimos 6 meses',
        ruleType: 'purchase_frequency' as const,
        condition: JSON.stringify({ minMonths: 3, periodMonths: 6 }),
        points: 30,
      },
      {
        name: 'Volume acima de R$ 5.000/mês',
        description: 'Média de compras acima de R$ 5.000 por mês nos últimos 3 meses',
        ruleType: 'purchase_volume' as const,
        condition: JSON.stringify({ minAmount: 5000, periodMonths: 3 }),
        points: 20,
      },
      {
        name: 'Título vencido',
        description: 'Cliente com títulos financeiros em atraso',
        ruleType: 'overdue_payment' as const,
        condition: JSON.stringify({ hasOverdue: true }),
        points: -20,
      },
      {
        name: 'Inativo há 90+ dias',
        description: 'Nenhuma compra nos últimos 90 dias',
        ruleType: 'inactivity' as const,
        condition: JSON.stringify({ inactiveDays: 90 }),
        points: -40,
      },
    ];

    const result = await this.db
      .insert(crmScoringRules)
      .values(defaults.map((d) => ({ ...d, tenantId })))
      .returning();
    return result as unknown as ScoringRule[];
  }
}
