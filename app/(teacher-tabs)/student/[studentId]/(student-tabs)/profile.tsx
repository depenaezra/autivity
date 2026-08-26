import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useGlobalSearchParams, useRouter } from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';

// Student Profile Components
import { StudentProfileHeader } from '@/components/student/profile/student-profile-header';
import { StudentStatsSection } from '@/components/student/profile/student-stats-section';
import { StudentMenuSection } from '@/components/student/profile/student-menu-section';
import { StudentProfileActions } from '@/components/student/profile/student-profile-actions';

// Services
import { supabase } from '../../../../../src/lib/supabase';
import { StudentPreferences, updateStudentPreferences } from '../../../../../src/services/students';
import { setGlobalSfxEnabled } from '../../../../../src/utils/sound';

export default function StudentProfile() {
  const router = useRouter();
  const { studentId, studentName } = useGlobalSearchParams();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<StudentPreferences>({
    sfx_enabled: true,
    music_enabled: true,
    confetti_enabled: true,
  });
  const [isUpdatingPref, setIsUpdatingPref] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchProfileData = async () => {
        const safeId = Array.isArray(studentId) ? studentId[0] : studentId;

        if (!safeId) {
          if (isActive) setIsLoading(false);
          return;
        }

        try {
          const { data: student } = await supabase
            .from('students')
            .select('*')
            .eq('id', safeId)
            .single();

          if (!student) {
            if (isActive) setIsLoading(false);
            return;
          }

          const { count: sessionCount } = await supabase
            .from('student_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', safeId);

          const { data: classData } = await supabase
            .from('classes')
            .select('title, grade')
            .eq('id', student.class_id)
            .single();

          const { data: teacherData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', student.teacher_id)
            .single();

          let guardianName: string | null = null;
          if (student.parent_id) {
            const { data: parentData } = await supabase
              .from('profiles')
              .select('first_name, last_name, email')
              .eq('id', student.parent_id)
              .single();

            if (parentData) {
              guardianName =
                `${parentData.first_name || ''} ${parentData.last_name || ''}`.trim() ||
                parentData.email ||
                null;
            }
          }

          if (isActive) {
            setStudentData({
              ...student,
              sessionCount: sessionCount || 0,
              className: classData?.title || 'Unknown Class',
              grade: classData?.grade || 'Grade 1',
              teacherName: teacherData
                ? `${teacherData.first_name} ${teacherData.last_name}`
                : 'Unknown Teacher',
              guardianName,
              isParentLinked: !!student.parent_id,
            });

            if (student.preferences) {
              const sfx = student.preferences.sfx_enabled ?? true;
              setGlobalSfxEnabled(sfx);
              setPreferences({
                sfx_enabled: sfx,
                music_enabled: student.preferences.music_enabled ?? true,
                confetti_enabled: student.preferences.confetti_enabled ?? true,
              });
            }
          }
        } catch (error) {
          console.error('Error fetching student profile:', error);
        } finally {
          if (isActive) setIsLoading(false);
        }
      };

      fetchProfileData();

      return () => {
        isActive = false;
      };
    }, [studentId])
  );

  const handleTogglePreference = async (key: keyof StudentPreferences) => {
    const safeId = Array.isArray(studentId) ? studentId[0] : studentId;
    if (!safeId || isUpdatingPref) return;

    const nextVal = !preferences[key];
    const updated = { ...preferences, [key]: nextVal };

    if (key === 'sfx_enabled') {
      setGlobalSfxEnabled(nextVal);
    }

    setPreferences(updated);
    setIsUpdatingPref(true);

    try {
      await updateStudentPreferences(safeId, { [key]: nextVal });
    } catch (err) {
      console.error(`Failed to update preference ${key}:`, err);
      setPreferences(preferences);
    } finally {
      setIsUpdatingPref(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FBFBFB]" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: isTablet ? 60 : 40 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View className="px-6 pt-4">
          {/* HEADER CARD */}
          <StudentProfileHeader
            name={(studentData?.name || studentName || 'Loading...') as string}
            avatar={studentData?.avatar}
            learnerCode={studentData?.learner_code}
            avatarUrl={studentData?.avatar}
            isTablet={isTablet}
          />

          {/* STATS SECTION CARD */}
          <StudentStatsSection
            sessionCount={studentData?.sessionCount || 0}
            badgesCount={studentData?.badges || 0}
            isLoading={isLoading}
            isTablet={isTablet}
          />

          {/* MENU SECTIONS (ACCORDIONS) */}
          <StudentMenuSection
            isTablet={isTablet}
            classNameStr={studentData?.className || 'Loading...'}
            gradeStr={studentData?.grade || 'Grade 1'}
            teacherName={studentData?.teacherName || 'Loading...'}
            learnerCode={studentData?.learner_code || '—'}
            guardianName={studentData?.guardianName}
            isParentLinked={!!studentData?.isParentLinked}
            preferences={preferences}
            onTogglePreference={handleTogglePreference}
            spectrumLevel={studentData?.spectrum_level}
            bio={studentData?.bio}
          />

          {/* ACTIONS (SWITCH STUDENT BUTTON) */}
          <StudentProfileActions
            onSwitchStudent={() => router.back()}
            isTablet={isTablet}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}