import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orcamentosService, CreateOrcamentoInput, UpdateOrcamentoInput } from '../services/comercial/orcamentos'
import type { ListParams } from '../services/cadastros/clientes'

export function useOrcamentos(params?: ListParams) {
  return useQuery({
    queryKey: ['orcamentos', params],
    queryFn: () => orcamentosService.list(params),
  })
}

export function useOrcamento(id: string) {
  return useQuery({
    queryKey: ['orcamentos', id],
    queryFn: () => orcamentosService.getById(id),
    enabled: !!id,
  })
}

export function useCreateOrcamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOrcamentoInput) => orcamentosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] })
      toast.success('Orcamento criado com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao criar orcamento')
    },
  })
}

export function useUpdateOrcamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrcamentoInput }) =>
      orcamentosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] })
      toast.success('Orcamento atualizado com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao atualizar orcamento')
    },
  })
}

export function useAprovarOrcamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => orcamentosService.aprovar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] })
      toast.success('Orcamento aprovado com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao aprovar orcamento')
    },
  })
}

export function useConverterOrcamentoEmVenda() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => orcamentosService.converterEmVenda(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] })
      queryClient.invalidateQueries({ queryKey: ['vendas'] })
      toast.success('Orcamento convertido em venda com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao converter orcamento')
    },
  })
}
