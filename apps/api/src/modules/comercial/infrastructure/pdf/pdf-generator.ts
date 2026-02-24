import { PDFDocument, PDFPage, rgb, StandardFonts, PDFFont } from 'pdf-lib';

// ==================== TYPES ====================

export type DocType = 'orcamento' | 'venda';

export interface PdfCompanyData {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  ie?: string;
  im?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  site?: string;
  obsPadraoOrcamento?: string;
  obsPadraoVenda?: string;
  mensagemRodape?: string;
}

export interface PdfClientData {
  name: string;
  tradeName?: string;
  document?: string;
  phone?: string;
  email?: string;
  address?: string;
  addressNumber?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface PdfItemData {
  code?: string;
  description: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountValue: number;
  surcharge: number;
  subtotal: number;
  itemType: 'product' | 'service';
}

export interface PdfPaymentData {
  paymentMethod: string;
  installmentNumber: number;
  totalInstallments: number;
  documentNumber?: string;
  dueDate?: string;
  amount: number;
}

export interface PdfDocData {
  type: DocType;
  number: string;
  date: string;
  validUntil?: string;
  sellerName?: string;
  company: PdfCompanyData;
  client: PdfClientData;
  items: PdfItemData[];
  subtotalProducts: number;
  subtotalServices: number;
  discountValue: number;
  discountPercent: number;
  surchargeValue: number;
  freightValue: number;
  totalGeral: number;
  payments: PdfPaymentData[];
  notes?: string;
  linkedQuoteNumber?: string;
}

// ==================== CONSTANTS ====================

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_LEFT = 40;
const MARGIN_RIGHT = 40;
const MARGIN_TOP = 40;
const MARGIN_BOTTOM = 40;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

// Colors
const BLACK = rgb(0, 0, 0);
const DARK_GRAY = rgb(0.25, 0.25, 0.25);
const GRAY = rgb(0.5, 0.5, 0.5);
const LIGHT_GRAY = rgb(0.85, 0.85, 0.85);
const VERY_LIGHT_GRAY = rgb(0.95, 0.95, 0.95);
const PRIMARY = rgb(0.15, 0.35, 0.6); // Azul escuro profissional

const PAYMENT_LABELS: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  boleto: 'Boleto',
  cheque: 'Cheque',
  cartao_credito: 'Cartão Crédito',
  cartao_debito: 'Cartão Débito',
  transferencia: 'Transferência',
  credito_cliente: 'Crédito Cliente',
};

// ==================== HELPERS ====================

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.substring(0, maxLen - 2) + '..' : text;
}

// ==================== PDF GENERATOR ====================

export class DocumentPdfGenerator {
  private doc!: PDFDocument;
  private page!: PDFPage;
  private fontRegular!: PDFFont;
  private fontBold!: PDFFont;
  private y = 0;
  private pageNumber = 1;
  private totalPages = 1;
  private data!: PdfDocData;

  async generate(data: PdfDocData): Promise<Uint8Array> {
    this.data = data;
    this.doc = await PDFDocument.create();
    this.fontRegular = await this.doc.embedFont(StandardFonts.Helvetica);
    this.fontBold = await this.doc.embedFont(StandardFonts.HelveticaBold);

    this.addPage();

    // BLOCO 1 — Cabeçalho (Emitente)
    this.drawHeader();

    // BLOCO 2 — Destinatário (Cliente)
    this.drawClient();

    // BLOCO 3 — Dados do Produto
    const products = data.items.filter(i => i.itemType === 'product');
    if (products.length > 0) {
      this.drawItemsTable('DADOS DO PRODUTO', products, data.subtotalProducts);
    }

    // BLOCO 4 — Dados do Serviço
    const services = data.items.filter(i => i.itemType === 'service');
    if (services.length > 0) {
      this.drawItemsTable('DADOS DO SERVIÇO', services, data.subtotalServices);
    }

    // BLOCO 5 — Totais
    this.drawTotals();

    // BLOCO 6 — Pagamento
    if (data.payments.length > 0) {
      this.drawPayments();
    }

    // BLOCO 7 — Observações + Rodapé
    this.drawFooter();

    return this.doc.save();
  }

