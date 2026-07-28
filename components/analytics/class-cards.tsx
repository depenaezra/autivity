import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { getDraftClassPerformance, ClassPerformanceData } from '../../src/services/analytics-draft';

const THEME_MAP: Record<string, { themeColor: string; shadowColor: string; lightBg: string; textColor: string }> = {
  green: { themeColor: '#86EFAC', shadowColor: '#4ADE80', lightBg: '#F0FDF4', textColor: '#16A34A' },
  orange: { themeColor: '#FDBA74', shadowColor: '#FB923C', lightBg: '#FFF7ED', textColor: '#EA580C' },
  yellow: { themeColor: '#FDE047', shadowColor: '#FACC15', lightBg: '#FEF9C3', textColor: '#CA8A04' },
  blue: { themeColor: '#93C5FD', shadowColor: '#60A5FA', lightBg: '#EFF6FF', textColor: '#2563EB' },
};

export default function ClassCards({
  showArchived,
  onSelectClass,
}: {
  showArchived: boolean;
  onSelectClass?: (cls: ClassPerformanceData) => void;
}) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [classes, setClasses] = useState<ClassPerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClassPerformance();
  }, [showArchived]);

  const fetchClassPerformance = async () => {
    setIsLoading(true);
    try {
      const data = await getDraftClassPerformance(showArchived);
      setClasses(data);
    } catch (err) {
      console.error('ClassCards: failed to fetch class performance', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className={`w-full justify-center items-center py-10`}>
        <ActivityIndicator size="large" color="#62A9E6" />
        <Text className="mt-3 font-quicksand-semibold text-sm text-[#9CA3AF]">
          Loading class performance...
        </Text>
      </View>
    );
  }

  if (classes.length === 0) {
    return (
      <View className={`bg-white border-2 border-dashed border-[#E5E7EB] rounded-2xl p-8 items-center justify-center ${isTablet ? 'mx-12 mt-6' : 'mx-6 mt-4'}`}>
        <Ionicons name="school-outline" size={isTablet ? 48 : 36} color="#9CA3AF" />
        <Text className="font-fredoka-one text-lg text-[#4B5563] mt-3 text-center">
          {showArchived ? "No Classes Found" : "No Active Classes"}
        </Text>
        <Text className="font-quicksand-medium text-sm text-[#9CA3AF] mt-1 text-center">
          {showArchived
            ? "Add a class to start tracking performance data."
            : "Try toggling \"Show Archived\" to view archived classes."}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-col">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isTablet ? 48 : 24,
          gap: 16,
          paddingBottom: 10,
          paddingTop: 4,
        }}
        bounces={true}
      >
        {classes.map((cls) => {
            const themeKey = (cls.theme || 'green').toLowerCase();
            const colors = cls.isArchived
              ? { themeColor: '#D1D5DB', shadowColor: '#9CA3AF', lightBg: '#F3F4F6', textColor: '#6B7280' }
              : (THEME_MAP[themeKey] || THEME_MAP.green);

            return (
              <Pressable
                key={cls.id}
                onPress={() => onSelectClass?.(cls)}
                className="bg-white rounded-2xl border-[3px] overflow-hidden shadow-sm flex-col active:opacity-95"
                style={{
                  borderColor: colors.themeColor,
                  width: isTablet ? 360 : 280,
                  borderBottomWidth: 6,
                }}
              >
                {/* Header section with theme colors */}
                <View
                  className="flex-row items-center justify-between px-5 py-4 border-b border-[#F3F4F6]"
                  style={{ backgroundColor: colors.lightBg }}
                >
                  <View className="flex-1">
                    <View className="flex-row items-center flex-wrap gap-2">
                      <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-2xl' : 'text-lg'}`}>
                        {cls.title}
                      </Text>
                      {cls.isArchived && (
                        <View className="bg-[#E5E7EB] px-2 py-0.5 rounded-full border border-[#D1D5DB]">
                          <Text className="font-quicksand-bold text-[9px] text-[#6B7280]">
                            Archived
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className={`font-quicksand-bold text-xs mt-0.5`} style={{ color: colors.textColor }}>
                      {cls.grade}
                    </Text>
                  </View>
                  <View className="bg-white rounded-full p-2 border border-[#E5E7EB]">
                    <Ionicons name="school" size={20} color={colors.textColor} />
                  </View>
                </View>

                {/* Details section */}
                <View className="p-5 flex-1">
                  <View className="gap-3">
                    {/* Students Count */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <Feather name="users" size={16} color="#6B7280" />
                        <Text className="font-quicksand-bold text-[#4B5563] text-sm">Students</Text>
                      </View>
                      <Text className="font-fredoka-one text-[#4B5563] text-base">{cls.studentsCount}</Text>
                    </View>

                    {/* Completed Sessions */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <Feather name="check-circle" size={16} color="#6B7280" />
                        <Text className="font-quicksand-bold text-[#4B5563] text-sm">Completed Sessions</Text>
                      </View>
                      <Text className="font-fredoka-one text-[#4B5563] text-base">{cls.completedSessions}</Text>
                    </View>

                    {/* Pending Evaluations */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <Feather name="clock" size={16} color="#6B7280" />
                        <Text className="font-quicksand-bold text-[#4B5563] text-sm">Pending Evaluations</Text>
                      </View>
                      <View className="flex-row items-center gap-1.5">
                        {cls.pendingEvaluations > 0 && (
                          <View className="bg-[#EF4444] w-2.5 h-2.5 rounded-full" />
                        )}
                        <Text className="font-fredoka-one text-[#4B5563] text-base">{cls.pendingEvaluations}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* View Analytics Button */}
                <View className="px-5 pb-5 pt-1">
                  <View
                    className={`w-full py-3.5 rounded-xl flex-row justify-center items-center gap-2 border-b-[3px]`}
                    style={{
                      backgroundColor: colors.textColor,
                      borderBottomColor: colors.shadowColor,
                    }}
                  >
                    <Text className="font-quicksand-bold text-white text-base">
                      View Analytics
                    </Text>
                    <Feather name="chevron-right" size={18} color="white" />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
    </View>
  );
}
