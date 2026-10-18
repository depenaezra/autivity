import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import Svg, { Line, Rect } from 'react-native-svg';
import { ActivityTypeFilter } from '../../../../src/services/analytics';
import { getStudentDevelopmentalSkillsExposure, MasterDomainExposure } from '../../../../src/services/student-analytics';
import { FilterPeriod, getFilterLabel } from '../../../../src/utils/dashboardFilters';
import { ParentFilterModal } from '../../../parent/parent-filter-modal';

interface StudentDevelopmentalDomainPracticeProps {
  studentId: string;
  filter?: string;
  refreshTrigger?: number;
  activityType?: ActivityTypeFilter;
}

type FilterType = FilterPeriod;

// Curated domain color themes matching Autivity's pastel design system
const DOMAIN_THEMES = [
  {
    // Blue Theme (Primary)
    barColor: '#62A9E6',
    accentColor: '#62A9E6',
    iconBg: '#F0F9FF',
    iconColor: '#62A9E6',
    pillBg: '#F0F9FF',
    pillBorder: '#BBE8FB',
    accentText: '#62A9E6',
    endColor: '#62A9E6',
  },
  {
    // Green Theme
    barColor: '#179D33',
    accentColor: '#179D33',
    iconBg: '#F0FDF4',
    iconColor: '#179D33',
    pillBg: '#F0FDF4',
    pillBorder: '#CBFAC4',
    accentText: '#179D33',
    endColor: '#179D33',
  },
  {
    // Orange Theme
    barColor: '#FF8870',
    accentColor: '#FF8870',
    iconBg: '#FFF7ED',
    iconColor: '#FF8870',
    pillBg: '#FFF7ED',
    pillBorder: '#FFDBD4',
    accentText: '#FF8870',
    endColor: '#FF8870',
  },
  {
    // Yellow Theme
    barColor: '#FFAE02',
    accentColor: '#FFAE02',
    iconBg: '#FFFBEB',
    iconColor: '#FFAE02',
    pillBg: '#FFFBEB',
    pillBorder: '#FFF3C4',
    accentText: '#FFAE02',
    endColor: '#FFAE02',
  },
  {
    // Purple Theme
    barColor: '#8B5CF6',
    accentColor: '#8B5CF6',
    iconBg: '#FAF5FF',
    iconColor: '#8B5CF6',
    pillBg: '#FAF5FF',
    pillBorder: '#DDD6FE',
    accentText: '#8B5CF6',
    endColor: '#8B5CF6',
  },
];

// Helper to pick a semantic icon based on developmental domain name
function getDomainIcon(name: string): keyof typeof Feather.glyphMap {
  const n = name.toLowerCase();
  if (n.includes('motor')) return 'edit-3';
  if (n.includes('cognitive') || n.includes('reasoning') || n.includes('intellectual')) return 'zap';
  if (n.includes('communicat') || n.includes('language') || n.includes('speech')) return 'message-circle';
  if (n.includes('social') || n.includes('emotion') || n.includes('socio') || n.includes('affect')) return 'heart';
  if (n.includes('adaptive') || n.includes('daily') || n.includes('self-care') || n.includes('living')) return 'check-circle';
  return 'layers';
}


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

