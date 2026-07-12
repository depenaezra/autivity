import { useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedProps,
    useAnimatedReaction,
    useAnimatedStyle
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { useTracing } from "../hooks/useTracing";
import type { TracingActivityData } from "../types";
import { buildTracingData } from "../utils/buildTracingData";

type TracingActivityProps = {
    activity: TracingActivityData;
    onComplete?: () => void;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);
const SHOW_DEBUG_CHECKPOINTS = false;

type TracingActivityContentProps = {
    path: string;
    onComplete?: () => void;
};

function TracingActivityContent({
    path,
    onComplete,
}: TracingActivityContentProps) {
    const {
        checkpoints,
        start,
        end,
        totalLength,
    } = buildTracingData(path);

    const tracing = useTracing(start, end, checkpoints);

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
        return {
            transform: [
                { translateX: tracing.x.value - 25 },
                { translateY: tracing.y.value - 25 },
            ],
            backgroundColor: tracing.isTouchingLine.value ? "#22C55E" : "#3B82F6",
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
                        strokeWidth={10}
                        strokeLinecap="round"
                        fill="none"
                    />

                    <AnimatedPath
                        d={path}
                        stroke="#22C55E"
                        strokeWidth={10}
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={totalLength}
                        animatedProps={animatedPathProps}
                    />

                    {/* start circle */}
                    <Circle cx={start.x} cy={start.y} r={14} fill="#22C55E" />

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
                            borderRadius: 25,
                        },
                        animatedStyle,
                    ]}
                />
            </View>
        </GestureDetector>
    );
}

export default function TracingActivity({
    activity,
    onComplete,
}: TracingActivityProps) {
    const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);

    // 2. Grab the device screen size
    const { width, height } = useWindowDimensions();

    if (!activity || !activity.paths || activity.paths.length === 0) {
        return null;
    }

    const currentPath = activity.paths[currentStrokeIndex];

    const handleStrokeComplete = () => {
        if (currentStrokeIndex < activity.paths.length - 1) {
            setCurrentStrokeIndex((prev) => prev + 1);
        } else {
            if (onComplete) {
                onComplete();
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
                                stroke={isCompleted ? "#22C55E" : "#A0A0A0"}
                                strokeWidth={10}
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
                />

            </View>
        </View>
    );
}