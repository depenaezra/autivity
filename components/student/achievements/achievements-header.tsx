import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderBg from '@/assets/images/achievements-header.svg';

interface AchievementsHeaderProps {
  studentName?: string;
  isTablet: boolean;
}

export function AchievementsHeader({ isTablet }: AchievementsHeaderProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 16);
  const svgNativeHeight = isTablet ? 180 : 135;
  const bannerHeight = svgNativeHeight + topInset;

  return (
    <View className="w-full">
      <View
        className="w-full relative justify-center px-6"
        style={{ height: bannerHeight }}
      >
        <View className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
          <HeaderBg
            width="100%"
            height="100%"
            preserveAspectRatio="xMaxYMid slice"
          />
        </View>

        <View className="w-2/3 z-10 pl-5" style={{ paddingTop: topInset / 2 }}>
          <Text className={`font-fredoka-one text-[#374151] leading-none ${isTablet ? 'text-[44px]' : 'text-[32px]'}`}>
            Achievements
          </Text>
        </View>
      </View>
    </View>
  );
}
