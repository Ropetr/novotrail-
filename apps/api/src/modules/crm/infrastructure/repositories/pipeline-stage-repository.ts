import { eq, and, asc } from 'drizzle-orm';
import type { IPipelineStageRepository } from '../../domain/repositories';
import type { PipelineStage, CreatePipelineStageDTO, UpdatePipelineStageDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { crmPipelineStages } from '../schema';

export class PipelineStageRepository implements IPipelineStageRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string): Promise<PipelineStage[]> {
    const data = await this.db
      .select()
      .from(crmPipelineStages)
      .where(eq(crmPipelineStages.tenantId, tenantId))
      .orderBy(asc(crmPipelineStages.order));
    return data as unknown as PipelineStage[];
  }

  async getById(id: string, tenantId: string): Promise<PipelineStage | null> {
    const result = await this.db
      .select()
      .from(crmPipelineStages)
      .where(and(eq(crmPipelineStages.id, id), eq(crmPipelineStages.tenantId, tenantId)))
      .limit(1);
    return (result[0] as unknown as PipelineStage) || null;
  }

  async create(tenantId: string, data: CreatePipelineStageDTO): Promise<PipelineStage> {
    const result = await this.db
      .insert(crmPipelineStages)
      .values({
        tenantId,
        name: data.name,
        order: data.order,
        probability: data.probability ?? 0,
        color: data.color ?? '#6b7280',
        isDefault: false,
        isWon: data.isWon ?? false,
        isLost: data.isLost ?? false,
      })
      .returning();
    return result[0] as unknown as PipelineStage;
  }

  async update(id: string, tenantId: string, data: UpdatePipelineStageDTO): Promise<PipelineStage | null> {
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.order !== undefined) updates.order = data.order;
    if (data.probability !== undefined) updates.probability = data.probability;
    if (data.color !== undefined) updates.color = data.color;

    if (Object.keys(updates).length === 0) return this.getById(id, tenantId);

    const result = await this.db
      .update(crmPipelineStages)
      .set(updates)
      .where(and(eq(crmPipelineStages.id, id), eq(crmPipelineStages.tenantId, tenantId)))
      .returning();
    return (result[0] as unknown as PipelineStage) || null;
  }

  async remove(id: string, tenantId: string): Promise<boolean> {
    const result = await this.db
      .delete(crmPipelineStages)
      .where(and(eq(crmPipelineStages.id, id), eq(crmPipelineStages.tenantId, tenantId)))
      .returning();
    return result.length > 0;
  }

  /**
   * RN-01: Ao criar o tenant, 5 estágios são pré-cadastrados + Ganho/Perdido.
   * Prospecção (0%), Contato Inicial (20%), Proposta Enviada (40%),
   * Negociação (60%), Fechamento (90%), Ganho (100%), Perdido (0%).
   */
  async seedDefaults(tenantId: string): Promise<PipelineStage[]> {
    const existing = await this.list(tenantId);
    if (existing.length > 0) return existing;

    const defaults = [
      { name: 'Prospecção', order: 1, probability: 0, color: '#6b7280', isDefault: true, isWon: false, isLost: false },
      { name: 'Contato Inicial', order: 2, probability: 20, color: '#3b82f6', isDefault: true, isWon: false, isLost: false },
      { name: 'Proposta Enviada', order: 3, probability: 40, color: '#eab308', isDefault: true, isWon: false, isLost: false },
      { name: 'Negociação', order: 4, probability: 60, color: '#f97316', isDefault: true, isWon: false, isLost: false },
      { name: 'Fechamento', order: 5, probability: 90, color: '#8b5cf6', isDefault: true, isWon: false, isLost: false },
      { name: 'Ganho', order: 6, probability: 100, color: '#22c55e', isDefault: true, isWon: true, isLost: false },
      { name: 'Perdido', order: 7, probability: 0, color: '#ef4444', isDefault: true, isWon: false, isLost: true },
    ];

    const result = await this.db
      .insert(crmPipelineStages)
      .values(defaults.map((d) => ({ ...d, tenantId })))
      .returning();
    return result as unknown as PipelineStage[];
  }
}
