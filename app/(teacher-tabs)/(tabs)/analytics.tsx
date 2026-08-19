import React from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnalyticsCards from '../../../components/teacher/analytics/analytics-cards';
import ClassPerformanceSection from '../../../components/teacher/analytics/class-performance-section';
import RecentActivitySection from '../../../components/teacher/analytics/recent-activity-section';

export default function AnalyticsDraftScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: isTablet ? 24 : 16 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View className={`w-full ${isTablet ? 'px-12 pt-6' : 'px-6 pt-5'}`}>
          <View className="mb-6">
            <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
              Analytics
            </Text>
            <Text className={`font-quicksand-medium text-[#9CA3AF] mt-1 ${isTablet ? 'text-lg' : 'text-sm'}`}>
              Track student progress and class activity at a glance
            </Text>
          </View>
        </View>

        {/* Render the redesigned analytics-cards component */}
        <AnalyticsCards />

        {/* Render the redesigned class performance section */}
        <ClassPerformanceSection />

        {/* Render the redesigned recent activity section */}
        <RecentActivitySection />
      </ScrollView>
    </SafeAreaView>
  );
}
