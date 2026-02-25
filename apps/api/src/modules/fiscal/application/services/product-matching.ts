/**
 * Product Matching Service (De-Para)
 * Algoritmo em cascata para vincular produtos do fornecedor aos produtos internos.
 * Cascata: Código Fornecedor → EAN → NCM + Descrição Fuzzy → Manual
 */
import { eq, and, like, sql } from 'drizzle-orm';
import { supplierProductMapping } from '../../infrastructure/schemas/dfe-inbox';
import { products } from '../../../produtos/infrastructure/schema';

interface MatchResult {
  productId: string | null;
  metodo: 'codigo_fornecedor' | 'ean' | 'ncm_fuzzy' | 'manual';
  score: number; // 0-100
  confianca: string;
  sugestoes?: Array<{
    productId: string;
    nome: string;
    score: number;
    motivo: string;
  }>;
}

interface ItemParaMatch {
  codigoProdutoEmitente: string;
  descricao: string;
  ncm: string;
  ean?: string;
  supplierCnpj: string;
}

export class ProductMatchingService {
  constructor(private db: any) {}

  /**
   * Executa o algoritmo de matching em cascata
   */
  async match(tenantId: string, item: ItemParaMatch): Promise<MatchResult> {
    // ETAPA 1: Buscar por código do fornecedor (De-Para existente)
    const matchPorCodigo = await this.matchPorCodigoFornecedor(
      tenantId,
      item.supplierCnpj,
      item.codigoProdutoEmitente
    );
    if (matchPorCodigo) {
      return {
        productId: matchPorCodigo.productId,
        metodo: 'codigo_fornecedor',
        score: 100,
        confianca: matchPorCodigo.confianca,
      };
    }

    // ETAPA 2: Buscar por EAN/GTIN
    if (item.ean && item.ean !== 'SEM GTIN') {
      const matchPorEan = await this.matchPorEAN(tenantId, item.ean);
      if (matchPorEan) {
        // Salvar no De-Para para próximas vezes
        await this.salvarMapping(tenantId, item, matchPorEan.id, 'ean', 95);
        return {
          productId: matchPorEan.id,
          metodo: 'ean',
          score: 95,
          confianca: '95',
        };
      }
    }

    // ETAPA 3: Buscar por NCM + Descrição Fuzzy
    const sugestoesFuzzy = await this.matchPorNCMFuzzy(tenantId, item.ncm, item.descricao);
    if (sugestoesFuzzy.length > 0 && sugestoesFuzzy[0].score >= 70) {
      return {
        productId: sugestoesFuzzy[0].productId,
        metodo: 'ncm_fuzzy',
        score: sugestoesFuzzy[0].score,
        confianca: sugestoesFuzzy[0].score.toString(),
        sugestoes: sugestoesFuzzy,
      };
    }

    // ETAPA 4: Não encontrado — retorna sugestões se houver
    return {
      productId: null,
      metodo: 'manual',
      score: 0,
      confianca: '0',
      sugestoes: sugestoesFuzzy.length > 0 ? sugestoesFuzzy : undefined,
    };
  }

  /**
   * ETAPA 1: Match por código do fornecedor (De-Para)
   */
  private async matchPorCodigoFornecedor(
    tenantId: string,
    supplierCnpj: string,
    codigoProduto: string
  ) {
    const result = await this.db
      .select()
      .from(supplierProductMapping)
      .where(
        and(
          eq(supplierProductMapping.tenantId, tenantId),
          eq(supplierProductMapping.supplierCnpj, supplierCnpj),
          eq(supplierProductMapping.codigoProdutoFornecedor, codigoProduto),
          eq(supplierProductMapping.isActive, true)
        )
      )
      .limit(1);

    if (result.length > 0) {
      // Incrementar contador de uso
      await this.db
        .update(supplierProductMapping)
        .set({
          vezesUtilizado: sql`${supplierProductMapping.vezesUtilizado} + 1`,
        })
        .where(eq(supplierProductMapping.id, result[0].id));

      return result[0];
    }

    return null;
  }

