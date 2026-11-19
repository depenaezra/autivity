import { playCorrectSound } from "@/src/utils/sound";
import { speakInstruction } from "@/src/utils/speech";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useRef, useState } from "react";
import {
    PanResponder,
    Pressable,
    Text,
    useWindowDimensions,
    View,
    type GestureResponderEvent
} from "react-native";
import Svg, { Line, Path } from "react-native-svg";
import { CopyLetters, getCopyLetterData } from "../data/letters";
import type { Point, Stroke } from "../types";
import { validateCopyDrawing } from "../utils/validateDrawing";

type CopyLetterActivityProps = {
    activity: any;
    onComplete?: (score: number, timeSpent: number, mistakes: number, hintsUsed?: number) => void;
    onFeedback?: (message: string) => void;
    onIncorrectAttempt?: () => void;
    hintSignal?: number;
};

export default function CopyLetterActivity({
    activity,
    onComplete,
    onFeedback,
    onIncorrectAttempt,
}: CopyLetterActivityProps) {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const isTablet = Math.min(screenWidth, screenHeight) >= 600;

    // Resolve target letter data (defaults to 'A' if unspecified)
    const letterData = useMemo(() => {
        const rawKey =
            activity?.letter ||
            activity?.target_letter ||
            activity?.content_data?.target_letter ||
            activity?.data?.letter ||
            activity?.path ||
            "A";
        return getCopyLetterData(rawKey) || CopyLetters.A;
    }, [activity]);

    const targetLetter = letterData.letter;

    // Drawing states
    const [completedStrokes, setCompletedStrokes] = useState<Stroke[]>([]);
    const [currentStroke, setCurrentStroke] = useState<Stroke>([]);
    const [canvasLayout, setCanvasLayout] = useState<{ width: number; height: number }>({ width: 340, height: 320 });

    // Performance & metrics tracking
    const mistakesRef = useRef(0);
    const startTimeRef = useRef(Date.now());
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Speak letter prompt
    const handlePronounce = () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch { }
        speakInstruction(`Copy the letter ${targetLetter}`);
    };

    // PanResponder for smooth, zero-latency touch drawing
    const currentStrokeRef = useRef<Stroke>([]);
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt: GestureResponderEvent) => {
                const { locationX, locationY } = evt.nativeEvent;
                const newPoint: Point = { x: locationX, y: locationY };
                currentStrokeRef.current = [newPoint];
                setCurrentStroke([newPoint]);
            },
            onPanResponderMove: (evt: GestureResponderEvent) => {
                const { locationX, locationY } = evt.nativeEvent;
                const newPoint: Point = { x: locationX, y: locationY };
                currentStrokeRef.current = [...currentStrokeRef.current, newPoint];
                setCurrentStroke(currentStrokeRef.current);
            },
            onPanResponderRelease: () => {
                const finishedStroke = [...currentStrokeRef.current];
                currentStrokeRef.current = [];
                setCurrentStroke([]);
                if (finishedStroke.length > 0) {
                    setCompletedStrokes((prev) => [...prev, finishedStroke]);
                }
            },
            onPanResponderTerminate: () => {
                const finishedStroke = [...currentStrokeRef.current];
                currentStrokeRef.current = [];
                setCurrentStroke([]);
                if (finishedStroke.length > 0) {
                    setCompletedStrokes((prev) => [...prev, finishedStroke]);
                }
            },
        })
    ).current;

    // Convert an array of points into SVG path string
    const pointsToSvgPath = (points: Point[]): string => {
        if (!points || points.length === 0) return "";
        if (points.length === 1) {
            return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;
        }
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            d += ` L ${points[i].x} ${points[i].y}`;
        }
        return d;
    };

    // Clear board handler
    const handleClear = () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch { }
        setCompletedStrokes([]);
        setCurrentStroke([]);
        onFeedback?.(`Let's copy the letter ${targetLetter}!`);
    };

    // Submit & Validate drawing
    const handleCheckDrawing = () => {
        if (isSubmitting) return;

        const allStrokes = [...completedStrokes];
        if (currentStroke.length > 0) {
            allStrokes.push(currentStroke);
        }

        const result = validateCopyDrawing(
            allStrokes,
            targetLetter,
            letterData.targetZones,
            letterData.minStrokes,
            letterData.maxStrokes,
            letterData.emptyZones,
            letterData.maxAspectRatio
        );

        if (result.isValid) {
            setIsSubmitting(true);
            try {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch { }
            playCorrectSound();
            onFeedback?.(`Incredible! You wrote the letter ${targetLetter}! ⭐`);

            const duration = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
            const score = 15; // 15 stars per completed activity
            onComplete?.(score, duration, mistakesRef.current);
        } else {
            mistakesRef.current += 1;
            onIncorrectAttempt?.();
            try {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch { }
            onFeedback?.(result.message || `Look at the letter ${targetLetter} above and try again!`);
        }
    };

    // Calculate handwriting guidelines Y-coordinates
    const guidelineTop = canvasLayout.height * 0.22;
    const guidelineMid = canvasLayout.height * 0.50;
    const guidelineBase = canvasLayout.height * 0.78;

    const hasDrawn = completedStrokes.length > 0 || currentStroke.length > 0;

    return (
        <View className="flex-1 w-full bg-[#E8F4FF] items-center px-4 py-2 justify-between">
            {/* 1. TOP BAR (Under dialogue): Model letter card + Action buttons */}
            <View className="w-full max-w-[540px] flex-row items-center justify-between mb-2">
                {/* Target Letter Model Card */}
                <Pressable
                    onPress={handlePronounce}
                    className="flex-row items-center bg-white px-4 py-1.5 rounded-2xl border-[3px] border-[#BBE8FB] active:scale-95 transition-transform"
                    style={{
                        shadowColor: "#BBE8FB",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 1,
                        shadowRadius: 0,
                        elevation: 2,
                    }}
                >
                    <View className="items-center justify-center mr-2">
                        <Text className="text-[10px] font-fredoka-one text-[#9CA3AF] uppercase tracking-wider">
                            MODEL
                        </Text>
                        <Text className={`font-fredoka-one text-[#62A9E6] ${isTablet ? "text-5xl" : "text-4xl"}`}>
                            {targetLetter}
                        </Text>
                    </View>
                    <View className="w-8 h-8 rounded-full bg-[#E8F4FF] items-center justify-center border border-[#BBE8FB]">
                        <Ionicons name="volume-high" size={isTablet ? 20 : 16} color="#62A9E6" />
                    </View>
                </Pressable>

                {/* Tactile Control Buttons */}
                <View className="flex-row items-center gap-2">
                    {/* Clear Button */}
                    <Pressable
                        onPress={handleClear}
                        disabled={!hasDrawn}
                        className={`px-3.5 py-2.5 rounded-xl bg-white border-[2px] border-[#F1F1F1] flex-row items-center transition-transform ${hasDrawn ? "active:scale-95 opacity-100" : "opacity-40"
                            }`}
                        style={{
                            shadowColor: "#F1F1F1",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 1,
                            shadowRadius: 0,
                            elevation: hasDrawn ? 2 : 0,
                        }}
                    >
                        <Ionicons name="refresh" size={16} color="#9CA3AF" style={{ marginRight: 4 }} />
                        <Text className="font-fredoka-one text-xs text-[#9CA3AF] uppercase">
                            CLEAR
                        </Text>
                    </Pressable>

                    {/* I Did It! / Check Button */}
                    <Pressable
                        onPress={handleCheckDrawing}
                        disabled={!hasDrawn || isSubmitting}
                        className={`px-4 py-2.5 rounded-xl border-[2px] flex-row items-center transition-transform ${hasDrawn
                                ? "bg-[#22C55E] border-[#16A34A] active:scale-95"
                                : "bg-[#DCFCE7] border-[#86EFAC]"
                            }`}
                        style={{
                            shadowColor: hasDrawn ? "#16A34A" : "transparent",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: hasDrawn ? 1 : 0,
                            shadowRadius: 0,
                            elevation: hasDrawn ? 2 : 0,
                        }}
                    >
                        <Ionicons
                            name="star"
                            size={16}
                            color={hasDrawn ? "#FFFFFF" : "#16A34A"}
                            style={{ marginRight: 4, opacity: hasDrawn ? 1 : 0.6 }}
                        />
                        <Text
                            className={`font-fredoka-one text-xs sm:text-sm uppercase ${hasDrawn ? "text-white" : "text-[#16A34A] opacity-60"
                                }`}
                        >
                            I DID IT!
                        </Text>
                    </Pressable>
                </View>
            </View>

            {/* 2. MAIN DRAWING CANVAS (Maximized area for child handwriting) */}
            <View
                className="flex-1 w-full max-w-[540px] bg-white rounded-3xl border-[3px] border-[#BBE8FB] overflow-hidden relative mb-2"
                style={{
                    shadowColor: "#BBE8FB",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 3,
                }}
                onLayout={(e) => {
                    const { width, height } = e.nativeEvent.layout;
                    if (width > 0 && height > 0) {
                        setCanvasLayout({ width, height });
                    }
                }}
                {...panResponder.panHandlers}
            >
                {/* SVG Guidelines and Drawn Strokes */}
                <Svg pointerEvents="none" style={{ position: "absolute", width: "100%", height: "100%" }}>
                    {/* Primary Writing Guidelines */}
                    {/* 1. Headline (Top guide) */}
                    <Line
                        x1="16"
                        y1={guidelineTop}
                        x2={canvasLayout.width - 16}
                        y2={guidelineTop}
                        stroke="#CBD5E1"
                        strokeWidth="2"
                    />

                    {/* 2. Midline (Dashed center guide) */}
                    <Line
                        x1="16"
                        y1={guidelineMid}
                        x2={canvasLayout.width - 16}
                        y2={guidelineMid}
                        stroke="#94A3B8"
                        strokeWidth="2"
                        strokeDasharray="8, 8"
                    />

                    {/* 3. Baseline (Bottom guide) */}
                    <Line
                        x1="16"
                        y1={guidelineBase}
                        x2={canvasLayout.width - 16}
                        y2={guidelineBase}
                        stroke="#EF4444"
                        strokeWidth="2.5"
                        strokeOpacity="0.75"
                    />

                    {/* Completed Strokes */}
                    {completedStrokes.map((stroke, index) => (
                        <Path
                            key={`stroke-${index}`}
                            d={pointsToSvgPath(stroke)}
                            stroke="#2563EB"
                            strokeWidth={14}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                    ))}

                    {/* Current Active Stroke */}
                    {currentStroke.length > 0 && (
                        <Path
                            d={pointsToSvgPath(currentStroke)}
                            stroke="#2563EB"
                            strokeWidth={14}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                    )}
                </Svg>

                {/* Empty State Prompt Overlay */}
                {completedStrokes.length === 0 && currentStroke.length === 0 && (
                    <View
                        pointerEvents="none"
                        className="absolute inset-0 items-center justify-center opacity-30"
                    >
                        <Ionicons name="pencil" size={isTablet ? 48 : 36} color="#62A9E6" />
                        <Text className="font-fredoka-one text-sm sm:text-base text-[#62A9E6] mt-2">
                            Write {targetLetter} here
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
