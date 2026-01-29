import { RandomEvent, Metrics } from './types.js';

const RANDOM_EVENTS: RandomEvent[] = [
  // Positive events
  {
    id: 'event_champion_emerge',
    title: 'Unexpected Champion Emerges',
    description: 'A respected mid-level manager has become a vocal advocate, influencing peers across departments.',
    impact: { BP: 3, CA: 8, EE: 5, TR: 6, RS: -10, LC: 4, MO: 8 },
    type: 'positive'
  },
  {
    id: 'event_quick_win',
    title: 'Early Quick Win Delivered',
    description: 'A pilot project exceeded expectations, delivering measurable results ahead of schedule.',
    impact: { BP: 8, CA: 6, EE: 6, TR: 5, RS: -8, LC: 7, MO: 10 },
    type: 'positive'
  },
  {
    id: 'event_ceo_backing',
    title: 'CEO Public Endorsement',
    description: 'CEO publicly champions the transformation at an industry conference, signaling unwavering commitment.',
    impact: { BP: 2, CA: 5, EE: 4, TR: 10, RS: -12, LC: 12, MO: 8 },
    type: 'positive'
  },
  {
    id: 'event_peer_success',
    title: 'Peer Company Success Story',
    description: 'Similar transformation at competitor yields impressive results, validating your approach.',
    impact: { BP: 4, CA: 7, EE: 5, TR: 8, RS: -10, LC: 6, MO: 9 },
    type: 'positive'
  },
  {
    id: 'event_innovation',
    title: 'Team Innovates Solution',
    description: 'A team finds creative workaround to a major blocker, sharing it across the organization.',
    impact: { BP: 6, CA: 10, EE: 8, TR: 5, RS: -8, LC: 3, MO: 12 },
    type: 'positive'
  },

  // Negative events
  {
    id: 'event_champion_resigns',
    title: 'Key Change Champion Resigns',
    description: 'Your most effective change champion accepts an external offer, citing burnout.',
    impact: { BP: -5, CA: -10, EE: -8, TR: -6, RS: 15, LC: -8, MO: -12 },
    type: 'negative'
  },
  {
    id: 'event_department_revolts',
    title: 'Department Reverts to Old Ways',
    description: 'A major department stops using new systems, citing productivity concerns.',
    impact: { BP: -8, CA: -15, EE: -10, TR: -10, RS: 20, LC: -12, MO: -15 },
    type: 'negative'
  },
  {
    id: 'event_budget_cut',
    title: 'Budget Cuts Announced',
    description: 'Financial pressures force 30% reduction in transformation budget mid-program.',
    impact: { BP: -6, CA: -8, EE: -12, TR: -15, RS: 18, LC: -10, MO: -10 },
    type: 'negative'
  },
  {
    id: 'event_exec_turnover',
    title: 'Executive Sponsor Departs',
    description: 'Your executive sponsor takes a new role. Replacement is skeptical of the initiative.',
    impact: { BP: -4, CA: -6, EE: -5, TR: -12, RS: 15, LC: -15, MO: -8 },
    type: 'negative'
  },
  {
    id: 'event_system_failure',
    title: 'Major System Outage',
    description: 'New platform crashes during peak period, reverting to manual processes for 48 hours.',
    impact: { BP: -10, CA: -12, EE: -15, TR: -8, RS: 20, LC: -10, MO: -12 },
    type: 'negative'
  },
  {
    id: 'event_negative_press',
    title: 'Negative Press Coverage',
    description: 'Industry publication questions the transformation strategy, citing anonymous insider sources.',
    impact: { BP: -5, CA: -5, EE: -6, TR: -10, RS: 12, LC: -12, MO: -8 },
    type: 'negative'
  },
  {
    id: 'event_union_concern',
    title: 'Union Raises Concerns',
    description: 'Employee representatives formally object to pace of change and lack of consultation.',
    impact: { BP: -3, CA: -8, EE: -10, TR: -12, RS: 18, LC: -10, MO: -10 },
    type: 'negative'
  },

  // Neutral/mixed events
  {
    id: 'event_competitor_move',
    title: 'Competitor Announces Similar Initiative',
    description: 'Main competitor launches parallel transformation. Board increases pressure for results.',
    impact: { BP: 0, CA: 3, EE: -5, TR: 0, RS: 5, LC: -3, MO: 5 },
    type: 'neutral'
  },
  {
    id: 'event_consultant_report',
    title: 'External Assessment Results',
    description: 'Consultant review highlights both progress and significant remaining challenges.',
    impact: { BP: 2, CA: 4, EE: -2, TR: 3, RS: -3, LC: 2, MO: 3 },
    type: 'neutral'
  }
];

export function shouldTriggerEvent(round: number, metrics: Metrics): boolean {
  // More likely to trigger events in middle rounds
  if (round < 2 || round > 5) return false;
  
  // Higher chance if metrics are extreme (very good or very bad)
  const avgMetric = (metrics.CA + metrics.TR + metrics.MO) / 3;
  const extremity = Math.abs(avgMetric - 50);
  
  // 40% base chance + extremity bonus
  const chance = 0.4 + (extremity / 200);
  return Math.random() < chance;
}

export function selectRandomEvent(metrics: Metrics, round: number): RandomEvent {
  // Weight event selection based on current state
  const avgMetric = (metrics.CA + metrics.TR + metrics.MO) / 3;
  
  let pool: RandomEvent[];
  
  if (avgMetric < 40) {
    // Struggling - more likely to get positive events (help)
    pool = RANDOM_EVENTS.filter(e => e.type === 'positive' || e.type === 'neutral');
  } else if (avgMetric > 65) {
    // Doing well - more likely to get challenges
    pool = RANDOM_EVENTS.filter(e => e.type === 'negative' || e.type === 'neutral');
  } else {
    // Middle ground - any event possible
    pool = RANDOM_EVENTS;
  }
  
  return pool[Math.floor(Math.random() * pool.length)];
}
