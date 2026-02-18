import api from '../api'
import type { ListParams, ApiListResponse, ApiSingleResponse } from '../cadastros/clientes'

export interface CreateProductInput {
  name: string
  sku?: string
  ean?: string
  category?: string
  brand?: string
  price: number
  cost?: number
  stock?: number
  status?: 'active' | 'inactive' | 'out_of_stock'
  [key: string]: unknown
}

export type UpdateProductInput = Partial<CreateProductInput>

export const produtosService = {
  list: (params?: ListParams) =>
    api.get<ApiListResponse<Record<string, unknown>>>('/produtos', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiSingleResponse<Record<string, unknown>>>(`/produtos/${id}`).then((r) => r.data),

  create: (data: CreateProductInput) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>('/produtos', data).then((r) => r.data),

  update: (id: string, data: UpdateProductInput) =>
    api.put<ApiSingleResponse<Record<string, unknown>>>(`/produtos/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiSingleResponse<Record<string, unknown>>>(`/produtos/${id}`).then((r) => r.data),
}
