import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { NarrativeHighlight } from '../../src/services/parentAnalyticsEngine';

interface ParentNarrativeSummaryProps {
  highlights: NarrativeHighlight[];
  isTablet: boolean;
  language?: 'en' | 'tl';
}

export function ParentNarrativeSummary({ highlights, isTablet, language = 'en' }: ParentNarrativeSummaryProps) {
  const isTl = language === 'tl';

  // State for collapsible controls
  const [isCardExpanded, setIsCardExpanded] = useState(true);
  const [isStrengthsExpanded, setIsStrengthsExpanded] = useState(true);
  const [isFocusExpanded, setIsFocusExpanded] = useState(true);

  // Initialize individual items as expanded by default or collapsed
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (highlights) {
      highlights.forEach((h) => {
        initial[h.id] = false;
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

  const isStrength = (h: NarrativeHighlight) => {
    return h.type === 'growth' || h.type === 'consistency';
  };

  const strengths = highlights.filter(isStrength);
  const focusAndActions = highlights.filter((h) => !isStrength(h));

  const getItemMeta = (h: NarrativeHighlight) => {
    if (h.type === 'growth') {
      return {
        iconName: 'trending-up' as const,
        iconColor: '#179D33',
        iconBg: '#E8F8EE',
        tagBg: '#E8F8EE',
        tagColor: '#179D33',
        defaultTag: isTl ? 'KALAKASAN' : 'STRENGTH',
      };
    }

    if (h.type === 'focus') {
      return {
        iconName: 'target' as const,
        iconColor: '#FF8870',
        iconBg: '#FFF4EC',
        tagBg: '#FFF4EC',
        tagColor: '#FF8870',
        defaultTag: isTl ? 'DAPAT PAGTUUNAN' : 'FOCUS AREA',
      };
    }

    // Consistency / steady routine
    return {
      iconName: 'clock' as const,
      iconColor: '#62A9E6',
      iconBg: '#EFF8FF',
      tagBg: '#EFF8FF',
      tagColor: '#62A9E6',
      defaultTag: isTl ? 'KONSISTENSI' : 'ROUTINE',
    };
  };

  const renderHighlightItem = (h: NarrativeHighlight) => {
    const isExpanded = !!expandedIds[h.id];
    const meta = getItemMeta(h);

    return (
      <View
        key={h.id}
        className="flex-col bg-[#F8FAFC] border-[2px] border-[#F1F1F1] rounded-2xl p-3.5 sm:p-4 overflow-hidden"
      >
        {/* Clickable Header Row */}
        <Pressable
          onPress={() => toggleExpand(h.id)}
          className="flex-row items-center justify-between active:scale-[0.99] transition-transform"
        >
          {/* Left Side: Semantic Icon Badge + Title + Refined Tag */}
          <View className="flex-row items-center gap-3 flex-1 pr-3">
            <View
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl items-center justify-center shrink-0"
              style={{ backgroundColor: meta.iconBg }}
            >
              <Feather name={meta.iconName} size={isTablet ? 17 : 15} color={meta.iconColor} />
            </View>

            <View className="flex-col flex-1 justify-center">
              <View className="flex-row items-center gap-2 flex-wrap">
                <Text className="font-fredoka-one text-sm sm:text-base text-[#484A4B]">
                  {h.title}
                </Text>
                <View
                  className="px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: meta.tagBg }}
                >
                  <Text
                    className={`font-fredoka-one uppercase ${
                      isTablet ? 'text-xs' : 'text-[10px]'
                    }`}
                    style={{ color: meta.tagColor }}
                  >
                    {h.badgeLabel || meta.defaultTag}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Right Side: Chevron Icon with Subtle Circular Plate */}
          <View className="w-6 h-6 items-center justify-center rounded-full bg-white border border-[#E5E7EB]/60 shrink-0">
            <Feather
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={15}
              color="#9CA3AF"
            />
          </View>
        </Pressable>

        {/* Collapsible Description Body */}
        {isExpanded && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOutUp.duration(150)}
            className="flex-col mt-2.5 pt-2.5 border-t border-[#F1F1F1]"
          >
            <Text
              className={`font-quicksand-medium text-[#484A4B] leading-relaxed ${
                isTablet ? 'text-sm' : 'text-xs'
              }`}
            >
              {h.description}
            </Text>
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-col mt-6 w-full">
      {/* Header section with toggle button matching teacher recommendations */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2.5">
          <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
            {isTl ? 'Buod ng Pag-unlad' : 'Summary'}
          </Text>
          <View className="px-2.5 py-0.5 rounded-full bg-[#BBE8FB]/60">
            <Text className={`font-fredoka-one text-[#62A9E6] ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
              {highlights.length}
            </Text>
          </View>
        </View>

        {/* Tactile Outer Collapse/Expand Button */}
        <Pressable
          onPress={() => setIsCardExpanded((prev) => !prev)}
          className="flex-row items-center justify-center gap-1.5 bg-white border-[2px] border-[#BBE8FB] px-3 h-[34px] rounded-xl active:scale-95 transition-transform"
          style={{
            borderColor: '#BBE8FB',
            shadowColor: '#BBE8FB',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          }}
        >
          <Text className="font-fredoka-one text-[11px] text-[#62A9E6] uppercase">
            {isCardExpanded ? (isTl ? 'Itago' : 'Hide') : (isTl ? 'Ipakita' : 'Show')}
          </Text>
          <Feather
            name={isCardExpanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color="#62A9E6"
          />
        </Pressable>
      </View>

      {/* Main Outer Box wrapping all summary cards matching teacher student-recommendations-card.tsx */}
      {isCardExpanded && (
        <Animated.View
          entering={FadeInUp.duration(200)}
          exiting={FadeOutUp.duration(150)}
          className={`bg-white border-[4px] border-[#F1F1F1] ${
            isTablet ? 'rounded-[32px] p-6' : 'rounded-[20px] p-4'
          }`}
          style={{
            shadowColor: '#F1F1F1',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          }}
        >
          <View className="flex-col">
            {/* Section 1: Strengths & Progress */}
            {strengths.length > 0 && (
              <View className="flex-col">
                <Pressable
                  onPress={() => setIsStrengthsExpanded((prev) => !prev)}
                  className="flex-row items-center justify-between mb-3 active:opacity-75"
                >
                  <View className="flex-row items-center gap-2">
                    <Feather name="trending-up" size={isTablet ? 18 : 16} color="#179D33" />
                    <Text className={`font-fredoka-one text-[#484A4B] uppercase tracking-wider ${isTablet ? 'text-sm' : 'text-xs'}`}>
                      {isTl ? 'Mga Kalakasan at Pag-unlad' : 'Strengths & Progress'}
                    </Text>
                    <View className="px-2 py-0.5 rounded-full bg-[#CBFAC4]/60">
                      <Text className={`font-fredoka-one text-[#179D33] ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                        {strengths.length}
                      </Text>
                    </View>
                  </View>

                  <View className="w-6 h-6 items-center justify-center rounded-full bg-[#F5F7FA]">
                    <Feather
                      name={isStrengthsExpanded ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color="#9CA3AF"
                    />
                  </View>
                </Pressable>

                {isStrengthsExpanded && (
                  <Animated.View
                    entering={FadeInUp.duration(200)}
                    exiting={FadeOutUp.duration(150)}
                    className="flex-col gap-2.5"
                  >
                    {strengths.map(renderHighlightItem)}
                  </Animated.View>
                )}
              </View>
            )}

            {/* Section 2: Focus & Action Plan */}
            {focusAndActions.length > 0 && (
              <View className={`flex-col ${strengths.length > 0 ? 'mt-5 pt-5 border-t border-[#F1F1F1]' : ''}`}>
                <Pressable
                  onPress={() => setIsFocusExpanded((prev) => !prev)}
                  className="flex-row items-center justify-between mb-3 active:opacity-75"
                >
                  <View className="flex-row items-center gap-2">
                    <Feather name="target" size={isTablet ? 18 : 16} color="#62A9E6" />
                    <Text className={`font-fredoka-one text-[#484A4B] uppercase tracking-wider ${isTablet ? 'text-sm' : 'text-xs'}`}>
                      {isTl ? 'Dapat Pagtuunan at Plano' : 'Focus & Action Plan'}
                    </Text>
                    <View className="px-2 py-0.5 rounded-full bg-[#BBE8FB]/60">
                      <Text className={`font-fredoka-one text-[#62A9E6] ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                        {focusAndActions.length}
                      </Text>
                    </View>
                  </View>

                  <View className="w-6 h-6 items-center justify-center rounded-full bg-[#F5F7FA]">
                    <Feather
                      name={isFocusExpanded ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color="#9CA3AF"
                    />
                  </View>
                </Pressable>

                {isFocusExpanded && (
                  <Animated.View
                    entering={FadeInUp.duration(200)}
                    exiting={FadeOutUp.duration(150)}
                    className="flex-col gap-2.5"
                  >
                    {focusAndActions.map(renderHighlightItem)}
                  </Animated.View>
                )}
              </View>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

