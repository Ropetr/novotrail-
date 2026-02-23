import api from '../api'
import type { ListParams, ApiListResponse, ApiSingleResponse } from './clientes'

export interface CreateFornecedorInput {
  name: string
  tradeName?: string
  document: string
  email: string
  phone?: string
  cellphone?: string
  city?: string
  state?: string
  status?: 'active' | 'inactive' | 'pending'
  category?: string
  deliveryDays?: number
  [key: string]: unknown
}

export type UpdateFornecedorInput = Partial<CreateFornecedorInput>

export const fornecedoresService = {
  list: (params?: ListParams) =>
    api.get<ApiListResponse<Record<string, unknown>>>('/cadastros/fornecedores', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiSingleResponse<Record<string, unknown>>>(`/cadastros/fornecedores/${id}`).then((r) => r.data),

  create: (data: CreateFornecedorInput) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>('/cadastros/fornecedores', data).then((r) => r.data),

  update: (id: string, data: UpdateFornecedorInput) =>
    api.put<ApiSingleResponse<Record<string, unknown>>>(`/cadastros/fornecedores/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiSingleResponse<Record<string, unknown>>>(`/cadastros/fornecedores/${id}`).then((r) => r.data),
}
