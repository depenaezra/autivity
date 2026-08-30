import { ParentSessionRecord } from './parentDashboard';

export interface NarrativeHighlight {
  id: string;
  type: 'growth' | 'focus' | 'consistency';
  title: string;
  description: string;
  badgeLabel: string;
}

export interface DomainExplainer {
  domainKey: string;
  name: string;
  color: string;
  shortDefinition: string;
  fullExplanation: string;
  whatToLookFor: string;
}

export interface ForecastPoint {
  date: string;
  label: string;
  shortDate: string;
  actualScore?: number;
  forecastScore?: number;
}

export interface ParentAnalyticsOverview {
  narrativeHighlights: NarrativeHighlight[];
  domainExplainers: DomainExplainer[];
  forecast: {
    points: ForecastPoint[];
    slope: number; // score change per day
    trendStatus: 'improving' | 'declining' | 'stable';
    projected14DayScore: number | null;
    estimatedDaysToMastery: number | null;
  };
}

export const SPED_DOMAIN_EXPLAINERS: DomainExplainer[] = [
  {
    domainKey: 'sensory_regulation',
    name: 'Sensory Regulation',
    color: '#62A9E6',
    shortDefinition: 'How your child processes and responds to sensory inputs like light, sound, and texture.',
    fullExplanation: 'Sensory regulation refers to your child’s ability to remain calm, attentive, and organized when experiencing sensory stimuli in their environment.',
    whatToLookFor: 'Observing how comfortably your child engages with activity materials, sounds, or visual items without becoming overwhelmed or distracted.',
  },
  {
    domainKey: 'cognitive_sorting',
    name: 'Cognitive & Sorting',
    color: '#FFAE02',
    shortDefinition: 'How your child recognizes patterns, categorizes items, and solves logical tasks.',
    fullExplanation: 'Cognitive sorting measures pattern recognition, color/shape matching, memory recall, and basic problem-solving logic during guided activities.',
    whatToLookFor: 'Noticing how quickly your child categorizes matching shapes, colors, or objects during interactive learning tasks.',
  },
  {
    domainKey: 'motor_skills',
    name: 'Motor Skills',
    color: '#179D33',
    shortDefinition: 'Hand-eye coordination, fine motor finger control, and movement accuracy.',
    fullExplanation: 'Motor skills evaluate physical dexterity, hand control, drag-and-drop accuracy, tracing stamina, and precision during digital or physical activities.',
    whatToLookFor: 'Observing steady finger placement, smooth line tracing, and accurate object placement on screen or paper.',
  },
  {
    domainKey: 'communication_aac',
    name: 'Communication & AAC',
    color: '#FF8870',
    shortDefinition: 'Expressive and receptive communication using spoken words, visual icons, or AAC tools.',
    fullExplanation: 'Communication & AAC (Augmentative and Alternative Communication) tracks how your child expresses choices, identifies picture cards, and responds to verbal or visual prompts.',
    whatToLookFor: 'Noticing if your child selects correct communication icons or responds to teacher instructions during sessions.',
  },
  {
    domainKey: 'social_turn_taking',
    name: 'Social & Turn-Taking',
    color: '#A855F7',
    shortDefinition: 'Collaborative behavior, sharing attention, and following turn-taking rules.',
    fullExplanation: 'Social turn-taking measures cooperative interaction, patience while waiting for instructions, and social engagement with educators and peers.',
    whatToLookFor: 'Observing willingness to share activity turns, follow multi-step instructions, and maintain positive engagement.',
  },
];

/**
 * Calculates Ordinary Least Squares (OLS) Linear Regression (y = mx + b)
 */
