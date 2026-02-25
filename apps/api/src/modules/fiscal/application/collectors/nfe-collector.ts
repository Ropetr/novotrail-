/**
 * NF-e Collector
 * Busca NF-e recebidas via Distribuição DF-e da Nuvem Fiscal.
 * Fluxo: Solicitar distribuição → Listar documentos → Processar → Armazenar
 */
import { eq, and, desc } from 'drizzle-orm';
import { dfeInboxDocuments, dfeInboxItems, dfeProcessingQueue } from '../../infrastructure/schemas/dfe-inbox';
import { fiscalSettings, trustedSuppliers } from '../../infrastructure/schemas/fiscal-config';
import { FiscalAuditService } from '../services/fiscal-audit';
import { RetryService } from '../services/retry-service';
import { ProductMatchingService } from '../services/product-matching';
import type { NuvemFiscalService } from '../../infrastructure/nuvem-fiscal/service';
import type { ApiResponse } from '../../infrastructure/nuvem-fiscal/types';

// Tipos de resposta da Distribuição DF-e
interface DistribuicaoNFeDocumento {
  id: string;
  created_at: string;
  tipo_documento: string; // 'nfe' | 'resumo'
  chave: string; // chave de acesso 44 dígitos
  cnpj_destinatario: string;
  nome_emitente: string;
  cnpj_emitente: string;
  inscricao_estadual_emitente?: string;
  data_emissao: string;
  tipo_operacao: string;
  valor_total: number;
  situacao: string;
  manifestacao?: string;
  nsu: string;
  xml_disponivel: boolean;
}

interface DistribuicaoListResponse {
  data: DistribuicaoNFeDocumento[];
  count: number;
  $offset?: number;
  $limit?: number;
}

export class NFeCollector {
  private retryService: RetryService;

  constructor(
    private db: any,
    private nuvemFiscalService: NuvemFiscalService,
    private auditService: FiscalAuditService,
    private matchingService: ProductMatchingService
  ) {
    this.retryService = new RetryService();
  }

  /**
   * Executa o ciclo completo de captura de NF-e recebidas
   */
  async executarCaptura(tenantId: string, cnpjEmpresa: string): Promise<{
    sucesso: boolean;
    novosDocumentos: number;
    erros: string[];
  }> {
    const erros: string[] = [];
    let novosDocumentos = 0;

    try {
      // 1. Solicitar nova distribuição na SEFAZ
      const distResult = await this.retryService.executeWithRetry(
        () => this.nuvemFiscalService.client.post<any>('/distribuicao/nfe', {
          cpf_cnpj: cnpjEmpresa,
        }),
        { maxRetries: 3 },
        'nuvem_fiscal_distribuicao'
      );

      if (!distResult.success) {
        erros.push(`Erro ao solicitar distribuição: ${distResult.error}`);
      }

      // 2. Listar documentos recebidos (paginado)
      let offset = 0;
      const limit = 50;
      let hasMore = true;

      while (hasMore) {
        const docsResult = await this.retryService.executeWithRetry(
          () => this.nuvemFiscalService.client.get<DistribuicaoListResponse>(
            '/distribuicao/nfe/documentos',
            {
              cpf_cnpj: cnpjEmpresa,
              $offset: offset,
              $limit: limit,
            }
          ),
          { maxRetries: 2 },
          'nuvem_fiscal_list_docs'
        );

        if (!docsResult.success || !docsResult.data) {
          erros.push(`Erro ao listar documentos (offset ${offset}): ${docsResult.error}`);
          break;
        }

        const documentos = docsResult.data.data || [];

        for (const doc of documentos) {
          try {
            const isNew = await this.processarDocumento(tenantId, cnpjEmpresa, doc);
            if (isNew) novosDocumentos++;
          } catch (err: any) {
            erros.push(`Erro ao processar doc ${doc.chave}: ${err.message}`);
          }
        }

        hasMore = documentos.length === limit;
        offset += limit;
      }

      // 3. Processar manifestação automática para fornecedores confiáveis
      await this.processarManifestacaoAutomatica(tenantId, cnpjEmpresa);

      return { sucesso: erros.length === 0, novosDocumentos, erros };
    } catch (error: any) {
      erros.push(`Erro geral na captura: ${error.message}`);
      return { sucesso: false, novosDocumentos, erros };
    }
  }

