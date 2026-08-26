import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { exportChildReportPdf } from '../../src/services/exportReport';
import { getParentDashboardData, ParentDashboardData } from '../../src/services/parentDashboard';
import { getUserProfile } from '../../src/services/profile';
import { filterSessionsByPeriod, FilterPeriod, getFilterLabel } from '../../src/utils/dashboardFilters';

import { IepGoalsModal } from '../../components/parent/iep-goals-modal';
import { LearnerInfoModal } from '../../components/parent/learner-info-modal';
import { ParentActivityPerformance } from '../../components/parent/parent-activity-performance';
import { ParentDashboardSkeleton } from '../../components/parent/parent-dashboard-skeleton';
import { ParentFilterModal } from '../../components/parent/parent-filter-modal';
import { ParentHeader } from '../../components/parent/parent-header';
import { ParentProgressTrend } from '../../components/parent/parent-progress-trend';
import { ParentSkillPerformance } from '../../components/parent/parent-skill-performance';
import { ParentStatsSection } from '../../components/parent/parent-stats-section';
import { ParentTeacherFeedback } from '../../components/parent/parent-teacher-feedback';

export default function ParentHomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const paramFirstName = Array.isArray(params.firstName) ? params.firstName[0] : params.firstName;

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const insets = useSafeAreaInsets();

  const [focusKey, setFocusKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState<ParentDashboardData | null>(null);
  const [parentName, setParentName] = useState<string>((paramFirstName as string) || '');
  const [isLearnerInfoVisible, setLearnerInfoVisible] = useState(false);
  const [isGoalsVisible, setGoalsVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<FilterPeriod>('overall');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  useEffect(() => {
    if (paramFirstName) {
      setParentName(paramFirstName as string);
    }
  }, [paramFirstName]);

  useFocusEffect(
    useCallback(() => {
      setFocusKey((prev) => prev + 1);
      let isActive = true;
      (async () => {
        setIsLoading(true);
        try {
          const profile = await getUserProfile().catch(() => null);
          if (isActive && profile?.first_name) {
            setParentName(profile.first_name);
          }

          const data = await getParentDashboardData();
          if (isActive) {
            setDashboard(data);
            if (data.parentFirstName) {
              setParentName(data.parentFirstName);
            }
          }
        } catch (err: any) {
          if (isActive) Alert.alert('Error loading dashboard', err.message);
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

  const stats = useMemo(() => {
    const evaluatedSessions = filteredSessionsForStats.filter(
      (s) => s.status === 'validated' && s.rubricEvaluation
    );

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
    const avgSessionMinutes = withDuration.length
      ? Math.round(withDuration.reduce((sum, s) => sum + s.durationSeconds, 0) / withDuration.length / 60)
      : 0;
    return { overallPerformance, avgSessionMinutes, totalSessions: filteredSessionsForStats.length };
  }, [filteredSessionsForStats]);

  const radarData = useMemo(() => {
    const domains = dashboard?.masterDomains || [];
    return domains.map((domain) => {
      const relevant = filteredSessionsForStats.filter(
        (s) =>
          s.score != null &&
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

  const recentFeedback = useMemo(
    () =>
      filteredSessionsForStats
        .filter((s) => s.teacherFeedback && s.teacherFeedback.trim().length > 0)
        .reverse(),
    [filteredSessionsForStats]
  );

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
          totalSessions: stats.totalSessions,
          skillBreakdown: radarData,
        },
        getFilterLabel(globalFilter)
      );
    } catch (err: any) {
      Alert.alert(
        'Could not create PDF',
        `${err.message}\n\nMake sure the "expo-print" package is installed (npx expo install expo-print).`
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <ParentDashboardSkeleton />;
  }

  const student = dashboard?.student;

  if (!student) {
    return (
      <View className="flex-1 bg-[#F5F8FA] items-center justify-center px-8">
        <Feather name="user-x" size={40} color="#9CA3AF" />
        <Text className="font-quicksand-bold text-[#4B5563] text-lg mt-4 text-center">
          No child linked yet
        </Text>
        <Text className="font-quicksand-medium text-[#9CA3AF] text-sm mt-2 text-center">
          Go to your Profile tab and enter the learner code your child's teacher gave you.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F8FA]">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className={`bg-[#F5F8FA] ${isTablet ? 'px-12 py-6' : 'px-6 py-4'}`}>
          <View className="flex-col gap-4">
            {/* HEADER SECTION */}
            <Animated.View key={`header-${focusKey}`} entering={FadeInRight.delay(50).duration(300)}>
              <ParentHeader
                parentFirstName={parentName || dashboard?.parentFirstName || ''}
                parentLastName={dashboard?.parentLastName || ''}
                isTablet={isTablet}
                onProfilePress={() => router.push('/(parent-tabs)/profile' as any)}
                student={student}
                classInfo={dashboard?.classInfo}
                teacherName={dashboard?.teacherName}
                onChildPress={() => setLearnerInfoVisible(true)}
                onGoalsPress={() => setGoalsVisible(true)}
              />
            </Animated.View>

            {/* TOP CONTROL BAR: RANGE SELECTOR + DOWNLOAD REPORT */}
            <View className="flex-row items-center justify-between mt-2 mb-1 gap-2.5">
              {/* Range Filter Selector */}
              <Pressable
                onPress={() => setFilterModalVisible(true)}
                className="flex-1 flex-row items-center justify-center gap-1.5 bg-white border-[2px] border-[#BBE8FB] px-3 py-2 rounded-xl active:scale-95 transition-transform"
                style={{
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
                className="flex-1 flex-row items-center justify-center gap-1.5 bg-white border-[2px] border-[#BBE8FB] px-3 py-2 rounded-xl active:scale-95 transition-transform"
                style={{
                  shadowColor: '#BBE8FB',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color="#62A9E6" />
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

            {/* STAT CARDS */}
            <Animated.View key={`stats-${focusKey}`} entering={FadeInRight.delay(100).duration(300)}>
              <ParentStatsSection stats={stats} isTablet={isTablet} />
            </Animated.View>

            {/* DAILY PROGRESS TREND */}
            <Animated.View key={`trend-${focusKey}`} entering={FadeInRight.delay(150).duration(300)}>
              <ParentProgressTrend sessions={sessions} globalFilter={globalFilter} isTablet={isTablet} />
            </Animated.View>

            {/* ACTIVITY PERFORMANCE */}
            <Animated.View key={`activity-${focusKey}`} entering={FadeInRight.delay(200).duration(300)}>
              <ParentActivityPerformance sessions={sessions} globalFilter={globalFilter} isTablet={isTablet} />
            </Animated.View>

            {/* SKILL PERFORMANCE */}
            <Animated.View key={`skill-${focusKey}`} entering={FadeInRight.delay(250).duration(300)}>
              <ParentSkillPerformance
                sessions={sessions}
                masterDomains={dashboard?.masterDomains}
                globalFilter={globalFilter}
                isTablet={isTablet}
              />
            </Animated.View>

            {/* TEACHER FEEDBACK */}
            <Animated.View key={`feedback-${focusKey}`} entering={FadeInRight.delay(300).duration(300)}>
              <ParentTeacherFeedback
                feedbackList={recentFeedback}
                studentName={student?.name}
                teacherName={dashboard?.teacherName}
                isTablet={isTablet}
              />
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

      {/* LEARNER INFO MODAL */}
      <LearnerInfoModal
        visible={isLearnerInfoVisible}
        onClose={() => setLearnerInfoVisible(false)}
        isTablet={isTablet}
        student={student}
        classInfo={dashboard?.classInfo}
        teacherName={dashboard?.teacherName}
      />

      {/* IEP GOALS MODAL */}
      <IepGoalsModal
        visible={isGoalsVisible}
        onClose={() => setGoalsVisible(false)}
        isTablet={isTablet}
        studentName={student?.name}
        milestones={dashboard?.milestones || []}
      />
    </View>
  );
}