export default function StudentDevelopmentalDomainPractice({ studentId, filter: externalFilter, refreshTrigger, activityType }: StudentDevelopmentalDomainPracticeProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [data, setData] = useState<MasterDomainExposure[]>([]);
  const [filter, setFilter] = useState<FilterType>((externalFilter as any) || 'overall');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});
  const [selectedSkillKey, setSelectedSkillKey] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
    if (externalFilter) {
      setFilter(externalFilter as any);
    }
  }, [externalFilter]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const result = await getStudentDevelopmentalSkillsExposure(studentId, filter, activityType);
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
  }, [studentId, filter, refreshTrigger, activityType]);

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

  // Find master domain with lowest practice exposures or lowest evaluation score
  const domainAlerts = useMemo(() => {
    if (data.length <= 1) return { lowestPractice: null, lowestScore: null };

    // Lowest practice master domain
    const sortedByPractice = [...data].sort((a, b) => {
      const sumA = a.skills.reduce((acc, s) => acc + s.count, 0);
      const sumB = b.skills.reduce((acc, s) => acc + s.count, 0);
      return sumA - sumB;
    });
    const minPractice = sortedByPractice[0].skills.reduce((acc, s) => acc + s.count, 0);
    const maxPractice = sortedByPractice[sortedByPractice.length - 1].skills.reduce((acc, s) => acc + s.count, 0);
    const lowestPractice = minPractice < maxPractice ? sortedByPractice[0].masterDomain : null;

    // Lowest score master domain (below 3.0 benchmark)
    const scoredDomains = data.filter((d) => d.averageScore !== null && d.averageScore !== undefined);
    let lowestScore: string | null = null;
    if (scoredDomains.length > 0) {
      const sortedByScore = [...scoredDomains].sort((a, b) => (a.averageScore || 0) - (b.averageScore || 0));
      if ((sortedByScore[0].averageScore || 0) < 3.0) {
        lowestScore = sortedByScore[0].masterDomain;
      }
    }

    return { lowestPractice, lowestScore };
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
    { label: 'Last Week', value: 'last_week' },
    { label: 'This Month', value: 'month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'Overall', value: 'overall' },
  ];

  return (
    <View className="flex-col mt-6">
      {/* Header and Filter Selector */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between flex-wrap gap-2">
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

          {/* Compact Tactile Filter Dropdown Trigger */}
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
                WHAT DOES THIS SECTION MEAN?
              </Text>
              <Text className={`font-quicksand-medium text-[#484A4B] leading-relaxed ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                • <Text className="font-quicksand-bold text-[#62A9E6]">Domain Practice Volume:</Text> Tracks completed learning activity trials categorized by developmental domains.
              </Text>
              <Text className={`font-quicksand-medium text-[#484A4B] leading-relaxed ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                • <Text className="font-quicksand-bold text-[#62A9E6]">Rubric Performance (1.0–4.0):</Text> Averages classroom evaluation rubrics across looking, concentrating, performing, following instructions, and completion.
              </Text>
              <Text className={`font-quicksand-medium text-[#484A4B] leading-relaxed ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                • <Text className="font-quicksand-bold text-[#62A9E6]">Benchmark Tiers:</Text> Scores of ≥3.2 (80%+) are <Text className="font-quicksand-bold text-[#179D33]">Mastered</Text>, 2.6–3.19 are <Text className="font-quicksand-bold text-[#FFAE02]">Developing</Text>, and &lt;2.6 are <Text className="font-quicksand-bold text-[#FF8870]">Needs Support</Text>.
              </Text>
            </View>
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
          className={`w-full bg-white border-[4px] border-[#F1F1F1] ${
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
          <View className="flex-col gap-3.5">
            {data.map((domain, domainIdx) => {
              const theme = DOMAIN_THEMES[domainIdx % DOMAIN_THEMES.length];
              const totalDomainExposures = domain.skills.reduce((sum, s) => sum + s.count, 0);
              const isExpanded = !!expandedDomains[domain.masterDomain];

              const score = domain.averageScore;
              const hasScore = score !== null && score !== undefined;
              const isLowestPractice = domainAlerts.lowestPractice === domain.masterDomain;
              const isLowestScore = domainAlerts.lowestScore === domain.masterDomain;

              return (
                <View
                  key={domain.masterDomain}
                  className="flex-col bg-[#F8FAFC] border-[2px] border-[#F1F1F1] rounded-2xl p-3.5 sm:p-4 overflow-hidden"
                >
                  {/* Master Domain Clickable Header */}
                  <Pressable
                    onPress={() => toggleDomain(domain.masterDomain)}
                    className="flex-row items-center justify-between active:scale-[0.99] transition-transform"
                  >
                    {/* Left Side: Semantic Icon Badge + Title + Refined Badges */}
                    <View className="flex-row items-center gap-3 flex-1 pr-3">
                      <View
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl items-center justify-center shrink-0"
                        style={{ backgroundColor: theme.pillBg }}
                      >
                        <Feather
                          name={getDomainIcon(domain.masterDomain)}
                          size={isTablet ? 17 : 15}
                          color={theme.endColor}
                        />
                      </View>

                      <View className="flex-col flex-1 justify-center">
                        <View className="flex-row items-center gap-2 flex-wrap">
                          <Text className="font-fredoka-one text-sm sm:text-base text-[#484A4B]">
                            {domain.masterDomain}
                          </Text>

                          {/* Unified Practices & Score Tag */}
                          <View className="px-2.5 py-0.5 rounded-md bg-[#F1F5F9]">
                            <Text
                              className={`font-fredoka-one uppercase ${
                                isTablet ? 'text-xs' : 'text-[11px]'
                              } text-[#64748B]`}
                            >
                              {totalDomainExposures} {totalDomainExposures === 1 ? 'practice' : 'practices'}
                              {hasScore && ` • ${score.toFixed(1)} avg`}
                            </Text>
                          </View>

                          {/* Master Domain Alert Pill */}
                          {isLowestPractice && (
                            <View className="px-2 py-0.5 rounded-md bg-[#FFFBEB] border border-[#FFF3C4]">
                              <Text className="font-fredoka-one text-[11px] text-[#D97706] uppercase tracking-wider">
                                LOWEST PRACTICE
                              </Text>
                            </View>
                          )}
                          {!isLowestPractice && isLowestScore && (
                            <View className="px-2 py-0.5 rounded-md bg-[#FFF7ED] border border-[#FFDBD4]">
                              <Text className="font-fredoka-one text-[11px] text-[#FF8870] uppercase tracking-wider">
                                LOWEST SCORE
                              </Text>
                            </View>
                          )}
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

                  {/* Collapsible Bar Chart View */}
                  {isExpanded && (
                    <Animated.View
                      entering={FadeInUp.duration(200)}
                      exiting={FadeOutUp.duration(150)}
                      className="flex-col mt-3.5 pt-3.5 border-t border-[#F1F1F1]"
                    >
                      {/* Skills Rows */}
                      <View className="flex-col gap-4">
                        {domain.skills.map((skill) => {
                          const barWidthPercent = (skill.count / maxScale) * 100;
                          const skillKey = `${domain.masterDomain}:${skill.name}`;
                          const isSelected = selectedSkillKey === skillKey;

                          return (
                            <View key={skill.name} className="flex-col">
                              {/* Skill Row: Category Label | Dashed Grid & Solid Interactive Bar */}
                              <View className="flex-row items-center gap-2 sm:gap-3">
                                {/* Y-Axis Category Label */}
                                <View className="w-24 sm:w-36 pr-1 sm:pr-2 flex-col justify-center">
                                  <Text
                                    numberOfLines={2}
                                    className="font-quicksand-bold text-xs text-[#484A4B]"
                                  >
                                    {skill.name}
                                  </Text>
                                </View>

                                {/* Bar Plot Canvas with SVG Dashed Grid Background & Interactive Click */}
                                <Pressable
                                  onPress={() => setSelectedSkillKey(isSelected ? null : skillKey)}
                                  className="flex-1 h-8 justify-center relative active:opacity-90"
                                  style={{ overflow: 'visible' }}
                                >
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

                                  {/* SVG Horizontal Bar (Solid Color, Clean & Simple) */}
                                  <View className="w-full h-5 relative">
                                    <Svg width="100%" height="20">
                                      {barWidthPercent > 0 && (
                                        <Rect
                                          x="0"
                                          y="2"
                                          width={`${Math.max(2, barWidthPercent)}%`}
                                          height="16"
                                          rx="4"
                                          fill={theme.barColor}
                                          opacity={isSelected ? 1 : 0.88}
                                        />
                                      )}
                                    </Svg>
                                  </View>

                                  {/* Floating Interactive Tooltip Popover on Tap */}
                                  {isSelected && (
                                    <Animated.View
                                      entering={FadeInUp.duration(150)}
                                      exiting={FadeOutUp.duration(100)}
                                      className="absolute -top-7 bg-white border-[2px] border-[#BBE8FB] px-2.5 py-1 rounded-xl flex-row items-center gap-1.5 shadow-md z-30 pointer-events-none"
                                      style={{
                                        left: `${Math.max(2, Math.min(barWidthPercent, 65))}%`,
                                        shadowColor: '#62A9E6',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.15,
                                        shadowRadius: 4,
                                        elevation: 4,
                                      }}
                                    >
                                      <Feather name="activity" size={11} color="#62A9E6" />
                                      <Text className="font-fredoka-one text-[11px] text-[#62A9E6]">
                                        {skill.count} {skill.count === 1 ? 'practice' : 'practices'}
                                      </Text>
                                      {skill.averageScore !== null && skill.averageScore !== undefined && (
                                        <Text className="font-quicksand-bold text-[11px] text-[#62A9E6]">
                                          • ★ {skill.averageScore.toFixed(1)} / 4.0
                                        </Text>
                                      )}
                                    </Animated.View>
                                  )}
                                </Pressable>
                              </View>
                            </View>
                          );
                        })}
                      </View>

                      {/* Perfect Pixel Aligned Horizontal X-Axis Ticks & Grid Labels */}
                      <View className="flex-row items-center mt-5 pt-2 border-t border-[#E5E7EB]">
                        {/* Y-Axis Label Margin Spacer */}
                        <View className="w-24 sm:w-36 pr-1 sm:pr-2" />

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
                                <Text className="font-quicksand-bold text-[11px] text-[#9CA3AF]">
                                  {t}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      </View>

                      {/* Tap Hint for Teachers */}
                      <View className="flex-row items-center justify-end mt-2 pt-0.5">
                        <Text className="font-quicksand-medium text-[11px] text-[#9CA3AF] italic">
                          Tap any bar to view exact practice count
                        </Text>
                      </View>
                    </Animated.View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* PER-CHART FILTER MODAL */}
      <ParentFilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        isTablet={isTablet}
        selectedFilter={filter}
        onSelectFilter={(newFilter) => setFilter(newFilter)}
      />
    </View>
  );
}
