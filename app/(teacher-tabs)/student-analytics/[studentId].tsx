import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import StudentView from '../../../components/teacher/analytics/student-analytics/student-view';

export default function StudentAnalyticsScreen() {
  const params = useLocalSearchParams();
  const studentId = Array.isArray(params.studentId) ? params.studentId[0] : params.studentId || '';
  const router = useRouter();

  return (
    <StudentView
      studentId={studentId}
      onBack={() => router.back()}
    />
  );
}
