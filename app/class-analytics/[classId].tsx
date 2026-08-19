import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import ClassView from '../../components/analytics/class/class-view';

export default function ClassAnalyticsScreen() {
  const params = useLocalSearchParams();
  const classId = Array.isArray(params.classId) ? params.classId[0] : params.classId || '';
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <ClassView
          classId={classId}
          onBack={() => router.back()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
