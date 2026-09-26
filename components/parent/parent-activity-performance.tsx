import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import Svg, { Defs, Line, LinearGradient, Rect, Stop } from 'react-native-svg';
import { ActivityTypeFilter } from '../../src/services/analytics';
import { ParentSessionRecord } from '../../src/services/parentDashboard';
import { filterSessionsByPeriod, FilterPeriod } from '../../src/utils/dashboardFilters';
import { getActivityPerformanceTakeaway } from '../../src/services/parentAnalyticsEngine';
import { getAccuracyTier } from '../../src/constants/benchmarkLegend';

const filters: { label: string; value: FilterPeriod }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Overall', value: 'overall' },
];

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

export function ParentActivityPerformance({ sessions = [], data: initialData, globalFilter, activityType = 'all', isTablet }: ParentActivityPerformanceProps) {
  const [filter, setFilter] = useState<FilterPeriod>(globalFilter || 'overall');
  const [showInfo, setShowInfo] = useState(false);

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
    return getActivityPerformanceTakeaway(activityData, activityType);
  }, [activityData, activityType]);

  return (
    <View className="flex-col mt-6 w-full">
      {/* Header and Filter Selector */}
      <View className="mb-4">
        <View className="flex-row flex-wrap items-center justify-between gap-4">
          <View className="flex-row items-center gap-2">
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[28px]' : 'text-[20px]'}`}>
              Activity Performance
            </Text>
            <Pressable
              onPress={() => setShowInfo(!showInfo)}
              className="active:opacity-75 p-1"
              accessibilityLabel="Information about Activity Performance"
            >
              <Feather name="info" size={isTablet ? 20 : 16} color="#62A9E6" />
            </Pressable>
          </View>

          {/* Filter Buttons */}
          <View className="flex-row items-center gap-1.5 flex-wrap">
            {filters.map((f) => {
              const isActive = filter === f.value;
              return (
                <Pressable
                  key={f.value}
                  onPress={() => setFilter(f.value)}
                  style={{
                    borderWidth: 2,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: isTablet ? 14 : 10,
                    paddingVertical: isTablet ? 7 : 5,
                    backgroundColor: isActive ? '#BBE8FB' : '#FFFFFF',
                    borderColor: isActive ? '#62A9E6' : '#BBE8FB',
                    shadowColor: isActive ? '#62A9E6' : '#BBE8FB',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 2,
                  }}
                >
                  <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-xs' : 'text-[10px]'}`}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Full-width Info Banner Row below Title & Filters */}
        {showInfo && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOutUp.duration(150)}
            className="w-full bg-[#F0F9FF] border border-[#BBE8FB] rounded-2xl p-3.5 mt-3 flex-row items-start gap-2.5 overflow-hidden"
          >
            <Feather name="info" size={isTablet ? 20 : 16} color="#62A9E6" style={{ marginTop: 2 }} />
            <View className="flex-1 flex-col gap-1.5">
              <Text className={`font-fredoka-one text-[#62A9E6] ${isTablet ? 'text-sm' : 'text-xs'}`}>
                WHAT DOES THIS CHART MEAN?
              </Text>
              <Text className={`font-quicksand-medium text-[#484A4B] leading-relaxed ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                • <Text className="font-quicksand-bold text-[#62A9E6]">What this shows:</Text> Your child's accuracy across different types of learning activities (such as Tracing, Matching, or Sorting).
              </Text>
              <Text className={`font-quicksand-medium text-[#484A4B] leading-relaxed ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                • <Text className="font-quicksand-bold text-[#62A9E6]">Categories:</Text> Each activity type has its own distinct color so you can quickly see which areas your child feels most confident with.
              </Text>
              <Text className={`font-quicksand-medium text-[#484A4B] leading-relaxed ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                • <Text className="font-quicksand-bold text-[#62A9E6]">Status levels:</Text> Scores of 80%+ indicate Mastered skills, 65%–79% show Developing skills, and below 65% highlight areas where extra support is helpful.
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
        /* Styled Analytics Card */
        <View
          style={{
            width: '100%',
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
          <View className="flex-col gap-3.5">
            {activityData.map((item, idx) => {
              const clampedVal = Math.max(0, Math.min(100, Math.round(item.value)));
              const theme = getCategoryTheme(item.label, idx);
              const gradientId = `activity-bar-grad-${idx}-${item.label.replace(/\s+/g, '')}`;
              const count = item.count || 1;

              // Universal 3-tier benchmark status
              const tier = getAccuracyTier(clampedVal);
              const statusLabel = tier.parentLabel;

              return (
                <View
                  key={item.label}
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.cardBorder,
                  }}
                  className="flex-col border rounded-2xl p-3.5 sm:p-4"
                >
                  {/* Category Title Row: Distinct Color Dot + Title + Practices Count Pill + Score Pill */}
                  <View className="flex-row items-center justify-between mb-2.5">
                    <View className="flex-row items-center gap-2 flex-1 pr-2">
                      <View className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: theme.dotColor }} />
                      <Text className="font-fredoka-one text-sm sm:text-base text-[#374151]" numberOfLines={1}>
                        {item.label}
                      </Text>
                      {/* Activities Count Badge */}
                      <View
                        className="px-2 py-0.5 rounded-full border hidden sm:flex"
                        style={{
                          backgroundColor: theme.badgeBg,
                          borderColor: theme.badgeBorder,
                        }}
                      >
                        <Text className="font-quicksand-bold text-[10px]" style={{ color: theme.badgeText }}>
                          {count} {count === 1 ? 'activity' : 'activities'}
                        </Text>
                      </View>
                    </View>

                    {/* Right Side: Universal Benchmark Status Tag + Percentage Pill */}
                    <View className="flex-row items-center gap-1.5">
                      <View
                        className="px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: tier.bgColor,
                          borderColor: tier.borderColor,
                        }}
                      >
                        <Text className="font-fredoka-one text-[10px] uppercase" style={{ color: tier.accentColor }}>
                          {statusLabel}
                        </Text>
                      </View>
                      <View
                        className="px-2.5 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: theme.pillBg,
                          borderColor: theme.pillBorder,
                        }}
                      >
                        <Text className="font-fredoka-one text-xs sm:text-sm" style={{ color: theme.pillText }}>
                          {clampedVal}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* SVG Bar Track with Dashed Vertical Grid Background */}
                  <View className="w-full h-4 justify-center relative">
                    <Svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                      <Defs>
                        <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                          <Stop offset="0%" stopColor={theme.startColor} stopOpacity="1" />
                          <Stop offset="100%" stopColor={theme.endColor} stopOpacity="1" />
                        </LinearGradient>
                      </Defs>
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
                      <Rect x="0" y="2" width="100%" height="12" rx="6" ry="6" fill="#F3F4F6" />
                      {/* Progress Bar Fill with Unique Gradient */}
                      {clampedVal > 0 && (
                        <Rect
                          x="0"
                          y="2"
                          width={`${clampedVal}%`}
                          height="12"
                          rx="6"
                          ry="6"
                          fill={`url(#${gradientId})`}
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
            <View className="mt-4 pt-4 border-t border-[#F3F4F6] flex-col gap-2">
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
                    className="font-fredoka-one text-[9px] uppercase"
                  >
                    {activityTakeaway.badgeLabel}
                  </Text>
                </View>
                <Text className="font-fredoka-one text-sm text-[#374151] flex-1" numberOfLines={1}>
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
    </View>
  );
}

