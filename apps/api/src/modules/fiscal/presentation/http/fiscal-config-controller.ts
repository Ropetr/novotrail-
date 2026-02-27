import { Context } from 'hono';
import { eq, and, sql, isNotNull } from 'drizzle-orm';
import type { FiscalConfigRepository } from '../../infrastructure/repositories/fiscal-config-repository';
import type { ProductTaxRulesRepository } from '../../infrastructure/repositories/product-tax-rules-repository';
import type { FiscalAuditLogRepository } from '../../infrastructure/repositories/fiscal-audit-log-repository';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import type { OnboardingStatus } from '../../domain/entities';
import { products, productTaxRules } from '../../../produtos/infrastructure/schema';
import { tenantSettings } from '../../../configuracoes/infrastructure/schema';
import { fiscalDigitalCertificates } from '../../infrastructure/schema';
import {
  updateFiscalConfigSchema,
  createProductTaxRuleSchema,
  updateProductTaxRuleSchema,
  seedTaxRulesSchema,
} from './validators';

export class FiscalConfigController {
  constructor(
    private configRepo: FiscalConfigRepository,
    private taxRulesRepo: ProductTaxRulesRepository,
    private auditRepo: FiscalAuditLogRepository,
    private db: DatabaseConnection,
  ) {}

  // ============================================
  // GET /fiscal/config/empresa
  // ============================================
  async getConfig(c: Context) {
    try {
      const tenantId = c.get('user')?.tenantId;
      if (!tenantId) return c.json({ error: 'Tenant não identificado' }, 401);

      const config = await this.configRepo.getByTenantId(tenantId);
      return c.json({ data: config || {} });
    } catch (error: any) {
      console.error('[FISCAL_CONFIG] Erro em getConfig:', error);
      return c.json({ error: 'Erro interno', details: error.message }, 500);
    }
  }

  // ============================================
  // PUT /fiscal/config/empresa
  // ============================================
  async updateConfig(c: Context) {
    try {
      const tenantId = c.get('user')?.tenantId;
      const userId = c.get('user')?.id;
      if (!tenantId) return c.json({ error: 'Tenant não identificado' }, 401);

      const body = await c.req.json();
      const validation = updateFiscalConfigSchema.safeParse(body);
      if (!validation.success) {
        return c.json({ error: 'Dados inválidos', details: validation.error.errors }, 400);
      }

      const config = await this.configRepo.upsert(tenantId, validation.data);

      await this.auditRepo.log(tenantId, userId || null, 'config_alterada', 'fiscal_config', config.id, validation.data);

      return c.json({ data: config });
    } catch (error: any) {
      console.error('[FISCAL_CONFIG] Erro em updateConfig:', error);
      return c.json({ error: 'Erro interno', details: error.message }, 500);
    }
  }

  // ============================================
  // GET /fiscal/config/status (Onboarding checklist)
  // ============================================
  async getOnboardingStatus(c: Context) {
    try {
      const tenantId = c.get('user')?.tenantId;
      if (!tenantId) return c.json({ error: 'Tenant não identificado' }, 401);

      // 1. Check fiscal config
      const config = await this.configRepo.getByTenantId(tenantId);

      // 2. Check tenant settings for basic fiscal data
      const settings = await this.db
        .select()
        .from(tenantSettings)
        .where(eq(tenantSettings.tenantId, tenantId))
        .limit(1);
      const ts = settings[0] as any;

      // 3. Check certificate exists
      const certs = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(fiscalDigitalCertificates)
        .where(
          and(
            eq(fiscalDigitalCertificates.tenantId, tenantId),
            eq(fiscalDigitalCertificates.ativo, true)
          )
        );
      const hasCert = (certs[0]?.count || 0) > 0;

      // 4. Check products with NCM
      const totalProds = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(products)
        .where(eq(products.tenantId, tenantId));

      const prodsWithNcm = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(products)
        .where(
          and(
            eq(products.tenantId, tenantId),
            isNotNull(products.ncm)
          )
        );

      // 5. Count tax rules
      const taxRulesCount = await this.taxRulesRepo.countByTenant(tenantId);

      const totalProdutos = totalProds[0]?.count || 0;
      const produtosComNcm = prodsWithNcm[0]?.count || 0;

      const dadosEmpresa = !!(ts?.cnpj && ts?.uf && (config?.regimeTributario || ts?.crt));
      const configNfe = !!(config?.emissaoAmbiente && config?.emissaoSerieNfe);
      const ncmOk = totalProdutos > 0 && produtosComNcm >= totalProdutos * 0.8; // 80%+ com NCM

      const status: OnboardingStatus = {
        etapaAtual: config?.onboardingEtapaAtual || 0,
        completo: config?.onboardingCompleto || false,
        checklist: {
          dadosEmpresa,
          certificado: hasCert,
          configNfe,
          ncmProdutos: ncmOk,
          taxRules: taxRulesCount > 0,
        },
        totalProdutos,
        produtosComNcm,
        produtosComTaxRules: taxRulesCount,
      };

      return c.json({ data: status });
    } catch (error: any) {
      console.error('[FISCAL_CONFIG] Erro em getOnboardingStatus:', error);
      return c.json({ error: 'Erro interno', details: error.message }, 500);
    }
  }

