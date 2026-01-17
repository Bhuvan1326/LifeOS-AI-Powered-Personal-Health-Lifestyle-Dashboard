export type DecisionStatus = 'fresh' | 'stable' | 'at_risk' | 'stale' | 'invalidated'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical'
export type InsightSeverity = 'info' | 'warning' | 'critical'
export type DecisionCategory = 'nutrition' | 'fitness' | 'sleep' | 'mental_health' | 'lifestyle' | 'medical'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Decision {
  id: string
  user_id: string
  title: string
  description: string | null
  category: DecisionCategory
  decision_type: string
  initial_confidence: number
  current_confidence: number
  perceived_risk: RiskLevel
  perceived_impact: ImpactLevel
  status: DecisionStatus
  context: string | null
  reasoning: string | null
  deadline: string | null
  last_reviewed_at: string
  created_at: string
  updated_at: string
  assumptions?: Assumption[]
  events?: DecisionEvent[]
  insights?: Insight[]
}

export interface Assumption {
  id: string
  decision_id: string
  content: string
  is_validated: boolean
  validation_date: string | null
  created_at: string
}

export interface DecisionEvent {
  id: string
  decision_id: string
  event_type: string
  description: string | null
  confidence_change: number
  previous_status: DecisionStatus | null
  new_status: DecisionStatus | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface DecisionRelationship {
  id: string
  source_decision_id: string
  target_decision_id: string
  relationship_type: 'depends_on' | 'conflicts_with' | 'supersedes' | 'related_to'
  description: string | null
  created_at: string
}

export interface Insight {
  id: string
  decision_id: string
  insight_type: string
  title: string
  description: string
  severity: InsightSeverity
  is_dismissed: boolean
  created_at: string
}

export interface DecisionWithRelations extends Decision {
  assumptions: Assumption[]
  events: DecisionEvent[]
  insights: Insight[]
}
