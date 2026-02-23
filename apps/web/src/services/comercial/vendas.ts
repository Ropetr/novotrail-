import api from '../api'
import type { ListParams, ApiListResponse, ApiSingleResponse } from '../cadastros/clientes'

export interface CreateVendaInput {
  clientId: string
  sellerId?: string
  orcamentoId?: string
  items: Array<{
    productId: string
    quantity: number
    price: number
    discount?: number
  }>
  discount?: number
  paymentMethod?: string
  notes?: string
  [key: string]: unknown
}

export type UpdateVendaInput = Partial<CreateVendaInput>

export const vendasService = {
  list: (params?: ListParams) =>
    api.get<ApiListResponse<Record<string, unknown>>>('/comercial/vendas', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiSingleResponse<Record<string, unknown>>>(`/comercial/vendas/${id}`).then((r) => r.data),

  create: (data: CreateVendaInput) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>('/comercial/vendas', data).then((r) => r.data),

  update: (id: string, data: UpdateVendaInput) =>
    api.put<ApiSingleResponse<Record<string, unknown>>>(`/comercial/vendas/${id}`, data).then((r) => r.data),

  cancelar: (id: string) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>(`/comercial/vendas/${id}/cancelar`).then((r) => r.data),
}
