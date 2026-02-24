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

// ==================== CONSTANTS (ABNT A4) ====================

const PAGE_W = 595.28;
const PAGE_H = 841.89;

// Margens ABNT: 3cm superior/esquerda, 2cm inferior/direita
const ML = 85.04;  // 3cm
const MR = 56.69;  // 2cm
const MT = 85.04;  // 3cm
const MB = 56.69;  // 2cm
const CW = PAGE_W - ML - MR; // ~453.55

const BLACK = rgb(0, 0, 0);
const DARK = rgb(0.15, 0.15, 0.15);
const GRAY = rgb(0.4, 0.4, 0.4);

const F_TITLE = 13;
const F_SECTION = 8;
const F_LABEL = 6;
const F_VALUE = 7;
const F_TH = 6;
const F_TD = 6;
const F_FOOTER = 8;
const F_SMALL = 6;

const BT = 0.5;   // border thickness
const GT = 0.3;    // grid thickness
const ROW_H = 13;
const HDR_H = 14;

const PAY_LABELS: Record<string, string> = {
  dinheiro: 'DINHEIRO', pix: 'PIX', boleto: 'BOLETO', cheque: 'CHEQUE',
  cartao_credito: 'CARTÃO CRÉDITO', cartao_debito: 'CARTÃO DÉBITO',
  transferencia: 'TRANSFERÊNCIA', credito_cliente: 'CRÉDITO CLIENTE',
};

// ==================== HELPERS ====================

function n2(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function n3(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}
function n5(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 5, maximumFractionDigits: 5 });
}
function fd(s: string): string {
  try {
    const d = new Date(s);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  } catch { return s; }
}
function tr(t: string, m: number): string {
  return t.length > m ? t.substring(0, m - 1) + '…' : t;
}

// ==================== GENERATOR ====================

export class DocumentPdfGenerator {
  private doc!: PDFDocument;
  private pg!: PDFPage;
  private r!: PDFFont;   // regular
  private b!: PDFFont;   // bold
  private y = 0;
  private pn = 0;
  private d!: PdfDocData;

  async generate(data: PdfDocData): Promise<Uint8Array> {
    this.d = data;
    this.doc = await PDFDocument.create();
    this.r = await this.doc.embedFont(StandardFonts.Helvetica);
    this.b = await this.doc.embedFont(StandardFonts.HelveticaBold);
    this.np();
    this.blk1();
    this.blk2();
    const prods = data.items.filter(i => i.itemType === 'product');
    this.blk34(prods, 'DADOS DO PRODUTO', 'DESCRIÇÃO DOS PRODUTOS', 'TOTAL DE MERCADORIAS');
    const servs = data.items.filter(i => i.itemType === 'service');
    this.blk34(servs, 'DADOS DO SERVIÇO', 'DESCRIÇÃO DOS SERVIÇOS', 'TOTAL DE SERVIÇOS');
    this.blk5();
    this.blk6();
    this.blk7();
    this.blk8();
    return this.doc.save();
  }

  // --- Page ---
  private np() {
    this.pg = this.doc.addPage([PAGE_W, PAGE_H]);
    this.y = PAGE_H - MT;
    this.pn++;
  }
  private es(h: number) {
    if (this.y - h < MB) {
      this.np();
      const lb = this.d.type === 'orcamento' ? 'ORÇAMENTO' : 'RECIBO DE VENDA';
      this.t(`${lb} — Nº ${this.d.number} — Continuação`, ML, this.y, this.b, F_SMALL, GRAY);
      this.y -= 12;
      this.hl(ML, this.y, ML + CW);
      this.y -= 8;
    }
  }

