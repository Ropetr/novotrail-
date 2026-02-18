import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { parceirosService, CreateParceiroInput, UpdateParceiroInput } from '../services/cadastros/parceiros'
import type { ListParams } from '../services/cadastros/clientes'

export function useParceiros(params?: ListParams) {
  return useQuery({
    queryKey: ['parceiros', params],
    queryFn: () => parceirosService.list(params),
  })
}

export function useParceiro(id: string) {
  return useQuery({
    queryKey: ['parceiros', id],
    queryFn: () => parceirosService.getById(id),
    enabled: !!id,
  })
}

export function useCreateParceiro() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateParceiroInput) => parceirosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parceiros'] })
      toast.success('Parceiro criado com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao criar parceiro')
    },
  })
}

export function useUpdateParceiro() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateParceiroInput }) =>
      parceirosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parceiros'] })
      toast.success('Parceiro atualizado com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao atualizar parceiro')
    },
  })
}

export function useRemoveParceiro() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => parceirosService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parceiros'] })
      toast.success('Parceiro removido com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao remover parceiro')
    },
  })
}
