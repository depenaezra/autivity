import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  Animated as RNAnimated,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderButton } from '../header-button';
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

function FullScreenConfetti() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const particles = React.useRef(
    Array.from({ length: 35 }).map(() => ({
      yAnim: new RNAnimated.Value(-40),
      left: Math.random() * screenWidth,
      rotateAnim: new RNAnimated.Value(0),
      scaleAnim: new RNAnimated.Value(Math.random() * 0.6 + 0.5),
      color: ['#FCA5A5', '#FCD34D', '#86EFAC', '#93C5FD', '#C084FC', '#F472B6', '#62A9E6'][
        Math.floor(Math.random() * 7)
      ],
      delay: Math.random() * 700,
      shape: Math.random() > 0.5 ? 'circle' : 'square',
    }))
  ).current;

  useEffect(() => {
    particles.forEach((p) => {
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.delay(p.delay),
          RNAnimated.parallel([
            RNAnimated.timing(p.yAnim, {
              toValue: screenHeight + 60,
              duration: Math.random() * 2500 + 2500,
              useNativeDriver: true,
            }),
            RNAnimated.timing(p.rotateAnim, {
              toValue: 360,
              duration: Math.random() * 2500 + 2500,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });
  }, [particles, screenHeight]);

  return (
    <View className="absolute inset-0 pointer-events-none z-[9999]">
      {particles.map((p, idx) => (
        <RNAnimated.View
          key={idx}
          className="absolute w-3.5 h-3.5"
          style={{
            top: 0,
            left: p.left,
            borderRadius: p.shape === 'circle' ? 7 : 3,
            backgroundColor: p.color,
            transform: [
              { translateY: p.yAnim },
              {
                rotate: p.rotateAnim.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }),
              },
              { scale: p.scaleAnim },
            ],
          }}
        />
      ))}
    </View>
  );
}

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
      className="items-center mb-4 active:scale-95 transition-transform"
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

  return (
    <View className="flex-col mt-4 mb-4">
      {/* Section Header */}
      <View className="mb-4 flex-row items-center justify-between flex-wrap gap-2">
        <View className="flex-row items-center gap-2">
          <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[28px]' : 'text-[20px]'}`}>
            Learner Milestones
          </Text>
        </View>

        {milestones.length > 0 && (
          <View className="bg-white border-[2px] border-[#BBE8FB] px-3 py-1 rounded-xl">
            <Text className="font-fredoka-one text-[#62A9E6] text-xs uppercase">
              {completedCount} / {milestones.length} COMPLETED
            </Text>
          </View>
        )}
      </View>

      {/* Grid or Empty State */}
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
      ) : (
        <View className="bg-white border-[2px] border-[#F1F1F1] rounded-[24px] p-4 sm:p-6 shadow-sm items-center justify-center">
          <View className="flex-row flex-wrap justify-center items-start gap-3 sm:gap-6 w-full pt-1">
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
