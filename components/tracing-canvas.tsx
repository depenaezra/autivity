import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    useAnimatedProps,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { svgPathProperties } from "svg-path-properties";

type Point = {
    x: number;
    y: number;
};

type TracingCanvasProps = {
    path: string;
    checkpoints: Point[];
    start: Point;
    end: Point;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);
const SHOW_DEBUG_CHECKPOINTS = false;

export default function TracingCanvas({ path, checkpoints, start, end }: TracingCanvasProps) {
    const x = useSharedValue(start.x);
    const y = useSharedValue(start.y);
    const isTouchingLine = useSharedValue(false);
    const progress = useSharedValue(0);
    const currentCheckpoint = useSharedValue(0);
    const hasStarted = useSharedValue(false); // has the tracing activity actually started?
    const hasFinished = useSharedValue(false);
    const pathProperties = new svgPathProperties(path); // path as an object (not string)
    const totalLength = pathProperties.getTotalLength(); // length of the path in pixels

    const animatedPathProps = useAnimatedProps(() => {
        return {
            strokeDashoffset: totalLength * (1 - progress.value),
            // strokeDashoffset - slides the dash along the path
        };
    });

    useAnimatedReaction(
        () => hasFinished.value,
        (finished) => {
            if (finished) {
                // We'll connect this to React next.
            }
        }
    );

    const pan = Gesture.Pan().onUpdate((event) => {
        if (hasFinished.value) {
            return;
        }

        x.value = event.x;
        y.value = event.y;

        // If the finger is outside the start circle, do not start tracing
        const startDistance = Math.hypot(
            event.x - start.x,
            event.y - start.y
        );

        // If the user drags the finger outside the start circle, prevent the trace from starting.
        if (!hasStarted.value) {
            if (startDistance <= 20) {
                hasStarted.value = true;
            } else {
                return;
            }
        }

        // "Which checkpoint should the child reach next?"
        const nextCheckpoint = checkpoints[currentCheckpoint.value];

        if (!nextCheckpoint) {
            return;
        }

        const distance = Math.hypot( // Measure the distance (works for any direction)
            event.x - nextCheckpoint.x,
            event.y - nextCheckpoint.y
        );

        // Controls the tolerance for the checkpoint
        // Can consider 30 for children
        const checkpointRadius = 20;

        isTouchingLine.value = distance <= checkpointRadius;

        if (distance <= checkpointRadius) {
            currentCheckpoint.value += 1;

            progress.value =
                // Math.min = prevents progress from exceeding 100%
                Math.min(currentCheckpoint.value, checkpoints.length - 1) /
                (checkpoints.length - 1);

            if (currentCheckpoint.value >= checkpoints.length) {
                hasFinished.value = true;

                x.value = end.x;
                y.value = end.y;

                isTouchingLine.value = false;
            }
        }
    })
        .onEnd(() => {
            // lift finger = do nothing
            if (hasFinished.value) {
                return;
            }

            hasStarted.value = false;
            currentCheckpoint.value = 0;
            progress.value = 0;
            isTouchingLine.value = false;

            x.value = start.x;
            y.value = start.y;
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: x.value - 25 },
                { translateY: y.value - 25 },
            ],
            backgroundColor: isTouchingLine.value ? "#22C55E" : "#3B82F6",
        };
    });

    return (
        <GestureDetector gesture={pan}>
            <View
                style={{
                    flex: 1,
                    backgroundColor: "#E8F4FF",
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
                        d={path} // same path as the gray tracing path
                        stroke="#22C55E"
                        strokeWidth={10}
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={totalLength} // treats the whole path as one long dash, Length = 412.7 px
                        animatedProps={animatedPathProps}
                    />

                    {/* start circle */}
                    <Circle
                        cx={start.x}
                        cy={start.y}
                        r={14}
                        fill="#22C55E"
                    />

                    {/* end circle */}
                    <Circle
                        cx={end.x}
                        cy={end.y}
                        r={14}
                        fill="#EF4444"
                    />

                    {/* conditional rendering
                    syntax: condition && <Component /> */}
                    {/* if condition = true, render component */}
                    {SHOW_DEBUG_CHECKPOINTS &&
                        checkpoints.map((point, index) => (
                            <Circle
                                key={index}
                                cx={point.x}
                                cy={point.y}
                                r={4}
                                fill="#EF4444"
                            />
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