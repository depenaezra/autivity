import { TurnTakingLevel } from '../types';

export const TURN_TAKING_LEVELS: TurnTakingLevel[] = [
  {
    id: 1,
    name: 'Easy Path',
    difficulty: 1,
    pathPoints: [
      { x: 50, y: 90 },
      { x: 80, y: 130 },
      { x: 110, y: 170 },
      { x: 140, y: 210 },
      { x: 170, y: 250 },
      { x: 200, y: 290 },
      { x: 230, y: 330 },
      { x: 260, y: 370 },
    ],
  },

  {
    id: 2,
    name: 'Wavy Path',
    difficulty: 2,
    pathPoints: [
      { x: 50, y: 90 },
      { x: 100, y: 120 },
      { x: 150, y: 100 },
      { x: 200, y: 140 },
      { x: 250, y: 120 },
      { x: 300, y: 180 },
      { x: 260, y: 230 },
      { x: 210, y: 270 },
      { x: 260, y: 320 },
      { x: 310, y: 370 },
    ],
  },

  {
    id: 3,
    name: 'Curvy Path',
    difficulty: 3,
    pathPoints: [
      { x: 50, y: 90 },
      { x: 100, y: 140 },
      { x: 160, y: 110 },
      { x: 210, y: 170 },
      { x: 150, y: 220 },
      { x: 90, y: 250 },
      { x: 140, y: 300 },
      { x: 220, y: 280 },
      { x: 280, y: 330 },
      { x: 330, y: 370 },
    ],
  },

  {
    id: 4,
    name: 'Challenging Path',
    difficulty: 4,
    pathPoints: [
      { x: 50, y: 90 },
      { x: 120, y: 130 },
      { x: 190, y: 100 },
      { x: 250, y: 150 },
      { x: 190, y: 200 },
      { x: 110, y: 180 },
      { x: 70, y: 240 },
      { x: 140, y: 280 },
      { x: 230, y: 250 },
      { x: 300, y: 300 },
      { x: 250, y: 340 },
      { x: 320, y: 380 },
    ],
  },
];

export const getLevel = (levelNumber: number): TurnTakingLevel => {
  return (
    TURN_TAKING_LEVELS.find((level) => level.id === levelNumber) ||
    TURN_TAKING_LEVELS[TURN_TAKING_LEVELS.length - 1]
  );
};