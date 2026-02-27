import type { IFiscalAuditLogRepository } from '../../domain/repositories';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { fiscalAuditLog } from '../schema';

export class FiscalAuditLogRepository implements IFiscalAuditLogRepository {
  constructor(private db: DatabaseConnection) {}

  async log(
    tenantId: string,
    userId: string | null,
    action: string,
    entityType?: string,
    entityId?: string,
    details?: any,
    ipAddress?: string,
  ): Promise<void> {
    await this.db.insert(fiscalAuditLog).values({
      id: crypto.randomUUID(),
      tenantId,
      userId,
      action,
      entityType: entityType || null,
      entityId: entityId || null,
      details: details || null,
      ipAddress: ipAddress || null,
      createdAt: new Date(),
    } as any);
  }
}
