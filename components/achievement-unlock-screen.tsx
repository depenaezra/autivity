import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { playAchievementSound } from '@/src/utils/sound';
import {
    Dimensions,
    Pressable,
    Animated as RNAnimated,
    Text,
    View,
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface UnlockedBadge {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
}

interface AchievementUnlockScreenProps {
    visible: boolean;
    badges: UnlockedBadge[];
    onComplete: () => void;
    confettiEnabled?: boolean;
}

function FullScreenConfetti() {
    const particles = useRef(
        Array.from({ length: 35 }).map(() => ({
            yAnim: new RNAnimated.Value(-50),
            left: Math.random() * screenWidth,
            rotateAnim: new RNAnimated.Value(0),
            scaleAnim: new RNAnimated.Value(Math.random() * 0.6 + 0.5),
            color: ['#FCA5A5', '#FCD34D', '#86EFAC', '#93C5FD', '#C084FC', '#F472B6', '#FACC15'][
                Math.floor(Math.random() * 7)
            ],
            delay: Math.random() * 1000,
            shape: Math.random() > 0.5 ? 'circle' : 'square',
        }))
    ).current;

    // Confetti animation
    useEffect(() => {
        particles.forEach((p) => {
            RNAnimated.loop(
                RNAnimated.sequence([
                    RNAnimated.delay(p.delay),
                    RNAnimated.parallel([
                        RNAnimated.timing(p.yAnim, {
                            toValue: screenHeight + 60,
                            duration: Math.random() * 2500 + 2500,
                            useNativeDriver: true,
                        }),
                        RNAnimated.timing(p.rotateAnim, {
                            toValue: 360,
                            duration: Math.random() * 2500 + 2500,
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            ).start();
        });
    }, [particles]);

    return (

        // Confetti effect component
        <View className="absolute inset-0 pointer-events-none z-[9999]">
            {particles.map((p, idx) => (
                <RNAnimated.View
                    key={idx}
                    className="absolute w-3.5 h-3.5"
                    style={{
                        top: 0,
                        left: p.left,
                        borderRadius: p.shape === 'circle' ? 7 : 3,
                        backgroundColor: p.color,
                        transform: [
                            { translateY: p.yAnim },
                            {
                                rotate: p.rotateAnim.interpolate({
                                    inputRange: [0, 360],
                                    outputRange: ['0deg', '360deg'],
                                }),
                            },
                            { scale: p.scaleAnim },
                        ],
                    }}
                />
            ))}
        </View>
    );
}

// Background Rotating Rays Graphic
function RotatingSunburst() {
    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration: 30000, easing: Easing.linear }),
            -1,
            false
        );
    }, [rotation]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
        <Animated.View
            className="absolute items-center justify-center opacity-10"
            style={[
                {
                    width: screenWidth * 2,
                    height: screenWidth * 2,
                },
                animatedStyle,
            ]}
            pointerEvents="none"
        >
            {Array.from({ length: 12 }).map((_, i) => (
                <View
                    key={i}
                    className="absolute bg-[#FDE047] h-12"
                    style={{
                        width: screenWidth * 2,
                        transform: [{ rotate: `${i * 30}deg` }],
                    }}
                />
            ))}
        </Animated.View>
    );
}

export default function AchievementUnlockScreen({
    visible,
    badges,
    onComplete,
    confettiEnabled = true,
}: AchievementUnlockScreenProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Transition values
    const cardScale = useSharedValue(0.94);
    const cardOpacity = useSharedValue(0);
    const glowScale = useSharedValue(1);

    useEffect(() => {
        if (visible && badges.length > 0) {
            // Gentle, non-jarring scale-in and fade
            cardScale.value = 0.94;
            cardOpacity.value = 0;
            cardScale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
            cardOpacity.value = withTiming(1, { duration: 450 });

            // Soothing, subtle radial aura glow pulse
            glowScale.value = withRepeat(
                withSequence(
                    withTiming(1.08, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
                    withTiming(1.0, { duration: 1800, easing: Easing.inOut(Easing.quad) })
                ),
                -1,
                true
            );

            // Play achievement sound
            playAchievementSound();
        }
    }, [visible, currentIndex, badges.length]);

    const cardAnimatedStyle = useAnimatedStyle(() => ({
        opacity: cardOpacity.value,
        transform: [{ scale: cardScale.value }],
    }));

    const glowAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: glowScale.value }],
    }));

    if (!visible || badges.length === 0) return null;

    const currentBadge = badges[currentIndex] || badges[0];
    const isLast = currentIndex >= badges.length - 1;

    const handleNext = () => {
        if (isLast) {
            onComplete();
        } else {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    return (
        <View className="absolute inset-0 bg-[#F8FAFC] z-[10000] items-center justify-center">
            {/* Background Sunburst & Confetti */}
            <RotatingSunburst />
            {confettiEnabled && <FullScreenConfetti />}

            {/* Content Container */}
            <View className="items-center px-6 w-full max-w-[460px] z-10">
                {/* Header Banner */}
                <View className="bg-[#FEF9C3] border-[2px] border-[#FDE047] px-6 py-2.5 rounded-full mb-6 shadow-sm">
                    <Text className="font-fredoka-one text-[#A16207] text-base uppercase tracking-wider text-center">
                        🏆 NEW ACHIEVEMENT UNLOCKED! 🏆
                    </Text>
                </View>

                {/* Animated Badge Card */}
                <Animated.View
                    className="w-full bg-white rounded-[32px] p-8 items-center border-[3px] border-[#E5E7EB] border-b-[6px] shadow-xl"
                    style={[
                        {
                            borderColor: currentBadge.borderColor || '#FDE047',
                        },
                        cardAnimatedStyle,
                    ]}
                >
                    {/* Glowing Pulsing Aura behind Icon */}
                    <View className="relative items-center justify-center mb-6">
                        <Animated.View
                            className="absolute w-36 h-36 rounded-full opacity-30"
                            style={[
                                {
                                    backgroundColor: currentBadge.bgColor || '#FEF9C3',
                                },
                                glowAnimatedStyle,
                            ]}
                        />

                        {/* Main Badge Circle */}
                        <View
                            className="w-28 h-28 rounded-full border-[4px] items-center justify-center shadow-md"
                            style={{
                                backgroundColor: currentBadge.bgColor || '#FEF9C3',
                                borderColor: currentBadge.borderColor || '#FDE047',
                            }}
                        >
                            <Ionicons
                                name={(currentBadge.icon as any) || 'trophy'}
                                size={56}
                                color={currentBadge.color || '#EAB308'}
                            />
                        </View>
                    </View>

                    {/* Badge Title */}
                    <Text className="font-fredoka-one text-3xl text-[#374151] text-center mb-2">
                        {currentBadge.title}
                    </Text>

                    {/* Badge Description */}
                    <Text className="font-quicksand-semibold text-base text-[#6B7280] text-center mb-6 leading-6 px-2">
                        {currentBadge.description}
                    </Text>

                    {/* Multi-badge step indicator */}
                    {badges.length > 1 && (
                        <View className="bg-[#F3F4F6] border border-[#E5E7EB] px-4 py-1.5 rounded-full mb-4">
                            <Text className="font-quicksand-bold text-[#4B5563] text-xs">
                                Achievement {currentIndex + 1} of {badges.length}
                            </Text>
                        </View>
                    )}

                    {/* Continue Button */}
                    <Pressable
                        onPress={handleNext}
                        className="w-full h-14 bg-[#62A9E6] border-b-[5px] border-[#4895D6] rounded-full items-center justify-center mt-2 active:bg-[#5298D4]"
                    >
                        <Text className="font-fredoka-regular text-white text-xl">
                            {isLast ? 'AWESOME! CONTINUE' : 'NEXT ACHIEVEMENT ✨'}
                        </Text>
                    </Pressable>
                </Animated.View>
            </View>
        </View>
    );
}
