import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AnimatedPointerProps {
  startX?: number;
  startY?: number;
  targetX?: number;
  targetY?: number;
  onTap?: () => void;
  color?: string;
  size?: number;
}

export function AnimatedPointer({
  startX = 30,
  startY = 60,
  targetX = 140,
  targetY = 110,
  onTap,
  color = '#484A4B',
  size = 32,
}: AnimatedPointerProps) {
  const posX = useSharedValue(startX);
  const posY = useSharedValue(startY);
  const scale = useSharedValue(1);
  const rippleScale = useSharedValue(0.5);
  const rippleOpacity = useSharedValue(0);

  useEffect(() => {
    posX.value = startX;
    posY.value = startY;

    // Looping sequence:
    // 1. Hover/Glide to target (700ms)
    // 2. Press down (scale 0.8) (250ms)
    // 3. Ripple expands & fades (300ms)
    // 4. Release (scale 1.0) (250ms)
    // 5. Rest at target (1000ms)
    // 6. Return to start (600ms)
    // 7. Pause before restart (500ms)

    posX.value = withRepeat(
      withSequence(
        withTiming(targetX, { duration: 800, easing: Easing.out(Easing.cubic) }),
        withDelay(1800, withTiming(startX, { duration: 600, easing: Easing.inOut(Easing.quad) })),
        withDelay(400, withTiming(startX, { duration: 0 }))
      ),
      -1,
      false
    );

    posY.value = withRepeat(
      withSequence(
        withTiming(targetY, { duration: 800, easing: Easing.out(Easing.cubic) }),
        withDelay(1800, withTiming(startY, { duration: 600, easing: Easing.inOut(Easing.quad) })),
        withDelay(400, withTiming(startY, { duration: 0 }))
      ),
      -1,
      false
    );

    scale.value = withRepeat(
      withSequence(
        withDelay(850, withTiming(0.8, { duration: 180, easing: Easing.quad })),
        withTiming(1, { duration: 220, easing: Easing.out(Easing.back(1.5)) }),
        withDelay(2350, withTiming(1, { duration: 0 }))
      ),
      -1,
      false
    );

    rippleScale.value = withRepeat(
      withSequence(
        withDelay(900, withTiming(1.8, { duration: 400, easing: Easing.out(Easing.cubic) })),
        withTiming(0.5, { duration: 0 }),
        withDelay(2300, withTiming(0.5, { duration: 0 }))
      ),
      -1,
      false
    );

    rippleOpacity.value = withRepeat(
      withSequence(
        withDelay(900, withTiming(0.5, { duration: 100 })),
        withTiming(0, { duration: 300 }),
        withDelay(2300, withTiming(0, { duration: 0 }))
      ),
      -1,
      false
    );
  }, [startX, startY, targetX, targetY]);

  const pointerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: posX.value },
      { translateY: posY.value },
      { scale: scale.value },
    ],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: posX.value + 6 },
      { translateY: posY.value + 6 },
      { scale: rippleScale.value },
    ],
    opacity: rippleOpacity.value,
  }));

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Tap Ripple Effect */}
      <Animated.View
        style={[
          styles.ripple,
          rippleStyle,
          { borderColor: '#62A9E6' },
        ]}
      />

      {/* Hand Pointer */}
      <Animated.View style={[styles.pointerContainer, pointerStyle]}>
        <View style={styles.shadowWrapper}>
          <MaterialCommunityIcons
            name="gesture-tap"
            size={size}
            color="#2D3748"
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  pointerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 99,
  },
  shadowWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  ripple: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: '#BBE8FB40',
    zIndex: 98,
  },
});
