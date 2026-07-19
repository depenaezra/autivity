import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { ClassInfo, StudentInfo } from '../../app/(tabs)/analytics';

interface ClassViewProps {
  currentClass: ClassInfo | null | undefined;
  classStudents: StudentInfo[];
  timeRange: 'daily' | 'weekly' | 'monthly';
  setTimeRange: (range: 'daily' | 'weekly' | 'monthly') => void;
  isTablet: boolean;
  onBack: () => void;
  onSelectStudent: (studentId: string) => void;
}

export default function ClassView({
  currentClass,
  classStudents,
  timeRange,
  setTimeRange,
  isTablet,
  onBack,
  onSelectStudent,
}: ClassViewProps) {
  if (!currentClass) return null;

  return (
    <View className="w-full">
      {/* title + back btn */}
      <View className={isTablet ? 'px-12 mt-4' : 'px-6 mt-3'}>
        <TouchableOpacity
          onPress={onBack}
          className="flex-row items-center bg-[#EBF5FF] self-start px-4 py-2 rounded-full border border-[#A3CFF1] mb-4"
        >
          <Feather name="arrow-left" size={isTablet ? 18 : 16} color="#62A9E6" />
          <Text className={`font-quicksand-bold text-[#62A9E6] ml-1.5 ${isTablet ? 'text-base' : 'text-xs'}`}>
            Back to All Classes
          </Text>
        </TouchableOpacity>

        <View
          className="bg-white p-5 rounded-2xl border-[2px] shadow-sm mb-6"
          style={{ borderColor: currentClass.themeColor, backgroundColor: currentClass.lightBg }}
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-xl'}`}>
                {currentClass.name}
              </Text>
              <Text className={`font-quicksand-medium text-[#6B7280] mt-0.5 ${isTablet ? 'text-lg' : 'text-sm'}`}>
                {currentClass.level}
              </Text>
            </View>
            <View className="items-end">
              <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
                {currentClass.avgProgress}%
              </Text>
              <Text className={`font-quicksand-semibold text-[#9CA3AF] ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
                CLASS AVERAGE
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* time range filter */}
      <View className={`flex-row justify-between items-center ${isTablet ? 'px-12' : 'px-6'}`}>
        <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-2xl' : 'text-base'}`}>
          Progress Trends & Learners
        </Text>
        <View className="flex-row bg-[#E5E7EB] p-1 rounded-full">
          {(['daily', 'weekly', 'monthly'] as const).map((range) => (
            <Pressable
              key={range}
              onPress={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-full ${timeRange === range ? 'bg-[#62A9E6]' : 'bg-transparent'}`}
            >
              <Text
                className={`font-quicksand-semibold capitalize ${timeRange === range ? 'text-white' : 'text-[#6B7280]'} ${
                  isTablet ? 'text-base' : 'text-xs'
                }`}
              >
                {range}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* trends summary */}
      <View className={isTablet ? 'px-12 mt-3' : 'px-6 mt-3'}>
        <View className="bg-white p-4 rounded-xl border border-[#E5E7EB] flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-3 flex-1">
            <View className="w-10 h-10 rounded-full bg-[#ECFDF5] items-center justify-center">
              <Ionicons name="trending-up" size={isTablet ? 24 : 20} color="#10B981" />
            </View>
            <View className="flex-1 mr-2">
              <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-lg' : 'text-sm'}`}>
                {timeRange === 'daily'
                  ? '+0.0% Daily Growth'
                  : timeRange === 'weekly'
                  ? '+0.0% Weekly Growth'
                  : '+0.0% Monthly Gain'}
              </Text>
              <Text className={`font-quicksand-medium text-[#6B7280] ${isTablet ? 'text-base' : 'text-xs'}`}>
                Data will populate as students complete activities.
              </Text>
            </View>
          </View>
          <View className="bg-[#F3F4F6] px-3 py-1.5 rounded-lg">
            <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-base' : 'text-xs'}`}>
              {currentClass.completedActivities} Activities
            </Text>
          </View>
        </View>
      </View>

      {/* students list */}
      <View className={isTablet ? 'px-12' : 'px-6'}>
        <Text className={`font-quicksand-bold text-[#9CA3AF] tracking-wider uppercase mb-3 ${isTablet ? 'text-sm' : 'text-xs'}`}>
          Learners in {currentClass.name} (Tap a Learner)
        </Text>

        {classStudents.length === 0 ? (
          <View className="bg-white p-6 rounded-xl border border-[#E5E7EB] items-center justify-center">
            <Text className="font-quicksand-medium text-sm text-[#9CA3AF]">
              No students added to this class yet.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {classStudents.map((student) => (
              <TouchableOpacity
                key={student.id}
                activeOpacity={0.85}
                onPress={() => onSelectStudent(student.id)}
                className="bg-white border-[1.5px] border-[#E5E7EB] rounded-2xl p-4 shadow-sm flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center border border-[#E5E7EB]"
                    style={{ backgroundColor: student.avatarBg }}
                  >
                    <Feather name="user" size={isTablet ? 24 : 20} color="#62A9E6" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-xl' : 'text-base'}`}>
                        {student.name}
                      </Text>
                      {student.pendingCount > 0 && (
                        <View className="bg-[#EA580C] px-2 py-0.5 rounded-full flex-row items-center gap-1">
                          <Text className={`font-quicksand-bold text-white ${isTablet ? 'text-xs' : 'text-[10px]'}`}>
                            {student.pendingCount} to validate
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className={`font-quicksand-medium text-[#6B7280] mt-0.5 ${isTablet ? 'text-base' : 'text-xs'}`}>
                      Focus: {student.focusScore} • {student.behavior}
                    </Text>
                  </View>
                </View>

                {/* progress indicator */}
                <View className="items-end ml-3 w-28">
                  <Text className={`font-quicksand-bold text-[#4B5563] mb-1 ${isTablet ? 'text-base' : 'text-sm'}`}>
                    {student.overallProgress}% Overall
                  </Text>
                  <View className="w-full h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${student.overallProgress}%`, backgroundColor: student.statusColor }}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
