import { eq, and, or, like, sql, desc } from 'drizzle-orm';
import type { IOpportunityRepository, ListResult } from '../../domain/repositories';
import type {
  Opportunity,
  CreateOpportunityDTO,
  UpdateOpportunityDTO,
  PipelineSummary,
} from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import type { PaginationInput } from '@trailsystem/types';
import { crmOpportunities, crmPipelineStages, crmActivities } from '../schema';
import { clients } from '../../../cadastros/infrastructure/schema';
import { employees } from '../../../cadastros/infrastructure/schema';

export class OpportunityRepository implements IOpportunityRepository {
  constructor(private db: DatabaseConnection) {}

  async list(
    tenantId: string,
    params: PaginationInput & { stageId?: string; sellerId?: string; status?: string }
  ): Promise<ListResult<Opportunity>> {
    const { page, limit, search, stageId, sellerId, status } = params;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(crmOpportunities.tenantId, tenantId)];

    if (stageId) conditions.push(eq(crmOpportunities.stageId, stageId));
    if (sellerId) conditions.push(eq(crmOpportunities.sellerId, sellerId));
    if (status) conditions.push(eq(crmOpportunities.status, status as any));
    if (search) {
      conditions.push(
        or(
          like(crmOpportunities.title, `%${search}%`),
          like(crmOpportunities.contactName, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

    const [data, countResult] = await Promise.all([
      this.db
        .select({
          id: crmOpportunities.id,
          tenantId: crmOpportunities.tenantId,
          title: crmOpportunities.title,
          clientId: crmOpportunities.clientId,
          clientName: clients.name,
          contactName: crmOpportunities.contactName,
          contactPhone: crmOpportunities.contactPhone,
          contactEmail: crmOpportunities.contactEmail,
          sellerId: crmOpportunities.sellerId,
          sellerName: employees.name,
          stageId: crmOpportunities.stageId,
          stageName: crmPipelineStages.name,
          status: crmOpportunities.status,
          estimatedValue: crmOpportunities.estimatedValue,
          probability: crmOpportunities.probability,
          expectedCloseDate: crmOpportunities.expectedCloseDate,
          actualCloseDate: crmOpportunities.actualCloseDate,
          source: crmOpportunities.source,
          sourceDetail: crmOpportunities.sourceDetail,
          lossReason: crmOpportunities.lossReason,
          tags: crmOpportunities.tags,
          notes: crmOpportunities.notes,
          lastActivityAt: crmOpportunities.lastActivityAt,
          createdAt: crmOpportunities.createdAt,
          updatedAt: crmOpportunities.updatedAt,
        })
        .from(crmOpportunities)
        .leftJoin(clients, eq(crmOpportunities.clientId, clients.id))
        .leftJoin(employees, eq(crmOpportunities.sellerId, employees.id))
        .leftJoin(crmPipelineStages, eq(crmOpportunities.stageId, crmPipelineStages.id))
        .where(whereClause)
        .orderBy(desc(crmOpportunities.updatedAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(crmOpportunities)
        .where(whereClause),
    ]);

    return {
      data: data as unknown as Opportunity[],
      total: Number(countResult[0].count),
    };
  }

  async getById(id: string, tenantId: string): Promise<Opportunity | null> {
    const result = await this.db
      .select({
        id: crmOpportunities.id,
        tenantId: crmOpportunities.tenantId,
        title: crmOpportunities.title,
        clientId: crmOpportunities.clientId,
        clientName: clients.name,
        contactName: crmOpportunities.contactName,
        contactPhone: crmOpportunities.contactPhone,
        contactEmail: crmOpportunities.contactEmail,
        sellerId: crmOpportunities.sellerId,
        sellerName: employees.name,
        stageId: crmOpportunities.stageId,
        stageName: crmPipelineStages.name,
        status: crmOpportunities.status,
        estimatedValue: crmOpportunities.estimatedValue,
        probability: crmOpportunities.probability,
        expectedCloseDate: crmOpportunities.expectedCloseDate,
        actualCloseDate: crmOpportunities.actualCloseDate,
        source: crmOpportunities.source,
        sourceDetail: crmOpportunities.sourceDetail,
        lossReason: crmOpportunities.lossReason,
        tags: crmOpportunities.tags,
        notes: crmOpportunities.notes,
        lastActivityAt: crmOpportunities.lastActivityAt,
        createdAt: crmOpportunities.createdAt,
        updatedAt: crmOpportunities.updatedAt,
      })
      .from(crmOpportunities)
      .leftJoin(clients, eq(crmOpportunities.clientId, clients.id))
      .leftJoin(employees, eq(crmOpportunities.sellerId, employees.id))
      .leftJoin(crmPipelineStages, eq(crmOpportunities.stageId, crmPipelineStages.id))
      .where(and(eq(crmOpportunities.id, id), eq(crmOpportunities.tenantId, tenantId)))
      .limit(1);

    return (result[0] as unknown as Opportunity) || null;
  }

  async create(tenantId: string, data: CreateOpportunityDTO): Promise<Opportunity> {
    const result = await this.db
      .insert(crmOpportunities)
      .values({
        tenantId,
        title: data.title,
        clientId: data.clientId,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        sellerId: data.sellerId,
        stageId: data.stageId,
        estimatedValue: String(data.estimatedValue || 0),
        probability: data.probability || 0,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : undefined,
        source: data.source,
        sourceDetail: data.sourceDetail,
        tags: data.tags,
        notes: data.notes,
      })
      .returning();

    return this.getById(result[0].id, tenantId) as Promise<Opportunity>;
  }

  async update(id: string, tenantId: string, data: UpdateOpportunityDTO): Promise<Opportunity | null> {
    const updates: Record<string, unknown> = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.clientId !== undefined) updates.clientId = data.clientId;
    if (data.contactName !== undefined) updates.contactName = data.contactName;
    if (data.contactPhone !== undefined) updates.contactPhone = data.contactPhone;
    if (data.contactEmail !== undefined) updates.contactEmail = data.contactEmail;
    if (data.sellerId !== undefined) updates.sellerId = data.sellerId;
    if (data.stageId !== undefined) updates.stageId = data.stageId;
    if (data.status !== undefined) updates.status = data.status;
    if (data.estimatedValue !== undefined) updates.estimatedValue = String(data.estimatedValue);
    if (data.probability !== undefined) updates.probability = data.probability;
    if (data.expectedCloseDate !== undefined) updates.expectedCloseDate = new Date(data.expectedCloseDate);
    if (data.actualCloseDate !== undefined) updates.actualCloseDate = new Date(data.actualCloseDate);
    if (data.source !== undefined) updates.source = data.source;
    if (data.sourceDetail !== undefined) updates.sourceDetail = data.sourceDetail;
    if (data.lossReason !== undefined) updates.lossReason = data.lossReason;
    if (data.tags !== undefined) updates.tags = data.tags;
    if (data.notes !== undefined) updates.notes = data.notes;

    if (Object.keys(updates).length === 0) return this.getById(id, tenantId);

    const result = await this.db
      .update(crmOpportunities)
      .set(updates)
      .where(and(eq(crmOpportunities.id, id), eq(crmOpportunities.tenantId, tenantId)))
      .returning();

    if (!result[0]) return null;
    return this.getById(id, tenantId);
  }

  async remove(id: string, tenantId: string): Promise<boolean> {
    const result = await this.db
      .delete(crmOpportunities)
      .where(and(eq(crmOpportunities.id, id), eq(crmOpportunities.tenantId, tenantId)))
      .returning();
    return result.length > 0;
  }

  /**
   * RN-02: Mover oportunidade entre estágios gera atividade automática.
   * Se movido para estágio is_won, preenche actual_close_date.
   */
  async moveStage(id: string, tenantId: string, stageId: string): Promise<Opportunity | null> {
    // Get the target stage to check if won/lost
    const stageResult = await this.db
      .select()
      .from(crmPipelineStages)
      .where(and(eq(crmPipelineStages.id, stageId), eq(crmPipelineStages.tenantId, tenantId)))
      .limit(1);

    const targetStage = stageResult[0];
    if (!targetStage) return null;

    // Get current opportunity to know old stage
    const current = await this.getById(id, tenantId);
    if (!current) return null;

    const updates: Record<string, unknown> = {
      stageId,
      probability: targetStage.probability,
    };

    if (targetStage.isWon) {
      updates.status = 'won';
      updates.actualCloseDate = new Date();
    } else if (targetStage.isLost) {
      updates.status = 'lost';
      updates.actualCloseDate = new Date();
    } else {
      updates.status = 'open';
    }

    await this.db
      .update(crmOpportunities)
      .set(updates)
      .where(and(eq(crmOpportunities.id, id), eq(crmOpportunities.tenantId, tenantId)));

    // RN-02: Auto-create note activity for stage change
    await this.db.insert(crmActivities).values({
      tenantId,
      opportunityId: id,
      clientId: current.clientId,
      type: 'note',
      title: `Movido de "${current.stageName || 'Desconhecido'}" para "${targetStage.name}"`,
      status: 'completed',
      completedAt: new Date(),
    });

    // Update lastActivityAt
    await this.db
      .update(crmOpportunities)
      .set({ lastActivityAt: new Date() })
      .where(eq(crmOpportunities.id, id));

    return this.getById(id, tenantId);
  }

  async markWon(id: string, tenantId: string): Promise<Opportunity | null> {
    // Find the "Ganho" stage
    const wonStage = await this.db
      .select()
      .from(crmPipelineStages)
      .where(and(eq(crmPipelineStages.tenantId, tenantId), eq(crmPipelineStages.isWon, true)))
      .limit(1);

    if (!wonStage[0]) return null;
    return this.moveStage(id, tenantId, wonStage[0].id);
  }

  async markLost(id: string, tenantId: string, lossReason: string): Promise<Opportunity | null> {
    // Find the "Perdido" stage
    const lostStage = await this.db
      .select()
      .from(crmPipelineStages)
      .where(and(eq(crmPipelineStages.tenantId, tenantId), eq(crmPipelineStages.isLost, true)))
      .limit(1);

    if (!lostStage[0]) return null;

    await this.db
      .update(crmOpportunities)
      .set({ lossReason })
      .where(and(eq(crmOpportunities.id, id), eq(crmOpportunities.tenantId, tenantId)));

    return this.moveStage(id, tenantId, lostStage[0].id);
  }

  async getPipelineSummary(tenantId: string): Promise<PipelineSummary> {
    const stages = await this.db
      .select()
      .from(crmPipelineStages)
      .where(eq(crmPipelineStages.tenantId, tenantId));

    const opps = await this.db
      .select({
        stageId: crmOpportunities.stageId,
        status: crmOpportunities.status,
        estimatedValue: crmOpportunities.estimatedValue,
        probability: crmOpportunities.probability,
      })
      .from(crmOpportunities)
      .where(eq(crmOpportunities.tenantId, tenantId));

    const stageMap = new Map(stages.map((s) => [s.id, s]));

    let totalOpportunities = 0;
    let totalValue = 0;
    let weightedValue = 0;
    let wonCount = 0;
    let wonValue = 0;
    let lostCount = 0;
    let lostValue = 0;

    const byStageMap = new Map<string, { count: number; value: number }>();

    for (const opp of opps) {
      const val = Number(opp.estimatedValue || 0);
      const prob = Number(opp.probability || 0);
      totalOpportunities++;
      totalValue += val;
      weightedValue += val * (prob / 100);

      if (opp.status === 'won') { wonCount++; wonValue += val; }
      if (opp.status === 'lost') { lostCount++; lostValue += val; }

      const current = byStageMap.get(opp.stageId) || { count: 0, value: 0 };
      current.count++;
      current.value += val;
      byStageMap.set(opp.stageId, current);
    }

    const byStage = stages.map((s) => {
      const data = byStageMap.get(s.id) || { count: 0, value: 0 };
      return {
        stageId: s.id,
        stageName: s.name,
        stageColor: s.color,
        stageOrder: s.order,
        count: data.count,
        value: data.value,
      };
    }).sort((a, b) => a.stageOrder - b.stageOrder);

    return {
      totalOpportunities,
      totalValue,
      weightedValue,
      byStage,
      wonCount,
      wonValue,
      lostCount,
      lostValue,
    };
  }
}
