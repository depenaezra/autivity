import React, { useEffect } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

function SkeletonBlock({ className, style }: { className?: string; style?: any }) {
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
      className={`bg-[#E5E7EB] ${className || ''}`}
      style={[animatedStyle, style]}
    />
  );
}

export function ParentHomeSkeleton() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className={`w-full ${isTablet ? 'px-12 py-6' : 'px-6 py-4'}`}>
          <View className="flex-col gap-4">
            {/* 1. HEADER SKELETON */}
            <View className="w-full flex-row justify-between items-center mb-1">
              <View className="flex-row items-center flex-1">
                <SkeletonBlock
                  className={`rounded-full border-[2px] border-[#D9D9D9] ${
                    isTablet ? 'w-24 h-24' : 'w-16 h-16'
                  }`}
                />
                <View className="ml-[12px] justify-center flex-1 gap-1.5">
                  <SkeletonBlock className={`rounded-md ${isTablet ? 'w-36 h-5' : 'w-28 h-4'}`} />
                  <SkeletonBlock className={`rounded-md ${isTablet ? 'w-48 h-8' : 'w-36 h-6'}`} />
                </View>
              </View>
              <SkeletonBlock className={`rounded-full ${isTablet ? 'w-9 h-9' : 'w-7 h-7'}`} />
            </View>

            {/* 2. CHILD / LEARNER INFO CARD SKELETON */}
            <View className="mt-2">
              <View
                className={`bg-white border-[4px] border-[#F1F1F1] ${
                  isTablet ? 'rounded-[32px] p-6' : 'rounded-[20px] p-4'
                }`}
                style={{
                  shadowColor: '#F1F1F1',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3.5 flex-1">
                    <SkeletonBlock
                      className={`rounded-full ${isTablet ? 'w-16 h-16' : 'w-12 h-12'}`}
                    />
                    <View className="flex-1 justify-center gap-1.5">
                      <SkeletonBlock className={`rounded-md ${isTablet ? 'w-40 h-7' : 'w-32 h-5'}`} />
                      <View className="flex-row items-center gap-1.5 mt-1">
                        <SkeletonBlock className="w-24 h-5 rounded-[6px]" />
                        <SkeletonBlock className="w-28 h-5 rounded-[6px]" />
                      </View>
                    </View>
                  </View>
                </View>

                <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-[#F1F1F1]">
                  <SkeletonBlock className="w-36 h-7 rounded-[6px]" />
                  <SkeletonBlock className="w-24 h-7 rounded-[6px]" />
                </View>
              </View>
            </View>

            {/* 3. LEARNER MILESTONES SKELETON */}
            <View className="mt-2">
              <View
                className={`bg-white border-[4px] border-[#F1F1F1] ${
                  isTablet ? 'rounded-[32px] p-6' : 'rounded-[24px] p-5'
                }`}
                style={{
                  shadowColor: '#F1F1F1',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                {/* Header Row */}
                <View className="flex-row items-center justify-between mb-4">
                  <SkeletonBlock className={`rounded-md ${isTablet ? 'w-44 h-7' : 'w-36 h-5'}`} />
                  <SkeletonBlock className={`rounded-full ${isTablet ? 'w-28 h-7' : 'w-20 h-6'}`} />
                </View>

                {/* Milestones Circular Badge Grid */}
                <View className="flex-row flex-wrap justify-center items-start gap-3 sm:gap-6 py-2">
                  {[1, 2, 3].map((i) => (
                    <View key={i} className="items-center mb-2" style={{ width: isTablet ? 110 : 88 }}>
                      <SkeletonBlock
                        className={`rounded-full border-[3px] border-[#E5E7EB] ${
                          isTablet ? 'w-[84px] h-[84px]' : 'w-[64px] h-[64px]'
                        }`}
                      />
                      <SkeletonBlock className={`rounded-md mt-2 ${isTablet ? 'w-20 h-4' : 'w-16 h-3'}`} />
                      <SkeletonBlock className={`rounded-[5px] mt-1.5 ${isTablet ? 'w-16 h-4' : 'w-12 h-3.5'}`} />
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* 3. TEACHER FEEDBACKS SKELETON */}
            <View className="flex-col mt-6 mb-8">
              <View className="mb-4 flex-row items-center justify-between">
                <SkeletonBlock className={`rounded-md ${isTablet ? 'w-48 h-8' : 'w-36 h-6'}`} />
              </View>

              <View className="gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    className={`bg-white border-[2px] border-[#F1F1F1] flex-row items-center justify-between ${
                      isTablet ? 'rounded-[24px] p-5' : 'rounded-[16px] p-3.5'
                    }`}
                    style={{
                      shadowColor: '#F1F1F1',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 2,
                    }}
                  >
                    <View className="flex-1 pr-3 flex-col gap-2">
                      <SkeletonBlock className="w-3/4 h-5 rounded-md" />
                      <SkeletonBlock className="w-1/2 h-4 rounded-md" />
                      <View className="flex-row items-center gap-2 mt-1">
                        <SkeletonBlock className="w-20 h-5 rounded-[6px]" />
                        <SkeletonBlock className="w-24 h-4 rounded-md" />
                      </View>
                    </View>
                    <SkeletonBlock className="w-16 h-6 rounded-[6px] shrink-0" />
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ParentAnalyticsSkeleton() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* PAGE TITLE HEADER & CONTROL BUTTONS */}
        <View className={`w-full ${isTablet ? 'px-12 pt-4' : 'px-6 pt-2'}`}>
          <View className="flex-row flex-wrap items-center justify-between gap-3 mb-4">
            <SkeletonBlock className={`rounded-md ${isTablet ? 'w-48 h-10' : 'w-36 h-8'}`} />
            <View className="flex-row items-center gap-2">
              <SkeletonBlock className="w-36 h-[38px] rounded-xl" />
              <SkeletonBlock className="w-40 h-[38px] rounded-xl" />
            </View>
          </View>
        </View>

        {/* CONTENT CONTAINER */}
        <View className={`w-full ${isTablet ? 'px-12' : 'px-6'}`}>
          <View className="flex-col gap-4">
            {/* 1. STAT CARDS SKELETON */}
            <View className="flex-row gap-3 mt-1">
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  className={`border-[4px] border-[#F1F1F1] bg-white justify-center items-center flex-1 ${
                    isTablet ? 'rounded-[32px] p-4 min-w-[160px]' : 'rounded-[20px] p-3 min-w-[100px]'
                  }`}
                  style={{
                    shadowColor: '#F1F1F1',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 2,
                    ...(!isTablet ? { aspectRatio: 1 } : { height: 140 }),
                  }}
                >
                  <SkeletonBlock className="w-16 h-3 rounded-md mt-1" />
                  <SkeletonBlock className={`rounded-full my-2 ${isTablet ? 'w-10 h-10' : 'w-7 h-7'}`} />
                  <SkeletonBlock className={`rounded-md mb-1 ${isTablet ? 'w-14 h-8' : 'w-10 h-6'}`} />
                </View>
              ))}
            </View>

            {/* 2. NARRATIVE SUMMARY SKELETON */}
            <View className="flex-col mt-6 w-full">
              <View className="mb-4 flex-row items-center justify-between">
                <SkeletonBlock className={`rounded-md ${isTablet ? 'w-36 h-8' : 'w-24 h-6'}`} />
              </View>

              <View
                className={`bg-white border border-[#E5E7EB] ${
                  isTablet ? 'rounded-[32px] p-6' : 'rounded-[24px] p-5'
                }`}
                style={{
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.03,
                  shadowRadius: 10,
                  elevation: 1,
                }}
              >
                <View className="flex-col gap-4">
                  {[1, 2, 3].map((i) => (
                    <View
                      key={i}
                      className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl p-4 flex-col gap-2.5"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                          <SkeletonBlock className="w-3.5 h-3.5 rounded-full" />
                          <SkeletonBlock className="w-40 h-5 rounded-md" />
                        </View>
                        <View className="flex-row items-center gap-2 shrink-0">
                          <SkeletonBlock className="w-24 h-6 rounded-full" />
                          <SkeletonBlock className="w-5 h-5 rounded-md" />
                        </View>
                      </View>
                      <SkeletonBlock className="w-full h-3.5 rounded-md mt-1" />
                      <SkeletonBlock className="w-4/5 h-3.5 rounded-md" />
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* 3. PROGRESS OVER TIME (TREND) SKELETON */}
            <View className="flex-col mt-6">
              <View className="mb-4 flex-row items-center justify-between">
                <SkeletonBlock className={`rounded-md ${isTablet ? 'w-52 h-7' : 'w-40 h-6'}`} />
              </View>

              <View
                className={`border border-[#E5E7EB] bg-white overflow-hidden ${
                  isTablet ? 'rounded-[32px] p-6' : 'rounded-[24px] p-5'
                }`}
                style={{
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.03,
                  shadowRadius: 10,
                  elevation: 1,
                }}
              >
                {/* Metric Header & Forecast Pill Split Row */}
                <View className="flex-row items-start justify-between gap-4 px-2 mb-4">
                  <View className="flex-col flex-1 gap-1">
                    <View className="flex-row items-center gap-3">
                      <SkeletonBlock className="w-24 h-9 rounded-md" />
                      <SkeletonBlock className="w-16 h-6 rounded-full" />
                    </View>
                    <SkeletonBlock className="w-36 h-3.5 rounded-md mt-1" />
                    <SkeletonBlock className="w-48 h-3 rounded-md mt-1" />
                  </View>
                  <SkeletonBlock className="w-44 h-16 rounded-2xl shrink-0" />
                </View>

                {/* SVG Chart Area */}
                <SkeletonBlock className="w-full h-44 rounded-xl mt-1" />
              </View>
            </View>

            {/* 4. ACTIVITY PERFORMANCE SKELETON */}
            <View className="flex-col mt-6 flex-1">
              <View className="mb-4">
                <SkeletonBlock className={`rounded-md ${isTablet ? 'w-56 h-7' : 'w-44 h-6'}`} />
              </View>

              <View
                className={`border border-[#E5E7EB] bg-white overflow-hidden ${
                  isTablet ? 'rounded-[32px] p-6' : 'rounded-[24px] p-5'
                }`}
                style={{
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.03,
                  shadowRadius: 10,
                  elevation: 1,
                }}
              >
                <View className="flex-col gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <View key={i} className="flex-col gap-1.5">
                      <View className="flex-row items-center justify-between">
                        <SkeletonBlock className="w-36 h-4 rounded-md" />
                        <SkeletonBlock className="w-10 h-4 rounded-md" />
                      </View>
                      <SkeletonBlock className="w-full h-3 rounded-full" />
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* 5. SKILL PERFORMANCE SKELETON */}
            <View className="flex-col mt-6 flex-1">
              <View className="mb-4">
                <SkeletonBlock className={`rounded-md ${isTablet ? 'w-48 h-7' : 'w-36 h-6'}`} />
              </View>

              <View
                className={`bg-white border border-[#E5E7EB] ${
                  isTablet ? 'rounded-[32px] p-6' : 'rounded-[24px] p-5'
                }`}
                style={{
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.03,
                  shadowRadius: 10,
                  elevation: 1,
                }}
              >
                <View className={`w-full ${isTablet ? 'flex-row items-center justify-between gap-6' : 'flex-col gap-4'}`}>
                  <View className={`items-center justify-center ${isTablet ? 'w-[45%]' : 'w-full'}`}>
                    <SkeletonBlock className="w-48 h-48 rounded-full" />
                  </View>
                  <View className={`flex-col gap-2.5 ${isTablet ? 'w-[52%]' : 'w-full'}`}>
                    {[1, 2, 3, 4].map((i) => (
                      <SkeletonBlock key={i} className="w-full h-11 rounded-xl" />
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* 6. DOMAIN EXPLAINERS SKELETON */}
            <View className="flex-col mt-6 mb-8 w-full">
              <View className="mb-4 flex-col gap-1">
                <SkeletonBlock className={`rounded-md ${isTablet ? 'w-64 h-8' : 'w-48 h-6'}`} />
                <SkeletonBlock className={`rounded-md ${isTablet ? 'w-80 h-4' : 'w-60 h-3'}`} />
              </View>

              <View
                className={`bg-white border border-[#E5E7EB] ${
                  isTablet ? 'rounded-[32px] p-6' : 'rounded-[24px] p-5'
                }`}
                style={{
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.03,
                  shadowRadius: 10,
                  elevation: 1,
                }}
              >
                <View className="flex-col gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <View
                      key={i}
                      className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl p-4 flex-col gap-2"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2.5 flex-1">
                          <SkeletonBlock className="w-3.5 h-3.5 rounded-full" />
                          <SkeletonBlock className="w-36 h-5 rounded-md" />
                        </View>
                        <SkeletonBlock className="w-5 h-5 rounded-md" />
                      </View>
                      <SkeletonBlock className="w-full h-4 rounded-md" />
                    </View>
                  ))}
                </View>
              </View>
            </View>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ParentDashboardSkeleton({ variant = 'home' }: { variant?: 'home' | 'analytics' }) {
  if (variant === 'analytics') {
    return <ParentAnalyticsSkeleton />;
  }
  return <ParentHomeSkeleton />;
}

export default ParentDashboardSkeleton;
