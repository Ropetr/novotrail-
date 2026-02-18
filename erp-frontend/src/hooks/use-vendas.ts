import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { vendasService, CreateVendaInput, UpdateVendaInput } from '../services/comercial/vendas'
import type { ListParams } from '../services/cadastros/clientes'

export function useVendas(params?: ListParams) {
  return useQuery({
    queryKey: ['vendas', params],
    queryFn: () => vendasService.list(params),
  })
}

export function useVenda(id: string) {
  return useQuery({
    queryKey: ['vendas', id],
    queryFn: () => vendasService.getById(id),
    enabled: !!id,
  })
}

export function useCreateVenda() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVendaInput) => vendasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] })
      toast.success('Venda criada com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao criar venda')
    },
  })
}

export function useUpdateVenda() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVendaInput }) =>
      vendasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] })
      toast.success('Venda atualizada com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao atualizar venda')
    },
  })
}

export function useCancelarVenda() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => vendasService.cancelar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] })
      toast.success('Venda cancelada com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao cancelar venda')
    },
  })
}
