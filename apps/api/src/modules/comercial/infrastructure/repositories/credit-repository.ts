import { eq, and, sql } from 'drizzle-orm';
import type {
  ICreditRepository,
} from '../../domain/repositories';
import type {
  ClientCredit,
  ClientCreditSummary,
  CreateCreditDTO,
  UseCreditDTO,
} from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { clientCredits, clientCreditMovements } from '../schema';

export class CreditRepository implements ICreditRepository {
  constructor(private db: DatabaseConnection) {}

  async listByClient(clientId: string, tenantId: string): Promise<ClientCredit[]> {
    const data = await this.db
      .select()
      .from(clientCredits)
      .where(
        and(
          eq(clientCredits.clientId, clientId),
          eq(clientCredits.tenantId, tenantId)
        )
      )
      .orderBy(clientCredits.createdAt);

    return data as unknown as ClientCredit[];
  }

  async getById(id: string, tenantId: string): Promise<ClientCredit | null> {
    const result = await this.db
      .select()
      .from(clientCredits)
      .where(
        and(
          eq(clientCredits.id, id),
          eq(clientCredits.tenantId, tenantId)
        )
      )
      .limit(1);

    return (result[0] as unknown as ClientCredit) ?? null;
  }

  async getSummary(clientId: string, tenantId: string): Promise<ClientCreditSummary> {
    // Active credits
    const credits = await this.db
      .select()
      .from(clientCredits)
      .where(
        and(
          eq(clientCredits.clientId, clientId),
          eq(clientCredits.tenantId, tenantId),
          eq(clientCredits.status, 'active')
        )
      )
      .orderBy(clientCredits.expiresAt);

    // Total balance
    const totalBalance = credits.reduce(
      (sum, c) => sum + Number(c.balance),
      0
    );

    // Recent movements (last 20)
    const allCreditIds = credits.map(c => c.id);
    let recentMovements: any[] = [];

    if (allCreditIds.length > 0) {
      // Get movements for all active credits
      for (const creditId of allCreditIds.slice(0, 10)) {
        const movements = await this.db
          .select()
          .from(clientCreditMovements)
          .where(eq(clientCreditMovements.creditId, creditId))
          .limit(5);
        recentMovements.push(...movements);
      }
      // Sort by date desc
      recentMovements.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      recentMovements = recentMovements.slice(0, 20);
    }

    return {
      totalBalance,
      credits: credits as unknown as ClientCredit[],
      recentMovements: recentMovements as any[],
    };
  }

  async create(tenantId: string, data: CreateCreditDTO): Promise<ClientCredit> {
    const id = crypto.randomUUID();

    // Default expiry: 1 year
    const defaultExpiry = new Date();
    defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);

    const newCredit = {
      id,
      tenantId,
      clientId: data.clientId,
      origin: data.origin,
      originId: data.originId ?? null,
      description: data.description ?? null,
      originalAmount: data.amount,
      usedAmount: 0,
      balance: data.amount,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : defaultExpiry,
      status: 'active' as const,
      notes: data.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(clientCredits).values(newCredit as any);

    return newCredit as any;
  }

  async use(id: string, tenantId: string, data: UseCreditDTO): Promise<ClientCredit> {
    const credit = await this.getById(id, tenantId);
    if (!credit) throw new Error('Credit not found');
    if (credit.status !== 'active') throw new Error('Credit is not active');

    const balance = Number(credit.balance);
    if (data.amount > balance) throw new Error('Insufficient credit balance');

    // Check expiry
    if (credit.expiresAt && new Date(credit.expiresAt) < new Date()) {
      await this.db
        .update(clientCredits)
        .set({ status: 'expired', updatedAt: new Date() })
        .where(eq(clientCredits.id, id));
      throw new Error('Credit has expired');
    }

    const newBalance = balance - data.amount;
    const newStatus = newBalance <= 0 ? 'used' : 'active';

    await this.db
      .update(clientCredits)
      .set({
        usedAmount: sql`${clientCredits.usedAmount} + ${data.amount}`,
        balance: String(newBalance),
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(clientCredits.id, id));

    // Record movement
    await this.db.insert(clientCreditMovements).values({
      id: crypto.randomUUID(),
      creditId: id,
      type: 'use',
      amount: data.amount,
      saleId: data.saleId ?? null,
      deliveryId: data.deliveryId ?? null,
      notes: data.notes ?? null,
      createdAt: new Date(),
    } as any);

    const updated = await this.getById(id, tenantId);
    if (!updated) throw new Error('Credit not found after use');
    return updated;
  }

  async cancel(id: string, tenantId: string): Promise<ClientCredit> {
    const credit = await this.getById(id, tenantId);
    if (!credit) throw new Error('Credit not found');
    if (credit.status !== 'active') throw new Error('Only active credits can be cancelled');
    if (Number(credit.usedAmount) > 0) throw new Error('Credit has been partially used');

    await this.db
      .update(clientCredits)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(clientCredits.id, id));

    const updated = await this.getById(id, tenantId);
    if (!updated) throw new Error('Credit not found after cancellation');
    return updated;
  }
}
