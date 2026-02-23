import api from '../api'
import type { ListParams, ApiListResponse, ApiSingleResponse } from '../cadastros/clientes'

// ==================== Pipeline Stages ====================

export interface PipelineStage {
  id: string
  tenantId: string
  name: string
  order: number
  probability: number
  color: string
  isDefault: boolean
  isWon: boolean
  isLost: boolean
  createdAt: string
  updatedAt: string
}

export const pipelineStagesService = {
  list: () =>
    api.get<ApiSingleResponse<PipelineStage[]>>('/crm/pipeline/stages').then((r) => r.data),

  seed: () =>
    api.post<ApiSingleResponse<PipelineStage[]>>('/crm/pipeline/stages/seed').then((r) => r.data),

  create: (data: { name: string; order: number; probability?: number; color?: string }) =>
    api.post<ApiSingleResponse<PipelineStage>>('/crm/pipeline/stages', data).then((r) => r.data),

  update: (id: string, data: Partial<{ name: string; order: number; probability: number; color: string }>) =>
    api.put<ApiSingleResponse<PipelineStage>>(`/crm/pipeline/stages/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiSingleResponse<{ deleted: boolean }>>(`/crm/pipeline/stages/${id}`).then((r) => r.data),
}

// ==================== Opportunities ====================

export interface Opportunity {
  id: string
  tenantId: string
  title: string
  clientId: string
  clientName?: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  sellerId?: string
  sellerName?: string
  stageId: string
  stageName?: string
  status: 'open' | 'won' | 'lost'
  estimatedValue: number
  probability: number
  expectedCloseDate?: string
  actualCloseDate?: string
  source?: string
  sourceDetail?: string
  lossReason?: string
  tags?: string
  notes?: string
  lastActivityAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateOpportunityInput {
  title: string
  clientId: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  sellerId?: string
  stageId: string
  estimatedValue?: number
  probability?: number
  expectedCloseDate?: string
  source?: string
  sourceDetail?: string
  tags?: string
  notes?: string
}

export type UpdateOpportunityInput = Partial<CreateOpportunityInput> & {
  status?: 'open' | 'won' | 'lost'
  lossReason?: string
}

export interface PipelineSummary {
  totalOpportunities: number
  totalValue: number
  weightedValue: number
  byStage: Array<{
    stageId: string
    stageName: string
    stageColor: string
    stageOrder: number
    count: number
    value: number
  }>
  wonCount: number
  wonValue: number
  lostCount: number
  lostValue: number
}

export interface OpportunityListParams extends ListParams {
  stageId?: string
  sellerId?: string
  status?: string
}

export const opportunitiesService = {
  list: (params?: OpportunityListParams) =>
    api.get<ApiListResponse<Opportunity>>('/crm/oportunidades', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiSingleResponse<Opportunity>>(`/crm/oportunidades/${id}`).then((r) => r.data),

  create: (data: CreateOpportunityInput) =>
    api.post<ApiSingleResponse<Opportunity>>('/crm/oportunidades', data).then((r) => r.data),

  update: (id: string, data: UpdateOpportunityInput) =>
    api.put<ApiSingleResponse<Opportunity>>(`/crm/oportunidades/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiSingleResponse<{ deleted: boolean }>>(`/crm/oportunidades/${id}`).then((r) => r.data),

  moveStage: (id: string, stageId: string) =>
    api.post<ApiSingleResponse<Opportunity>>(`/crm/oportunidades/${id}/mover`, { stageId }).then((r) => r.data),

  markWon: (id: string) =>
    api.post<ApiSingleResponse<Opportunity>>(`/crm/oportunidades/${id}/ganhar`).then((r) => r.data),

  markLost: (id: string, lossReason: string) =>
    api.post<ApiSingleResponse<Opportunity>>(`/crm/oportunidades/${id}/perder`, { lossReason }).then((r) => r.data),

  getPipelineSummary: () =>
    api.get<ApiSingleResponse<PipelineSummary>>('/crm/pipeline/summary').then((r) => r.data),
}

// ==================== Activities ====================

export interface CrmActivity {
  id: string
  tenantId: string
  opportunityId?: string
  clientId?: string
  type: 'call' | 'email' | 'whatsapp' | 'visit' | 'meeting' | 'task' | 'note'
  title: string
  description?: string
  scheduledAt?: string
  completedAt?: string
  status: 'pending' | 'completed' | 'cancelled'
  result?: string
  userId?: string
  userName?: string
  createdAt: string
  updatedAt: string
}

export interface CreateActivityInput {
  opportunityId?: string
  clientId?: string
  type: CrmActivity['type']
  title: string
  description?: string
  scheduledAt?: string
  userId?: string
}

export type UpdateActivityInput = Partial<Omit<CreateActivityInput, 'opportunityId' | 'clientId'>> & {
  status?: CrmActivity['status']
  result?: string
}

export const activitiesService = {
  listByOpportunity: (opportunityId: string) =>
    api.get<ApiSingleResponse<CrmActivity[]>>(`/crm/atividades/oportunidade/${opportunityId}`).then((r) => r.data),

  listByClient: (clientId: string) =>
    api.get<ApiSingleResponse<CrmActivity[]>>(`/crm/atividades/cliente/${clientId}`).then((r) => r.data),

  listPending: (userId?: string) =>
    api.get<ApiSingleResponse<CrmActivity[]>>('/crm/atividades/pendentes', { params: userId ? { userId } : {} }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiSingleResponse<CrmActivity>>(`/crm/atividades/${id}`).then((r) => r.data),

  create: (data: CreateActivityInput) =>
    api.post<ApiSingleResponse<CrmActivity>>('/crm/atividades', data).then((r) => r.data),

  update: (id: string, data: UpdateActivityInput) =>
    api.put<ApiSingleResponse<CrmActivity>>(`/crm/atividades/${id}`, data).then((r) => r.data),

  complete: (id: string, result?: string) =>
    api.post<ApiSingleResponse<CrmActivity>>(`/crm/atividades/${id}/completar`, { result }).then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiSingleResponse<{ deleted: boolean }>>(`/crm/atividades/${id}`).then((r) => r.data),
}

// ==================== Scoring ====================

export interface ScoringRule {
  id: string
  tenantId: string
  name: string
  description?: string
  ruleType: string
  condition: string
  points: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const scoringService = {
  listRules: () =>
    api.get<ApiSingleResponse<ScoringRule[]>>('/crm/scoring/regras').then((r) => r.data),

  seedDefaults: () =>
    api.post<ApiSingleResponse<ScoringRule[]>>('/crm/scoring/regras/seed').then((r) => r.data),

  createRule: (data: { name: string; description?: string; ruleType: string; condition: string; points: number }) =>
    api.post<ApiSingleResponse<ScoringRule>>('/crm/scoring/regras', data).then((r) => r.data),

  updateRule: (id: string, data: Partial<{ name: string; description: string; condition: string; points: number; isActive: boolean }>) =>
    api.put<ApiSingleResponse<ScoringRule>>(`/crm/scoring/regras/${id}`, data).then((r) => r.data),

  removeRule: (id: string) =>
    api.delete<ApiSingleResponse<{ deleted: boolean }>>(`/crm/scoring/regras/${id}`).then((r) => r.data),
}
