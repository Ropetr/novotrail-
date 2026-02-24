import api from '../api'
import type { ApiSingleResponse } from '../cadastros/clientes'

export interface TenantSettings {
  id?: string
  tenantId?: string
  razaoSocial?: string
  nomeFantasia?: string
  cnpj?: string
  ie?: string
  im?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  uf?: string
  cep?: string
  telefone?: string
  celular?: string
  email?: string
  site?: string
  logoUrl?: string
  logoFiscalUrl?: string
  obsPadraoOrcamento?: string
  obsPadraoVenda?: string
  obsPadraoNfe?: string
  mensagemRodape?: string
  regimeTributario?: string
}

export const configuracoesService = {
  getEmpresa: () =>
    api.get<ApiSingleResponse<TenantSettings>>('/configuracoes/empresa').then((r) => r.data),

  updateEmpresa: (data: Partial<TenantSettings>) =>
    api.put<ApiSingleResponse<TenantSettings>>('/configuracoes/empresa', data).then((r) => r.data),

  uploadLogo: (file: File, type: 'logo' | 'logoFiscal' = 'logo') => {
    const formData = new FormData()
    formData.append(type, file)
    return api.post<ApiSingleResponse<{ field: string; key: string }>>('/configuracoes/empresa/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  deleteLogo: (type: 'logo' | 'logoFiscal' = 'logo') =>
    api.delete<ApiSingleResponse<{ message: string }>>(`/configuracoes/empresa/logo?type=${type}`).then((r) => r.data),

  getLogoUrl: (type: 'logo' | 'logoFiscal' = 'logo') =>
    `${api.defaults.baseURL}/configuracoes/empresa/logo?type=${type}`,
}
