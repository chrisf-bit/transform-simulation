import { NewsItem, Metrics, GameState } from './types.js';

let newsIdCounter = 0;

function generateNewsId(): string {
  return `news_${newsIdCounter++}`;
}

export function generateNewsForRound(
  round: number,
  metrics: Metrics,
  state: GameState,
  chosenThemes: string[]
): NewsItem[] {
  const news: NewsItem[] = [];
  const now = Date.now();

  // Employee sentiment based on metrics
  if (metrics.EE < 40) {
    news.push({
      id: generateNewsId(),
      timestamp: now,
      type: 'employee',
      text: '"I\'m exhausted. Another initiative that means more work with less support."',
      sentiment: 'negative'
    });
  } else if (metrics.EE > 70) {
    news.push({
      id: generateNewsId(),
      timestamp: now,
      type: 'employee',
      text: '"Finally seeing how this benefits us. The training actually helped!"',
      sentiment: 'positive'
    });
  }

  // Trust-based news
  if (metrics.TR < 40) {
    news.push({
      id: generateNewsId(),
      timestamp: now,
      type: 'rumor',
      text: 'Rumor mill: "They say one thing but do another. Why should we believe them?"',
      sentiment: 'negative'
    });
  } else if (metrics.TR > 70) {
    news.push({
      id: generateNewsId(),
      timestamp: now,
      type: 'department',
      text: 'HR Update: Employee confidence surveys show marked improvement in leadership trust.',
      sentiment: 'positive'
    });
  }

  // Resistance indicators
  if (metrics.RS > 70) {
    news.push({
      id: generateNewsId(),
      timestamp: now,
      type: 'department',
      text: 'Operations: Multiple teams report workarounds to avoid new processes.',
      sentiment: 'negative'
    });
  } else if (metrics.RS < 30) {
    news.push({
      id: generateNewsId(),
      timestamp: now,
      type: 'department',
      text: 'Sales: Early adoption exceeding expectations. Team morale high.',
      sentiment: 'positive'
    });
  }

  // Change adoption progress
  if (metrics.CA > 60) {
    news.push({
      id: generateNewsId(),
      timestamp: now,
      type: 'department',
      text: 'IT: System adoption at 75%. Champions program showing real impact.',
      sentiment: 'positive'
    });
  } else if (metrics.CA < 35) {
    news.push({
      id: generateNewsId(),
      timestamp: now,
      type: 'employee',
      text: '"Nobody showed us how to use the new system. We\'re making it up as we go."',
      sentiment: 'negative'
    });
  }

  // Leadership credibility
  if (metrics.LC < 40) {
    news.push({
      id: generateNewsId(),
      timestamp: now,
      type: 'rumor',
      text: 'Corridor talk: "Leadership doesn\'t understand what it\'s like on the ground."',
      sentiment: 'negative'
    });
  }

  // Momentum indicators
  if (metrics.MO > 65) {
    news.push({
      id: generateNewsId(),
      timestamp: now,
      type: 'department',
      text: 'Change Office: Quick wins generating genuine excitement across divisions.',
      sentiment: 'positive'
    });
  }

  // External pressure based on round
  if (round === 2) {
    news.push({
      id: generateNewsId(),
      timestamp: now,
      type: 'external',
      text: 'Industry News: Competitor announces parallel transformation. Market watching closely.',
      sentiment: 'neutral'
    });
  }

  if (round === 4) {
    news.push({
      id: generateNewsId(),
      timestamp: now,
      type: 'external',
      text: 'Analyst Report: Early indicators suggest transformation timeline may slip.',
      sentiment: 'negative'
    });
  }

  // Theme-based news
  if (chosenThemes.includes('acknowledge_loss')) {
    news.push({
      id: generateNewsId(),
      timestamp: now,
      type: 'employee',
      text: '"Leadership actually listened. First time someone acknowledged what we\'re giving up."',
      sentiment: 'positive'
    });
  }

  if (chosenThemes.includes('overconfident')) {
    news.push({
      id: generateNewsId(),
      timestamp: now,
      type: 'rumor',
      text: 'Water cooler: "They think this is easy. Have they even talked to anyone doing the work?"',
      sentiment: 'negative'
    });
  }

  if (chosenThemes.includes('force')) {
    news.push({
      id: generateNewsId(),
      timestamp: now,
      type: 'employee',
      text: '"Comply or else. Not exactly inspiring, is it?"',
      sentiment: 'negative'
    });
  }

  if (chosenThemes.includes('capability')) {
    news.push({
      id: generateNewsId(),
      timestamp: now,
      type: 'department',
      text: 'Learning & Development: Training completion rates ahead of plan. Skills gaps closing.',
      sentiment: 'positive'
    });
  }

  // Stage-specific news
  if (state.bridgesStage === 'NeutralZone') {
    news.push({
      id: generateNewsId(),
      timestamp: now,
      type: 'employee',
      text: '"Everything feels uncertain. Old ways gone, new ways not working yet."',
      sentiment: 'neutral'
    });
  }

  if (state.changeCurveState === 'Anger') {
    news.push({
      id: generateNewsId(),
      timestamp: now,
      type: 'rumor',
      text: 'Anonymous feedback: "Why are we destroying what worked? This feels reckless."',
      sentiment: 'negative'
    });
  }

  if (state.changeCurveState === 'Commitment') {
    news.push({
      id: generateNewsId(),
      timestamp: now,
      type: 'department',
      text: 'All Hands Feedback: "Seeing the vision now. This is going somewhere good."',
      sentiment: 'positive'
    });
  }

  return news.slice(0, 4); // Limit to 4 news items per round
}

export function generateStartingNews(): NewsItem[] {
  const now = Date.now();
  return [
    {
      id: generateNewsId(),
      timestamp: now,
      type: 'external',
      text: 'Board Announcement: Major digital transformation initiative launched. Timeline: 18 months.',
      sentiment: 'neutral'
    },
    {
      id: generateNewsId(),
      timestamp: now,
      type: 'employee',
      text: '"Here we go again. Another change program..."',
      sentiment: 'negative'
    },
    {
      id: generateNewsId(),
      timestamp: now,
      type: 'rumor',
      text: 'Rumor mill: "Is this really about digital or are there redundancies coming?"',
      sentiment: 'negative'
    }
  ];
}
