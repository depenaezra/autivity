import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StudentSessionStats } from '../../../../src/services/student-analytics';
import { BaseModal } from '../../home/base-modal';
import { UniversalLegendModal } from '../../../analytics/universal-legend-modal';
import {
  UNIVERSAL_BENCHMARK_TIERS,
  getMistakesTier,
  getHintsTier,
} from '../../../../src/constants/benchmarkLegend';

export type MetricKey = 'duration' | 'mistakes' | 'hints';

interface MetricDetailConfig {
  key: MetricKey;
  label: string;
  modalTitle: string;
  iconName: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  description: string;
  formula: string;
  interpretation: string;
}

export const METRIC_DETAILS: MetricDetailConfig[] = [
  {
    key: 'duration',
    label: 'Avg Session',
    modalTitle: 'Average Session Duration',
    iconName: 'clock',
    accentColor: '#62A9E6',
    bgColor: '#E0F2FE',
    borderColor: '#BBE8FB',
    description: 'Average time spent actively engaged in a learning or game session.',
    formula: 'Total Duration (all sessions) ÷ Total Completed Sessions',
    interpretation: 'Consistent durations reflect regular engagement. Significant drops or spikes may highlight fatigue or task difficulty.',
  },
  {
    key: 'mistakes',
    label: 'Avg Mistakes',
    modalTitle: 'Average Mistakes per Session',
    iconName: 'alert-circle',
    accentColor: '#F43F5E',
    bgColor: '#FFF1F2',
    borderColor: '#FECDD3',
    description: 'Average number of incorrect attempts made by the student per activity session.',
    formula: 'Total Mistakes (all sessions) ÷ Total Completed Sessions',
    interpretation: 'Lower is better. A lower average (closer to 0) indicates high accuracy and mastery. A higher average suggests a need for review or prerequisite practice.',
  },
  {
    key: 'hints',
    label: 'Avg Hints',
    modalTitle: 'Average Hints per Session',
    iconName: 'help-circle',
    accentColor: '#FFAE02',
    bgColor: '#FEF3C7',
    borderColor: '#FDE68A',
    description: 'Average number of guidance prompts or cues requested/used per activity session.',
    formula: 'Total Hints Used (all sessions) ÷ Total Completed Sessions',
    interpretation: 'Lower indicates higher learner independence. When hints trend downward alongside low mistakes, the student is achieving autonomous mastery.',
  },
];

interface StudentKpiCalculationModalProps {
  visible: boolean;
  onClose: () => void;
  initialMetric?: MetricKey | null;
  stats: StudentSessionStats | null;
  filter: string;
  isTablet: boolean;
}

