import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ParentStatsSectionProps {
  stats: {
    overallPerformance: number;
    avgSessionMinutes: number;
    totalSessions: number;
  };
  isTablet: boolean;
}

const cardConfigs = [
  {
    key: 'performance',
    label: 'PERFORMANCE',
    value: (stats: ParentStatsSectionProps['stats']) => `${stats.overallPerformance}%`,
    borderColor: '#BBE8FB',
    labelColor: '#62A9E6',
    iconName: 'trophy' as const,
  },
  {
    key: 'avgSession',
    label: 'AVG SESSION',
    value: (stats: ParentStatsSectionProps['stats']) => `${stats.avgSessionMinutes}m`,
    borderColor: '#CBFAC4',
    labelColor: '#179D33',
    iconName: 'time' as const,
  },
  {
    key: 'totalSessions',
    label: 'SESSIONS',
    value: (stats: ParentStatsSectionProps['stats']) => `${stats.totalSessions}`,
    borderColor: '#FFF3C4',
    labelColor: '#FFAE02',
    iconName: 'flame' as const,
  },
];

export function ParentStatsSection({ stats, isTablet }: ParentStatsSectionProps) {
  return (
    <View className="flex-row gap-3 mt-4">
      {cardConfigs.map((config) => {
        const { key, label, value, borderColor, labelColor, iconName } = config;

        return (
          <View
            key={key}
            className={`border-[4px] bg-white justify-center items-center flex-1 ${
              isTablet ? 'rounded-[32px] p-4 min-w-[160px]' : 'rounded-[20px] p-3 min-w-[100px]'
            }`}
            style={{
              borderColor,
              shadowColor: borderColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
              ...(!isTablet ? { aspectRatio: 1 } : { height: 155 }),
            }}
          >
            {/* Label */}
            <Text
              className={`font-fredoka-one tracking-[0.06em] text-center ${
                isTablet ? 'text-sm mt-1' : 'text-[10px] mt-1'
              }`}
              style={{ color: labelColor, letterSpacing: isTablet ? 1.2 : 0.6 }}
              numberOfLines={1}
            >
              {label}
            </Text>

            {/* Icon */}
            <View className={`justify-center items-center ${isTablet ? 'my-2' : 'my-1'}`}>
              <Ionicons
                name={iconName}
                size={isTablet ? 40 : 26}
                color={labelColor}
              />
            </View>

            {/* Value / Count */}
            <Text
              className={`font-fredoka-one text-[#484A4B] text-center ${
                isTablet ? 'text-3xl mb-1' : 'text-[22px] mb-1'
              }`}
            >
              {value(stats)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
