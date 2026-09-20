import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { ActivityTypeFilter } from '@/src/services/analytics';
import { MasterDomainInfo, ParentDashboardData, ParentSessionRecord } from '@/src/services/parentDashboard';
import { FilterPeriod, filterSessionsByPeriod } from '@/src/utils/dashboardFilters';

interface ParentCompareAnalyticsProps {
  childrenData: Record<string, ParentDashboardData>;
  linkedStudents: any[];
  masterDomains: MasterDomainInfo[];
  globalFilter: FilterPeriod;
  activityType: ActivityTypeFilter;
  isTablet: boolean;
  onSelectChild: (studentId: string) => void;
}

export function ParentCompareAnalytics({
  childrenData,
  linkedStudents,
  masterDomains,
  globalFilter,
  activityType,
  isTablet,
  onSelectChild,
}: ParentCompareAnalyticsProps) {
  if (!linkedStudents || linkedStudents.length === 0) {
    return null;
  }

  // Calculate metrics for each child
  const childMetrics = linkedStudents.map((student) => {
    const data = childrenData[student.id];
    const rawSessions = data?.sessions || [];

    // Filter by activity type
    const sessionsByActivity = activityType === 'all'
      ? rawSessions
      : rawSessions.filter((s) => (s.activityType || 'app') === activityType);

    // Filter by period
    const filteredSessions = filterSessionsByPeriod(sessionsByActivity, globalFilter);
    const evaluated = filteredSessions.filter((s) => s.status === 'validated' && s.rubricEvaluation);

    let overallPerformance = 0;
    if (evaluated.length > 0) {
      const totalEvalPercentages = evaluated.reduce((sum, s) => {
        const rubric = s.rubricEvaluation;
        if (!rubric) return sum;
        const rubricSum =
          (rubric.looking_at_objects || 0) +
          (rubric.concentrating || 0) +
          (rubric.performing_task || 0) +
          (rubric.following_instructions || 0) +
          (rubric.completed_work || 0);
        return sum + (rubricSum / 25) * 100;
      }, 0);
      overallPerformance = Math.round(totalEvalPercentages / evaluated.length);
    }

    const withDuration = filteredSessions.filter((s) => s.durationSeconds > 0);
    const avgSessionSeconds = withDuration.length
      ? Math.round(withDuration.reduce((sum, s) => sum + s.durationSeconds, 0) / withDuration.length)
      : 0;
    const avgSessionMinutes = Math.round(avgSessionSeconds / 60);

    // Domain breakdown
    const domainScores = (masterDomains || []).map((dom) => {
      const rel = filteredSessions.filter(
        (s) =>
          Boolean(s.rubricEvaluation) &&
          s.skill_domain.some((tag) =>
            dom.subSkills.some((sub) => sub.trim().toLowerCase() === tag.trim().toLowerCase())
          )
      );
      const totalPct = rel.reduce((acc, s) => {
        const r = s.rubricEvaluation;
        if (!r) return acc;
        const rSum =
          (r.looking_at_objects || 0) +
          (r.concentrating || 0) +
          (r.performing_task || 0) +
          (r.following_instructions || 0) +
          (r.completed_work || 0);
        return acc + Math.round((rSum / 25) * 100);
      }, 0);
      const value = rel.length ? Math.round(totalPct / rel.length) : 0;
      return { name: dom.name, color: dom.color, value, count: rel.length };
    });

    const topDomain = [...domainScores].sort((a, b) => b.value - a.value)[0];

    return {
      student,
      data,
      totalSessions: filteredSessions.length,
      evaluatedCount: evaluated.length,
      overallPerformance,
      avgSessionMinutes,
      avgSessionSeconds,
      domainScores,
      topDomain,
    };
  });

  return (
    <View className="flex-col gap-5">
      {/* 1. SIDE-BY-SIDE SUMMARY CARDS */}
      <View className={`w-full flex-col ${isTablet ? 'sm:flex-row' : ''} gap-4`}>
        {childMetrics.map((item, index) => {
          const st = item.student;
          const isFirst = index === 0;
          const themeBorder = isFirst ? '#BBE8FB' : '#CBFAC4';
          const themeBg = isFirst ? '#EBF5FF' : '#EBFDF2';
          const themeAccent = isFirst ? '#62A9E6' : '#179D33';

          return (
            <View
              key={st.id}
              className={`flex-1 bg-white border-[4px] border-[#F1F1F1] ${
                isTablet ? 'rounded-[32px] p-6' : 'rounded-[24px] p-5'
              } flex-col justify-between`}
              style={{
                shadowColor: '#F1F1F1',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              <View>
                {/* Header Row */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-3">
                    <View
                      className="w-14 h-14 rounded-full items-center justify-center border-2"
                      style={{ backgroundColor: themeBg, borderColor: themeAccent }}
                    >
                      <Text style={{ fontSize: 26 }}>{st.avatar || '🙂'}</Text>
                    </View>
                    <View>
                      <Text className="font-fredoka-one text-xl text-[#484A4B]" numberOfLines={1}>
                        {st.name}
                      </Text>
                      {st.classes?.title && (
                        <Text className="font-quicksand-medium text-xs text-[#9CA3AF]">
                          {st.classes.title} {st.classes.grade ? `• ${st.classes.grade}` : ''}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Overall Performance Badge */}
                  <View
                    className="px-3 py-1.5 rounded-xl items-center justify-center"
                    style={{ backgroundColor: themeBg }}
                  >
                    <Text className="font-fredoka-one text-lg" style={{ color: themeAccent }}>
                      {item.overallPerformance > 0 ? `${item.overallPerformance}%` : '—'}
                    </Text>
                    <Text className="font-quicksand-bold text-[9px] text-[#9CA3AF] uppercase">
                      Score
                    </Text>
                  </View>
                </View>

                {/* Key Metrics Grid */}
                <View className="bg-[#F9FAFB] rounded-2xl p-3 flex-row items-center justify-around mb-4 border border-[#E5E7EB]/60">
                  <View className="items-center">
                    <Text className="font-fredoka-one text-base text-[#484A4B]">
                      {item.totalSessions}
                    </Text>
                    <Text className="font-quicksand-medium text-[11px] text-[#9CA3AF]">
                      Sessions
                    </Text>
                  </View>
                  <View className="h-7 w-[1px] bg-[#E5E7EB]" />
                  <View className="items-center">
                    <Text className="font-fredoka-one text-base text-[#484A4B]">
                      {item.avgSessionMinutes > 0 ? `${item.avgSessionMinutes}m` : `${item.avgSessionSeconds}s`}
                    </Text>
                    <Text className="font-quicksand-medium text-[11px] text-[#9CA3AF]">
                      Avg Time
                    </Text>
                  </View>
                  <View className="h-7 w-[1px] bg-[#E5E7EB]" />
                  <View className="items-center">
                    <Text
                      className="font-fredoka-one text-xs text-center"
                      style={{ color: themeAccent, maxWidth: 90 }}
                      numberOfLines={1}
                    >
                      {item.topDomain ? item.topDomain.name : '—'}
                    </Text>
                    <Text className="font-quicksand-medium text-[11px] text-[#9CA3AF]">
                      Top Strength
                    </Text>
                  </View>
                </View>
              </View>

              {/* View Full Individual Analytics Button */}
              <Pressable
                onPress={() => onSelectChild(st.id)}
                className="w-full flex-row items-center justify-center gap-2 bg-white border-[2px] rounded-xl py-2.5 active:scale-95 transition-transform"
                style={{
                  borderColor: themeBorder,
                  shadowColor: themeBorder,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                <Text className="font-fredoka-one text-xs uppercase" style={{ color: themeAccent }}>
                  VIEW {st.name.toUpperCase()}'S FULL REPORT
                </Text>
                <Feather name="arrow-right" size={14} color={themeAccent} />
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* 2. DOMAIN MASTERY COMPARISON TABLE / CARD */}
      <View
        className={`w-full bg-white border-[4px] border-[#F1F1F1] ${
          isTablet ? 'rounded-[32px] p-6' : 'rounded-[24px] p-5'
        }`}
        style={{
          shadowColor: '#F1F1F1',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center justify-between mb-4 pb-2 border-b border-[#F1F1F1]">
          <View>
            <Text className="font-fredoka-one text-lg sm:text-xl text-[#484A4B]">
              Domain Mastery Comparison
            </Text>
            <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-0.5">
              Comparing skill development across all developmental areas
            </Text>
          </View>
          <View className="w-9 h-9 rounded-full bg-[#EBF5FF] items-center justify-center">
            <Ionicons name="bar-chart" size={18} color="#62A9E6" />
          </View>
        </View>

        {/* Domain Comparison Rows */}
        <View className="flex-col gap-4">
          {(masterDomains || []).map((domain) => {
            return (
              <View key={domain.name} className="flex-col gap-1.5 bg-[#F9FAFB] p-3 rounded-2xl border border-[#E5E7EB]/50">
                <Text className="font-fredoka-one text-sm text-[#484A4B]">
                  {domain.name}
                </Text>

                {childMetrics.map((item, idx) => {
                  const scoreObj = item.domainScores.find((d) => d.name === domain.name);
                  const scoreVal = scoreObj?.value || 0;
                  const isFirst = idx === 0;
                  const barColor = isFirst ? '#62A9E6' : '#179D33';

                  return (
                    <View key={item.student.id} className="flex-row items-center gap-2">
                      <View className="w-20">
                        <Text className="font-quicksand-bold text-xs text-[#6B7280]" numberOfLines={1}>
                          {item.student.name}:
                        </Text>
                      </View>

                      {/* Progress Track */}
                      <View className="flex-1 h-3.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(scoreVal, 4)}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </View>

                      {/* Score Value */}
                      <View className="w-12 items-end">
                        <Text className="font-fredoka-one text-xs text-[#484A4B]">
                          {scoreVal > 0 ? `${scoreVal}%` : '0%'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
