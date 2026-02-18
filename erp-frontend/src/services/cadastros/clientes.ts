import api from '../api'

export interface ListParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ApiListResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiSingleResponse<T> {
  success: boolean
  data: T
}

export interface CreateClientInput {
  name: string
  tradeName?: string
  type: 'pf' | 'pj'
  document: string
  rg?: string
  stateRegistration?: string
  email: string
  phone?: string
  cellphone?: string
  city?: string
  state?: string
  status?: 'active' | 'inactive' | 'blocked'
  creditLimit?: number
  [key: string]: unknown
}

export type UpdateClientInput = Partial<CreateClientInput>

export const clientesService = {
  list: (params?: ListParams) =>
    api.get<ApiListResponse<Record<string, unknown>>>('/cadastros/clientes', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiSingleResponse<Record<string, unknown>>>(`/cadastros/clientes/${id}`).then((r) => r.data),

  create: (data: CreateClientInput) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>('/cadastros/clientes', data).then((r) => r.data),

  update: (id: string, data: UpdateClientInput) =>
    api.put<ApiSingleResponse<Record<string, unknown>>>(`/cadastros/clientes/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiSingleResponse<Record<string, unknown>>>(`/cadastros/clientes/${id}`).then((r) => r.data),
}