  // ============================================
  // POST /fiscal/produtos/:id/tax-rules
  // ============================================
  async createTaxRule(c: Context) {
    try {
      const tenantId = c.get('user')?.tenantId;
      if (!tenantId) return c.json({ error: 'Tenant não identificado' }, 401);

      const productId = c.req.param('id');
      const body = await c.req.json();
      const validation = createProductTaxRuleSchema.safeParse(body);
      if (!validation.success) {
        return c.json({ error: 'Dados inválidos', details: validation.error.errors }, 400);
      }

      // Verify product belongs to tenant
      const product = await this.db
        .select({ id: products.id })
        .from(products)
        .where(and(eq(products.tenantId, tenantId), eq(products.id, productId)))
        .limit(1);
      if (!product[0]) return c.json({ error: 'Produto não encontrado' }, 404);

      const rule = await this.taxRulesRepo.create(tenantId, { ...validation.data, productId });
      return c.json({ data: rule }, 201);
    } catch (error: any) {
      console.error('[FISCAL_CONFIG] Erro em createTaxRule:', error);
      return c.json({ error: 'Erro interno', details: error.message }, 500);
    }
  }

  // ============================================
  // GET /fiscal/produtos/:id/tax-rules
  // ============================================
  async listTaxRules(c: Context) {
    try {
      const tenantId = c.get('user')?.tenantId;
      if (!tenantId) return c.json({ error: 'Tenant não identificado' }, 401);

      const productId = c.req.param('id');
      const rules = await this.taxRulesRepo.getByProductId(tenantId, productId);
      return c.json({ data: rules });
    } catch (error: any) {
      console.error('[FISCAL_CONFIG] Erro em listTaxRules:', error);
      return c.json({ error: 'Erro interno', details: error.message }, 500);
    }
  }

  // ============================================
  // PUT /fiscal/produtos/:id/tax-rules/:ruleId
  // ============================================
  async updateTaxRule(c: Context) {
    try {
      const tenantId = c.get('user')?.tenantId;
      if (!tenantId) return c.json({ error: 'Tenant não identificado' }, 401);

      const ruleId = c.req.param('ruleId');
      const body = await c.req.json();
      const validation = updateProductTaxRuleSchema.safeParse(body);
      if (!validation.success) {
        return c.json({ error: 'Dados inválidos', details: validation.error.errors }, 400);
      }

      const existing = await this.taxRulesRepo.getById(tenantId, ruleId);
      if (!existing) return c.json({ error: 'Regra não encontrada' }, 404);

      const updated = await this.taxRulesRepo.update(tenantId, ruleId, validation.data);
      return c.json({ data: updated });
    } catch (error: any) {
      console.error('[FISCAL_CONFIG] Erro em updateTaxRule:', error);
      return c.json({ error: 'Erro interno', details: error.message }, 500);
    }
  }

  // ============================================
  // DELETE /fiscal/produtos/:id/tax-rules/:ruleId
  // ============================================
  async deleteTaxRule(c: Context) {
    try {
      const tenantId = c.get('user')?.tenantId;
      if (!tenantId) return c.json({ error: 'Tenant não identificado' }, 401);

      const ruleId = c.req.param('ruleId');
      const existing = await this.taxRulesRepo.getById(tenantId, ruleId);
      if (!existing) return c.json({ error: 'Regra não encontrada' }, 404);

      await this.taxRulesRepo.delete(tenantId, ruleId);
      return c.json({ message: 'Regra removida com sucesso' });
    } catch (error: any) {
      console.error('[FISCAL_CONFIG] Erro em deleteTaxRule:', error);
      return c.json({ error: 'Erro interno', details: error.message }, 500);
    }
  }

