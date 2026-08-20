import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface ClassCardSkeletonProps {
  isTablet: boolean;
}

export function ClassCardSkeleton({ isTablet }: ClassCardSkeletonProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 750 }),
        withTiming(0.4, { duration: 750 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={`bg-white border-[4px] border-[#F1F1F1] flex-row justify-between items-start ${
        isTablet
          ? 'w-[420px] h-[200px] mr-3.5 rounded-[32px] p-6'
          : 'w-[290px] h-[135px] mr-2 rounded-[20px] p-3'
      }`}
      style={[
        {
          borderColor: '#F1F1F1',
          shadowColor: '#F1F1F1',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 2,
        },
        animatedStyle,
      ]}
    >
      {/* Left side details skeleton */}
      <View className="flex-1 self-stretch justify-start pr-2">
        {/* Title wireframe */}
        <View
          className={`bg-[#E5E7EB] rounded-[6px] ${
            isTablet ? 'h-7 w-40 mb-3' : 'h-5 w-28 mb-2'
          }`}
        />
        {/* Grade/Level badge wireframe */}
        <View
          className={`bg-[#E5E7EB] rounded-[6px] ${
            isTablet ? 'h-5 w-24 mt-1' : 'h-4 w-16 mt-1'
          }`}
        />
        {/* Info row wireframe */}
        <View className="flex-row items-center gap-1.5 mt-3">
          <View
            className={`bg-[#E5E7EB] rounded-[6px] ${
              isTablet ? 'h-6 w-14' : 'h-4 w-10'
            }`}
          />
          <View
            className={`bg-[#E5E7EB] rounded-[6px] ${
              isTablet ? 'h-6 w-20' : 'h-4 w-14'
            }`}
          />
        </View>
      </View>

      {/* Right side illustration skeleton */}
      <View
        className={`bg-[#E5E7EB] rounded-[16px] self-center ${
          isTablet ? 'w-[152px] h-[152px]' : 'w-[105px] h-[105px]'
        }`}
      />
    </Animated.View>
  );
}
