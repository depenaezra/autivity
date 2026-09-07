import { useState, useRef, useEffect, useMemo } from "react";
import { Image, useWindowDimensions, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
    Easing,
    runOnJS,
    useAnimatedProps,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from "react-native-reanimated";
import Svg, { Circle, Path, G } from "react-native-svg";
import { svgPathProperties } from "svg-path-properties";
import { BOUNDARY_RADIUS, useTracing } from "../hooks/useTracing";
import type { TracingActivityData } from "../types";
import { buildTracingData } from "../utils/buildTracingData";
import { playCorrectSound } from "@/src/utils/sound";

const TRACING_GUIDING_MESSAGES = [
    "Stay on the line! Keep going smoothly!",
    "Almost there! Follow the dotted path from start to end!",
    "Nice try! Try tracing slowly without lifting your finger!",
    "Keep your finger on the line and follow the path!",
];

type TracingActivityProps = {
    activity: TracingActivityData;
    onComplete?: (score: number, timeSpent: number, mistakes: number, hintsUsed?: number) => void;
    onFeedback?: (message: string) => void;
    onIncorrectAttempt?: () => void;
    hintSignal?: number;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);
const SHOW_DEBUG_CHECKPOINTS = false;

type TracingActivityContentProps = {
    path: string;
    onComplete?: () => void;
    onIncorrectAttempt?: () => void;
    isHintActive?: boolean;
    hintLevel?: number;
};

function TracingActivityContent({
    path,
    onComplete,
    onIncorrectAttempt,
    isHintActive = false,
    hintLevel = 1,
}: TracingActivityContentProps) {
    const {
        checkpoints,
        start,
        end,
        totalLength,
    } = buildTracingData(path);

    const tracing = useTracing(start, end, checkpoints, onIncorrectAttempt, onIncorrectAttempt);

    const isHintActiveAny = Boolean(isHintActive);
    const isStartHighlighted = Boolean(isHintActive && hintLevel === 2);

    // Continuous forward animation for the white dashed path (only when hint is active)
    const dashProgress = useSharedValue(0);

    useEffect(() => {
        if (isHintActiveAny) {
            dashProgress.value = withRepeat(
                withTiming(-20, { duration: 750, easing: Easing.linear }),
                -1,
                false
            );
        } else {
            dashProgress.value = 0;
        }
    }, [isHintActiveAny, dashProgress]);

    const animatedDashedProps = useAnimatedProps(() => {
        return {
            strokeDashoffset: dashProgress.value,
        };
    });

    // Marching Gold Arrows for Level 2 Hint
    const [arrowOffset, setArrowOffset] = useState(0);

    useEffect(() => {
        if (!isStartHighlighted) {
            setArrowOffset(0);
            return;
        }

        const interval = setInterval(() => {
            setArrowOffset((prev) => (prev + 2.5) % 40);
        }, 40);

        return () => clearInterval(interval);
    }, [isStartHighlighted]);

    const marchingArrows = useMemo(() => {
        if (!isStartHighlighted) return [];
        try {
            const properties = new svgPathProperties(path);
            const totalLen = properties.getTotalLength();
            if (totalLen < 20) return [];

            const step = Math.max(35, totalLen / 5);
            const arrows: { x: number; y: number; angle: number }[] = [];

            for (let d = arrowOffset; d < totalLen - 8; d += step) {
                if (d < 8) continue;
                const pt = properties.getPointAtLength(d);
                const tan = properties.getTangentAtLength(d);
                const angle = Math.atan2(tan.y, tan.x) * (180 / Math.PI);
                arrows.push({ x: pt.x, y: pt.y, angle });
            }

            return arrows;
        } catch {
            return [];
        }
    }, [path, isStartHighlighted, arrowOffset]);

    const animatedPathProps = useAnimatedProps(() => {
        return {
            strokeDashoffset: totalLength * (1 - tracing.progress.value),
        };
    });

    useAnimatedReaction(
        () => tracing.hasFinished.value,
        (finished, previous) => {
            if (finished && !previous && onComplete) {
                runOnJS(onComplete)();
            }
        }
    );

    const animatedStyle = useAnimatedStyle(() => {
        const size = 50;
        return {
            transform: [
                { translateX: tracing.x.value - 0.088 * size },
                { translateY: tracing.y.value - 0.908 * size },
            ],
        };
    });

    return (
        <GestureDetector gesture={tracing.gesture}>
            <View
                style={{
                    flex: 1,
                    // 1. Made this transparent so the background layer shows through!
                    backgroundColor: "transparent",
                }}
            >
                <Svg
                    style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                    }}
                >
                    {/* gray tracing path */}
                    <Path
                        d={path}
                        stroke="#A0A0A0"
                        strokeWidth={14}
                        strokeLinecap="round"
                        fill="none"
                    />

                    {/* animated flowing white dashed line showing tracing direction */}
                    <AnimatedPath
                        d={path}
                        stroke="#FFFFFF"
                        strokeWidth={3}
                        strokeDasharray="8, 10"
                        strokeLinecap="round"
                        fill="none"
                        animatedProps={animatedDashedProps}
                    />

                    {/* active/completed path */}
                    <AnimatedPath
                        d={path}
                        stroke="#62A9E6"
                        strokeWidth={14}
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={totalLength}
                        animatedProps={animatedPathProps}
                    />

                    {/* Level 2 Visual Hint Guidance Arrows (Marching with line when hint is active) */}
                    {isStartHighlighted &&
                        marchingArrows.map((arrow, idx) => (
                            <G key={idx} transform={`translate(${arrow.x}, ${arrow.y}) rotate(${arrow.angle})`}>
                                {/* Glowing halo backdrop */}
                                <Path
                                    d="M -11 -9 L 11 0 L -11 9 Z"
                                    fill="#FFAE02"
                                    opacity={0.6}
                                />
                                {/* Arrow Head */}
                                <Path
                                    d="M -8 -7 L 8 0 L -8 7 Z"
                                    fill="#FFAE02"
                                    stroke="#FFFFFF"
                                    strokeWidth={2}
                                />
                            </G>
                        ))}

                    {/* level 2 hint glowing outer ring for start circle */}
                    {isStartHighlighted && (
                        <Circle cx={start.x} cy={start.y} r={22} fill="none" stroke="#FFAE02" strokeWidth={5} />
                    )}

                    {/* start circle */}
                    <Circle cx={start.x} cy={start.y} r={14} fill={isStartHighlighted ? "#FFAE02" : "#22C55E"} />

                    {/* end circle */}
                    <Circle cx={end.x} cy={end.y} r={14} fill="#EF4444" />

                    {SHOW_DEBUG_CHECKPOINTS &&
                        checkpoints.map((point, index) => (
                            <Circle key={index} cx={point.x} cy={point.y} r={4} fill="#EF4444" />
                        ))}
                </Svg>

                <Animated.View
                    style={[
                        {
                            position: "absolute",
                            width: 50,
                            height: 50,
                        },
                        animatedStyle,
                    ]}
                >
                    <Image
                        source={require("../../../assets/images/pencil.png")}
                        style={{
                            width: 50,
                            height: 50,
                            resizeMode: "contain",
                        }}
                    />
                </Animated.View>
            </View>
        </GestureDetector>
    );
}

