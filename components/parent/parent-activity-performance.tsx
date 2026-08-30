import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import Svg, { Defs, Line, LinearGradient, Rect, Stop } from 'react-native-svg';
import { ParentSessionRecord } from '../../src/services/parentDashboard';
import { filterSessionsByPeriod, FilterPeriod } from '../../src/utils/dashboardFilters';

const filters: { label: string; value: FilterPeriod }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Overall', value: 'overall' },
];

interface ActivityPerformanceItem {
  label: string;
  value: number; // percentage 0 - 100
}

interface ParentActivityPerformanceProps {
  sessions?: ParentSessionRecord[];
  data?: ActivityPerformanceItem[];
  globalFilter?: FilterPeriod;
  isTablet: boolean;
}

export function ParentActivityPerformance({ sessions = [], data: initialData, globalFilter, isTablet }: ParentActivityPerformanceProps) {
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

  // Compute Activity Performance by Category dynamically
  const activityData = useMemo(() => {
    if (initialData && sessions.length === 0) return initialData;

    const byCategory: Record<string, number[]> = {};
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
      if (!byCategory[s.category]) byCategory[s.category] = [];
      byCategory[s.category].push(scorePct);
    });

    return Object.entries(byCategory)
      .map(([label, scores]) => ({
        label,
        value: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredSessions, initialData, sessions.length]);

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
            className="w-full bg-[#E0F2FE] border border-[#BBE8FB] rounded-xl p-3 mt-3 flex-row items-center gap-2.5 overflow-hidden"
          >
            <Feather name="info" size={isTablet ? 22 : 18} color="#62A9E6" />
            <Text className={`font-quicksand-bold text-[#62A9E6] flex-1 leading-normal ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
              Average performance score percentage broken down by activity category.
            </Text>
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
        /* Styled Analytics Card - matching class-analytics format */
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
          <View className="flex-col gap-4">
            {activityData.map((item, idx) => {
              const clampedVal = Math.max(0, Math.min(100, Math.round(item.value)));
              const gradientId = `activity-bar-grad-${idx}`;

              return (
                <View key={item.label} className="flex-col bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl p-3.5 sm:p-4">
                  {/* Category Title & Percentage Badge Pill */}
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-fredoka-one text-sm sm:text-base text-[#374151]">
                      {item.label}
                    </Text>
                    <View className="bg-[#E0F2FE] border border-[#BBE8FB] px-2.5 py-0.5 rounded-full">
                      <Text className="font-fredoka-one text-[#62A9E6] text-xs sm:text-sm">
                        {clampedVal}%
                      </Text>
                    </View>
                  </View>

                  {/* SVG Bar Track with Dashed Vertical Grid Background */}
                  <View className="w-full h-4 justify-center relative">
                    <Svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                      <Defs>
                        <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                          <Stop offset="0%" stopColor="#62A9E6" stopOpacity="1" />
                          <Stop offset="100%" stopColor="#3B82F6" stopOpacity="1" />
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
                      {/* Progress Bar Fill */}
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
        </View>
      )}
    </View>
  );
}
