import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { devolucoesService, CreateDevolucaoInput, UpdateDevolucaoInput } from '../services/comercial/devolucoes'
import type { ListParams } from '../services/cadastros/clientes'

export function useDevolucoes(params?: ListParams) {
  return useQuery({
    queryKey: ['devolucoes', params],
    queryFn: () => devolucoesService.list(params),
  })
}

export function useDevolucao(id: string) {
  return useQuery({
    queryKey: ['devolucoes', id],
    queryFn: () => devolucoesService.getById(id),
    enabled: !!id,
  })
}

export function useCreateDevolucao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDevolucaoInput) => devolucoesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devolucoes'] })
      toast.success('Devolucao criada com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao criar devolucao')
    },
  })
}

export function useUpdateDevolucao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDevolucaoInput }) =>
      devolucoesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devolucoes'] })
      toast.success('Devolucao atualizada com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao atualizar devolucao')
    },
  })
}

export function useAprovarDevolucao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => devolucoesService.aprovar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devolucoes'] })
      toast.success('Devolucao aprovada com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao aprovar devolucao')
    },
  })
}
