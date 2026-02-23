export { createCrmModule } from './module';
export type {
  IPipelineStageRepository,
  IOpportunityRepository,
  IActivityRepository,
  IScoringRuleRepository,
} from './domain/repositories';
export { PipelineStageRepository } from './infrastructure/repositories/pipeline-stage-repository';
export { OpportunityRepository } from './infrastructure/repositories/opportunity-repository';
export { ActivityRepository } from './infrastructure/repositories/activity-repository';
export { ScoringRuleRepository } from './infrastructure/repositories/scoring-rule-repository';
export {
  crmPipelineStages,
  crmOpportunities,
  crmActivities,
  crmScoringRules,
} from './infrastructure/schema';
