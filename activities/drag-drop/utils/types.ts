export interface DragDropItem {
    id: string;
    type: string;        // The matching key payload (e.g., 'Apple')
    imageSource: any;    // For local assets (using require())
    color: string;       // Accent color
}

export interface DragDropTarget {
    id: string;
    type: string;        // The type payload it expects
    imageSource: any;    // For local assets (using require())
    color: string;       // Highlight color
}

export interface DragDropActivityProps {
    items: DragDropItem[];
    targets: DragDropTarget[];
    // total time spent on the activity
    onComplete?: (durationSeconds: number) => void;
    onFeedback?: (message: string) => void;
}