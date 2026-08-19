import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface HeaderButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  borderColor?: string;
  shadowColor?: string;
  disabled?: boolean;
}

export function HeaderButton({
  onPress,
  icon,
  borderColor = '#BBE8FB',
  shadowColor = '#BBE8FB',
  disabled = false,
}: HeaderButtonProps) {
  const pressScale = useSharedValue(1);

  const handlePressIn = () => {
    if (disabled) return;
    pressScale.value = withTiming(0.95, {
      duration: 100,
      easing: Easing.out(Easing.ease),
    });
  };

  const handlePressOut = () => {
    pressScale.value = withTiming(1, {
      duration: 150,
      easing: Easing.out(Easing.ease),
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pressScale.value }],
    };
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        className="w-[44px] h-[44px] rounded-xl bg-white border-[2px] items-center justify-center"
        style={[
          {
            borderColor,
            shadowColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          },
          animatedStyle,
        ]}
      >
        {icon}
      </Animated.View>
    </Pressable>
  );
}
