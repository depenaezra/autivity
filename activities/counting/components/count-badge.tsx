import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

interface CountBadgeProps {
  number: number;
  size?: number;
  fontSize?: number;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
}

export function CountBadge({
  number,
  size = 28,
  fontSize = 15,
  bgColor = '#3B82F6',
  borderColor = '#FFFFFF',
  textColor = '#FFFFFF',
}: CountBadgeProps) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 200 }),
      withSpring(1.0, { damping: 12, stiffness: 180 })
    );
  }, [number]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
          borderColor: borderColor,
        },
        animatedStyle,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize,
            color: textColor,
          },
        ]}
      >
        {number}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 10,
  },
  text: {
    fontFamily: 'FredokaOne_400Regular',
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