  // ==================== PAGE MANAGEMENT ====================

  private addPage() {
    this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN_TOP;
    this.pageNumber = this.doc.getPageCount();
  }

  private ensureSpace(needed: number) {
    if (this.y - needed < MARGIN_BOTTOM + 30) {
      this.addPage();
      // Mini-header on continuation pages
      this.drawText(
        `${this.data.type === 'orcamento' ? 'ORÇAMENTO' : 'VENDA'} ${this.data.number} — Continuação`,
        MARGIN_LEFT, this.y, { font: this.fontBold, size: 9, color: GRAY }
      );
      this.y -= 20;
      this.drawLine(MARGIN_LEFT, this.y, PAGE_WIDTH - MARGIN_RIGHT, this.y, 0.5);
      this.y -= 10;
    }
  }

  // ==================== DRAWING PRIMITIVES ====================

  private drawText(
    text: string, x: number, y: number,
    opts: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb> } = {}
  ) {
    const font = opts.font || this.fontRegular;
    const size = opts.size || 8;
    this.page.drawText(text || '', { x, y, font, size, color: opts.color || DARK_GRAY });
  }

  private drawTextRight(
    text: string, rightX: number, y: number,
    opts: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb> } = {}
  ) {
    const font = opts.font || this.fontRegular;
    const size = opts.size || 8;
    const width = font.widthOfTextAtSize(text || '', size);
    this.page.drawText(text || '', { x: rightX - width, y, font, size, color: opts.color || DARK_GRAY });
  }

  private drawLine(x1: number, y1: number, x2: number, y2: number, thickness = 1) {
    this.page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color: LIGHT_GRAY });
  }

  private drawRect(x: number, y: number, w: number, h: number, color: ReturnType<typeof rgb>) {
    this.page.drawRectangle({ x, y, width: w, height: h, color });
  }

  private drawSectionHeader(title: string) {
    this.ensureSpace(25);
    this.drawRect(MARGIN_LEFT, this.y - 14, CONTENT_WIDTH, 16, PRIMARY);
    this.drawText(title, MARGIN_LEFT + 6, this.y - 11, { font: this.fontBold, size: 8, color: rgb(1, 1, 1) });
    this.y -= 20;
  }

  // ==================== BLOCO 1: CABEÇALHO ====================

  private drawHeader() {
    const c = this.data.company;
    const docLabel = this.data.type === 'orcamento' ? 'ORÇAMENTO' : 'VENDA';
    const startY = this.y;

    // Título do documento
    this.drawText(docLabel, MARGIN_LEFT, this.y, { font: this.fontBold, size: 16, color: PRIMARY });

    // Número + Data (direita)
    this.drawTextRight(`Nº ${this.data.number}`, PAGE_WIDTH - MARGIN_RIGHT, this.y, { font: this.fontBold, size: 11, color: PRIMARY });
    this.y -= 14;
    this.drawTextRight(`Data: ${formatDate(this.data.date)}`, PAGE_WIDTH - MARGIN_RIGHT, this.y, { size: 8 });

    if (this.data.validUntil) {
      this.y -= 11;
      this.drawTextRight(`Válido até: ${formatDate(this.data.validUntil)}`, PAGE_WIDTH - MARGIN_RIGHT, this.y, { size: 8 });
    }

    if (this.data.sellerName) {
      this.y -= 11;
      this.drawTextRight(`Vendedor: ${this.data.sellerName}`, PAGE_WIDTH - MARGIN_RIGHT, this.y, { size: 8 });
    }

    // Dados empresa (esquerda, abaixo do título)
    let ey = startY - 22;
    this.drawText(c.razaoSocial || '', MARGIN_LEFT, ey, { font: this.fontBold, size: 9 });
    if (c.nomeFantasia) {
      ey -= 11;
      this.drawText(c.nomeFantasia, MARGIN_LEFT, ey, { size: 8, color: GRAY });
    }
    ey -= 11;
    const addr = [c.endereco, c.numero, c.complemento, c.bairro].filter(Boolean).join(', ');
    if (addr) this.drawText(addr, MARGIN_LEFT, ey, { size: 7.5 });
    ey -= 10;
    const cityLine = [c.cidade, c.uf].filter(Boolean).join('/');
    const cepLine = c.cep ? `CEP ${c.cep}` : '';
    if (cityLine || cepLine) this.drawText([cityLine, cepLine].filter(Boolean).join(' — '), MARGIN_LEFT, ey, { size: 7.5 });
    ey -= 10;
    this.drawText(`CNPJ: ${c.cnpj || ''}`, MARGIN_LEFT, ey, { size: 7.5 });
    if (c.ie) {
      const cnpjW = this.fontRegular.widthOfTextAtSize(`CNPJ: ${c.cnpj || ''}`, 7.5);
      this.drawText(`  |  IE: ${c.ie}`, MARGIN_LEFT + cnpjW, ey, { size: 7.5 });
    }
    ey -= 10;
    const contacts = [c.telefone ? `Tel: ${c.telefone}` : '', c.celular ? `Cel: ${c.celular}` : '', c.email || ''].filter(Boolean).join('  |  ');
    if (contacts) this.drawText(contacts, MARGIN_LEFT, ey, { size: 7.5 });

    this.y = Math.min(this.y, ey) - 10;
    this.drawLine(MARGIN_LEFT, this.y, PAGE_WIDTH - MARGIN_RIGHT, this.y, 1);
    this.y -= 6;
  }

  // ==================== BLOCO 2: CLIENTE ====================

  private drawClient() {
    this.drawSectionHeader('DESTINATÁRIO');
    const cl = this.data.client;

    // Linha 1: Nome + Documento
    this.drawText('Nome/Razão Social:', MARGIN_LEFT + 4, this.y, { size: 6.5, color: GRAY });
    this.drawText(cl.name || '', MARGIN_LEFT + 85, this.y, { font: this.fontBold, size: 8 });
    if (cl.document) {
      this.drawText('CNPJ/CPF:', MARGIN_LEFT + 340, this.y, { size: 6.5, color: GRAY });
      this.drawText(cl.document, MARGIN_LEFT + 385, this.y, { size: 8 });
    }
    this.y -= 12;

    // Linha 2: Tel + Email
    if (cl.phone) {
      this.drawText('Telefone:', MARGIN_LEFT + 4, this.y, { size: 6.5, color: GRAY });
      this.drawText(cl.phone, MARGIN_LEFT + 48, this.y, { size: 8 });
    }
    if (cl.email) {
      this.drawText('E-mail:', MARGIN_LEFT + 200, this.y, { size: 6.5, color: GRAY });
      this.drawText(cl.email, MARGIN_LEFT + 232, this.y, { size: 8 });
    }
    this.y -= 12;

    // Linha 3: Endereço
    const addrParts = [cl.address, cl.addressNumber, cl.neighborhood].filter(Boolean).join(', ');
    if (addrParts) {
      this.drawText('Endereço:', MARGIN_LEFT + 4, this.y, { size: 6.5, color: GRAY });
      this.drawText(addrParts, MARGIN_LEFT + 48, this.y, { size: 8 });
    }
    const cityState = [cl.city, cl.state].filter(Boolean).join('/');
    if (cityState) {
      this.drawText(cityState, MARGIN_LEFT + 340, this.y, { size: 8 });
    }
    if (cl.zipCode) {
      this.drawText(`CEP ${cl.zipCode}`, MARGIN_LEFT + 430, this.y, { size: 8 });
    }
    this.y -= 8;
    this.drawLine(MARGIN_LEFT, this.y, PAGE_WIDTH - MARGIN_RIGHT, this.y, 0.5);
    this.y -= 6;
  }

  // ==================== BLOCO 3/4: TABELA DE ITENS ====================

  private drawItemsTable(title: string, items: PdfItemData[], sectionTotal: number) {
    this.drawSectionHeader(title);

    // Cabeçalho da tabela
    const cols = [
      { label: 'Código',      x: MARGIN_LEFT + 4,   w: 55,  align: 'left' as const },
      { label: 'Descrição',   x: MARGIN_LEFT + 62,  w: 170, align: 'left' as const },
      { label: 'Unid',        x: MARGIN_LEFT + 235, w: 30,  align: 'center' as const },
      { label: 'Qtd',         x: MARGIN_LEFT + 268, w: 35,  align: 'right' as const },
      { label: 'V.Unit',      x: MARGIN_LEFT + 306, w: 50,  align: 'right' as const },
      { label: 'Desc(%)',     x: MARGIN_LEFT + 359, w: 40,  align: 'right' as const },
      { label: 'Desc(R$)',    x: MARGIN_LEFT + 402, w: 45,  align: 'right' as const },
      { label: 'Acrésc(R$)',  x: MARGIN_LEFT + 450, w: 45,  align: 'right' as const },
      { label: 'Subtotal',    x: MARGIN_LEFT + 498, w: 55,  align: 'right' as const },
    ];

    // Header row
    this.drawRect(MARGIN_LEFT, this.y - 11, CONTENT_WIDTH, 14, VERY_LIGHT_GRAY);
    cols.forEach(col => {
      if (col.align === 'right') {
        this.drawTextRight(col.label, col.x + col.w, this.y - 8, { font: this.fontBold, size: 6.5, color: GRAY });
      } else {
        this.drawText(col.label, col.x, this.y - 8, { font: this.fontBold, size: 6.5, color: GRAY });
      }
    });
    this.y -= 16;

    // Data rows
    let totalQty = 0;
    items.forEach((item, idx) => {
      this.ensureSpace(14);

      // Zebra striping
      if (idx % 2 === 1) {
        this.drawRect(MARGIN_LEFT, this.y - 9, CONTENT_WIDTH, 12, VERY_LIGHT_GRAY);
      }

      this.drawText(truncate(item.code || '-', 10), cols[0].x, this.y - 7, { size: 7 });
      this.drawText(truncate(item.description, 35), cols[1].x, this.y - 7, { size: 7 });
      this.drawText(item.unit || 'UN', cols[2].x + 10, this.y - 7, { size: 7 });
      this.drawTextRight(String(item.quantity), cols[3].x + cols[3].w, this.y - 7, { size: 7 });
      this.drawTextRight(formatCurrency(item.unitPrice), cols[4].x + cols[4].w, this.y - 7, { size: 7 });
      this.drawTextRight(item.discountPercent > 0 ? `${item.discountPercent.toFixed(1)}%` : '-', cols[5].x + cols[5].w, this.y - 7, { size: 7 });
      this.drawTextRight(item.discountValue > 0 ? formatCurrency(item.discountValue) : '-', cols[6].x + cols[6].w, this.y - 7, { size: 7 });
      this.drawTextRight(item.surcharge > 0 ? formatCurrency(item.surcharge) : '-', cols[7].x + cols[7].w, this.y - 7, { size: 7 });
      this.drawTextRight(formatCurrency(item.subtotal), cols[8].x + cols[8].w, this.y - 7, { font: this.fontBold, size: 7 });

      totalQty += item.quantity;
      this.y -= 13;
    });

    // Total da seção
    this.drawLine(MARGIN_LEFT, this.y, PAGE_WIDTH - MARGIN_RIGHT, this.y, 0.5);
    this.y -= 12;
    const totalLabel = title.includes('PRODUTO') ? 'Total de Mercadorias' : 'Total de Serviços';
    this.drawText(`${totalLabel}:  ${items.length} item(ns)  |  ${totalQty} unid.`, MARGIN_LEFT + 4, this.y, { size: 7.5, color: GRAY });
    this.drawTextRight(`R$ ${formatCurrency(sectionTotal)}`, PAGE_WIDTH - MARGIN_RIGHT - 4, this.y, { font: this.fontBold, size: 9 });
    this.y -= 10;
    this.drawLine(MARGIN_LEFT, this.y, PAGE_WIDTH - MARGIN_RIGHT, this.y, 0.5);
    this.y -= 6;
  }

  // ==================== BLOCO 5: TOTAIS ====================

  private drawTotals() {
    this.ensureSpace(80);
    this.drawSectionHeader('TOTAIS');

    const rightCol = PAGE_WIDTH - MARGIN_RIGHT - 4;
    const labelX = MARGIN_LEFT + 340;

    const rows: [string, string, boolean?][] = [];

    if (this.data.subtotalProducts > 0) {
      rows.push(['Total Mercadorias', `R$ ${formatCurrency(this.data.subtotalProducts)}`]);
    }
    if (this.data.subtotalServices > 0) {
      rows.push(['Total Serviços', `R$ ${formatCurrency(this.data.subtotalServices)}`]);
    }
    if (this.data.discountValue > 0) {
      const pctStr = this.data.discountPercent > 0 ? ` (${this.data.discountPercent.toFixed(1)}%)` : '';
      rows.push([`(-) Desconto${pctStr}`, `- R$ ${formatCurrency(this.data.discountValue)}`]);
    }
    if (this.data.surchargeValue > 0) {
      rows.push(['(+) Acréscimo', `+ R$ ${formatCurrency(this.data.surchargeValue)}`]);
    }
    if (this.data.freightValue > 0) {
      rows.push(['(+) Frete', `+ R$ ${formatCurrency(this.data.freightValue)}`]);
    }
    rows.push(['TOTAL GERAL', `R$ ${formatCurrency(this.data.totalGeral)}`, true]);

    rows.forEach(([label, value, isBold]) => {
      if (isBold) {
        this.y -= 2;
        this.drawRect(labelX - 6, this.y - 10, rightCol - labelX + 10, 16, PRIMARY);
        this.drawText(label, labelX, this.y - 6, { font: this.fontBold, size: 10, color: rgb(1, 1, 1) });
        this.drawTextRight(value, rightCol, this.y - 6, { font: this.fontBold, size: 10, color: rgb(1, 1, 1) });
        this.y -= 20;
      } else {
        this.drawText(label, labelX, this.y, { size: 8 });
        this.drawTextRight(value, rightCol, this.y, { size: 8 });
        this.y -= 14;
      }
    });

    this.y -= 4;
  }

  // ==================== BLOCO 6: PAGAMENTO ====================

  private drawPayments() {
    this.ensureSpace(60);
    this.drawSectionHeader('PAGAMENTO');

    // Formas utilizadas
    const methods = [...new Set(this.data.payments.map(p => p.paymentMethod))];
    const methodLabels = methods.map(m => PAYMENT_LABELS[m] || m).join(', ');
    this.drawText('Forma(s):', MARGIN_LEFT + 4, this.y, { size: 7, color: GRAY });
    this.drawText(methodLabels, MARGIN_LEFT + 50, this.y, { font: this.fontBold, size: 8 });
    this.y -= 16;

    // Tabela de parcelas
    const pCols = [
      { label: 'Nº',         x: MARGIN_LEFT + 4,   w: 30,  align: 'center' as const },
      { label: 'Forma',      x: MARGIN_LEFT + 40,  w: 120, align: 'left' as const },
      { label: 'Documento',  x: MARGIN_LEFT + 165, w: 100, align: 'left' as const },
      { label: 'Vencimento', x: MARGIN_LEFT + 305, w: 80,  align: 'center' as const },
      { label: 'Valor',      x: MARGIN_LEFT + 420, w: 90,  align: 'right' as const },
    ];

    // Header
    this.drawRect(MARGIN_LEFT, this.y - 11, CONTENT_WIDTH, 14, VERY_LIGHT_GRAY);
    pCols.forEach(col => {
      if (col.align === 'right') {
        this.drawTextRight(col.label, col.x + col.w, this.y - 8, { font: this.fontBold, size: 7, color: GRAY });
      } else {
        this.drawText(col.label, col.x, this.y - 8, { font: this.fontBold, size: 7, color: GRAY });
      }
    });
    this.y -= 16;

    // Rows
    let totalParcelas = 0;
    this.data.payments.forEach((p, idx) => {
      this.ensureSpace(14);

      if (idx % 2 === 1) {
        this.drawRect(MARGIN_LEFT, this.y - 9, CONTENT_WIDTH, 12, VERY_LIGHT_GRAY);
      }

      const parcLabel = `${p.installmentNumber}/${p.totalInstallments}`;
      this.drawText(parcLabel, pCols[0].x + 8, this.y - 7, { size: 7.5 });
      this.drawText(PAYMENT_LABELS[p.paymentMethod] || p.paymentMethod, pCols[1].x, this.y - 7, { size: 7.5 });
      this.drawText(p.documentNumber || '-', pCols[2].x, this.y - 7, { size: 7.5 });
      this.drawText(p.dueDate ? formatDate(p.dueDate) : '-', pCols[3].x + 20, this.y - 7, { size: 7.5 });
      this.drawTextRight(`R$ ${formatCurrency(p.amount)}`, pCols[4].x + pCols[4].w, this.y - 7, { font: this.fontBold, size: 7.5 });

      totalParcelas += p.amount;
      this.y -= 13;
    });

    // Total das parcelas
    this.drawLine(MARGIN_LEFT, this.y, PAGE_WIDTH - MARGIN_RIGHT, this.y, 0.5);
    this.y -= 12;
    this.drawText('Total das Parcelas:', MARGIN_LEFT + 4, this.y, { size: 7.5, color: GRAY });
    this.drawTextRight(`R$ ${formatCurrency(totalParcelas)}`, PAGE_WIDTH - MARGIN_RIGHT - 4, this.y, { font: this.fontBold, size: 9 });
    this.y -= 10;
    this.drawLine(MARGIN_LEFT, this.y, PAGE_WIDTH - MARGIN_RIGHT, this.y, 0.5);
    this.y -= 6;
  }

  // ==================== BLOCO 7: OBSERVAÇÕES + RODAPÉ ====================

  private drawFooter() {
    const notes = this.data.notes;
    const rodape = this.data.company.mensagemRodape;

    if (notes) {
      this.ensureSpace(50);
      this.drawSectionHeader('OBSERVAÇÕES');

      // Wrap text manually
      const maxWidth = CONTENT_WIDTH - 8;
      const lines = this.wrapText(notes, maxWidth, 7.5);
      lines.forEach(line => {
        this.ensureSpace(12);
        this.drawText(line, MARGIN_LEFT + 4, this.y, { size: 7.5 });
        this.y -= 11;
      });

      if (this.data.linkedQuoteNumber) {
        this.drawText(`Orçamento vinculado: ${this.data.linkedQuoteNumber}`, MARGIN_LEFT + 4, this.y, { size: 7, color: GRAY });
        this.y -= 11;
      }

      this.y -= 4;
    }

    // Assinatura
    this.ensureSpace(60);
    this.y -= 20;

    // Linha de assinatura centralizada
    const sigWidth = 200;
    const sigX = (PAGE_WIDTH - sigWidth) / 2;
    this.drawLine(sigX, this.y, sigX + sigWidth, this.y, 0.5);
    this.y -= 12;
    this.drawText('Assinatura do Cliente', sigX + 50, this.y, { size: 8, color: GRAY });
    this.y -= 20;

    // Mensagem rodapé
    if (rodape) {
      this.drawText(rodape, (PAGE_WIDTH - this.fontBold.widthOfTextAtSize(rodape, 9)) / 2, this.y, { font: this.fontBold, size: 9, color: PRIMARY });
    }
  }

  // ==================== TEXT WRAPPING ====================

  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const lines: string[] = [];
    const paragraphs = text.split('\n');

    for (const para of paragraphs) {
      const words = para.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = this.fontRegular.widthOfTextAtSize(testLine, fontSize);

        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
    }

    return lines;
  }
}
