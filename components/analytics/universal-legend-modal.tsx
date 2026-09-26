import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import {
  PerformanceTierConfig,
  UNIVERSAL_BENCHMARK_TIERS,
} from '../../src/constants/benchmarkLegend';
import { BaseModal } from '../teacher/home/base-modal';

interface UniversalLegendModalProps {
  visible: boolean;
  onClose: () => void;
  isTablet?: boolean;
  role?: 'teacher' | 'parent';
  initialRole?: 'teacher' | 'parent'; // For backwards-compatibility
}

export function UniversalLegendModal({
  visible,
  onClose,
  isTablet = false,
  role,
  initialRole = 'teacher',
}: UniversalLegendModalProps) {
  const activeRole = role || initialRole;

  const tiers: PerformanceTierConfig[] = [
    UNIVERSAL_BENCHMARK_TIERS.mastered,
    UNIVERSAL_BENCHMARK_TIERS.developing,
    UNIVERSAL_BENCHMARK_TIERS.support,
  ];

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      isTablet={isTablet}
      cancelLabel="GOT IT"
      heightClassName={isTablet ? 'h-[75%]' : 'h-[82%]'}
      title="Performance Guide"
    >
      <ScrollView showsVerticalScrollIndicator={false} className="flex-col pt-1">
        {/* Intro Banner */}
        <View className="bg-[#F0F9FF] border border-[#BBE8FB] rounded-2xl p-3 mb-4 flex-row items-center gap-2.5">
          <Feather name="info" size={isTablet ? 20 : 16} color="#62A9E6" />
          <Text className="font-quicksand-medium text-xs text-[#484A4B] flex-1 leading-snug">
            {activeRole === 'teacher'
              ? 'AutiVity uses a standardized 3-tier benchmark grounded in ABA mastery criteria (≥80% threshold) across all charts and metrics.'
              : 'Every chart and score uses these 3 simple levels so you can easily understand your child’s learning journey.'}
          </Text>
        </View>

        {/* 3 Tier Cards */}
        <View className="flex-col gap-3.5 pb-4">
          {tiers.map((tier) => (
            <View
              key={tier.key}
              className="rounded-2xl p-3.5 border-[2px]"
              style={{
                backgroundColor: tier.bgColor,
                borderColor: tier.borderColor,
              }}
            >
              {/* Header with Badge & Icon */}
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center gap-2">
                  <View
                    className="w-7 h-7 rounded-full items-center justify-center bg-white"
                  >
                    <Feather name={tier.iconName as any} size={16} color={tier.accentColor} />
                  </View>
                  <Text className="font-fredoka-one text-sm sm:text-base text-[#484A4B]">
                    {activeRole === 'teacher' ? tier.label : tier.parentLabel}
                  </Text>
                </View>

                <View
                  className="px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <Text className="font-fredoka-one text-[10px] sm:text-xs" style={{ color: tier.accentColor }}>
                    {tier.badgeLabel}
                  </Text>
                </View>
              </View>

              {/* Threshold Matrix Badges */}
              <View className="bg-white/80 rounded-xl p-2.5 mb-2.5 border border-[#E5E7EB]/40 flex-row flex-wrap gap-2">
                <View className="bg-[#F8FAFC] px-2 py-1 rounded-lg border border-[#E2E8F0]">
                  <Text className="font-fredoka-one text-[11px] text-[#334155]">
                    {tier.thresholds.accuracyText}
                  </Text>
                </View>
                <View className="bg-[#F8FAFC] px-2 py-1 rounded-lg border border-[#E2E8F0]">
                  <Text className="font-fredoka-one text-[11px] text-[#334155]">
                    {tier.thresholds.mistakesText}
                  </Text>
                </View>
                <View className="bg-[#F8FAFC] px-2 py-1 rounded-lg border border-[#E2E8F0]">
                  <Text className="font-fredoka-one text-[11px] text-[#334155]">
                    {tier.thresholds.hintsText}
                  </Text>
                </View>
                <View className="bg-[#F8FAFC] px-2 py-1 rounded-lg border border-[#E2E8F0]">
                  <Text className="font-fredoka-one text-[11px] text-[#334155]">
                    {tier.thresholds.rubricText}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <Text className="font-quicksand-medium text-xs text-[#484A4B] leading-relaxed mb-1.5">
                {activeRole === 'teacher' ? tier.teacherDescription : tier.parentDescription}
              </Text>

              {/* Actionable Guidance */}
              <View className="flex-row items-start gap-1.5 mt-1">
                <Text className="font-quicksand-bold text-[11px] text-[#475569]">
                  Action:
                </Text>
                <Text className="font-quicksand-medium text-[11px] text-[#64748B] flex-1">
                  {tier.actionableGuidance}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </BaseModal>
  );
}

export default UniversalLegendModal;
