import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { ClassRecommendation } from '../../../../src/services/classAnalyticsEngine';

interface ClassRecommendationsCardProps {
  recommendations: ClassRecommendation[];
}

export default function ClassRecommendationsCard({ recommendations }: ClassRecommendationsCardProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Initialize all highlight cards as expanded by default
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (recommendations) {
      recommendations.forEach((r) => {
        initial[r.id] = true;
      });
    }
    return initial;
  });

  if (!recommendations || recommendations.length === 0) return null;

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <View className="flex-col mt-6 w-full">
      {/* Header section matching Milestones and Parent Narrative Summary title layout */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
          Recommendations
        </Text>
      </View>

      {/* Main Outer Box wrapping all summary cards */}
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
          {recommendations.map((r) => {
            let accentColor = '#62A9E6';
            if (r.type === 'strength') {
              accentColor = '#179D33';
            } else if (r.type === 'focus') {
              accentColor = '#FFAE02';
            } else if (r.type === 'action' || r.type === 'pacing') {
              accentColor = '#62A9E6';
            }

            const isExpanded = !!expandedIds[r.id];

            return (
              <View
                key={r.id}
                className="flex-col bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl p-4 overflow-hidden"
              >
                {/* Clickable Header Row */}
                <Pressable
                  onPress={() => toggleExpand(r.id)}
                  className="flex-row items-center justify-between py-1 active:opacity-75"
                >
                  {/* Left Side: Accent Circle Dot + Title */}
                  <View className="flex-row items-center gap-2.5 flex-1 pr-3">
                    <View
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: accentColor }}
                    />
                    <Text className="font-fredoka-one text-base text-[#374151] flex-1">
                      {r.title}
                    </Text>
                  </View>

                  {/* Right Side: Chevron Icon */}
                  <Feather
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#9CA3AF"
                  />
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
                      {r.description}
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
