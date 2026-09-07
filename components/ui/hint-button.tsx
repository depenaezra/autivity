import React from 'react';
import { Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface HintButtonProps {
    onPress: () => void;
    size?: number;
    iconSize?: number;
    isHintActive?: boolean;
    className?: string;
}

export default function HintButton({
    onPress,
    size,
    iconSize,
    isHintActive = false,
    className = '',
}: HintButtonProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const buttonSize = size || (isTablet ? 44 : 36);
    const iconSiz = iconSize || (isTablet ? 22 : 18);

    const scaleAnim = useSharedValue(1);

    React.useEffect(() => {
        if (isHintActive) {
            scaleAnim.value = withRepeat(
                withSequence(
                    withTiming(1.12, { duration: 500 }),
                    withTiming(1.0, { duration: 500 })
                ),
                -1,
                true
            );
        } else {
            scaleAnim.value = withTiming(1.0, { duration: 200 });
        }
    }, [isHintActive]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scaleAnim.value }],
    }));

    const handlePress = () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        } catch {}
        onPress();
    };

    return (
        <Animated.View style={animatedStyle}>
            <Pressable
                onPress={handlePress}
                className={`bg-white border-[2px] border-[#FFF3C4] rounded-xl items-center justify-center active:scale-95 transition-transform ${className}`}
                style={{
                    width: buttonSize,
                    height: buttonSize,
                    shadowColor: '#FFAE02',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 2,
                }}
                accessibilityLabel="Get hint"
                accessibilityRole="button"
            >
                <Ionicons
                    name={isHintActive ? 'bulb' : 'bulb-outline'}
                    size={iconSiz}
                    color="#FFAE02"
                />
            </Pressable>
        </Animated.View>
    );
}
