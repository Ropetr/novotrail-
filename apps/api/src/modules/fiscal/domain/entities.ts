// ==================== Fiscal Config ====================
export interface FiscalConfig {
  id: string;
  tenantId: string;
  cnpjEmpresa: string | null;
  ieEmpresa: string | null;
  razaoSocial: string | null;
  regimeTributario: 'simples_nacional' | 'lucro_presumido' | 'lucro_real' | null;
  ufEmpresa: string | null;
  codigoMunicipioIbge: string | null;
  inboxSyncAutomatico: boolean;
  inboxIntervaloMinutos: number;
  inboxManifestacaoAutomatica: boolean;
  inboxTipoManifestacaoAuto: string;
  emissaoAmbiente: 'homologacao' | 'producao';
  emissaoSerieNfe: number;
  emissaoSerieNfse: number;
  emissaoSerieCte: number;
  gnreGeracaoAutomatica: boolean;
  adrcstOpcaoRecuperacao: boolean;
  adrcstOpcaoRessarcimento: boolean;
  adrcstOpcaoComplementacao: boolean;
  onboardingCompleto: boolean;
  onboardingEtapaAtual: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateFiscalConfigDTO {
  cnpjEmpresa?: string;
  ieEmpresa?: string;
  razaoSocial?: string;
  regimeTributario?: 'simples_nacional' | 'lucro_presumido' | 'lucro_real';
  ufEmpresa?: string;
  codigoMunicipioIbge?: string;
  inboxSyncAutomatico?: boolean;
  inboxIntervaloMinutos?: number;
  inboxManifestacaoAutomatica?: boolean;
  inboxTipoManifestacaoAuto?: string;
  emissaoAmbiente?: 'homologacao' | 'producao';
  emissaoSerieNfe?: number;
  emissaoSerieNfse?: number;
  emissaoSerieCte?: number;
  gnreGeracaoAutomatica?: boolean;
  adrcstOpcaoRecuperacao?: boolean;
  adrcstOpcaoRessarcimento?: boolean;
  adrcstOpcaoComplementacao?: boolean;
  onboardingCompleto?: boolean;
  onboardingEtapaAtual?: number;
}

// ==================== Product Tax Rules ====================
export interface ProductTaxRule {
  id: string;
  tenantId: string;
  productId: string;
  ufDestino: string | null;
  tipoOperacao: string;
  tipoCliente: string | null;
  cfopDentroEstado: string;
  cfopForaEstado: string;
  cstIcms: string | null;
  csosn: string | null;
  aliquotaIcms: string;
  aliquotaIcmsSt: string;
  reducaoBc: string;
  mva: string;
  aliquotaIcmsInterestadual: string | null;
  cstIpi: string;
  aliquotaIpi: string;
  cstPis: string;
  aliquotaPis: string;
  cstCofins: string;
  aliquotaCofins: string;
  codigoBeneficio: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductTaxRuleDTO {
  productId: string;
  ufDestino?: string | null;
  tipoOperacao?: string;
  tipoCliente?: string | null;
  cfopDentroEstado: string;
  cfopForaEstado: string;
  cstIcms?: string | null;
  csosn?: string | null;
  aliquotaIcms?: string;
  aliquotaIcmsSt?: string;
  reducaoBc?: string;
  mva?: string;
  aliquotaIcmsInterestadual?: string | null;
  cstIpi?: string;
  aliquotaIpi?: string;
  cstPis?: string;
  aliquotaPis?: string;
  cstCofins?: string;
  aliquotaCofins?: string;
  codigoBeneficio?: string | null;
  isDefault?: boolean;
}

export interface UpdateProductTaxRuleDTO extends Partial<CreateProductTaxRuleDTO> {}

// ==================== Onboarding Status ====================
export interface OnboardingStatus {
  etapaAtual: number;
  completo: boolean;
  checklist: {
    dadosEmpresa: boolean;    // CNPJ, IE, endereço, CRT preenchidos
    certificado: boolean;      // Certificado A1 válido cadastrado
    configNfe: boolean;        // Ambiente e série configurados
    ncmProdutos: boolean;      // % de produtos com NCM preenchido
    taxRules: boolean;         // Regras tributárias geradas
  };
  totalProdutos: number;
  produtosComNcm: number;
  produtosComTaxRules: number;
}
