import { TurnTakingCategory, TurnTakingLevel } from '../types';

export type CategoryMeta = {
  id: TurnTakingCategory;
  title: string;
  subtitle: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Advanced';
  badgeColor: string;
  badgeBg: string;
  description: string;
};

export const CATEGORY_METADATA: CategoryMeta[] = [
  {
    id: 'lines',
    title: 'Lines',
    subtitle: 'Basic line tracing',
    icon: 'git-commit-outline',
    difficulty: 'Easy',
    badgeColor: '#16A34A',
    badgeBg: '#DCFCE7',
    description: 'Practice fundamental straight, curved, and zigzag line paths.',
  },
  {
    id: 'numbers',
    title: 'Numbers',
    subtitle: 'Digit tracing (0-9)',
    icon: 'calculator-outline',
    difficulty: 'Medium',
    badgeColor: '#2563EB',
    badgeBg: '#DBEAFE',
    description: 'Learn number writing and numeral formation.',
  },
  {
    id: 'letters',
    title: 'Letters',
    subtitle: 'Alphabet tracing (A-Z)',
    icon: 'text-outline',
    difficulty: 'Medium',
    badgeColor: '#D97706',
    badgeBg: '#FEF3C7',
    description: 'Master uppercase letter shapes and stroke sequences.',
  },
  {
    id: 'shapes',
    title: 'Shapes',
    subtitle: 'Geometric shapes',
    icon: 'shapes-outline',
    difficulty: 'Medium',
    badgeColor: '#9333EA',
    badgeBg: '#F3E8FF',
    description: 'Trace geometric figures like circles, squares, and stars.',
  },
  {
    id: 'advanced-lines',
    title: 'Advanced Lines',
    subtitle: 'Complex paths & loops',
    icon: 'sparkles-outline',
    difficulty: 'Advanced',
    badgeColor: '#DC2626',
    badgeBg: '#FEE2E2',
    description: 'Challenge fine motor control with spirals, loops, and maze curves.',
  },
];

/* =========================================================
   CATEGORY 1: LINES (BASIC)
========================================================= */

const BASIC_LINES: TurnTakingLevel[] = [
  {
    id: 101,
    name: 'Straight Line',
    difficulty: 1,
    category: 'lines',
    label: 'Vertical Line',
    pathPoints: [
      { x: 165, y: 65 },
      { x: 165, y: 110 },
      { x: 165, y: 160 },
      { x: 165, y: 210 },
      { x: 165, y: 260 },
      { x: 165, y: 310 },
      { x: 165, y: 360 },
      { x: 165, y: 410 },
      { x: 165, y: 440 },
    ],
  },
  {
    id: 102,
    name: 'Smooth Curve',
    difficulty: 1,
    category: 'lines',
    label: 'Curved Path',
    pathPoints: [
      { x: 165, y: 65 },
      { x: 125, y: 95 },
      { x: 105, y: 135 },
      { x: 105, y: 180 },
      { x: 125, y: 220 },
      { x: 165, y: 255 },
      { x: 205, y: 290 },
      { x: 225, y: 330 },
      { x: 225, y: 370 },
      { x: 205, y: 410 },
      { x: 165, y: 440 },
    ],
  },
  {
    id: 103,
    name: 'Zigzag Line',
    difficulty: 2,
    category: 'lines',
    label: 'Zigzag',
    pathPoints: [
      { x: 165, y: 65 },
      { x: 105, y: 125 },
      { x: 225, y: 185 },
      { x: 105, y: 245 },
      { x: 225, y: 305 },
      { x: 105, y: 365 },
      { x: 165, y: 435 },
    ],
  },
  {
    id: 104,
    name: 'Wave Line',
    difficulty: 2,
    category: 'lines',
    label: 'Gentle Wave',
    pathPoints: [
      { x: 165, y: 65 },
      { x: 225, y: 115 },
      { x: 245, y: 165 },
      { x: 205, y: 215 },
      { x: 125, y: 265 },
      { x: 85, y: 315 },
      { x: 125, y: 365 },
      { x: 205, y: 415 },
      { x: 165, y: 445 },
    ],
  },
  {
    id: 105,
    name: 'Diagonal Slant',
    difficulty: 1,
    category: 'lines',
    label: 'Slanted Line',
    pathPoints: [
      { x: 85, y: 75 },
      { x: 115, y: 125 },
      { x: 145, y: 175 },
      { x: 175, y: 225 },
      { x: 205, y: 275 },
      { x: 235, y: 325 },
      { x: 265, y: 375 },
      { x: 285, y: 425 },
    ],
  },
];

