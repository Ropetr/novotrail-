import api from '../api'
import type { ApiSingleResponse } from '../cadastros/clientes'

export interface SalePayment {
  id?: string
  saleId?: string
  quoteId?: string
  paymentMethod: string
  installmentNumber: number
  totalInstallments: number
  documentNumber?: string
  dueDate?: string
  amount: number
  status?: string
  notes?: string
}

export const pagamentosService = {
  listBySale: (saleId: string) =>
    api.get<ApiSingleResponse<SalePayment[]>>(`/comercial/vendas/${saleId}/pagamentos`).then((r) => r.data),

  listByQuote: (quoteId: string) =>
    api.get<ApiSingleResponse<SalePayment[]>>(`/comercial/orcamentos/${quoteId}/pagamentos`).then((r) => r.data),
}

// Formas de pagamento disponíveis (futuro: virá do banco)
export const PAYMENT_METHODS = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'credito_cliente', label: 'Crédito do Cliente' },
] as const
