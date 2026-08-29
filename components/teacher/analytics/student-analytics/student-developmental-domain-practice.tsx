import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import Svg, { Defs, Line, LinearGradient, Rect, Stop } from 'react-native-svg';
import { getStudentDevelopmentalSkillsExposure, MasterDomainExposure } from '../../../../src/services/student-analytics';

interface StudentDevelopmentalDomainPracticeProps {
  studentId: string;
  filter?: string;
}

type FilterType = 'today' | 'week' | 'month' | 'overall';

// Curated domain color themes matching Autivity's pastel design system (lighter left -> darker pastel right end)
const DOMAIN_THEMES = [
  {
    // Blue Theme (Primary)
    startColor: '#BBE8FB',
    endColor: '#62A9E6',
    trackBg: '#F0F9FF',
    accentText: '#62A9E6',
    pillBg: '#F0F9FF',
    pillBorder: '#BBE8FB',
  },
  {
    // Green Theme
    startColor: '#CBFAC4',
    endColor: '#34D399',
    trackBg: '#F0FDF4',
    accentText: '#16A34A',
    pillBg: '#F0FDF4',
    pillBorder: '#CBFAC4',
  },
  {
    // Orange Theme
    startColor: '#FFDBD4',
    endColor: '#FF8870',
    trackBg: '#FFF7ED',
    accentText: '#FF8870',
    pillBg: '#FFF7ED',
    pillBorder: '#FFDBD4',
  },
  {
    // Yellow Theme
    startColor: '#FFF3C4',
    endColor: '#FBBF24',
    trackBg: '#FFFBEB',
    accentText: '#D97706',
    pillBg: '#FFFBEB',
    pillBorder: '#FFF3C4',
  },
  {
    // Purple Theme
    startColor: '#DDD6FE',
    endColor: '#A78BFA',
    trackBg: '#FAF5FF',
    accentText: '#7C3AED',
    pillBg: '#FAF5FF',
    pillBorder: '#DDD6FE',
  },
];

// Helper to calculate uniform numeric tick steps for the horizontal bar chart scale
function calculateAxisTicks(maxVal: number) {
  const max = Math.max(1, maxVal);
  let step = 1;
  if (max <= 4) step = 1;
  else if (max <= 10) step = 2;
  else if (max <= 25) step = 5;
  else if (max <= 50) step = 10;
  else step = Math.ceil(max / 5 / 10) * 10;

  const maxScale = Math.max(step * 4, Math.ceil(max / step) * step);
  const ticks: number[] = [];
  for (let i = 0; i <= maxScale; i += step) {
    ticks.push(i);
  }
  return { ticks, maxScale };
}

