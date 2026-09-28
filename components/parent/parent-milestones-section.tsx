import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  Animated as RNAnimated,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { ParentMilestone } from '../../src/services/parentDashboard';
import ParentMilestoneDetailModal from './parent-milestone-detail-modal';

interface ParentMilestonesSectionProps {
  milestones: ParentMilestone[];
  isTablet: boolean;
}

export const getMilestoneStatusConfig = (status: string) => {
  const normalized = status?.toLowerCase() || '';
  if (normalized === 'achieved' || normalized === 'completed') {
    return {
      key: 'achieved',
      label: 'COMPLETED',
      bgColor: '#F0FDF4',
      borderColor: '#86EFAC',
      iconColor: '#15803D',
      textColor: '#15803D',
      pillBg: '#DCFCE7',
      isCompleted: true,
    };
  }
  if (normalized === 'in progress') {
    return {
      key: 'in_progress',
      label: 'IN PROGRESS',
      bgColor: '#EBF5FF',
      borderColor: '#BBE8FB',
      iconColor: '#62A9E6',
      textColor: '#2563EB',
      pillBg: '#DBEAFE',
      isCompleted: false,
    };
  }
  return {
    key: 'target_set',
    label: 'TARGET SET',
    bgColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    iconColor: '#9CA3AF',
    textColor: '#6B7280',
    pillBg: '#E5E7EB',
    isCompleted: false,
  };
};

