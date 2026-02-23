import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { creditosService, CreateCreditoInput, UsarCreditoInput } from '../services/comercial/creditos'

export function useCreditosByClient(clientId: string) {
  return useQuery({
    queryKey: ['creditos', clientId],
    queryFn: () => creditosService.listByClient(clientId),
    enabled: !!clientId,
  })
}

export function useCreditoSummary(clientId: string) {
  return useQuery({
    queryKey: ['creditos', 'summary', clientId],
    queryFn: () => creditosService.getSummary(clientId),
    enabled: !!clientId,
  })
}

export function useCredito(id: string) {
  return useQuery({
    queryKey: ['creditos', 'detail', id],
    queryFn: () => creditosService.getById(id),
    enabled: !!id,
  })
}

export function useCreateCredito() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCreditoInput) => creditosService.create(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['creditos', variables.clientId] })
      toast.success('Crédito criado com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao criar crédito')
    },
  })
}

export function useUsarCredito() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UsarCreditoInput }) =>
      creditosService.usar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditos'] })
      toast.success('Crédito utilizado com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao utilizar crédito')
    },
  })
}

export function useCancelarCredito() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => creditosService.cancelar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditos'] })
      toast.success('Crédito cancelado')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao cancelar crédito')
    },
  })
}
