import api from '../api'
import type { ApiSingleResponse } from '../cadastros/clientes'

export interface CreateEntregaInput {
  saleId: string
  deliveryType?: 'pickup' | 'delivery'
  scheduledDate?: string
  paymentMethod?: string
  freightAmount?: number
  notes?: string
  items: Array<{
    saleItemId: string
    productId: string
    quantity: number
  }>
}

export interface ConfirmDeliveryInput {
  receiverName: string
  receiverDocument?: string
}

export const entregasService = {
  listBySale: (saleId: string) =>
    api.get<ApiSingleResponse<Record<string, unknown>[]>>(`/comercial/vendas/${saleId}/entregas`).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiSingleResponse<Record<string, unknown>>>(`/comercial/entregas/${id}`).then((r) => r.data),

  create: (data: CreateEntregaInput) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>('/comercial/entregas', data).then((r) => r.data),

  separar: (id: string) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>(`/comercial/entregas/${id}/separar`).then((r) => r.data),

  confirmarSeparacao: (id: string) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>(`/comercial/entregas/${id}/confirmar-separacao`).then((r) => r.data),

  confirmarEntrega: (id: string, data: ConfirmDeliveryInput) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>(`/comercial/entregas/${id}/confirmar-entrega`, data).then((r) => r.data),

  cancelar: (id: string) =>
    api.post<ApiSingleResponse<Record<string, unknown>>>(`/comercial/entregas/${id}/cancelar`).then((r) => r.data),
}
