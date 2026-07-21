import { useEffect, useState } from "react";
import { Dimensions } from "react-native";

import { BubbleColor } from "../utils/bubble-assets";
import { spawnBubble, spawnInitialBubbles } from "../utils/bubble-spawner";
import { BubbleData } from "../utils/types";

type Props = {
    bubbleCount: number;
    speed: number;
    availableColors: BubbleColor[];

    // [ADDED]: Used for Color Pop.
    targetColor?: BubbleColor;
    distractorColors?: BubbleColor[];
};

export default function useBubbleField({
    bubbleCount,
    speed,
    availableColors,
    targetColor,
    distractorColors,
}: Props) {
    const { width, height } = Dimensions.get("window");

    const [bubbles, setBubbles] = useState<BubbleData[]>([]);

    useEffect(() => {
        const initialBubbles = spawnInitialBubbles({
            bubbleCount,
            screenWidth: width,
            screenHeight: height,
            speed,
            availableColors,
            targetColor,
            distractorColors,
        });

        setBubbles(initialBubbles);
    }, [bubbleCount, speed, width, height]);

    const recycleBubble = (id: string) => {
        setBubbles((current) => {
            const remaining = current.filter(
                (bubble) =>
                    bubble.id !== id
            );

            return [
                ...remaining,

                spawnBubble({
                    screenWidth: width,
                    screenHeight: height,
                    speed,
                    availableColors,
                    targetColor,
                    distractorColors,
                    existingBubbles: remaining,
                }),
            ];
        });
    };

    const popBubble = (id: string) => {
        setBubbles((current) => {
            const remaining = current.filter(
                (bubble) =>
                    bubble.id !== id
            );

            return [
                ...remaining,

                spawnBubble({
                    screenWidth: width,
                    screenHeight: height,
                    speed,
                    availableColors,
                    targetColor,
                    distractorColors,
                    existingBubbles: remaining,
                }),
            ];
        });
    };

    return {
        bubbles,
        popBubble,
        recycleBubble,
    };
}