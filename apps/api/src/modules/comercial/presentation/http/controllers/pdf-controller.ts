import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IQuoteRepository, ISaleRepository } from '../../../domain/repositories';
import type { PaymentRepository } from '../../../infrastructure/repositories/payment-repository';
import type { DatabaseConnection } from '../../../../../shared/database/connection';
import { DocumentPdfGenerator, type PdfDocData, type PdfItemData, type PdfCompanyData, type PdfClientData, type PdfPaymentData } from '../../../infrastructure/pdf/pdf-generator';
import { tenantSettings } from '../../../../configuracoes/infrastructure/schema';
import { eq, and } from 'drizzle-orm';

// Import client schema for client lookup
import { clients } from '../../../../cadastros/infrastructure/schema';
import { products } from '../../../../produtos/infrastructure/schema';

export class PdfController {
  constructor(
    private quoteRepository: IQuoteRepository,
    private saleRepository: ISaleRepository,
    private paymentRepository: PaymentRepository,
    private db: DatabaseConnection,
  ) {}

  // GET /orcamentos/:id/pdf
  async generateQuotePdf(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');

      // Fetch quote with items
      const quote = await this.quoteRepository.getById(id, user.tenantId);
      if (!quote) return c.json({ success: false, error: 'Orçamento não encontrado' }, 404);

      // Fetch company settings
      const company = await this.getCompanyData(user.tenantId);

      // Fetch client data
      const client = await this.getClientData((quote as any).clientId, user.tenantId);

      // Fetch product names for items
      const items = await this.mapItems((quote as any).items, user.tenantId);

      // Build PDF data
      const productsItems = items.filter(i => i.itemType === 'product');
      const servicesItems = items.filter(i => i.itemType === 'service');

      const subtotalProducts = productsItems.reduce((s, i) => s + i.subtotal, 0);
      const subtotalServices = servicesItems.reduce((s, i) => s + i.subtotal, 0);

      const q = quote as any;
      const pdfData: PdfDocData = {
        type: 'orcamento',
        number: q.number,
        date: q.date?.toISOString?.() || String(q.date),
        validUntil: q.validUntil?.toISOString?.() || q.validUntil || undefined,
        sellerName: undefined, // TODO: fetch seller name
        company,
        client,
        items,
        subtotalProducts,
        subtotalServices,
        discountValue: Number(q.discount || 0),
        discountPercent: 0,
        surchargeValue: Number(q.surcharge || 0),
        freightValue: Number(q.freight || 0),
        totalGeral: Number(q.total || 0),
        payments: [],
        notes: this.buildNotes(q.notes, company.obsPadraoOrcamento),
      };

      // Calculate discount percent
      const subtotalBruto = subtotalProducts + subtotalServices;
      if (subtotalBruto > 0 && pdfData.discountValue > 0) {
        pdfData.discountPercent = (pdfData.discountValue / subtotalBruto) * 100;
      }

      // Generate PDF
      const generator = new DocumentPdfGenerator();
      const pdfBytes = await generator.generate(pdfData);

      return new Response(pdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${q.number}.pdf"`,
          'Cache-Control': 'no-cache',
        },
      });
    } catch (error: any) {
      return c.json({ success: false, error: error.message || 'Erro ao gerar PDF' }, 500);
    }
  }

  // GET /vendas/:id/pdf
  async generateSalePdf(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const id = c.req.param('id');

      // Fetch sale with items
      const sale = await this.saleRepository.getById(id, user.tenantId);
      if (!sale) return c.json({ success: false, error: 'Venda não encontrada' }, 404);

      // Fetch company settings
      const company = await this.getCompanyData(user.tenantId);

      // Fetch client data
      const client = await this.getClientData((sale as any).clientId, user.tenantId);

      // Fetch product names for items
      const items = await this.mapItems((sale as any).items, user.tenantId);

      // Fetch payments
      const rawPayments = await this.paymentRepository.listBySale(id, user.tenantId);
      const payments: PdfPaymentData[] = rawPayments.map(p => ({
        paymentMethod: p.paymentMethod,
        installmentNumber: p.installmentNumber,
        totalInstallments: p.totalInstallments,
        documentNumber: p.documentNumber || undefined,
        dueDate: p.dueDate?.toISOString?.() || (p.dueDate ? String(p.dueDate) : undefined),
        amount: Number(p.amount),
      }));

      // Build PDF data
      const productsItems = items.filter(i => i.itemType === 'product');
      const servicesItems = items.filter(i => i.itemType === 'service');
      const subtotalProducts = productsItems.reduce((s, i) => s + i.subtotal, 0);
      const subtotalServices = servicesItems.reduce((s, i) => s + i.subtotal, 0);

      const s = sale as any;

      // Check linked quote
      let linkedQuoteNumber: string | undefined;
      if (s.quoteId) {
        const linkedQuote = await this.quoteRepository.getById(s.quoteId, user.tenantId);
        if (linkedQuote) linkedQuoteNumber = (linkedQuote as any).number;
      }

      const pdfData: PdfDocData = {
        type: 'venda',
        number: s.number,
        date: s.date?.toISOString?.() || String(s.date),
        sellerName: undefined,
        company,
        client,
        items,
        subtotalProducts,
        subtotalServices,
        discountValue: Number(s.discount || 0),
        discountPercent: 0,
        surchargeValue: Number(s.surcharge || 0),
        freightValue: Number(s.freight || 0),
        totalGeral: Number(s.total || 0),
        payments,
        notes: this.buildNotes(s.notes, company.obsPadraoVenda),
        linkedQuoteNumber,
      };

      const subtotalBruto = subtotalProducts + subtotalServices;
      if (subtotalBruto > 0 && pdfData.discountValue > 0) {
        pdfData.discountPercent = (pdfData.discountValue / subtotalBruto) * 100;
      }

      const generator = new DocumentPdfGenerator();
      const pdfBytes = await generator.generate(pdfData);

      return new Response(pdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${s.number}.pdf"`,
          'Cache-Control': 'no-cache',
        },
      });
    } catch (error: any) {
      return c.json({ success: false, error: error.message || 'Erro ao gerar PDF' }, 500);
    }
  }

  // ==================== HELPERS ====================

  private async getCompanyData(tenantId: string): Promise<PdfCompanyData> {
    const result = await this.db
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, tenantId))
      .limit(1);

    if (!result[0]) {
      return { razaoSocial: 'Empresa não configurada', cnpj: '' };
    }

    const s = result[0] as any;
    return {
      razaoSocial: s.razaoSocial || '',
      nomeFantasia: s.nomeFantasia || undefined,
      cnpj: s.cnpj || '',
      ie: s.ie || undefined,
      im: s.im || undefined,
      endereco: s.endereco || undefined,
      numero: s.numero || undefined,
      complemento: s.complemento || undefined,
      bairro: s.bairro || undefined,
      cidade: s.cidade || undefined,
      uf: s.uf || undefined,
      cep: s.cep || undefined,
      telefone: s.telefone || undefined,
      celular: s.celular || undefined,
      email: s.email || undefined,
      site: s.site || undefined,
      obsPadraoOrcamento: s.obsPadraoOrcamento || undefined,
      obsPadraoVenda: s.obsPadraoVenda || undefined,
      mensagemRodape: s.mensagemRodape || undefined,
    };
  }

  private async getClientData(clientId: string, tenantId: string): Promise<PdfClientData> {
    const result = await this.db
      .select()
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.tenantId, tenantId)))
      .limit(1);

    if (!result[0]) {
      return { name: 'Cliente não encontrado' };
    }

    const c = result[0] as any;
    return {
      name: c.name || c.tradeName || '',
      tradeName: c.tradeName || undefined,
      document: c.document || undefined,
      phone: c.phone || undefined,
      email: c.email || undefined,
      address: c.address || undefined,
      addressNumber: c.addressNumber || undefined,
      neighborhood: c.neighborhood || undefined,
      city: c.city || undefined,
      state: c.state || undefined,
      zipCode: c.zipCode || undefined,
    };
  }

  private async mapItems(rawItems: any[], tenantId: string): Promise<PdfItemData[]> {
    // Fetch all product names in one query
    const productIds = [...new Set(rawItems.map(i => i.productId).filter(Boolean))];
    const productMap = new Map<string, any>();

    if (productIds.length > 0) {
      // Fetch in batches if needed
      for (const pid of productIds) {
        const result = await this.db
          .select()
          .from(products)
          .where(and(eq(products.id, pid), eq(products.tenantId, tenantId)))
          .limit(1);
        if (result[0]) productMap.set(pid, result[0]);
      }
    }

    return rawItems.map(item => {
      const product = productMap.get(item.productId) as any;
      const qty = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);
      const discountValue = Number(item.discount || 0);
      const surcharge = Number(item.surcharge || 0);
      const subtotal = qty * unitPrice - discountValue + surcharge;
      const discountPercent = (qty * unitPrice) > 0 ? (discountValue / (qty * unitPrice)) * 100 : 0;

      return {
        code: product?.sku || product?.code || '-',
        description: product?.name || 'Produto não encontrado',
        unit: product?.unit || 'UN',
        quantity: qty,
        unitPrice,
        discountPercent,
        discountValue,
        surcharge,
        subtotal,
        itemType: (item.itemType || 'product') as 'product' | 'service',
      };
    });
  }

  private buildNotes(documentNotes?: string, defaultNotes?: string): string | undefined {
    const parts = [documentNotes, defaultNotes].filter(Boolean);
    return parts.length > 0 ? parts.join('\n') : undefined;
  }
}
