import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient, Polygon, Stop, Text as SvgText } from 'react-native-svg';
import { ActivityTypeFilter } from '../../src/services/analytics';
import { ParentSessionRecord } from '../../src/services/parentDashboard';
import { filterSessionsByPeriod, FilterPeriod } from '../../src/utils/dashboardFilters';
import { getSkillDomainTakeaways } from '../../src/services/parentAnalyticsEngine';
import { getAccuracyTier } from '../../src/constants/benchmarkLegend';

const filters: { label: string; value: FilterPeriod }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Overall', value: 'overall' },
];

interface SkillPerformanceItem {
  label: string;
  value: number; // percentage 0 - 100
}

interface ParentSkillPerformanceProps {
  sessions?: ParentSessionRecord[];
  masterDomains?: { name: string; subSkills: string[] }[];
  data?: SkillPerformanceItem[];
  globalFilter?: FilterPeriod;
  activityType?: ActivityTypeFilter;
  isTablet: boolean;
}

const DOMAIN_COLORS = ['#62A9E6', '#FFAE02', '#179D33', '#FF8870', '#A855F7', '#EC4899'];

export function ParentSkillPerformance({
  sessions = [],
  masterDomains = [],
  data: initialData,
  globalFilter,
  activityType = 'all',
  isTablet,
}: ParentSkillPerformanceProps) {
  const { width: windowWidth } = useWindowDimensions();
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

  // Compute Skill Performance by Master Domains dynamically
  const skillData = useMemo(() => {
    if (initialData && sessions.length === 0 && masterDomains.length === 0) return initialData;

    if (masterDomains.length === 0) return initialData || [];

    return masterDomains.map((domain) => {
      const relevant = filteredSessions.filter(
        (s) =>
          Boolean(s.rubricEvaluation) &&
          s.skill_domain.some((tag) =>
            domain.subSkills.some((sub) => sub.trim().toLowerCase() === tag.trim().toLowerCase())
          )
      );

      if (relevant.length === 0) {
        return { label: domain.name, value: 0 };
      }

      const totalScore = relevant.reduce((sum, s) => {
        let scorePct = 0;
        if (s.rubricEvaluation) {
          const r = s.rubricEvaluation;
          const rSum =
            (r.looking_at_objects || 0) +
            (r.concentrating || 0) +
            (r.performing_task || 0) +
            (r.following_instructions || 0) +
            (r.completed_work || 0);
          scorePct = Math.round((rSum / 25) * 100);
        }
        return sum + scorePct;
      }, 0);

      return { label: domain.name, value: Math.round(totalScore / relevant.length) };
    });
  }, [filteredSessions, initialData, masterDomains, sessions.length]);

  const activeData = skillData.length > 0 ? skillData : initialData || [];

  const domainTakeaways = useMemo(() => {
    return getSkillDomainTakeaways(activeData, activityType);
  }, [activeData, activityType]);

  // Radar Chart Layout Metrics
  const chartSize = isTablet ? 240 : Math.min(windowWidth - 70, 220);
  const svgPadding = 28;
  const svgWidth = chartSize + svgPadding * 2;
  const svgHeight = chartSize + svgPadding * 2;
  const cx = svgWidth / 2;
  const cy = svgHeight / 2;
  const radius = chartSize / 2 - 20;

  const sides = Math.max(activeData.length, 3);
  const angleFor = (i: number) => (Math.PI * 2 * i) / sides - Math.PI / 2;

  const ringLevels = [0.25, 0.5, 0.75, 1];

  const pointAt = (i: number, fraction: number) => {
    const angle = angleFor(i);
    return {
      x: cx + Math.cos(angle) * radius * fraction,
      y: cy + Math.sin(angle) * radius * fraction,
    };
  };

  const valuePoints = activeData
    .map((d, i) => {
      const p = pointAt(i, Math.max(0, Math.min(100, d.value)) / 100);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const hasSkillData = useMemo(() => {
    return activeData.some((item) => item.value > 0);
  }, [activeData]);

  return (
    <View className="flex-col mt-6 w-full">
      {/* Header and Filter Selector */}
      <View className="mb-4">
        <View className="flex-row flex-wrap items-center justify-between gap-4">
          <View className="flex-row items-center gap-2">
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[28px]' : 'text-[20px]'}`}>
              Skill Performance
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
            className="w-full bg-[#F0F9FF] border border-[#BBE8FB] rounded-2xl p-3.5 mt-3 flex-row items-start gap-2.5 overflow-hidden"
          >
            <Feather name="info" size={isTablet ? 20 : 16} color="#62A9E6" style={{ marginTop: 2 }} />
            <View className="flex-1 flex-col gap-1.5">
              <Text className={`font-fredoka-one text-[#62A9E6] ${isTablet ? 'text-sm' : 'text-xs'}`}>
                WHAT DOES THIS CHART MEAN?
              </Text>
              <Text className={`font-quicksand-medium text-[#484A4B] leading-relaxed ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                • <Text className="font-quicksand-bold text-[#62A9E6]">What this shows:</Text> A well-rounded look at your child's growth across key developmental skill areas (like Communication, Motor, and Cognitive skills).
              </Text>
              <Text className={`font-quicksand-medium text-[#484A4B] leading-relaxed ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                • <Text className="font-quicksand-bold text-[#62A9E6]">Radar web:</Text> The wider the blue shape stretches outwards, the more confident and independent your child is in that domain.
              </Text>
              <Text className={`font-quicksand-medium text-[#484A4B] leading-relaxed ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                • <Text className="font-quicksand-bold text-[#62A9E6]">Status levels:</Text> Scores of 80%+ indicate Mastered domains, 65%–79% Developing, and below 65% highlight domains where gentle practice helps most.
              </Text>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Content Area */}
      {!hasSkillData || activeData.length < 3 ? (
        <View className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-2xl p-8 items-center justify-center">
          <Feather name="pie-chart" size={isTablet ? 40 : 30} color="#9CA3AF" />
          <Text className="font-fredoka-one text-base text-[#4B5563] mt-3 text-center">
            No Skill Data Yet
          </Text>
          <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-1 text-center">
            Skill domain performance scores will populate as learning activities are completed for this filter.
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
            alignItems: 'center',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.03,
            shadowRadius: 10,
            elevation: 1,
          }}
        >
          {/* 2-Column Split Content: Radar Chart on Left, One-Row-Per-Item Legend List on Right */}
          <View className={`w-full ${isTablet ? 'flex-row items-center justify-between gap-6' : 'flex-col gap-4'}`}>
            {/* Column 1: Radar Chart */}
            <View className={`items-center justify-center overflow-visible ${isTablet ? 'w-[45%]' : 'w-full'}`}>
              <Svg width={svgWidth} height={svgHeight}>
                <Defs>
                  <LinearGradient id="parentRadarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#62A9E6" stopOpacity="0.55" />
                    <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.25" />
                  </LinearGradient>
                </Defs>

                {/* Concentric Grid Rings */}
                {ringLevels.map((f) => {
                  const pts = Array.from({ length: sides }, (_, i) => {
                    const p = pointAt(i, f);
                    return `${p.x},${p.y}`;
                  }).join(' ');
                  return <Polygon key={f} points={pts} stroke="#F3F4F6" strokeWidth={1.5} fill="none" />;
                })}

                {/* Clean Grid Spokes */}
                {activeData.map((_, i) => {
                  const p = pointAt(i, 1);
                  return <Line key={`spoke-${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#F3F4F6" strokeWidth={1.5} />;
                })}

                {/* Domain Colored Dots at the Outer Web Tips of the Radar Chart */}
                {activeData.map((_, i) => {
                  const color = DOMAIN_COLORS[i % DOMAIN_COLORS.length];
                  const p = pointAt(i, 1);
                  return (
                    <React.Fragment key={`outer-dot-${i}`}>
                      <Circle cx={p.x} cy={p.y} r={5.5} fill={color} fillOpacity={0.35} />
                      <Circle cx={p.x} cy={p.y} r={3.5} fill={color} />
                    </React.Fragment>
                  );
                })}

                {/* Inner Data Score Polygon Web */}
                <Polygon
                  points={valuePoints}
                  fill="url(#parentRadarGradient)"
                  stroke="#62A9E6"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                />

                {/* Inner Score Value Dots (Clean Blue) */}
                {activeData.map((d, i) => {
                  const p = pointAt(i, Math.max(0, Math.min(100, d.value)) / 100);
                  return (
                    <React.Fragment key={`dot-${i}`}>
                      <Circle cx={p.x} cy={p.y} r={5} fill="#62A9E6" fillOpacity={0.3} />
                      <Circle cx={p.x} cy={p.y} r={3.5} fill="#FFFFFF" stroke="#62A9E6" strokeWidth={2} />
                    </React.Fragment>
                  );
                })}

                {/* Spoke Domain Labels */}
                {activeData.map((d, i) => {
                  const p = pointAt(i, 1.25);
                  const angle = angleFor(i);
                  const cos = Math.cos(angle);
                  const sin = Math.sin(angle);
                  let textAnchor: 'middle' | 'start' | 'end' = 'middle';
                  if (cos > 0.3) textAnchor = 'start';
                  else if (cos < -0.3) textAnchor = 'end';

                  let dy = 3;
                  if (sin < -0.7) dy = -3;
                  else if (sin > 0.7) dy = 9;

                  const labelText = d.label.length > 13 ? `${d.label.slice(0, 12)}…` : d.label;
                  return (
                    <SvgText
                      key={`spoke-label-${i}`}
                      x={p.x}
                      y={p.y + dy}
                      fontSize={isTablet ? 11 : 9.5}
                      fontFamily="Quicksand-Bold"
                      fill="#484A4B"
                      textAnchor={textAnchor}
                    >
                      {labelText}
                    </SvgText>
                  );
                })}
              </Svg>
            </View>

            {/* Column 2: Domain Legend List (One Row Per Item) */}
            <View className={`flex-col gap-2.5 ${isTablet ? 'w-[52%]' : 'w-full mt-2 pt-3 border-t border-[#F3F4F6]'}`}>
              {activeData.map((item, idx) => {
                const color = DOMAIN_COLORS[idx % DOMAIN_COLORS.length];
                const scorePct = Math.round(item.value);
                const tier = getAccuracyTier(scorePct);

                return (
                  <View
                    key={item.label}
                    className="w-full bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-3 flex-col"
                  >
                    {/* Top Row: Color Dot + Full Domain Title + Benchmark Badge + Percentage Badge Pill */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2 flex-1 pr-2">
                        <View className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <Text className="font-quicksand-bold text-xs sm:text-sm text-[#374151] flex-1 leading-snug">
                          {item.label}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1.5">
                        <View
                          className="px-2 py-0.5 rounded-full border"
                          style={{
                            backgroundColor: tier.bgColor,
                            borderColor: tier.borderColor,
                          }}
                        >
                          <Text className="font-fredoka-one text-[10px] uppercase" style={{ color: tier.accentColor }}>
                            {tier.parentLabel}
                          </Text>
                        </View>
                        <View
                          className="px-2 py-0.5 rounded-full border"
                          style={{
                            backgroundColor: `${color}18`,
                            borderColor: `${color}50`,
                          }}
                        >
                          <Text className="font-fredoka-one text-xs sm:text-sm" style={{ color: color }}>
                            {scorePct}%
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Micro Progress Bar Track */}
                    <View className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden mt-2">
                      <View
                        style={{
                          width: `${Math.max(0, Math.min(100, scorePct))}%`,
                          backgroundColor: color,
                          height: '100%',
                          borderRadius: 999,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Dynamic Evidence-Based Domain Insights Callouts */}
          {domainTakeaways.length > 0 && (
            <View className="mt-4 pt-4 border-t border-[#F3F4F6] flex-col gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="font-fredoka-one text-xs text-[#9CA3AF] uppercase tracking-wider">
                  DOMAIN HIGHLIGHTS & AT-HOME GUIDANCE
                </Text>
              </View>

              <View className="flex-col gap-2.5">
                {domainTakeaways.map((t, idx) => {
                  const isGrowth = t.badgeType === 'growth';
                  const isFocus = t.badgeType === 'focus';
                  const isSteady = t.badgeType === 'steady';

                  const badgeBg = isGrowth ? '#DCFCE7' : isFocus ? '#FFF3C4' : isSteady ? '#E0F2FE' : '#F3F4F6';
                  const badgeBorder = isGrowth ? '#86EFAC' : isFocus ? '#FFAE02' : isSteady ? '#62A9E6' : '#D1D5DB';
                  const badgeText = isGrowth ? '#15803D' : isFocus ? '#D97706' : isSteady ? '#2563EB' : '#6B7280';

                  return (
                    <View
                      key={`takeaway-${idx}`}
                      className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl p-3.5 flex-col gap-1.5"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2 flex-1 pr-2">
                          <View
                            style={{
                              backgroundColor: badgeBg,
                              borderColor: badgeBorder,
                              borderWidth: 1,
                              borderRadius: 999,
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                            }}
                          >
                            <Text
                              style={{ color: badgeText }}
                              className="font-fredoka-one text-[9px] uppercase"
                            >
                              {t.badgeLabel}
                            </Text>
                          </View>
                          <Text className="font-fredoka-one text-sm text-[#374151] flex-1" numberOfLines={1}>
                            {t.title}
                          </Text>
                        </View>
                      </View>

                      <Text className="font-quicksand-medium text-xs text-[#64748B] leading-relaxed">
                        {t.description}
                      </Text>

                      {t.recommendation && (
                        <View className="bg-white border border-[#E2E8F0] rounded-xl p-2.5 flex-row items-start gap-2 mt-1">
                          <Feather name="home" size={13} color="#62A9E6" style={{ marginTop: 2 }} />
                          <Text className="font-quicksand-medium text-[11px] text-[#475569] flex-1 leading-normal">
                            <Text className="font-quicksand-bold text-[#0F172A]">At-Home Tip: </Text>
                            {t.recommendation}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