  // --- Drawing primitives ---
  private t(s: string, x: number, y: number, f: PDFFont, sz: number, c = DARK) {
    this.pg.drawText(s || '', { x, y, font: f, size: sz, color: c });
  }
  private tR(s: string, x: number, y: number, f: PDFFont, sz: number, c = DARK) {
    const w = f.widthOfTextAtSize(s || '', sz);
    this.pg.drawText(s || '', { x: x - w, y, font: f, size: sz, color: c });
  }
  private tC(s: string, cx: number, y: number, f: PDFFont, sz: number, c = DARK) {
    const w = f.widthOfTextAtSize(s || '', sz);
    this.pg.drawText(s || '', { x: cx - w / 2, y, font: f, size: sz, color: c });
  }
  private hl(x1: number, y: number, x2: number, th = GT) {
    this.pg.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: th, color: BLACK });
  }
  private vl(x: number, y1: number, y2: number, th = GT) {
    this.pg.drawLine({ start: { x, y: y1 }, end: { x, y: y2 }, thickness: th, color: BLACK });
  }
  private box(x: number, y: number, w: number, h: number) {
    this.pg.drawRectangle({ x, y, width: w, height: h, borderColor: BLACK, borderWidth: BT });
  }

  // ==================== BLOCO 1: CABEÇALHO ====================
  private blk1() {
    const c = this.d.company;
    const label = this.d.type === 'orcamento' ? 'ORÇAMENTO' : 'RECIBO DE VENDA';

    // Título centralizado
    this.tC(label, ML + CW / 2, this.y, this.b, F_TITLE, BLACK);
    this.y -= 18;

    const top = this.y;

    // Dados empresa (esquerda)
    let ey = top;
    this.t(c.razaoSocial?.toUpperCase() || '', ML, ey, this.b, 7.5, BLACK);
    ey -= 9;
    const addr = [c.endereco, c.numero].filter(Boolean).join(', ');
    if (addr) { this.t(addr.toUpperCase(), ML, ey, this.r, 6.5); ey -= 8; }
    const loc = [c.bairro, c.cidade].filter(Boolean).join(' / ');
    const uf = c.uf ? ` - ${c.uf}` : '';
    if (loc) { this.t(`${loc}${uf}`.toUpperCase(), ML, ey, this.r, 6.5); ey -= 8; }
    if (c.cnpj) { this.t(`CNPJ/CPF: ${c.cnpj}`, ML, ey, this.r, 6.5); ey -= 8; }
    if (c.ie) { this.t(`IE: ${c.ie}`, ML, ey, this.r, 6.5); ey -= 8; }
    if (c.telefone) { this.t(`Tel: ${c.telefone}`, ML, ey, this.r, 6.5); ey -= 8; }
    if (c.email) { this.t(`Email: ${c.email}`, ML, ey, this.r, 6.5); ey -= 8; }

    // Caixa info documento (direita superior)
    const bw = 155;
    const bh = 50;
    const bx = ML + CW - bw;
    const by = top - bh + 8;
    this.box(bx, by, bw, bh);

    let iy = by + bh - 10;
    this.t(`Nº ${this.d.number}`, bx + 4, iy, this.r, 6.5); iy -= 9;
    if (this.d.sellerName) { this.t(`Vendedor: ${this.d.sellerName.toUpperCase()}`, bx + 4, iy, this.r, 6.5); iy -= 9; }
    this.t(`Data de Criação: ${fd(this.d.date)}`, bx + 4, iy, this.r, 6.5); iy -= 9;
    this.t(`Página ${this.pn} de 1`, bx + 4, iy, this.r, 6.5);
    if (this.d.type === 'orcamento' && this.d.validUntil) {
      iy -= 9;
      this.t(`Válido até: ${fd(this.d.validUntil)}`, bx + 4, iy, this.r, 6.5);
    }

    this.y = Math.min(ey, by) - 14;
  }

  // ==================== BLOCO 2: DESTINATÁRIO ====================
  private blk2() {
    this.es(60);
    const cl = this.d.client;
    const x = ML;
    const w = CW;

    this.t('DESTINATÁRIO', x, this.y, this.b, F_SECTION, BLACK);
    this.y -= 3;
    const top = this.y;

    // 3 rows, each ROW_H height
    const rh = ROW_H;
    const h = rh * 3;

    // Outer border
    this.box(x, top - h, w, h);

    // --- Row 1: NOME/RAZÃO SOCIAL | CNPJ/CPF ---
    const sp1 = x + w * 0.65;
    this.vl(sp1, top, top - rh);
    this.hl(x, top - rh, x + w);

    this.t('NOME/RAZÃO SOCIAL', x + 2, top - F_LABEL - 1, this.b, F_LABEL, GRAY);
    this.t(cl.name?.toUpperCase() || '', x + 2, top - rh + 2, this.r, F_VALUE, BLACK);
    this.t('CNPJ/CPF', sp1 + 2, top - F_LABEL - 1, this.b, F_LABEL, GRAY);
    this.t(cl.document || '', sp1 + 2, top - rh + 2, this.r, F_VALUE, BLACK);

    // --- Row 2: EMAIL | TELEFONE ---
    const r2 = top - rh;
    this.vl(sp1, r2, r2 - rh);
    this.hl(x, r2 - rh, x + w);

    this.t('EMAIL', x + 2, r2 - F_LABEL - 1, this.b, F_LABEL, GRAY);
    this.t(cl.email?.toUpperCase() || '', x + 2, r2 - rh + 2, this.r, F_VALUE, BLACK);
    this.t('TELEFONE', sp1 + 2, r2 - F_LABEL - 1, this.b, F_LABEL, GRAY);
    this.t(cl.phone || '', sp1 + 2, r2 - rh + 2, this.r, F_VALUE, BLACK);

    // --- Row 3: ENDEREÇO | BAIRRO/DISTRITO | CEP ---
    const r3 = top - rh * 2;
    const sp2a = x + w * 0.50;
    const sp2b = x + w * 0.78;
    this.vl(sp2a, r3, r3 - rh);
    this.vl(sp2b, r3, r3 - rh);

    const addrFull = [cl.address, cl.addressNumber].filter(Boolean).join(', ');
    const addrCity = cl.city && cl.state ? ` -${cl.city}/${cl.state}` : '';
    this.t('ENDEREÇO', x + 2, r3 - F_LABEL - 1, this.b, F_LABEL, GRAY);
    this.t(tr(`${addrFull}${addrCity}`.toUpperCase(), 48), x + 2, r3 - rh + 2, this.r, F_VALUE, BLACK);
    this.t('BAIRRO/DISTRITO', sp2a + 2, r3 - F_LABEL - 1, this.b, F_LABEL, GRAY);
    this.t(cl.neighborhood?.toUpperCase() || '', sp2a + 2, r3 - rh + 2, this.r, F_VALUE, BLACK);
    this.t('CEP', sp2b + 2, r3 - F_LABEL - 1, this.b, F_LABEL, GRAY);
    this.t(cl.zipCode || '', sp2b + 2, r3 - rh + 2, this.r, F_VALUE, BLACK);

    this.y = top - h - 10;
  }

  // ==================== BLOCOS 3/4: ITENS ====================
  private blk34(items: PdfItemData[], title: string, descHdr: string, totLabel: string) {
    this.es(46);
    const x = ML;
    const w = CW;

    this.t(title, x, this.y, this.b, F_SECTION, BLACK);
    this.y -= 3;
    const top = this.y;

    // Columns: code(12%) | desc(24%) | unid(5%) | qtd(8%) | vunit(11%) | d%(8%) | d$(8%) | a$(10%) | subtotal(14%)
    const cw = [0.12, 0.24, 0.05, 0.08, 0.11, 0.08, 0.08, 0.10, 0.14].map(p => w * p);
    const cx: number[] = [];
    let sx = x;
    for (const c of cw) { cx.push(sx); sx += c; }

    const hdrs = ['CÓDIGO', descHdr, 'UNID', 'QTD', 'V.UNITÁRIO', 'DESC (%)', 'DESC ($)', 'ACRÉSC ($)', 'SUBTOTAL'];

    // Header row
    this.hl(x, top, x + w, BT);
    this.hl(x, top - HDR_H, x + w, BT);
    this.vl(x, top, top - HDR_H, BT);
    this.vl(x + w, top, top - HDR_H, BT);
    for (let i = 1; i < 9; i++) this.vl(cx[i], top, top - HDR_H);

    for (let i = 0; i < 9; i++) {
      if (i >= 3) {
        this.tR(hdrs[i], cx[i] + cw[i] - 2, top - HDR_H + 4, this.b, F_TH, BLACK);
      } else if (i === 2) {
        this.tC(hdrs[i], cx[i] + cw[i] / 2, top - HDR_H + 4, this.b, F_TH, BLACK);
      } else {
        this.t(hdrs[i], cx[i] + 2, top - HDR_H + 4, this.b, F_TH, BLACK);
      }
    }

    // Data rows
    let ry = top - HDR_H;
    let tQty = 0, tDesc = 0, tAcr = 0, tSub = 0;

    for (const it of items) {
      this.es(ROW_H + 20);
      this.hl(x, ry - ROW_H, x + w);
      this.vl(x, ry, ry - ROW_H, BT);
      this.vl(x + w, ry, ry - ROW_H, BT);
      for (let i = 1; i < 9; i++) this.vl(cx[i], ry, ry - ROW_H);

      const dy = ry - ROW_H + 3;
      this.t(tr(it.code || '', 14), cx[0] + 2, dy, this.r, F_TD);
      this.t(tr(it.description, 28), cx[1] + 2, dy, this.r, F_TD);
      this.tC(it.unit || 'PC', cx[2] + cw[2] / 2, dy, this.r, F_TD);
      this.tR(n3(it.quantity), cx[3] + cw[3] - 2, dy, this.r, F_TD);
      this.tR(n5(it.unitPrice), cx[4] + cw[4] - 2, dy, this.r, F_TD);
      this.tR(n2(it.discountPercent), cx[5] + cw[5] - 2, dy, this.r, F_TD);
      this.tR(n2(it.discountValue), cx[6] + cw[6] - 2, dy, this.r, F_TD);
      this.tR(n2(it.surcharge), cx[7] + cw[7] - 2, dy, this.r, F_TD);
      this.tR(n2(it.subtotal), cx[8] + cw[8] - 2, dy, this.b, F_TD);

      tQty += it.quantity; tDesc += it.discountValue;
      tAcr += it.surcharge; tSub += it.subtotal;
      ry -= ROW_H;
    }

    // Total row
    this.hl(x, ry, x + w, BT);
    this.hl(x, ry - ROW_H, x + w, BT);
    this.vl(x, ry, ry - ROW_H, BT);
    this.vl(x + w, ry, ry - ROW_H, BT);
    // merge code+desc+unid for label
    const mergeEnd = cx[3];
    this.vl(mergeEnd, ry, ry - ROW_H);
    for (let i = 4; i < 9; i++) this.vl(cx[i], ry, ry - ROW_H);

    const ty = ry - ROW_H + 3;
    this.tR(totLabel, mergeEnd - 4, ty, this.b, F_TD, BLACK);
    this.tR(n3(tQty), cx[3] + cw[3] - 2, ty, this.b, F_TD);
    this.tR(n2(tDesc), cx[6] + cw[6] - 2, ty, this.b, F_TD);
    this.tR(n2(tAcr), cx[7] + cw[7] - 2, ty, this.b, F_TD);
    this.tR(n2(tSub), cx[8] + cw[8] - 2, ty, this.b, F_TD);

    this.y = ry - ROW_H - 10;
  }

  // ==================== BLOCO 5: TOTAIS ====================
  private blk5() {
    this.es(115);
    const x = ML;
    const w = CW;

    const rows = [
      ['TOTAL DE MERCADORIAS', n2(this.d.subtotalProducts)],
      ['TOTAL DE SERVIÇOS', n2(this.d.subtotalServices)],
      ['DESCONTO NA VENDA ($)', n2(this.d.discountValue)],
      ['DESCONTO NA VENDA (%)', n2(this.d.discountPercent)],
      ['ACRÉSCIMO NA VENDA ($)', n2(this.d.surchargeValue)],
      ['VALOR FRETE ($)', n2(this.d.freightValue)],
      ['TOTAL', n2(this.d.totalGeral)],
    ];

    this.t('TOTAIS', x, this.y, this.b, F_SECTION, BLACK);
    this.y -= 3;
    const top = this.y;

    const totalH = HDR_H + rows.length * ROW_H;
    this.box(x, top - totalH, w, totalH);

    // Header: "TOTAIS" | "DESCRIÇÃO" | "VALOR"
    const c1 = x + w * 0.15;
    const c2 = x + w * 0.78;
    this.hl(x, top - HDR_H, x + w);
    this.vl(c1, top, top - totalH);
    this.vl(c2, top, top - totalH);

    this.t('TOTAIS', x + 3, top - HDR_H + 4, this.b, F_TH, BLACK);
    this.tC('DESCRIÇÃO', (c1 + c2) / 2, top - HDR_H + 4, this.b, F_TH, BLACK);
    this.tR('VALOR', x + w - 3, top - HDR_H + 4, this.b, F_TH, BLACK);

    let ry = top - HDR_H;
    for (let i = 0; i < rows.length; i++) {
      this.hl(x, ry - ROW_H, x + w);
      const dy = ry - ROW_H + 3;
      const isBold = i === rows.length - 1;
      const f = isBold ? this.b : this.r;
      this.tR(rows[i][0], c2 - 4, dy, f, F_VALUE, BLACK);
      this.tR(rows[i][1], x + w - 3, dy, f, F_VALUE, BLACK);
      ry -= ROW_H;
    }

    this.y = top - totalH - 14;
  }

  // ==================== BLOCO 6: PAGAMENTO ====================
  private blk6() {
    this.es(65);
    const x = ML;
    const w = CW;

    this.t('PAGAMENTO', x, this.y, this.b, F_SECTION, BLACK);
    this.y -= 6;

    // Forma(s) centralizada
    const meths = [...new Set(this.d.payments.map(p => p.paymentMethod))];
    const lbl = meths.map(m => PAY_LABELS[m] || m.toUpperCase()).join(' / ');
    if (lbl) { this.tC(lbl, x + w / 2, this.y, this.b, F_VALUE, BLACK); this.y -= 8; }

    const top = this.y;

    // Cols: Nº PARCELA(22%) | Nº DOC(28%) | DATA VENC(25%) | VALOR(25%)
    const pw = [0.22, 0.28, 0.25, 0.25].map(p => w * p);
    const px: number[] = [];
    let sx = x;
    for (const c of pw) { px.push(sx); sx += c; }
    const pHdrs = ['NÚMERO DA PARCELA', 'NÚMERO DOCUMENTO', 'DATA VENCIMENTO', 'VALOR'];

    // Header
    this.hl(x, top, x + w, BT);
    this.hl(x, top - HDR_H, x + w, BT);
    this.vl(x, top, top - HDR_H, BT);
    this.vl(x + w, top, top - HDR_H, BT);
    for (let i = 1; i < 4; i++) this.vl(px[i], top, top - HDR_H);
    for (let i = 0; i < 4; i++) this.tC(pHdrs[i], px[i] + pw[i] / 2, top - HDR_H + 4, this.b, F_TH, BLACK);

    // Data rows
    let ry = top - HDR_H;
    let tPar = 0;

    for (const p of this.d.payments) {
      this.hl(x, ry - ROW_H, x + w);
      this.vl(x, ry, ry - ROW_H, BT);
      this.vl(x + w, ry, ry - ROW_H, BT);
      for (let i = 1; i < 4; i++) this.vl(px[i], ry, ry - ROW_H);

      const dy = ry - ROW_H + 3;
      this.tC(String(p.installmentNumber), px[0] + pw[0] / 2, dy, this.r, F_TD);
      this.tC(p.documentNumber || '', px[1] + pw[1] / 2, dy, this.r, F_TD);
      this.tC(p.dueDate ? fd(p.dueDate) : '', px[2] + pw[2] / 2, dy, this.r, F_TD);
      this.tR(n2(p.amount), px[3] + pw[3] - 3, dy, this.r, F_TD);
      tPar += p.amount;
      ry -= ROW_H;
    }

    // Total row
    this.hl(x, ry - ROW_H, x + w, BT);
    this.vl(x, ry, ry - ROW_H, BT);
    this.vl(x + w, ry, ry - ROW_H, BT);
    this.vl(px[3], ry, ry - ROW_H);

    const tdy = ry - ROW_H + 3;
    this.tR('TOTAL', px[3] - 4, tdy, this.b, F_TD, BLACK);
    this.tR(n2(tPar), px[3] + pw[3] - 3, tdy, this.b, F_TD, BLACK);

    this.y = ry - ROW_H - 14;
  }

  // ==================== BLOCO 7: OBSERVAÇÕES ====================
  private blk7() {
    const notes = this.d.notes;
    const linked = this.d.linkedQuoteNumber;
    if (!notes && !linked) return;

    this.es(45);
    const x = ML;
    const w = CW;

    this.t('OBSERVAÇÕES', x, this.y, this.b, F_SECTION, BLACK);
    this.y -= 3;
    const top = this.y;

    const lines = this.wrap(notes || '', w - 8, F_VALUE);
    if (linked) lines.push(`Pedido/Orçamento Vinculado: ${linked}`);
    const bh = Math.max(28, lines.length * 10 + 10);

    this.box(x, top - bh, w, bh);

    let ly = top - 9;
    for (const l of lines) { this.t(l, x + 4, ly, this.r, F_VALUE, BLACK); ly -= 10; }

    this.y = top - bh - 16;
  }

  // ==================== BLOCO 8: ASSINATURA + RODAPÉ ====================
  private blk8() {
    this.es(75);
    const cl = this.d.client;
    const cx = ML + CW / 2;

    this.y -= 20;
    const lw = 170;
    this.hl(cx - lw / 2, this.y, cx + lw / 2, BT);
    this.y -= 11;
    this.tC(cl.name?.toUpperCase() || '', cx, this.y, this.r, F_VALUE, BLACK);
    this.y -= 9;
    if (cl.document) { this.tC(cl.document, cx, this.y, this.r, F_VALUE, BLACK); this.y -= 9; }
    this.y -= 16;

    const rod = this.d.company.mensagemRodape;
    if (rod) this.tC(rod.toUpperCase(), cx, this.y, this.b, F_FOOTER, BLACK);
  }

  // --- Text wrap ---
  private wrap(text: string, maxW: number, sz: number): string[] {
    const out: string[] = [];
    for (const p of text.split('\n')) {
      const ws = p.split(' ');
      let cur = '';
      for (const w of ws) {
        const test = cur ? `${cur} ${w}` : w;
        if (this.r.widthOfTextAtSize(test, sz) > maxW && cur) { out.push(cur); cur = w; }
        else cur = test;
      }
      if (cur) out.push(cur);
    }
    return out;
  }
}
