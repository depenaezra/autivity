import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { NarrativeHighlight } from '../../src/services/parentAnalyticsEngine';

interface ParentNarrativeSummaryProps {
  highlights: NarrativeHighlight[];
  isTablet: boolean;
}

export function ParentNarrativeSummary({ highlights, isTablet }: ParentNarrativeSummaryProps) {
  // Initialize all highlight cards as expanded by default
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (highlights) {
      highlights.forEach((h) => {
        initial[h.id] = true;
      });
    }
    return initial;
  });

  if (!highlights || highlights.length === 0) return null;

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <View className="flex-col mt-6 w-full">
      {/* Header section matching Milestones title layout */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
          Summary
        </Text>
      </View>

      {/* Main Outer Box wrapping all summary cards - matching student-developmental-domain-practice.tsx */}
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
          {highlights.map((h) => {
            let accentColor = '#62A9E6';
            let statusBg = '#E0F2FE';
            let statusBorder = '#62A9E6';
            let statusText = '#62A9E6';

            if (h.type === 'growth') {
              accentColor = '#179D33';
              statusBg = '#CBFAC4';
              statusBorder = '#179D33';
              statusText = '#179D33';
            } else if (h.type === 'focus') {
              accentColor = '#FFAE02';
              statusBg = '#FFF3C4';
              statusBorder = '#FFAE02';
              statusText = '#D97706';
            } else if (h.type === 'consistency') {
              accentColor = '#62A9E6';
              statusBg = '#E0F2FE';
              statusBorder = '#62A9E6';
              statusText = '#62A9E6';
            }

            const isExpanded = !!expandedIds[h.id];

            return (
              <View
                key={h.id}
                className="flex-col bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl p-4 overflow-hidden"
              >
                {/* Clickable Header Row matching student-developmental-domain-practice.tsx */}
                <Pressable
                  onPress={() => toggleExpand(h.id)}
                  className="flex-row items-center justify-between py-1 active:opacity-75"
                >
                  {/* Left Side: Accent Bar + Title */}
                  <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                    <View
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                    <Text className="font-fredoka-one text-base text-[#374151] flex-1">
                      {h.title}
                    </Text>
                  </View>

                  {/* Right Side: Status Pill + Chevron Dropdown Icon */}
                  <View className="flex-row items-center gap-2 shrink-0">
                    <View
                      style={{
                        backgroundColor: statusBg,
                        borderColor: statusBorder,
                        borderWidth: 1,
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 3,
                      }}
                    >
                      <Text
                        style={{ color: statusText }}
                        className="font-fredoka-one text-[11px] uppercase"
                      >
                        {h.badgeLabel}
                      </Text>
                    </View>

                    <Feather
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </View>
                </Pressable>

                {/* Collapsible Description Body */}
                {isExpanded && (
                  <Animated.View
                    entering={FadeInUp.duration(200)}
                    exiting={FadeOutUp.duration(150)}
                    className="flex-col mt-3 pt-3 border-t border-[#E5E7EB]"
                  >
                    <Text
                      className={`font-quicksand-medium text-[#64748B] leading-relaxed ${
                        isTablet ? 'text-base' : 'text-sm'
                      }`}
                    >
                      {h.description}
                    </Text>
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
