import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnalyticsCards from '../../../components/teacher/analytics/analytics-cards';
import ClassPerformanceSection from '../../../components/teacher/analytics/class-performance-section';
import RecentActivitySection from '../../../components/teacher/analytics/recent-activity-section';

export default function AnalyticsDraftScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [focusKey, setFocusKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setFocusKey((prev) => prev + 1);
    }, [])
  );

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
          <View className="mb-2">
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[44px]' : 'text-[32px]'}`}>
              Analytics
            </Text>
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
    </SafeAreaView>
  );
}


