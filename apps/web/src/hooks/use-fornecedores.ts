import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fornecedoresService, CreateFornecedorInput, UpdateFornecedorInput } from '../services/cadastros/fornecedores'
import type { ListParams } from '../services/cadastros/clientes'

export function useFornecedores(params?: ListParams) {
  return useQuery({
    queryKey: ['fornecedores', params],
    queryFn: () => fornecedoresService.list(params),
  })
}

export function useFornecedor(id: string) {
  return useQuery({
    queryKey: ['fornecedores', id],
    queryFn: () => fornecedoresService.getById(id),
    enabled: !!id,
  })
}

export function useCreateFornecedor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateFornecedorInput) => fornecedoresService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] })
      toast.success('Fornecedor criado com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao criar fornecedor')
    },
  })
}

export function useUpdateFornecedor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFornecedorInput }) =>
      fornecedoresService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] })
      toast.success('Fornecedor atualizado com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao atualizar fornecedor')
    },
  })
}

export function useRemoveFornecedor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fornecedoresService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] })
      toast.success('Fornecedor removido com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao remover fornecedor')
    },
  })
}
