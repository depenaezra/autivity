import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { ClassPerformanceData } from '../../../src/services/analytics-draft';
import { getClassPerformanceById } from '../../../src/services/class-analytics';
import StudentView from '../student/student-view';
import ClassDevelopmentalSkillsHeatmap from './class-developmental-skills-heatmap';
import ClassEvaluationTrend from './class-evaluation-trend';
import OverviewCards from './overview-cards';
import StudentList from './student-list';

interface ClassViewProps {
  classId: string;
  onBack: () => void;
}

export default function ClassView({ classId, onBack }: ClassViewProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [classData, setClassData] = useState<ClassPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingStudents, setViewingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      setIsLoading(true);
      try {
        const data = await getClassPerformanceById(classId);
        setClassData(data);
        setError(null);
      } catch (err: any) {
        console.error('ClassView: error loading class details', err);
        setError('Failed to load class analytics details.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetails();
  }, [classId]);

  if (selectedStudentId) {
    return (
      <StudentView
        studentId={selectedStudentId}
        onBack={() => setSelectedStudentId(null)}
      />
    );
  }

  if (viewingStudents) {
    return (
      <StudentList
        classId={classId}
        onBack={() => setViewingStudents(false)}
        onSelectStudent={setSelectedStudentId}
      />
    );
  }

  return (
    <View className={`w-full flex-col ${isTablet ? 'px-12 pt-6' : 'px-6 pt-5'}`}>
      {/* Back Button */}
      <View className="flex-row mb-4">
        <Pressable
          onPress={onBack}
          className="flex-row items-center gap-2 bg-white border border-[#E5E7EB] px-3.5 py-2 rounded-xl active:opacity-90"
        >
          <Feather name="arrow-left" size={18} color="#4B5563" />
          <Text className="font-quicksand-bold text-sm text-[#4B5563]">
            Back to Dashboard
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View key="class-view-loading" className="w-full justify-center items-center py-20 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
          <ActivityIndicator size="large" color="#62A9E6" />
          <Text className="mt-3 font-quicksand-semibold text-sm text-[#9CA3AF]">
            Loading class details...
          </Text>
        </View>
      ) : error || !classData ? (
        <View key="class-view-error" className="w-full justify-center items-center py-10 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm px-6">
          <Feather name="alert-circle" size={36} color="#EF4444" />
          <Text className="font-fredoka-one text-lg text-[#4B5563] mt-3 text-center">
            Error Loading Data
          </Text>
          <Text className="font-quicksand-medium text-sm text-[#9CA3AF] mt-1 text-center">
            {error || 'Class details not found.'}
          </Text>
        </View>
      ) : (
        <>
          {/* Header Info Container */}
          <View className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
            <View className="flex-row flex-wrap items-center justify-between gap-4">
              <View className="flex-1 min-w-[200px]">
                <View className="flex-row items-center flex-wrap gap-2.5">
                  <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
                    {classData.title}
                  </Text>

                  {classData.isArchived && (
                    <View className="bg-red-50 border border-red-200 px-3 py-1 rounded-full flex-row items-center gap-1.5">
                      <View className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <Text className="font-quicksand-bold text-xs text-red-600">
                        Archived
                      </Text>
                    </View>
                  )}
                </View>

                {/* Class Details Meta Info */}
                <View className="flex-row flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="school-outline" size={16} color="#62A9E6" />
                    <Text className="font-quicksand-bold text-[#4B5563] text-sm">
                      {classData.grade}
                    </Text>
                  </View>

                  <Text className="text-[#D1D5DB]">•</Text>

                  {classData.schedule ? (
                    <>
                      <View className="flex-row items-center gap-1.5">
                        <Feather name="calendar" size={16} color="#62A9E6" />
                        <Text className="font-quicksand-medium text-[#4B5563] text-sm">
                          {classData.schedule}
                        </Text>
                      </View>
                      <Text className="text-[#D1D5DB]">•</Text>
                    </>
                  ) : null}

                  <View className="flex-row items-center gap-2.5">
                    <View className="flex-row items-center gap-1.5">
                      <Feather name="users" size={16} color="#62A9E6" />
                      <Text className="font-quicksand-bold text-[#4B5563] text-sm">
                        {classData.studentsCount} {classData.studentsCount === 1 ? 'Student' : 'Students'}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setViewingStudents(true)}
                      className="bg-[#EFF6FF] border border-[#93C5FD] px-2 py-1 rounded-lg active:opacity-90 flex-row items-center gap-1"
                    >
                      <Feather name="eye" size={12} color="#2563EB" />
                      <Text className="font-quicksand-bold text-xs text-[#2563EB]">
                        View List
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Class Overview Cards */}
          <OverviewCards classId={classId} />

          {/* Class Evaluation Trend Chart */}
          <ClassEvaluationTrend classId={classId} />

          {/* Developmental Skills Exposure Heatmap */}
          <View className="mt-6 flex-col">
            <Text className="font-fredoka-one text-xl text-[#4B5563]">
              Developmental Skills Exposure
            </Text>
            <Text className="font-quicksand-medium text-sm text-[#9CA3AF] mt-1.5">
              Shows how frequently each developmental subskill has been practiced. This represents learning exposure, not mastery.
            </Text>
            <ClassDevelopmentalSkillsHeatmap classId={classId} />
          </View>
        </>
      )}
    </View>
  );
}
