import { z } from 'zod';

// Pipeline Stages
export const createPipelineStageSchema = z.object({
  name: z.string().min(1).max(100),
  order: z.coerce.number().int().min(0),
  probability: z.coerce.number().int().min(0).max(100).optional(),
  color: z.string().max(20).optional(),
  isWon: z.boolean().optional(),
  isLost: z.boolean().optional(),
});

export const updatePipelineStageSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  order: z.coerce.number().int().min(0).optional(),
  probability: z.coerce.number().int().min(0).max(100).optional(),
  color: z.string().max(20).optional(),
});

// Opportunities
export const createOpportunitySchema = z.object({
  title: z.string().min(1).max(255),
  clientId: z.string().uuid(),
  contactName: z.string().max(255).optional(),
  contactPhone: z.string().max(30).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  sellerId: z.string().uuid().optional(),
  stageId: z.string().uuid(),
  estimatedValue: z.coerce.number().min(0).optional(),
  probability: z.coerce.number().int().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  source: z.string().max(50).optional(),
  sourceDetail: z.string().optional(),
  tags: z.string().optional(),
  notes: z.string().optional(),
});

export const updateOpportunitySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  clientId: z.string().uuid().optional(),
  contactName: z.string().max(255).optional(),
  contactPhone: z.string().max(30).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  sellerId: z.string().uuid().optional(),
  stageId: z.string().uuid().optional(),
  status: z.enum(['open', 'won', 'lost']).optional(),
  estimatedValue: z.coerce.number().min(0).optional(),
  probability: z.coerce.number().int().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  source: z.string().max(50).optional(),
  sourceDetail: z.string().optional(),
  lossReason: z.string().optional(),
  tags: z.string().optional(),
  notes: z.string().optional(),
});

export const moveOpportunitySchema = z.object({
  stageId: z.string().uuid(),
});

export const loseOpportunitySchema = z.object({
  lossReason: z.string().min(1),
});

// Activities
export const createActivitySchema = z.object({
  opportunityId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  type: z.enum(['call', 'email', 'whatsapp', 'visit', 'meeting', 'task', 'note']),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  scheduledAt: z.string().optional(),
  userId: z.string().uuid().optional(),
});

export const updateActivitySchema = z.object({
  type: z.enum(['call', 'email', 'whatsapp', 'visit', 'meeting', 'task', 'note']).optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  scheduledAt: z.string().optional(),
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
  result: z.string().optional(),
});

export const completeActivitySchema = z.object({
  result: z.string().optional(),
});

// Scoring Rules
export const createScoringRuleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  ruleType: z.enum(['purchase_frequency', 'purchase_volume', 'overdue_payment', 'inactivity', 'engagement', 'custom']),
  condition: z.string().min(1),
  points: z.coerce.number().int(),
});

export const updateScoringRuleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  condition: z.string().min(1).optional(),
  points: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});
