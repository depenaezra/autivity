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

    targetColor?: BubbleColor;
    distractorColors?: BubbleColor[];

    isInitial?: boolean;
    forceTarget?: boolean;
};

const createContent = ({
    availableColors = ["default"],
    targetColor,
    distractorColors = ["white"],
    forceTarget = false,
}: SpawnOptions): BubbleContent => {
    if (targetColor) {
        const shouldSpawnTarget = forceTarget || Math.random() < 0.45;

        const distractors =
            distractorColors.length > 0
                ? distractorColors
                : availableColors.filter(
                    (color) => color !== targetColor
                );

        return {
            type: "color",
            color: shouldSpawnTarget
                ? targetColor
                : randomItem(distractors.length > 0 ? distractors : ["white"]),
        };
    }

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

        // Start all initial bubbles right at or just beneath the bottom edge.
        // Bubble 0 is right at the bottom edge (top 15px emerging into view), immediately floating up.
        // Successive bubbles follow closely so there is zero initial blank screen delay,
        // and bubbles naturally rise up from the bottom instead of appearing in the middle of the screen.
        let y: number;
        if (i === 0) {
            y = screenHeight - 15;
        } else {
            y = screenHeight + 15 + ((i - 1) * 35) + (Math.random() * 10);
        }

        // For color pop mode, guarantee at least the first bubble has targetColor
        const forceTarget = Boolean(targetColor && i === 0);

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
                forceTarget,
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
    // Spawn just 5px below bottom edge so it emerges within ~0.05s
    const candY = screenHeight + 5;

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

    // In color pop mode, if there are currently no target bubbles in the field, force spawn target
    const hasTargetInField = targetColor
        ? existingBubbles.some((b) => b.content.color === targetColor)
        : true;

    return {
        id: Date.now().toString() + Math.random(),
        x: bestX,
        y: candY + Math.random() * 10,
        speed,
        content: createContent({
            availableColors,
            targetColor,
            distractorColors,
            screenWidth,
            screenHeight,
            speed,
            forceTarget: targetColor ? !hasTargetInField : false,
        }),
    };
};
