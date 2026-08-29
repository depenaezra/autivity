import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnalyticsCards from '../../../components/teacher/analytics/analytics-cards';
import ClassPerformanceSection from '../../../components/teacher/analytics/class-performance-section';
import RecentActivitySection from '../../../components/teacher/analytics/recent-activity-section';
import { ParentFilterModal } from '../../../components/parent/parent-filter-modal';
import { FilterPeriod, getFilterLabel } from '../../../src/utils/dashboardFilters';
import { exportTeacherAnalyticsReportPdf } from '../../../src/services/exportReport';
import { getClassPerformance, getKpiData, getRecentActivity } from '../../../src/services/analytics';
import { getUserProfile } from '../../../src/services/profile';

export default function AnalyticsDraftScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [focusKey, setFocusKey] = useState(0);
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
        getKpiData().catch(() => ({ pendingEvaluations: 0, totalStudents: 0, totalClasses: 0, completedSessions: 0 })),
        getClassPerformance(true).catch(() => []),
        getRecentActivity(globalFilter === 'today' ? 'today' : globalFilter === 'week' ? 'week' : 'month').catch(() => []),
      ]);

      const teacherName = profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Teacher';
      await exportTeacherAnalyticsReportPdf(
        teacherName,
        kpi,
        classes,
        recentActivity,
        getFilterLabel(globalFilter)
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
          <View className="flex-row flex-wrap items-center justify-between gap-3 mb-4">
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[44px]' : 'text-[28px]'}`}>
              Analytics
            </Text>

            {/* CONTROL BUTTONS: RANGE FILTER & DOWNLOAD REPORT */}
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
                  <>
                    <ActivityIndicator size="small" color="#62A9E6" style={{ height: 16 }} />
                    <Text className="font-fredoka-one text-[#62A9E6] text-[11px] uppercase" numberOfLines={1}>
                      EXPORTING...
                    </Text>
                  </>
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

        {/* ANALYTICS CARDS */}
        <Animated.View key={`cards-${focusKey}`} entering={FadeInRight.delay(100).duration(300)}>
          <AnalyticsCards />
        </Animated.View>

        {/* CLASS PERFORMANCE SECTION */}
        <Animated.View key={`perf-${focusKey}`} entering={FadeInRight.delay(150).duration(300)}>
          <ClassPerformanceSection />
        </Animated.View>

        {/* RECENT ACTIVITY SECTION */}
        <Animated.View key={`activity-${focusKey}`} entering={FadeInRight.delay(200).duration(300)}>
          <RecentActivitySection />
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


