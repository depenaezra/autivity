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

import { Audio } from "expo-av";

import BubbleContent from "./bubble-content";

import { bubbleSounds } from "../utils/bubble-assets";
import { BubbleProps } from "../utils/types";

const bubblePopAnimation = require("../../../assets/animations/bubble-pop.json");

const playPopSound = async () => {
    try {
        const { sound } = await Audio.Sound.createAsync(
            bubbleSounds.pop,
            { shouldPlay: true }
        );
        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
                sound.unloadAsync();
            }
        });
    } catch (error) {
        // Ignore playback errors
    }
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
}: BubbleProps) {

    const [isPopped, setIsPopped] = useState(false);
    const lottieRef = useRef<LottieView>(null);
    const hasHandledRecycleRef = useRef(false);
    const hasHandledPopRef = useRef(false);
    const hasHandledFinishRef = useRef(false);

    // Deep clone Lottie JSON source so lottie-web mutations don't corrupt subsequent bubbles
    const lottieSource = useMemo(
        () => JSON.parse(JSON.stringify(bubblePopAnimation)),
        []
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

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    left: x,
                    top: translateY,
                    transform: scale ? [{ scale }] : undefined,
                },
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