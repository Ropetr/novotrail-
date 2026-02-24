export interface TenantSettings {
  id: string;
  tenantId: string;

  // Dados da Empresa
  razaoSocial: string | null;
  nomeFantasia: string | null;
  cnpj: string | null;
  ie: string | null;
  im: string | null;

  // Endereço
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;

  // Contato
  telefone: string | null;
  celular: string | null;
  email: string | null;
  site: string | null;

  // Logos
  logoUrl: string | null;
  logoFiscalUrl: string | null;

  // Observações Padrão
  obsPadraoOrcamento: string | null;
  obsPadraoVenda: string | null;
  obsPadraoNfe: string | null;

  // Rodapé
  mensagemRodape: string | null;

  // Regime Tributário
  regimeTributario: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export type UpdateTenantSettingsDTO = Partial<Omit<TenantSettings, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>;
