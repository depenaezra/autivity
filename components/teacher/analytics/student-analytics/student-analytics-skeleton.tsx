import React, { useEffect } from 'react';
import { View } from 'react-native';
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

export function StudentAnalyticsHeaderSkeleton({ isTablet }: SkeletonProps) {
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

export function StudentAnalyticsSkeleton({ isTablet }: SkeletonProps) {
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
    <Animated.View style={animatedStyle} className="flex-col gap-4 w-full">
      {/* Control Row Skeleton (Range Filter & Download Report) */}
      <View className="flex-row items-center justify-end gap-2 mb-1">
        <View className="bg-[#E5E7EB] rounded-xl h-[36px] w-28" />
        <View className="bg-[#E5E7EB] rounded-xl h-[36px] w-36" />
      </View>

      {/* 1. Student Details Card Skeleton */}
      <View className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl p-4 sm:p-5">
        <View className="flex-row items-center justify-between flex-wrap gap-2">
          <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'h-6 w-36' : 'h-5 w-28'}`} />
          <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'h-6 w-28' : 'h-5 w-20'}`} />
        </View>
        <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-[#E5E7EB]">
          <View className="bg-[#E5E7EB] rounded-[6px] h-6 w-20" />
          <View className="bg-[#E5E7EB] rounded-[6px] h-6 w-16" />
        </View>
      </View>

      {/* 2. Student Performance KPI Cards Skeleton */}
      <View className="flex-col mt-2">
        <View className="flex-row justify-between items-center mb-4">
          <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'h-6 w-56' : 'h-5 w-40'}`} />
        </View>
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

      {/* 3. Actionable Recommendations Skeleton */}
      <View className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl p-4 sm:p-5 flex-col gap-3 mt-2">
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

      {/* 4. Emotional Recognition & Self-Regulation Card Skeleton */}
      <View className="flex-col mt-4">
        {/* Title & Info Skeleton */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center gap-2">
            <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'h-7 w-64' : 'h-6 w-48'}`} />
            <View className="w-5 h-5 rounded-full bg-[#E5E7EB]" />
          </View>
        </View>

        {/* Main Card Skeleton */}
        <View className={`bg-white border border-[#E5E7EB] ${isTablet ? 'rounded-[32px] p-6' : 'rounded-[24px] p-5'} flex-col gap-4`}>
          {/* Top Metric & Badges */}
          <View className="flex-row items-center justify-between flex-wrap gap-2">
            <View className="flex-col gap-1.5">
              <View className={`bg-[#E5E7EB] rounded-[8px] ${isTablet ? 'h-9 w-40' : 'h-8 w-32'}`} />
              <View className="bg-[#E5E7EB] rounded-[4px] h-3 w-48" />
            </View>
            <View className="flex-row gap-2">
              <View className="bg-[#E5E7EB] rounded-xl h-10 w-24" />
              <View className="bg-[#E5E7EB] rounded-xl h-10 w-24" />
            </View>
          </View>

          {/* 5-Day Strip Skeleton */}
          <View className="flex-col gap-2 my-1">
            <View className="bg-[#E5E7EB] rounded-[4px] h-4 w-36" />
            <View className="flex-row justify-between gap-2">
              {[1, 2, 3, 4, 5].map((d) => (
                <View
                  key={d}
                  className={`flex-1 rounded-[16px] p-2 items-center justify-between bg-[#FAFAFA] border border-[#F1F1F1] ${
                    isTablet ? 'h-[125px]' : 'h-[105px]'
                  }`}
                >
                  <View className="bg-[#E5E7EB] rounded-[4px] h-3 w-8" />
                  <View className="bg-[#E5E7EB] rounded-full w-8 h-8 my-1" />
                  <View className="bg-[#E5E7EB] rounded-full h-3.5 w-12" />
                </View>
              ))}
            </View>
          </View>

          {/* Regulation Zones Distribution Skeleton */}
          <View className="pt-3 border-t border-[#F1F1F1] flex-col gap-2.5">
            <View className="bg-[#E5E7EB] rounded-[4px] h-4 w-52 mb-1" />
            {[1, 2, 3].map((z) => (
              <View key={z} className="flex-col gap-1.5">
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2">
                    <View className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
                    <View className="bg-[#E5E7EB] rounded-[4px] h-3.5 w-32" />
                  </View>
                  <View className="bg-[#E5E7EB] rounded-[4px] h-3.5 w-16" />
                </View>
                <View className="w-full h-2.5 rounded-full bg-[#F3F4F6]" />
              </View>
            ))}
          </View>

          {/* Behavioral Insight Box Skeleton */}
          <View className="bg-[#F0F9FF] border border-[#BBE8FB] rounded-2xl p-3.5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="w-7 h-7 rounded-xl bg-white border border-[#BBE8FB]" />
              <View className="bg-[#E5E7EB] rounded-[4px] h-4 w-36" />
            </View>
            <View className="w-4 h-4 rounded-full bg-[#E5E7EB]" />
          </View>
        </View>
      </View>

      {/* 5. Evaluation Trend Chart Skeleton */}
      <View className="flex-col mt-4">
        <View className="flex-row justify-between items-center mb-4 flex-wrap gap-2">
          <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'h-6 w-52' : 'h-5 w-36'}`} />
          <View className="flex-row items-center gap-1.5">
            <View className="bg-[#E5E7EB] rounded-lg h-7 w-24" />
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className={`bg-[#E5E7EB] rounded-[8px] ${isTablet ? 'h-8 w-16' : 'h-7 w-12'}`} />
            ))}
          </View>
        </View>
        <View className={`bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl w-full justify-center items-center ${isTablet ? 'h-56' : 'h-44'}`}>
          <View className="w-5/6 h-0.5 bg-[#E5E7EB] my-3" />
          <View className="w-5/6 h-0.5 bg-[#E5E7EB] my-3" />
          <View className="w-5/6 h-0.5 bg-[#E5E7EB] my-3" />
        </View>
      </View>

      {/* 5. Developmental Domain Practice Skeleton */}
      <View className="flex-col mt-4">
        <View className="flex-row justify-between items-center mb-4 flex-wrap gap-2">
          <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'h-6 w-64' : 'h-5 w-48'}`} />
          <View className="flex-row gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className={`bg-[#E5E7EB] rounded-[8px] ${isTablet ? 'h-8 w-16' : 'h-7 w-12'}`} />
            ))}
          </View>
        </View>
        <View className="flex-col gap-3">
          {[1, 2, 3].map((domainIdx) => (
            <View key={domainIdx} className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl p-4 flex-col gap-3">
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

      {/* 5. Milestones Skeleton */}
      <View className="w-full mt-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'h-6 w-48' : 'h-5 w-36'}`} />
          <View className={`bg-[#E5E7EB] rounded-[8px] ${isTablet ? 'h-8 w-16' : 'h-7 w-12'}`} />
        </View>
        <View className="gap-3">
          {[1, 2].map((i) => (
            <View
              key={i}
              className={`bg-white border-[2px] border-[#F1F1F1] flex-row items-center justify-between ${
                isTablet ? 'rounded-[24px] p-5' : 'rounded-[16px] p-3.5'
              }`}
            >
              <View className="w-1.5 self-stretch rounded-full mr-3 bg-[#E5E7EB]" />
              <View className="flex-1 pr-2">
                <View className={`bg-[#E5E7EB] rounded-[4px] ${isTablet ? 'h-5 w-40 mb-2' : 'h-4 w-28 mb-1.5'}`} />
                <View className={`bg-[#E5E7EB] rounded-[4px] ${isTablet ? 'h-4 w-56' : 'h-3.5 w-36'}`} />
              </View>
              <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'h-7 w-20' : 'h-5 w-14'}`} />
            </View>
          ))}
        </View>
      </View>

      {/* 6. Completed Sessions Skeleton */}
      <View className="w-full mt-6 mb-12 pb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'h-6 w-52' : 'h-5 w-40'}`} />
          <View className="flex-row gap-1.5">
            {[1, 2, 3].map((i) => (
              <View key={i} className={`bg-[#E5E7EB] rounded-[8px] ${isTablet ? 'h-8 w-16' : 'h-7 w-12'}`} />
            ))}
          </View>
        </View>
        <View className="gap-3">
          {[1, 2].map((i) => (
            <View
              key={i}
              className={`bg-white border-[2px] border-[#F1F1F1] flex-row items-center justify-between ${
                isTablet ? 'rounded-[24px] p-5' : 'rounded-[16px] p-3.5'
              }`}
            >
              <View className="w-1.5 self-stretch rounded-full mr-3 bg-[#E5E7EB]" />
              <View className="flex-1 pr-2">
                <View className={`bg-[#E5E7EB] rounded-[4px] ${isTablet ? 'h-5 w-40 mb-2' : 'h-4 w-28 mb-1.5'}`} />
                <View className={`bg-[#E5E7EB] rounded-[4px] ${isTablet ? 'h-4 w-56' : 'h-3.5 w-36'}`} />
              </View>
              <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'h-7 w-20' : 'h-5 w-14'}`} />
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

export default StudentAnalyticsSkeleton;