  // ============================================
  // POST /fiscal/produtos/tax-rules/seed
  // ============================================
  async seedTaxRules(c: Context) {
    try {
      const tenantId = c.get('user')?.tenantId;
      if (!tenantId) return c.json({ error: 'Tenant não identificado' }, 401);

      const body = await c.req.json().catch(() => ({}));
      const validation = seedTaxRulesSchema.safeParse(body);
      const { tipoOperacao = 'venda', overwrite = false } = validation.success ? validation.data : { tipoOperacao: 'venda', overwrite: false };

      // 1. Get tenant fiscal config to determine CRT
      const config = await this.configRepo.getByTenantId(tenantId);
      const settings = await this.db
        .select()
        .from(tenantSettings)
        .where(eq(tenantSettings.tenantId, tenantId))
        .limit(1);
      const ts = settings[0] as any;

      const crt = ts?.crt || (config?.regimeTributario === 'simples_nacional' ? 1 : 3);

      // 2. Get products with NCM
      const prods = await this.db
        .select({ id: products.id, ncm: products.ncm })
        .from(products)
        .where(
          and(
            eq(products.tenantId, tenantId),
            isNotNull(products.ncm)
          )
        );

      if (prods.length === 0) {
        return c.json({ error: 'Nenhum produto com NCM preenchido. Preencha o NCM dos produtos primeiro.' }, 400);
      }

      let created = 0;
      let skipped = 0;

      for (const prod of prods) {
        // Check if already has rules
        const existing = await this.taxRulesRepo.getByProductId(tenantId, prod.id);
        const hasDefaultRule = existing.some(r => r.tipoOperacao === tipoOperacao && r.isDefault);

        if (hasDefaultRule && !overwrite) {
          skipped++;
          continue;
        }

        if (hasDefaultRule && overwrite) {
          // Delete existing default rules for this operation
          for (const rule of existing.filter(r => r.tipoOperacao === tipoOperacao && r.isDefault)) {
            await this.taxRulesRepo.delete(tenantId, rule.id);
          }
        }

        // Generate rule based on CRT
        const ruleData = this.generateDefaultRule(crt, tipoOperacao);
        await this.taxRulesRepo.create(tenantId, { ...ruleData, productId: prod.id });
        created++;
      }

      await this.auditRepo.log(tenantId, c.get('user')?.id || null, 'tax_rules_seed', 'product_tax_rules', undefined, { crt, tipoOperacao, created, skipped });

      return c.json({
        data: {
          message: `Seed concluído`,
          crt,
          tipoOperacao,
          totalProdutos: prods.length,
          created,
          skipped,
        }
      });
    } catch (error: any) {
      console.error('[FISCAL_CONFIG] Erro em seedTaxRules:', error);
      return c.json({ error: 'Erro interno', details: error.message }, 500);
    }
  }

  // ============================================
  // Helper: Generate default tax rule based on CRT
  // ============================================
  private generateDefaultRule(crt: number, tipoOperacao: string) {
    const base = {
      ufDestino: null,
      tipoOperacao,
      tipoCliente: 'contribuinte',
      isDefault: true,
    };

    if (tipoOperacao === 'devolucao') {
      return {
        ...base,
        cfopDentroEstado: '5202',
        cfopForaEstado: '6202',
        cstIcms: crt === 1 ? null : '000',
        csosn: crt === 1 ? '0102' : null,
        aliquotaIcms: '0',
        aliquotaIcmsSt: '0',
        reducaoBc: '0',
        mva: '0',
        cstIpi: '99',
        aliquotaIpi: '0',
        cstPis: '49',
        aliquotaPis: '0',
        cstCofins: '49',
        aliquotaCofins: '0',
      };
    }

    // Venda (default)
    if (crt === 1 || crt === 2 || crt === 4) {
      // Simples Nacional / MEI
      return {
        ...base,
        cfopDentroEstado: '5102',
        cfopForaEstado: '6102',
        cstIcms: null,
        csosn: '0102',
        aliquotaIcms: '0',
        aliquotaIcmsSt: '0',
        reducaoBc: '0',
        mva: '0',
        cstIpi: '99',
        aliquotaIpi: '0',
        cstPis: '49',
        aliquotaPis: '0',
        cstCofins: '49',
        aliquotaCofins: '0',
      };
    } else {
      // Lucro Presumido / Real (CRT=3)
      return {
        ...base,
        cfopDentroEstado: '5102',
        cfopForaEstado: '6102',
        cstIcms: '000',
        csosn: null,
        aliquotaIcms: '18.00',
        aliquotaIcmsSt: '0',
        reducaoBc: '0',
        mva: '0',
        aliquotaIcmsInterestadual: '12.00',
        cstIpi: '99',
        aliquotaIpi: '0',
        cstPis: '01',
        aliquotaPis: '0.65',
        cstCofins: '01',
        aliquotaCofins: '3.00',
      };
    }
  }
}
