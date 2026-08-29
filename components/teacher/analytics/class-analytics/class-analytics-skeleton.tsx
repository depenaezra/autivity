import React, { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonProps {
  isTablet: boolean;
}

export function ClassAnalyticsHeaderSkeleton({ isTablet }: SkeletonProps) {
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
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle} className="items-center justify-center">
      <View
        className={`bg-[#D1D5DB] rounded-[8px] ${
          isTablet ? 'h-9 w-60 mb-2' : 'h-7 w-40 mb-1'
        }`}
      />
    </Animated.View>
  );
}

export function ClassAnalyticsSkeleton({ isTablet }: SkeletonProps) {
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
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle} className="flex-col gap-6 w-full">
      {/* Control Row Skeleton (Range Filter & Download Report) */}
      <View className="flex-row items-center justify-end gap-2 mb-1">
        <View className="bg-[#E5E7EB] rounded-xl h-[36px] w-28" />
        <View className="bg-[#E5E7EB] rounded-xl h-[36px] w-36" />
      </View>

      {/* Enrolled Students Roster Card Skeleton */}
      <View className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl overflow-hidden p-4 sm:p-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-col gap-1.5">
            <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'h-6 w-44' : 'h-5 w-32'}`} />
            <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'h-4 w-36' : 'h-3 w-24'}`} />
          </View>

          {/* Overlapping Avatar circles wireframe */}
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center">
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  className={`rounded-full bg-[#E5E7EB] border-2 border-white ${
                    isTablet ? 'w-10 h-10' : 'w-9 h-9'
                  } ${i === 1 ? '' : '-ml-2.5'}`}
                />
              ))}
            </View>
            <View className={`bg-[#E5E7EB] rounded-full ${isTablet ? 'w-5 h-5' : 'w-4 h-4'}`} />
          </View>
        </View>
      </View>

      {/* Class Performance KPI Cards Skeleton */}
      <View className="flex-col">
        <View className="flex-row justify-between items-center mb-4">
          <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'h-6 w-56' : 'h-5 w-44'}`} />
        </View>

        {/* KPI Cards Wireframe */}
        <View className="flex-row gap-4">
          {[1, 2].map((cardIdx) => (
            <View
              key={cardIdx}
              className={`border-[4px] border-[#F1F1F1] bg-white justify-center items-center flex-1 ${
                isTablet ? 'rounded-[32px] p-4 h-[160px]' : 'rounded-[20px] p-3 h-[130px]'
              }`}
              style={{
                shadowColor: '#F1F1F1',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              <View className={`bg-[#E5E7EB] rounded-[4px] ${isTablet ? 'w-32 h-4 mb-3' : 'w-20 h-3 mb-2'}`} />
              <View className={`bg-[#E5E7EB] rounded-full ${isTablet ? 'w-10 h-10 mb-3' : 'w-7 h-7 mb-2'}`} />
              <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'w-20 h-8' : 'w-14 h-6'}`} />
            </View>
          ))}
        </View>
      </View>

      {/* Actionable Recommendations Skeleton */}
      <View className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl p-4 sm:p-5 flex-col gap-3">
        <View className="flex-row items-center justify-between">
          <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'h-6 w-56' : 'h-5 w-44'}`} />
          <View className="w-5 h-5 rounded-full bg-[#E5E7EB]" />
        </View>
        <View className="flex-col gap-2.5 mt-1">
          {[1, 2].map((i) => (
            <View key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 flex-col gap-2">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
                  <View className={`bg-[#E5E7EB] rounded-[4px] ${isTablet ? 'h-5 w-48' : 'h-4 w-36'}`} />
                </View>
                <View className="bg-[#E5E7EB] rounded-full h-5 w-20" />
              </View>
              <View className="bg-[#E5E7EB] rounded-[4px] h-3 w-full" />
            </View>
          ))}
        </View>
      </View>

      {/* Evaluation Trend Chart Skeleton */}
      <View className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex-col">
        <View className="flex-row justify-between items-center mb-6 flex-wrap gap-2">
          <View className="flex-col gap-1.5">
            <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'h-6 w-52' : 'h-5 w-40'}`} />
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="bg-[#E5E7EB] rounded-lg h-7 w-24" />
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className={`bg-[#E5E7EB] rounded-lg ${isTablet ? 'h-7 w-16' : 'h-6 w-12'}`} />
            ))}
          </View>
        </View>
        <View className={`bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl w-full justify-center items-center ${isTablet ? 'h-48' : 'h-40'}`}>
          <View className="w-5/6 h-0.5 bg-[#E5E7EB] my-3" />
          <View className="w-5/6 h-0.5 bg-[#E5E7EB] my-3" />
          <View className="w-5/6 h-0.5 bg-[#E5E7EB] my-3" />
        </View>
      </View>

      {/* Developmental Skills Heatmap Skeleton */}
      <View className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex-col">
        <View className="flex-row justify-between items-center mb-6 flex-wrap gap-2">
          <View className="flex-col gap-1.5">
            <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'h-6 w-64' : 'h-5 w-48'}`} />
          </View>
          <View className="flex-row gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className={`bg-[#E5E7EB] rounded-lg ${isTablet ? 'h-7 w-16' : 'h-6 w-12'}`} />
            ))}
          </View>
        </View>

        <View className="flex-col gap-4">
          {[1, 2, 3].map((domainIdx) => (
            <View key={domainIdx} className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-4 flex-col gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-3.5 h-3.5 rounded-full bg-[#E5E7EB]" />
                  <View className="h-4 w-36 bg-[#E5E7EB] rounded-[4px]" />
                </View>
                <View className="h-4 w-4 bg-[#E5E7EB] rounded-full" />
              </View>
              <View className="flex-row items-center gap-2 ml-6">
                <View className="h-4 w-24 bg-[#E5E7EB] rounded-full" />
                <View className="h-4 w-20 bg-[#E5E7EB] rounded-full" />
              </View>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}
