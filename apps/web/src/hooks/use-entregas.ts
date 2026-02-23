import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { entregasService, CreateEntregaInput, ConfirmDeliveryInput } from '../services/comercial/entregas'

export function useEntregasBySale(saleId: string) {
  return useQuery({
    queryKey: ['entregas', saleId],
    queryFn: () => entregasService.listBySale(saleId),
    enabled: !!saleId,
  })
}

export function useEntrega(id: string) {
  return useQuery({
    queryKey: ['entregas', 'detail', id],
    queryFn: () => entregasService.getById(id),
    enabled: !!id,
  })
}

export function useCreateEntrega() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEntregaInput) => entregasService.create(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entregas', variables.saleId] })
      queryClient.invalidateQueries({ queryKey: ['vendas'] })
      toast.success('Entrega criada com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao criar entrega')
    },
  })
}

export function useSepararEntrega() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => entregasService.separar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] })
      toast.success('Separação iniciada!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao iniciar separação')
    },
  })
}

export function useConfirmarSeparacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => entregasService.confirmarSeparacao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] })
      toast.success('Separação confirmada!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao confirmar separação')
    },
  })
}

export function useConfirmarEntrega() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConfirmDeliveryInput }) =>
      entregasService.confirmarEntrega(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] })
      queryClient.invalidateQueries({ queryKey: ['vendas'] })
      toast.success('Entrega confirmada!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao confirmar entrega')
    },
  })
}

export function useCancelarEntrega() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => entregasService.cancelar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] })
      toast.success('Entrega cancelada')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao cancelar entrega')
    },
  })
}
