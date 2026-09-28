import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityTypeFilter } from '../../src/services/analytics';
import { exportChildReportPdf } from '../../src/services/exportReport';
import { generateNarrativeHighlights } from '../../src/services/parentAnalyticsEngine';
import {
  getAllLinkedChildrenDashboardData,
  getParentDashboardData,
  ParentDashboardData,
} from '../../src/services/parentDashboard';
import { filterSessionsByPeriod, FilterPeriod, getFilterLabel } from '../../src/utils/dashboardFilters';

import { ParentActivityPerformance } from '../../components/parent/parent-activity-performance';
import { ParentCompareAnalytics } from '../../components/parent/parent-compare-analytics';
import { ParentDashboardSkeleton } from '../../components/parent/parent-dashboard-skeleton';
import { ParentDomainExplainers } from '../../components/parent/parent-domain-explainers';
import { ParentFilterModal } from '../../components/parent/parent-filter-modal';
import { ParentNarrativeSummary } from '../../components/parent/parent-narrative-summary';
import { ParentProgressTrend } from '../../components/parent/parent-progress-trend';
import { ParentSkillPerformance } from '../../components/parent/parent-skill-performance';
import { ParentStatsSection } from '../../components/parent/parent-stats-section';
import { UniversalLegendModal } from '../../components/analytics/universal-legend-modal';
import { HeaderButton } from '../../components/header-button';

