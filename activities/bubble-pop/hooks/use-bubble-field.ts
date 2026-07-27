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

    const [bubbles, setBubbles] = useState<BubbleData[]>(() => {
        return spawnInitialBubbles({
            bubbleCount,
            screenWidth: width || 800,
            screenHeight: height || 600,
            speed,
            availableColors,
            targetColor,
            distractorColors,
        });
    });

    useEffect(() => {
        if (width > 0 && height > 0) {
            setBubbles(
                spawnInitialBubbles({
                    bubbleCount,
                    screenWidth: width,
                    screenHeight: height,
                    speed,
                    availableColors,
                    targetColor,
                    distractorColors,
                })
            );
        }
    }, [bubbleCount, speed, width, height, targetColor]);

    const recycleBubble = (id: string) => {
        setBubbles((current) => {
            const remaining = current.filter((bubble) => bubble.id !== id);

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
            const active = current.filter((b) => b.id !== id);

            const newBubble = spawnBubble({
                screenWidth: width,
                screenHeight: height,
                speed,
                availableColors,
                targetColor,
                distractorColors,
                existingBubbles: active,
            });

            return [...current, newBubble];
        });
    };

    const removeBubble = (id: string) => {
        setBubbles((current) => current.filter((bubble) => bubble.id !== id));
    };

    return {
        bubbles,
        popBubble,
        removeBubble,
        recycleBubble,
    };
}