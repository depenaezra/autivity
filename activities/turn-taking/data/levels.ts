import { TurnTakingLevel } from '../types';

export const TURN_TAKING_LEVELS: TurnTakingLevel[] = [
  // LEVEL 1: Straight Line (Tier 1: Easy - Gentle Entry)
  {
    id: 1,
    name: 'Straight Line',
    difficulty: 1,
    svgPath: 'M 60 200 L 340 200',
    pathPoints: [
      { x: 165, y: 65 },
      { x: 165, y: 145 },
      { x: 165, y: 225 },
      { x: 165, y: 305 },
      { x: 165, y: 425 },
    ],
  },

  // LEVEL 2: Gentle Wave (Tier 1: Easy - Smooth undulating curve)
  {
    id: 2,
    name: 'Gentle Wave',
    difficulty: 1,
    svgPath: 'M 60 200 Q 130 130 200 200 T 340 200',
    pathPoints: [
      { x: 165, y: 65 },
      { x: 135, y: 155 },
      { x: 175, y: 245 },
      { x: 195, y: 335 },
      { x: 165, y: 425 },
    ],
  },

  // LEVEL 3: Smooth Curve (Tier 1: Easy - Wider sweeping arc)
  {
    id: 3,
    name: 'Smooth Curve',
    difficulty: 2,
    svgPath: 'M 70 300 Q 200 100 330 300',
    pathPoints: [
      { x: 165, y: 65 },
      { x: 105, y: 150 },
      { x: 165, y: 250 },
      { x: 225, y: 350 },
      { x: 165, y: 435 },
    ],
  },

  // LEVEL 4: S-Curve (Tier 2: Medium - Dual-direction curvature)
  {
    id: 4,
    name: 'S-Curve',
    difficulty: 2,
    svgPath: 'M 80 100 C 200 100 200 300 320 300',
    pathPoints: [
      { x: 165, y: 65 },
      { x: 120, y: 125 },
      { x: 165, y: 245 },
      { x: 210, y: 365 },
      { x: 165, y: 435 },
    ],
  },

  // LEVEL 5: Arch Bridge (Tier 2: Medium - Up-and-over bridge track)
  {
    id: 5,
    name: 'Arch Bridge',
    difficulty: 2,
    svgPath: 'M 70 300 L 70 180 C 70 100 330 100 330 180 L 330 300',
    pathPoints: [
      { x: 165, y: 65 },
      { x: 125, y: 130 },
      { x: 165, y: 250 },
      { x: 205, y: 370 },
      { x: 165, y: 435 },
    ],
  },

  // LEVEL 6: Classic Zigzag (Tier 2: Medium - Sharp directional corners)
  {
    id: 6,
    name: 'Classic Zigzag',
    difficulty: 3,
    svgPath: 'M 60 200 L 130 110 L 200 290 L 270 110 L 340 200',
    pathPoints: [
      { x: 165, y: 65 },
      { x: 120, y: 145 },
      { x: 210, y: 245 },
      { x: 120, y: 345 },
      { x: 165, y: 435 },
    ],
  },

  // LEVEL 7: Mountain Peaks (Tier 3: Hard - Double angular ascents)
  {
    id: 7,
    name: 'Mountain Peaks',
    difficulty: 3,
    svgPath: 'M 60 280 L 130 120 L 200 260 L 270 120 L 340 280',
    pathPoints: [
      { x: 165, y: 65 },
      { x: 110, y: 125 },
      { x: 165, y: 185 },
      { x: 220, y: 245 },
      { x: 165, y: 435 },
    ],
  },

  // LEVEL 8: Double Zigzag (Tier 3: Hard - Complex multi-point switchbacks)
  {
    id: 8,
    name: 'Double Zigzag',
    difficulty: 3,
    svgPath: 'M 80 80 L 320 160 L 80 240 L 320 320',
    pathPoints: [
      { x: 165, y: 65 },
      { x: 110, y: 115 },
      { x: 220, y: 195 },
      { x: 110, y: 275 },
      { x: 165, y: 435 },
    ],
  },

  // LEVEL 9: Loop-de-Loop (Tier 3: Hard - Wide rounded sweeping loop)
  {
    id: 9,
    name: 'Loop-de-Loop',
    difficulty: 4,
    svgPath: 'M 60 280 C 140 280 180 110 200 110 C 220 110 260 280 340 280',
    pathPoints: [
      { x: 165, y: 65 },
      { x: 105, y: 145 },
      { x: 165, y: 245 },
      { x: 225, y: 345 },
      { x: 165, y: 435 },
    ],
  },

  // LEVEL 10: Spiral Path (Tier 3: Hard - Inward winding labyrinth arc)
  {
    id: 10,
    name: 'Spiral Path',
    difficulty: 4,
    svgPath: 'M 200 200 C 200 160 240 160 240 200 C 240 250 160 250 160 200 C 160 130 270 130 270 200 C 270 290 130 290 130 200',
    pathPoints: [
      { x: 165, y: 65 },
      { x: 115, y: 145 },
      { x: 165, y: 235 },
      { x: 215, y: 325 },
      { x: 165, y: 435 },
    ],
  },
];