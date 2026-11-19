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

import { playBubblePopSound } from "@/src/utils/sound";
import BubbleContent from "./bubble-content";

import { BubbleProps } from "../utils/types";

const bubblePopAnimation = require("../../../assets/animations/bubble-pop.json");

const playPopSound = () => {
    playBubblePopSound();
};

export default function Bubble({
    x,
    y,
    speed,
    scale,
    content,
    onPop,
    onPopFinished,
    onRecycle,
    isHighlighted = false,
    containerHeight,
}: BubbleProps) {

    const [isPopped, setIsPopped] = useState(false);
    const lottieRef = useRef<LottieView>(null);
    const hasHandledRecycleRef = useRef(false);
    const hasHandledPopRef = useRef(false);
    const hasHandledFinishRef = useRef(false);

    // Deep clone Lottie JSON source so lottie-web mutations don't corrupt subsequent bubbles
    const lottieSource = useMemo(
        () => (isPopped ? JSON.parse(JSON.stringify(bubblePopAnimation)) : null),
        [isPopped]
    );

    const translateY = useSharedValue(y);

    const triggerRecycle = () => {
        if (hasHandledRecycleRef.current || hasHandledPopRef.current) return;
        hasHandledRecycleRef.current = true;
        onRecycle();
    };

    const triggerUserPop = () => {
        if (hasHandledPopRef.current) return;
        hasHandledPopRef.current = true;
        onPop();
    };

    const triggerPopFinished = () => {
        if (hasHandledFinishRef.current) return;
        hasHandledFinishRef.current = true;
        onPopFinished?.();
    };

    useEffect(() => {
        const screenHeight = containerHeight && containerHeight > 0 ? containerHeight : Dimensions.get("window").height;
        const targetY = -120;
        const totalDistance = screenHeight + 130;
        const distance = y - targetY;
        const duration = Math.max(800, Math.round((distance / totalDistance) * speed));

        translateY.value = withTiming(
            targetY,
            {
                duration,
                easing: Easing.linear,
            },
            (finished) => {
                if (finished && !hasHandledRecycleRef.current && !hasHandledPopRef.current) {
                    runOnJS(triggerRecycle)();
                }
            }
        );
    }, []);



    const handleTap = () => {
        if (isPopped || hasHandledPopRef.current || hasHandledRecycleRef.current) return;
        cancelAnimation(translateY);
        setIsPopped(true);
        playPopSound();
        triggerUserPop();
    };

    useEffect(() => {
        if (isPopped) {
            lottieRef.current?.play();

            // Safety fallback timer matching full 40 frame (~1333ms) animation duration + buffer
            const timer = setTimeout(() => {
                triggerPopFinished();
            }, 1400);

            return () => clearTimeout(timer);
        }
    }, [isPopped]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: translateY.value },
                ...(scale ? [{ scale }] : []),
            ],
        };
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    left: x,

                },
                animatedStyle,
            ]}
        >
            <Pressable
                disabled={isPopped}
                onPress={handleTap}
                style={[
                    styles.pressable,
                    isHighlighted && !isPopped && {
                        borderRadius: 50,
                        borderWidth: 4,
                        borderColor: '#FFAE02',
                        shadowColor: '#FFAE02',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.8,
                        shadowRadius: 10,
                        elevation: 6,
                    }
                ]}
            >
                {!isPopped && (
                    <BubbleContent
                        content={content}
                    />
                )}

                {isPopped && lottieSource && (
                    <LottieView
                        ref={lottieRef}
                        source={lottieSource}
                        autoPlay={false}
                        loop={false}
                        resizeMode="cover"
                        style={styles.lottie}
                        onAnimationFinish={(isCancelled) => {
                            if (!isCancelled) {
                                triggerPopFinished();
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
        top: 0,
        left: 0,
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
