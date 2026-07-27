import { BubbleColor } from "./bubble-assets";
import { BubbleContent, BubbleData } from "./types";

const randomItem = <T,>(items: T[]): T => {
    return items[
        Math.floor(Math.random() * items.length)
    ];
};

type SpawnOptions = {
    screenWidth: number;
    screenHeight: number;

    speed: number;

    availableColors: BubbleColor[];

    // [ADDED]: Used by Color Pop.
    targetColor?: BubbleColor;
    distractorColors?: BubbleColor[];

    isInitial?: boolean;
};

const createContent = ({
    availableColors = ["default"],
    targetColor,
    distractorColors = ["white"],
}: SpawnOptions): BubbleContent => {

    // [ADDED]: Color Pop generation.
    if (targetColor) {
        const shouldSpawnTarget =
            Math.random() < 0.4;

        const distractors =
            distractorColors.length > 0
                ? distractorColors
                : availableColors.filter(
                    (color) =>
                        color !== targetColor
                );

        return {
            type: "color",

            color: shouldSpawnTarget
                ? targetColor
                : randomItem(distractors.length > 0 ? distractors : ["white"]),
        };
    }

    // [ADDED]: Default Free Pop generation.
    return {
        type: "free",
        color: randomItem(availableColors),
    };
};

export const spawnInitialBubbles = ({
    bubbleCount,
    screenWidth,
    screenHeight,
    speed,
    availableColors,
    targetColor,
    distractorColors,
}: SpawnOptions & { bubbleCount: number }): BubbleData[] => {
    const margin = 110;
    const usableWidth = Math.max(80, screenWidth - margin);
    const laneWidth = usableWidth / Math.max(1, bubbleCount);

    const lanes = Array.from({ length: bubbleCount }, (_, i) => i);
    for (let i = lanes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
    }

    return Array.from({ length: bubbleCount }, (_, i) => {
        const lane = lanes[i];
        const x = lane * laneWidth + Math.random() * (laneWidth * 0.5) + 10;
        // Start all initial bubbles below screenHeight, staggered so they float up from outside view
        const y = screenHeight + 15 + (i * 75) + (Math.random() * 20);

        return {
            id: Date.now().toString() + Math.random() + i,
            x,
            y,
            speed,
            content: createContent({
                availableColors,
                targetColor,
                distractorColors,
                screenWidth,
                screenHeight,
                speed,
            }),
        };
    });
};

export const spawnBubble = ({
    screenWidth,
    screenHeight,
    speed,
    availableColors,
    targetColor,
    distractorColors,
    existingBubbles = [],
}: SpawnOptions & { existingBubbles?: BubbleData[] }): BubbleData => {
    const margin = 110;
    const usableWidth = Math.max(80, screenWidth - margin);

    // Pick best x coordinate that maximizes distance from existing bubbles near bottom
    let bestX = Math.random() * usableWidth + 10;
    let maxMinDist = -1;
    const candY = screenHeight + 15;

    for (let attempt = 0; attempt < 8; attempt++) {
        const candX = Math.random() * usableWidth + 10;

        let minDist = 9999;
        for (const b of existingBubbles) {
            const dx = candX - b.x;
            const dy = candY - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) minDist = dist;
        }

        if (minDist > maxMinDist) {
            maxMinDist = minDist;
            bestX = candX;
        }
    }

    return {
        id: Date.now().toString() + Math.random(),
        x: bestX,
        y: candY + Math.random() * 20,
        speed,
        content: createContent({
            availableColors,
            targetColor,
            distractorColors,
            screenWidth,
            screenHeight,
            speed,
        }),
    };
};