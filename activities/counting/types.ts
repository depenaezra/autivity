export type CountingItemCategory = 'fruits' | 'veggies' | 'items';

export interface CountingItemDef {
  id: string;
  name: string;
  category: CountingItemCategory;
  assetKey: string;
  color?: string;
  label?: string;
}

export interface PlacedCountingItem extends CountingItemDef {
  countNumber: number;
  placedAt: number;
  offsetX?: number;
  offsetY?: number;
}

export interface CountingContentData {
  type?: 'counting';
  target_count?: number; // e.g. 2, 3, 4, 5
  item_type?: string; // 'apple' | 'carrot' | 'banana' | 'orange' | 'strawberry' | 'tomato' | 'broccoli' | 'toy' etc.
  item_name?: string; // 'Apples' | 'Carrots' etc.
  category_type?: CountingItemCategory;
  instruction?: string;
  shelf_count?: number; // Total items shown on shelf (e.g. 5 to 7)
}

export interface CountingActivityProps {
  contentData?: CountingContentData;
  onComplete?: (score: number, timeSpent: number, mistakes: number, hintsUsed?: number) => void;
  onFeedback?: (message: string) => void;
  onIncorrectAttempt?: () => void;
  hintSignal?: number;
  isFirstActivityInSession?: boolean;
}
