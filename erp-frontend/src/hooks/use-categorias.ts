import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { categoriasService, CreateCategoriaInput, UpdateCategoriaInput } from '../services/produtos/categorias'

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriasService.list(),
  })
}

export function useCreateCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCategoriaInput) => categoriasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Categoria criada com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao criar categoria')
    },
  })
}

export function useUpdateCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoriaInput }) =>
      categoriasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Categoria atualizada com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao atualizar categoria')
    },
  })
}

export function useRemoveCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoriasService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Categoria removida com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao remover categoria')
    },
  })
}
