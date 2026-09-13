export interface SequencingStep {
  id: string;
  step_number: number;
  label: string;
  asset_key: string;
}

export interface SequencingRoutine {
  routine_id: string;
  title: string;
  steps: SequencingStep[];
}

export interface SequencingContentData {
  type: string;
  level?: number;
  step_count?: number;
  instruction?: string;
  routines?: SequencingRoutine[];
}

export interface SequencingActivityProps {
  contentData?: SequencingContentData;
  onComplete: (score: number, timeSpent: number, mistakes: number, hintsUsed?: number) => void;
  onFeedback?: (message: string) => void;
  onIncorrectAttempt?: () => void;
  hintSignal?: number;
}
