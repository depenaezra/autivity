import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import StudentView from '../../components/analytics/student/student-view';

export default function StudentViewScreen() {
  const params = useLocalSearchParams();
  const studentId = Array.isArray(params.studentId) ? params.studentId[0] : params.studentId || '';
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]" edges={['top', 'left', 'right']}>
      <StudentView
        studentId={studentId}
        onBack={() => router.back()}
      />
    </SafeAreaView>
  );
}
