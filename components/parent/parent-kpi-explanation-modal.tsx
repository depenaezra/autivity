import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BaseModal } from '../teacher/home/base-modal';

export type ParentMetricKey = 'performance' | 'avgSession' | 'totalSessions';

interface ParentKpiExplanationModalProps {
  visible: boolean;
  onClose: () => void;
  initialMetric?: ParentMetricKey | null;
  stats: {
    overallPerformance: number;
    avgSessionMinutes?: number;
    avgSessionSeconds?: number;
    totalSessions: number;
  };
  isTablet: boolean;
}

interface MetricGuideContent {
  key: ParentMetricKey;
  tabLabel: string;
  title: string;
  iconName: keyof typeof Feather.glyphMap;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  whatItIs: string;
  levels: {
    label: string;
    description: string;
    dotColor: string;
  }[];
  friendlyTip: string;
}

const METRIC_GUIDES: MetricGuideContent[] = [
  {
    key: 'performance',
    tabLabel: 'Performance',
    title: 'Overall Performance',
    iconName: 'award',
    accentColor: '#62A9E6',
    bgColor: '#E0F2FE',
    borderColor: '#BBE8FB',
    whatItIs: 'Shows how accurately your child answered questions and completed tasks during activities.',
    levels: [
      {
        label: 'Mastered',
        description: 'Your child understands these activities well and can solve them comfortably on their own.',
        dotColor: '#179D33',
      },
      {
        label: 'Developing',
        description: 'Your child is making steady progress and getting the hang of these skills with practice.',
        dotColor: '#FFAE02',
      },
      {
        label: 'Needs Support',
        description: 'Your child is still exploring this skill and benefits from gentle encouragement or hints.',
        dotColor: '#FF8870',
      },
    ],
    friendlyTip: 'Mistakes are an essential part of learning. Celebrate effort and keep practice encouraging!',
  },
  {
    key: 'avgSession',
    tabLabel: 'Avg Session',
    title: 'Average Session Time',
    iconName: 'clock',
    accentColor: '#179D33',
    bgColor: '#F0FDF4',
    borderColor: '#CBFAC4',
    whatItIs: 'The average amount of time your child spends engaged in each learning session.',
    levels: [
      {
        label: 'Optimal Focus',
        description: 'A great learning window that keeps your child engaged without feeling tired or rushed.',
        dotColor: '#0284C7',
      },
      {
        label: 'Short Session',
        description: 'Quick practice check-in. Wonderful for busy days or keeping learning light.',
        dotColor: '#FFAE02',
      },
      {
        label: 'Extended',
        description: 'A longer learning session. Remember to take gentle stretch breaks to rest tired eyes.',
        dotColor: '#FF8870',
      },
    ],
    friendlyTip: 'Short, happy learning sessions each day are more effective than long, exhausting ones.',
  },
  {
    key: 'totalSessions',
    tabLabel: 'Sessions',
    title: 'Completed Sessions',
    iconName: 'activity',
    accentColor: '#FFAE02',
    bgColor: '#FFFBEB',
    borderColor: '#FFF3C4',
    whatItIs: 'The total number of learning games and classroom activities your child has finished.',
    levels: [
      {
        label: 'Active Logs',
        description: 'Each session builds a clear story of your child’s routine, confidence, and growth.',
        dotColor: '#179D33',
      },
    ],
    friendlyTip: 'Building a consistent daily routine helps children feel secure and excited to learn.',
  },
];

