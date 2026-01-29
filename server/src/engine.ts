import { Metrics, GameState, BridgesStage, ChangeCurveState, Option, TeamDecisions, Scenario } from './types.js';

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function applyDeltas(metrics: Metrics, deltas: Metrics): Metrics {
  return {
    BP: metrics.BP + deltas.BP,
    CA: metrics.CA + deltas.CA,
    EE: metrics.EE + deltas.EE,
    TR: metrics.TR + deltas.TR,
    RS: metrics.RS + deltas.RS,
    LC: metrics.LC + deltas.LC,
    MO: metrics.MO + deltas.MO,
  };
}

function applyStageModifiers(deltas: Metrics, themes: string[], stage: BridgesStage, curve: ChangeCurveState): Metrics {
  let modified = { ...deltas };
  
  // Amplify positive choices in difficult stages
  if ((stage === 'Ending' && (curve === 'Shock' || curve === 'Denial')) || curve === 'Anger') {
    themes.forEach(theme => {
      if (theme === 'acknowledge_loss' || theme === 'listen') {
        modified.TR = modified.TR * 1.3;
        modified.RS = modified.RS * 1.2;
      }
      if (theme === 'overconfident' || theme === 'force') {
        modified.RS = modified.RS * 1.4;
        modified.EE = modified.EE * 1.2;
      }
    });
  }
  
  // Boost capability building in neutral zone
  if (stage === 'NeutralZone' && themes.includes('capability')) {
    modified.CA = modified.CA * 1.4;
    modified.MO = modified.MO * 1.3;
  }
  
  // Reinforce commitment in new beginning
  if (stage === 'NewBeginning' && themes.includes('reinforce')) {
    modified.CA = modified.CA * 1.2;
    modified.MO = modified.MO * 1.2;
  }
  
  return modified;
}

function inferChangeCurve(metrics: Metrics, round: number): ChangeCurveState {
  if (round === 1) return metrics.TR < 50 ? 'Denial' : 'Shock';
  if (round === 2) return metrics.TR < 40 && metrics.RS > 60 ? 'Anger' : 'Confusion';
  if (round === 3) return metrics.CA < 50 ? 'Confusion' : 'Acceptance';
  if (round >= 4) return metrics.CA > 60 && metrics.MO > 55 ? 'Commitment' : 'Acceptance';
  return 'Acceptance';
}

function inferBridgesStage(metrics: Metrics, round: number, curve: ChangeCurveState): BridgesStage {
  if (round === 1) return 'Ending';
  if (round >= 5 && metrics.CA > 55 && metrics.LC > 50) return 'NewBeginning';
  if (round >= 2 && curve !== 'Shock' && curve !== 'Denial') return 'NeutralZone';
  return 'Ending';
}

