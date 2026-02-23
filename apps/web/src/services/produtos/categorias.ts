import api from '../api'
import type { ApiListResponse, ApiSingleResponse } from '../cadastros/clientes'

export interface CreateCategoriaInput {
  name: string
  description?: string
  [key: string]: unknown
}

export type UpdateCategoriaInput = Partial<CreateCategoriaInput>

export const categoriasService = {
  list: () =>
    api.get<ApiListResponse<Record<string, unknown>>>('/produtos/categorias').then((r) => r.data),

  create: (data: CreateCategoriaInput) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>('/produtos/categorias', data).then((r) => r.data),

  update: (id: string, data: UpdateCategoriaInput) =>
    api.put<ApiSingleResponse<Record<string, unknown>>>(`/produtos/categorias/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiSingleResponse<Record<string, unknown>>>(`/produtos/categorias/${id}`).then((r) => r.data),
}
