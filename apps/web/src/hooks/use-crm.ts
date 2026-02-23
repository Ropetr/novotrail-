import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  pipelineStagesService,
  opportunitiesService,
  activitiesService,
  scoringService,
  type OpportunityListParams,
  type CreateOpportunityInput,
  type UpdateOpportunityInput,
  type CreateActivityInput,
  type UpdateActivityInput,
} from '../services/crm'

// ==================== Pipeline Stages ====================

export function usePipelineStages() {
  return useQuery({
    queryKey: ['crm', 'pipeline-stages'],
    queryFn: () => pipelineStagesService.list(),
  })
}

export function useSeedPipelineStages() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => pipelineStagesService.seed(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'pipeline-stages'] })
      toast.success('Estágios do pipeline criados!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao criar estágios')
    },
  })
}

// ==================== Opportunities ====================

export function useOpportunities(params?: OpportunityListParams) {
  return useQuery({
    queryKey: ['crm', 'opportunities', params],
    queryFn: () => opportunitiesService.list(params),
  })
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ['crm', 'opportunities', id],
    queryFn: () => opportunitiesService.getById(id),
    enabled: !!id,
  })
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOpportunityInput) => opportunitiesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'opportunities'] })
      queryClient.invalidateQueries({ queryKey: ['crm', 'pipeline-summary'] })
      toast.success('Oportunidade criada com sucesso!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao criar oportunidade')
    },
  })
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOpportunityInput }) =>
      opportunitiesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'opportunities'] })
      queryClient.invalidateQueries({ queryKey: ['crm', 'pipeline-summary'] })
      toast.success('Oportunidade atualizada!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao atualizar oportunidade')
    },
  })
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => opportunitiesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'opportunities'] })
      queryClient.invalidateQueries({ queryKey: ['crm', 'pipeline-summary'] })
      toast.success('Oportunidade removida!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao remover oportunidade')
    },
  })
}

export function useMoveOpportunityStage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, stageId }: { id: string; stageId: string }) =>
      opportunitiesService.moveStage(id, stageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'opportunities'] })
      queryClient.invalidateQueries({ queryKey: ['crm', 'pipeline-summary'] })
      queryClient.invalidateQueries({ queryKey: ['crm', 'activities'] })
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao mover oportunidade')
    },
  })
}

export function useMarkOpportunityWon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => opportunitiesService.markWon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'opportunities'] })
      queryClient.invalidateQueries({ queryKey: ['crm', 'pipeline-summary'] })
      toast.success('Oportunidade ganha!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao marcar como ganha')
    },
  })
}

export function useMarkOpportunityLost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, lossReason }: { id: string; lossReason: string }) =>
      opportunitiesService.markLost(id, lossReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'opportunities'] })
      queryClient.invalidateQueries({ queryKey: ['crm', 'pipeline-summary'] })
      toast.success('Oportunidade marcada como perdida')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao marcar como perdida')
    },
  })
}

export function usePipelineSummary() {
  return useQuery({
    queryKey: ['crm', 'pipeline-summary'],
    queryFn: () => opportunitiesService.getPipelineSummary(),
  })
}

// ==================== Activities ====================

export function useActivitiesByOpportunity(opportunityId: string) {
  return useQuery({
    queryKey: ['crm', 'activities', 'opportunity', opportunityId],
    queryFn: () => activitiesService.listByOpportunity(opportunityId),
    enabled: !!opportunityId,
  })
}

export function useActivitiesByClient(clientId: string) {
  return useQuery({
    queryKey: ['crm', 'activities', 'client', clientId],
    queryFn: () => activitiesService.listByClient(clientId),
    enabled: !!clientId,
  })
}

export function usePendingActivities(userId?: string) {
  return useQuery({
    queryKey: ['crm', 'activities', 'pending', userId],
    queryFn: () => activitiesService.listPending(userId),
  })
}

export function useCreateActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateActivityInput) => activitiesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'activities'] })
      queryClient.invalidateQueries({ queryKey: ['crm', 'opportunities'] })
      toast.success('Atividade criada!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao criar atividade')
    },
  })
}

export function useCompleteActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, result }: { id: string; result?: string }) =>
      activitiesService.complete(id, result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'activities'] })
      toast.success('Atividade concluída!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao concluir atividade')
    },
  })
}

export function useDeleteActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => activitiesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'activities'] })
      toast.success('Atividade removida!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao remover atividade')
    },
  })
}

// ==================== Scoring ====================

export function useScoringRules() {
  return useQuery({
    queryKey: ['crm', 'scoring-rules'],
    queryFn: () => scoringService.listRules(),
  })
}

export function useSeedScoringRules() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => scoringService.seedDefaults(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'scoring-rules'] })
      toast.success('Regras de scoring criadas!')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Erro ao criar regras')
    },
  })
}