export function processRound(
  currentState: GameState,
  scenario: Scenario,
  teamDecisions: TeamDecisions
): { newState: GameState; summary: string; outcomes: string[]; chosenThemes: string[] } {
  
  // Get chosen options and themes
  const chosenOptions: Option[] = [];
  const themes: string[] = [];
  const outcomes: string[] = [];
  
  scenario.decisions.forEach(decision => {
    if (decision.type === 'multiple-choice' && decision.options) {
      const optionId = teamDecisions[decision.id] as string;
      const option = decision.options.find(o => o.id === optionId);
      if (option) {
        chosenOptions.push(option);
        if (option.theme) themes.push(option.theme);
        outcomes.push(option.outcomeText);
      }
    } else if (decision.type === 'budget-allocation') {
      // Process budget allocation
      const allocation = teamDecisions[decision.id] as number[];
      if (allocation && decision.budgetAllocation) {
        const impact = processBudgetAllocation(allocation, decision.budgetAllocation);
        chosenOptions.push({
          id: decision.id,
          label: 'Budget Allocation',
          deltas: impact,
          outcomeText: decision.outcomeText || 'Resources allocated.'
        });
        outcomes.push(decision.outcomeText || 'Resources allocated.');
      }
    }
  });
  
  // Sum deltas
  let totalDeltas: Metrics = { BP: 0, CA: 0, EE: 0, TR: 0, RS: 0, LC: 0, MO: 0 };
  chosenOptions.forEach(opt => {
    totalDeltas = applyDeltas(totalDeltas, opt.deltas);
  });
  
  // Apply stage modifiers
  totalDeltas = applyStageModifiers(totalDeltas, themes, currentState.bridgesStage, currentState.changeCurveState);
  
  // Apply momentum/resistance effects
  if (currentState.metrics.MO > 70) {
    totalDeltas.CA = totalDeltas.CA * 1.2;
  }
  if (currentState.metrics.RS > 70) {
    if (totalDeltas.EE < 0) totalDeltas.EE = totalDeltas.EE * 1.3;
    if (totalDeltas.CA > 0) totalDeltas.CA = totalDeltas.CA * 0.7;
  }
  
  // Calculate new metrics
  let newMetrics = applyDeltas(currentState.metrics, totalDeltas);
  newMetrics = {
    BP: clamp(newMetrics.BP),
    CA: clamp(newMetrics.CA),
    EE: clamp(newMetrics.EE),
    TR: clamp(newMetrics.TR),
    RS: clamp(newMetrics.RS),
    LC: clamp(newMetrics.LC),
    MO: clamp(newMetrics.MO),
  };
  
  // Infer new stages
  const newCurve = inferChangeCurve(newMetrics, scenario.roundNumber);
  const newBridges = inferBridgesStage(newMetrics, scenario.roundNumber, newCurve);
  
  // Generate summary
  const summary = `Round ${scenario.roundNumber} complete. Stage: ${newBridges} / ${newCurve}. ` +
    `CA:${newMetrics.CA} TR:${newMetrics.TR} RS:${newMetrics.RS}`;
  
  return {
    newState: {
      metrics: newMetrics,
      bridgesStage: newBridges,
      changeCurveState: newCurve
    },
    summary,
    outcomes,
    chosenThemes: themes
  };
}

function processBudgetAllocation(allocation: number[], budgetConfig: any): Metrics {
  // Calculate impact based on allocation balance
  const total = budgetConfig.totalBudget || budgetConfig.categories.length * 100;
  const percentages = allocation.map(a => a / total);
  
  // Different allocations have different impacts
  // Assuming categories are usually: [Training, Communication, Support]
  const trainingPct = percentages[0] || 0;
  const commPct = percentages[1] || 0;
  const supportPct = percentages[2] || 0;
  
  // High training investment
  const trainingImpact = trainingPct > 0.4 ? { CA: 8, EE: 5, TR: 4, RS: -6, MO: 6 } : 
                         trainingPct > 0.25 ? { CA: 4, EE: 2, TR: 2, RS: -3, MO: 3 } :
                         { CA: 0, EE: -2, TR: -1, RS: 2, MO: 0 };
  
  // Communication investment
  const commImpact = commPct > 0.4 ? { TR: 8, LC: 6, RS: -8, MO: 5 } :
                     commPct > 0.25 ? { TR: 4, LC: 3, RS: -4, MO: 2 } :
                     { TR: -2, LC: -2, RS: 5, MO: -1 };
  
  // Support investment
  const supportImpact = supportPct > 0.4 ? { EE: 8, TR: 5, RS: -6, CA: 4 } :
                        supportPct > 0.25 ? { EE: 4, TR: 2, RS: -3, CA: 2 } :
                        { EE: -3, TR: -1, RS: 4, CA: -1 };
  
  // Combine impacts
  return {
    BP: 0,
    CA: trainingImpact.CA + supportImpact.CA,
    EE: trainingImpact.EE + supportImpact.EE,
    TR: trainingImpact.TR + commImpact.TR + supportImpact.TR,
    RS: trainingImpact.RS + commImpact.RS + supportImpact.RS,
    LC: commImpact.LC,
    MO: trainingImpact.MO + commImpact.MO
  };
}

export function calculateScore(metrics: Metrics): { score: number; tier: string } {
  const breakdown = {
    CA: metrics.CA * 0.30,
    TR: metrics.TR * 0.20,
    LC: metrics.LC * 0.20,
    MO: metrics.MO * 0.15,
    BP: metrics.BP * 0.15,
    RS: (100 - metrics.RS) * 0.10
  };
  
  const rawScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
  const score = Math.round(rawScore / 1.10);
  
  let tier: string;
  if (score >= 75) tier = 'Transformation Thriving';
  else if (score >= 60) tier = 'Transformation Stabilising';
  else if (score >= 40) tier = 'Transformation Struggling';
  else tier = 'Transformation Failing';
  
  return { score, tier };
}
