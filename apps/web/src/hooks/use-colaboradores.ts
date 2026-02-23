import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { colaboradoresService, CreateColaboradorInput, UpdateColaboradorInput } from '../services/cadastros/colaboradores'
import type { ListParams } from '../services/cadastros/clientes'

export function useColaboradores(params?: ListParams) {
  return useQuery({
    queryKey: ['colaboradores', params],
    queryFn: () => colaboradoresService.list(params),
  })
}

export function useColaborador(id: string) {
  return useQuery({
    queryKey: ['colaboradores', id],
    queryFn: () => colaboradoresService.getById(id),
    enabled: !!id,
  })
}

export function useCreateColaborador() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateColaboradorInput) => colaboradoresService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] })
      toast.success('Colaborador criado com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao criar colaborador')
    },
  })
}

export function useUpdateColaborador() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateColaboradorInput }) =>
      colaboradoresService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] })
      toast.success('Colaborador atualizado com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao atualizar colaborador')
    },
  })
}

export function useRemoveColaborador() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => colaboradoresService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] })
      toast.success('Colaborador removido com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao remover colaborador')
    },
  })
}
