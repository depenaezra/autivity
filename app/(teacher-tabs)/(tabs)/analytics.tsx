import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderButton } from '../../../components/header-button';
import { ParentFilterModal } from '../../../components/parent/parent-filter-modal';
import AnalyticsCards from '../../../components/teacher/analytics/analytics-cards';
import RecentActivitySection from '../../../components/teacher/analytics/recent-activity-section';
import StudentPerformanceSection from '../../../components/teacher/analytics/student-performance-section';
import { getClassPerformance, getKpiData, getRecentActivity } from '../../../src/services/analytics';
import { exportTeacherAnalyticsReportPdf } from '../../../src/services/exportReport';
import { getUserProfile } from '../../../src/services/profile';
import { FilterPeriod, getFilterLabel } from '../../../src/utils/dashboardFilters';

export default function AnalyticsDraftScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const [focusKey, setFocusKey] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [globalFilter, setGlobalFilter] = useState<FilterPeriod>('overall');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setFocusKey((prev) => prev + 1);
    }, [])
  );

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const [profile, kpi, classes, recentActivity] = await Promise.all([
        getUserProfile().catch(() => null),
        getKpiData('all').catch(() => ({ pendingEvaluations: 0, totalStudents: 0, totalClasses: 0, completedSessions: 0 })),
        getClassPerformance(true, 'all').catch(() => []),
        getRecentActivity(globalFilter, 'all').catch(() => []),
      ]);

      const teacherName = profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Teacher';
      await exportTeacherAnalyticsReportPdf(
        teacherName,
        kpi,
        classes,
        recentActivity,
        getFilterLabel(globalFilter),
        'all'
      );
    } catch (err: any) {
      Alert.alert('Could not export report', err.message || 'Error creating PDF report.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: isTablet ? 24 : 16 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View
          key={`header-${focusKey}`}
          entering={FadeInRight.delay(50).duration(300)}
          className={`w-full ${isTablet ? 'px-12 pt-4' : 'px-6 pt-2'}`}
        >
          <View className="flex-row items-center justify-between mb-4 flex-wrap gap-2.5">
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[44px]' : 'text-[28px]'}`}>
              Analytics
            </Text>

            {/* CONTROL BUTTONS: TIMEFRAME FILTER & DOWNLOAD REPORT */}
            <View className="flex-row items-center gap-2.5 flex-wrap">
              {/* Timeframe Filter Selector */}
              <Pressable
                onPress={() => setFilterModalVisible(true)}
                className="flex-row items-center justify-center gap-2 bg-white border-[2px] border-[#BBE8FB] px-4 h-[44px] rounded-xl active:scale-95 transition-transform"
                style={{
                  borderColor: '#BBE8FB',
                  shadowColor: '#BBE8FB',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                <Feather name="calendar" size={15} color="#62A9E6" />
                <Text className="font-fredoka-one text-[#62A9E6] text-xs sm:text-sm uppercase" numberOfLines={1}>
                  {getFilterLabel(globalFilter).toUpperCase()}
                </Text>
                <Feather name="chevron-down" size={15} color="#62A9E6" />
              </Pressable>

              {/* Master Download Report Button (Using standard HeaderButton) */}
              <HeaderButton
                onPress={handleExportPdf}
                disabled={isExporting}
                icon={
                  isExporting ? (
                    <ActivityIndicator size="small" color="#62A9E6" />
                  ) : (
                    <Feather name="download" size={isTablet ? 24 : 20} color="#62A9E6" />
                  )
                }
              />
            </View>
          </View>
        </Animated.View>

        {/* ANALYTICS CARDS */}
        <Animated.View key={`cards-${focusKey}`} entering={FadeInRight.delay(100).duration(300)}>
          <AnalyticsCards refreshTrigger={refreshKey} activityType="all" />
        </Animated.View>

        {/* STUDENT PERFORMANCE / ANALYTICS SECTION */}
        <Animated.View key={`perf-${focusKey}`} entering={FadeInRight.delay(150).duration(300)}>
          <StudentPerformanceSection />
        </Animated.View>

        {/* RECENT ACTIVITY SECTION */}
        <Animated.View key={`activity-${focusKey}`} entering={FadeInRight.delay(200).duration(300)}>
          <RecentActivitySection
            activityType="all"
            onEvaluationValidated={() => setRefreshKey((prev) => prev + 1)}
          />
        </Animated.View>
      </ScrollView>

      {/* RANGE FILTER MODAL */}
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