  /**
   * Processa um documento recebido da Distribuição DF-e
   */
  private async processarDocumento(
    tenantId: string,
    cnpjEmpresa: string,
    doc: DistribuicaoNFeDocumento
  ): Promise<boolean> {
    // Verificar se já existe no banco (deduplicação por chave de acesso)
    const existente = await this.db
      .select({ id: dfeInboxDocuments.id })
      .from(dfeInboxDocuments)
      .where(
        and(
          eq(dfeInboxDocuments.tenantId, tenantId),
          eq(dfeInboxDocuments.chaveAcesso, doc.chave)
        )
      )
      .limit(1);

    if (existente.length > 0) {
      return false; // Já processado
    }

    // Baixar XML completo se disponível
    let xmlCompleto: string | undefined;
    if (doc.xml_disponivel) {
      try {
        const xmlResult = await this.retryService.executeWithRetry(
          () => this.nuvemFiscalService.client.get<any>(
            `/distribuicao/nfe/documentos/${doc.id}/xml`
          ),
          { maxRetries: 2 },
          'nuvem_fiscal_download_xml'
        );
        if (xmlResult.success && xmlResult.data) {
          xmlCompleto = typeof xmlResult.data === 'string' ? xmlResult.data : JSON.stringify(xmlResult.data);
        }
      } catch (err) {
        console.warn(`[NFeCollector] Não foi possível baixar XML de ${doc.chave}`);
      }
    }

    // Inserir documento no banco
    const [inserted] = await this.db
      .insert(dfeInboxDocuments)
      .values({
        tenantId,
        tipo: 'nfe',
        chaveAcesso: doc.chave,
        numero: parseInt(doc.chave.substring(25, 34)),
        serie: parseInt(doc.chave.substring(22, 25)),
        dataEmissao: new Date(doc.data_emissao),
        emitenteCpfCnpj: doc.cnpj_emitente,
        emitenteRazaoSocial: doc.nome_emitente,
        emitenteIe: doc.inscricao_estadual_emitente,
        emitenteUf: this.ufFromChave(doc.chave),
        destinatarioCpfCnpj: doc.cnpj_destinatario,
        valorTotal: doc.valor_total.toString(),
        status: 'pendente',
        origemCaptura: 'nuvem_fiscal',
        xmlCompleto,
        nuvemFiscalDocId: doc.id,
        nsu: doc.nsu,
        manifestacaoAtual: doc.manifestacao || null,
      })
      .returning();

    // Adicionar à fila de processamento para parsing de itens
    if (xmlCompleto) {
      await this.db.insert(dfeProcessingQueue).values({
        tenantId,
        documentId: inserted.id,
        tipo: 'parse_xml',
        status: 'pendente',
        tentativas: 0,
        dadosEntrada: { xml: xmlCompleto },
      });
    }

    // Registrar auditoria
    await this.auditService.registrarCaptura(
      tenantId,
      inserted.id,
      doc.chave,
      'nuvem_fiscal_distribuicao'
    );

    return true;
  }

  /**
   * Processa manifestação automática para fornecedores confiáveis
   */
  private async processarManifestacaoAutomatica(
    tenantId: string,
    cnpjEmpresa: string
  ): Promise<void> {
    // Buscar configuração
    const [config] = await this.db
      .select()
      .from(fiscalSettings)
      .where(eq(fiscalSettings.tenantId, tenantId))
      .limit(1);

    if (!config?.manifestacaoAutoFornecedorConfiavel) return;

    // Buscar fornecedores confiáveis
    const fornecedoresConfiáveis = await this.db
      .select()
      .from(trustedSuppliers)
      .where(
        and(
          eq(trustedSuppliers.tenantId, tenantId),
          eq(trustedSuppliers.isActive, true),
          eq(trustedSuppliers.autoManifestacao, true)
        )
      );

    if (fornecedoresConfiáveis.length === 0) return;

    const cnpjsConfiáveis = new Set(
      fornecedoresConfiáveis.map((f: any) => f.supplierCnpj)
    );

    // Buscar notas sem manifestação
    const notasSemManifestacao = await this.db
      .select()
      .from(dfeInboxDocuments)
      .where(
        and(
          eq(dfeInboxDocuments.tenantId, tenantId),
          eq(dfeInboxDocuments.tipo, 'nfe'),
          eq(dfeInboxDocuments.status, 'pendente')
        )
      );

    for (const nota of notasSemManifestacao) {
      if (!cnpjsConfiáveis.has(nota.emitenteCpfCnpj)) continue;

      // Encontrar configuração do fornecedor
      const fornecedor = fornecedoresConfiáveis.find(
        (f: any) => f.supplierCnpj === nota.emitenteCpfCnpj
      );
      if (!fornecedor) continue;

      const tipoManifestacao = fornecedor.tipoManifestacaoAuto || config.manifestacaoAutoTipo || 'ciencia';
      const codigoEvento = this.tipoParaCodigoEvento(tipoManifestacao);

      try {
        const result = await this.retryService.executeWithRetry(
          () => this.nuvemFiscalService.client.post<any>(
            '/distribuicao/nfe/manifestacoes',
            {
              cpf_cnpj: cnpjEmpresa,
              chave: nota.chaveAcesso,
              tipo_evento: codigoEvento,
            }
          ),
          { maxRetries: 2 },
          'nuvem_fiscal_manifestacao'
        );

        if (result.success) {
          // Atualizar status da nota
          await this.db
            .update(dfeInboxDocuments)
            .set({
              manifestacaoAtual: tipoManifestacao,
              status: tipoManifestacao === 'confirmacao' ? 'confirmada' : 'ciencia',
            })
            .where(eq(dfeInboxDocuments.id, nota.id));

          // Registrar auditoria
          await this.auditService.registrarManifestacao(
            tenantId,
            'sistema',
            nota.id,
            nota.chaveAcesso,
            tipoManifestacao,
            true // automática
          );
        }
      } catch (err: any) {
        console.warn(
          `[NFeCollector] Erro na manifestação automática de ${nota.chaveAcesso}: ${err.message}`
        );
      }
    }
  }