export function calculateLinearRegression(points: { x: number; y: number }[]): { slope: number; intercept: number } {
  if (points.length < 2) return { slope: 0, intercept: points[0]?.y || 0 };
  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  points.forEach((p) => {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  });

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return { slope: 0, intercept: sumY / n };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

/**
 * Generates plain-English narrative summary highlights based on evaluated sessions
 */
export function generateNarrativeHighlights(
  evaluatedSessions: ParentSessionRecord[],
  masterDomains: { name: string; subSkills: string[] }[] = []
): NarrativeHighlight[] {
  const highlights: NarrativeHighlight[] = [];

  if (evaluatedSessions.length === 0) {
    return [
      {
        id: 'no_data',
        type: 'growth',
        title: 'Awaiting Evaluated Sessions',
        description: 'Narrative progress highlights will update automatically once session evaluations are recorded by the teacher.',
        badgeLabel: 'STATUS',
      },
    ];
  }

  // 1. Calculate domain performance map
  const domainScores: Record<string, number[]> = {};
  evaluatedSessions.forEach((s) => {
    if (!s.rubricEvaluation) return;
    const r = s.rubricEvaluation;
    const sum =
      (r.looking_at_objects || 0) +
      (r.concentrating || 0) +
      (r.performing_task || 0) +
      (r.following_instructions || 0) +
      (r.completed_work || 0);
    const scorePct = Math.round((sum / 25) * 100);

    const domains = s.skill_domain.length > 0 ? s.skill_domain : [s.category || 'General Skills'];
    domains.forEach((d) => {
      const clean = d.trim();
      if (!domainScores[clean]) domainScores[clean] = [];
      domainScores[clean].push(scorePct);
    });
  });

  const domainAverages = Object.entries(domainScores).map(([name, scores]) => ({
    name,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  })).sort((a, b) => b.avg - a.avg);

  // Growth Highlight
  if (domainAverages.length > 0) {
    const top = domainAverages[0];
    highlights.push({
      id: 'growth_highlight',
      type: 'growth',
      title: `Strong Momentum: ${top.name}`,
      description: `Your child is demonstrating solid proficiency in ${top.name} with an average evaluated performance score of ${top.avg}%.`,
      badgeLabel: 'TOP STRENGTH',
    });
  }

  // Focus Area Highlight
  if (domainAverages.length > 1) {
    const lowest = domainAverages[domainAverages.length - 1];
    highlights.push({
      id: 'focus_highlight',
      type: 'focus',
      title: `Active Focus: ${lowest.name}`,
      description: `${lowest.name} is currently receiving focused attention in classroom activities with a current average of ${lowest.avg}%.`,
      badgeLabel: 'FOCUS AREA',
    });
  }

  // Consistency Highlight
  const totalCount = evaluatedSessions.length;
  highlights.push({
    id: 'consistency_highlight',
    type: 'consistency',
    title: `Sessions: ${totalCount} Evaluated`,
    description: `Teachers have validated ${totalCount} learning session evaluation${totalCount > 1 ? 's' : ''} for this timeframe.`,
    badgeLabel: 'CONSISTENCY',
  });

  return highlights;
}

/**
 * Computes 14-day progress trajectory forecast data using OLS Linear Regression
 */
export function generateProgressForecast(
  evaluatedSessions: ParentSessionRecord[]
): ParentAnalyticsOverview['forecast'] {
  if (evaluatedSessions.length < 2) {
    return {
      points: [],
      slope: 0,
      trendStatus: 'stable',
      projected14DayScore: null,
      estimatedDaysToMastery: null,
    };
  }

  // Group daily evaluated averages sorted by date
  const groups: Record<string, number[]> = {};
  const sorted = [...evaluatedSessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sorted.forEach((s) => {
    let scorePct: number | null = null;
    if (s.rubricEvaluation) {
      const r = s.rubricEvaluation;
      const sum =
        (r.looking_at_objects || 0) +
        (r.concentrating || 0) +
        (r.performing_task || 0) +
        (r.following_instructions || 0) +
        (r.completed_work || 0);
      scorePct = Math.round((sum / 25) * 100);
    }
    if (scorePct == null) return;

    const dateKey = new Date(s.date).toISOString().split('T')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(scorePct);
  });

  const dateKeys = Object.keys(groups).sort();
  if (dateKeys.length < 2) {
    return {
      points: [],
      slope: 0,
      trendStatus: 'stable',
      projected14DayScore: null,
      estimatedDaysToMastery: null,
    };
  }

  const startDate = new Date(dateKeys[0] + 'T00:00:00');
  const regPoints = dateKeys.map((key) => {
    const d = new Date(key + 'T00:00:00');
    const dayOffset = Math.round((d.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    const scores = groups[key];
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return { x: dayOffset, y: avg, dateKey: key, avgScore: Math.round(avg) };
  });

  const { slope, intercept } = calculateLinearRegression(regPoints);

  const lastRegPt = regPoints[regPoints.length - 1];
  const projected14DayDayOffset = lastRegPt.x + 14;
  const rawProjected = slope * projected14DayDayOffset + intercept;
  const projected14DayScore = Math.min(100, Math.max(0, Math.round(rawProjected)));

  let trendStatus: 'improving' | 'declining' | 'stable' = 'stable';
  if (slope > 0.3) trendStatus = 'improving';
  else if (slope < -0.3) trendStatus = 'declining';

  // Target date estimate for 85% mastery
  let estimatedDaysToMastery: number | null = null;
  if (slope > 0.1 && lastRegPt.avgScore < 85) {
    estimatedDaysToMastery = Math.max(1, Math.round((85 - lastRegPt.avgScore) / slope));
  }

  // Generate combined actual + forecast point array
  const points: ForecastPoint[] = regPoints.map((p) => {
    const d = new Date(p.dateKey + 'T00:00:00');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
      date: p.dateKey,
      label: `${monthNames[d.getMonth()]} ${d.getDate()}`,
      shortDate: `${d.getMonth() + 1}/${d.getDate()}`,
      actualScore: p.avgScore,
      forecastScore: Math.min(100, Math.max(0, Math.round(slope * p.x + intercept))),
    };
  });

  // Add projected +7 day and +14 day points
  const lastDate = new Date(dateKeys[dateKeys.length - 1] + 'T00:00:00');
  [7, 14].forEach((plusDays) => {
    const futDate = new Date(lastDate.getTime() + plusDays * 24 * 3600 * 1000);
    const futDayOffset = lastRegPt.x + plusDays;
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const futScore = Math.min(100, Math.max(0, Math.round(slope * futDayOffset + intercept)));

    points.push({
      date: futDate.toISOString().split('T')[0],
      label: `${monthNames[futDate.getMonth()]} ${futDate.getDate()} (Forecast)`,
      shortDate: `${futDate.getMonth() + 1}/${futDate.getDate()}`,
      forecastScore: futScore,
    });
  });

  return {
    points,
    slope: Math.round(slope * 100) / 100,
    trendStatus,
    projected14DayScore,
    estimatedDaysToMastery,
  };
}
