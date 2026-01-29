export interface Metrics {
  BP: number; // Business Performance
  CA: number; // Change Adoption
  EE: number; // Employee Energy
  TR: number; // Trust
  RS: number; // Resistance
  LC: number; // Leadership Credibility
  MO: number; // Momentum
}

export const METRIC_LABELS: Record<keyof Metrics, string> = {
  BP: 'Business Performance',
  CA: 'Change Adoption',
  EE: 'Employee Energy',
  TR: 'Trust',
  RS: 'Resistance',
  LC: 'Leadership Credibility',
  MO: 'Momentum'
};

export type BridgesStage = 'Ending' | 'NeutralZone' | 'NewBeginning';
export type ChangeCurveState = 'Shock' | 'Denial' | 'Anger' | 'Confusion' | 'Acceptance' | 'Commitment';

export interface GameState {
  metrics: Metrics;
  bridgesStage: BridgesStage;
  changeCurveState: ChangeCurveState;
}

export interface Option {
  id: string;
  label: string;
  deltas: Metrics;
  theme?: string;
  outcomeText: string;
}

export type DecisionType = 'multiple-choice' | 'budget-allocation' | 'priority-ranking';

export interface BudgetAllocation {
  categories: string[];
  totalBudget: number;
  minPerCategory: number;
}

export interface Decision {
  id: string;
  prompt: string;
  type: DecisionType;
  options?: Option[]; // For multiple-choice
  budgetAllocation?: BudgetAllocation; // For budget decisions
  outcomeText?: string; // For non-MCQ decisions
}

export interface Scenario {
  roundNumber: number;
  title: string;
  scenarioText: string;
  decisions: Decision[];
}

export interface TeamDecisions {
  [decisionId: string]: string | number[]; // string for MCQ optionId, number[] for budget allocation
}

export interface NewsItem {
  id: string;
  timestamp: number;
  type: 'employee' | 'department' | 'external' | 'rumor' | 'event';
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface RandomEvent {
  id: string;
  title: string;
  description: string;
  impact: Metrics;
  type: 'positive' | 'negative' | 'neutral';
}

export interface MetricHistory {
  round: number;
  metrics: Metrics;
}

export interface Game {
  gameCode: string;
  facilitatorId: string;
  players: Map<string, { id: string; name: string }>;
  currentRound: number;
  state: GameState;
  teamDecisions: TeamDecisions;
  allSubmitted: boolean;
  gameStarted: boolean;
  gameEnded: boolean;
  log: any[];
  newsFeed: NewsItem[];
  metricHistory: MetricHistory[];
  activeEvent: RandomEvent | null;
  totalBudget: number;
  budgetSpent: number;
}
