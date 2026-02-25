/**
 * XML Parser Service
 * Extrai dados estruturados de XMLs de NF-e, CT-e e NFS-e.
 * Converte XML bruto em objetos tipados para processamento no pipeline.
 */

// ============================================
// Tipos de dados extraídos
// ============================================

export interface NFeParseResult {
  // Identificação
  chaveAcesso: string;
  numero: number;
  serie: number;
  dataEmissao: string;
  naturezaOperacao: string;
  tipoOperacao: 'entrada' | 'saida';
  finalidade: 'normal' | 'complementar' | 'ajuste' | 'devolucao';

  // Emitente
  emitente: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia?: string;
    ie?: string;
    uf: string;
    crt: number;
  };

  // Destinatário
  destinatario: {
    cpfCnpj: string;
    razaoSocial: string;
    ie?: string;
    uf: string;
  };

  // Totais
  totais: {
    valorProdutos: number;
    valorFrete: number;
    valorSeguro: number;
    valorDesconto: number;
    valorOutros: number;
    valorTotal: number;
    icmsBase: number;
    icmsValor: number;
    icmsStBase: number;
    icmsStValor: number;
    ipiValor: number;
    pisValor: number;
    cofinsValor: number;
    fecopValor: number;
  };

  // Itens
  itens: NFeItemParsed[];

  // Transporte
  transporte?: {
    modalidade: number;
    cnpjTransportador?: string;
    nomeTransportador?: string;
    volumes?: number;
    pesoLiquido?: number;
    pesoBruto?: number;
  };

  // Cobrança
  cobranca?: {
    duplicatas: Array<{
      numero: string;
      vencimento: string;
      valor: number;
    }>;
  };

  // Informações adicionais
  informacoesComplementares?: string;
  informacoesFisco?: string;
}

export interface NFeItemParsed {
  nItem: number;
  codigoProduto: string;
  descricao: string;
  ncm: string;
  cest?: string;
  cfop: string;
  unidade: string;
  ean?: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  valorDesconto: number;
  valorFrete: number;

  // ICMS
  icmsOrigem: string;
  icmsCst: string;
  icmsBase: number;
  icmsAliquota: number;
  icmsValor: number;
  icmsStBase: number;
  icmsStAliquota: number;
  icmsStValor: number;

  // IPI
  ipiCst?: string;
  ipiBase?: number;
  ipiAliquota?: number;
  ipiValor?: number;

  // PIS
  pisCst?: string;
  pisBase?: number;
  pisAliquota?: number;
  pisValor?: number;

  // COFINS
  cofinsCst?: string;
  cofinsBase?: number;
  cofinsAliquota?: number;
  cofinsValor?: number;
}

// ============================================
// Parser
// ============================================

