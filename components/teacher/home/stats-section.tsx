import React from 'react';
import { View } from 'react-native';
import { StatsCard } from './stats-card';

interface StatsSectionProps {
  stats: { students: number; classes: number; lessons: number };
  isTablet: boolean;
  router: any;
}

export function StatsSection({ stats, isTablet, router }: StatsSectionProps) {
  return (
    <View className={`w-full flex-row justify-between ${isTablet ? 'px-12 mt-10 gap-6' : 'px-6 mt-6 gap-3'}`}>
      <StatsCard
        type="students"
        count={stats.students}
        isTablet={isTablet}
      />
      <StatsCard
        type="classes"
        count={stats.classes}
        isTablet={isTablet}
      />
      <StatsCard
        type="lessons"
        count={stats.lessons}
        isTablet={isTablet}
        onPress={() => router.push('/lesson-materials' as any)}
      />
    </View>
  );
}


