// ==================== Pipeline Stages ====================

export interface PipelineStage {
  id: string;
  tenantId: string;
  name: string;
  order: number;
  probability: number;
  color: string;
  isDefault: boolean;
  isWon: boolean;
  isLost: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePipelineStageDTO {
  name: string;
  order: number;
  probability?: number;
  color?: string;
  isWon?: boolean;
  isLost?: boolean;
}

export interface UpdatePipelineStageDTO {
  name?: string;
  order?: number;
  probability?: number;
  color?: string;
}

// ==================== Opportunities ====================

export type OpportunityStatus = 'open' | 'won' | 'lost';

export interface Opportunity {
  id: string;
  tenantId: string;
  title: string;
  clientId: string;
  clientName?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  sellerId?: string;
  sellerName?: string;
  stageId: string;
  stageName?: string;
  status: OpportunityStatus;
  estimatedValue: number;
  probability: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  source?: string;
  sourceDetail?: string;
  lossReason?: string;
  tags?: string;
  notes?: string;
  lastActivityAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOpportunityDTO {
  title: string;
  clientId: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  sellerId?: string;
  stageId: string;
  estimatedValue?: number;
  probability?: number;
  expectedCloseDate?: string;
  source?: string;
  sourceDetail?: string;
  tags?: string;
  notes?: string;
}

export interface UpdateOpportunityDTO {
  title?: string;
  clientId?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  sellerId?: string;
  stageId?: string;
  status?: OpportunityStatus;
  estimatedValue?: number;
  probability?: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  source?: string;
  sourceDetail?: string;
  lossReason?: string;
  tags?: string;
  notes?: string;
}

export interface MoveOpportunityDTO {
  stageId: string;
}

export interface LoseOpportunityDTO {
  lossReason: string;
}

// ==================== Activities ====================

export type ActivityType = 'call' | 'email' | 'whatsapp' | 'visit' | 'meeting' | 'task' | 'note';
export type ActivityStatus = 'pending' | 'completed' | 'cancelled';

export interface Activity {
  id: string;
  tenantId: string;
  opportunityId?: string;
  clientId?: string;
  type: ActivityType;
  title: string;
  description?: string;
  scheduledAt?: string;
  completedAt?: string;
  status: ActivityStatus;
  result?: string;
  userId?: string;
  userName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateActivityDTO {
  opportunityId?: string;
  clientId?: string;
  type: ActivityType;
  title: string;
  description?: string;
  scheduledAt?: string;
  userId?: string;
}

export interface UpdateActivityDTO {
  type?: ActivityType;
  title?: string;
  description?: string;
  scheduledAt?: string;
  status?: ActivityStatus;
  result?: string;
}

// ==================== Scoring Rules ====================

export type ScoringRuleType = 'purchase_frequency' | 'purchase_volume' | 'overdue_payment' | 'inactivity' | 'engagement' | 'custom';

export interface ScoringRule {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  ruleType: ScoringRuleType;
  condition: string;
  points: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateScoringRuleDTO {
  name: string;
  description?: string;
  ruleType: ScoringRuleType;
  condition: string;
  points: number;
}

export interface UpdateScoringRuleDTO {
  name?: string;
  description?: string;
  condition?: string;
  points?: number;
  isActive?: boolean;
}

// ==================== Pipeline Summary ====================

export interface PipelineSummary {
  totalOpportunities: number;
  totalValue: number;
  weightedValue: number;
  byStage: Array<{
    stageId: string;
    stageName: string;
    stageColor: string;
    stageOrder: number;
    count: number;
    value: number;
  }>;
  wonCount: number;
  wonValue: number;
  lostCount: number;
  lostValue: number;
}

export interface ClientScore {
  clientId: string;
  totalScore: number;
  breakdown: Array<{
    ruleId: string;
    ruleName: string;
    points: number;
    matched: boolean;
  }>;
}
