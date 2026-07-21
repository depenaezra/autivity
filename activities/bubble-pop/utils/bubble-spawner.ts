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

    // Generate N distinct Y height tiers across visible screen (15% to 75% height)
    const yTiers = Array.from({ length: bubbleCount }, (_, i) => {
        const base = screenHeight * 0.15 + (i * (screenHeight * 0.6)) / Math.max(1, bubbleCount - 1);
        return base + (Math.random() * 30 - 15);
    });

    // Fisher-Yates shuffle Y tiers to pair randomly with X lanes
    for (let i = yTiers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [yTiers[i], yTiers[j]] = [yTiers[j], yTiers[i]];
    }

    return Array.from({ length: bubbleCount }, (_, i) => {
        const x = i * laneWidth + Math.random() * (laneWidth * 0.5) + 10;
        const y = yTiers[i];

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
    const candY = screenHeight + 35;

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
        y: candY + Math.random() * 25,
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