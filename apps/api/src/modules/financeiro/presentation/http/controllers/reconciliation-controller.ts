import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IReconciliationRepository, IFinancialLogRepository } from '../../../domain/repositories';
import { createReconciliationSchema, matchEntrySchema } from '../validators';
import { ok, fail } from '../../../../../shared/http/response';
import { parseOFX } from '../../../infrastructure/ofx-parser';

export class ReconciliationController {
  constructor(
    private reconRepo: IReconciliationRepository,
    private logRepo: IFinancialLogRepository,
  ) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const bankAccountId = c.req.query('bankAccountId');
      const data = await this.reconRepo.list(user.tenantId, bankAccountId || undefined);
      return ok(c, data);
    } catch (error: any) {
      return fail(c, error.message, 500);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const recon = await this.reconRepo.getById(id, user.tenantId);
      if (!recon) return fail(c, 'Reconciliation not found', 404);
      const entries = await this.reconRepo.getEntries(id, user.tenantId);
      return ok(c, { ...recon, entries });
    } catch (error: any) {
      return fail(c, error.message, 500);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createReconciliationSchema.parse(body);
      const recon = await this.reconRepo.create(user.tenantId, data);
      await this.logRepo.create(user.tenantId, user.id, 'bank_reconciliation', recon.id, 'create', `Period: ${data.periodStart} to ${data.periodEnd}`);
      return ok(c, recon, 201);
    } catch (error: any) {
      return fail(c, error.message, 400);
    }
  }

  async importOFX(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const recon = await this.reconRepo.getById(id, user.tenantId);
      if (!recon) return fail(c, 'Reconciliation not found', 404);
      if (recon.status === 'completed') return fail(c, 'Reconciliation already completed', 400);

      const body = await c.req.json();
      const ofxContent = body.ofxContent;
      if (!ofxContent || typeof ofxContent !== 'string') {
        return fail(c, 'ofxContent is required (string with OFX file content)', 400);
      }

      const transactions = parseOFX(ofxContent);
      if (transactions.length === 0) return fail(c, 'No transactions found in OFX content', 400);

      const entries = transactions.map(t => ({ ...t, amount: String(t.amount) }));
      const imported = await this.reconRepo.importEntries(id, user.tenantId, entries);
      await this.logRepo.create(user.tenantId, user.id, 'bank_reconciliation', id, 'update', `Imported ${imported} entries from OFX`);
      return ok(c, { message: `Imported ${imported} entries`, entries: transactions.length }, 201);
    } catch (error: any) {
      return fail(c, error.message, 400);
    }
  }

  async matchEntries(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const body = await c.req.json();

      // Support both single match and auto-match
      if (body.auto === true) {
        const matched = await this.reconRepo.autoMatch(id, user.tenantId);
        await this.logRepo.create(user.tenantId, user.id, 'bank_reconciliation', id, 'update', `Auto-matched ${matched} entries`);
        return ok(c, { message: `Auto-matched ${matched} entries`, matched });
      }

      const data = matchEntrySchema.parse(body);
      const entry = await this.reconRepo.matchEntry(data.entryId, user.tenantId, data.transactionId);
      if (!entry) return fail(c, 'Entry not found or already matched', 404);
      await this.logRepo.create(user.tenantId, user.id, 'bank_reconciliation', id, 'update', `Matched entry ${data.entryId} → transaction ${data.transactionId}`);
      return ok(c, entry);
    } catch (error: any) {
      return fail(c, error.message, 400);
    }
  }

  async finalize(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');
      const recon = await this.reconRepo.finalize(id, user.tenantId);
      if (!recon) return fail(c, 'Cannot finalize: there are pending entries', 400);
      await this.logRepo.create(user.tenantId, user.id, 'bank_reconciliation', id, 'update', 'Reconciliation completed');
      return ok(c, { ...recon, message: 'Reconciliation completed' });
    } catch (error: any) {
      return fail(c, error.message, 500);
    }
  }
}
