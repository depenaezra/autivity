import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';

import { AchievementView } from './achievement-view';
import type { BadgeItemData } from './achievement-view';

export type { BadgeItemData };

interface BadgesListProps {
  badges: BadgeItemData[];
  isTablet: boolean;
}

function BadgeGridItem({
  badge,
  isTablet,
  globalShineProgress,
  index,
  onPress,
}: {
  badge: BadgeItemData;
  isTablet: boolean;
  globalShineProgress: SharedValue<number>;
  index: number;
  onPress: (badge: BadgeItemData) => void;
}) {
  const circleSize = isTablet ? 110 : 80;
  const iconSize = isTablet ? 44 : 32;

  const minX = -(circleSize + 30);
  const maxX = circleSize + 30;

  const animatedShineStyle = useAnimatedStyle(() => {
    if (!badge.unlocked) return { opacity: 0 };
    const translateX = interpolate(globalShineProgress.value, [0, 1], [minX, maxX]);
    const opacity = interpolate(
      globalShineProgress.value,
      [0, 0.15, 0.85, 1],
      [0, 0.85, 0.85, 0]
    );
    return {
      opacity,
      transform: [{ translateX }, { rotate: '25deg' }],
    };
  });

  const strokeColor = badge.unlocked
    ? (badge.borderColor || badge.color || '#FDE047')
    : '#D1D5DB';

  const strokeWidth = isTablet ? 5 : 4;
  const bottomShadowWidth = isTablet ? 10 : 7;

  return (
    <Pressable
      onPress={() => onPress(badge)}
      style={{
        width: '31%',
        marginRight: index % 3 !== 2 ? '3.5%' : 0,
      }}
      className="items-center mb-6 active:scale-95 transition-transform"
    >
      {/* 3D Circular Badge Icon */}
      <View
        style={{
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          backgroundColor: badge.unlocked ? badge.bgColor : '#F3F4F6',
          borderWidth: strokeWidth,
          borderBottomWidth: bottomShadowWidth,
          borderColor: strokeColor,
          borderBottomColor: strokeColor,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }}
        className="items-center justify-center relative overflow-hidden"
      >
        {/* Subtle top sheen / reflection highlight */}
        <View className="absolute top-0 left-0 right-0 h-1/2 bg-white/25 rounded-t-full" />

        {/* Synchronized Shining Light Sweep for unlocked badges */}
        {badge.unlocked && (
          <Animated.View
            className="absolute w-8 h-28 bg-white/80 z-10"
            style={animatedShineStyle}
          />
        )}

        {/* Badge Center Icon */}
        <Ionicons
          name={badge.icon || 'trophy'}
          size={iconSize}
          color={badge.unlocked ? badge.color : '#9CA3AF'}
        />
      </View>

      {/* Achievement Name */}
      <Text
        className={`font-fredoka-one text-center ${
          badge.unlocked ? 'text-[#374151]' : 'text-[#9CA3AF]'
        } ${isTablet ? 'text-xl mt-3' : 'text-base mt-2'}`}
        numberOfLines={2}
      >
        {badge.title}
      </Text>

      {/* Date Unlocked (only if unlocked & date exists) */}
      {badge.unlocked && badge.unlockedDate ? (
        <Text
          className={`font-quicksand-semibold text-center text-[#6B7280] ${
            isTablet ? 'text-base mt-1' : 'text-sm mt-0.5'
          }`}
          numberOfLines={1}
        >
          {badge.unlockedDate}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function BadgesList({ badges, isTablet }: BadgesListProps) {
  const globalShineProgress = useSharedValue(0);
  const [selectedBadge, setSelectedBadge] = useState<BadgeItemData | null>(null);

  useEffect(() => {
    globalShineProgress.value = withRepeat(
      withDelay(
        500,
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, []);

  return (
    <View>
      <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-3xl mb-6' : 'text-2xl mb-4'}`}>
        Adventure Badges
      </Text>

      <View className="w-full flex-row flex-wrap justify-start">
        {badges.map((badge, index) => (
          <BadgeGridItem
            key={badge.id}
            badge={badge}
            isTablet={isTablet}
            globalShineProgress={globalShineProgress}
            index={index}
            onPress={(b) => setSelectedBadge(b)}
          />
        ))}
      </View>

      {/* Clicked Badge Details View Modal */}
      <AchievementView
        badge={selectedBadge}
        visible={!!selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </View>
  );
}



