import { useEffect, useRef, useState } from "react";
import { Dimensions } from "react-native";

import { BubbleColor } from "../utils/bubble-assets";
import { spawnBubble, spawnInitialBubbles } from "../utils/bubble-spawner";
import { BubbleData } from "../utils/types";

type Props = {
    bubbleCount: number;
    speed: number;
    availableColors: BubbleColor[];

    // Used for Color Pop.
    targetColor?: BubbleColor;
    distractorColors?: BubbleColor[];
    fieldWidth?: number;
    fieldHeight?: number;
    resetKey?: string;
};

export default function useBubbleField({
    bubbleCount,
    speed,
    availableColors,
    targetColor,
    distractorColors,
    fieldWidth,
    fieldHeight,
    resetKey,
}: Props) {
    const { width: windowWidth, height: windowHeight } = Dimensions.get("window");
    const width = fieldWidth && fieldWidth > 0 ? fieldWidth : (windowWidth || 800);
    const height = fieldHeight && fieldHeight > 0 ? fieldHeight : (windowHeight > windowWidth ? windowHeight * 0.55 : Math.max(350, windowHeight - 380));

    const [bubbles, setBubbles] = useState<BubbleData[]>(() => {
        return spawnInitialBubbles({
            bubbleCount,
            screenWidth: width,
            screenHeight: height,
            speed,
            availableColors,
            targetColor,
            distractorColors,
        });
    });

    const hasInitializedRef = useRef(true);
    const lastResetKeyRef = useRef(resetKey);

    useEffect(() => {
        const isReset = resetKey !== undefined && resetKey !== lastResetKeyRef.current;
        if (isReset) {
            lastResetKeyRef.current = resetKey;
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
            return;
        }

        if (!hasInitializedRef.current) {
            hasInitializedRef.current = true;
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
    }, [resetKey, width, height, bubbleCount, speed, targetColor]);

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
