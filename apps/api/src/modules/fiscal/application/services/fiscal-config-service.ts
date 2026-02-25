/**
 * Fiscal Config Service
 * Gerencia configurações fiscais por tenant.
 */
import { eq } from 'drizzle-orm';
import { fiscalSettings } from '../../infrastructure/schemas/fiscal-config';

type FiscalSettingsInsert = typeof fiscalSettings.$inferInsert;
type FiscalSettingsSelect = typeof fiscalSettings.$inferSelect;

export class FiscalConfigService {
  constructor(private db: any) {}

  /**
   * Obtém configurações fiscais do tenant (cria default se não existir)
   */
  async obterConfiguracoes(tenantId: string): Promise<FiscalSettingsSelect> {
    const result = await this.db
      .select()
      .from(fiscalSettings)
      .where(eq(fiscalSettings.tenantId, tenantId))
      .limit(1);

    if (result.length > 0) {
      return result[0];
    }

    // Criar configurações padrão
    const defaults: FiscalSettingsInsert = {
      tenantId,
      nuvemFiscalAmbiente: 'homologacao',
      regimeTributario: 'regime_normal',
      crt: 3,
      capturaAutomaticaNfe: true,
      capturaIntervaloHoras: 1,
      cienciaAutomatica: false,
      capturaCte: true,
      capturaNfse: false,
      nfseMetodo: 'manual',
      manifestacaoAutoFornecedorConfiavel: false,
      manifestacaoAutoTipo: 'ciencia',
      serieNfe: 1,
      serieNfce: 1,
      serieNfse: 1,
      serieCte: 1,
      proximoNumeroNfe: 1,
      proximoNumeroNfce: 1,
      proximoNumeroNfse: 1,
      proximoNumeroCte: 1,
      gnreHabilitado: false,
      adrcstHabilitado: false,
      adrcstOpcaoRecuperacao: 'conta_grafica',
    };

    const [created] = await this.db
      .insert(fiscalSettings)
      .values(defaults)
      .returning();

    return created;
  }

  /**
   * Atualiza configurações fiscais
   */
  async atualizarConfiguracoes(
    tenantId: string,
    updates: Partial<Omit<FiscalSettingsInsert, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>
  ): Promise<FiscalSettingsSelect> {
    // Garantir que as configurações existem
    await this.obterConfiguracoes(tenantId);

    const [updated] = await this.db
      .update(fiscalSettings)
      .set(updates)
      .where(eq(fiscalSettings.tenantId, tenantId))
      .returning();

    return updated;
  }

  /**
   * Obtém próximo número de documento e incrementa
   */
  async obterProximoNumero(
    tenantId: string,
    tipo: 'nfe' | 'nfce' | 'nfse' | 'cte'
  ): Promise<number> {
    const config = await this.obterConfiguracoes(tenantId);

    const campoMap = {
      nfe: 'proximoNumeroNfe',
      nfce: 'proximoNumeroNfce',
      nfse: 'proximoNumeroNfse',
      cte: 'proximoNumeroCte',
    } as const;

    const campo = campoMap[tipo];
    const numero = config[campo];

    // Incrementar
    await this.db
      .update(fiscalSettings)
      .set({ [campo]: numero + 1 })
      .where(eq(fiscalSettings.tenantId, tenantId));

    return numero;
  }

  /**
   * Obtém série do documento
   */
  async obterSerie(tenantId: string, tipo: 'nfe' | 'nfce' | 'nfse' | 'cte'): Promise<number> {
    const config = await this.obterConfiguracoes(tenantId);

    const campoMap = {
      nfe: 'serieNfe',
      nfce: 'serieNfce',
      nfse: 'serieNfse',
      cte: 'serieCte',
    } as const;

    return config[campoMap[tipo]];
  }

  /**
   * Verifica se a Nuvem Fiscal está configurada
   */
  async nuvemFiscalConfigurada(tenantId: string): Promise<boolean> {
    const config = await this.obterConfiguracoes(tenantId);
    return !!(config.nuvemFiscalClientId && config.nuvemFiscalClientSecret);
  }

  /**
   * Verifica se a captura automática está habilitada
   */
  async capturaAutomaticaHabilitada(tenantId: string): Promise<{
    nfe: boolean;
    cte: boolean;
    nfse: boolean;
  }> {
    const config = await this.obterConfiguracoes(tenantId);
    return {
      nfe: config.capturaAutomaticaNfe,
      cte: config.capturaCte,
      nfse: config.capturaNfse,
    };
  }
}
