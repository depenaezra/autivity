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

export const SPED_DOMAIN_EXPLAINERS_EN: DomainExplainer[] = [
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

export const SPED_DOMAIN_EXPLAINERS_TL: DomainExplainer[] = [
  {
    domainKey: 'sensory_regulation',
    name: 'Sensory Regulation',
    color: '#62A9E6',
    shortDefinition: 'Ang kakayahan ng bata na manatiling kalmado, nakatutok, at kumportable kapag nakararanas ng liwanag, tunog, o tekstura.',
    fullExplanation: 'Ang Sensory Regulation ay tumutukoy sa kakayahan ng iyong anak na manatiling kalmado at organisado habang nakararanas ng iba’t ibang pandama sa kanyang kapaligiran.',
    whatToLookFor: 'Pagmasdan kung gaano kakomportableng humahawak ang bata sa mga kagamitan nang hindi nababalisa o nawawalan ng pokus.',
  },
  {
    domainKey: 'cognitive_sorting',
    name: 'Cognitive & Sorting',
    color: '#FFAE02',
    shortDefinition: 'Sinusukat ang pagkilala sa mga pattern, pagtutugma ng kulay/hugis, memorya, at simpleng lohika sa paglutas ng gawain.',
    fullExplanation: 'Sinusukat ng Cognitive & Sorting ang pagkilala sa pattern, pagtutugma ng hugis/kulay, pag-alala, at simpleng lohika sa paglutas ng mga gawain.',
    whatToLookFor: 'Pansinin kung gaano kabilis magbukod ng mga magkakatugmang hugis, kulay, o bagay ang iyong anak habang nag-aaral.',
  },
  {
    domainKey: 'motor_skills',
    name: 'Motor Skills',
    color: '#179D33',
    shortDefinition: 'Sinusuri ang kontrol sa daliri, koordinasyon ng mata at kamay, kawastuhan sa pag-drag sa screen, at pagsusulat o pagguhit.',
    fullExplanation: 'Sinusuri ng Motor Skills ang kontrol sa mga daliri, koordinasyon ng kamay at mata, at kawastuhan sa paggalaw habang gumagamit ng screen o papel.',
    whatToLookFor: 'Pagmasdan ang matatag na pagdampi ng daliri, maayos na pagguhit ng linya, at tamang paglalagay ng bagay sa screen o papel.',
  },
  {
    domainKey: 'communication_aac',
    name: 'Communication & AAC',
    color: '#FF8870',
    shortDefinition: 'Sinusubaybayan kung paano nagpapahayag ng nais ang bata gamit ang salita, larawan, o mga pantulong na communication app (AAC).',
    fullExplanation: 'Sinusubaybayan ng Communication & AAC kung paano nagpapahayag ng nais ang iyong anak gamit ang boses, mga larawan, o communication app.',
    whatToLookFor: 'Pansinin kung tama ang napipiling communication icons o kung tumutugon ang bata sa mga bilin habang nag-aaral.',
  },
  {
    domainKey: 'social_turn_taking',
    name: 'Social & Turn-Taking',
    color: '#A855F7',
    shortDefinition: 'Sinusukat ang pakikipagtulungan, pagiging pasensyoso sa paghihintay, at maayos na pakikitungo sa mga guro at kaklase.',
    fullExplanation: 'Sinusukat ng Social & Turn-Taking ang pakikipagtulungan, pasensya sa paghihintay ng sariling pagkakataon, at maayos na pakikitungo sa iba.',
    whatToLookFor: 'Pagmasdan ang kahandaang maghintay ng pagkakataon, sumunod sa sunod-sunod na bilin, at manatiling masaya sa pakikipag-ugnayan.',
  },
];

export const SPED_DOMAIN_EXPLAINERS = SPED_DOMAIN_EXPLAINERS_EN;

export function getSpedDomainExplainers(language: 'en' | 'tl' = 'en'): DomainExplainer[] {
  return language === 'tl' ? SPED_DOMAIN_EXPLAINERS_TL : SPED_DOMAIN_EXPLAINERS_EN;
}

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
 * Generates plain-English or Tagalog narrative summary highlights based on evaluated sessions
 */
export function generateNarrativeHighlights(
  evaluatedSessions: ParentSessionRecord[],
  masterDomains: { name: string; subSkills: string[] }[] = [],
  activityType: ActivityTypeFilter = 'all',
  language: 'en' | 'tl' = 'en'
): NarrativeHighlight[] {
  const highlights: NarrativeHighlight[] = [];
  const isTl = language === 'tl';

  const activityNoun = isTl
    ? activityType === 'app' ? 'mga aktibidad sa app' : activityType === 'classroom' ? 'mga aktibidad sa silid-aralan' : 'mga aktibidad'
    : activityType === 'app' ? 'app activities' : activityType === 'classroom' ? 'classroom activities' : 'learning activities';

  const sessionTitle = isTl
    ? activityType === 'app' ? 'Mga Sesyon sa App' : activityType === 'classroom' ? 'Mga Sesyon sa Silid-aralan' : 'Mga Sesyon'
    : activityType === 'app' ? 'App Sessions' : activityType === 'classroom' ? 'Classroom Sessions' : 'Sessions';

  if (evaluatedSessions.length === 0) {
    return [
      {
        id: 'no_data',
        type: 'growth',
        title: isTl ? 'Naghihintay ng mga Nasuring Sesyon' : 'Awaiting Evaluated Sessions',
        description: isTl
          ? `Awtomatikong mag-a-update ang buod ng pag-unlad kapag naitala na ng guro ang mga pagsusuri sa ${activityNoun}.`
          : `Narrative progress highlights will update automatically once ${activityNoun} evaluations are recorded by the teacher.`,
        badgeLabel: isTl ? 'KATAYUAN' : 'STATUS',
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
      title: isTl ? `Mataas na Kahusayan: ${top.name}` : `Strong Momentum: ${top.name}`,
      description: isTl
        ? `Nagpapakita ang iyong anak ng matatag na kahusayan sa ${top.name} na may average na ${top.avg}% sa ${activityNoun}.`
        : `Your child is demonstrating solid proficiency in ${top.name} with an average evaluated score of ${top.avg}% in ${activityNoun}.`,
      badgeLabel: isTl ? 'KALAKASAN' : 'TOP STRENGTH',
    });
  }

  // Focus Area Highlight
  if (domainAverages.length > 1) {
    const lowest = domainAverages[domainAverages.length - 1];
    highlights.push({
      id: 'focus_highlight',
      type: 'focus',
      title: isTl ? `Dapat Pagtuunan: ${lowest.name}` : `Active Focus: ${lowest.name}`,
      description: isTl
        ? `Kasalukuyang binibigyan ng nakatutok na gabay ang ${lowest.name} sa ${activityNoun} na may average na ${lowest.avg}%.`
        : `${lowest.name} is currently receiving focused guidance in ${activityNoun} with an average of ${lowest.avg}%.`,
      badgeLabel: isTl ? 'DAPAT PAGTUUNAN' : 'FOCUS AREA',
    });
  }

  // Consistency Highlight
  const totalCount = evaluatedSessions.length;
  highlights.push({
    id: 'consistency_highlight',
    type: 'consistency',
    title: isTl ? `${sessionTitle}: ${totalCount} Nasuri` : `${sessionTitle}: ${totalCount} Evaluated`,
    description: isTl
      ? `Napatunayan ng mga guro ang ${totalCount} pagsusuri sa sesyon para sa panahong ito.`
      : `Teachers have validated ${totalCount} session evaluation${totalCount > 1 ? 's' : ''} for this timeframe.`,
    badgeLabel: isTl ? 'KONSISTENSI' : 'CONSISTENCY',
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
  language?: 'en' | 'tl';
}): ChartTakeaway {
  const { trendDifference, averageScore, totalPoints, activityType = 'all', language = 'en' } = params;
  const isTl = language === 'tl';

  const activityNoun = isTl
    ? activityType === 'app' ? 'aktibidad sa app' : activityType === 'classroom' ? 'aktibidad sa silid-aralan' : 'aktibidad'
    : activityType === 'app' ? 'app activities' : activityType === 'classroom' ? 'classroom activities' : 'learning activities';

  if (totalPoints < 2) {
    return {
      badgeLabel: isTl ? 'NAGHIHINTAY NG DATOS' : 'AWAITING DATA',
      badgeType: 'neutral',
      title: isTl ? 'Bumubuo ng Paunang Datos (Baseline)' : 'Building Baseline Trend',
      description: isTl
        ? `Kailangan ng hindi bababa sa 2 nasuring ${activityNoun} upang makita ang tunay na takbo ng pag-unlad.`
        : `Progress trends require at least 2 evaluated ${activityNoun} to establish an authentic performance baseline.`,
      recommendation: isTl
        ? 'Bumalik muli kapag nasuri na ng guro ang mga susunod na sesyon.'
        : 'Check back after upcoming sessions are validated by the educator.',
    };
  }

  // Criterion Mastery achieved (≥ 80%)
  if (averageScore >= ANALYTICS_THRESHOLDS.MASTERY_GOAL) {
    return {
      badgeLabel: isTl ? 'NAABOT ANG HANGARIN' : 'GOAL REACHED',
      badgeType: 'growth',
      title: isTl ? 'Nakamit ang Kasanayan' : 'Skills Mastered',
      description: isTl
        ? `Napakagaling ng iyong anak! Kaya na niyang tapusin ang mga ${activityNoun} nang mag-isa at kumportable.`
        : `Your child is doing amazing! They can now complete these ${activityNoun} comfortably and on their own.`,
      recommendation: isTl
        ? 'Ipagpatuloy ang pagsasanay upang mapanatili ang kumpiyansa sa pang-araw-araw na gawain.'
        : 'Encourage continued practice to reinforce confidence across everyday routines.',
    };
  }

  // Meaningful growth (≥ +5%)
  if (trendDifference !== null && trendDifference >= ANALYTICS_THRESHOLDS.TREND_SIGNIFICANT_DELTA) {
    return {
      badgeLabel: isTl ? 'MAGANDANG PAG-UNLAD' : 'GREAT PROGRESS',
      badgeType: 'growth',
      title: isTl ? 'Mabilis na Umuunlad' : 'Making Great Progress',
      description: isTl
        ? `Kapansin-pansin ang pagbuti ng iyong anak sa pagsunod sa mga hakbang at pananatiling nakatutok habang nasa ${activityNoun}.`
        : `Your child is showing noticeable improvements in following steps and staying engaged during ${activityNoun}.`,
      recommendation: isTl
        ? 'Ipagdiwang ang tagumpay na ito! Ang positibong papuri ay nagpapalakas ng sigla sa pag-aaral.'
        : 'Celebrate this momentum! Positive encouragement helps build ongoing learning stamina.',
    };
  }

  // Meaningful dip (≤ -5%)
  if (trendDifference !== null && trendDifference <= -ANALYTICS_THRESHOLDS.TREND_SIGNIFICANT_DELTA) {
    return {
      badgeLabel: isTl ? 'KAILANGAN NG PAGSASANAY' : 'NEEDS PRACTICE',
      badgeType: 'focus',
      title: isTl ? 'Nagsasanay sa Bagong Hamon' : 'Learning New Challenges',
      description: isTl
        ? `Bahagyang bumaba ang marka dahil may mga bagong hamon sa ${activityNoun}. Nagbibigay ang guro ng karagdagang gabay sa bawat hakbang.`
        : `Scores dipped slightly as ${activityNoun} introduced new challenges. Teachers are providing extra step-by-step guidance.`,
      recommendation: isTl
        ? 'Ang marahang pagsasanay sa bahay ay makatutulong upang maging kumportable ang iyong anak sa mga bagong hakbang.'
        : 'Gentle, low-pressure practice at home helps your child become comfortable with new steps.',
    };
  }

  // Steady pace (-4.9% to +4.9%)
  return {
    badgeLabel: isTl ? 'MATATAG NA TAKBO' : 'STEADY PACE',
    badgeType: 'steady',
    title: isTl ? 'Tuloy-tuloy na Pagsasanay' : 'Consistent Practice',
    description: isTl
      ? `Napananatili ng iyong anak ang maayos at maaasahang routine habang nasa ${activityNoun}.`
      : `Your child is maintaining a steady and reliable learning routine during ${activityNoun}.`,
    recommendation: isTl
      ? 'Ang pananatili sa maayos na routine ay nagpapatibay ng kumpiyansa bago sumubok ng mga bagong aralin.'
      : 'Maintaining this stable routine helps build long-term confidence before introducing new steps.',
  };
}

/**
 * Generates dynamic domain insights based on RTI skill tiers and balance
 */
export function getSkillDomainTakeaways(
  domainScores: { label: string; value: number }[],
  activityType: ActivityTypeFilter = 'all',
  language: 'en' | 'tl' = 'en'
): ChartTakeaway[] {
  const takeaways: ChartTakeaway[] = [];
  const evaluated = domainScores.filter((d) => d.value > 0);
  const isTl = language === 'tl';

  const taskNoun = isTl
    ? activityType === 'app' ? 'mga aktibidad sa app' : activityType === 'classroom' ? 'mga gawain sa klase' : 'mga aktibidad'
    : activityType === 'app' ? 'app activities' : activityType === 'classroom' ? 'classroom tasks' : 'activities';

  if (evaluated.length === 0) {
    return [
      {
        badgeLabel: isTl ? 'NAGHIHINTAY NG DATOS' : 'AWAITING DATA',
        badgeType: 'neutral',
        title: isTl ? 'Kasalukuyang Sinusuri ang mga Kasanayan' : 'Domain Evaluations In Progress',
        description: isTl
          ? `Magkakaroon ng marka ang bawat kasanayan kapag naitala na ang mga pagsusuri sa ${taskNoun}.`
          : `Domain-specific competency scores will populate once rubric evaluations in ${taskNoun} are recorded.`,
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
      badgeLabel: isTl ? (isTier1 ? 'PINAKAMAHUSAY' : 'NANGUNGUNANG KASANAYAN') : (isTier1 ? 'TOP STRENGTH' : 'LEADING AREA'),
      badgeType: 'growth',
      title: `${top.label} (${top.value}%)`,
      description: isTl
        ? isTier1
          ? `Nagpapakita ng mataas na kalayaan at sariling disiplina sa ${top.label} nang halos walang tulong mula sa guro.`
          : `Kasalukuyang nagpapakita ng pinakamataas na sigla at kaginhawaan sa ${top.label}.`
        : isTier1
        ? `Demonstrates high independence and self-regulation in ${top.label} ${taskNoun} with minimal teacher prompting.`
        : `Currently shows the highest relative engagement and comfort in ${top.label} ${taskNoun}.`,
      recommendation: isTl
        ? `Gamitin ang paboritong kasanayan na ito (${top.label}) upang magsimula nang may kumpiyansa sa pag-aaral.`
        : 'Use this preferred skill area to build confidence at the start of learning routines.',
    });
  }

  // Balanced Profile Check (diff ≤ 10%)
  if (sorted.length >= 3 && top.value - lowest.value <= ANALYTICS_THRESHOLDS.BALANCED_DOMAIN_DIFF_MAX) {
    const avg = Math.round(sorted.reduce((sum, d) => sum + d.value, 0) / sorted.length);
    takeaways.push({
      badgeLabel: isTl ? 'BALANSENG PAG-UNLAD' : 'BALANCED GROWTH',
      badgeType: 'steady',
      title: isTl ? 'Balanse at Pantay na Pag-unlad' : 'Well-Rounded Skill Development',
      description: isTl
        ? `Ang mga marka sa lahat ng kasanayan ay magkakalapit (may average na ${avg}%), na nagpapakita ng pantay at balanseng pag-unlad.`
        : `Scores across all evaluated domains are within 10% of each other (averaging ${avg}%), indicating harmonious development in ${taskNoun}.`,
    });
  } else if (lowest && (lowest.value < ANALYTICS_THRESHOLDS.TIER3_FOCUS_MAX || sorted.length > 1)) {
    // Tier 3 Active Focus (< 60% or lowest)
    takeaways.push({
      badgeLabel: isTl ? 'DAPAT PAGTUUNAN' : 'ACTIVE FOCUS',
      badgeType: 'focus',
      title: `${lowest.label} (${lowest.value}%)`,
      description: isTl
        ? lowest.value < ANALYTICS_THRESHOLDS.TIER3_FOCUS_MAX
          ? `Ang ${lowest.label} ay kasalukuyang binibigyan ng nakatutok na gabay gamit ang mga larawan at sunod-sunod na paalala.`
          : `Nagbibigay ang mga guro ng nakatutok na pagsasanay sa ${lowest.label} upang mapantay ito sa iba pang kasanayan.`
        : lowest.value < ANALYTICS_THRESHOLDS.TIER3_FOCUS_MAX
        ? `${lowest.label} is currently receiving focused guidance with visual cues and step-by-step prompts in ${taskNoun}.`
        : `Teachers are providing targeted practice in ${lowest.label} to bring it in balance with other domains.`,
      recommendation: isTl
        ? 'Subukan ang mga simpleng laro ng pagtutugma o paggaya sa bahay upang mapalakas ang natututuhan sa klase.'
        : 'Try simple, low-pressure matching or verbal imitation games at home to reinforce classroom work.',
    });
  }

  return takeaways;
}

/**
 * Generates dynamic activity performance interpretation
 */
export function getActivityPerformanceTakeaway(
  activityData: { label: string; value: number }[],
  activityType: ActivityTypeFilter = 'all',
  language: 'en' | 'tl' = 'en'
): ChartTakeaway {
  const isTl = language === 'tl';
  const activityNoun = isTl
    ? activityType === 'app' ? 'mga aktibidad sa app' : activityType === 'classroom' ? 'mga aktibidad sa silid-aralan' : 'mga aktibidad'
    : activityType === 'app' ? 'app activities' : activityType === 'classroom' ? 'classroom activities' : 'activities';

  if (activityData.length === 0) {
    return {
      badgeLabel: isTl ? 'WALA PANG DATOS' : 'NO DATA YET',
      badgeType: 'neutral',
      title: isTl ? 'Nag-a-update ang Marka ng Aktibidad' : 'Activity Scores Updating',
      description: isTl
        ? `Magkakaroon ng marka ang bawat kategorya kapag nakatapos ang iyong anak ng mga ${activityNoun}.`
        : `Scores for each category will appear as your child completes ${activityNoun}.`,
    };
  }

  const top = activityData[0];
  const lowest = activityData.length > 1 ? activityData[activityData.length - 1] : null;

  if (top && top.value >= ANALYTICS_THRESHOLDS.TIER1_STRENGTH_MIN) {
    return {
      badgeLabel: isTl ? 'PABORITONG AKTIBIDAD' : 'TOP ACTIVITY',
      badgeType: 'growth',
      title: top.label,
      description: isTl
        ? `Napakagaling ng iyong anak sa ${top.label}!${
            lowest && lowest.value < ANALYTICS_THRESHOLDS.TIER3_FOCUS_MAX
              ? ` Nabibigyan din ng karagdagang pagsasanay ang ${lowest.label} sa pamamagitan ng gabay ng guro.`
              : ''
          }`
        : `Your child is doing great with ${top.label} ${activityNoun}!${
            lowest && lowest.value < ANALYTICS_THRESHOLDS.TIER3_FOCUS_MAX
              ? ` They are getting extra practice with ${lowest.label} in ${activityType === 'app' ? 'app games' : 'guided practice'}.`
              : ''
          }`,
      recommendation: isTl
        ? `Ang pagsisimula sa mga paboritong aktibidad (tulad ng ${top.label}) ay nagbibigay ng kumpiyansa bago sumubok ng mas mahihirap na gawain.`
        : `Starting with activities they enjoy (like ${top.label}) helps them feel confident before trying harder ones.`,
    };
  }

  return {
    badgeLabel: isTl ? 'KASALUKUYANG NAGSASANAY' : 'IN PROGRESS',
    badgeType: 'steady',
    title: top.label,
    description: isTl
      ? `Masipag na nagsasanay ang iyong anak sa ${top.label} at iba pang ${activityNoun}.`
      : `Your child is actively practicing ${top.label} and other ${activityNoun}.`,
    recommendation: isTl
      ? 'Ang pagsasagawa ng mga simpleng laro sa bahay ay nakatutulong upang mapagtibay ang itinuturo ng mga guro.'
      : 'Doing simple learning games together at home helps reinforce what they practice with teachers.',
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

