import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Entypo, Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import {
  getStudentsPerformanceOverview,
  StudentPerformanceOverview,
} from '../../../src/services/student-analytics';
import { getTeacherClasses } from '../../../src/services/classes';
import StudentsIcon from '../../../assets/images/teacher/class/icon-students.svg';

interface ClassItem {
  id: string;
  title: string;
}

function StudentAvatarSkeleton({ isTablet }: { isTablet: boolean }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 750 }),
        withTiming(0.4, { duration: 750 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View className="items-center justify-center" style={animatedStyle}>
      <View
        className={`bg-[#E5E7EB] ${
          isTablet
            ? 'w-[110px] h-[110px] rounded-[55px]'
            : 'w-[70px] h-[70px] rounded-[35px]'
        }`}
      />
      <View
        className={`bg-[#E5E7EB] rounded-[4px] mt-2 ${
          isTablet ? 'w-20 h-5' : 'w-14 h-3.5'
        }`}
      />
      <View
        className={`bg-[#E5E7EB] rounded-[4px] mt-1 ${
          isTablet ? 'w-16 h-4' : 'w-12 h-3'
        }`}
      />
    </Animated.View>
  );
}

export function StudentPerformanceSection() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const router = useRouter();

  const [students, setStudents] = useState<StudentPerformanceOverview[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentsData, classesData] = await Promise.all([
        getStudentsPerformanceOverview().catch(() => []),
        getTeacherClasses().catch(() => []),
      ]);
      setStudents(studentsData || []);
      setClasses(classesData || []);
    } catch (err) {
      console.error('StudentPerformanceSection: failed to load data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents =
    selectedClassId === 'all'
      ? students
      : students.filter((s) => s.class_id === selectedClassId);

  const handleStudentPress = (student: StudentPerformanceOverview) => {
    router.push({
      pathname: '/(teacher-tabs)/student-analytics/[studentId]',
      params: { studentId: student.id },
    } as any);
  };

  const renderClassFilterPill = (id: string, label: string) => {
    const isActive = selectedClassId === id;
    return (
      <Pressable
        key={id}
        onPress={() => setSelectedClassId(id)}
        className={`border-[2px] rounded-[8px] justify-center items-center active:scale-95 transition-transform ${
          isTablet ? 'px-4 py-2' : 'px-3 py-1.5'
        }`}
        style={{
          backgroundColor: isActive ? '#BBE8FB' : '#FFFFFF',
          borderColor: isActive ? '#62A9E6' : '#F1F1F1',
          shadowColor: isActive ? '#62A9E6' : '#F1F1F1',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 2,
        }}
      >
        <Text
          className={`font-fredoka-one uppercase ${
            isActive ? 'text-[#62A9E6]' : 'text-[#9CA3AF]'
          } ${isTablet ? 'text-sm' : 'text-[11px]'}`}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className={`w-full ${isTablet ? 'mt-10 mb-2' : 'mt-6 mb-1'}`}>
      {/* Header Title Row */}
      <View
        className={`flex-row items-center justify-between ${
          isTablet ? 'px-12 mb-3' : 'px-6 mb-2'
        }`}
      >
        <View className="flex-row items-center gap-2">
          <StudentsIcon
            width={isTablet ? 36 : 26}
            height={isTablet ? 36 : 26}
          />
          <Text
            className={`font-fredoka-one text-[#484A4B] ${
              isTablet ? 'text-[32px]' : 'text-[22px]'
            }`}
          >
            Students
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/student-list' as any)}
          className="active:scale-95 transition-transform p-1"
        >
          <Entypo
            name="chevron-right"
            size={isTablet ? 36 : 28}
            color="#62A9E6"
          />
        </Pressable>
      </View>

      {/* Class Filter Pills (Option B: ALL, CLASS 1, CLASS 2) */}
      {classes.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: isTablet ? 48 : 24,
            paddingVertical: 6,
            gap: 8,
          }}
          className="mb-1"
        >
          {renderClassFilterPill('all', 'ALL STUDENTS')}
          {classes.map((cls) =>
            renderClassFilterPill(cls.id, cls.title)
          )}
        </ScrollView>
      )}

      {/* Horizontal ScrollView of Students */}
      {isLoading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: 12,
            paddingHorizontal: isTablet ? 48 : 24,
            gap: isTablet ? 24 : 16,
          }}
        >
          <StudentAvatarSkeleton isTablet={isTablet} />
          <StudentAvatarSkeleton isTablet={isTablet} />
          <StudentAvatarSkeleton isTablet={isTablet} />
          <StudentAvatarSkeleton isTablet={isTablet} />
        </ScrollView>
      ) : filteredStudents.length === 0 ? (
        <View
          className={`bg-white border-2 border-dashed border-[#E5E7EB] rounded-2xl p-6 items-center justify-center ${
            isTablet ? 'mx-12 mt-2' : 'mx-6 mt-2'
          }`}
        >
          <Ionicons
            name="people-outline"
            size={isTablet ? 40 : 28}
            color="#9CA3AF"
          />
          <Text className="font-fredoka-one text-base text-[#4B5563] mt-2 text-center">
            {selectedClassId === 'all'
              ? 'No students registered yet.'
              : 'No students found in this class.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: 12,
            paddingHorizontal: isTablet ? 48 : 24,
            gap: isTablet ? 24 : 16,
          }}
          className="mt-1"
        >
          {filteredStudents.map((student) => {
            const firstName = student.name
              ? student.name.split(' ')[0]
              : 'Student';
            return (
              <Pressable
                key={student.id}
                onPress={() => handleStudentPress(student)}
                className="items-center justify-start active:scale-95 transition-transform"
                style={{ width: isTablet ? 120 : 80 }}
              >
                {/* Outer circle with grey or warm alert border */}
                <View
                  className={`items-center justify-center border-[2px] ${
                    isTablet
                      ? 'w-[110px] h-[110px] rounded-[55px]'
                      : 'w-[70px] h-[70px] rounded-[35px]'
                  }`}
                  style={{
                    borderColor: student.needsHelp ? '#FF8870' : '#D9D9D9',
                  }}
                >
                  {/* Inner circle with thick white border */}
                  <View
                    className="w-full h-full items-center justify-center border-white"
                    style={{
                      borderWidth: isTablet ? 4 : 3,
                      borderRadius: isTablet ? 51 : 32,
                      backgroundColor: student.needsHelp ? '#FFF5F3' : '#E5E7EB',
                    }}
                  >
                    <Text style={{ fontSize: isTablet ? 48 : 28 }}>
                      {student.avatar || '🙂'}
                    </Text>
                  </View>
                </View>

                {/* First Name */}
                <Text
                  className={`font-fredoka-one text-[#484A4B] mt-2 text-center w-full ${
                    isTablet ? 'text-lg' : 'text-sm'
                  }`}
                  numberOfLines={1}
                >
                  {firstName}
                </Text>

                {/* NEEDS HELP PILL BADGE */}
                {student.needsHelp && (
                  <View
                    className="flex-row items-center justify-center bg-[#FFDBD4] border-[1.5px] border-[#FF8870] px-2 py-0.5 rounded-full mt-1.5"
                    style={{
                      shadowColor: '#FF8870',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.6,
                      shadowRadius: 0,
                      elevation: 1,
                    }}
                  >
                    <Text
                      className={`font-fredoka-one text-[#FF8870] text-center ${
                        isTablet ? 'text-[11px]' : 'text-[9px]'
                      } uppercase`}
                      numberOfLines={1}
                    >
                      NEEDS HELP
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

export default StudentPerformanceSection;
