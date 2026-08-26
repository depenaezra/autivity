import React, { useEffect } from 'react';
import { View, useWindowDimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

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

export function ParentDashboardSkeleton() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#F5F8FA]">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className={`bg-[#F5F8FA] ${isTablet ? 'px-12 py-6' : 'px-6 py-4'}`}>
          <View className="flex-col gap-4">

            {/* 1. HEADER & CHILD CARD SKELETON */}
            <View className="w-full flex-col">
              {/* Header Top Bar */}
              <View className="w-full flex-row justify-between items-center">
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

              {/* Child & Learner Info Card */}
              <View className="mt-5">
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
                        className={`rounded-full ${
                          isTablet ? 'w-16 h-16' : 'w-12 h-12'
                        }`}
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
            </View>

            {/* 2. STATS SECTION SKELETON */}
            <View className="flex-row gap-3 mt-4">
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
                    ...(!isTablet ? { aspectRatio: 1 } : { height: 155 }),
                  }}
                >
                  <SkeletonBlock className="w-16 h-3 rounded-md mt-1" />
                  <SkeletonBlock className={`rounded-full my-2 ${isTablet ? 'w-10 h-10' : 'w-7 h-7'}`} />
                  <SkeletonBlock className={`rounded-md mb-1 ${isTablet ? 'w-14 h-8' : 'w-10 h-6'}`} />
                </View>
              ))}
            </View>

            {/* 3. PROGRESS OVER TIME SKELETON */}
            <View className="flex-col mt-6">
              <View className="mb-4">
                <View className="flex-row flex-wrap items-center justify-between gap-4">
                  <SkeletonBlock className={`rounded-md ${isTablet ? 'w-52 h-7' : 'w-40 h-6'}`} />
                  <View className="flex-row items-center gap-1.5">
                    {[1, 2, 3, 4].map((f) => (
                      <SkeletonBlock key={f} className={`rounded-[8px] ${isTablet ? 'w-16 h-8' : 'w-12 h-6'}`} />
                    ))}
                  </View>
                </View>
              </View>

              <View
                className={`border-[4px] border-[#F1F1F1] bg-white mt-3 overflow-hidden ${
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
                <SkeletonBlock className="w-full h-44 rounded-xl" />
              </View>
            </View>

            {/* 4. ACTIVITY PERFORMANCE SKELETON */}
            <View className="flex-col mt-6 flex-1">
              <View className="mb-4">
                <View className="flex-row flex-wrap items-center justify-between gap-4">
                  <SkeletonBlock className={`rounded-md ${isTablet ? 'w-56 h-7' : 'w-44 h-6'}`} />
                  <View className="flex-row items-center gap-1.5">
                    {[1, 2, 3, 4].map((f) => (
                      <SkeletonBlock key={f} className={`rounded-[8px] ${isTablet ? 'w-16 h-8' : 'w-12 h-6'}`} />
                    ))}
                  </View>
                </View>
              </View>

              <View
                className={`border-[4px] border-[#F1F1F1] bg-white mt-3 overflow-hidden ${
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
                <View className="flex-col gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <View key={i} className="flex-col gap-1.5">
                      <View className="flex-row items-center justify-between">
                        <SkeletonBlock className="w-32 h-4 rounded-md" />
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
                <View className="flex-row flex-wrap items-center justify-between gap-4">
                  <SkeletonBlock className={`rounded-md ${isTablet ? 'w-48 h-7' : 'w-36 h-6'}`} />
                  <View className="flex-row items-center gap-1.5">
                    {[1, 2, 3, 4].map((f) => (
                      <SkeletonBlock key={f} className={`rounded-[8px] ${isTablet ? 'w-16 h-8' : 'w-12 h-6'}`} />
                    ))}
                  </View>
                </View>
              </View>

              <View
                className={`bg-white border-[1px] border-[#E5E7EB] mt-3 ${
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

            {/* 6. TEACHER FEEDBACK SKELETON */}
            <View className="flex-col mt-6 mb-12 pb-6">
              <View className="mb-4">
                <View className="flex-row items-center justify-between">
                  <SkeletonBlock className={`rounded-md ${isTablet ? 'w-48 h-8' : 'w-36 h-6'}`} />
                  <SkeletonBlock className={`rounded-[8px] border-[2px] border-[#E5E7EB] ${isTablet ? 'w-36 h-9' : 'w-28 h-7'}`} />
                </View>
              </View>

              <View className="gap-3">
                {[1, 2, 3].map((i) => (
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
                      <SkeletonBlock className="w-full h-4 rounded-md" />
                      <SkeletonBlock className="w-3/4 h-4 rounded-md" />
                      <View className="flex-row items-center gap-2 mt-1">
                        <SkeletonBlock className="w-20 h-5 rounded-[6px]" />
                        <SkeletonBlock className="w-16 h-4 rounded-md" />
                      </View>
                    </View>
                    <SkeletonBlock className="w-20 h-6 rounded-[6px] shrink-0" />
                  </View>
                ))}
              </View>
            </View>

          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default ParentDashboardSkeleton;
