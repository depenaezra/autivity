export type TurnTakingCategory =
  | 'lines'
  | 'advanced-lines'
  | 'numbers'
  | 'letters'
  | 'shapes';

export type TurnTakingPlayer = {
  id: string;
  name: string;
  avatar?: string;
  difficulty?: number;
};

export type TurnTakingLevel = {
  id: number;
  name: string;
  difficulty: number;
  category?: TurnTakingCategory;
  label?: string;
  pathPoints: {
    x: number;
    y: number;
  }[];
};

export type TurnTakingResult = {
  playerId: string;
  playerName: string;
  level: number;
  levelName?: string;
  completed: boolean;
  timeSeconds: number;
  mistakes?: number;
  obstacleCount?: number;
};

export type StudentEvaluationReport = {
  playerId: string;
  playerName: string;
  avatar?: string;
  totalTurns: number;
  completedTurns: number;
  totalMistakes: number;
  totalTimeSeconds: number;
  avgTimePerTurnSeconds: number;
  accuracyPercentage: number;
  turnTakingSocialScore: number;
  rubricEvaluation: {
    looking_at_objects: number;
    concentrating: number;
    performing_task: number;
    following_instructions: number;
    completed_work: number;
  };
  overallGrade: 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Practice';
  teacherFeedback: string;
};

export type TurnTakingGameState =
  | 'category_select'
  | 'selecting'
  | 'spinning'
  | 'playing'
  | 'waiting'
  | 'result'
  | 'finished';

import { RubricEvaluation } from '@/src/services/sessions';

export interface TeacherDualEvaluationResult {
  p1?: {
    scores: RubricEvaluation;
    feedback: string;
  };
  p2?: {
    scores: RubricEvaluation;
    feedback: string;
  };
}