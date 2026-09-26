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

export const ANALYTICS_THRESHOLDS = {
  MASTERY_GOAL: 80.0,
  TREND_SIGNIFICANT_DELTA: 5.0,
  TIER1_STRENGTH_MIN: 80.0,
  TIER3_FOCUS_MAX: 65.0,
  BALANCED_DOMAIN_DIFF_MAX: 10.0,
  STAMINA_HIGH_MINUTES: 15.0,
  STAMINA_INTERVAL_MINUTES: 8.0,
  MIN_INTERVAL_SESSIONS: 4,
  CONSISTENCY_HIGH_SESSIONS_PER_WEEK: 4,
} as const;

export interface ChartTakeaway {
  badgeLabel: string;
  badgeType: 'growth' | 'focus' | 'steady' | 'outlook' | 'neutral';
  title: string;
  description: string;
  recommendation?: string;
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

import { ActivityTypeFilter } from './analytics';

/**
 * Generates plain-English narrative summary highlights based on evaluated sessions
 */
export function generateNarrativeHighlights(
  evaluatedSessions: ParentSessionRecord[],
  masterDomains: { name: string; subSkills: string[] }[] = [],
  activityType: ActivityTypeFilter = 'all'
): NarrativeHighlight[] {
  const highlights: NarrativeHighlight[] = [];

  const activityNoun =
    activityType === 'app' ? 'app activities' : activityType === 'classroom' ? 'classroom activities' : 'learning activities';
  const sessionNoun =
    activityType === 'app' ? 'app activity' : activityType === 'classroom' ? 'classroom activity' : 'learning session';
  const sessionTitle =
    activityType === 'app' ? 'App Sessions' : activityType === 'classroom' ? 'Classroom Sessions' : 'Sessions';

  if (evaluatedSessions.length === 0) {
    return [
      {
        id: 'no_data',
        type: 'growth',
        title: 'Awaiting Evaluated Sessions',
        description: `Narrative progress highlights will update automatically once ${activityNoun} evaluations are recorded by the teacher.`,
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
      description: `Your child is demonstrating solid proficiency in ${top.name} with an average evaluated score of ${top.avg}% in ${activityNoun}.`,
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
      description: `${lowest.name} is currently receiving focused guidance in ${activityNoun} with an average of ${lowest.avg}%.`,
      badgeLabel: 'FOCUS AREA',
    });
  }

  // Consistency Highlight
  const totalCount = evaluatedSessions.length;
  highlights.push({
    id: 'consistency_highlight',
    type: 'consistency',
    title: `${sessionTitle}: ${totalCount} Evaluated`,
    description: `Teachers have validated ${totalCount} ${sessionNoun} evaluation${totalCount > 1 ? 's' : ''} for this timeframe.`,
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

/**
 * Generates dynamic, evidence-based takeaway for the Progress Over Time Trend Chart
 */
export function getProgressTrendTakeaway(params: {
  trendDifference: number | null;
  averageScore: number;
  totalPoints: number;
  timeframeLabel: string;
  activityType?: ActivityTypeFilter;
}): ChartTakeaway {
  const { trendDifference, averageScore, totalPoints, timeframeLabel, activityType = 'all' } = params;

  const activityNoun =
    activityType === 'app' ? 'app activities' : activityType === 'classroom' ? 'classroom activities' : 'learning activities';

  if (totalPoints < 2) {
    return {
      badgeLabel: 'AWAITING DATA',
      badgeType: 'neutral',
      title: 'Building Baseline Trend',
      description: `Progress trends require at least 2 evaluated ${activityNoun} to establish an authentic performance baseline.`,
      recommendation: 'Check back after upcoming sessions are validated by the educator.',
    };
  }

  // Criterion Mastery achieved (≥ 85%)
  if (averageScore >= ANALYTICS_THRESHOLDS.MASTERY_GOAL) {
    return {
      badgeLabel: 'GOAL REACHED',
      badgeType: 'growth',
      title: 'Skills Mastered',
      description: `Your child is doing amazing! They can now complete these ${activityNoun} comfortably and on their own.`,
      recommendation: 'Encourage continued practice to reinforce confidence across everyday routines.',
    };
  }

  // Meaningful growth (≥ +5%)
  if (trendDifference !== null && trendDifference >= ANALYTICS_THRESHOLDS.TREND_SIGNIFICANT_DELTA) {
    return {
      badgeLabel: 'GREAT PROGRESS',
      badgeType: 'growth',
      title: 'Making Great Progress',
      description: `Your child is showing noticeable improvements in following steps and staying engaged during ${activityNoun}.`,
      recommendation: 'Celebrate this momentum! Positive encouragement helps build ongoing learning stamina.',
    };
  }

  // Meaningful dip (≤ -5%)
  if (trendDifference !== null && trendDifference <= -ANALYTICS_THRESHOLDS.TREND_SIGNIFICANT_DELTA) {
    return {
      badgeLabel: 'NEEDS PRACTICE',
      badgeType: 'focus',
      title: 'Learning New Challenges',
      description: `Scores dipped slightly as ${activityNoun} introduced new challenges. Teachers are providing extra step-by-step guidance.`,
      recommendation: 'Gentle, low-pressure practice at home helps your child become comfortable with new steps.',
    };
  }

  // Steady pace (-4.9% to +4.9%)
  return {
    badgeLabel: 'STEADY PACE',
    badgeType: 'steady',
    title: 'Consistent Practice',
    description: `Your child is maintaining a steady and reliable learning routine during ${activityNoun}.`,
    recommendation: 'Maintaining this stable routine helps build long-term confidence before introducing new steps.',
  };
}

/**
 * Generates dynamic domain insights based on RTI skill tiers and balance
 */
export function getSkillDomainTakeaways(
  domainScores: { label: string; value: number }[],
  activityType: ActivityTypeFilter = 'all'
): ChartTakeaway[] {
  const takeaways: ChartTakeaway[] = [];
  const evaluated = domainScores.filter((d) => d.value > 0);

  const taskNoun =
    activityType === 'app' ? 'app activities' : activityType === 'classroom' ? 'classroom tasks' : 'activities';

  if (evaluated.length === 0) {
    return [
      {
        badgeLabel: 'AWAITING DATA',
        badgeType: 'neutral',
        title: 'Domain Evaluations In Progress',
        description: `Domain-specific competency scores will populate once rubric evaluations in ${taskNoun} are recorded.`,
      },
    ];
  }

  const sorted = [...evaluated].sort((a, b) => b.value - a.value);
  const top = sorted[0];
  const lowest = sorted[sorted.length - 1];

  // Tier 1 Top Strength (≥ 75% or highest)
  if (top) {
    const isTier1 = top.value >= ANALYTICS_THRESHOLDS.TIER1_STRENGTH_MIN;
    takeaways.push({
      badgeLabel: isTier1 ? 'TOP STRENGTH' : 'LEADING AREA',
      badgeType: 'growth',
      title: `${top.label} (${top.value}%)`,
      description: isTier1
        ? `Demonstrates high independence and self-regulation in ${top.label} ${taskNoun} with minimal teacher prompting.`
        : `Currently shows the highest relative engagement and comfort in ${top.label} ${taskNoun}.`,
      recommendation: 'Use this preferred skill area to build confidence at the start of learning routines.',
    });
  }

  // Balanced Profile Check (diff ≤ 10%)
  if (sorted.length >= 3 && top.value - lowest.value <= ANALYTICS_THRESHOLDS.BALANCED_DOMAIN_DIFF_MAX) {
    const avg = Math.round(sorted.reduce((sum, d) => sum + d.value, 0) / sorted.length);
    takeaways.push({
      badgeLabel: 'BALANCED GROWTH',
      badgeType: 'steady',
      title: 'Well-Rounded Skill Development',
      description: `Scores across all evaluated domains are within 10% of each other (averaging ${avg}%), indicating harmonious development in ${taskNoun}.`,
    });
  } else if (lowest && (lowest.value < ANALYTICS_THRESHOLDS.TIER3_FOCUS_MAX || sorted.length > 1)) {
    // Tier 3 Active Focus (< 60% or lowest)
    takeaways.push({
      badgeLabel: 'ACTIVE FOCUS',
      badgeType: 'focus',
      title: `${lowest.label} (${lowest.value}%)`,
      description: lowest.value < ANALYTICS_THRESHOLDS.TIER3_FOCUS_MAX
        ? `${lowest.label} is currently receiving focused guidance with visual cues and step-by-step prompts in ${taskNoun}.`
        : `Teachers are providing targeted practice in ${lowest.label} to bring it in balance with other domains.`,
      recommendation: 'Try simple, low-pressure matching or verbal imitation games at home to reinforce classroom work.',
    });
  }

  return takeaways;
}

/**
 * Generates dynamic activity performance interpretation
 */
export function getActivityPerformanceTakeaway(
  activityData: { label: string; value: number }[],
  activityType: ActivityTypeFilter = 'all'
): ChartTakeaway {
  const activityNoun =
    activityType === 'app' ? 'app activities' : activityType === 'classroom' ? 'classroom activities' : 'activities';

  if (activityData.length === 0) {
    return {
      badgeLabel: 'NO DATA YET',
      badgeType: 'neutral',
      title: 'Activity Scores Updating',
      description: `Scores for each category will appear as your child completes ${activityNoun}.`,
    };
  }

  const top = activityData[0];
  const lowest = activityData.length > 1 ? activityData[activityData.length - 1] : null;

  if (top && top.value >= ANALYTICS_THRESHOLDS.TIER1_STRENGTH_MIN) {
    return {
      badgeLabel: 'TOP ACTIVITY',
      badgeType: 'growth',
      title: top.label,
      description: `Your child is doing great with ${top.label} ${activityNoun}!${
        lowest && lowest.value < ANALYTICS_THRESHOLDS.TIER3_FOCUS_MAX
          ? ` They are getting extra practice with ${lowest.label} in ${activityType === 'app' ? 'app games' : 'guided practice'}.`
          : ''
      }`,
      recommendation: `Starting with activities they enjoy (like ${top.label}) helps them feel confident before trying harder ones.`,
    };
  }

  return {
    badgeLabel: 'IN PROGRESS',
    badgeType: 'steady',
    title: top.label,
    description: `Your child is actively practicing ${top.label} and other ${activityNoun}.`,
    recommendation: 'Doing simple learning games together at home helps reinforce what they practice with teachers.',
  };
}

/**
 * Generates contextual interpretation chips for the 3 overview stats cards
 */
export function getStatsInsights(stats: {
  overallPerformance: number;
  avgSessionMinutes: number;
  totalSessions: number;
}): {
  performanceBadge: { label: string; color: string; bg: string; border: string };
  staminaBadge: { label: string; color: string; bg: string; border: string };
  consistencyBadge: { label: string; color: string; bg: string; border: string };
} {
  // 1. Performance Badge
  let performanceBadge = { label: 'EMERGING', color: '#FFAE02', bg: '#FFF3C4', border: '#FFAE02' };
  if (stats.overallPerformance >= ANALYTICS_THRESHOLDS.MASTERY_GOAL) {
    performanceBadge = { label: 'MASTERY LEVEL', color: '#179D33', bg: '#DCFCE7', border: '#86EFAC' };
  } else if (stats.overallPerformance >= ANALYTICS_THRESHOLDS.TIER1_STRENGTH_MIN) {
    performanceBadge = { label: 'SOLID PROFICIENCY', color: '#62A9E6', bg: '#E0F2FE', border: '#BBE8FB' };
  } else if (stats.overallPerformance === 0) {
    performanceBadge = { label: 'AWAITING SESSIONS', color: '#9CA3AF', bg: '#F3F4F6', border: '#E5E7EB' };
  }

  // 2. Stamina Badge (>15m vs <8m)
  let staminaBadge = { label: 'BALANCED DURATION', color: '#62A9E6', bg: '#E0F2FE', border: '#BBE8FB' };
  if (stats.avgSessionMinutes >= ANALYTICS_THRESHOLDS.STAMINA_HIGH_MINUTES) {
    staminaBadge = { label: 'GREAT STAMINA (>15m)', color: '#179D33', bg: '#DCFCE7', border: '#86EFAC' };
  } else if (
    stats.avgSessionMinutes > 0 &&
    stats.avgSessionMinutes <= ANALYTICS_THRESHOLDS.STAMINA_INTERVAL_MINUTES &&
    stats.totalSessions >= ANALYTICS_THRESHOLDS.MIN_INTERVAL_SESSIONS
  ) {
    staminaBadge = { label: 'BITE-SIZED INTERVALS', color: '#FFAE02', bg: '#FFF3C4', border: '#FFAE02' };
  } else if (stats.avgSessionMinutes === 0) {
    staminaBadge = { label: 'NO DURATION LOGGED', color: '#9CA3AF', bg: '#F3F4F6', border: '#E5E7EB' };
  }

  // 3. Consistency Badge (≥4 sessions/week)
  let consistencyBadge = { label: 'ACTIVE ROUTINE', color: '#62A9E6', bg: '#E0F2FE', border: '#BBE8FB' };
  if (stats.totalSessions >= ANALYTICS_THRESHOLDS.CONSISTENCY_HIGH_SESSIONS_PER_WEEK) {
    consistencyBadge = { label: 'HIGH CONSISTENCY (4+)', color: '#179D33', bg: '#DCFCE7', border: '#86EFAC' };
  } else if (stats.totalSessions <= 1) {
    consistencyBadge = { label: 'BUILDING ROUTINE', color: '#9CA3AF', bg: '#F3F4F6', border: '#E5E7EB' };
  }

  return { performanceBadge, staminaBadge, consistencyBadge };
}