function formatDuration(stats: ParentKpiExplanationModalProps['stats']): string {
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

export function ParentKpiExplanationModal({
  visible,
  onClose,
  initialMetric,
  stats,
  isTablet,
}: ParentKpiExplanationModalProps) {
  const [selectedMetric, setSelectedMetric] = useState<ParentMetricKey>('performance');

  useEffect(() => {
    if (initialMetric) {
      setSelectedMetric(initialMetric);
    }
  }, [initialMetric, visible]);

  const activeGuide = METRIC_GUIDES.find((g) => g.key === selectedMetric) || METRIC_GUIDES[0];

  const getMetricSummary = (key: ParentMetricKey) => {
    if (stats.totalSessions === 0) {
      return { value: 'No sessions recorded yet', status: 'No Data' };
    }
    if (key === 'performance') {
      const isMastered = stats.overallPerformance >= 80;
      const isDev = stats.overallPerformance >= 65 && stats.overallPerformance < 80;
      return {
        value: `${stats.overallPerformance}% accuracy`,
        status: isMastered ? 'Mastered' : isDev ? 'Developing' : 'Needs Support',
      };
    }
    if (key === 'avgSession') {
      const mins =
        stats.avgSessionSeconds !== undefined
          ? stats.avgSessionSeconds / 60
          : stats.avgSessionMinutes ?? 0;
      const status = mins >= 10 && mins <= 20 ? 'Optimal Focus' : mins > 0 && mins < 10 ? 'Short Session' : 'Extended';
      return {
        value: `${formatDuration(stats)} per session`,
        status,
      };
    }
    return {
      value: `${stats.totalSessions} sessions completed`,
      status: 'Active Logs',
    };
  };

  const currentSummary = getMetricSummary(activeGuide.key);

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      isTablet={isTablet}
      cancelLabel="GOT IT"
      heightClassName={isTablet ? 'h-[64%]' : 'h-[74%]'}
      title="Card Guide"
    >
      <View className="flex-col gap-3 pt-1">
        {/* Metric Selector Tabs */}
        <View className="flex-row gap-2 bg-[#F5F7FA] p-1.5 rounded-xl">
          {METRIC_GUIDES.map((guide) => {
            const isTabActive = guide.key === activeGuide.key;
            return (
              <Pressable
                key={guide.key}
                onPress={() => setSelectedMetric(guide.key)}
                className={`flex-1 py-2 rounded-lg items-center justify-center ${
                  isTabActive ? 'bg-white shadow-sm' : 'bg-transparent'
                }`}
                style={
                  isTabActive
                    ? {
                        borderWidth: 1.5,
                        borderColor: guide.borderColor,
                      }
                    : undefined
                }
              >
                <Text
                  className={`font-fredoka-one text-xs uppercase ${
                    isTabActive ? '' : 'text-[#9CA3AF]'
                  }`}
                  style={{ color: isTabActive ? guide.accentColor : undefined }}
                  numberOfLines={1}
                >
                  {guide.tabLabel}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Current Value Hero Card */}
        <View
          className="border-[2px] rounded-2xl p-3.5 flex-row items-center gap-3.5"
          style={{
            backgroundColor: activeGuide.bgColor,
            borderColor: activeGuide.borderColor,
          }}
        >
          <View
            className="w-12 h-12 rounded-xl bg-white items-center justify-center border"
            style={{ borderColor: activeGuide.borderColor }}
          >
            <Feather name={activeGuide.iconName} size={24} color={activeGuide.accentColor} />
          </View>
          <View className="flex-1 justify-center">
            <Text className="font-fredoka-one text-[#484A4B] text-base">
              {activeGuide.title}
            </Text>
            <Text className="font-quicksand-bold text-[#4B5563] text-xs mt-0.5">
              {currentSummary.value}
            </Text>
            <View className="flex-row items-center mt-1">
              <View
                className="px-2 py-0.5 rounded-full border bg-white"
                style={{ borderColor: activeGuide.borderColor }}
              >
                <Text
                  className="font-quicksand-bold text-[10px]"
                  style={{ color: activeGuide.accentColor }}
                >
                  ● {currentSummary.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* What this means */}
        <View className="bg-white border-[2px] border-[#F1F1F1] rounded-2xl p-3.5">
          <View className="flex-row items-center gap-2 mb-1.5">
            <Feather name="info" size={16} color="#62A9E6" />
            <Text className="font-fredoka-one text-sm text-[#484A4B]">
              What does this mean?
            </Text>
          </View>
          <Text className="font-quicksand-medium text-xs text-[#4B5563] leading-relaxed">
            {activeGuide.whatItIs}
          </Text>
        </View>

        {/* Level Breakdown */}
        <View className="bg-white border-[2px] border-[#F1F1F1] rounded-2xl p-3.5">
          <Text className="font-fredoka-one text-sm text-[#484A4B] mb-2">
            Status Breakdown
          </Text>
          <View className="flex-col gap-2.5">
            {activeGuide.levels.map((lvl) => (
              <View key={lvl.label} className="flex-row items-start gap-2">
                <Text style={{ color: lvl.dotColor, fontSize: 13, marginTop: 1 }}>●</Text>
                <View className="flex-1">
                  <Text className="font-quicksand-bold text-xs text-[#484A4B]">
                    {lvl.label}
                  </Text>
                  <Text className="font-quicksand-medium text-[11px] text-[#6B7280] leading-snug mt-0.5">
                    {lvl.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Friendly Parent Tip */}
        <View className="bg-[#FFFBEB] border-[1.5px] border-[#FDE68A] rounded-2xl p-3 flex-row items-start gap-2.5">
          <Feather name="smile" size={16} color="#D97706" style={{ marginTop: 2 }} />
          <View className="flex-1">
            <Text className="font-fredoka-one text-xs text-[#92400E]">
              Helpful Tip
            </Text>
            <Text className="font-quicksand-medium text-[11px] text-[#B45309] leading-relaxed mt-0.5">
              {activeGuide.friendlyTip}
            </Text>
          </View>
        </View>
      </View>
    </BaseModal>
  );
}
