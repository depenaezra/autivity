import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import Svg, { Line, Rect } from 'react-native-svg';
import { ActivityTypeFilter } from '../../src/services/analytics';
import { ParentSessionRecord } from '../../src/services/parentDashboard';
import { filterSessionsByPeriod, FilterPeriod, getFilterLabel } from '../../src/utils/dashboardFilters';
import { getActivityPerformanceTakeaway } from '../../src/services/parentAnalyticsEngine';
import { getAccuracyTier } from '../../src/constants/benchmarkLegend';
import { ParentFilterModal } from './parent-filter-modal';

interface ActivityPerformanceItem {
  label: string;
  value: number; // percentage 0 - 100
  count?: number; // number of completed activities
}

interface ParentActivityPerformanceProps {
  sessions?: ParentSessionRecord[];
  data?: ActivityPerformanceItem[];
  globalFilter?: FilterPeriod;
  activityType?: ActivityTypeFilter;
  isTablet: boolean;
  language?: 'en' | 'tl';
}

export interface CategoryColorTheme {
  startColor: string;
  endColor: string;
  cardBg: string;
  cardBorder: string;
  pillBg: string;
  pillBorder: string;
  pillText: string;
  dotColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

// Curated distinctive pastel palette per activity category matching Autivity Design System
const CATEGORY_THEMES: Record<string, CategoryColorTheme> = {
  // Tracing / Fine Motor (Primary Blue)
  tracing: {
    startColor: '#BBE8FB',
    endColor: '#62A9E6',
    cardBg: '#F8FCFF',
    cardBorder: '#E0F2FE',
    pillBg: '#E0F2FE',
    pillBorder: '#BBE8FB',
    pillText: '#0284C7',
    dotColor: '#62A9E6',
    badgeBg: '#F0F9FF',
    badgeBorder: '#BBE8FB',
    badgeText: '#0369A1',
  },
  // Matching / Identification (Fresh Green)
  matching: {
    startColor: '#CBFAC4',
    endColor: '#16A34A',
    cardBg: '#F9FDF9',
    cardBorder: '#DCFCE7',
    pillBg: '#DCFCE7',
    pillBorder: '#86EFAC',
    pillText: '#15803D',
    dotColor: '#16A34A',
    badgeBg: '#F0FDF4',
    badgeBorder: '#CBFAC4',
    badgeText: '#15803D',
  },
  // Sorting / Categorization (Warm Orange)
  sorting: {
    startColor: '#FFDBD4',
    endColor: '#FF8870',
    cardBg: '#FFFAF9',
    cardBorder: '#FFECE8',
    pillBg: '#FFF7ED',
    pillBorder: '#FFDBD4',
    pillText: '#EA580C',
    dotColor: '#FF8870',
    badgeBg: '#FFF7ED',
    badgeBorder: '#FFDBD4',
    badgeText: '#C2410C',
  },
  // Numbers / Counting / Math (Warm Amber Yellow)
  numbers: {
    startColor: '#FFF3C4',
    endColor: '#FFAE02',
    cardBg: '#FFFDF6',
    cardBorder: '#FEF3C7',
    pillBg: '#FFFBEB',
    pillBorder: '#FFF3C4',
    pillText: '#D97706',
    dotColor: '#FFAE02',
    badgeBg: '#FFFBEB',
    badgeBorder: '#FFF3C4',
    badgeText: '#B45309',
  },
  // Letters / Phonics / Literacy (Royal Lavender Purple)
  letters: {
    startColor: '#DDD6FE',
    endColor: '#A855F7',
    cardBg: '#FAF8FF',
    cardBorder: '#EDE9FE',
    pillBg: '#FAF5FF',
    pillBorder: '#DDD6FE',
    pillText: '#7C3AED',
    dotColor: '#A855F7',
    badgeBg: '#FAF5FF',
    badgeBorder: '#DDD6FE',
    badgeText: '#6D28D9',
  },
  // Colors / Creativity / Visuals (Vibrant Rose Pink)
  colors: {
    startColor: '#FCE7F3',
    endColor: '#EC4899',
    cardBg: '#FDF9FB',
    cardBorder: '#FCE7F3',
    pillBg: '#FDF2F8',
    pillBorder: '#FBCFE8',
    pillText: '#DB2777',
    dotColor: '#EC4899',
    badgeBg: '#FDF2F8',
    badgeBorder: '#FBCFE8',
    badgeText: '#BE185D',
  },
  // Shapes / Spatial Reasoning (Calm Teal)
  shapes: {
    startColor: '#CCFBF1',
    endColor: '#0D9488',
    cardBg: '#F6FCFA',
    cardBorder: '#CCFBF1',
    pillBg: '#F0FDFA',
    pillBorder: '#99F6E4',
    pillText: '#0F766E',
    dotColor: '#0D9488',
    badgeBg: '#F0FDFA',
    badgeBorder: '#CCFBF1',
    badgeText: '#0F766E',
  },
};

// Fallback palette cycle for unmapped activity categories
const PALETTE_CYCLE: CategoryColorTheme[] = [
  CATEGORY_THEMES.tracing,
  CATEGORY_THEMES.matching,
  CATEGORY_THEMES.sorting,
  CATEGORY_THEMES.numbers,
  CATEGORY_THEMES.letters,
  CATEGORY_THEMES.colors,
  CATEGORY_THEMES.shapes,
];

/**
 * Returns a consistent and vibrant color theme for any category name
 */
export function getCategoryTheme(categoryName: string, index = 0): CategoryColorTheme {
  const normalized = categoryName.toLowerCase().trim();
  for (const [key, theme] of Object.entries(CATEGORY_THEMES)) {
    if (normalized.includes(key)) {
      return theme;
    }
  }
  return PALETTE_CYCLE[index % PALETTE_CYCLE.length];
}

/**
 * Formats a raw category string into clean, capitalized English
 */
export function formatCategoryLabel(category: string): string {
  if (!category) return 'General Activity';
  const clean = category.replace(/^activity\//, '').replace(/^tracing\//, '');
  return clean
    .split(/[-_/]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function ParentActivityPerformance({ sessions = [], data: initialData, globalFilter, activityType = 'all', isTablet, language = 'en' }: ParentActivityPerformanceProps) {
  const [filter, setFilter] = useState<FilterPeriod>(globalFilter || 'overall');
  const [showInfo, setShowInfo] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const isTl = language === 'tl';

  useEffect(() => {
    if (globalFilter !== undefined) {
      setFilter(globalFilter);
    }
  }, [globalFilter]);

  // Dynamic Session Filtering based on Period
  const filteredSessions = useMemo(() => {
    return filterSessionsByPeriod(sessions, filter);
  }, [sessions, filter]);

  // Compute Activity Performance by Category dynamically with counts
  const activityData = useMemo(() => {
    if (initialData && sessions.length === 0) {
      return initialData.map((d) => ({
        ...d,
        label: formatCategoryLabel(d.label),
        count: d.count || 1,
      }));
    }

    const byCategory: Record<string, { scores: number[]; count: number }> = {};
    filteredSessions.forEach((s) => {
      let scorePct: number | null = null;
      if (s.rubricEvaluation) {
        const r = s.rubricEvaluation;
        const sum =
          (r.looking_at_objects || 0) +
          (r.concentrating || 0) +
          (r.performing_task || 0) +
          (r.following_instructions || 0) +
          (r.completed_work || 0);
        scorePct = Math.round((sum / 25) * 100);
      }
      if (scorePct == null) return;
      const formattedKey = formatCategoryLabel(s.category);
      if (!byCategory[formattedKey]) {
        byCategory[formattedKey] = { scores: [], count: 0 };
      }
      byCategory[formattedKey].scores.push(scorePct);
      byCategory[formattedKey].count += 1;
    });

    return Object.entries(byCategory)
      .map(([label, info]) => ({
        label,
        count: info.count,
        value: Math.round(info.scores.reduce((a, b) => a + b, 0) / info.scores.length),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredSessions, initialData, sessions.length]);

  const activityTakeaway = useMemo(() => {
    return getActivityPerformanceTakeaway(activityData, activityType, language);
  }, [activityData, activityType, language]);

  return (
    <View className="flex-col mt-6 w-full">
      {/* Header and Filter Selector */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between flex-wrap gap-2">
          <View className="flex-row items-center gap-2">
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
              {isTl ? 'Pagganap sa Bawat Aktibidad' : 'Activity Performance'}
            </Text>
            <Pressable
              onPress={() => setShowInfo(!showInfo)}
              className="active:opacity-75 p-1"
              accessibilityLabel="Information about Activity Performance"
            >
              <Feather name="info" size={isTablet ? 20 : 16} color="#62A9E6" />
            </Pressable>
          </View>

          {/* Compact Tactile Filter Dropdown Trigger matching Teacher student-analytics */}
          <Pressable
            onPress={() => setIsFilterModalOpen(true)}
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
            <Feather name="calendar" size={13} color="#62A9E6" />
            <Text className="font-fredoka-one text-[#62A9E6] text-[11px] uppercase" numberOfLines={1}>
              {getFilterLabel(filter).toUpperCase()}
            </Text>
            <Feather name="chevron-down" size={13} color="#62A9E6" />
          </Pressable>
        </View>

        {/* Full-width Info Banner Row below Title & Filters */}
        {showInfo && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOutUp.duration(150)}
            className="w-full bg-[#F0F9FF] border-[2px] border-[#BBE8FB] rounded-2xl p-3.5 mt-3 flex-row items-start gap-2.5 overflow-hidden"
          >
            <Feather name="info" size={isTablet ? 20 : 16} color="#62A9E6" style={{ marginTop: 2 }} />
            <View className="flex-1 flex-col gap-1.5">
              <Text className={`font-fredoka-one text-[#62A9E6] ${isTablet ? 'text-sm' : 'text-xs'}`}>
                {isTl ? 'ANO ANG IBIG SABIHIN NG TSART NA ITO?' : 'WHAT DOES THIS CHART MEAN?'}
              </Text>
              <Text className={`font-quicksand-medium text-[#484A4B] leading-relaxed ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                • <Text className="font-quicksand-bold text-[#62A9E6]">{isTl ? 'Ipinapakita nito:' : 'What this shows:'}</Text>{' '}
                {isTl
                  ? "Ang kawastuhan ng iyong anak sa iba't ibang uri ng mga aktibidad (tulad ng Tracing, Matching, o Sorting)."
                  : "Your child's accuracy across different types of learning activities (such as Tracing, Matching, or Sorting)."}
              </Text>
              <Text className={`font-quicksand-medium text-[#484A4B] leading-relaxed ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                • <Text className="font-quicksand-bold text-[#62A9E6]">{isTl ? 'Mga kategorya:' : 'Categories:'}</Text>{' '}
                {isTl
                  ? 'Bawat uri ng aktibidad ay may sariling kulay upang madaling makita kung saan higit na may kumpiyansa ang iyong anak.'
                  : 'Each activity type has its own distinct color so you can quickly see which areas your child feels most confident with.'}
              </Text>
              <Text className={`font-quicksand-medium text-[#484A4B] leading-relaxed ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                • <Text className="font-quicksand-bold text-[#62A9E6]">{isTl ? 'Mga antas:' : 'Status levels:'}</Text>{' '}
                {isTl
                  ? 'Ang markang 80%+ ay nagpapakita ng Mastered, 65%–79% Developing, at mas mababa sa 65% ay nagpapahiwatig ng mga kasanayang kailangan ng karagdagang gabay.'
                  : 'Scores of 80%+ indicate Mastered skills, 65%–79% show Developing skills, and below 65% highlight areas where extra support is helpful.'}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Content Area */}
      {activityData.length === 0 ? (
        <View className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-2xl p-8 items-center justify-center">
          <Feather name="bar-chart-2" size={isTablet ? 40 : 30} color="#9CA3AF" />
          <Text className="font-fredoka-one text-base text-[#4B5563] mt-3 text-center">
            No Activity Data Yet
          </Text>
          <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-1 text-center">
            Activity performance scores will populate as learning activities are completed for this filter.
          </Text>
        </View>
      ) : (
        /* Styled Analytics Card matching Design System */
        <View
          style={{
            shadowColor: '#F1F1F1',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          }}
          className="w-full bg-white border-[4px] border-[#F1F1F1] rounded-[20px] sm:rounded-[32px] p-4 sm:p-6"
        >
          <View className="flex-col gap-3">
            {activityData.map((item, idx) => {
              const clampedVal = Math.max(0, Math.min(100, Math.round(item.value)));
              const theme = getCategoryTheme(item.label, idx);
              const count = item.count || 1;

              // Universal 3-tier benchmark status
              const tier = getAccuracyTier(clampedVal);
              const statusLabel = tier.parentLabel;

              return (
                <View
                  key={item.label}
                  className="flex-col bg-[#F8FAFC] border-[2px] border-[#F1F1F1] rounded-2xl p-3.5 sm:p-4"
                >
                  {/* Category Title Row: Category Color Dot + Title + Practices Count Tag (Left) | Single Status Tag + Percentage (Right) */}
                  <View className="flex-row items-center justify-between mb-2.5">
                    <View className="flex-row items-center gap-2 flex-1 pr-2">
                      <View className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: theme.dotColor }} />
                      <Text className="font-fredoka-one text-sm sm:text-base text-[#484A4B]" numberOfLines={1}>
                        {item.label}
                      </Text>
                      {/* Activities Count Badge */}
                      <View className="px-2 py-0.5 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] hidden sm:flex">
                        <Text className="font-fredoka-one text-[11px] text-[#64748B] uppercase">
                          {count} {count === 1 ? 'activity' : 'activities'}
                        </Text>
                      </View>
                    </View>

                    {/* Right Side: Single Benchmark Status Tag + Clean Percentage Value */}
                    <View className="flex-row items-center gap-2">
                      <View
                        className="px-2.5 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: tier.bgColor,
                          borderColor: tier.borderColor,
                        }}
                      >
                        <Text className="font-fredoka-one text-[11px] uppercase" style={{ color: tier.accentColor }}>
                          {statusLabel}
                        </Text>
                      </View>
                      <Text className="font-fredoka-one text-sm sm:text-base text-[#484A4B]">
                        {clampedVal}%
                      </Text>
                    </View>
                  </View>

                  {/* SVG Bar Track with Dashed Vertical Grid Background */}
                  <View className="w-full h-3.5 justify-center relative">
                    <Svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                      {[0, 25, 50, 75, 100].map((t) => (
                        <Line
                          key={`grid-${t}`}
                          x1={`${t}%`}
                          y1="0"
                          x2={`${t}%`}
                          y2="100%"
                          stroke="#E5E7EB"
                          strokeDasharray="3,3"
                          strokeWidth="1"
                        />
                      ))}
                      {/* Background Track */}
                      <Rect x="0" y="1" width="100%" height="12" rx="6" ry="6" fill="#E5E7EB" />
                      {/* Progress Bar Fill with Solid Theme Color */}
                      {clampedVal > 0 && (
                        <Rect
                          x="0"
                          y="1"
                          width={`${clampedVal}%`}
                          height="12"
                          rx="6"
                          ry="6"
                          fill={theme.endColor}
                        />
                      )}
                    </Svg>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Dynamic Evidence-Based Activity Takeaway Banner */}
          {activityTakeaway && (
            <View className="mt-4 pt-4 border-t border-[#F1F1F1] flex-col gap-2">
              <View className="flex-row items-center gap-2">
                <View
                  style={{
                    backgroundColor: activityTakeaway.badgeType === 'growth' ? '#DCFCE7' : '#E0F2FE',
                    borderColor: activityTakeaway.badgeType === 'growth' ? '#86EFAC' : '#BBE8FB',
                    borderWidth: 1,
                    borderRadius: 999,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    style={{ color: activityTakeaway.badgeType === 'growth' ? '#15803D' : '#62A9E6' }}
                    className="font-fredoka-one text-[11px] uppercase"
                  >
                    {activityTakeaway.badgeLabel}
                  </Text>
                </View>
                <Text className="font-fredoka-one text-sm text-[#484A4B] flex-1" numberOfLines={1}>
                  {activityTakeaway.title}
                </Text>
              </View>

              <Text className="font-quicksand-medium text-xs text-[#64748B] leading-relaxed">
                {activityTakeaway.description}
              </Text>

              {activityTakeaway.recommendation && (
                <View className="bg-[#F0F9FF] border border-[#BBE8FB] rounded-xl p-2.5 flex-row items-start gap-2 mt-0.5">
                  <Feather name="smile" size={13} color="#62A9E6" style={{ marginTop: 2 }} />
                  <Text className="font-quicksand-medium text-[11px] text-[#0369A1] flex-1 leading-normal">
                    <Text className="font-quicksand-bold text-[#0284C7]">Helpful Tip: </Text>
                    {activityTakeaway.recommendation}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Filter Modal Dialog */}
      <ParentFilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        isTablet={isTablet}
        selectedFilter={filter}
        onSelectFilter={setFilter}
      />
    </View>
  );
}

