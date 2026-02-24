import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usuariosService, type UpdateUserInput } from '../services/cadastros/usuarios'

export function useUsuarios(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['usuarios', params],
    queryFn: () => usuariosService.list(params),
  })
}

export function useUsuario(id: string) {
  return useQuery({
    queryKey: ['usuarios', id],
    queryFn: () => usuariosService.getById(id),
    enabled: !!id,
  })
}

export function useCreateUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string; role?: string }) =>
      usuariosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Usuário criado com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao criar usuário')
    },
  })
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      usuariosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Usuário atualizado!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao atualizar usuário')
    },
  })
}

export function useDeleteUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usuariosService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Usuário removido!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao remover usuário')
    },
  })
}