  /**
   * ETAPA 2: Match por EAN/GTIN
   */
  private async matchPorEAN(tenantId: string, ean: string) {
    const result = await this.db
      .select()
      .from(products)
      .where(
        and(
          eq(products.tenantId, tenantId),
          eq(products.ean, ean)
        )
      )
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  /**
   * ETAPA 3: Match por NCM + Descrição Fuzzy
   */
  private async matchPorNCMFuzzy(
    tenantId: string,
    ncm: string,
    descricao: string
  ): Promise<Array<{ productId: string; nome: string; score: number; motivo: string }>> {
    // Buscar produtos com mesmo NCM
    const candidatos = await this.db
      .select({
        id: products.id,
        name: products.name,
        ncm: products.ncm,
        ean: products.ean,
      })
      .from(products)
      .where(
        and(
          eq(products.tenantId, tenantId),
          eq(products.ncm, ncm)
        )
      )
      .limit(20);

    if (candidatos.length === 0) return [];

    // Calcular similaridade fuzzy para cada candidato
    const resultados = candidatos.map((candidato: any) => {
      const score = this.calcularSimilaridade(descricao, candidato.name);
      return {
        productId: candidato.id,
        nome: candidato.name,
        score: Math.round(score * 100),
        motivo: `NCM ${ncm} + similaridade ${Math.round(score * 100)}%`,
      };
    });

    // Ordenar por score decrescente
    return resultados.sort((a: any, b: any) => b.score - a.score).slice(0, 5);
  }

  /**
   * Calcula similaridade entre duas strings (Levenshtein normalizado)
   */
  private calcularSimilaridade(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1;

    const len1 = s1.length;
    const len2 = s2.length;
    const maxLen = Math.max(len1, len2);

    if (maxLen === 0) return 1;

    // Levenshtein distance
    const matrix: number[][] = [];
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const distance = matrix[len1][len2];
    return 1 - distance / maxLen;
  }

  /**
   * Salva um novo mapeamento De-Para
   */
  async salvarMapping(
    tenantId: string,
    item: ItemParaMatch,
    productId: string,
    origem: 'manual' | 'ean' | 'ncm_fuzzy' | 'automatico',
    confianca: number
  ): Promise<void> {
    await this.db
      .insert(supplierProductMapping)
      .values({
        tenantId,
        supplierCnpj: item.supplierCnpj,
        codigoProdutoFornecedor: item.codigoProdutoEmitente,
        descricaoProdutoFornecedor: item.descricao,
        eanFornecedor: item.ean,
        ncmFornecedor: item.ncm,
        productId,
        origemVinculo: origem,
        confianca: confianca.toString(),
        vezesUtilizado: 1,
      })
      .onConflictDoUpdate({
        target: [
          supplierProductMapping.tenantId,
          supplierProductMapping.supplierCnpj,
          supplierProductMapping.codigoProdutoFornecedor,
        ],
        set: {
          productId,
          origemVinculo: origem,
          confianca: confianca.toString(),
          vezesUtilizado: sql`${supplierProductMapping.vezesUtilizado} + 1`,
        },
      });
  }

  /**
   * Vinculação manual pelo usuário
   */
  async vincularManualmente(
    tenantId: string,
    supplierCnpj: string,
    codigoProdutoFornecedor: string,
    descricao: string,
    productId: string,
    ean?: string,
    ncm?: string
  ): Promise<void> {
    await this.salvarMapping(
      tenantId,
      {
        codigoProdutoEmitente: codigoProdutoFornecedor,
        descricao,
        ncm: ncm || '',
        ean,
        supplierCnpj,
      },
      productId,
      'manual',
      100
    );
  }

  /**
   * Listar mapeamentos de um fornecedor
   */
  async listarMapeamentos(tenantId: string, supplierCnpj?: string) {
    const conditions = [eq(supplierProductMapping.tenantId, tenantId)];
    if (supplierCnpj) {
      conditions.push(eq(supplierProductMapping.supplierCnpj, supplierCnpj));
    }

    return this.db
      .select()
      .from(supplierProductMapping)
      .where(and(...conditions))
      .orderBy(supplierProductMapping.vezesUtilizado);
  }

  /**
   * Remover mapeamento
   */
  async removerMapeamento(tenantId: string, mappingId: string): Promise<void> {
    await this.db
      .update(supplierProductMapping)
      .set({ isActive: false })
      .where(
        and(
          eq(supplierProductMapping.tenantId, tenantId),
          eq(supplierProductMapping.id, mappingId)
        )
      );
  }
}