/* =========================================================
   CATEGORY 2: ADVANCED LINES (HARDER)
========================================================= */

const ADVANCED_LINES: TurnTakingLevel[] = [
  {
    id: 201,
    name: 'Double Loop',
    difficulty: 3,
    category: 'advanced-lines',
    label: 'Loop-de-Loop',
    pathPoints: [
      { x: 165, y: 65 },
      { x: 225, y: 105 },
      { x: 265, y: 145 },
      { x: 235, y: 185 },
      { x: 165, y: 165 },
      { x: 115, y: 195 },
      { x: 125, y: 245 },
      { x: 185, y: 285 },
      { x: 245, y: 325 },
      { x: 265, y: 375 },
      { x: 215, y: 415 },
      { x: 165, y: 445 },
    ],
  },
  {
    id: 202,
    name: 'Multi-Zigzag Peak',
    difficulty: 3,
    category: 'advanced-lines',
    label: 'Sharp Multi-Peaks',
    pathPoints: [
      { x: 165, y: 65 },
      { x: 85, y: 115 },
      { x: 245, y: 165 },
      { x: 85, y: 215 },
      { x: 245, y: 265 },
      { x: 85, y: 315 },
      { x: 245, y: 365 },
      { x: 165, y: 440 },
    ],
  },
  {
    id: 203,
    name: 'Spiral Arc',
    difficulty: 4,
    category: 'advanced-lines',
    label: 'Swirl Path',
    pathPoints: [
      { x: 165, y: 65 },
      { x: 245, y: 95 },
      { x: 275, y: 165 },
      { x: 245, y: 245 },
      { x: 165, y: 275 },
      { x: 105, y: 245 },
      { x: 85, y: 175 },
      { x: 125, y: 125 },
      { x: 195, y: 135 },
      { x: 215, y: 185 },
      { x: 185, y: 225 },
      { x: 165, y: 435 },
    ],
  },
  {
    id: 204,
    name: 'S-Curve Maze',
    difficulty: 3,
    category: 'advanced-lines',
    label: 'Serpentine Curve',
    pathPoints: [
      { x: 105, y: 65 },
      { x: 245, y: 95 },
      { x: 265, y: 155 },
      { x: 185, y: 205 },
      { x: 85, y: 245 },
      { x: 65, y: 305 },
      { x: 145, y: 365 },
      { x: 265, y: 395 },
      { x: 225, y: 445 },
    ],
  },
  {
    id: 205,
    name: 'Triple Wave Surge',
    difficulty: 4,
    category: 'advanced-lines',
    label: 'Ocean Wave Surge',
    pathPoints: [
      { x: 165, y: 65 },
      { x: 235, y: 95 },
      { x: 245, y: 145 },
      { x: 165, y: 175 },
      { x: 85, y: 205 },
      { x: 95, y: 265 },
      { x: 185, y: 295 },
      { x: 245, y: 345 },
      { x: 215, y: 395 },
      { x: 165, y: 445 },
    ],
  },
];

/* =========================================================
   CATEGORY 3: NUMBERS (0-9)
========================================================= */

