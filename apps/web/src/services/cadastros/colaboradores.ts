import api from '../api'
import type { ListParams, ApiListResponse, ApiSingleResponse } from './clientes'

export interface CreateColaboradorInput {
  name: string
  cpf: string
  email: string
  phone?: string
  cellphone?: string
  position: string
  department: string
  admissionDate?: string
  contractType?: 'CLT' | 'PJ' | 'Estagio' | 'Temporario'
  status?: 'ativo' | 'ferias' | 'afastado' | 'desligado'
  [key: string]: unknown
}

export type UpdateColaboradorInput = Partial<CreateColaboradorInput>

export const colaboradoresService = {
  list: (params?: ListParams) =>
    api.get<ApiListResponse<Record<string, unknown>>>('/cadastros/colaboradores', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiSingleResponse<Record<string, unknown>>>(`/cadastros/colaboradores/${id}`).then((r) => r.data),

  create: (data: CreateColaboradorInput) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>('/cadastros/colaboradores', data).then((r) => r.data),

  update: (id: string, data: UpdateColaboradorInput) =>
    api.put<ApiSingleResponse<Record<string, unknown>>>(`/cadastros/colaboradores/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiSingleResponse<Record<string, unknown>>>(`/cadastros/colaboradores/${id}`).then((r) => r.data),
}
