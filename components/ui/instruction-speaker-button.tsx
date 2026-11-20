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
    language?: 'en' | 'tl';
    className?: string;
    onSpeechComplete?: () => void;
    replayKey?: number;
    enabled?: boolean;
    onToggleEnabled?: (enabled: boolean) => void;
}

export default function InstructionSpeakerButton({
    text,
    size,
    iconSize,
    color = '#62A9E6',
    autoPlay = true,
    language = 'en',
    className = '',
    onSpeechComplete,
    replayKey,
    enabled = true,
    onToggleEnabled,
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

    const playSpeech = async (textToSpeak: string) => {
        if (!textToSpeak) return;

        setIsPlaying(true);
        startPulseAnimation();

        await speakInstruction(textToSpeak, {
            langMode: language,
            onDone: () => {
                setIsPlaying(false);
                stopPulseAnimation();
                onSpeechComplete?.();
            },
            onError: () => {
                setIsPlaying(false);
                stopPulseAnimation();
                onSpeechComplete?.();
            },
        });
    };

    const handlePress = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        } catch {}

        if (!enabled) {
            onToggleEnabled?.(true);
        } else {
            await stopSpeech();
            setIsPlaying(false);
            stopPulseAnimation();
            onToggleEnabled?.(false);
        }
    };

    // Automatically read instructions/mistake feedback when text updates
    useEffect(() => {
        if (enabled && autoPlay && text) {
            playSpeech(text);
        }
    }, [text, autoPlay, replayKey, enabled]);

    // Clean up speech when component unmounts
    useEffect(() => {
        return () => {
            stopSpeech().catch(() => {});
        };
    }, []);

    return (
        <Animated.View style={animatedStyle}>
            <Pressable
                onPress={handlePress}
                className={`bg-white border-[2px] rounded-xl items-center justify-center active:scale-95 transition-transform ${className}`}
                style={{
                    width: buttonSize,
                    height: buttonSize,
                    borderColor: enabled ? '#BBE8FB' : '#9CA3AF',
                    shadowColor: enabled ? '#BBE8FB' : '#9CA3AF',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 2,
                }}
                accessibilityLabel={enabled ? 'Turn off spoken instructions' : 'Turn on spoken instructions'}
                accessibilityRole="button"
            >
                <Feather
                    name={enabled ? 'volume-2' : 'volume-x'}
                    size={iconSiz}
                    color={enabled ? color : '#9CA3AF'}
                />
            </Pressable>
        </Animated.View>
    );
}
