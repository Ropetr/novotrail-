import { Hono } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';

/**
 * CRM Routes — Módulo 13 do NovoTrail
 * 18 endpoints: Pipeline Stages, Oportunidades, Atividades, Scoring Rules
 */
export function createCrmRoutes() {
  const router = new Hono<HonoContext>();

  // ==================== Pipeline Stages ====================
  // GET  /crm/pipeline/stages
  router.get('/pipeline/stages', (c) => {
    const ctrl = c.get('pipelineStageController' as any);
    return ctrl.list(c);
  });

  // POST /crm/pipeline/stages
  router.post('/pipeline/stages', (c) => {
    const ctrl = c.get('pipelineStageController' as any);
    return ctrl.create(c);
  });

  // POST /crm/pipeline/stages/seed — seed default stages (RN-01)
  router.post('/pipeline/stages/seed', (c) => {
    const ctrl = c.get('pipelineStageController' as any);
    return ctrl.seedDefaults(c);
  });

  // GET  /crm/pipeline/stages/:id
  router.get('/pipeline/stages/:id', (c) => {
    const ctrl = c.get('pipelineStageController' as any);
    return ctrl.getById(c);
  });

  // PUT  /crm/pipeline/stages/:id
  router.put('/pipeline/stages/:id', (c) => {
    const ctrl = c.get('pipelineStageController' as any);
    return ctrl.update(c);
  });

  // DELETE /crm/pipeline/stages/:id
  router.delete('/pipeline/stages/:id', (c) => {
    const ctrl = c.get('pipelineStageController' as any);
    return ctrl.remove(c);
  });

  // ==================== Pipeline Summary ====================
  // GET  /crm/pipeline/summary
  router.get('/pipeline/summary', (c) => {
    const ctrl = c.get('opportunityController' as any);
    return ctrl.getPipelineSummary(c);
  });

  // ==================== Opportunities ====================
  // GET  /crm/oportunidades
  router.get('/oportunidades', (c) => {
    const ctrl = c.get('opportunityController' as any);
    return ctrl.list(c);
  });

  // POST /crm/oportunidades
  router.post('/oportunidades', (c) => {
    const ctrl = c.get('opportunityController' as any);
    return ctrl.create(c);
  });

  // GET  /crm/oportunidades/:id
  router.get('/oportunidades/:id', (c) => {
    const ctrl = c.get('opportunityController' as any);
    return ctrl.getById(c);
  });

  // PUT  /crm/oportunidades/:id
  router.put('/oportunidades/:id', (c) => {
    const ctrl = c.get('opportunityController' as any);
    return ctrl.update(c);
  });

  // DELETE /crm/oportunidades/:id
  router.delete('/oportunidades/:id', (c) => {
    const ctrl = c.get('opportunityController' as any);
    return ctrl.remove(c);
  });

  // POST /crm/oportunidades/:id/mover — move to new stage (drag-and-drop)
  router.post('/oportunidades/:id/mover', (c) => {
    const ctrl = c.get('opportunityController' as any);
    return ctrl.moveStage(c);
  });

  // POST /crm/oportunidades/:id/ganhar — mark as won
  router.post('/oportunidades/:id/ganhar', (c) => {
    const ctrl = c.get('opportunityController' as any);
    return ctrl.markWon(c);
  });

  // POST /crm/oportunidades/:id/perder — mark as lost
  router.post('/oportunidades/:id/perder', (c) => {
    const ctrl = c.get('opportunityController' as any);
    return ctrl.markLost(c);
  });

  // ==================== Activities ====================
  // GET  /crm/atividades/pendentes
  router.get('/atividades/pendentes', (c) => {
    const ctrl = c.get('activityController' as any);
    return ctrl.listPending(c);
  });

  // GET  /crm/atividades/oportunidade/:opportunityId
  router.get('/atividades/oportunidade/:opportunityId', (c) => {
    const ctrl = c.get('activityController' as any);
    return ctrl.listByOpportunity(c);
  });

  // GET  /crm/atividades/cliente/:clientId
  router.get('/atividades/cliente/:clientId', (c) => {
    const ctrl = c.get('activityController' as any);
    return ctrl.listByClient(c);
  });

  // POST /crm/atividades
  router.post('/atividades', (c) => {
    const ctrl = c.get('activityController' as any);
    return ctrl.create(c);
  });

  // GET  /crm/atividades/:id
  router.get('/atividades/:id', (c) => {
    const ctrl = c.get('activityController' as any);
    return ctrl.getById(c);
  });

  // PUT  /crm/atividades/:id
  router.put('/atividades/:id', (c) => {
    const ctrl = c.get('activityController' as any);
    return ctrl.update(c);
  });

  // POST /crm/atividades/:id/completar
  router.post('/atividades/:id/completar', (c) => {
    const ctrl = c.get('activityController' as any);
    return ctrl.complete(c);
  });

  // DELETE /crm/atividades/:id
  router.delete('/atividades/:id', (c) => {
    const ctrl = c.get('activityController' as any);
    return ctrl.remove(c);
  });

  // ==================== Scoring Rules ====================
  // GET  /crm/scoring/regras
  router.get('/scoring/regras', (c) => {
    const ctrl = c.get('scoringRuleController' as any);
    return ctrl.list(c);
  });

  // POST /crm/scoring/regras
  router.post('/scoring/regras', (c) => {
    const ctrl = c.get('scoringRuleController' as any);
    return ctrl.create(c);
  });

  // POST /crm/scoring/regras/seed — seed defaults (RN-04)
  router.post('/scoring/regras/seed', (c) => {
    const ctrl = c.get('scoringRuleController' as any);
    return ctrl.seedDefaults(c);
  });

  // GET  /crm/scoring/regras/:id
  router.get('/scoring/regras/:id', (c) => {
    const ctrl = c.get('scoringRuleController' as any);
    return ctrl.getById(c);
  });

  // PUT  /crm/scoring/regras/:id
  router.put('/scoring/regras/:id', (c) => {
    const ctrl = c.get('scoringRuleController' as any);
    return ctrl.update(c);
  });

  // DELETE /crm/scoring/regras/:id
  router.delete('/scoring/regras/:id', (c) => {
    const ctrl = c.get('scoringRuleController' as any);
    return ctrl.remove(c);
  });

  return router;
}
