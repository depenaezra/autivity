import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';

import { ActivitiesSection } from '@/components/student/activities-section';
import { RecentActivityCard } from '@/components/student/recent-activity-card';
import { StudentHeader } from '@/components/student/student-header';
import { DailyCheckInModal } from '@/components/student/daily-check-in-modal';

import { getLatestStudentSession } from '../../../../../src/services/sessions';
import {
  getStudentActivities,
  getStudentById,
} from '../../../../../src/services/students';
import { getClassById } from '../../../../../src/services/classes';
import {
  getTodayCheckIn,
  saveDailyCheckIn,
} from '../../../../../src/services/check-ins';
import { playCorrectSound } from '../../../../../src/utils/sound';

type ActivityType =
  | 'tracing'
  | 'matching'
  | 'bubble'
  | 'pick-n-choose'
  | 'sequencing'
  | 'turn-taking';

export default function StudentHome() {
  const router = useRouter();

  const {
    studentId,
    studentName: initialStudentName,
    classId: initialClassId,
    teacherId: initialTeacherId,
    themeName: routeThemeName,
  } = useLocalSearchParams();

  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const [assignedPaths, setAssignedPaths] = useState<string[]>([]);
  const [latestSession, setLatestSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [classId, setClassId] = useState<string | null>(
    (initialClassId as string) || null
  );
  const [teacherId, setTeacherId] = useState<string | null>(
    (initialTeacherId as string) || null
  );
  const [studentName, setStudentName] = useState<string>(
    (initialStudentName as string) || ''
  );
  const [avatar, setAvatar] = useState('');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);
  const [todayEmotion, setTodayEmotion] = useState<string | null>(null);

  useEffect(() => {
    const loadActivities = async () => {
      if (!studentId) return;

      setIsLoading(true);

      try {
        const safeStudentId = Array.isArray(studentId)
          ? studentId[0]
          : studentId;

        const checkIn = await getTodayCheckIn(safeStudentId);

        if (checkIn) {
          setTodayEmotion(checkIn.emotion);
        } else {
          setShowCheckInModal(true);
        }

        const paths = await getStudentActivities(safeStudentId);
        setAssignedPaths(paths);

        const session = await getLatestStudentSession(safeStudentId);
        setLatestSession(session);

        let currentClassId = (initialClassId as string) || classId;
        let currentTeacherId = (initialTeacherId as string) || teacherId;
        let currentName =
          (initialStudentName as string) || studentName;

        const student = await getStudentById(safeStudentId);

        if (student) {
          currentClassId = student.class_id;
          currentTeacherId = student.teacher_id;
          currentName = student.name;
          setAvatar(student.avatar || '');

          if (student.class_id) {
            await getClassById(student.class_id);
          }
        }

        setClassId(currentClassId);
        setTeacherId(currentTeacherId);
        setStudentName(currentName);
      } catch (error) {
        console.error('Error loading student data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [
    studentId,
    initialClassId,
    initialTeacherId,
    initialStudentName,
  ]);

  const handleConfirmCheckIn = async (selectedEmotion: string) => {
    const safeStudentId = Array.isArray(studentId)
      ? studentId[0]
      : studentId;

    if (!safeStudentId || isSubmittingCheckIn) return;

    setIsSubmittingCheckIn(true);

    try {
      await saveDailyCheckIn(safeStudentId, selectedEmotion);
      playCorrectSound();
      setTodayEmotion(selectedEmotion);
    } catch (error) {
      console.error('Error saving check-in:', error);
    } finally {
      setIsSubmittingCheckIn(false);
    }
  };

  const isTracingPath = (path: string) => {
    const cleanPath = path
      .toLowerCase()
      .replace('activity/tracing/', '');

    return (
      ['lines', 'shapes', 'letters', 'numbers'].includes(cleanPath) ||
      cleanPath.startsWith('lines/') ||
      cleanPath.startsWith('shapes/') ||
      cleanPath.startsWith('letters/') ||
      cleanPath.startsWith('numbers/')
    );
  };

  const isMatchingPath = (path: string) => {
    const lower = path.toLowerCase();

    return (
      lower === 'matching fruits' ||
      lower === 'matching colors' ||
      lower.includes('drag-drop') ||
      lower.includes('matching') ||
      lower.includes('drag')
    );
  };

  const isBubblePath = (path: string) => {
    const lower = path.toLowerCase();

    return (
      lower === 'free pop' ||
      lower === 'color pop' ||
      lower.includes('bubble') ||
      lower.includes('pop')
    );
  };

  const isPickChoicePath = (path: string) => {
    const lower = path.toLowerCase();

    return (
      lower.includes('pick') ||
      lower.includes('choice') ||
      lower.includes('identification') ||
      lower.includes('picture-word')
    );
  };

  const isSequencingPath = (path: string) => {
    const lower = path.toLowerCase();

    return (
      lower.includes('sequenc') ||
      lower.includes('picture sequencing')
    );
  };

  const isTurnTakingPath = (path: string) => {
    const normalizedPath = path
      .toLowerCase()
      .replace(/[\s_-]/g, '');

    return normalizedPath === 'turntaking';
  };

  const navigateToLesson = (activityType: ActivityType) => {
    const targetStudentId = Array.isArray(studentId)
      ? studentId[0]
      : studentId || '1';

    const filteredPaths = assignedPaths.filter((path) => {
      if (activityType === 'tracing') return isTracingPath(path);
      if (activityType === 'matching') return isMatchingPath(path);
      if (activityType === 'bubble') return isBubblePath(path);
      if (activityType === 'pick-n-choose') {
        return isPickChoicePath(path);
      }
      if (activityType === 'sequencing') {
        return isSequencingPath(path);
      }

      return isTurnTakingPath(path);
    });

    router.push({
      pathname: `/student/${targetStudentId}/lesson` as any,
      params: {
        studentId: targetStudentId,
        studentName,
        assignedActivities: JSON.stringify(filteredPaths),
        activityType,
        classId: classId || '',
        teacherId: teacherId || '',
      },
    });
  };

  return (
    <View className="flex-1 bg-[#FBFBFB]">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: isTablet ? 100 : 60,
        }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <StudentHeader
          name={studentName || 'Student'}
          avatar={avatar}
          todayEmotion={todayEmotion}
          onBackPress={() => router.back()}
          isTablet={isTablet}
        />

        <View className="px-6">
          <RecentActivityCard
            latestSession={latestSession}
            isLoading={isLoading}
          />
        </View>

        <ActivitiesSection
          assignedPaths={assignedPaths}
          isLoading={isLoading}
          isTablet={isTablet}
          onNavigateToLesson={navigateToLesson}
        />
      </ScrollView>

      <DailyCheckInModal
        visible={showCheckInModal}
        studentName={studentName}
        onConfirm={handleConfirmCheckIn}
        onBackPress={() => router.back()}
        onClose={() => setShowCheckInModal(false)}
        isSubmitting={isSubmittingCheckIn}
      />
    </View>
  );
}