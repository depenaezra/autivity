import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface CountingGuideProps {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  visible: boolean;
  label?: string;
}

export function CountingGuide({
  startX,
  startY,
  targetX,
  targetY,
  visible,
  label = 'Drag into basket!',
}: CountingGuideProps) {
  // Shared animation values
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible && startX > 0 && targetX > 0) {
      // Fade in
      opacity.value = withTiming(1, { duration: 400 });

      // Looping glide animation from start to target
      progress.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 200 }),
          withTiming(1, {
            duration: 1600,
            easing: Easing.inOut(Easing.cubic),
          }),
          withDelay(
            300,
            withTiming(0, {
              duration: 300,
            })
          )
        ),
        -1,
        false
      );
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      progress.value = 0;
    }
  }, [visible, startX, startY, targetX, targetY]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedHandStyle = useAnimatedStyle(() => {
    // Interpolate position along quadratic curve
    // Control point creates a pleasant natural arc
    const t = progress.value;
    const midX = (startX + targetX) / 2 + 30; // slight arc curve
    const midY = Math.min(startY, targetY) - 40;

    // Bezier quadratic interpolation: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
    const currentX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * targetX;
    const currentY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * targetY;

    // Scale down slightly at destination
    const scale = t > 0.85 ? 1 - (t - 0.85) * 1.5 : 1;
    const handOpacity = t > 0.9 ? 1 - (t - 0.9) * 10 : 1;

    return {
      transform: [
        { translateX: currentX - 18 },
        { translateY: currentY - 18 },
        { scale },
      ],
      opacity: Math.max(0, handOpacity),
    };
  });

  if (!visible || startX <= 0 || targetX <= 0) return null;

  // Bezier curve path string
  const midX = (startX + targetX) / 2 + 30;
  const midY = Math.min(startY, targetY) - 40;
  const pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${targetX} ${targetY}`;

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, styles.container, animatedContainerStyle]}
    >
      {/* Dashed Guide Path Line */}
      <Svg style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {/* Glow backdrop */}
        <Path
          d={pathD}
          stroke="#BAE6FD"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="8, 8"
          fill="none"
          opacity={0.8}
        />
        {/* Crisp dashed line */}
        <Path
          d={pathD}
          stroke="#0284C7"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="8, 8"
          fill="none"
        />
        {/* Start item pulsing highlight indicator */}
        <Circle cx={startX} cy={startY} r="8" fill="#0284C7" />
        <Circle cx={startX} cy={startY} r="16" stroke="#38BDF8" strokeWidth="2.5" fill="none" opacity={0.6} />
        {/* Basket destination target indicator */}
        <Circle cx={targetX} cy={targetY} r="10" fill="#22C55E" />
        <Circle cx={targetX} cy={targetY} r="20" stroke="#86EFAC" strokeWidth="2.5" fill="none" opacity={0.7} />
      </Svg>

      {/* Floating Animated Hand Pointer */}
      <Animated.View style={[styles.handContainer, animatedHandStyle]}>
        <View style={styles.handCircle}>
          <Ionicons name="hand-right" size={28} color="#0284C7" />
        </View>
        <View style={styles.hintPill}>
          <Text style={styles.hintText}>{label}</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 999,
  },
  handContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#0284C7',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
  },
  hintPill: {
    marginTop: 4,
    backgroundColor: '#0369A1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'FredokaOne_400Regular',
    fontWeight: 'bold',
  },
});