export default function ParentAnalyticsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const insets = useSafeAreaInsets();

  const [focusKey, setFocusKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState<ParentDashboardData | null>(null);
  const [allChildrenData, setAllChildrenData] = useState<Record<string, ParentDashboardData>>({});
  const [linkedStudents, setLinkedStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | 'all' | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<FilterPeriod>('overall');
  const [activityType, setActivityType] = useState<ActivityTypeFilter>('all');
  const [language, setLanguage] = useState<'en' | 'tl'>('en');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isLegendModalVisible, setLegendModalVisible] = useState(false);

  // Load language preference from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('@parent_analytics_lang').then((saved) => {
      if (saved === 'tl' || saved === 'en') {
        setLanguage(saved);
      }
    });
  }, []);

  const toggleLanguage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextLang = language === 'en' ? 'tl' : 'en';
    setLanguage(nextLang);
    try {
      await AsyncStorage.setItem('@parent_analytics_lang', nextLang);
    } catch (err) {
      console.error('Error saving language preference:', err);
    }
  };

  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const multiData = await getAllLinkedChildrenDashboardData();
      setLinkedStudents(multiData.linkedStudents);
      setAllChildrenData(multiData.childrenData);

      if (multiData.linkedStudents.length > 0) {
        // If current selection is valid, keep it; otherwise default to first child
        const currentTargetId =
          selectedStudentId && (selectedStudentId === 'all' || multiData.childrenData[selectedStudentId])
            ? selectedStudentId
            : multiData.linkedStudents[0].id;

        if (currentTargetId === 'all') {
          // If in 'all' compare mode, set active dashboard to first child for fallback values
          setDashboard(multiData.childrenData[multiData.linkedStudents[0].id]);
        } else {
          setDashboard(multiData.childrenData[currentTargetId]);
        }
      } else {
        setDashboard(null);
      }
    } catch (err: any) {
      console.error('Error loading parent analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStudentId]);

  useFocusEffect(
    useCallback(() => {
      setFocusKey((prev) => prev + 1);
      loadAnalyticsData();
    }, [loadAnalyticsData])
  );

  const handleSelectStudentMode = (targetId: string | 'all') => {
    setSelectedStudentId(targetId);
    if (targetId === 'all') {
      if (linkedStudents.length > 0) {
        setDashboard(allChildrenData[linkedStudents[0].id]);
      }
    } else {
      if (allChildrenData[targetId]) {
        setDashboard(allChildrenData[targetId]);
      }
    }
  };

  const sessions = dashboard?.sessions || [];

  // Filter sessions first by selected Activity Source ('all' | 'app' | 'classroom')
  const sessionsByActivityType = useMemo(() => {
    if (activityType === 'all') return sessions;
    return sessions.filter((s) => (s.activityType || 'app') === activityType);
  }, [sessions, activityType]);

  // Then filter by Timeframe Range ('today' | 'week' | 'month' | 'overall')
  const filteredSessionsForStats = useMemo(() => {
    return filterSessionsByPeriod(sessionsByActivityType, globalFilter);
  }, [sessionsByActivityType, globalFilter]);

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
    return generateNarrativeHighlights(evaluatedSessions, dashboard?.masterDomains || [], activityType, language);
  }, [evaluatedSessions, dashboard, activityType, language]);

  const radarData = useMemo(() => {
    const domains = dashboard?.masterDomains || [];
    return domains.map((domain) => {
      const relevant = filteredSessionsForStats.filter(
        (s) =>
          Boolean(s.rubricEvaluation) &&
          s.skill_domain.some((tag) =>
            domain.subSkills.some((sub) => sub.trim().toLowerCase() === tag.trim().toLowerCase())
          )
      );
      const totalPct = relevant.reduce((acc, s) => {
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
      const value = relevant.length ? Math.round(totalPct / relevant.length) : 0;
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
        getFilterLabel(globalFilter),
        activityType
      );
    } catch (err: any) {
      Alert.alert('Could not create PDF', err.message || 'Error exporting report');
    } finally {
      setIsExporting(false);
    }
  };

  const activityTypeOptions: { label: string; value: ActivityTypeFilter; icon: keyof typeof Feather.glyphMap }[] = [
    { label: 'All Activities', value: 'all', icon: 'grid' },
    { label: 'App Activities', value: 'app', icon: 'tablet' },
    { label: 'Classroom Activities', value: 'classroom', icon: 'book-open' },
  ];

  const currentActivityOption = activityTypeOptions.find((o) => o.value === activityType) || activityTypeOptions[0];

  if (isLoading) {
    return <ParentDashboardSkeleton variant="analytics" />;
  }

  if (!dashboard?.student && linkedStudents.length === 0) {
    return (
      <View className="flex-1 bg-[#F5F8FA] items-center justify-center px-8">
        <Feather name="user-x" size={40} color="#9CA3AF" />
        <Text className="font-quicksand-bold text-[#4B5563] text-lg mt-4 text-center">
          No child linked yet
        </Text>
        <Text className="font-quicksand-medium text-[#9CA3AF] text-sm mt-2 text-center">
          Go to your Profile tab to link your child with their learner code.
        </Text>
      </View>
    );
  }

  const isCompareMode = selectedStudentId === 'all';

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
          {/* TITLE & UTILITY ACTIONS ROW */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[40px]' : 'text-[28px]'}`}>
              Analytics
            </Text>

            {/* Top Right Utility Group: Language Toggle (Placeholder) + Export + Help */}
            <View className="flex-row items-center gap-2">
              {/* Language Translate Button (Single Icon/Badge - Toggles EN <-> TL) */}
              <HeaderButton
                onPress={toggleLanguage}
                icon={
                  <Text className={`font-fredoka-one ${isTablet ? 'text-base' : 'text-sm'} text-[#62A9E6]`}>
                    {language === 'en' ? 'TL' : 'EN'}
                  </Text>
                }
              />

              {/* Master Download Report Button */}
              {!isCompareMode && (
                <HeaderButton
                  onPress={handleExportPdf}
                  disabled={isExporting}
                  icon={
                    isExporting ? (
                      <ActivityIndicator size="small" color="#62A9E6" />
                    ) : (
                      <Feather name="download" size={isTablet ? 22 : 18} color="#62A9E6" />
                    )
                  }
                />
              )}

              {/* Universal Legend / Help Button */}
              <HeaderButton
                onPress={() => setLegendModalVisible(true)}
                icon={<Ionicons name="help-circle-outline" size={isTablet ? 26 : 22} color="#62A9E6" />}
              />
            </View>
          </View>

          {/* MULTI-CHILD VIEW SELECTOR BAR (Shown when parent has 2+ children linked) */}
          {linkedStudents.length > 1 && (
            <View className="flex-row items-center gap-2 mb-3 mt-1 flex-wrap">
              {linkedStudents.map((st) => {
                const isSelected =
                  selectedStudentId === st.id || (!selectedStudentId && st.id === linkedStudents[0]?.id);
                return (
                  <Pressable
                    key={st.id}
                    onPress={() => handleSelectStudentMode(st.id)}
                    className={`flex-row items-center gap-2 px-3 py-1.5 rounded-full border-[2px] active:scale-95 transition-transform ${
                      isSelected ? 'bg-[#EBF5FF] border-[#62A9E6]' : 'bg-white border-[#E5E7EB]'
                    }`}
                    style={
                      isSelected
                        ? {
                            shadowColor: '#BBE8FB',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 1,
                            shadowRadius: 0,
                            elevation: 2,
                          }
                        : undefined
                    }
                  >
                    <Text style={{ fontSize: 16 }}>{st.avatar || '🙂'}</Text>
                    <Text
                      className={`font-fredoka-one text-xs ${
                        isSelected ? 'text-[#62A9E6]' : 'text-[#6B7280]'
                      }`}
                    >
                      {st.name}
                    </Text>
                  </Pressable>
                );
              })}

              {/* Compare Both / Dual View Button */}
              <Pressable
                onPress={() => handleSelectStudentMode('all')}
                className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border-[2px] active:scale-95 transition-transform ${
                  isCompareMode ? 'bg-[#CBFAC4] border-[#179D33]' : 'bg-white border-[#E5E7EB]'
                }`}
                style={
                  isCompareMode
                    ? {
                        shadowColor: '#CBFAC4',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 1,
                        shadowRadius: 0,
                        elevation: 2,
                      }
                    : undefined
                }
              >
                <Ionicons
                  name="stats-chart"
                  size={14}
                  color={isCompareMode ? '#179D33' : '#6B7280'}
                />
                <Text
                  className={`font-fredoka-one text-xs ${
                    isCompareMode ? 'text-[#179D33]' : 'text-[#6B7280]'
                  }`}
                >
                  Compare Both
                </Text>
              </Pressable>
            </View>
          )}

          {/* COMBINED CONTROLS BAR: RANGE FILTER (LEFT) & ACTIVITY SOURCE CAPSULE (RIGHT) */}
          <View className="flex-row items-center justify-between gap-2 mt-1 mb-3">
            {/* Range Filter Selector */}
            <Pressable
              onPress={() => setFilterModalVisible(true)}
              className="flex-row items-center justify-center gap-1.5 bg-white border-[2px] border-[#BBE8FB] px-3 h-[40px] rounded-xl active:scale-95 transition-transform"
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
                {getFilterLabel(globalFilter).toUpperCase()}
              </Text>
              <Feather name="chevron-down" size={13} color="#62A9E6" />
            </Pressable>

            {/* Activity Source Capsule Switcher */}
            <View className="flex-row items-center bg-[#ECEFF3] p-1 rounded-full border border-[#E2E8F0] h-[40px]">
              {activityTypeOptions.map((opt) => {
                const isActive = activityType === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setActivityType(opt.value)}
                    className={`w-9 h-7 sm:w-10 sm:h-8 items-center justify-center rounded-full transition-all active:scale-90 ${
                      isActive ? 'bg-[#62A9E6]' : 'bg-transparent'
                    }`}
                    style={
                      isActive
                        ? {
                            shadowColor: '#62A9E6',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.35,
                            shadowRadius: 2,
                            elevation: 2,
                          }
                        : undefined
                    }
                    accessibilityRole="button"
                    accessibilityLabel={opt.label}
                  >
                    <Feather
                      name={opt.icon}
                      size={isTablet ? 18 : 15}
                      color={isActive ? '#FFFFFF' : '#64748B'}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* CONTENT CONTAINER */}
        <View className={`w-full ${isTablet ? 'px-12' : 'px-6'}`}>
          {isCompareMode ? (
            /* DUAL / COMPARISON VIEW */
            <Animated.View key={`compare-${focusKey}`} entering={FadeInRight.delay(100).duration(300)} className="w-full">
              <ParentCompareAnalytics
                childrenData={allChildrenData}
                linkedStudents={linkedStudents}
                masterDomains={dashboard?.masterDomains || []}
                globalFilter={globalFilter}
                activityType={activityType}
                isTablet={isTablet}
                onSelectChild={(id) => handleSelectStudentMode(id)}
              />
            </Animated.View>
          ) : (
            /* INDIVIDUAL CHILD DETAILED ANALYTICS */
            <View className="flex-col gap-4">
              {/* STAT CARDS */}
              <Animated.View key={`stats-${focusKey}`} entering={FadeInRight.delay(100).duration(300)} className="w-full">
                <ParentStatsSection stats={stats} isTablet={isTablet} language={language} />
              </Animated.View>

              {/* EXECUTIVE NARRATIVE SUMMARY */}
              <Animated.View key={`summary-${focusKey}`} entering={FadeInRight.delay(120).duration(300)} className="w-full">
                <ParentNarrativeSummary highlights={narrativeHighlights} isTablet={isTablet} language={language} />
              </Animated.View>

              {/* DAILY PROGRESS TREND */}
              <Animated.View key={`trend-${focusKey}`} entering={FadeInRight.delay(150).duration(300)} className="w-full">
                <ParentProgressTrend
                  sessions={sessionsByActivityType}
                  globalFilter={globalFilter}
                  activityType={activityType}
                  isTablet={isTablet}
                  language={language}
                />
              </Animated.View>

              {/* ACTIVITY PERFORMANCE (Shown for App and All activities; omitted for Classroom view) */}
              {activityType !== 'classroom' && (
                <Animated.View key={`activity-${focusKey}`} entering={FadeInRight.delay(200).duration(300)} className="w-full">
                  <ParentActivityPerformance
                    sessions={sessionsByActivityType}
                    globalFilter={globalFilter}
                    activityType={activityType}
                    isTablet={isTablet}
                    language={language}
                  />
                </Animated.View>
              )}

              {/* SKILL PERFORMANCE */}
              <Animated.View key={`skill-${focusKey}`} entering={FadeInRight.delay(250).duration(300)} className="w-full">
                <ParentSkillPerformance
                  sessions={sessionsByActivityType}
                  masterDomains={dashboard?.masterDomains}
                  globalFilter={globalFilter}
                  activityType={activityType}
                  isTablet={isTablet}
                  language={language}
                />
              </Animated.View>

              {/* SPED DOMAIN EDUCATIONAL EXPLAINERS */}
              <Animated.View key={`explainers-${focusKey}`} entering={FadeInRight.delay(300).duration(300)} className="w-full">
                <ParentDomainExplainers isTablet={isTablet} language={language} />
              </Animated.View>
            </View>
          )}
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

      {/* UNIVERSAL 3-TIER BENCHMARK LEGEND MODAL */}
      <UniversalLegendModal
        visible={isLegendModalVisible}
        onClose={() => setLegendModalVisible(false)}
        isTablet={isTablet}
        role="parent"
      />
    </SafeAreaView>
  );
}
