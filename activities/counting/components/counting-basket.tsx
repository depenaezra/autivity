import React, { useEffect, useRef } from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, {
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Feather, Ionicons } from '@expo/vector-icons';
import { PlacedCountingItem } from '../types';
import { CountingItemAsset } from '../utils/counting-assets';
import { CountBadge } from './count-badge';

interface CountingBasketProps {
  targetCount: number;
  currentCount: number;
  placedItems: PlacedCountingItem[];
  isTargetReached: boolean;
  onBasketLayout?: (layout: { x: number; y: number; width: number; height: number; pageX: number; pageY: number }) => void;
  basketRef?: React.RefObject<View | null>;
}

export function CountingBasket({
  targetCount,
  currentCount,
  placedItems,
  isTargetReached,
  onBasketLayout,
  basketRef,
}: CountingBasketProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Basket dimensions
  const basketWidth = isTablet ? 320 : 250;
  const basketHeight = isTablet ? 210 : 165;
  const itemSize = isTablet ? 60 : 48;

  // Bounce animation when an item drops in
  const bounceScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const counterPillScale = useSharedValue(1);

  const prevCountRef = useRef(currentCount);

  useEffect(() => {
    if (currentCount > prevCountRef.current) {
      // Bounce reaction on successful item drop
      bounceScale.value = withSequence(
        withSpring(1.08, { damping: 6, stiffness: 250 }),
        withSpring(1.0, { damping: 10, stiffness: 200 })
      );
      // Punchy bounce on the counter pill below
      counterPillScale.value = withSequence(
        withSpring(1.18, { damping: 6, stiffness: 280 }),
        withSpring(1.0, { damping: 10, stiffness: 200 })
      );
    }
    prevCountRef.current = currentCount;
  }, [currentCount]);

  useEffect(() => {
    if (isTargetReached) {
      glowOpacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.6, { duration: 400 }),
        withTiming(1, { duration: 300 })
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isTargetReached]);

  const animatedBasketStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounceScale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const animatedCounterPillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: counterPillScale.value }],
  }));

  const handleLayout = (e: LayoutChangeEvent) => {
    const layout = e.nativeEvent.layout;
    if (layout && layout.width > 0 && layout.height > 0) {
      onBasketLayout?.({
        x: layout.x,
        y: layout.y,
        width: layout.width,
        height: layout.height,
        pageX: layout.x,
        pageY: layout.y,
      });
    }

    if (basketRef?.current && typeof (basketRef.current as any).measureInWindow === 'function') {
      try {
        (basketRef.current as any).measureInWindow((x: number, y: number, w: number, h: number) => {
          if (x !== undefined && y !== undefined && !isNaN(x) && !isNaN(y) && w > 0 && h > 0) {
            onBasketLayout?.({
              x,
              y,
              width: w,
              height: h,
              pageX: x,
              pageY: y,
            });
          }
        });
      } catch {}
    }
  };

  // Fixed coordinates for placed items inside the basket opening
  // Positioned high enough in the opening so fruits and number badges are 100% visible!
  const getSlotPosition = (index: number, total: number) => {
    if (total === 1) return { x: 0, y: -2 };
    if (total === 2) {
      return index === 0 ? { x: -32, y: -2 } : { x: 32, y: -2 };
    }
    if (total === 3) {
      if (index === 0) return { x: -44, y: 0 };
      if (index === 1) return { x: 0, y: -10 };
      return { x: 44, y: 0 };
    }
    if (total === 4) {
      if (index === 0) return { x: -48, y: 2 };
      if (index === 1) return { x: -16, y: -10 };
      if (index === 2) return { x: 16, y: -10 };
      return { x: 48, y: 2 };
    }
    // 5 items
    if (index === 0) return { x: -55, y: 2 };
    if (index === 1) return { x: -28, y: -10 };
    if (index === 2) return { x: 0, y: 2 };
    if (index === 3) return { x: 28, y: -10 };
    return { x: 55, y: 2 };
  };

  return (
    <View style={styles.outerContainer}>
      <Animated.View
        ref={basketRef}
        onLayout={handleLayout}
        style={[
          styles.basketWrapper,
          { width: basketWidth, height: basketHeight },
          animatedBasketStyle,
        ]}
      >
        {/* Success Glow halo behind basket */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glowHalo,
            { width: basketWidth + 40, height: basketHeight + 40 },
            animatedGlowStyle,
          ]}
        />

        {/* Layer 1: Basket Handle & Back Wall (SVG) */}
        <Svg
          width={basketWidth}
          height={basketHeight}
          viewBox="0 0 300 200"
          style={StyleSheet.absoluteFillObject}
        >
          <Defs>
            <LinearGradient id="handleGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#D97706" />
              <Stop offset="1" stopColor="#92400E" />
            </LinearGradient>
            <LinearGradient id="depthGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#451A03" />
              <Stop offset="1" stopColor="#78350F" />
            </LinearGradient>
            <LinearGradient id="basketBodyGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#F59E0B" />
              <Stop offset="0.5" stopColor="#D97706" />
              <Stop offset="1" stopColor="#B45309" />
            </LinearGradient>
          </Defs>

          {/* Arched Basket Handle */}
          <Path
            d="M 50 100 C 50 10 250 10 250 100"
            stroke="url(#handleGrad)"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M 50 100 C 50 10 250 10 250 100"
            stroke="#FDE68A"
            strokeWidth="3"
            strokeDasharray="8, 6"
            fill="none"
            strokeLinecap="round"
            opacity={0.7}
          />

          {/* Interior Hole/Depth (where fruits sit) */}
          <Ellipse cx="150" cy="95" rx="105" ry="34" fill="url(#depthGrad)" />
        </Svg>

        {/* Layer 2: Placed Items Nestled Inside Opening */}
        <View style={styles.nestledItemsContainer}>
          {placedItems.map((item, index) => {
            const offset = getSlotPosition(index, placedItems.length);
            return (
              <View
                key={`placed-${item.id}-${item.countNumber}`}
                style={[
                  styles.placedItemBox,
                  {
                    width: itemSize,
                    height: itemSize,
                    transform: [
                      { translateX: offset.x },
                      { translateY: offset.y },
                    ],
                  },
                ]}
              >
                <CountingItemAsset itemType={item.name} size={itemSize * 0.95} />

                {/* NUMBER BADGE ON THE PLACED ITEM */}
                <CountBadge
                  number={item.countNumber}
                  size={isTablet ? 26 : 22}
                  fontSize={isTablet ? 14 : 12}
                  bgColor="#22C55E"
                />
              </View>
            );
          })}
        </View>

        {/* Layer 3: Basket Front Body & Woven Rim (SVG) */}
        <Svg
          width={basketWidth}
          height={basketHeight}
          viewBox="0 0 300 200"
          style={[StyleSheet.absoluteFillObject, { zIndex: 10 }]}
          pointerEvents="none"
        >
          {/* Basket Front Body */}
          <Path
            d="M 38 95 C 42 165 75 190 150 190 C 225 190 258 165 262 95 C 240 115 60 115 38 95 Z"
            fill="url(#basketBodyGrad)"
            stroke="#92400E"
            strokeWidth="3"
          />

          {/* Woven Horizontal Texture Ribs */}
          <Path d="M 44 115 Q 150 135 256 115" stroke="#92400E" strokeWidth="2.5" fill="none" opacity={0.6} />
          <Path d="M 54 135 Q 150 155 246 135" stroke="#92400E" strokeWidth="2.5" fill="none" opacity={0.6} />
          <Path d="M 72 155 Q 150 172 228 155" stroke="#92400E" strokeWidth="2.5" fill="none" opacity={0.6} />
          <Path d="M 98 174 Q 150 186 202 174" stroke="#92400E" strokeWidth="2.5" fill="none" opacity={0.6} />

          {/* Woven Vertical Strands */}
          <Path d="M 70 102 C 72 135 84 165 96 174" stroke="#78350F" strokeWidth="2" fill="none" opacity={0.4} />
          <Path d="M 110 108 C 112 138 120 168 126 182" stroke="#78350F" strokeWidth="2" fill="none" opacity={0.4} />
          <Path d="M 150 110 L 150 188" stroke="#78350F" strokeWidth="2" fill="none" opacity={0.4} />
          <Path d="M 190 108 C 188 138 180 168 174 182" stroke="#78350F" strokeWidth="2" fill="none" opacity={0.4} />
          <Path d="M 230 102 C 228 135 216 165 204 174" stroke="#78350F" strokeWidth="2" fill="none" opacity={0.4} />

          {/* Front Braided Rim */}
          <Path
            d="M 38 95 C 60 115 240 115 262 95 C 240 105 60 105 38 95 Z"
            fill="#FDE68A"
            stroke="#B45309"
            strokeWidth="2"
          />
        </Svg>

        {/* Layer 4: Wooden Sign on Front displaying Target Number */}
        <View style={styles.signContainer}>
          {/* Hanging Ropes */}
          <View style={styles.ropeRow}>
            <View style={styles.rope} />
            <View style={styles.rope} />
          </View>

          {/* Wooden Tag */}
          <View style={styles.woodenTag}>
            <View style={styles.tagInner}>
              <Text style={styles.tagLabel}>PUT</Text>
              <Text style={styles.tagNumber}>{targetCount}</Text>
              <Text style={styles.tagSub}>ITEMS</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* DISPLAY BELOW THE BASKET: Animated Progress Counter */}
      <View style={styles.belowBasketCounter}>
        <Animated.View
          style={[
            styles.counterPill,
            isTargetReached && styles.counterPillComplete,
            animatedCounterPillStyle,
          ]}
        >
          <Ionicons
            name={isTargetReached ? 'checkmark-circle' : 'basket'}
            size={isTablet ? 22 : 18}
            color={isTargetReached ? '#16A34A' : '#D97706'}
          />

          <Text
            style={[
              styles.counterText,
              isTargetReached && styles.counterTextComplete,
            ]}
          >
            Count: {currentCount} of {targetCount}
          </Text>

          {/* Progress dots */}
          <View style={styles.dotsRow}>
            {Array.from({ length: targetCount }).map((_, i) => {
              const isFilled = i < currentCount;
              return (
                <View
                  key={`dot-${i}`}
                  style={[
                    styles.dot,
                    isFilled ? styles.dotFilled : styles.dotEmpty,
                  ]}
                />
              );
            })}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  basketWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowHalo: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#86EFAC',
    opacity: 0,
    transform: [{ scale: 1.15 }],
  },
  nestledItemsContainer: {
    position: 'absolute',
    top: '24%',
    left: 0,
    right: 0,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    zIndex: 25,
  },
  placedItemBox: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 26,
  },
  signContainer: {
    position: 'absolute',
    bottom: 12,
    alignItems: 'center',
    zIndex: 35,
  },
  ropeRow: {
    flexDirection: 'row',
    width: 60,
    justifyContent: 'space-between',
    marginBottom: -2,
    zIndex: 22,
  },
  rope: {
    width: 4,
    height: 10,
    backgroundColor: '#92400E',
    borderRadius: 2,
  },
  woodenTag: {
    backgroundColor: '#FEF3C7',
    borderWidth: 3,
    borderColor: '#B45309',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 5,
    minWidth: 90,
    alignItems: 'center',
  },
  tagInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagLabel: {
    fontFamily: 'FredokaOne_400Regular',
    fontSize: 9,
    color: '#92400E',
    letterSpacing: 0.5,
  },
  tagNumber: {
    fontFamily: 'FredokaOne_400Regular',
    fontSize: 30,
    lineHeight: 34,
    color: '#B45309',
    fontWeight: 'bold',
  },
  tagSub: {
    fontFamily: 'FredokaOne_400Regular',
    fontSize: 8,
    color: '#92400E',
    letterSpacing: 0.5,
    marginTop: -2,
  },
  belowBasketCounter: {
    marginTop: 10,
    alignItems: 'center',
  },
  counterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 2,
    borderColor: '#FDE68A',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  counterPillComplete: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  counterText: {
    fontFamily: 'FredokaOne_400Regular',
    fontSize: 15,
    color: '#92400E',
  },
  counterTextComplete: {
    color: '#16A34A',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 4,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  dotEmpty: {
    backgroundColor: '#FCD34D',
    opacity: 0.5,
  },
  dotFilled: {
    backgroundColor: '#16A34A',
  },
});
