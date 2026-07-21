import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import BubbleList from "./bubble-list";
import useBubbleField from "../hooks/use-bubble-field";
import { BubbleColor } from "../utils/bubble-assets";
import { BubbleContentData } from "../utils/types";

type Props = {
    contentData?: BubbleContentData;

    // Optional direct props for testing
    bubbleCount?: number;
    speed?: number;
    availableColors?: BubbleColor[];
    targetColor?: BubbleColor;
    targetCount?: number;
    bubbleScale?: number;
    mode?: "free" | "color";

    onComplete?: (score: number, timeSpent: number, mistakes: number) => void;
    onFeedback?: (message: string) => void;
    onIncorrectAttempt?: () => void;
};

export default function BubbleActivity({
    contentData,
    bubbleCount: directBubbleCount,
    speed: directSpeed,
    availableColors: directAvailableColors,
    targetColor: directTargetColor,
    onComplete,
    onFeedback,
    onIncorrectAttempt,
}: Props) {
    const mode = contentData?.mode || (contentData?.target_color || directTargetColor ? "color" : "free");
    const bubbleCount = contentData?.bubble_count || directBubbleCount || 5;
    const speed = contentData?.speed || directSpeed || 12000;
    const bubbleScale = contentData?.bubble_scale || 1.0;
    const targetCount = contentData?.target_count || 5;

    const availableColors = contentData?.available_colors || directAvailableColors || ["default"];
    const targetColor = contentData?.target_color || directTargetColor;
    const distractorColors = contentData?.distractor_colors || ["white"];

    const [poppedCount, setPoppedCount] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const startTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        startTimeRef.current = Date.now();
        setPoppedCount(0);
        setMistakes(0);
        setIsCompleted(false);
    }, [contentData]);

    const { bubbles, popBubble, recycleBubble } = useBubbleField({
        bubbleCount,
        speed,
        availableColors,
        targetColor,
        distractorColors,
    });

    const handleUserPop = (id: string) => {
        const poppedBubble = bubbles.find((b) => b.id === id);
        popBubble(id);

        if (isCompleted) return;

        if (mode === "color" && targetColor) {
            if (poppedBubble?.content.color === targetColor) {
                const nextCount = poppedCount + 1;
                setPoppedCount(nextCount);

                if (nextCount >= targetCount) {
                    setIsCompleted(true);
                    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
                    const score = Math.max(10, (targetCount * 10) - (mistakes * 5));
                    onComplete?.(score, timeSpent, mistakes);
                }
            } else {
                setMistakes((prev) => prev + 1);
                onIncorrectAttempt?.();
                onFeedback?.(`Not quite! Pop the ${targetColor} bubbles!`);
            }
        } else {
            // Free Pop mode
            const nextCount = poppedCount + 1;
            setPoppedCount(nextCount);

            if (nextCount >= targetCount) {
                setIsCompleted(true);
                const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
                const score = targetCount * 10;
                onComplete?.(score, timeSpent, 0);
            }
        }
    };

    const handleRecycle = (id: string) => {
        recycleBubble(id);
    };

    return (
        <View style={styles.container}>
            {/* Appealing Progress Counter Badge */}
            <View style={styles.counterBadge}>
                <Ionicons name="disc" size={20} color="#62A9E6" style={{ marginRight: 6 }} />
                <Text style={styles.counterText}>
                    {poppedCount} / {targetCount}
                </Text>
            </View>

            {/* Bubble Field - stops/unmounts when goal is reached */}
            {!isCompleted && (
                <BubbleList
                    bubbles={bubbles}
                    scale={bubbleScale}
                    onPop={handleUserPop}
                    onRecycle={handleRecycle}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    counterBadge: {
        position: "absolute",
        top: 16,
        right: 16,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#BFDBFE",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 100,
    },
    counterText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#4B5563",
    },
});