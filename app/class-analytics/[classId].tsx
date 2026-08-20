import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ClassAnalyticsView from '../../components/teacher/analytics/class-analytics/class-analytics-view';

export default function ClassAnalyticsScreen() {
  const params = useLocalSearchParams();
  const classId = Array.isArray(params.classId) ? params.classId[0] : params.classId || '';
  const router = useRouter();

  return (
    <ClassAnalyticsView
      classId={classId}
      onBack={() => router.back()}
    />
  );
}
