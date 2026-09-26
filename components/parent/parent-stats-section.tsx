import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { UNIVERSAL_BENCHMARK_TIERS } from '../../src/constants/benchmarkLegend';
import { ParentKpiExplanationModal, ParentMetricKey } from './parent-kpi-explanation-modal';

interface ParentStatsSectionProps {
  stats: {
    overallPerformance: number;
    avgSessionMinutes?: number;
    avgSessionSeconds?: number;
    totalSessions: number;
  };
  isTablet: boolean;
}

function formatSessionDuration(stats: ParentStatsSectionProps['stats']): string {
  if (stats.avgSessionSeconds !== undefined) {
    const mins = Math.floor(stats.avgSessionSeconds / 60);
    const secs = Math.round(stats.avgSessionSeconds % 60);
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }
  return `${stats.avgSessionMinutes ?? 0}m`;
}

interface CardConfig {
  key: ParentMetricKey;
  label: string;
  subtext: string;
  value: (stats: ParentStatsSectionProps['stats']) => string;
  borderColor: string;
  labelColor: string;
  iconName: keyof typeof Feather.glyphMap;
}

const cardConfigs: CardConfig[] = [
  {
    key: 'performance',
    label: 'Performance',
    subtext: 'accuracy',
    value: (stats) => `${stats.overallPerformance}%`,
    borderColor: '#BBE8FB',
    labelColor: '#62A9E6',
    iconName: 'award',
  },
  {
    key: 'avgSession',
    label: 'Avg Session',
    subtext: 'per session',
    value: (stats) => formatSessionDuration(stats),
    borderColor: '#CBFAC4',
    labelColor: '#179D33',
    iconName: 'clock',
  },
  {
    key: 'totalSessions',
    label: 'Sessions',
    subtext: 'completed',
    value: (stats) => `${stats.totalSessions}`,
    borderColor: '#FFF3C4',
    labelColor: '#FFAE02',
    iconName: 'activity',
  },
];

export function ParentStatsSection({ stats, isTablet }: ParentStatsSectionProps) {
  const [selectedCardForModal, setSelectedCardForModal] = useState<ParentMetricKey | null>(null);
  const hasNoSessions = stats.totalSessions === 0;

  const getCardStatusBadge = (key: ParentMetricKey) => {
    if (hasNoSessions) {
      return {
        title: 'No Data',
        color: '#9CA3AF',
        bgColor: '#F3F4F6',
        borderColor: '#E5E7EB',
      };
    }

    if (key === 'performance') {
      const isMastered = stats.overallPerformance >= 80;
      const isDev = stats.overallPerformance >= 65 && stats.overallPerformance < 80;
      const tier = isMastered
        ? UNIVERSAL_BENCHMARK_TIERS.mastered
        : isDev
        ? UNIVERSAL_BENCHMARK_TIERS.developing
        : UNIVERSAL_BENCHMARK_TIERS.support;

      return {
        title: tier.parentLabel,
        color: tier.accentColor,
        bgColor: tier.bgColor,
        borderColor: tier.borderColor,
      };
    }

    if (key === 'avgSession') {
      const mins =
        stats.avgSessionSeconds !== undefined
          ? stats.avgSessionSeconds / 60
          : stats.avgSessionMinutes ?? 0;

      if (mins >= 10 && mins <= 20) {
        return {
          title: 'Optimal Focus',
          color: '#0284C7',
          bgColor: '#E0F2FE',
          borderColor: '#BBE8FB',
        };
      } else if (mins > 0 && mins < 10) {
        return {
          title: 'Short Session',
          color: '#FFAE02',
          bgColor: '#FFFBEB',
          borderColor: '#FFF3C4',
        };
      } else {
        return {
          title: 'Extended',
          color: '#FF8870',
          bgColor: '#FFF7ED',
          borderColor: '#FFDBD4',
        };
      }
    }

    if (key === 'totalSessions') {
      return {
        title: 'Active Logs',
        color: '#15803D',
        bgColor: '#F0FDF4',
        borderColor: '#CBFAC4',
      };
    }

    return null;
  };

  return (
    <>
      <View className="flex-row gap-2.5 sm:gap-4 mt-4">
        {cardConfigs.map((config) => {
          const { key, label, subtext, value, borderColor, labelColor, iconName } = config;
          const badge = getCardStatusBadge(key);
          const iconSize = isTablet ? 36 : 24;

          return (
            <Pressable
              key={key}
              onPress={() => setSelectedCardForModal(key)}
              className={`border-[4px] bg-white justify-between items-center flex-1 active:scale-95 transition-transform ${
                isTablet ? 'rounded-[32px] p-4 min-h-[175px]' : 'rounded-[20px] p-2 min-h-[155px]'
              }`}
              style={{
                borderColor,
                shadowColor: borderColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              {/* Label */}
              <Text
                className={`font-fredoka-one tracking-[0.06em] text-center ${
                  isTablet ? 'text-sm mt-1' : 'text-[10px] mt-0.5'
                }`}
                style={{ color: labelColor, letterSpacing: isTablet ? 1.2 : 0.6 }}
                numberOfLines={1}
              >
                {label.toUpperCase()}
              </Text>

              {/* Icon */}
              <View className={`justify-center items-center ${isTablet ? 'my-1' : 'my-0.5'}`}>
                <Feather
                  name={iconName}
                  size={iconSize}
                  color={labelColor}
                />
              </View>

              {/* Value & Subtext */}
              <View className="items-center justify-center">
                <Text
                  className="font-fredoka-one text-[#484A4B] text-center"
                  style={{
                    fontSize: hasNoSessions ? (isTablet ? 13 : 11) : (isTablet ? 28 : 22),
                    lineHeight: hasNoSessions ? undefined : (isTablet ? 32 : 24),
                  }}
                  numberOfLines={1}
                >
                  {hasNoSessions ? 'No sessions' : value(stats)}
                </Text>
                {!hasNoSessions && (
                  <Text
                    className={`font-quicksand-bold text-[#9CA3AF] text-center ${
                      isTablet ? 'text-xs mt-0.5' : 'text-[9px] mt-0.5'
                    }`}
                  >
                    {subtext}
                  </Text>
                )}
              </View>

              {/* Universal Benchmark Status Pill without range description */}
              {badge && (
                <View
                  className={`w-full items-center justify-center mt-1 border-[1.5px] rounded-full ${
                    isTablet ? 'px-3 py-1' : 'px-1.5 py-0.5'
                  }`}
                  style={{ backgroundColor: badge.bgColor, borderColor: badge.borderColor }}
                >
                  <Text
                    className={`font-quicksand-bold text-center ${
                      isTablet ? 'text-xs' : 'text-[9px] leading-[12px]'
                    }`}
                    style={{ color: badge.color }}
                    numberOfLines={1}
                  >
                    ● {badge.title}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Simple, No-Jargon Parent KPI Explanation Modal */}
      <ParentKpiExplanationModal
        visible={selectedCardForModal !== null}
        onClose={() => setSelectedCardForModal(null)}
        initialMetric={selectedCardForModal}
        stats={stats}
        isTablet={isTablet}
      />
    </>
  );
}
