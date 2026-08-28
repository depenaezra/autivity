import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { exportChildReportPdf } from '../../src/services/exportReport';
import { generateNarrativeHighlights } from '../../src/services/parentAnalyticsEngine';
import { getParentDashboardData, ParentDashboardData } from '../../src/services/parentDashboard';
import { filterSessionsByPeriod, FilterPeriod, getFilterLabel } from '../../src/utils/dashboardFilters';

import { ParentActivityPerformance } from '../../components/parent/parent-activity-performance';
import { ParentDashboardSkeleton } from '../../components/parent/parent-dashboard-skeleton';
import { ParentDomainExplainers } from '../../components/parent/parent-domain-explainers';
import { ParentFilterModal } from '../../components/parent/parent-filter-modal';
import { ParentNarrativeSummary } from '../../components/parent/parent-narrative-summary';
import { ParentProgressTrend } from '../../components/parent/parent-progress-trend';
import { ParentSkillPerformance } from '../../components/parent/parent-skill-performance';
import { ParentStatsSection } from '../../components/parent/parent-stats-section';

export default function ParentAnalyticsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const insets = useSafeAreaInsets();

  const [focusKey, setFocusKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState<ParentDashboardData | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<FilterPeriod>('overall');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setFocusKey((prev) => prev + 1);
      let isActive = true;
      (async () => {
        setIsLoading(true);
        try {
          const data = await getParentDashboardData();
          if (isActive) {
            setDashboard(data);
          }
        } catch (err: any) {
          console.error('Error loading parent analytics:', err);
        } finally {
          if (isActive) setIsLoading(false);
        }
      })();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const sessions = dashboard?.sessions || [];

  const filteredSessionsForStats = useMemo(() => {
    return filterSessionsByPeriod(sessions, globalFilter);
  }, [sessions, globalFilter]);

  const evaluatedSessions = useMemo(() => {
    return filteredSessionsForStats.filter((s) => s.status === 'validated' && s.rubricEvaluation);
  }, [filteredSessionsForStats]);

  const stats = useMemo(() => {
    let overallPerformance = 0;
    if (evaluatedSessions.length > 0) {
      const totalEvalPercentages = evaluatedSessions.reduce((sum, s) => {
        const rubric = s.rubricEvaluation;
        if (!rubric) return sum;
        const rubricSum =
          (rubric.looking_at_objects || 0) +
          (rubric.concentrating || 0) +
          (rubric.performing_task || 0) +
          (rubric.following_instructions || 0) +
          (rubric.completed_work || 0);
        const evalPercentage = (rubricSum / 25) * 100;
        return sum + evalPercentage;
      }, 0);

      overallPerformance = Math.round(totalEvalPercentages / evaluatedSessions.length);
    }

    const withDuration = filteredSessionsForStats.filter((s) => s.durationSeconds > 0);
    const avgSessionSeconds = withDuration.length
      ? Math.round(withDuration.reduce((sum, s) => sum + s.durationSeconds, 0) / withDuration.length)
      : 0;
    const avgSessionMinutes = Math.round(avgSessionSeconds / 60);

    return {
      overallPerformance,
      avgSessionMinutes,
      avgSessionSeconds,
      totalSessions: filteredSessionsForStats.length,
    };
  }, [filteredSessionsForStats, evaluatedSessions]);

  const narrativeHighlights = useMemo(() => {
    return generateNarrativeHighlights(evaluatedSessions, dashboard?.masterDomains || []);
  }, [evaluatedSessions, dashboard]);

  const radarData = useMemo(() => {
    const domains = dashboard?.masterDomains || [];
    return domains.map((domain) => {
      const relevant = filteredSessionsForStats.filter(
        (s) =>
          (s.rubricEvaluation || (s.status === 'validated' && s.score != null)) &&
          s.skill_domain.some((tag) =>
            domain.subSkills.some((sub) => sub.trim().toLowerCase() === tag.trim().toLowerCase())
          )
      );
      const value = relevant.length
        ? Math.round(relevant.reduce((sum, s) => sum + (s.score || 0), 0) / relevant.length)
        : 0;
      return { label: domain.name, value };
    });
  }, [filteredSessionsForStats, dashboard]);

  const handleExportPdf = async () => {
    if (!dashboard || !dashboard.student) return;
    setIsExporting(true);
    try {
      await exportChildReportPdf(
        {
          ...dashboard,
          sessions: filteredSessionsForStats,
        },
        {
          overallPerformance: stats.overallPerformance,
          avgSessionMinutes: stats.avgSessionMinutes,
          avgSessionSeconds: stats.avgSessionSeconds,
          totalSessions: stats.totalSessions,
          skillBreakdown: radarData,
        },
        getFilterLabel(globalFilter)
      );
    } catch (err: any) {
      Alert.alert('Could not create PDF', err.message || 'Error exporting report');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <ParentDashboardSkeleton variant="analytics" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: isTablet ? 24 : 16 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* PAGE TITLE HEADER & CONTROL BUTTONS ROW */}
        <Animated.View
          key={`header-${focusKey}`}
          entering={FadeInRight.delay(50).duration(300)}
          className={`w-full ${isTablet ? 'px-12 pt-4' : 'px-6 pt-2'}`}
        >
          <View className="flex-row flex-wrap items-center justify-between gap-3 mb-4">
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[44px]' : 'text-[28px]'}`}>
              Analytics
            </Text>

            {/* CONTROL BUTTONS TO THE RIGHT OF TITLE */}
            <View className="flex-row items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Range Filter Selector */}
              <Pressable
                onPress={() => setFilterModalVisible(true)}
                className="flex-row items-center justify-center gap-1.5 bg-white border-[2px] border-[#BBE8FB] px-3 h-[36px] rounded-xl active:scale-95 transition-transform"
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
                  RANGE: {getFilterLabel(globalFilter).toUpperCase()}
                </Text>
                <Feather name="chevron-down" size={13} color="#62A9E6" />
              </Pressable>

              {/* Master Download Report Button */}
              <Pressable
                onPress={handleExportPdf}
                disabled={isExporting}
                className="flex-row items-center justify-center gap-1.5 bg-white border-[2px] border-[#BBE8FB] px-3 h-[36px] rounded-xl active:scale-95 transition-transform"
                style={{
                  borderColor: '#BBE8FB',
                  shadowColor: '#BBE8FB',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color="#62A9E6" style={{ height: 16 }} />
                ) : (
                  <>
                    <Feather name="download" size={13} color="#62A9E6" />
                    <Text className="font-fredoka-one text-[#62A9E6] text-[11px] uppercase" numberOfLines={1}>
                      DOWNLOAD REPORT
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* CONTENT CONTAINER */}
        <View className={`w-full ${isTablet ? 'px-12' : 'px-6'}`}>
          <View className="flex-col gap-4">

            {/* STAT CARDS */}
            <Animated.View key={`stats-${focusKey}`} entering={FadeInRight.delay(100).duration(300)} className="w-full">
              <ParentStatsSection stats={stats} isTablet={isTablet} />
            </Animated.View>

            {/* EXECUTIVE NARRATIVE SUMMARY */}
            <Animated.View key={`summary-${focusKey}`} entering={FadeInRight.delay(120).duration(300)} className="w-full">
              <ParentNarrativeSummary highlights={narrativeHighlights} isTablet={isTablet} />
            </Animated.View>

            {/* DAILY PROGRESS TREND & TRAJECTORY FORECAST */}
            <Animated.View key={`trend-${focusKey}`} entering={FadeInRight.delay(150).duration(300)} className="w-full">
              <ParentProgressTrend sessions={sessions} globalFilter={globalFilter} isTablet={isTablet} />
            </Animated.View>

            {/* ACTIVITY PERFORMANCE */}
            <Animated.View key={`activity-${focusKey}`} entering={FadeInRight.delay(200).duration(300)} className="w-full">
              <ParentActivityPerformance sessions={sessions} globalFilter={globalFilter} isTablet={isTablet} />
            </Animated.View>

            {/* SKILL PERFORMANCE */}
            <Animated.View key={`skill-${focusKey}`} entering={FadeInRight.delay(250).duration(300)} className="w-full">
              <ParentSkillPerformance
                sessions={sessions}
                masterDomains={dashboard?.masterDomains}
                globalFilter={globalFilter}
                isTablet={isTablet}
              />
            </Animated.View>

            {/* SPED DOMAIN EDUCATIONAL EXPLAINERS */}
            <Animated.View key={`explainers-${focusKey}`} entering={FadeInRight.delay(300).duration(300)} className="w-full">
              <ParentDomainExplainers isTablet={isTablet} />
            </Animated.View>
          </View>
        </View>
      </ScrollView>

      {/* GLOBAL FILTER MODAL */}
      <ParentFilterModal
        visible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        isTablet={isTablet}
        selectedFilter={globalFilter}
        onSelectFilter={setGlobalFilter}
      />
    </SafeAreaView>
  );
}
