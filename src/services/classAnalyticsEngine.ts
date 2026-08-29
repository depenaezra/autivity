import { ClassSessionStats, MasterDomainExposure, SessionEvaluation } from './class-analytics';

export interface ClassForecastPoint {
  date: string;
  label: string;
  shortDate: string;
  actualScore?: number;
  forecastScore?: number;
  isForecast?: boolean;
}

export interface ClassForecastResult {
  points: ClassForecastPoint[];
  slope: number; // score change per week (0-4 scale)
  trendStatus: 'improving' | 'declining' | 'stable';
  projected14DayScore: number | null;
  estimatedDaysToMastery: number | null;
  targetBenchmark: number; // default 3.2 out of 4.0
}

export interface ClassRecommendation {
  id: string;
  type: 'strength' | 'focus' | 'action' | 'pacing';
  title: string;
  description: string;
  badgeLabel: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  suggestedPath?: string;
}

export const TARGET_MASTERY_SCORE = 3.2; // 80% benchmark on 0-4 rubric scale

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
 * Calculates session average rubric score on a 0-4 scale
 */
export function calculateRubricScore(rubric: any): number | null {
  if (!rubric) return null;
  let parsed = rubric;
  if (typeof rubric === 'string') {
    try {
      parsed = JSON.parse(rubric);
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const values = Object.values(parsed).map((v) => Number(v));
  if (values.length === 0) return null;

  const sum = values.reduce((acc, v) => acc + (isNaN(v) ? 0 : v), 0);
  return sum / values.length;
}

/**
 * Computes 14-day progress trajectory forecast data for a class using OLS Linear Regression
 */
export function calculateClassProgressForecast(
  evaluations: SessionEvaluation[],
  filter: 'today' | 'week' | 'month' | 'overall' = 'overall',
  targetBenchmark = TARGET_MASTERY_SCORE
): ClassForecastResult {
  const now = new Date();
  let threshold = new Date(0);
  if (filter === 'today') {
    threshold = new Date();
    threshold.setHours(0, 0, 0, 0);
  } else if (filter === 'week') {
    threshold = new Date();
    threshold.setDate(now.getDate() - 7);
    threshold.setHours(0, 0, 0, 0);
  } else if (filter === 'month') {
    threshold = new Date();
    threshold.setDate(now.getDate() - 30);
    threshold.setHours(0, 0, 0, 0);
  }

  const filtered = evaluations.filter((s) => new Date(s.created_at) >= threshold);

  // Group by date YYYY-MM-DD
  const groups: Record<string, number[]> = {};
  filtered.forEach((s) => {
    const score = calculateRubricScore(s.rubric_evaluation);
    if (score === null) return;
    const dateKey = new Date(s.created_at).toISOString().split('T')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(score);
  });

  const dateKeys = Object.keys(groups).sort();
  if (dateKeys.length < 2) {
    return {
      points: [],
      slope: 0,
      trendStatus: 'stable',
      projected14DayScore: null,
      estimatedDaysToMastery: null,
      targetBenchmark,
    };
  }

  const startDate = new Date(dateKeys[0] + 'T00:00:00');
  const regPoints = dateKeys.map((key) => {
    const d = new Date(key + 'T00:00:00');
    const dayOffset = Math.round((d.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    const scores = groups[key];
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return { x: dayOffset, y: avg, dateKey: key, avgScore: Number(avg.toFixed(2)) };
  });

  const { slope, intercept } = calculateLinearRegression(regPoints);

  const lastRegPt = regPoints[regPoints.length - 1];
  const projected14DayDayOffset = lastRegPt.x + 14;
  const rawProjected = slope * projected14DayDayOffset + intercept;
  const projected14DayScore = Number(Math.min(4, Math.max(0, rawProjected)).toFixed(1));

  let trendStatus: 'improving' | 'declining' | 'stable' = 'stable';
  if (slope > 0.02) trendStatus = 'improving';
  else if (slope < -0.02) trendStatus = 'declining';

  let estimatedDaysToMastery: number | null = null;
  if (slope > 0.005) {
    const currentScore = lastRegPt.avgScore;
    if (currentScore < targetBenchmark) {
      const daysNeeded = Math.ceil((targetBenchmark - currentScore) / slope);
      if (daysNeeded > 0 && daysNeeded <= 180) {
        estimatedDaysToMastery = daysNeeded;
      }
    }
  }

  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  // Combined actual points
  const points: ClassForecastPoint[] = regPoints.map((p) => {
    const d = new Date(p.dateKey + 'T00:00:00');
    return {
      date: p.dateKey,
      label: `${monthNames[d.getMonth()]} ${d.getDate()}`,
      shortDate: `${d.getMonth() + 1}/${d.getDate()}`,
      actualScore: p.avgScore,
      forecastScore: Number(Math.min(4, Math.max(0, slope * p.x + intercept)).toFixed(2)),
      isForecast: false,
    };
  });

  // Add projected +7 day and +14 day forecast points
  const lastDate = new Date(dateKeys[dateKeys.length - 1] + 'T00:00:00');
  [7, 14].forEach((plusDays) => {
    const futDate = new Date(lastDate.getTime() + plusDays * 24 * 3600 * 1000);
    const futDayOffset = lastRegPt.x + plusDays;
    const futScore = Number(Math.min(4, Math.max(0, slope * futDayOffset + intercept)).toFixed(2));

    points.push({
      date: futDate.toISOString().split('T')[0],
      label: `${monthNames[futDate.getMonth()]} ${futDate.getDate()} (Forecast)`,
      shortDate: `${futDate.getMonth() + 1}/${futDate.getDate()}`,
      forecastScore: futScore,
      isForecast: true,
    });
  });

  return {
    points,
    slope: Number((slope * 7).toFixed(2)), // weekly slope change
    trendStatus,
    projected14DayScore,
    estimatedDaysToMastery,
    targetBenchmark,
  };
}

/**
 * Generates automated pedagogical recommendations based on evaluation trends and domain practice
 */
export function generateClassRecommendations(
  evaluations: SessionEvaluation[],
  domainExposures: MasterDomainExposure[],
  stats: ClassSessionStats | null
): ClassRecommendation[] {
  const recommendations: ClassRecommendation[] = [];

  // 1. Domain Exposure / Strength & Focus Analysis
  if (domainExposures.length > 0) {
    const sortedDomains = [...domainExposures].sort((a, b) => {
      const totalA = a.skills.reduce((sum, s) => sum + s.count, 0);
      const totalB = b.skills.reduce((sum, s) => sum + s.count, 0);
      return totalB - totalA;
    });

    const topDomain = sortedDomains[0];
    const topPractices = topDomain.skills.reduce((sum, s) => sum + s.count, 0);
    recommendations.push({
      id: 'strength_rec',
      type: 'strength',
      title: `Strong Progress: ${topDomain.masterDomain}`,
      description: `The class shows active engagement in ${topDomain.masterDomain} with ${topPractices} practice sessions logged.`,
      badgeLabel: 'TOP DOMAIN',
      accentColor: topDomain.color || '#62A9E6',
      bgColor: '#F0F9FF',
      borderColor: '#BBE8FB',
      textColor: '#62A9E6',
    });

    if (sortedDomains.length > 1) {
      const focusDomain = sortedDomains[sortedDomains.length - 1];
      const focusPractices = focusDomain.skills.reduce((sum, s) => sum + s.count, 0);
      const lowestSkill = focusDomain.skills.length > 0 ? focusDomain.skills[focusDomain.skills.length - 1].name : focusDomain.masterDomain;

      recommendations.push({
        id: 'focus_rec',
        type: 'focus',
        title: `Focus Needed: ${focusDomain.masterDomain}`,
        description: `${focusDomain.masterDomain} currently has lower activity exposure (${focusPractices} practice${focusPractices === 1 ? '' : 's'}). Schedule guided activities in this area.`,
        badgeLabel: 'ATTENTION NEEDED',
        accentColor: '#FFAE02',
        bgColor: '#FFFBEB',
        borderColor: '#FFF3C4',
        textColor: '#D97706',
      });

      recommendations.push({
        id: 'activity_match_rec',
        type: 'action',
        title: `Suggested Activity: ${lowestSkill}`,
        description: `Recommendation: Assign exercises focusing on "${lowestSkill}" to boost proficiency in ${focusDomain.masterDomain}.`,
        badgeLabel: 'SUGGESTED LESSON',
        accentColor: '#A78BFA',
        bgColor: '#FAF5FF',
        borderColor: '#DDD6FE',
        textColor: '#7C3AED',
      });
    }
  }

  // 2. Evaluation Score Analysis
  if (evaluations.length > 0) {
    const validScores = evaluations
      .map((e) => calculateRubricScore(e.rubric_evaluation))
      .filter((s): s is number => s !== null);

    if (validScores.length > 0) {
      const avgScore = validScores.reduce((a, b) => a + b, 0) / validScores.length;

      if (avgScore >= 3.0) {
        recommendations.push({
          id: 'action_mastery',
          type: 'action',
          title: 'Great Class Progress',
          description: `Class evaluation average is strong at ${avgScore.toFixed(1)} / 4.0. Introduce higher complexity tracing or multi-step sorting tasks.`,
          badgeLabel: 'EXCELLENT PACE',
          accentColor: '#179D33',
          bgColor: '#F0FDF4',
          borderColor: '#CBFAC4',
          textColor: '#15803D',
        });
      } else {
        recommendations.push({
          id: 'action_support',
          type: 'action',
          title: 'Extra Guidance Recommended',
          description: `Class evaluation average is currently ${avgScore.toFixed(1)} / 4.0. Provide teacher-guided verbal prompts during task completion.`,
          badgeLabel: 'GUIDANCE NEEDED',
          accentColor: '#FF8870',
          bgColor: '#FFF7ED',
          borderColor: '#FFDBD4',
          textColor: '#C2410C',
        });
      }
    }
  }

  return recommendations;
}
