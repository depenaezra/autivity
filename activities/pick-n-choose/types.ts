export interface PickChoiceItem {
    id: string;
    label: string;
    asset_key: string;
    category?: string;
}

export interface PickChoiceOption {
    id: string;
    label: string;
    isCorrect: boolean;
    asset_key?: string;
}

export interface PickChoiceQuestion {
    id: string;
    targetItem: PickChoiceItem;
    instruction?: string;
    options: PickChoiceOption[];
}

export interface PickChoiceActivityProps {
    contentData?: {
        item_count?: number;
        choice_count?: number;
        instruction?: string;
        category?: string;
        pool?: PickChoiceItem[];
    };
    activityData?: any;
    onComplete?: (score: number, timeSpent: number, mistakes: number, hintsUsed?: number) => void;
    onFeedback?: (message: string) => void;
    onIncorrectAttempt?: () => void;
    hintSignal?: number;
}
