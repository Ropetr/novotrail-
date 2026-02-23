import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { produtosService, CreateProductInput, UpdateProductInput } from '../services/produtos/produtos'
import type { ListParams } from '../services/cadastros/clientes'

export function useProdutos(params?: ListParams) {
  return useQuery({
    queryKey: ['produtos', params],
    queryFn: () => produtosService.list(params),
  })
}

export function useProduto(id: string) {
  return useQuery({
    queryKey: ['produtos', id],
    queryFn: () => produtosService.getById(id),
    enabled: !!id,
  })
}

export function useCreateProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductInput) => produtosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      toast.success('Produto criado com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao criar produto')
    },
  })
}

export function useUpdateProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      produtosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      toast.success('Produto atualizado com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao atualizar produto')
    },
  })
}

export function useRemoveProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => produtosService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      toast.success('Produto removido com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao remover produto')
    },
  })
}