export default function StudentDevelopmentalDomainPractice({ studentId, filter: externalFilter }: StudentDevelopmentalDomainPracticeProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [data, setData] = useState<MasterDomainExposure[]>([]);
  const [filter, setFilter] = useState<FilterType>((externalFilter as any) || 'overall');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (externalFilter) {
      setFilter(externalFilter as any);
    }
  }, [externalFilter]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const result = await getStudentDevelopmentalSkillsExposure(studentId, filter);
        setData(result);
        setError(null);
      } catch (err: any) {
        console.error('StudentDevelopmentalDomainPractice: failed to load exposure data', err);
        setError('Could not load developmental skills exposure data.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [studentId, filter]);

  // Find global maximum count across all domains and skills
  const maxCount = useMemo(() => {
    let max = 1;
    for (const domain of data) {
      for (const skill of domain.skills) {
        if (skill.count > max) {
          max = skill.count;
        }
      }
    }
    return max;
  }, [data]);

  // Calculate dynamic X-axis numeric ticks and scale bound
  const { ticks, maxScale } = useMemo(() => calculateAxisTicks(maxCount), [maxCount]);

  // Find domain with lowest practice exposures for focus badge highlight
  const lowestExposureDomainName = useMemo(() => {
    if (data.length <= 1) return null;
    const sorted = [...data].sort((a, b) => {
      const sumA = a.skills.reduce((acc, s) => acc + s.count, 0);
      const sumB = b.skills.reduce((acc, s) => acc + s.count, 0);
      return sumA - sumB;
    });
    return sorted[0]?.masterDomain || null;
  }, [data]);

  const toggleDomain = (domainName: string) => {
    setExpandedDomains((prev) => ({
      ...prev,
      [domainName]: !prev[domainName],
    }));
  };

  const filters: { label: string; value: FilterType }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Overall', value: 'overall' },
  ];

  return (
    <View className="flex-col mt-6">
      {/* Header and Filter Selector */}
      <View className="mb-4">
        <View className="flex-row flex-wrap items-center justify-between gap-4">
          <View className="flex-row items-center gap-2">
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
              Developmental Domain Practice
            </Text>
            <Pressable
              onPress={() => setShowInfo(!showInfo)}
              className="active:opacity-75 p-1"
            >
              <Feather name="info" size={isTablet ? 20 : 16} color="#62A9E6" />
            </Pressable>
          </View>

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
                    paddingHorizontal: isTablet ? 16 : 12,
                    paddingVertical: isTablet ? 8 : 6,
                    backgroundColor: isActive ? '#BBE8FB' : '#FFFFFF',
                    borderColor: isActive ? '#62A9E6' : '#BBE8FB',
                    shadowColor: isActive ? '#62A9E6' : '#BBE8FB',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 2,
                  }}
                >
                  <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
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
              Total activity practices counted across developmental domain skills for this student.
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Content Area */}
      {isLoading ? (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: isTablet ? 32 : 24,
            padding: isTablet ? 24 : 20,
            minHeight: 180,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#62A9E6" />
        </View>
      ) : error ? (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: isTablet ? 32 : 24,
            padding: isTablet ? 24 : 20,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 180,
          }}
        >
          <Feather name="alert-circle" size={32} color="#EF4444" />
          <Text className="font-fredoka-one text-base text-[#4B5563] mt-3 text-center">
            Error Loading Data
          </Text>
          <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-1 text-center">
            {error}
          </Text>
        </View>
      ) : data.length === 0 ? (
        <View className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-2xl p-8 items-center justify-center">
          <Feather name="grid" size={isTablet ? 44 : 32} color="#9CA3AF" />
          <Text className="font-fredoka-one text-lg text-[#4B5563] mt-3 text-center">
            No Practice Data
          </Text>
          <Text className="font-quicksand-medium text-sm text-[#9CA3AF] mt-1 text-center">
            No developmental skills practice recorded for this filter option.
          </Text>
        </View>
      ) : (
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
            {data.map((domain, domainIdx) => {
              const theme = DOMAIN_THEMES[domainIdx % DOMAIN_THEMES.length];
              const totalDomainExposures = domain.skills.reduce((sum, s) => sum + s.count, 0);
              const isExpanded = !!expandedDomains[domain.masterDomain];

              return (
                <View
                  key={domain.masterDomain}
                  className="flex-col bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl p-4 overflow-hidden"
                >
                  {/* Master Domain Clickable Header */}
                  <Pressable
                    onPress={() => toggleDomain(domain.masterDomain)}
                    className="flex-col py-1 active:opacity-75"
                  >
                    {/* Row 1: Colored Dot + Master Domain Title + Chevron Icon */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                        <View
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: theme.endColor }}
                        />
                        <Text className="font-fredoka-one text-base text-[#374151] flex-1">
                          {domain.masterDomain}
                        </Text>
                      </View>
                      <Feather
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#9CA3AF"
                      />
                    </View>

                    {/* Row 2: Sub-row containing Focus Badge & Practices Count Pill */}
                    <View className="flex-row items-center gap-2 mt-2.5 ml-6 flex-wrap">
                      {domain.masterDomain === lowestExposureDomainName && (
                        <View className="bg-[#FFF3C4] border border-[#FFAE02] px-2.5 py-0.5 rounded-full">
                          <Text className="font-fredoka-one text-[10px] text-[#D97706] uppercase tracking-wider">
                            FOCUS NEEDED
                          </Text>
                        </View>
                      )}
                      <View
                        style={{
                          backgroundColor: theme.pillBg,
                          borderColor: theme.pillBorder,
                          borderWidth: 1,
                          borderRadius: 999,
                          paddingHorizontal: 10,
                          paddingVertical: 3,
                        }}
                      >
                        <Text
                          style={{ color: theme.accentText }}
                          className="font-fredoka-one text-[11px] uppercase"
                        >
                          {totalDomainExposures} Practices
                        </Text>
                      </View>
                    </View>
                  </Pressable>

                  {/* Collapsible Bar Chart View */}
                  {isExpanded && (
                    <Animated.View
                      entering={FadeInUp.duration(200)}
                      exiting={FadeOutUp.duration(150)}
                      className="flex-col mt-4 pt-4 border-t border-[#E5E7EB]"
                    >
                      {/* Skills Rows */}
                      <View className="flex-col gap-5">
                        {domain.skills.map((skill, skillIdx) => {
                          const barWidthPercent = (skill.count / maxScale) * 100;
                          const gradientId = `grad-${domainIdx}-${skillIdx}`;

                          return (
                            <View key={skill.name} className="flex-col">
                              {/* Skill Row: Category Label | Dashed Grid & Bar | Count Value */}
                              <View className="flex-row items-center gap-3">
                                {/* Y-Axis Category Label */}
                                <View className="w-28 sm:w-36 pr-2">
                                  <Text
                                    numberOfLines={2}
                                    className="font-quicksand-bold text-xs text-[#374151]"
                                  >
                                    {skill.name}
                                  </Text>
                                </View>

                                {/* Bar Plot Canvas with SVG Dashed Grid Background */}
                                <View className="flex-1 h-8 justify-center relative">
                                  {/* SVG Dashed Vertical Grid Lines matching ClassEvaluationTrend */}
                                  <Svg
                                    width="100%"
                                    height="100%"
                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                                  >
                                    {ticks.map((t) => {
                                      const leftPct = `${(t / maxScale) * 100}%`;
                                      return (
                                        <Line
                                          key={`grid-${t}`}
                                          x1={leftPct}
                                          y1="0"
                                          x2={leftPct}
                                          y2="100%"
                                          stroke="#F3F4F6"
                                          strokeDasharray="4,4"
                                          strokeWidth="1"
                                        />
                                      );
                                    })}
                                  </Svg>

                                  {/* SVG Horizontal Bar with Gradient Fill */}
                                  <View className="w-full h-5 relative">
                                    <Svg width="100%" height="20">
                                      <Defs>
                                        <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                                          <Stop offset="0%" stopColor={theme.startColor} stopOpacity="1" />
                                          <Stop offset="100%" stopColor={theme.endColor} stopOpacity="1" />
                                        </LinearGradient>
                                      </Defs>
                                      {/* Horizontal Bar */}
                                      {barWidthPercent > 0 && (
                                        <Rect
                                          x="0"
                                          y="2"
                                          width={`${Math.max(2, barWidthPercent)}%`}
                                          height="16"
                                          rx="6"
                                          fill={`url(#${gradientId})`}
                                        />
                                      )}
                                    </Svg>
                                  </View>
                                </View>

                                {/* Value Label Pill beside Bar */}
                                <View className="w-10 items-end">
                                  <Text
                                    style={{ color: theme.accentText }}
                                    className="font-fredoka-one text-xs"
                                  >
                                    {skill.count}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </View>

                      {/* Perfect Pixel Aligned Horizontal X-Axis Ticks & Grid Labels */}
                      <View className="flex-row items-center mt-5 pt-2 border-t border-[#E5E7EB]">
                        {/* Y-Axis Label Margin Spacer */}
                        <View className="w-28 sm:w-36 pr-2" />

                        {/* Middle Scale Container matching the exact Bar Canvas flex-1 area */}
                        <View className="flex-1 h-5 relative">
                          {ticks.map((t, idx) => {
                            const leftPct = (t / maxScale) * 100;
                            const isFirst = idx === 0;
                            const isLast = idx === ticks.length - 1;

                            return (
                              <View
                                key={`tick-${t}`}
                                style={{
                                  position: 'absolute',
                                  left: `${leftPct}%`,
                                  transform: [
                                    {
                                      translateX: isFirst ? 0 : isLast ? -20 : -10,
                                    },
                                  ],
                                  width: 20,
                                  alignItems: isFirst ? 'flex-start' : isLast ? 'flex-end' : 'center',
                                }}
                              >
                                <Text className="font-quicksand-bold text-[10px] text-[#9CA3AF]">
                                  {t}
                                </Text>
                              </View>
                            );
                          })}
                        </View>

                        {/* Right Value Label Margin Spacer */}
                        <View className="w-10" />
                      </View>
                    </Animated.View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}
