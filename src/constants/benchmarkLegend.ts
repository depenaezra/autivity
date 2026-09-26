/**
 * Universal 3-Tier Performance Benchmark System
 * Single source of truth for Teacher and Parent Analytics across AutiVity.
 */

export type PerformanceTierKey = 'mastered' | 'developing' | 'support';

export interface PerformanceTierConfig {
  key: PerformanceTierKey;
  tierNumber: 1 | 2 | 3;
  label: string;
  shortLabel: string;
  badgeLabel: string;
  parentLabel: string;
  color: string;
  accentColor: string;
  strokeColor: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
  thresholds: {
    accuracyText: string;
    mistakesText: string;
    hintsText: string;
    rubricText: string;
    accuracyMin: number;
    accuracyMax: number;
    mistakesMax: number;
    hintsMax: number;
    rubricMin: number;
  };
  teacherDescription: string;
  parentDescription: string;
  actionableGuidance: string;
}

export const UNIVERSAL_BENCHMARK_TIERS: Record<PerformanceTierKey, PerformanceTierConfig> = {
  mastered: {
    key: 'mastered',
    tierNumber: 1,
    label: 'Mastered / Target Met',
    shortLabel: 'Mastered',
    badgeLabel: 'TOP PERFORMANCE',
    parentLabel: 'Mastered',
    color: '#179D33',
    accentColor: '#179D33',
    strokeColor: '#CBFAC4',
    bgColor: '#F0FDF4',
    borderColor: '#CBFAC4',
    iconName: 'check-circle',
    thresholds: {
      accuracyText: '≥ 80% accuracy',
      mistakesText: '≤ 2.0 mistakes / session',
      hintsText: '≤ 1.0 hint / session',
      rubricText: '≥ 3.2 / 4.0 rubric average',
      accuracyMin: 80,
      accuracyMax: 100,
      mistakesMax: 2.0,
      hintsMax: 1.0,
      rubricMin: 3.2,
    },
    teacherDescription: 'The learner demonstrates task acquisition and autonomous stimulus control. Ready for skill progression and periodic maintenance probes.',
    parentDescription: 'Your child completes these activities with great accuracy and confidence, needing almost no help!',
    actionableGuidance: 'Celebrate this milestone! Introduce the next developmental step while scheduling periodic review tasks.',
  },
  developing: {
    key: 'developing',
    tierNumber: 2,
    label: 'Developing / In Progress',
    shortLabel: 'Developing',
    badgeLabel: 'NEEDS ATTENTION',
    parentLabel: 'Developing',
    color: '#FFAE02',
    accentColor: '#FFAE02',
    strokeColor: '#FFF3C4',
    bgColor: '#FFFBEB',
    borderColor: '#FFF3C4',
    iconName: 'trending-up',
    thresholds: {
      accuracyText: '65% – 79% accuracy',
      mistakesText: '2.1 – 3.5 mistakes / session',
      hintsText: '1.1 – 2.0 hints / session',
      rubricText: '2.6 – 3.1 / 4.0 rubric average',
      accuracyMin: 65,
      accuracyMax: 79.99,
      mistakesMax: 3.5,
      hintsMax: 2.0,
      rubricMin: 2.6,
    },
    teacherDescription: 'The learner understands the instructional concept but requires ongoing repetition and systematic prompt fading to achieve full independence.',
    parentDescription: 'Your child understands what to do and is making steady progress with a few helpful cues.',
    actionableGuidance: 'Continue routine practice. Gradually fade visual and verbal prompts as confidence builds.',
  },
  support: {
    key: 'support',
    tierNumber: 3,
    label: 'Needs Support / Emerging',
    shortLabel: 'Needs Support',
    badgeLabel: 'NEEDS SUPPORT',
    parentLabel: 'Needs Support',
    color: '#FF8870',
    accentColor: '#FF8870',
    strokeColor: '#FFDBD4',
    bgColor: '#FFF7ED',
    borderColor: '#FFDBD4',
    iconName: 'alert-circle',
    thresholds: {
      accuracyText: '< 65% accuracy',
      mistakesText: '> 3.5 mistakes / session',
      hintsText: '> 2.0 hints / session',
      rubricText: '< 2.6 / 4.0 rubric average',
      accuracyMin: 0,
      accuracyMax: 64.99,
      mistakesMax: Infinity,
      hintsMax: Infinity,
      rubricMin: 0,
    },
    teacherDescription: 'The learner experiences difficulty with this task level. Scaffolding, prerequisite reinforcement, or lower difficulty adjustments are recommended.',
    parentDescription: 'This activity is still challenging for your child. Gentle guidance and low-pressure practice will help build comfort.',
    actionableGuidance: 'Provide step-by-step guided assistance or review earlier prerequisite activities to rebuild confidence.',
  },
};

/**
 * Determines the benchmark tier based on mistake rate
 */
export function getMistakesTier(avgMistakes: number): PerformanceTierConfig {
  if (avgMistakes <= 2.0) return UNIVERSAL_BENCHMARK_TIERS.mastered;
  if (avgMistakes <= 3.5) return UNIVERSAL_BENCHMARK_TIERS.developing;
  return UNIVERSAL_BENCHMARK_TIERS.support;
}

/**
 * Determines the benchmark tier based on accuracy percentage (0 - 100)
 */
export function getAccuracyTier(accuracyPercent: number): PerformanceTierConfig {
  if (accuracyPercent >= 80) return UNIVERSAL_BENCHMARK_TIERS.mastered;
  if (accuracyPercent >= 65) return UNIVERSAL_BENCHMARK_TIERS.developing;
  return UNIVERSAL_BENCHMARK_TIERS.support;
}

/**
 * Determines the benchmark tier based on 1.0 - 4.0 rubric score
 */
export function getRubricTier(rubricScore: number): PerformanceTierConfig {
  if (rubricScore >= 3.2) return UNIVERSAL_BENCHMARK_TIERS.mastered;
  if (rubricScore >= 2.6) return UNIVERSAL_BENCHMARK_TIERS.developing;
  return UNIVERSAL_BENCHMARK_TIERS.support;
}

/**
 * Determines the benchmark tier based on hint rate
 */
export function getHintsTier(avgHints: number): PerformanceTierConfig {
  if (avgHints <= 1.0) return UNIVERSAL_BENCHMARK_TIERS.mastered;
  if (avgHints <= 2.0) return UNIVERSAL_BENCHMARK_TIERS.developing;
  return UNIVERSAL_BENCHMARK_TIERS.support;
}