export class XMLParser {
  /**
   * Parse de XML de NF-e
   */
  static parseNFe(xmlString: string): NFeParseResult {
    // Usar regex para extrair dados do XML (Cloudflare Workers não tem DOMParser nativo)
    const getTag = (xml: string, tag: string): string => {
      const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
      const match = xml.match(regex);
      return match ? match[1].trim() : '';
    };

    const getTagNum = (xml: string, tag: string): number => {
      const val = getTag(xml, tag);
      return val ? parseFloat(val) : 0;
    };

    const getBlock = (xml: string, tag: string): string => {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
      const match = xml.match(regex);
      return match ? match[1] : '';
    };

    const getAllBlocks = (xml: string, tag: string): string[] => {
      const regex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?</${tag}>`, 'gi');
      return xml.match(regex) || [];
    };

    // Extrair blocos principais
    const infNFe = getBlock(xmlString, 'infNFe');
    const ide = getBlock(infNFe, 'ide');
    const emit = getBlock(infNFe, 'emit');
    const dest = getBlock(infNFe, 'dest');
    const total = getBlock(infNFe, 'total');
    const icmsTot = getBlock(total, 'ICMSTot');
    const transp = getBlock(infNFe, 'transp');
    const cobr = getBlock(infNFe, 'cobr');
    const infAdic = getBlock(infNFe, 'infAdic');

    // Extrair chave de acesso do atributo Id
    const idMatch = infNFe.match(/Id="NFe(\d{44})"/);
    const chaveAcesso = idMatch ? idMatch[1] : '';

    // Finalidade
    const finNFe = getTag(ide, 'finNFe');
    const finalidadeMap: Record<string, NFeParseResult['finalidade']> = {
      '1': 'normal', '2': 'complementar', '3': 'ajuste', '4': 'devolucao',
    };

    // Itens
    const detBlocks = getAllBlocks(infNFe, 'det');
    const itens: NFeItemParsed[] = detBlocks.map((det) => {
      const prod = getBlock(det, 'prod');
      const imposto = getBlock(det, 'imposto');
      const icms = getBlock(imposto, 'ICMS');
      const icmsInner = icms.replace(/<ICMS>|<\/ICMS>/g, '');
      const ipi = getBlock(imposto, 'IPI');
      const pis = getBlock(imposto, 'PIS');
      const cofins = getBlock(imposto, 'COFINS');

      const nItemMatch = det.match(/nItem="(\d+)"/);

      return {
        nItem: nItemMatch ? parseInt(nItemMatch[1]) : 0,
        codigoProduto: getTag(prod, 'cProd'),
        descricao: getTag(prod, 'xProd'),
        ncm: getTag(prod, 'NCM'),
        cest: getTag(prod, 'CEST') || undefined,
        cfop: getTag(prod, 'CFOP'),
        unidade: getTag(prod, 'uCom'),
        ean: getTag(prod, 'cEAN') || getTag(prod, 'cEANTrib') || undefined,
        quantidade: getTagNum(prod, 'qCom'),
        valorUnitario: getTagNum(prod, 'vUnCom'),
        valorTotal: getTagNum(prod, 'vProd'),
        valorDesconto: getTagNum(prod, 'vDesc'),
        valorFrete: getTagNum(prod, 'vFrete'),

        // ICMS
        icmsOrigem: getTag(icmsInner, 'orig') || '0',
        icmsCst: getTag(icmsInner, 'CST') || getTag(icmsInner, 'CSOSN') || '',
        icmsBase: getTagNum(icmsInner, 'vBC'),
        icmsAliquota: getTagNum(icmsInner, 'pICMS'),
        icmsValor: getTagNum(icmsInner, 'vICMS'),
        icmsStBase: getTagNum(icmsInner, 'vBCST'),
        icmsStAliquota: getTagNum(icmsInner, 'pICMSST'),
        icmsStValor: getTagNum(icmsInner, 'vICMSST'),

        // IPI
        ipiCst: getTag(ipi, 'CST') || undefined,
        ipiBase: getTagNum(ipi, 'vBC') || undefined,
        ipiAliquota: getTagNum(ipi, 'pIPI') || undefined,
        ipiValor: getTagNum(ipi, 'vIPI') || undefined,

        // PIS
        pisCst: getTag(pis, 'CST') || undefined,
        pisBase: getTagNum(pis, 'vBC') || undefined,
        pisAliquota: getTagNum(pis, 'pPIS') || undefined,
        pisValor: getTagNum(pis, 'vPIS') || undefined,

        // COFINS
        cofinsCst: getTag(cofins, 'CST') || undefined,
        cofinsBase: getTagNum(cofins, 'vBC') || undefined,
        cofinsAliquota: getTagNum(cofins, 'pCOFINS') || undefined,
        cofinsValor: getTagNum(cofins, 'vCOFINS') || undefined,
      };
    });

    // Duplicatas
    const dupBlocks = getAllBlocks(cobr, 'dup');
    const duplicatas = dupBlocks.map((dup) => ({
      numero: getTag(dup, 'nDup'),
      vencimento: getTag(dup, 'dVenc'),
      valor: getTagNum(dup, 'vDup'),
    }));

    return {
      chaveAcesso,
      numero: parseInt(getTag(ide, 'nNF')) || 0,
      serie: parseInt(getTag(ide, 'serie')) || 0,
      dataEmissao: getTag(ide, 'dhEmi'),
      naturezaOperacao: getTag(ide, 'natOp'),
      tipoOperacao: getTag(ide, 'tpNF') === '0' ? 'entrada' : 'saida',
      finalidade: finalidadeMap[finNFe] || 'normal',

      emitente: {
        cnpj: getTag(emit, 'CNPJ'),
        razaoSocial: getTag(emit, 'xNome'),
        nomeFantasia: getTag(emit, 'xFant') || undefined,
        ie: getTag(emit, 'IE') || undefined,
        uf: getTag(getBlock(emit, 'enderEmit'), 'UF'),
        crt: parseInt(getTag(emit, 'CRT')) || 3,
      },

      destinatario: {
        cpfCnpj: getTag(dest, 'CNPJ') || getTag(dest, 'CPF'),
        razaoSocial: getTag(dest, 'xNome'),
        ie: getTag(dest, 'IE') || undefined,
        uf: getTag(getBlock(dest, 'enderDest'), 'UF'),
      },

      totais: {
        valorProdutos: getTagNum(icmsTot, 'vProd'),
        valorFrete: getTagNum(icmsTot, 'vFrete'),
        valorSeguro: getTagNum(icmsTot, 'vSeg'),
        valorDesconto: getTagNum(icmsTot, 'vDesc'),
        valorOutros: getTagNum(icmsTot, 'vOutro'),
        valorTotal: getTagNum(icmsTot, 'vNF'),
        icmsBase: getTagNum(icmsTot, 'vBC'),
        icmsValor: getTagNum(icmsTot, 'vICMS'),
        icmsStBase: getTagNum(icmsTot, 'vBCST'),
        icmsStValor: getTagNum(icmsTot, 'vST'),
        ipiValor: getTagNum(icmsTot, 'vIPI'),
        pisValor: getTagNum(icmsTot, 'vPIS'),
        cofinsValor: getTagNum(icmsTot, 'vCOFINS'),
        fecopValor: getTagNum(icmsTot, 'vFCPST') + getTagNum(icmsTot, 'vFCP'),
      },

      itens,

      transporte: transp
        ? {
            modalidade: parseInt(getTag(transp, 'modFrete')) || 0,
            cnpjTransportador: getTag(getBlock(transp, 'transporta'), 'CNPJ') || undefined,
            nomeTransportador: getTag(getBlock(transp, 'transporta'), 'xNome') || undefined,
            volumes: parseInt(getTag(getBlock(transp, 'vol'), 'qVol')) || undefined,
            pesoLiquido: getTagNum(getBlock(transp, 'vol'), 'pesoL') || undefined,
            pesoBruto: getTagNum(getBlock(transp, 'vol'), 'pesoB') || undefined,
          }
        : undefined,

      cobranca: duplicatas.length > 0 ? { duplicatas } : undefined,

      informacoesComplementares: getTag(infAdic, 'infCpl') || undefined,
      informacoesFisco: getTag(infAdic, 'infAdFisco') || undefined,
    };
  }
}
