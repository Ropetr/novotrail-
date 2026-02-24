import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { configuracoesService, TenantSettings } from '../services/configuracoes/empresa'

export function useEmpresaSettings() {
  return useQuery({
    queryKey: ['configuracoes', 'empresa'],
    queryFn: () => configuracoesService.getEmpresa(),
  })
}

export function useUpdateEmpresaSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<TenantSettings>) => configuracoesService.updateEmpresa(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes', 'empresa'] })
      toast.success('Dados da empresa salvos com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao salvar dados da empresa')
    },
  })
}

export function useUploadLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, type }: { file: File; type?: 'logo' | 'logoFiscal' }) =>
      configuracoesService.uploadLogo(file, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes', 'empresa'] })
      toast.success('Logo enviada com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao enviar logo')
    },
  })
}

export function useDeleteLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (type?: 'logo' | 'logoFiscal') =>
      configuracoesService.deleteLogo(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes', 'empresa'] })
      toast.success('Logo removida com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao remover logo')
    },
  })
}
