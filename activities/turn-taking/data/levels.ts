import { TurnTakingLevel } from '../types';

export const TURN_TAKING_LEVELS: TurnTakingLevel[] = [
  {
    id: 1,
    name: 'Straight Line',
    difficulty: 1,
    pathPoints: [
      { x: 165, y: 65 },
      { x: 165, y: 105 },
      { x: 165, y: 145 },
      { x: 165, y: 185 },
      { x: 165, y: 225 },
      { x: 165, y: 265 },
      { x: 165, y: 305 },
      { x: 165, y: 345 },
      { x: 165, y: 385 },
      { x: 165, y: 425 },
    ],
  },

  {
    id: 2,
    name: 'Smooth Curve',
    difficulty: 2,
    pathPoints: [
      { x: 165, y: 65 },
      { x: 125, y: 90 },
      { x: 105, y: 130 },
      { x: 105, y: 175 },
      { x: 125, y: 215 },
      { x: 165, y: 250 },
      { x: 205, y: 285 },
      { x: 225, y: 325 },
      { x: 225, y: 365 },
      { x: 205, y: 405 },
      { x: 165, y: 435 },
    ],
  },

  {
    id: 3,
    name: 'Zigzag',
    difficulty: 3,
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
];

export const getLevel = (
  levelNumber: number
): TurnTakingLevel => {
  return (
    TURN_TAKING_LEVELS.find(
      (level) => level.id === levelNumber
    ) ||
    TURN_TAKING_LEVELS[0]
  );
};