  /**
   * Busca notas sem manifestação na Nuvem Fiscal
   */
  async listarNotasSemManifestacao(
    cnpjEmpresa: string,
    limit = 50,
    offset = 0
  ): Promise<ApiResponse<DistribuicaoListResponse>> {
    return this.retryService.executeWithRetry(
      () => this.nuvemFiscalService.client.get<DistribuicaoListResponse>(
        '/distribuicao/nfe/sem-manifestacao',
        {
          cpf_cnpj: cnpjEmpresa,
          $limit: limit,
          $offset: offset,
        }
      ),
      { maxRetries: 2 },
      'nuvem_fiscal_sem_manifestacao'
    );
  }

  /**
   * Manifesta uma nota manualmente
   */
  async manifestarNota(
    tenantId: string,
    userId: string,
    cnpjEmpresa: string,
    documentId: string,
    chaveAcesso: string,
    tipoManifestacao: 'ciencia' | 'confirmacao' | 'desconhecimento' | 'nao_realizada',
    justificativa?: string
  ): Promise<{ sucesso: boolean; erro?: string }> {
    const codigoEvento = this.tipoParaCodigoEvento(tipoManifestacao);

    const body: any = {
      cpf_cnpj: cnpjEmpresa,
      chave: chaveAcesso,
      tipo_evento: codigoEvento,
    };

    if (justificativa && ['desconhecimento', 'nao_realizada'].includes(tipoManifestacao)) {
      body.justificativa = justificativa;
    }

    try {
      const result = await this.retryService.executeWithRetry(
        () => this.nuvemFiscalService.client.post<any>(
          '/distribuicao/nfe/manifestacoes',
          body
        ),
        { maxRetries: 2 },
        'nuvem_fiscal_manifestacao'
      );

      if (result.success) {
        // Atualizar status no banco
        const statusMap: Record<string, string> = {
          ciencia: 'ciencia',
          confirmacao: 'confirmada',
          desconhecimento: 'desconhecida',
          nao_realizada: 'nao_realizada',
        };

        await this.db
          .update(dfeInboxDocuments)
          .set({
            manifestacaoAtual: tipoManifestacao,
            status: statusMap[tipoManifestacao],
          })
          .where(eq(dfeInboxDocuments.id, documentId));

        // Registrar auditoria
        await this.auditService.registrarManifestacao(
          tenantId,
          userId,
          documentId,
          chaveAcesso,
          tipoManifestacao,
          false // manual
        );

        return { sucesso: true };
      }

      return { sucesso: false, erro: result.error };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }

  // ============================================
  // Helpers
  // ============================================

  private tipoParaCodigoEvento(tipo: string): string {
    const mapa: Record<string, string> = {
      ciencia: '210200',
      confirmacao: '210210',
      desconhecimento: '210220',
      nao_realizada: '210240',
    };
    return mapa[tipo] || '210200';
  }

  private ufFromChave(chave: string): string {
    const codigoUF = chave.substring(0, 2);
    const mapa: Record<string, string> = {
      '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA',
      '16': 'AP', '17': 'TO', '21': 'MA', '22': 'PI', '23': 'CE',
      '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL', '28': 'SE',
      '29': 'BA', '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP',
      '41': 'PR', '42': 'SC', '43': 'RS', '50': 'MS', '51': 'MT',
      '52': 'GO', '53': 'DF',
    };
    return mapa[codigoUF] || '';
  }
}
