import type { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import { ok, fail } from '../../../../../shared/http/response';
import type { IFinancialTransactionRepository, IFinancialLogRepository } from '../../../domain/repositories';
import { createTransactionSchema, createTransferSchema } from '../validators';

export class FinancialTransactionController {
  constructor(
    private transactionRepo: IFinancialTransactionRepository,
    private logRepo: IFinancialLogRepository,
  ) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = c.req.query();
      const { data, total } = await this.transactionRepo.list(user.tenantId, {
        bankAccountId: query.bankAccountId,
        type: query.type,
        startDate: query.startDate,
        endDate: query.endDate,
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 20,
      });
      const page = query.page ? Number(query.page) : 1;
      const limit = query.limit ? Number(query.limit) : 20;
      return ok(c, data, 200, {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list transactions', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createTransactionSchema.parse(body);
      const transaction = await this.transactionRepo.create(user.tenantId, data);
      await this.logRepo.create(user.tenantId, user.id, 'financial_transactions', transaction.id, 'create',
        `${data.type}: R$${data.value} - ${data.description || 'Manual'}`);
      return ok(c, transaction, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create transaction', 400);
    }
  }

  /**
   * Transferência entre contas bancárias
   * Gera 2 movimentações: transfer_out na origem + transfer_in no destino
   */
  async transfer(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createTransferSchema.parse(body);

      if (data.fromBankAccountId === data.toBankAccountId) {
        return fail(c, 'Cannot transfer to the same account', 422);
      }

      const desc = data.description || 'Transferência entre contas';

      // 1. Saída na conta origem
      const outTransaction = await this.transactionRepo.create(user.tenantId, {
        bankAccountId: data.fromBankAccountId,
        type: 'transfer_out',
        value: data.value,
        description: desc,
        occurredAt: data.occurredAt,
      });

      // 2. Entrada na conta destino (com referência cruzada)
      const inTransaction = await this.transactionRepo.create(user.tenantId, {
        bankAccountId: data.toBankAccountId,
        type: 'transfer_in',
        value: data.value,
        description: desc,
        referenceId: outTransaction.id,
        referenceType: 'transfer',
        occurredAt: data.occurredAt,
      });

      // Logs
      await this.logRepo.create(user.tenantId, user.id, 'financial_transactions', outTransaction.id, 'create',
        `Transfer out: R$${data.value} to account ${data.toBankAccountId}`);
      await this.logRepo.create(user.tenantId, user.id, 'financial_transactions', inTransaction.id, 'create',
        `Transfer in: R$${data.value} from account ${data.fromBankAccountId}`);

      return ok(c, {
        outTransaction,
        inTransaction,
        message: `Transferred R$${data.value}`,
      }, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to transfer', 400);
    }
  }
}
