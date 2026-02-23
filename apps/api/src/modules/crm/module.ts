import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createDatabaseConnection } from '../../shared/database/connection';

// Repositories
import { PipelineStageRepository } from './infrastructure/repositories/pipeline-stage-repository';
import { OpportunityRepository } from './infrastructure/repositories/opportunity-repository';
import { ActivityRepository } from './infrastructure/repositories/activity-repository';
import { ScoringRuleRepository } from './infrastructure/repositories/scoring-rule-repository';

// Controllers
import { PipelineStageController } from './presentation/http/controllers/pipeline-stage-controller';
import { OpportunityController } from './presentation/http/controllers/opportunity-controller';
import { ActivityController } from './presentation/http/controllers/activity-controller';
import { ScoringRuleController } from './presentation/http/controllers/scoring-rule-controller';
import { createCrmRoutes } from './presentation/http/routes';

/**
 * Creates and configures the CRM bounded context module.
 * Manages pipeline stages, opportunities, activities, and scoring rules.
 *
 * All routes are PROTECTED — auth middleware must be applied externally.
 *
 * Features (NovoTrail Apostila Module 13):
 *   - Pipeline: 5 default stages + Won/Lost, customizable per tenant
 *   - Opportunities: CRUD, move stage (drag-and-drop), win/lose
 *   - Activities: call, email, whatsapp, visit, meeting, task, note
 *   - Scoring: configurable rules, calculated on-demand (RN-04)
 */
export function createCrmModule() {
  const router = new Hono<HonoContext>();

  // DI middleware - create all dependencies per-request from Cloudflare env
  router.use('*', async (c, next) => {
    const db = await createDatabaseConnection(c.env.HYPERDRIVE);

    // Repositories
    const pipelineStageRepository = new PipelineStageRepository(db);
    const opportunityRepository = new OpportunityRepository(db);
    const activityRepository = new ActivityRepository(db);
    const scoringRuleRepository = new ScoringRuleRepository(db);

    // Controllers
    const pipelineStageController = new PipelineStageController(pipelineStageRepository);
    const opportunityController = new OpportunityController(opportunityRepository);
    const activityController = new ActivityController(activityRepository);
    const scoringRuleController = new ScoringRuleController(scoringRuleRepository);

    c.set('pipelineStageController' as any, pipelineStageController);
    c.set('opportunityController' as any, opportunityController);
    c.set('activityController' as any, activityController);
    c.set('scoringRuleController' as any, scoringRuleController);

    await next();
  });

  router.route('/', createCrmRoutes());

  return router;
}