export function StudentKpiCalculationModal({
  visible,
  onClose,
  initialMetric,
  stats,
  filter,
  isTablet,
}: StudentKpiCalculationModalProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('mistakes');
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  useEffect(() => {
    if (initialMetric) {
      setSelectedMetric(initialMetric);
    }
  }, [initialMetric, visible]);

  const activeConfig = METRIC_DETAILS.find((m) => m.key === selectedMetric) || METRIC_DETAILS[1];

  const formatDuration = (avgSeconds: number) => {
    const minutes = Math.floor(avgSeconds / 60);
    const seconds = Math.round(avgSeconds % 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const hasNoSessions = !stats || stats.totalSessions === 0;

  const getLiveCalculationText = (key: MetricKey) => {
    if (hasNoSessions) {
      return 'No completed sessions recorded for the selected filter.';
    }

    if (key === 'mistakes') {
      const total = stats.totalMistakes ?? Math.round(stats.averageMistakes * stats.totalSessions);
      return `${total} mistakes ÷ ${stats.totalSessions} sessions = ${stats.averageMistakes.toFixed(1)} mistakes / session`;
    }

    if (key === 'hints') {
      const total = stats.totalHints ?? Math.round(stats.averageHints * stats.totalSessions);
      return `${total} hints ÷ ${stats.totalSessions} sessions = ${stats.averageHints.toFixed(1)} hints / session`;
    }

    const totalSeconds = stats.totalDuration ?? Math.round(stats.averageDuration * stats.totalSessions);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const remainingSecs = totalSeconds % 60;
    return `${totalMinutes}m ${remainingSecs}s total duration ÷ ${stats.totalSessions} sessions = ${formatDuration(stats.averageDuration)} / session`;
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      isTablet={isTablet}
      cancelLabel="GOT IT"
      heightClassName={isTablet ? 'h-[68%]' : 'h-[76%]'}
      title="Calculation & Guide"
    >
      <View className="flex-col gap-4 pt-1">
        {/* Metric Selector Tabs inside Modal */}
        <View className="flex-row gap-2 bg-[#F5F7FA] p-1.5 rounded-xl">
          {METRIC_DETAILS.map((c) => {
            const isTabActive = c.key === activeConfig.key;
            return (
              <Pressable
                key={c.key}
                onPress={() => setSelectedMetric(c.key)}
                className={`flex-1 py-2 rounded-lg items-center justify-center ${
                  isTabActive ? 'bg-white shadow-sm' : 'bg-transparent'
                }`}
                style={
                  isTabActive
                    ? {
                        borderWidth: 1.5,
                        borderColor: c.borderColor,
                      }
                    : undefined
                }
              >
                <Text
                  className={`font-fredoka-one text-xs uppercase ${
                    isTabActive ? '' : 'text-[#9CA3AF]'
                  }`}
                  style={{ color: isTabActive ? c.accentColor : undefined }}
                >
                  {c.label.replace('Avg ', '')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Metric Summary Box */}
        <View
          className="rounded-2xl p-4 border-[2px]"
          style={{ backgroundColor: activeConfig.bgColor, borderColor: activeConfig.borderColor }}
        >
          <View className="flex-row justify-between items-center mb-1.5">
            <View className="flex-row items-center gap-2">
              <View
                className="w-7 h-7 rounded-full items-center justify-center bg-white"
              >
                <Feather name={activeConfig.iconName as any} size={16} color={activeConfig.accentColor} />
              </View>
              <Text className="font-fredoka-one text-base text-[#484A4B]">
                {activeConfig.modalTitle}
              </Text>
            </View>
            <View
              className="px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <Text className="font-fredoka-one text-xs" style={{ color: activeConfig.accentColor }}>
                {hasNoSessions
                  ? '0'
                  : activeConfig.key === 'duration'
                    ? formatDuration(stats.averageDuration)
                    : activeConfig.key === 'mistakes'
                      ? `${stats.averageMistakes.toFixed(1)} / session`
                      : `${stats.averageHints.toFixed(1)} / session`}
              </Text>
            </View>
          </View>
          <Text className="font-quicksand-medium text-xs sm:text-sm text-[#484A4B] leading-relaxed">
            {activeConfig.description}
          </Text>
        </View>

        {/* 1. Formula & Live Calculation */}
        <View className="bg-white border border-[#E5E7EB] rounded-2xl p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Feather name="code" size={16} color="#62A9E6" />
            <Text className="font-fredoka-one text-sm text-[#484A4B]">
              How It Is Calculated
            </Text>
          </View>
          <View className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 mb-2.5">
            <Text className="font-quicksand-bold text-xs text-[#475569]">
              Formula:
            </Text>
            <Text className="font-fredoka-one text-xs sm:text-sm text-[#1E293B] mt-0.5">
              {activeConfig.formula}
            </Text>
          </View>
          <View className="bg-[#E0F2FE]/50 border border-[#BBE8FB] rounded-xl p-3">
            <Text className="font-quicksand-bold text-xs text-[#0369A1]">
              Student Live Data ({filter.toUpperCase()}):
            </Text>
            <Text className="font-fredoka-one text-xs sm:text-sm text-[#0C4A6E] mt-0.5">
              {getLiveCalculationText(activeConfig.key)}
            </Text>
          </View>
        </View>

        {/* 2. How to Interpret */}
        <View className="bg-white border border-[#E5E7EB] rounded-2xl p-4">
          <View className="flex-row items-center gap-2 mb-1.5">
            <Feather name="trending-up" size={16} color="#10B981" />
            <Text className="font-fredoka-one text-sm text-[#484A4B]">
              How to Interpret This Metric
            </Text>
          </View>
          <Text className="font-quicksand-medium text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            {activeConfig.interpretation}
          </Text>
        </View>

        {/* 3. Universal 3-Tier Legend Access Button */}
        <Pressable
          onPress={() => setIsLegendOpen(true)}
          className="bg-white border-[2px] border-[#BBE8FB] rounded-xl p-3.5 flex-row items-center justify-between active:scale-95 transition-transform"
          style={{
            borderColor: '#BBE8FB',
            shadowColor: '#BBE8FB',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center gap-2.5">
            <View className="w-8 h-8 rounded-full bg-[#E0F2FE] items-center justify-center">
              <Feather name="help-circle" size={16} color="#62A9E6" />
            </View>
            <View>
              <Text className="font-fredoka-one text-sm text-[#484A4B]">
                VIEW 3-TIER BENCHMARK LEGEND
              </Text>
              <Text className="font-quicksand-medium text-xs text-[#62A9E6]">
                Mastered (≥80%) • Developing • Needs Support
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color="#62A9E6" />
        </Pressable>

        {/* 4. Current Filter Context */}
        <View className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-3 flex-row justify-between items-center mb-2">
          <Text className="font-quicksand-medium text-xs text-[#6B7280]">
            Active Range Filter:
          </Text>
          <Text className="font-fredoka-one text-xs text-[#62A9E6] uppercase">
            {filter} ({stats?.totalSessions ?? 0} completed session{(stats?.totalSessions ?? 0) === 1 ? '' : 's'})
          </Text>
        </View>
      </View>

      {/* UNIVERSAL BENCHMARK LEGEND MODAL */}
      <UniversalLegendModal
        visible={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
        isTablet={isTablet}
        initialRole="teacher"
      />
    </BaseModal>
  );
}

export default StudentKpiCalculationModal;
