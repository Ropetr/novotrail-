import api from '../api'
import type { ListParams, ApiListResponse, ApiSingleResponse } from './clientes'

export interface CreateParceiroInput {
  name: string
  tradeName?: string
  type: 'pf' | 'pj'
  document: string
  email: string
  phone?: string
  cellphone?: string
  city?: string
  state?: string
  status?: 'active' | 'inactive'
  clientId?: string
  commissionRate?: number
  [key: string]: unknown
}

export type UpdateParceiroInput = Partial<CreateParceiroInput>

export const parceirosService = {
  list: (params?: ListParams) =>
    api.get<ApiListResponse<Record<string, unknown>>>('/cadastros/parceiros', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiSingleResponse<Record<string, unknown>>>(`/cadastros/parceiros/${id}`).then((r) => r.data),

  create: (data: CreateParceiroInput) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>('/cadastros/parceiros', data).then((r) => r.data),

  update: (id: string, data: UpdateParceiroInput) =>
    api.put<ApiSingleResponse<Record<string, unknown>>>(`/cadastros/parceiros/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiSingleResponse<Record<string, unknown>>>(`/cadastros/parceiros/${id}`).then((r) => r.data),
}
