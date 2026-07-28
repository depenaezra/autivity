import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OverallCards from '../../components/analytics/overall-cards';
import ClassCards from '../../components/analytics/class-cards';
import RecentActivity from '../../components/analytics/recent-activity';
import ClassView from '../../components/analytics/class/class-view';
import { ClassPerformanceData } from '../../src/services/analytics-draft';

export default function AnalyticsDraftScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [showArchived, setShowArchived] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassPerformanceData | null>(null);

  if (selectedClass) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F8FA]">
        <ScrollView
          contentContainerStyle={{ paddingBottom: isTablet ? 50 : 30 }}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <ClassView
            classId={selectedClass.id}
            onBack={() => setSelectedClass(null)}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: isTablet ? 50 : 30 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View className={`w-full ${isTablet ? 'px-12 pt-6' : 'px-6 pt-5'}`}>
          <View className="mb-6">
            <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
              Analytics
            </Text>
            <Text className={`font-quicksand-medium text-[#9CA3AF] mt-1 ${isTablet ? 'text-lg' : 'text-sm'}`}>
              Draft Overview metrics and KPI dashboard
            </Text>
          </View>
        </View>

        {/* Render the overall-cards KPI component */}
        <OverallCards />

        {/* Class Performance Header with Show Archived Button */}
        <View className={`w-full flex-row flex-wrap items-end justify-between ${isTablet ? 'px-12 mt-10' : 'px-6 mt-8'}`}>
          <View className="flex-1 min-w-[200px]">
            <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-3xl' : 'text-xl'}`}>
              Class Performance
            </Text>
            <Text className={`font-quicksand-medium text-[#9CA3AF] mt-1 ${isTablet ? 'text-lg' : 'text-sm'}`}>
              Track and review metrics per class group
            </Text>
          </View>

          {/* Show Archived Toggle */}
          <Pressable
            onPress={() => setShowArchived(!showArchived)}
            className="flex-row items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E5E7EB] active:opacity-90 bg-white mt-3"
          >
            <Feather
              name={showArchived ? "check-square" : "square"}
              size={18}
              color={showArchived ? "#62A9E6" : "#4B5563"}
            />
            <Text className="font-quicksand-bold text-xs text-[#4B5563]">
              Show Archived
            </Text>
          </Pressable>
        </View>

        {/* Render the class-cards component */}
        <ClassCards showArchived={showArchived} onSelectClass={setSelectedClass} />

        {/* Recent Activity Header */}
        <View className={`w-full ${isTablet ? 'px-12 mt-10' : 'px-6 mt-8'}`}>
          <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-3xl' : 'text-xl'}`}>
            Recent Activity
          </Text>
          <Text className={`font-quicksand-medium text-[#9CA3AF] mt-1 ${isTablet ? 'text-lg' : 'text-sm'}`}>
            Log of session activities performed by students
          </Text>
        </View>

        {/* Render the recent-activity component */}
        <RecentActivity />
      </ScrollView>
    </SafeAreaView>
  );
}
