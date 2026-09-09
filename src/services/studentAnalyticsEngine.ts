import { MasterDomainExposure, SessionEvaluation } from './class-analytics';
import { calculateLinearRegression, calculateRubricScore, TARGET_MASTERY_SCORE } from './classAnalyticsEngine';

export interface StudentForecastPoint {
  date: string;
  label: string;
  shortDate: string;
  actualScore?: number;
  forecastScore?: number;
  isForecast?: boolean;
}

export interface StudentForecastResult {
  points: StudentForecastPoint[];
  slope: number; // score change per week (0-4 scale)
  trendStatus: 'improving' | 'declining' | 'stable';
  projected14DayScore: number | null;
  estimatedDaysToMastery: number | null;
  targetBenchmark: number; // default 3.2 out of 4.0
}

export interface StudentRecommendation {
  id: string;
  type: 'strength' | 'focus' | 'action' | 'pacing';
  title: string;
  description: string;
  badgeLabel: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

/**
 * Computes 14-day progress trajectory forecast data for an individual student using OLS Linear Regression
 */
export function calculateStudentProgressForecast(
  evaluations: SessionEvaluation[],
  filter: 'today' | 'week' | 'month' | 'overall' = 'overall',
  targetBenchmark = TARGET_MASTERY_SCORE
): StudentForecastResult {
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

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Historical points
  const points: StudentForecastPoint[] = regPoints.map((p) => {
    const d = new Date(p.dateKey + 'T00:00:00');
    return {
      date: p.dateKey,
      label: `${monthNames[d.getMonth()]} ${d.getDate()}`,
      shortDate: `${d.getMonth() + 1}/${d.getDate()}`,
      actualScore: p.avgScore,
      isForecast: false,
    };
  });

  // Future 7-day and 14-day projected points
  const lastDate = new Date(dateKeys[dateKeys.length - 1] + 'T00:00:00');

  [7, 14].forEach((offsetDays) => {
    const futureDate = new Date(lastDate);
    futureDate.setDate(lastDate.getDate() + offsetDays);
    const dateStr = futureDate.toISOString().split('T')[0];
    const totalDayOffset = lastRegPt.x + offsetDays;
    const projectedScore = Math.min(4, Math.max(0, slope * totalDayOffset + intercept));

    points.push({
      date: dateStr,
      label: `${monthNames[futureDate.getMonth()]} ${futureDate.getDate()}`,
      shortDate: `${futureDate.getMonth() + 1}/${futureDate.getDate()}`,
      forecastScore: Number(projectedScore.toFixed(2)),
      isForecast: true,
    });
  });

  return {
    points,
    slope: Number((slope * 7).toFixed(2)), // weekly slope
    trendStatus,
    projected14DayScore,
    estimatedDaysToMastery,
    targetBenchmark,
  };
}

/**
 * Generates tailored SPED recommendations for an individual student
 */
export function generateStudentRecommendations(
  evaluations: SessionEvaluation[],
  domainExposures: MasterDomainExposure[],
  studentName = 'Student'
): StudentRecommendation[] {
  const recommendations: StudentRecommendation[] = [];

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
      id: 'student_strength_rec',
      type: 'strength',
      title: `Strong Progress: ${topDomain.masterDomain}`,
      description: `Active engagement in ${topDomain.masterDomain} with ${topPractices} practice sessions logged.`,
      badgeLabel: 'TOP DOMAIN',
      accentColor: topDomain.color || '#62A9E6',
      bgColor: '#F0F0FF',
      borderColor: '#BBE8FB',
      textColor: '#62A9E6',
    });

    if (sortedDomains.length > 1) {
      const focusDomain = sortedDomains[sortedDomains.length - 1];
      const focusPractices = focusDomain.skills.reduce((sum, s) => sum + s.count, 0);
      const lowestSkill = focusDomain.skills.length > 0 ? focusDomain.skills[focusDomain.skills.length - 1].name : focusDomain.masterDomain;

      recommendations.push({
        id: 'student_focus_rec',
        type: 'focus',
        title: `Focus Needed: ${focusDomain.masterDomain}`,
        description: `${focusDomain.masterDomain} currently has lower activity exposure (${focusPractices} practice${focusPractices === 1 ? '' : 's'}). Schedule guided tasks in this domain.`,
        badgeLabel: 'ATTENTION NEEDED',
        accentColor: '#FFAE02',
        bgColor: '#FFFBEB',
        borderColor: '#FFF3C4',
        textColor: '#D97706',
      });

      recommendations.push({
        id: 'student_activity_match_rec',
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
          id: 'student_action_mastery',
          type: 'action',
          title: 'Great Progress',
          description: `Average evaluation score is strong at ${avgScore.toFixed(1)} / 4.0. Introduce higher complexity tracing or multi-step sorting tasks.`,
          badgeLabel: 'EXCELLENT PACE',
          accentColor: '#179D33',
          bgColor: '#F0FDF4',
          borderColor: '#CBFAC4',
          textColor: '#15803D',
        });
      } else {
        recommendations.push({
          id: 'student_action_support',
          type: 'action',
          title: 'Extra Guidance Recommended',
          description: `Average evaluation score is currently ${avgScore.toFixed(1)} / 4.0. Provide teacher-guided verbal prompts and additional visual cues during sessions.`,
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

export interface SchoolWeekDayEmotion {
  dayName: string; // 'MON', 'TUE', 'WED', 'THU', 'FRI'
  fullDateStr: string; // 'YYYY-MM-DD'
  monthDayStr: string; // '09/08'
  isToday: boolean;
  isFuture: boolean;
  checkIn: {
    emotion: string;
    label: string;
    tagalogLabel: string;
    zone: 'optimal' | 'heightened' | 'low_energy';
  } | null;
  evaluation: {
    score: number; // 0.0 - 4.0
    percentage: number; // 0 - 100%
    activityTitle?: string;
  } | null;
}

export interface ZoneDistributionStat {
  zoneKey: 'optimal' | 'heightened' | 'low_energy';
  title: string;
  tagline: string;
  color: string;
  bgColor: string;
  borderColor: string;
  trackBg: string;
  count: number;
  percentage: number;
  averageScore: number | null;
  evaluatedSessionsCount: number;
}

export interface EmotionRegulationAnalytics {
  totalCheckIns: number;
  schoolWeekDays: SchoolWeekDayEmotion[];
  weekLoggedCount: number;
  weekMissedLogs: number;
  zoneDistribution: ZoneDistributionStat[];
  dominantZone: 'optimal' | 'heightened' | 'low_energy' | null;
  dominantEmotion: string | null;
  optimalZoneCorrelationScore: number | null;
  otherZoneCorrelationScore: number | null;
  insightSummary: string;
  pedagogicalTip: string;
}

/**
 * Generates the 5-day school week (Mon-Fri) for a given weekOffset, check-ins map, and evaluations
 */
export function generateSchoolWeekDays(
  checkIns: { student_id: string; emotion: string; check_in_date: string }[],
  weekOffset: number = 0,
  evaluations: SessionEvaluation[] = []
): { schoolWeekDays: SchoolWeekDayEmotion[]; weekLoggedCount: number; weekMissedLogs: number } {
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const mondayOffset = (currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek) + weekOffset * 7;
  const mondayDate = new Date(now);
  mondayDate.setDate(now.getDate() + mondayOffset);
  mondayDate.setHours(0, 0, 0, 0);

  const checkInMapByDate = new Map<string, string>();
  checkIns.forEach((c) => {
    checkInMapByDate.set(c.check_in_date, c.emotion.toLowerCase());
  });

  // Map evaluations by date YYYY-MM-DD
  const evalByDate = new Map<string, number[]>();
  evaluations.forEach((ev) => {
    const score = calculateRubricScore(ev.rubric_evaluation);
    if (score !== null && ev.created_at) {
      const d = new Date(ev.created_at).toISOString().split('T')[0];
      const existing = evalByDate.get(d) || [];
      existing.push(score);
      evalByDate.set(d, existing);
    }
  });

  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const schoolWeekDays: SchoolWeekDayEmotion[] = [];

  for (let i = 0; i < 5; i++) {
    const dayDate = new Date(mondayDate);
    dayDate.setDate(mondayDate.getDate() + i);

    const year = dayDate.getFullYear();
    const month = String(dayDate.getMonth() + 1).padStart(2, '0');
    const day = String(dayDate.getDate()).padStart(2, '0');
    const fullDateStr = `${year}-${month}-${day}`;
    const monthDayStr = `${month}/${day}`;

    const isToday =
      dayDate.getDate() === now.getDate() &&
      dayDate.getMonth() === now.getMonth() &&
      dayDate.getFullYear() === now.getFullYear();

    const isFuture = dayDate > now && !isToday;

    const loggedEmotion = checkInMapByDate.get(fullDateStr);
    let checkInData: SchoolWeekDayEmotion['checkIn'] = null;

    if (loggedEmotion) {
      let zone: 'optimal' | 'heightened' | 'low_energy' = 'optimal';
      let label = loggedEmotion.toUpperCase();
      let tagalogLabel = '';

      if (loggedEmotion === 'happy') {
        zone = 'optimal';
        label = 'HAPPY';
        tagalogLabel = 'Masaya';
      } else if (loggedEmotion === 'calm') {
        zone = 'optimal';
        label = 'CALM';
        tagalogLabel = 'Kalmado';
      } else if (loggedEmotion === 'excited') {
        zone = 'heightened';
        label = 'EXCITED';
        tagalogLabel = 'Masigla';
      } else if (loggedEmotion === 'nervous') {
        zone = 'heightened';
        label = 'NERVOUS';
        tagalogLabel = 'Kinakabahan';
      } else if (loggedEmotion === 'tired') {
        zone = 'low_energy';
        label = 'TIRED';
        tagalogLabel = 'Pagod';
      } else if (loggedEmotion === 'sad') {
        zone = 'low_energy';
        label = 'SAD';
        tagalogLabel = 'Malungkot';
      }

      checkInData = {
        emotion: loggedEmotion,
        label,
        tagalogLabel,
        zone,
      };
    }

    // Attach evaluation for this day if available
    let evaluationData: SchoolWeekDayEmotion['evaluation'] = null;
    const dayScores = evalByDate.get(fullDateStr);
    if (dayScores && dayScores.length > 0) {
      const avgScore = dayScores.reduce((a, b) => a + b, 0) / dayScores.length;
      evaluationData = {
        score: Number(avgScore.toFixed(1)),
        percentage: Math.round((avgScore / 4) * 100),
      };
    }

    schoolWeekDays.push({
      dayName: dayNames[i],
      fullDateStr,
      monthDayStr,
      isToday,
      isFuture,
      checkIn: checkInData,
      evaluation: evaluationData,
    });
  }

  const pastOrTodayWeekDays = schoolWeekDays.filter((d) => !d.isFuture);
  const weekLoggedCount = pastOrTodayWeekDays.filter((d) => !!d.checkIn).length;
  const weekMissedLogs = Math.max(0, pastOrTodayWeekDays.length - weekLoggedCount);

  return { schoolWeekDays, weekLoggedCount, weekMissedLogs };
}

/**
 * Calculates ASD emotional recognition & regulation metrics for a student
 */
export function calculateStudentEmotionRegulationAnalytics(
  checkIns: { student_id: string; emotion: string; check_in_date: string }[],
  evaluations: SessionEvaluation[] = [],
  studentName: string = 'Learner',
  weekOffset: number = 0
): EmotionRegulationAnalytics {
  const firstName = studentName.trim().split(' ')[0] || 'Learner';

  // 1. Generate 5-Day School Week (Mon-Fri) for the target week (with weekOffset)
  const { schoolWeekDays, weekLoggedCount, weekMissedLogs } = generateSchoolWeekDays(checkIns, weekOffset, evaluations);

  // 2. Correlate with Evaluations on those days
  const evalScoreByDate: Record<string, number[]> = {};
  evaluations.forEach((ev) => {
    const score = calculateRubricScore(ev.rubric_evaluation);
    if (score !== null && ev.created_at) {
      const d = new Date(ev.created_at).toISOString().split('T')[0];
      if (!evalScoreByDate[d]) evalScoreByDate[d] = [];
      evalScoreByDate[d].push(score);
    }
  });

  // 3. Compute Zone Distribution & Performance Scores across provided check-ins
  const totalCheckIns = checkIns.length;
  let optimalCount = 0;
  let heightenedCount = 0;
  let lowEnergyCount = 0;
  const emotionFrequency: Record<string, number> = {};

  const optimalScores: number[] = [];
  const heightenedScores: number[] = [];
  const lowEnergyScores: number[] = [];

  checkIns.forEach((c) => {
    const e = c.emotion.toLowerCase();
    emotionFrequency[e] = (emotionFrequency[e] || 0) + 1;

    const dayScores = evalScoreByDate[c.check_in_date];
    const dayAvg = dayScores && dayScores.length > 0 ? dayScores.reduce((a, b) => a + b, 0) / dayScores.length : null;

    if (e === 'happy' || e === 'calm') {
      optimalCount++;
      if (dayAvg !== null) optimalScores.push(dayAvg);
    } else if (e === 'excited' || e === 'nervous') {
      heightenedCount++;
      if (dayAvg !== null) heightenedScores.push(dayAvg);
    } else if (e === 'tired' || e === 'sad') {
      lowEnergyCount++;
      if (dayAvg !== null) lowEnergyScores.push(dayAvg);
    }
  });

  const optimalAvgScore =
    optimalScores.length > 0 ? Number((optimalScores.reduce((a, b) => a + b, 0) / optimalScores.length).toFixed(1)) : null;
  const heightenedAvgScore =
    heightenedScores.length > 0 ? Number((heightenedScores.reduce((a, b) => a + b, 0) / heightenedScores.length).toFixed(1)) : null;
  const lowEnergyAvgScore =
    lowEnergyScores.length > 0 ? Number((lowEnergyScores.reduce((a, b) => a + b, 0) / lowEnergyScores.length).toFixed(1)) : null;

  const zoneDistribution: ZoneDistributionStat[] = [
    {
      zoneKey: 'optimal',
      title: 'Optimal Learning',
      tagline: 'Calm / Happy • Ready for instruction',
      color: '#179D33',
      bgColor: '#F0FDF4',
      borderColor: '#CBFAC4',
      trackBg: '#E8FDE4',
      count: optimalCount,
      percentage: totalCheckIns > 0 ? Math.round((optimalCount / totalCheckIns) * 100) : 0,
      averageScore: optimalAvgScore,
      evaluatedSessionsCount: optimalScores.length,
    },
    {
      zoneKey: 'heightened',
      title: 'Heightened State',
      tagline: 'Excited / Nervous • High energy or alert',
      color: '#FF8870',
      bgColor: '#FFF7ED',
      borderColor: '#FFDBD4',
      trackBg: '#FFEFEA',
      count: heightenedCount,
      percentage: totalCheckIns > 0 ? Math.round((heightenedCount / totalCheckIns) * 100) : 0,
      averageScore: heightenedAvgScore,
      evaluatedSessionsCount: heightenedScores.length,
    },
    {
      zoneKey: 'low_energy',
      title: 'Low Energy',
      tagline: 'Tired / Sad • Needs rest or sensory break',
      color: '#62A9E6',
      bgColor: '#F0F9FF',
      borderColor: '#BBE8FB',
      trackBg: '#E0F2FE',
      count: lowEnergyCount,
      percentage: totalCheckIns > 0 ? Math.round((lowEnergyCount / totalCheckIns) * 100) : 0,
      averageScore: lowEnergyAvgScore,
      evaluatedSessionsCount: lowEnergyScores.length,
    },
  ];

  let dominantZone: 'optimal' | 'heightened' | 'low_energy' | null = null;
  if (totalCheckIns > 0) {
    if (optimalCount >= heightenedCount && optimalCount >= lowEnergyCount) {
      dominantZone = 'optimal';
    } else if (heightenedCount >= lowEnergyCount) {
      dominantZone = 'heightened';
    } else {
      dominantZone = 'low_energy';
    }
  }

  let dominantEmotion: string | null = null;
  let maxFreq = 0;
  Object.entries(emotionFrequency).forEach(([e, count]) => {
    if (count > maxFreq) {
      maxFreq = count;
      dominantEmotion = e;
    }
  });

  const optimalZoneCorrelationScore = optimalAvgScore;
  const otherScores = [...heightenedScores, ...lowEnergyScores];
  const otherZoneCorrelationScore =
    otherScores.length > 0 ? Number((otherScores.reduce((a, b) => a + b, 0) / otherScores.length).toFixed(1)) : null;

  // 4. Generate Pedagogical Summary & Tips
  let insightSummary = `${firstName} has logged ${totalCheckIns} classroom check-in${totalCheckIns === 1 ? '' : 's'}.`;
  if (totalCheckIns === 0) {
    insightSummary = `No emotional check-ins logged yet for this period. Encourage ${firstName} to complete the check-in upon tablet launch.`;
  } else if (dominantZone === 'optimal') {
    insightSummary = `${firstName} consistently arrives in the Optimal Learning Zone (${zoneDistribution[0].percentage}% of sessions), showing strong emotional readiness for structured tasks.`;
  } else if (dominantZone === 'heightened') {
    insightSummary = `${firstName} frequently logs heightened energy or nervousness (${zoneDistribution[1].percentage}% of sessions). Sensory grounding helps transition into focus.`;
  } else if (dominantZone === 'low_energy') {
    insightSummary = `${firstName} has logged low energy or fatigue in ${zoneDistribution[2].percentage}% of sessions. Consider shorter task intervals with frequent breaks.`;
  }

  let pedagogicalTip = `Encourage daily self-reporting to foster emotional recognition and autonomous communication.`;
  if (dominantEmotion === 'nervous') {
    pedagogicalTip = `When ${firstName} checks in as Nervous, begin the class with low-stress warm-ups like Bubble Pop before structured tracing.`;
  } else if (dominantEmotion === 'tired') {
    pedagogicalTip = `When ${firstName} checks in as Tired, reduce task duration or increase positive verbal prompts to maintain motivation.`;
  } else if (dominantEmotion === 'excited') {
    pedagogicalTip = `Channel high energy into rhythmic or sorting activities to help ${firstName} settle into task focus.`;
  } else if (optimalZoneCorrelationScore !== null && optimalZoneCorrelationScore >= 3.2) {
    pedagogicalTip = `${firstName} demonstrates highest task mastery (${optimalZoneCorrelationScore.toFixed(1)} / 4.0) during calm and happy states. Maintain predictable session routines.`;
  }

  return {
    totalCheckIns,
    schoolWeekDays,
    weekLoggedCount,
    weekMissedLogs,
    zoneDistribution,
    dominantZone,
    dominantEmotion,
    optimalZoneCorrelationScore,
    otherZoneCorrelationScore,
    insightSummary,
    pedagogicalTip,
  };
}

