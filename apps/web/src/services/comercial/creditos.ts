import api from '../api'
import type { ApiSingleResponse } from '../cadastros/clientes'

export interface CreateCreditoInput {
  clientId: string
  origin: 'referral' | 'return' | 'bonus' | 'advance' | 'adjustment'
  originId?: string
  description?: string
  amount: number
  expiresAt?: string
  notes?: string
}

export interface UsarCreditoInput {
  amount: number
  saleId?: string
  deliveryId?: string
  notes?: string
}

export interface CreditSummary {
  totalBalance: number
  credits: Record<string, unknown>[]
  recentMovements: Record<string, unknown>[]
}

export const creditosService = {
  listByClient: (clientId: string) =>
    api.get<ApiSingleResponse<Record<string, unknown>[]>>(`/comercial/creditos/cliente/${clientId}`).then((r) => r.data),

  getSummary: (clientId: string) =>
    api.get<ApiSingleResponse<CreditSummary>>(`/comercial/creditos/cliente/${clientId}/resumo`).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiSingleResponse<Record<string, unknown>>>(`/comercial/creditos/${id}`).then((r) => r.data),

  create: (data: CreateCreditoInput) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>('/comercial/creditos', data).then((r) => r.data),

  usar: (id: string, data: UsarCreditoInput) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>(`/comercial/creditos/${id}/usar`, data).then((r) => r.data),

  cancelar: (id: string) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>(`/comercial/creditos/${id}/cancelar`).then((r) => r.data),
}
