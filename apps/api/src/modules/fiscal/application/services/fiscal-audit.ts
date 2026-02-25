/**
 * Fiscal Audit Service
 * Registra todas as operações fiscais para rastreabilidade e compliance.
 */
import { eq } from 'drizzle-orm';
import { fiscalAuditLogs } from '../../infrastructure/schemas/fiscal-config';

type AuditAction = typeof fiscalAuditLogs.$inferInsert['action'];
type DocumentType = typeof fiscalAuditLogs.$inferInsert['documentType'];

interface AuditEntry {
  tenantId: string;
  userId?: string;
  action: AuditAction;
  documentType?: DocumentType;
  documentId?: string;
  chaveAcesso?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export class FiscalAuditService {
  constructor(private db: any) {}

  /**
   * Registra uma entrada de auditoria fiscal
   */
  async registrar(entry: AuditEntry): Promise<void> {
    try {
      await this.db.insert(fiscalAuditLogs).values({
        tenantId: entry.tenantId,
        userId: entry.userId,
        action: entry.action,
        documentType: entry.documentType,
        documentId: entry.documentId,
        chaveAcesso: entry.chaveAcesso,
        details: entry.details,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      });
    } catch (error) {
      // Auditoria nunca deve impedir a operação principal
      console.error('[FiscalAudit] Erro ao registrar auditoria:', error);
    }
  }

  /**
   * Consulta logs de auditoria por tenant
   */
  async consultarPorTenant(
    tenantId: string,
    filtros?: {
      action?: AuditAction;
      documentType?: DocumentType;
      dataInicio?: Date;
      dataFim?: Date;
      limit?: number;
      offset?: number;
    }
  ) {
    const conditions = [eq(fiscalAuditLogs.tenantId, tenantId)];

    // Filtros adicionais serão aplicados via query builder
    const query = this.db
      .select()
      .from(fiscalAuditLogs)
      .where(eq(fiscalAuditLogs.tenantId, tenantId))
      .orderBy(fiscalAuditLogs.createdAt)
      .limit(filtros?.limit || 50)
      .offset(filtros?.offset || 0);

    return query;
  }

  /**
   * Consulta logs de auditoria por documento
   */
  async consultarPorDocumento(tenantId: string, documentId: string) {
    return this.db
      .select()
      .from(fiscalAuditLogs)
      .where(eq(fiscalAuditLogs.tenantId, tenantId))
      .where(eq(fiscalAuditLogs.documentId, documentId))
      .orderBy(fiscalAuditLogs.createdAt);
  }

  /**
   * Consulta logs de auditoria por chave de acesso
   */
  async consultarPorChaveAcesso(tenantId: string, chaveAcesso: string) {
    return this.db
      .select()
      .from(fiscalAuditLogs)
      .where(eq(fiscalAuditLogs.tenantId, tenantId))
      .where(eq(fiscalAuditLogs.chaveAcesso, chaveAcesso))
      .orderBy(fiscalAuditLogs.createdAt);
  }

  // ============================================
  // Helpers para operações comuns
  // ============================================

  async registrarEmissao(
    tenantId: string,
    userId: string,
    tipo: 'nfe' | 'nfse' | 'cte' | 'nfce',
    documentId: string,
    chaveAcesso?: string,
    details?: Record<string, unknown>
  ) {
    const actionMap = {
      nfe: 'nfe_emitida' as const,
      nfse: 'nfse_emitida' as const,
      cte: 'cte_emitido' as const,
      nfce: 'nfe_emitida' as const,
    };

    await this.registrar({
      tenantId,
      userId,
      action: actionMap[tipo],
      documentType: tipo === 'nfce' ? 'nfe' : tipo,
      documentId,
      chaveAcesso,
      details,
    });
  }

  async registrarCancelamento(
    tenantId: string,
    userId: string,
    tipo: 'nfe' | 'nfse' | 'cte',
    documentId: string,
    chaveAcesso: string,
    justificativa: string
  ) {
    const actionMap = {
      nfe: 'nfe_cancelada' as const,
      nfse: 'nfse_cancelada' as const,
      cte: 'cte_cancelado' as const,
    };

    await this.registrar({
      tenantId,
      userId,
      action: actionMap[tipo],
      documentType: tipo,
      documentId,
      chaveAcesso,
      details: { justificativa },
    });
  }

  async registrarCaptura(
    tenantId: string,
    documentId: string,
    chaveAcesso: string,
    origem: string
  ) {
    await this.registrar({
      tenantId,
      action: 'dfe_capturado',
      documentType: 'nfe',
      documentId,
      chaveAcesso,
      details: { origem },
    });
  }

  async registrarManifestacao(
    tenantId: string,
    userId: string,
    documentId: string,
    chaveAcesso: string,
    tipoManifestacao: string,
    automatica: boolean
  ) {
    await this.registrar({
      tenantId,
      userId,
      action: 'dfe_manifestado',
      documentType: 'nfe',
      documentId,
      chaveAcesso,
      details: { tipoManifestacao, automatica },
    });
  }

  async registrarLancamento(
    tenantId: string,
    userId: string,
    documentId: string,
    chaveAcesso: string,
    details?: Record<string, unknown>
  ) {
    await this.registrar({
      tenantId,
      userId,
      action: 'dfe_lancado',
      documentType: 'nfe',
      documentId,
      chaveAcesso,
      details,
    });
  }

  async registrarGNRE(
    tenantId: string,
    userId: string,
    action: 'gnre_gerada' | 'gnre_paga',
    documentId: string,
    details?: Record<string, unknown>
  ) {
    await this.registrar({
      tenantId,
      userId,
      action,
      documentType: 'gnre',
      documentId,
      details,
    });
  }

  async registrarADRCST(
    tenantId: string,
    userId: string,
    documentId: string,
    details?: Record<string, unknown>
  ) {
    await this.registrar({
      tenantId,
      userId,
      action: 'adrcst_gerado',
      documentType: 'adrcst',
      documentId,
      details,
    });
  }
}
