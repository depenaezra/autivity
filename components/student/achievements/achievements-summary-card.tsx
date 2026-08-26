import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AchievementsSummaryCardProps {
  unlockedCount: number;
  totalCount: number;
  isTablet: boolean;
}

export function AchievementsSummaryCard({
  unlockedCount,
  totalCount,
  isTablet,
}: AchievementsSummaryCardProps) {
  return (
    <View
      className={`w-full bg-[#FEF9C3] border-[3px] border-[#FDE047] border-b-[6px] flex-row items-center justify-between ${
        isTablet ? 'rounded-[28px] p-8 mb-10' : 'rounded-[20px] p-5 mb-8'
      }`}
    >
      <View className="flex-row items-center">
        <View
          className={`bg-[#FACC15] items-center justify-center rounded-full ${
            isTablet ? 'w-20 h-20 mr-6' : 'w-14 h-14 mr-4'
          }`}
        >
          <Ionicons name="trophy" size={isTablet ? 40 : 28} color="white" />
        </View>
        <View>
          <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
            {unlockedCount} {unlockedCount === 1 ? 'Badge' : 'Badges'} Unlocked
          </Text>
          <Text className={`font-quicksand-semibold text-[#A16207] ${isTablet ? 'text-xl mt-1' : 'text-sm'}`}>
            out of {totalCount} badges
          </Text>
        </View>
      </View>
    </View>
  );
}
