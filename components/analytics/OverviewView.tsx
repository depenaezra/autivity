import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ClassInfo } from '../../app/(tabs)/analytics';

interface OverviewViewProps {
  classesData: ClassInfo[];
  totalPendingAllClasses: number;
  isTablet: boolean;
  onSelectClass: (classId: string) => void;
}

export default function OverviewView({
  classesData,
  totalPendingAllClasses,
  isTablet,
  onSelectClass,
}: OverviewViewProps) {
  return (
    <View className="w-full">
      {/* stats */}
      <View className={`flex-row justify-between ${isTablet ? 'px-12 mt-6 gap-4' : 'px-6 mt-4 gap-2'}`}>
        <View className="flex-1 border-[2px] border-[#A3CFF1] bg-white rounded-2xl overflow-hidden shadow-sm">
          <View className={`bg-[#EBF5FF] flex-row items-center justify-center border-b-[2px] border-b-[#A3CFF1] ${isTablet ? 'py-5 gap-3' : 'py-3 gap-2'}`}>
            <Ionicons name="stats-chart" size={isTablet ? 36 : 20} color="#62A9E6" />
            <Text className={`font-quicksand-bold text-[#62A9E6] ${isTablet ? 'text-4xl' : 'text-xl'}`}>
              {classesData.length > 0
                ? Math.round(classesData.reduce((sum, c) => sum + c.avgProgress, 0) / classesData.length)
                : 0}%
            </Text>
          </View>
          <View className="bg-white items-center justify-center py-2">
            <Text className={`text-[#4B5563] font-quicksand-semibold tracking-wider ${isTablet ? 'text-sm' : 'text-[10px]'}`}>
              OVERALL AVG. PROGRESS
            </Text>
          </View>
        </View>

        <View className="flex-1 border-[2px] border-[#FDBA74] bg-white rounded-2xl overflow-hidden shadow-sm">
          <View className={`bg-[#FFF7ED] flex-row items-center justify-center border-b-[2px] border-b-[#FDBA74] ${isTablet ? 'py-5 gap-3' : 'py-3 gap-2'}`}>
            <Ionicons name="time-outline" size={isTablet ? 36 : 20} color="#EA580C" />
            <Text className={`font-quicksand-bold text-[#EA580C] ${isTablet ? 'text-4xl' : 'text-xl'}`}>
              {totalPendingAllClasses}
            </Text>
          </View>
          <View className="bg-white items-center justify-center py-2">
            <Text className={`text-[#4B5563] font-quicksand-semibold tracking-wider ${isTablet ? 'text-sm' : 'text-[10px]'}`}>
              PENDING VALIDATIONS
            </Text>
          </View>
        </View>
      </View>

      {/* class performance cards */}
      <View className={isTablet ? 'px-12 mt-8' : 'px-6 mt-6'}>
        <View className="flex-row items-center justify-between mb-4">
          <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-3xl' : 'text-lg'}`}>
            Class Performance Overview
          </Text>
          <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-base' : 'text-xs'}`}>
            Tap class to inspect learners
          </Text>
        </View>

        {classesData.length === 0 ? (
          <View className="bg-white p-6 rounded-xl border border-[#E5E7EB] items-center justify-center">
            <Text className="font-quicksand-medium text-sm text-[#9CA3AF]">
              No classes created yet.
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {classesData.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                activeOpacity={0.9}
                onPress={() => onSelectClass(cls.id)}
                className="bg-white rounded-2xl border-[2px] overflow-hidden shadow-sm"
                style={{ borderColor: cls.themeColor }}
              >
                {/* class title */}
                <View
                  className="flex-row items-center justify-between px-5 py-4 border-b border-[#F3F4F6]"
                  style={{ backgroundColor: cls.lightBg }}
                >
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-3xl' : 'text-lg'}`}>
                        {cls.name}
                      </Text>
                      {cls.pendingFeedback > 0 && (
                        <View className="bg-[#F87171] px-2 py-0.5 rounded-full flex-row items-center gap-1">
                          <Feather name="alert-circle" size={isTablet ? 12 : 10} color="white" />
                          <Text className={`font-quicksand-bold text-white ${isTablet ? 'text-xs' : 'text-[10px]'}`}>
                            {cls.pendingFeedback} Pending
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className={`font-quicksand-medium text-[#6B7280] mt-0.5 ${isTablet ? 'text-base' : 'text-xs'}`}>
                      {cls.level}
                    </Text>
                  </View>

                  <View className="flex-row items-center bg-white px-3 py-1.5 rounded-full border border-[#E5E7EB]">
                    <Text className={`font-quicksand-bold text-[#62A9E6] mr-1 ${isTablet ? 'text-base' : 'text-xs'}`}>
                      Inspect
                    </Text>
                    <Feather name="chevron-right" size={isTablet ? 16 : 14} color="#62A9E6" />
                  </View>
                </View>

                {/* card stats */}
                <View className="p-5">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className={`font-quicksand-medium text-[#6B7280] ${isTablet ? 'text-lg' : 'text-sm'}`}>
                      Learners: <Text className="font-quicksand-bold text-[#4B5563]">{cls.totalStudents}</Text> • Completed Sessions: <Text className="font-quicksand-bold text-[#4B5563]">{cls.completedActivities}</Text>
                    </Text>
                    <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-lg' : 'text-sm'}`}>
                      {cls.avgProgress}% Avg
                    </Text>
                  </View>

                  {/* progress bar */}
                  <View className="w-full h-3 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${cls.avgProgress}%`, backgroundColor: cls.shadowColor }}
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
