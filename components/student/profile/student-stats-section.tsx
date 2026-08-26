import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface StudentStatsSectionProps {
  sessionCount: number;
  badgesCount: number;
  isLoading: boolean;
  isTablet?: boolean;
}

export function StudentStatsSection({
  sessionCount,
  badgesCount,
  isLoading,
  isTablet = false,
}: StudentStatsSectionProps) {
  return (
    <View
      className={`w-full bg-white ${
        isTablet ? 'rounded-[32px] p-6' : 'rounded-[24px] p-4'
      } border-[4px] border-[#F1F1F1] mb-6`}
      style={{
        shadowColor: '#F1F1F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 2,
      }}
    >
      {/* Section Title Header with horizontal divider line */}
      <View className="flex-row items-center pb-3 mb-3 border-b border-[#F1F1F1]">
        <Feather name="award" size={isTablet ? 16 : 14} color="#62A9E6" className="mr-2" />
        <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-xl' : 'text-base'}`}>
          Student Stats
        </Text>
      </View>

      <View className="flex-row justify-around items-center pt-2">
        {/* Total Completed Sessions */}
        <View className="items-center">
          {isLoading ? (
            <ActivityIndicator color="#62A9E6" size="small" />
          ) : (
            <Text className={`font-fredoka-one text-[#62A9E6] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
              {sessionCount}
            </Text>
          )}
          <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-base mt-1' : 'text-xs'}`}>
            Sessions
          </Text>
        </View>

        <View className="h-8 w-[1px] bg-[#F1F1F1]" />

        {/* Total Badges / Achievements */}
        <View className="items-center">
          {isLoading ? (
            <ActivityIndicator color="#FACC15" size="small" />
          ) : (
            <Text className={`font-fredoka-one text-[#FACC15] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
              {badgesCount}
            </Text>
          )}
          <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-base mt-1' : 'text-xs'}`}>
            Achievements
          </Text>
        </View>
      </View>
    </View>
  );
}
