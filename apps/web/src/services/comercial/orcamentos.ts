import api from '../api'
import type { ListParams, ApiListResponse, ApiSingleResponse } from '../cadastros/clientes'

export interface CreateOrcamentoInput {
  clientId: string
  sellerId?: string
  items: Array<{
    productId: string
    quantity: number
    price: number
    discount?: number
  }>
  discount?: number
  validUntil?: string
  notes?: string
  [key: string]: unknown
}

export type UpdateOrcamentoInput = Partial<CreateOrcamentoInput>

export const orcamentosService = {
  list: (params?: ListParams) =>
    api.get<ApiListResponse<Record<string, unknown>>>('/comercial/orcamentos', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiSingleResponse<Record<string, unknown>>>(`/comercial/orcamentos/${id}`).then((r) => r.data),

  create: (data: CreateOrcamentoInput) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>('/comercial/orcamentos', data).then((r) => r.data),

  update: (id: string, data: UpdateOrcamentoInput) =>
    api.put<ApiSingleResponse<Record<string, unknown>>>(`/comercial/orcamentos/${id}`, data).then((r) => r.data),

  aprovar: (id: string) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>(`/comercial/orcamentos/${id}/aprovar`).then((r) => r.data),

  converterEmVenda: (id: string) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>(`/comercial/orcamentos/${id}/venda`).then((r) => r.data),
}