function MilestoneGridItem({
  milestone,
  isTablet,
  globalShineProgress,
  onPress,
}: {
  milestone: ParentMilestone;
  isTablet: boolean;
  globalShineProgress: SharedValue<number>;
  index: number;
  onPress: (item: ParentMilestone) => void;
}) {
  const config = getMilestoneStatusConfig(milestone.status);
  const circleSize = isTablet ? 84 : 64;
  const iconSize = isTablet ? 34 : 26;

  const minX = -(circleSize + 30);
  const maxX = circleSize + 30;

  const animatedShineStyle = useAnimatedStyle(() => {
    if (!config.isCompleted) return { opacity: 0 };
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

  const strokeWidth = isTablet ? 4 : 3;
  const bottomShadowWidth = isTablet ? 7 : 5;

  return (
    <Pressable
      onPress={() => onPress(milestone)}
      style={{ width: isTablet ? 110 : 88 }}
      className="items-center active:scale-95 transition-transform"
    >
      {/* 3D Circular Badge Icon */}
      <View
        style={{
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          backgroundColor: config.bgColor,
          borderWidth: strokeWidth,
          borderBottomWidth: bottomShadowWidth,
          borderColor: config.borderColor,
          borderBottomColor: config.borderColor,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
        className="items-center justify-center relative overflow-hidden"
      >
        {/* Subtle top sheen highlight */}
        <View className="absolute top-0 left-0 right-0 h-1/2 bg-white/25 rounded-t-full" />

        {/* Synchronized Shining Light Sweep for completed milestones */}
        {config.isCompleted && (
          <Animated.View
            className="absolute w-7 h-24 bg-white/80 z-10"
            style={animatedShineStyle}
          />
        )}

        {/* Center Milestone Icon (Default Flag Icon) */}
        <Ionicons name="flag" size={iconSize} color={config.iconColor} />
      </View>

      {/* Milestone Title */}
      <Text
        className={`font-fredoka-one text-center text-[#374151] mt-1.5 ${
          isTablet ? 'text-sm' : 'text-xs'
        }`}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {milestone.title}
      </Text>

      {/* Status Pill */}
      <View
        className="px-2 py-0.5 rounded-[5px] mt-1 border"
        style={{ backgroundColor: config.pillBg, borderColor: config.borderColor }}
      >
        <Text
          className={`font-fredoka-one uppercase ${isTablet ? 'text-[10px]' : 'text-[8px]'}`}
          style={{ color: config.textColor }}
        >
          {config.label}
        </Text>
      </View>
    </Pressable>
  );
}

export function ParentMilestonesSection({ milestones, isTablet }: ParentMilestonesSectionProps) {
  const globalShineProgress = useSharedValue(0);
  const [selectedMilestone, setSelectedMilestone] = useState<ParentMilestone | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollX, setScrollX] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

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

  // Sort milestones: Completed ('Achieved') FIRST, then 'In Progress', then 'Target Set'
  const sortedMilestones = React.useMemo(() => {
    const getStatusPriority = (status: string) => {
      const norm = status?.toLowerCase() || '';
      if (norm === 'achieved' || norm === 'completed') return 1;
      if (norm === 'in progress') return 2;
      return 3;
    };

    return [...milestones].sort((a, b) => {
      const pA = getStatusPriority(a.status);
      const pB = getStatusPriority(b.status);
      return pA - pB;
    });
  }, [milestones]);

  const completedCount = milestones.filter(
    (m) => m.status?.toLowerCase() === 'achieved' || m.status?.toLowerCase() === 'completed'
  ).length;

  const hasMoreThanThree = sortedMilestones.length > 3;

  const canScrollLeft = scrollX > 5;
  const canScrollRight = contentWidth > 0 && containerWidth > 0 
    ? scrollX < contentWidth - containerWidth - 5 
    : hasMoreThanThree;

  const handleScrollLeft = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const step = isTablet ? 260 : 180;
    const targetX = Math.max(0, scrollX - step);
    scrollViewRef.current?.scrollTo({ x: targetX, animated: true });
  };

  const handleScrollRight = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const step = isTablet ? 260 : 180;
    const maxScroll = Math.max(0, contentWidth - containerWidth);
    const targetX = Math.min(maxScroll, scrollX + step);
    scrollViewRef.current?.scrollTo({ x: targetX, animated: true });
  };

  return (
    <View className="flex-col mt-4 mb-4">
      {/* Section Header with Title, Navigation Arrows, and Completed Pill */}
      <View className="mb-3 flex-row items-center justify-between flex-wrap gap-2">
        <View className="flex-row items-center gap-2">
          <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[28px]' : 'text-[20px]'}`}>
            Learner Milestones
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          {/* Header Navigation Arrows for Carousel */}
          {hasMoreThanThree && (
            <View className="flex-row items-center gap-1.5 mr-1">
              <Pressable
                onPress={handleScrollLeft}
                disabled={!canScrollLeft}
                hitSlop={8}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#BBE8FB] bg-white items-center justify-center active:scale-95 ${
                  !canScrollLeft ? 'opacity-30' : 'opacity-100 active:bg-[#EBF5FF]'
                }`}
              >
                <Ionicons name="chevron-back" size={isTablet ? 18 : 15} color="#62A9E6" />
              </Pressable>
              <Pressable
                onPress={handleScrollRight}
                disabled={!canScrollRight}
                hitSlop={8}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#BBE8FB] bg-white items-center justify-center active:scale-95 ${
                  !canScrollRight ? 'opacity-30' : 'opacity-100 active:bg-[#EBF5FF]'
                }`}
              >
                <Ionicons name="chevron-forward" size={isTablet ? 18 : 15} color="#62A9E6" />
              </Pressable>
            </View>
          )}

          {milestones.length > 0 && (
            <View className="bg-white border-[2px] border-[#BBE8FB] px-3 py-1 rounded-xl">
              <Text className="font-fredoka-one text-[#62A9E6] text-xs uppercase">
                {completedCount} / {milestones.length} COMPLETED
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Grid or Carousel or Empty State */}
      {sortedMilestones.length === 0 ? (
        <View className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-2xl p-8 items-center justify-center">
          <Ionicons name="flag-outline" size={isTablet ? 40 : 30} color="#9CA3AF" />
          <Text className="font-fredoka-one text-base text-[#4B5563] mt-3 text-center">
            No Milestones Set Yet
          </Text>
          <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-1 text-center">
            Milestones set by the teacher will appear here.
          </Text>
        </View>
      ) : hasMoreThanThree ? (
        <View className="bg-white border-[2px] border-[#F1F1F1] rounded-[24px] p-4 sm:p-5 shadow-sm">
          {/* Unobstructed Horizontal Milestone Carousel */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              setScrollX(e.nativeEvent.contentOffset.x);
            }}
            onContentSizeChange={(w) => setContentWidth(w)}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingHorizontal: 2,
              alignItems: 'flex-start',
              gap: isTablet ? 16 : 10,
            }}
            className="w-full"
          >
            {sortedMilestones.map((m, idx) => (
              <MilestoneGridItem
                key={m.id || idx}
                milestone={m}
                isTablet={isTablet}
                globalShineProgress={globalShineProgress}
                index={idx}
                onPress={(item) => setSelectedMilestone(item)}
              />
            ))}
          </ScrollView>
        </View>
      ) : (
        <View className="bg-white border-[2px] border-[#F1F1F1] rounded-[24px] p-4 sm:p-6 shadow-sm items-center justify-center">
          <View className="flex-row justify-center items-start gap-4 sm:gap-6 w-full pt-1">
            {sortedMilestones.map((m, idx) => (
              <MilestoneGridItem
                key={m.id || idx}
                milestone={m}
                isTablet={isTablet}
                globalShineProgress={globalShineProgress}
                index={idx}
                onPress={(item) => setSelectedMilestone(item)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Milestone Detail Modal */}
      <ParentMilestoneDetailModal
        milestone={selectedMilestone}
        visible={!!selectedMilestone}
        onClose={() => setSelectedMilestone(null)}
        isTablet={isTablet}
      />
    </View>
  );
}