const NUMBER_LEVELS: TurnTakingLevel[] = [
  {
    id: 300,
    name: 'Number 0',
    difficulty: 2,
    category: 'numbers',
    label: 'Digit 0',
    pathPoints: [
      { x: 165, y: 80 },
      { x: 235, y: 110 },
      { x: 255, y: 240 },
      { x: 235, y: 370 },
      { x: 165, y: 400 },
      { x: 95, y: 370 },
      { x: 75, y: 240 },
      { x: 95, y: 110 },
      { x: 165, y: 80 },
    ],
  },
  {
    id: 301,
    name: 'Number 1',
    difficulty: 1,
    category: 'numbers',
    label: 'Digit 1',
    pathPoints: [
      { x: 115, y: 130 },
      { x: 165, y: 80 },
      { x: 165, y: 180 },
      { x: 165, y: 280 },
      { x: 165, y: 400 },
    ],
  },
  {
    id: 302,
    name: 'Number 2',
    difficulty: 2,
    category: 'numbers',
    label: 'Digit 2',
    pathPoints: [
      { x: 105, y: 140 },
      { x: 165, y: 80 },
      { x: 235, y: 130 },
      { x: 215, y: 220 },
      { x: 145, y: 310 },
      { x: 95, y: 400 },
      { x: 165, y: 400 },
      { x: 245, y: 400 },
    ],
  },
  {
    id: 303,
    name: 'Number 3',
    difficulty: 2,
    category: 'numbers',
    label: 'Digit 3',
    pathPoints: [
      { x: 105, y: 100 },
      { x: 185, y: 80 },
      { x: 235, y: 130 },
      { x: 165, y: 220 },
      { x: 245, y: 300 },
      { x: 205, y: 390 },
      { x: 105, y: 370 },
    ],
  },
  {
    id: 304,
    name: 'Number 4',
    difficulty: 2,
    category: 'numbers',
    label: 'Digit 4',
    pathPoints: [
      { x: 215, y: 80 },
      { x: 105, y: 250 },
      { x: 195, y: 250 },
      { x: 265, y: 250 },
      { x: 215, y: 180 },
      { x: 215, y: 400 },
    ],
  },
  {
    id: 305,
    name: 'Number 5',
    difficulty: 2,
    category: 'numbers',
    label: 'Digit 5',
    pathPoints: [
      { x: 235, y: 80 },
      { x: 115, y: 80 },
      { x: 115, y: 210 },
      { x: 215, y: 210 },
      { x: 245, y: 290 },
      { x: 195, y: 390 },
      { x: 105, y: 370 },
    ],
  },
  {
    id: 306,
    name: 'Number 6',
    difficulty: 3,
    category: 'numbers',
    label: 'Digit 6',
    pathPoints: [
      { x: 225, y: 90 },
      { x: 115, y: 180 },
      { x: 95, y: 290 },
      { x: 165, y: 390 },
      { x: 235, y: 320 },
      { x: 205, y: 230 },
      { x: 115, y: 250 },
    ],
  },
  {
    id: 307,
    name: 'Number 7',
    difficulty: 1,
    category: 'numbers',
    label: 'Digit 7',
    pathPoints: [
      { x: 95, y: 80 },
      { x: 175, y: 80 },
      { x: 245, y: 80 },
      { x: 185, y: 240 },
      { x: 125, y: 400 },
    ],
  },
  {
    id: 308,
    name: 'Number 8',
    difficulty: 3,
    category: 'numbers',
    label: 'Digit 8',
    pathPoints: [
      { x: 165, y: 220 },
      { x: 105, y: 160 },
      { x: 165, y: 80 },
      { x: 225, y: 160 },
      { x: 165, y: 220 },
      { x: 95, y: 310 },
      { x: 165, y: 400 },
      { x: 235, y: 310 },
      { x: 165, y: 220 },
    ],
  },
  {
    id: 309,
    name: 'Number 9',
    difficulty: 3,
    category: 'numbers',
    label: 'Digit 9',
    pathPoints: [
      { x: 215, y: 230 },
      { x: 125, y: 230 },
      { x: 95, y: 140 },
      { x: 165, y: 80 },
      { x: 235, y: 140 },
      { x: 235, y: 260 },
      { x: 205, y: 390 },
      { x: 125, y: 400 },
    ],
  },
];

