import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { SPED_DOMAIN_EXPLAINERS } from '../../src/services/parentAnalyticsEngine';

interface ParentDomainExplainersProps {
  isTablet: boolean;
}

export function ParentDomainExplainers({ isTablet }: ParentDomainExplainersProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const toggleExpand = (key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  return (
    <View className="flex-col mt-6 w-full">
      {/* Title Header matching ParentNarrativeSummary */}
      <View className="mb-4 flex-col">
        <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
          Understanding Skill Domains
        </Text>
        <Text className={`font-quicksand-bold text-[#9CA3AF] mt-0.5 ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
          Plain-English guides explaining how educators evaluate each development area.
        </Text>
      </View>

      {/* Main Outer Box wrapping all domain cards - matching ParentNarrativeSummary */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: isTablet ? 32 : 24,
          padding: isTablet ? 24 : 20,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.03,
          shadowRadius: 10,
          elevation: 1,
        }}
      >
        <View className="flex-col gap-4">
          {SPED_DOMAIN_EXPLAINERS.map((d) => {
            const isExpanded = expandedKey === d.domainKey;

            return (
              <View
                key={d.domainKey}
                className="flex-col bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl p-4 overflow-hidden"
              >
                {/* Clickable Header Row matching ParentNarrativeSummary */}
                <Pressable
                  onPress={() => toggleExpand(d.domainKey)}
                  className="flex-row items-center justify-between py-1 active:opacity-75"
                >
                  {/* Left Side: Domain Color Indicator + Name & Short Def */}
                  <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                    <View
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: d.color }}
                    />
                    <View className="flex-col flex-1">
                      <Text className="font-fredoka-one text-base text-[#374151]">
                        {d.name}
                      </Text>
                      <Text
                        className={`font-quicksand-medium text-[#64748B] mt-0.5 ${
                          isTablet ? 'text-xs' : 'text-[11px]'
                        }`}
                        numberOfLines={isExpanded ? undefined : 1}
                      >
                        {d.shortDefinition}
                      </Text>
                    </View>
                  </View>

                  {/* Chevron Icon */}
                  <Feather
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#9CA3AF"
                  />
                </Pressable>

                {/* Collapsible Expanded Body matching ParentNarrativeSummary typography & colors */}
                {isExpanded && (
                  <Animated.View
                    entering={FadeInUp.duration(200)}
                    exiting={FadeOutUp.duration(150)}
                    className="flex-col mt-3 pt-3 border-t border-[#E5E7EB] gap-3"
                  >
                    <View className="flex-col">
                      <Text className="font-fredoka-one text-[10px] text-[#9CA3AF] uppercase tracking-wide">
                        WHAT THIS EVALUATES
                      </Text>
                      <Text
                        className={`font-quicksand-medium text-[#64748B] mt-1 leading-relaxed ${
                          isTablet ? 'text-sm' : 'text-xs'
                        }`}
                      >
                        {d.fullExplanation}
                      </Text>
                    </View>

                    <View className="bg-[#F0F9FF] border border-[#BBE8FB] rounded-xl p-3 flex-col">
                      <Text className="font-fredoka-one text-[10px] text-[#0284C7] uppercase tracking-wide">
                        WHAT TO OBSERVE AT HOME
                      </Text>
                      <Text
                        className={`font-quicksand-medium text-[#0369A1] mt-1 leading-relaxed ${
                          isTablet ? 'text-sm' : 'text-xs'
                        }`}
                      >
                        {d.whatToLookFor}
                      </Text>
                    </View>
                  </Animated.View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
