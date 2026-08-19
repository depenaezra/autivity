import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StudentsScreenLayout } from '../../../components/teacher/home/students-screen-layout';
import { getTeacherStudents } from '../../../src/services/students';
import { getTeacherClasses } from '../../../src/services/classes';

interface Student {
  id: string;
  name: string;
  avatar: string;
  class_id?: string;
  learner_code?: string;
  parent_id?: string | null;
}

interface ClassItem {
  id: string;
  title: string;
  grade: string;
}

export default function StudentListScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [studentList, classList] = await Promise.all([
          getTeacherStudents(),
          getTeacherClasses(),
        ]);
        setStudents(studentList);
        setClasses(classList.map((c: any) => ({ id: c.id, title: c.title, grade: c.grade || '' })));
      } catch (error) {
        console.error('Error fetching student list data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleStudentPress = (student: Student) => {
    router.push({
      pathname: '/student/[studentId]',
      params: {
        studentId: student.id,
        studentName: student.name,
        classId: student.class_id || '',
        themeName: 'blue', // default/fallback theme for students list navigation
      },
    });
  };

  const filteredStudents = selectedClassId
    ? students.filter((s) => s.class_id === selectedClassId)
    : students;

  const countText = selectedClassId === null
    ? `${students.length} students total`
    : `${filteredStudents.length} students`;

  return (
    <StudentsScreenLayout
      onBackPress={() => router.back()}
      classes={classes}
      selectedClassId={selectedClassId}
      onSelectClass={setSelectedClassId}
    >
      {isLoading ? (
        <View className="flex-1 items-center justify-center py-20 bg-white">
          <ActivityIndicator size="large" color="#62A9E6" />
        </View>
      ) : filteredStudents.length === 0 ? (
        <View className="flex-1 items-center justify-center py-20 bg-white px-6">
          <Text className="font-fredoka-one text-gray-400 text-lg text-center">
            {selectedClassId ? 'No students in this class.' : 'No students registered yet.'}
          </Text>
        </View>
      ) : (
        <View className={`bg-white ${isTablet ? 'px-12 py-6' : 'px-6 py-4'}`}>
          {/* Dynamic count badge */}
          <View 
            className="flex-row items-center bg-white border-[2px] border-[#BBE8FB] rounded-[6px] self-start px-2 py-0.5 gap-1"
            style={{ marginBottom: isTablet ? 16 : 12 }}
          >
            <Ionicons name="people" size={isTablet ? 16 : 12} color="#62A9E6" />
            <Text 
              className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-[14px]' : 'text-[11px]'}`}
            >
              {countText}
            </Text>
          </View>

          {filteredStudents.map((student, index) => {
            const studentClass = classes.find((c) => c.id === student.class_id);
            const classText = studentClass
              ? `${studentClass.grade} • ${studentClass.title}`
              : '';

            return (
              <View key={student.id}>
                <Pressable
                  onPress={() => handleStudentPress(student)}
                  className="flex-row items-center py-4 active:scale-95 transition-transform"
                >
                  {/* Outer circle with grey border */}
                  <View 
                    className="items-center justify-center border-[2px] border-[#D9D9D9]"
                    style={{ 
                      width: isTablet ? 96 : 64,
                      height: isTablet ? 96 : 64,
                      borderRadius: isTablet ? 48 : 32
                    }}
                  >
                    {/* Inner circle with thick white border */}
                    <View 
                      className="w-full h-full items-center justify-center bg-[#E5E7EB] border-white"
                      style={{
                        borderWidth: isTablet ? 3 : 2,
                        borderRadius: isTablet ? 45 : 30,
                      }}
                    >
                      <Text style={{ fontSize: isTablet ? 40 : 28 }}>
                        {student.avatar || '🙂'}
                      </Text>
                    </View>
                  </View>

                  {/* Content on the right */}
                  <View className="flex-1 ml-4 justify-center">
                    {/* Name and class/grade details */}
                    <View className="flex-row items-center flex-wrap gap-x-2">
                      <Text 
                        className="font-fredoka-one text-[#484A4B]" 
                        style={{ fontSize: isTablet ? 24 : 18 }}
                      >
                        {student.name || 'Student'}
                      </Text>
                      {classText ? (
                        <Text 
                          className="font-quicksand-medium text-[#9CA3AF]"
                          style={{ fontSize: isTablet ? 16 : 12 }}
                        >
                          {classText}
                        </Text>
                      ) : null}
                    </View>

                    {/* Badges Row */}
                    <View className="flex-row items-center gap-2 mt-1.5">
                      {/* Learner Code Badge */}
                      <View className="bg-[#BBE8FB] px-2.5 py-1 rounded-[6px] justify-center items-center">
                        <Text 
                          className="font-fredoka-one text-[#62A9E6] uppercase"
                          style={{ fontSize: isTablet ? 12 : 9 }}
                        >
                          # {student.learner_code || 'AUT-000'}
                        </Text>
                      </View>

                      {/* Parent Linked Badge */}
                      {student.parent_id ? (
                        <View className="bg-[#CBFAC4] px-2.5 py-1 rounded-[6px] flex-row items-center gap-1">
                          <Ionicons 
                            name="checkmark-circle" 
                            size={isTablet ? 14 : 11} 
                            color="#179D33" 
                          />
                          <Text 
                            className="font-fredoka-one text-[#179D33] uppercase"
                            style={{ fontSize: isTablet ? 12 : 9 }}
                          >
                            LINKED
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </Pressable>

                {/* Divider Line */}
                {index < filteredStudents.length - 1 && (
                  <View className="h-[1px] bg-[#E5E7EB] opacity-50" />
                )}
              </View>
            );
          })}
        </View>
      )}
    </StudentsScreenLayout>
  );
}
