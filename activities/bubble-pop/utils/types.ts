import { BubbleColor } from "./bubble-assets";

export type BubbleActivityType =
    | "free"
    | "color"
    | "number"
    | "letter"
    | "image";

export type BubbleContent =
    | {
        type: "free";
        color: BubbleColor;
    }
    | {
        type: "color";
        color: BubbleColor;
    }
    | {
        type: "number";
        color: BubbleColor;
        value: number;
    }
    | {
        type: "letter";
        color: BubbleColor;
        value: string;
    }
    | {
        type: "image";
        color: BubbleColor;
        assetKey: string;
    };

export type BubbleData = {
    id: string;
    x: number;
    y: number;
    speed: number;
    content: BubbleContent;
};

export type BubbleProps = {
    x: number;
    y: number;
    speed: number;
    scale?: number;
    content: BubbleContent;
    onPop: () => void;
    onPopFinished?: () => void;
    onRecycle: () => void;
};

export type BubbleContentData = {
    type?: "bubble-pop" | string;
    mode?: "free" | "color";
    target_count?: number;
    bubble_count?: number;
    speed?: number;
    bubble_scale?: number;
    target_color?: BubbleColor;
    distractor_colors?: BubbleColor[];
    available_colors?: BubbleColor[];
    instruction?: string;
};

export type BubbleConfig = {
    type: BubbleActivityType;

    bubbleCount: number;
    speed: number;

    availableColors: BubbleColor[];

    targetColor?: BubbleColor;
};