/* =========================================================
   CATEGORY 4: LETTERS (A-Z SELECT SAMPLES)
========================================================= */

const LETTER_LEVELS: TurnTakingLevel[] = [
  {
    id: 401,
    name: 'Letter A',
    difficulty: 2,
    category: 'letters',
    label: 'Letter A',
    pathPoints: [
      { x: 75, y: 400 },
      { x: 165, y: 80 },
      { x: 255, y: 400 },
      { x: 215, y: 260 },
      { x: 115, y: 260 },
    ],
  },
  {
    id: 402,
    name: 'Letter B',
    difficulty: 3,
    category: 'letters',
    label: 'Letter B',
    pathPoints: [
      { x: 105, y: 80 },
      { x: 105, y: 240 },
      { x: 105, y: 400 },
      { x: 185, y: 80 },
      { x: 235, y: 150 },
      { x: 165, y: 220 },
      { x: 245, y: 300 },
      { x: 185, y: 400 },
      { x: 105, y: 400 },
    ],
  },
  {
    id: 403,
    name: 'Letter C',
    difficulty: 1,
    category: 'letters',
    label: 'Letter C',
    pathPoints: [
      { x: 245, y: 130 },
      { x: 175, y: 80 },
      { x: 95, y: 160 },
      { x: 95, y: 310 },
      { x: 175, y: 390 },
      { x: 245, y: 340 },
    ],
  },
  {
    id: 404,
    name: 'Letter D',
    difficulty: 2,
    category: 'letters',
    label: 'Letter D',
    pathPoints: [
      { x: 105, y: 80 },
      { x: 105, y: 400 },
      { x: 195, y: 80 },
      { x: 255, y: 240 },
      { x: 195, y: 400 },
      { x: 105, y: 400 },
    ],
  },
  {
    id: 405,
    name: 'Letter E',
    difficulty: 2,
    category: 'letters',
    label: 'Letter E',
    pathPoints: [
      { x: 235, y: 80 },
      { x: 105, y: 80 },
      { x: 105, y: 240 },
      { x: 205, y: 240 },
      { x: 105, y: 240 },
      { x: 105, y: 400 },
      { x: 235, y: 400 },
    ],
  },
  {
    id: 406,
    name: 'Letter H',
    difficulty: 2,
    category: 'letters',
    label: 'Letter H',
    pathPoints: [
      { x: 95, y: 80 },
      { x: 95, y: 240 },
      { x: 95, y: 400 },
      { x: 235, y: 240 },
      { x: 235, y: 80 },
      { x: 235, y: 400 },
    ],
  },
  {
    id: 407,
    name: 'Letter M',
    difficulty: 3,
    category: 'letters',
    label: 'Letter M',
    pathPoints: [
      { x: 75, y: 400 },
      { x: 75, y: 80 },
      { x: 165, y: 280 },
      { x: 255, y: 80 },
      { x: 255, y: 400 },
    ],
  },
  {
    id: 408,
    name: 'Letter O',
    difficulty: 1,
    category: 'letters',
    label: 'Letter O',
    pathPoints: [
      { x: 165, y: 80 },
      { x: 245, y: 130 },
      { x: 255, y: 240 },
      { x: 245, y: 350 },
      { x: 165, y: 400 },
      { x: 85, y: 350 },
      { x: 75, y: 240 },
      { x: 85, y: 130 },
      { x: 165, y: 80 },
    ],
  },
  {
    id: 409,
    name: 'Letter S',
    difficulty: 3,
    category: 'letters',
    label: 'Letter S',
    pathPoints: [
      { x: 235, y: 130 },
      { x: 165, y: 80 },
      { x: 95, y: 150 },
      { x: 165, y: 230 },
      { x: 235, y: 310 },
      { x: 165, y: 390 },
      { x: 85, y: 340 },
    ],
  },
  {
    id: 410,
    name: 'Letter Z',
    difficulty: 2,
    category: 'letters',
    label: 'Letter Z',
    pathPoints: [
      { x: 85, y: 80 },
      { x: 245, y: 80 },
      { x: 85, y: 400 },
      { x: 245, y: 400 },
    ],
  },
];

