import api from '../api'
import type { ListParams, ApiListResponse, ApiSingleResponse } from '../cadastros/clientes'

export interface CreateDevolucaoInput {
  vendaId: string
  items: Array<{
    productId: string
    quantity: number
    reason?: string
  }>
  reason: string
  notes?: string
  [key: string]: unknown
}

export type UpdateDevolucaoInput = Partial<CreateDevolucaoInput>

export const devolucoesService = {
  list: (params?: ListParams) =>
    api.get<ApiListResponse<Record<string, unknown>>>('/comercial/devolucoes', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiSingleResponse<Record<string, unknown>>>(`/comercial/devolucoes/${id}`).then((r) => r.data),

  create: (data: CreateDevolucaoInput) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>('/comercial/devolucoes', data).then((r) => r.data),

  update: (id: string, data: UpdateDevolucaoInput) =>
    api.put<ApiSingleResponse<Record<string, unknown>>>(`/comercial/devolucoes/${id}`, data).then((r) => r.data),

  aprovar: (id: string) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>(`/comercial/devolucoes/${id}/aprovar`).then((r) => r.data),
}
