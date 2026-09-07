import React, { useEffect, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { speakInstruction, stopSpeech } from '@/src/utils/speech';

interface InstructionSpeakerButtonProps {
    text: string;
    size?: number;
    iconSize?: number;
    color?: string;
    autoPlay?: boolean;
    className?: string;
}

export default function InstructionSpeakerButton({
    text,
    size,
    iconSize,
    color = '#62A9E6',
    autoPlay = false,
    className = '',
}: InstructionSpeakerButtonProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const buttonSize = size || (isTablet ? 48 : 40);
    const iconSiz = iconSize || (isTablet ? 24 : 20);

    const [isPlaying, setIsPlaying] = useState(false);
    const scaleAnim = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scaleAnim.value }],
    }));

    const startPulseAnimation = () => {
        scaleAnim.value = withRepeat(
            withSequence(
                withTiming(1.12, { duration: 400 }),
                withTiming(1.0, { duration: 400 })
            ),
            -1,
            true
        );
    };

    const stopPulseAnimation = () => {
        scaleAnim.value = withTiming(1.0, { duration: 200 });
    };

    const handleSpeak = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        } catch {}

        if (isPlaying) {
            await stopSpeech();
            setIsPlaying(false);
            stopPulseAnimation();
            return;
        }

        if (!text) return;

        setIsPlaying(true);
        startPulseAnimation();

        await speakInstruction(text, {
            onDone: () => {
                setIsPlaying(false);
                stopPulseAnimation();
            },
            onError: () => {
                setIsPlaying(false);
                stopPulseAnimation();
            },
        });
    };

    // Optional autoplay when text changes if enabled
    useEffect(() => {
        if (autoPlay && text) {
            handleSpeak();
        }

        return () => {
            stopSpeech().catch(() => {});
        };
    }, [text]);

    return (
        <Animated.View style={animatedStyle}>
            <Pressable
                onPress={handleSpeak}
                className={`bg-white border-[2px] border-[#BBE8FB] rounded-xl items-center justify-center active:scale-95 transition-transform ${className}`}
                style={{
                    width: buttonSize,
                    height: buttonSize,
                    shadowColor: '#BBE8FB',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 2,
                }}
                accessibilityLabel="Listen to instruction"
                accessibilityRole="button"
            >
                <Feather
                    name={isPlaying ? 'volume-x' : 'volume-2'}
                    size={iconSiz}
                    color={isPlaying ? '#3B82F6' : color}
                />
            </Pressable>
        </Animated.View>
    );
}