/* =========================================================
   CATEGORY 5: SHAPES
========================================================= */

const SHAPE_LEVELS: TurnTakingLevel[] = [
  {
    id: 501,
    name: 'Circle',
    difficulty: 1,
    category: 'shapes',
    label: 'Circle',
    pathPoints: [
      { x: 165, y: 80 },
      { x: 255, y: 120 },
      { x: 275, y: 240 },
      { x: 255, y: 360 },
      { x: 165, y: 400 },
      { x: 75, y: 360 },
      { x: 55, y: 240 },
      { x: 75, y: 120 },
      { x: 165, y: 80 },
    ],
  },
  {
    id: 502,
    name: 'Triangle',
    difficulty: 2,
    category: 'shapes',
    label: 'Triangle',
    pathPoints: [
      { x: 165, y: 70 },
      { x: 275, y: 380 },
      { x: 55, y: 380 },
      { x: 165, y: 70 },
    ],
  },
  {
    id: 503,
    name: 'Square',
    difficulty: 2,
    category: 'shapes',
    label: 'Square',
    pathPoints: [
      { x: 75, y: 90 },
      { x: 255, y: 90 },
      { x: 255, y: 370 },
      { x: 75, y: 370 },
      { x: 75, y: 90 },
    ],
  },
  {
    id: 504,
    name: 'Star',
    difficulty: 3,
    category: 'shapes',
    label: 'Five-Point Star',
    pathPoints: [
      { x: 165, y: 65 },
      { x: 205, y: 185 },
      { x: 295, y: 185 },
      { x: 225, y: 255 },
      { x: 255, y: 385 },
      { x: 165, y: 315 },
      { x: 75, y: 385 },
      { x: 105, y: 255 },
      { x: 35, y: 185 },
      { x: 125, y: 185 },
      { x: 165, y: 65 },
    ],
  },
  {
    id: 505,
    name: 'Heart',
    difficulty: 3,
    category: 'shapes',
    label: 'Heart Shape',
    pathPoints: [
      { x: 165, y: 150 },
      { x: 115, y: 80 },
      { x: 55, y: 140 },
      { x: 85, y: 240 },
      { x: 165, y: 400 },
      { x: 245, y: 240 },
      { x: 275, y: 140 },
      { x: 215, y: 80 },
      { x: 165, y: 150 },
    ],
  },
];

/* =========================================================
   RANDOMIZATION SYSTEM (FISHER-YATES SHUFFLE)
========================================================= */

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
  * Retrieves randomized levels for a given category.
  * Ensures that each session gets a unique sequence instead of a fixed order.
  */
export function getRandomizedCategoryLevels(
  category: TurnTakingCategory,
  count = 3
): TurnTakingLevel[] {
  let pool: TurnTakingLevel[] = [];

  switch (category) {
    case 'lines':
      pool = BASIC_LINES;
      break;
    case 'advanced-lines':
      pool = ADVANCED_LINES;
      break;
    case 'numbers':
      pool = NUMBER_LEVELS;
      break;
    case 'letters':
      pool = LETTER_LEVELS;
      break;
    case 'shapes':
      pool = SHAPE_LEVELS;
      break;
    default:
      pool = BASIC_LINES;
  }

  const shuffled = shuffleArray(pool);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  // Re-index levels 1..count for sequence display
  return selected.map((item, idx) => ({
    ...item,
    id: idx + 1,
  }));
}
