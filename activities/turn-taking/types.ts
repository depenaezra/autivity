export type TurnTakingPlayer = {
  id: string;
  name: string;
};

export type TurnTakingLevel = {
  id: number;
  name: string;
  difficulty: number;
  pathPoints: {
    x: number;
    y: number;
  }[];
};

export type TurnTakingResult = {
  playerId: string;
  playerName: string;
  level: number;
  completed: boolean;
  timeSeconds: number;
};

export type TurnTakingGameState =
  | 'selecting'
  | 'spinning'
  | 'playing'
  | 'waiting'
  | 'result'
  | 'finished';