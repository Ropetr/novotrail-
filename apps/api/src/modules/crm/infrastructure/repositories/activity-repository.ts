import { eq, and, desc, isNull } from 'drizzle-orm';
import type { IActivityRepository } from '../../domain/repositories';
import type { Activity, CreateActivityDTO, UpdateActivityDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { crmActivities, crmOpportunities } from '../schema';

export class ActivityRepository implements IActivityRepository {
  constructor(private db: DatabaseConnection) {}

  async listByOpportunity(opportunityId: string, tenantId: string): Promise<Activity[]> {
    const data = await this.db
      .select()
      .from(crmActivities)
      .where(and(
        eq(crmActivities.opportunityId, opportunityId),
        eq(crmActivities.tenantId, tenantId)
      ))
      .orderBy(desc(crmActivities.createdAt));
    return data as unknown as Activity[];
  }

  async listByClient(clientId: string, tenantId: string): Promise<Activity[]> {
    const data = await this.db
      .select()
      .from(crmActivities)
      .where(and(
        eq(crmActivities.clientId, clientId),
        eq(crmActivities.tenantId, tenantId)
      ))
      .orderBy(desc(crmActivities.createdAt));
    return data as unknown as Activity[];
  }

  async listPending(tenantId: string, userId?: string): Promise<Activity[]> {
    const conditions: any[] = [
      eq(crmActivities.tenantId, tenantId),
      eq(crmActivities.status, 'pending'),
    ];
    if (userId) conditions.push(eq(crmActivities.userId, userId));

    const data = await this.db
      .select()
      .from(crmActivities)
      .where(and(...conditions))
      .orderBy(crmActivities.scheduledAt);
    return data as unknown as Activity[];
  }

  async getById(id: string, tenantId: string): Promise<Activity | null> {
    const result = await this.db
      .select()
      .from(crmActivities)
      .where(and(eq(crmActivities.id, id), eq(crmActivities.tenantId, tenantId)))
      .limit(1);
    return (result[0] as unknown as Activity) || null;
  }

  async create(tenantId: string, data: CreateActivityDTO): Promise<Activity> {
    const result = await this.db
      .insert(crmActivities)
      .values({
        tenantId,
        opportunityId: data.opportunityId,
        clientId: data.clientId,
        type: data.type,
        title: data.title,
        description: data.description,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        userId: data.userId,
        status: 'pending',
      })
      .returning();

    // Update lastActivityAt on opportunity
    if (data.opportunityId) {
      await this.db
        .update(crmOpportunities)
        .set({ lastActivityAt: new Date() })
        .where(eq(crmOpportunities.id, data.opportunityId));
    }

    return result[0] as unknown as Activity;
  }

  async update(id: string, tenantId: string, data: UpdateActivityDTO): Promise<Activity | null> {
    const updates: Record<string, unknown> = {};
    if (data.type !== undefined) updates.type = data.type;
    if (data.title !== undefined) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description;
    if (data.scheduledAt !== undefined) updates.scheduledAt = new Date(data.scheduledAt);
    if (data.status !== undefined) updates.status = data.status;
    if (data.result !== undefined) updates.result = data.result;

    if (Object.keys(updates).length === 0) return this.getById(id, tenantId);

    const result = await this.db
      .update(crmActivities)
      .set(updates)
      .where(and(eq(crmActivities.id, id), eq(crmActivities.tenantId, tenantId)))
      .returning();
    return (result[0] as unknown as Activity) || null;
  }

  async complete(id: string, tenantId: string, result?: string): Promise<Activity | null> {
    const updated = await this.db
      .update(crmActivities)
      .set({
        status: 'completed',
        completedAt: new Date(),
        result: result || undefined,
      })
      .where(and(eq(crmActivities.id, id), eq(crmActivities.tenantId, tenantId)))
      .returning();

    if (!updated[0]) return null;

    // Update lastActivityAt on opportunity
    const activity = updated[0];
    if (activity.opportunityId) {
      await this.db
        .update(crmOpportunities)
        .set({ lastActivityAt: new Date() })
        .where(eq(crmOpportunities.id, activity.opportunityId));
    }

    return updated[0] as unknown as Activity;
  }

  async remove(id: string, tenantId: string): Promise<boolean> {
    const result = await this.db
      .delete(crmActivities)
      .where(and(eq(crmActivities.id, id), eq(crmActivities.tenantId, tenantId)))
      .returning();
    return result.length > 0;
  }
}
