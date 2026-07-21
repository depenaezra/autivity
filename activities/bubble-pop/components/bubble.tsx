import { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet } from "react-native";

import LottieView from "lottie-react-native";

import Animated, {
    cancelAnimation,
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

import BubbleContent from "./bubble-content";

import { BubbleProps } from "../utils/types";

const bubblePopAnimation = require("../../../assets/animations/bubble-pop.json");

export default function Bubble({
    x,
    y,
    speed,
    scale,
    content,
    onPop,
    onRecycle,
}: BubbleProps) {

    const [isPopped, setIsPopped] = useState(false);
    const lottieRef = useRef<LottieView>(null);
    const hasHandledRef = useRef(false);

    // Deep clone Lottie JSON source so lottie-web mutations don't corrupt subsequent bubbles
    const lottieSource = useMemo(
        () => JSON.parse(JSON.stringify(bubblePopAnimation)),
        []
    );

    const translateY = useSharedValue(y);

    const triggerRecycle = () => {
        if (hasHandledRef.current) return;
        hasHandledRef.current = true;
        onRecycle();
    };

    const triggerUserPop = () => {
        if (hasHandledRef.current) return;
        hasHandledRef.current = true;
        onPop();
    };

    useEffect(() => {
        const screenHeight = Dimensions.get("window").height;
        const totalDistance = screenHeight + 250; // Distance from bottom (screenHeight+50) to -200
        const distance = y - (-200); // Remaining distance for this bubble
        const duration = Math.max(1000, Math.round((distance / totalDistance) * speed));

        translateY.value = withTiming(
            -200,
            {
                duration,
                easing: Easing.linear,
            },
            (finished) => {
                if (finished && !hasHandledRef.current) {
                    runOnJS(triggerRecycle)();
                }
            }
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        top: translateY.value,
    }));

    const handleTap = () => {
        if (isPopped || hasHandledRef.current) return;
        cancelAnimation(translateY);
        setIsPopped(true);
    };

    useEffect(() => {
        if (isPopped) {
            lottieRef.current?.play();

            // Safety fallback timer matching full 40 frame (~1333ms) animation duration + buffer
            const timer = setTimeout(() => {
                triggerUserPop();
            }, 1400);

            return () => clearTimeout(timer);
        }
    }, [isPopped]);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    left: x,
                    transform: scale ? [{ scale }] : undefined,
                },
                animatedStyle,
            ]}
        >
            <Pressable
                disabled={isPopped}
                onPress={handleTap}
                style={styles.pressable}
            >
                {!isPopped && (
                    <BubbleContent
                        content={content}
                    />
                )}

                {isPopped && (
                    <LottieView
                        ref={lottieRef}
                        source={lottieSource}
                        autoPlay={false}
                        loop={false}
                        resizeMode="cover"
                        style={styles.lottie}
                        onAnimationFinish={(isCancelled) => {
                            if (!isCancelled) {
                                triggerUserPop();
                            }
                        }}
                    />
                )}
            </Pressable>
        </Animated.View>
    );
}


const styles = StyleSheet.create({

    container: {
        position: "absolute",
    },

    pressable: {
        width: 100,
        height: 100,
    },

    lottie: {
        position: "absolute",
        width: 180,
        height: 180,
        left: -40,
        top: -40,
    },

});