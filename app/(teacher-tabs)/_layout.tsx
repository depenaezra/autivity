import { Stack } from 'expo-router';
import React from 'react';

export default function TeacherStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="lesson-materials" />
      <Stack.Screen name="class/[classId]" />
      <Stack.Screen name="class-analytics/[classId]" />
      <Stack.Screen name="student-analytics/[studentId]" />
      <Stack.Screen name="student-list/index" />
      <Stack.Screen name="student/[studentId]" />
    </Stack>
  );
}
