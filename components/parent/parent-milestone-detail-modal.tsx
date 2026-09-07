import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
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
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderButton } from '../header-button';

export interface ParentMilestoneItem {
  id: string;
  title: string;
  status: string;
  targetDate?: string | null;
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

export function ParentMilestoneDetailModal({
  milestone,
  visible,
  onClose,
  isTablet: isTabletProp,
}: {
  milestone: ParentMilestoneItem | null;
  visible: boolean;
  onClose: () => void;
  isTablet?: boolean;
}) {
  const { width } = useWindowDimensions();
  const isTablet = isTabletProp ?? width >= 768;
  const insets = useSafeAreaInsets();
  const globalShineProgress = useSharedValue(0);

  const config = milestone ? getMilestoneStatusConfig(milestone.status) : getMilestoneStatusConfig('');
  const circleSize = isTablet ? 180 : 130;
  const iconSize = isTablet ? 72 : 52;

  const minX = -(circleSize + 40);
  const maxX = circleSize + 40;

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

  useEffect(() => {
    if (visible && config.isCompleted) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      globalShineProgress.value = withRepeat(
        withDelay(
          400,
          withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );
    } else {
      globalShineProgress.value = 0;
    }
  }, [visible, config.isCompleted]);

  if (!milestone) return null;

  const strokeWidth = isTablet ? 8 : 6;
  const bottomShadowWidth = isTablet ? 14 : 10;

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-center items-center px-6 relative">
        {visible && config.isCompleted && <FullScreenConfetti />}

        <View
          style={{ top: Math.max(insets.top, 16) + 10, left: isTablet ? 40 : 24 }}
          className="absolute z-50"
        >
          <HeaderButton
            onPress={onClose}
            icon={<Ionicons name="close" size={isTablet ? 32 : 24} color="#62A9E6" />}
          />
        </View>

        <Pressable className="absolute inset-0" onPress={onClose} />

        <View
          className={`w-full bg-white border-[4px] border-[#F1F1F1] rounded-[36px] items-center relative z-10 ${
            isTablet ? 'max-w-xl p-10' : 'max-w-md p-6'
          }`}
          style={{
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          {/* Large 3D Circular Badge Icon */}
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
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4,
            }}
            className="items-center justify-center relative overflow-hidden my-4"
          >
            <View className="absolute top-0 left-0 right-0 h-1/2 bg-white/25 rounded-t-full" />

            {config.isCompleted && (
              <Animated.View
                className="absolute w-12 h-44 bg-white/80 z-10"
                style={animatedShineStyle}
              />
            )}

            <Ionicons name="flag" size={iconSize} color={config.iconColor} />
          </View>

          {/* Milestone Title */}
          <Text
            className={`font-fredoka-one text-center text-[#374151] mt-2 ${
              isTablet ? 'text-3xl' : 'text-2xl'
            }`}
          >
            {milestone.title}
          </Text>

          {/* Status Badge */}
          <View
            className="px-4 py-1.5 rounded-full border-2 mt-4"
            style={{ backgroundColor: config.pillBg, borderColor: config.borderColor }}
          >
            <Text
              className={`font-fredoka-one text-sm uppercase`}
              style={{ color: config.textColor }}
            >
              {config.label}
            </Text>
          </View>

          {/* Target Date if available */}
          {milestone.targetDate ? (
            <View className="flex-row items-center gap-1.5 mt-3">
              <Feather name="calendar" size={14} color="#9CA3AF" />
              <Text className="font-quicksand-semibold text-sm text-[#9CA3AF]">
                Target Date: {milestone.targetDate}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

export default ParentMilestoneDetailModal;
