import type { PaginationInput } from '@trailsystem/types';
import type {
  PipelineStage,
  CreatePipelineStageDTO,
  UpdatePipelineStageDTO,
  Opportunity,
  CreateOpportunityDTO,
  UpdateOpportunityDTO,
  Activity,
  CreateActivityDTO,
  UpdateActivityDTO,
  ScoringRule,
  CreateScoringRuleDTO,
  UpdateScoringRuleDTO,
  PipelineSummary,
} from './entities';

export interface ListResult<T> {
  data: T[];
  total: number;
}

export interface IPipelineStageRepository {
  list(tenantId: string): Promise<PipelineStage[]>;
  getById(id: string, tenantId: string): Promise<PipelineStage | null>;
  create(tenantId: string, data: CreatePipelineStageDTO): Promise<PipelineStage>;
  update(id: string, tenantId: string, data: UpdatePipelineStageDTO): Promise<PipelineStage | null>;
  remove(id: string, tenantId: string): Promise<boolean>;
  seedDefaults(tenantId: string): Promise<PipelineStage[]>;
}

export interface IOpportunityRepository {
  list(tenantId: string, params: PaginationInput & { stageId?: string; sellerId?: string; status?: string }): Promise<ListResult<Opportunity>>;
  getById(id: string, tenantId: string): Promise<Opportunity | null>;
  create(tenantId: string, data: CreateOpportunityDTO): Promise<Opportunity>;
  update(id: string, tenantId: string, data: UpdateOpportunityDTO): Promise<Opportunity | null>;
  remove(id: string, tenantId: string): Promise<boolean>;
  moveStage(id: string, tenantId: string, stageId: string): Promise<Opportunity | null>;
  markWon(id: string, tenantId: string): Promise<Opportunity | null>;
  markLost(id: string, tenantId: string, lossReason: string): Promise<Opportunity | null>;
  getPipelineSummary(tenantId: string): Promise<PipelineSummary>;
}

export interface IActivityRepository {
  listByOpportunity(opportunityId: string, tenantId: string): Promise<Activity[]>;
  listByClient(clientId: string, tenantId: string): Promise<Activity[]>;
  listPending(tenantId: string, userId?: string): Promise<Activity[]>;
  getById(id: string, tenantId: string): Promise<Activity | null>;
  create(tenantId: string, data: CreateActivityDTO): Promise<Activity>;
  update(id: string, tenantId: string, data: UpdateActivityDTO): Promise<Activity | null>;
  complete(id: string, tenantId: string, result?: string): Promise<Activity | null>;
  remove(id: string, tenantId: string): Promise<boolean>;
}

export interface IScoringRuleRepository {
  list(tenantId: string): Promise<ScoringRule[]>;
  getById(id: string, tenantId: string): Promise<ScoringRule | null>;
  create(tenantId: string, data: CreateScoringRuleDTO): Promise<ScoringRule>;
  update(id: string, tenantId: string, data: UpdateScoringRuleDTO): Promise<ScoringRule | null>;
  remove(id: string, tenantId: string): Promise<boolean>;
  seedDefaults(tenantId: string): Promise<ScoringRule[]>;
}