import { useActivityHint } from "@/hooks/use-activity-hint";

export default function TracingActivity({
    activity,
    onComplete,
    onFeedback,
    onIncorrectAttempt,
    hintSignal,
}: TracingActivityProps) {
    const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
    const mistakesRef = useRef(0);
    const startTimeRef = useRef(Date.now());
    const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastMessageIndexRef = useRef<number>(-1);

    const { isHintActive, hintLevel, hintsUsed, triggerHint, recordAttempt, resetForNextQuestion } = useActivityHint({
        getClueText: () => {
            return "Clue: Start at the green circle and trace along the dotted line all the way to the red circle!";
        },
        onFeedback,
    });

    // Listen to manual hint button from top header
    const lastHintSignalRef = useRef(hintSignal);
    useEffect(() => {
        if (hintSignal !== undefined && hintSignal !== lastHintSignalRef.current) {
            lastHintSignalRef.current = hintSignal;
            triggerHint();
        }
    }, [hintSignal, triggerHint]);

    // Grab the device screen size
    const { width, height } = useWindowDimensions();

    const getNextTracingMessage = () => {
        let nextIdx = Math.floor(Math.random() * TRACING_GUIDING_MESSAGES.length);
        if (nextIdx === lastMessageIndexRef.current) {
            nextIdx = (nextIdx + 1) % TRACING_GUIDING_MESSAGES.length;
        }
        lastMessageIndexRef.current = nextIdx;
        return TRACING_GUIDING_MESSAGES[nextIdx];
    };

    if (!activity || !activity.paths || activity.paths.length === 0) {
        return null;
    }

    const currentPath = activity.paths[currentStrokeIndex];

    const handleIncorrectAttempt = () => {
        mistakesRef.current += 1;
        const hintTriggered = recordAttempt(false);
        onIncorrectAttempt?.();

        if (feedbackTimeoutRef.current) {
            clearTimeout(feedbackTimeoutRef.current);
        }

        if (!hintTriggered) {
            onFeedback?.(getNextTracingMessage());

            feedbackTimeoutRef.current = setTimeout(() => {
                onFeedback?.("Let's trace along the dotted line!");
            }, 3500);
        }
    };

    const handleStrokeComplete = () => {
        playCorrectSound();
        recordAttempt(true);
        onFeedback?.("Let's trace along the dotted line!");

        if (currentStrokeIndex < activity.paths.length - 1) {
            setCurrentStrokeIndex((prev) => prev + 1);
            resetForNextQuestion();
        } else {
            if (onComplete) {
                const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
                const score = 15; // Each completed tracing activity awards 15 stars
                onComplete(score, duration, mistakesRef.current, hintsUsed);
            }
        }
    };

    // 3. Calculate how much to zoom in/out (Leaves 80px of padding so it never touches the edges)
    const shortestScreenSide = Math.min(width, height);
    const scaleFactor = (shortestScreenSide - 80) / 400;

    return (
        // 4. Center everything in the middle of the screen
        <View style={{ flex: 1, backgroundColor: "#E8F4FF", justifyContent: "center", alignItems: "center" }}>

            {/* 5. The Responsive "Drawing Board" */}
            <View style={{
                width: 400,
                height: 400,
                transform: [{ scale: scaleFactor }] // This makes it massive on iPad, standard on iPhone!
            }}>

                {/* THE BACKGROUND LAYER */}
                <Svg style={{ position: "absolute", width: "100%", height: "100%" }}>
                    {activity.paths.map((path, index) => {
                        if (index === currentStrokeIndex) return null;
                        const isCompleted = index < currentStrokeIndex;
                        return (
                            <Path
                                key={index}
                                d={path}
                                stroke={isCompleted ? "#62A9E6" : "#A0A0A0"}
                                strokeWidth={14}
                                strokeLinecap="round"
                                fill="none"
                            />
                        );
                    })}
                </Svg>

                {/* THE ENGINE LAYER */}
                <TracingActivityContent
                    key={currentStrokeIndex}
                    path={currentPath}
                    onComplete={handleStrokeComplete}
                    onIncorrectAttempt={handleIncorrectAttempt}
                    isHintActive={isHintActive}
                    hintLevel={hintLevel}
                />

            </View>
        </View>
    );
}