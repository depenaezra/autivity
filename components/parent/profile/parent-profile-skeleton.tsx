import React, { useEffect } from 'react';
import { View, useWindowDimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export function ParentProfileSkeleton() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]" edges={['top']}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: isTablet ? 32 : 16,
          paddingTop: isTablet ? 24 : 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. HEADER CARD SKELETON */}
        <View
          className={`w-full bg-white ${
            isTablet ? 'rounded-[32px]' : 'rounded-[24px]'
          } border-[4px] border-[#F1F1F1] overflow-hidden mb-6`}
          style={{
            shadowColor: '#F1F1F1',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 3,
          }}
        >
          {/* Top Banner Skeleton */}
          <SkeletonBlock className={`w-full ${isTablet ? 'h-[180px]' : 'h-[130px]'}`} />

          {/* Content Container */}
          <View className={`px-5 pb-5 ${isTablet ? 'px-8 pb-6' : 'px-5 pb-5'}`}>
            <View className="flex-row items-end justify-between -mt-[45px] mb-3">
              {/* Avatar Circle */}
              <SkeletonBlock
                className={`rounded-full border-[4px] border-white ${
                  isTablet ? 'w-[110px] h-[110px]' : 'w-[88px] h-[88px]'
                }`}
              />
              {/* Edit Button Pill */}
              <SkeletonBlock
                className={`rounded-[8px] border-[2px] border-[#E5E7EB] ${
                  isTablet ? 'w-20 h-9' : 'w-16 h-7'
                }`}
              />
            </View>

            {/* Name & Email Placeholders */}
            <View className="mt-1 gap-2">
              <SkeletonBlock className={`rounded-md ${isTablet ? 'w-56 h-8' : 'w-44 h-6'}`} />
              <SkeletonBlock className={`rounded-md ${isTablet ? 'w-48 h-5' : 'w-36 h-4'}`} />
            </View>
          </View>
        </View>

        {/* 2. MENU SECTIONS CARD SKELETON */}
        <View
          className={`w-full bg-white ${
            isTablet ? 'rounded-[32px]' : 'rounded-[24px]'
          } border-[4px] border-[#F1F1F1] overflow-hidden mb-6`}
          style={{
            shadowColor: '#F1F1F1',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 3,
          }}
        >
          {/* Accordion Item 1: Personal Info */}
          <View className="border-b border-[#F1F1F1] p-4 flex-col gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3.5 flex-1">
                <SkeletonBlock className="w-9 h-9 rounded-full" />
                <SkeletonBlock className={`rounded-md ${isTablet ? 'w-48 h-6' : 'w-36 h-5'}`} />
              </View>
              <SkeletonBlock className="w-5 h-5 rounded-md" />
            </View>

            <View className="bg-[#F9FAFB] rounded-xl p-3.5 gap-2.5 mt-1">
              <View className="flex-row items-center justify-between border-b border-[#E5E7EB] pb-2">
                <SkeletonBlock className="w-24 h-4 rounded-md" />
                <SkeletonBlock className="w-32 h-4 rounded-md" />
              </View>
              <View className="flex-row items-center justify-between">
                <SkeletonBlock className="w-20 h-4 rounded-md" />
                <SkeletonBlock className="w-40 h-4 rounded-md" />
              </View>
            </View>
          </View>

          {/* Accordion Item 2: Learner Details */}
          <View className="border-b border-[#F1F1F1] p-4 flex-col gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3.5 flex-1">
                <SkeletonBlock className="w-9 h-9 rounded-full" />
                <SkeletonBlock className={`rounded-md ${isTablet ? 'w-44 h-6' : 'w-32 h-5'}`} />
              </View>
              <SkeletonBlock className="w-5 h-5 rounded-md" />
            </View>

            <View className="bg-[#F9FAFB] rounded-xl p-3.5 gap-2.5 mt-1">
              <View className="flex-row items-center justify-between border-b border-[#E5E7EB] pb-2">
                <SkeletonBlock className="w-24 h-4 rounded-md" />
                <SkeletonBlock className="w-28 h-4 rounded-md" />
              </View>
              <View className="flex-row items-center justify-between">
                <SkeletonBlock className="w-24 h-4 rounded-md" />
                <SkeletonBlock className="w-20 h-6 rounded-[6px]" />
              </View>
            </View>
          </View>

          {/* Accordion Item 3: Account */}
          <View className="border-b border-[#F1F1F1] p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3.5 flex-1">
              <SkeletonBlock className="w-9 h-9 rounded-full" />
              <SkeletonBlock className={`rounded-md ${isTablet ? 'w-36 h-6' : 'w-28 h-5'}`} />
            </View>
            <SkeletonBlock className="w-5 h-5 rounded-md" />
          </View>

          {/* Accordion Item 4: Privacy Policy */}
          <View className="border-b border-[#F1F1F1] p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3.5 flex-1">
              <SkeletonBlock className="w-9 h-9 rounded-full" />
              <SkeletonBlock className={`rounded-md ${isTablet ? 'w-40 h-6' : 'w-32 h-5'}`} />
            </View>
            <SkeletonBlock className="w-5 h-5 rounded-md" />
          </View>

          {/* Accordion Item 5: Terms and Conditions */}
          <View className="p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3.5 flex-1">
              <SkeletonBlock className="w-9 h-9 rounded-full" />
              <SkeletonBlock className={`rounded-md ${isTablet ? 'w-48 h-6' : 'w-40 h-5'}`} />
            </View>
            <SkeletonBlock className="w-5 h-5 rounded-md" />
          </View>
        </View>

        {/* 3. PROFILE ACTION BUTTONS SKELETON */}
        <View className={`w-full mb-8 ${isTablet ? 'gap-y-4' : 'gap-y-3'}`}>
          <SkeletonBlock className={`w-full rounded-[12px] ${isTablet ? 'h-14' : 'h-12'}`} />
          <SkeletonBlock className={`w-full rounded-[12px] ${isTablet ? 'h-14' : 'h-12'}`} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

export default ParentProfileSkeleton;
