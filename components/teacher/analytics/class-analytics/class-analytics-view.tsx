import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

import { getClassPerformanceById } from '../../../../src/services/class-analytics';
import { getClassStudents } from '../../../../src/services/students';
import { ClassPerformanceData } from '../../../../src/services/analytics';
import { ScreenLayout } from '../../../screen-layout';
import { HeaderButton } from '../../../header-button';

import OverviewCards from './overview-cards';
import ClassEvaluationTrend from './class-evaluation-trend';
import ClassDevelopmentalDomainPractice from './class-developmental-domain-practice';
import { ClassAnalyticsHeaderSkeleton, ClassAnalyticsSkeleton } from './class-analytics-skeleton';

// SVGs for themed headers
import HeaderClassBlue from '../../../../assets/images/teacher/class/header-class-blue.svg';
import HeaderClassGreen from '../../../../assets/images/teacher/class/header-class-green.svg';
import HeaderClassOrange from '../../../../assets/images/teacher/class/header-class-orange.svg';
import HeaderClassYellow from '../../../../assets/images/teacher/class/header-class-yellow.svg';

const headerSvgs: Record<string, React.FC<any>> = {
  blue: HeaderClassBlue,
  green: HeaderClassGreen,
  orange: HeaderClassOrange,
  yellow: HeaderClassYellow,
};

interface ClassAnalyticsViewProps {
  classId: string;
  onBack: () => void;
}

export default function ClassAnalyticsView({ classId, onBack }: ClassAnalyticsViewProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const [classData, setClassData] = useState<ClassPerformanceData | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRosterExpanded, setIsRosterExpanded] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      setIsLoading(true);
      try {
        const [data, classStudents] = await Promise.all([
          getClassPerformanceById(classId),
          getClassStudents(classId),
        ]);
        setClassData(data);
        setStudents(classStudents || []);
        setError(null);
      } catch (err: any) {
        console.error('ClassAnalyticsView: error loading class details', err);
        setError('Failed to load class analytics details.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetails();
  }, [classId]);

  const themeKey = (classData?.theme || 'blue').toLowerCase();
  const HeaderBgSvg = headerSvgs[themeKey] || headerSvgs.blue;

  const renderHeaderBackground = () => {
    if (isLoading || !classData) {
      return (
        <View className="flex-1 w-full h-full bg-[#E5E7EB]/50" />
      );
    }

    return (
      <View className="flex-1 w-full h-full relative">
        <View className="absolute inset-0">
          <HeaderBgSvg width="100%" height="100%" preserveAspectRatio="xMidYMax slice" />
        </View>
      </View>
    );
  };

  const renderHeaderContent = () => {
    if (isLoading || !classData) {
      return <ClassAnalyticsHeaderSkeleton isTablet={isTablet} />;
    }

    if (!classData.isArchived) return null;

    return (
      <View className="flex-row items-center flex-wrap gap-2 pt-1">
        {/* Archived Badge */}
        <View className="bg-red-100 border border-red-300 px-2.5 py-1 rounded-[6px] flex-row items-center gap-1">
          <View className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <Text
            className="font-fredoka-one text-red-600 uppercase"
            style={{ fontSize: isTablet ? 12 : 10 }}
          >
            ARCHIVED
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenLayout
      headerBackground={renderHeaderBackground()}
      title={isLoading ? undefined : classData?.title}
      leftHeaderButton={
        <HeaderButton
          onPress={onBack}
          icon={
            <View style={{ marginLeft: -3, marginTop: -1 }}>
              <Ionicons name="caret-back" size={isTablet ? 30 : 24} color="#62A9E6" />
            </View>
          }
        />
      }
      headerContent={renderHeaderContent()}
      scrollable={true}
      stickyHeader={true}
    >
      <View className={`bg-white ${isTablet ? 'px-12 py-6' : 'px-6 py-4'}`}>
        {isLoading ? (
          <ClassAnalyticsSkeleton isTablet={isTablet} />
        ) : error || !classData ? (
          <View className="w-full justify-center items-center py-10 bg-white border border-[#E5E7EB] rounded-2xl px-6">
            <Feather name="alert-circle" size={36} color="#EF4444" />
            <Text className="font-fredoka-one text-lg text-[#4B5563] mt-3 text-center">
              Error Loading Analytics
            </Text>
            <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-1 text-center">
              {error || 'Class details not found.'}
            </Text>
          </View>
        ) : (
          <View className="flex-col gap-4">
            {/* Enrolled Class Students Roster Card */}
            <View className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl overflow-hidden mb-1">
              {/* Clickable Header Row */}
              <Pressable
                onPress={() => setIsRosterExpanded(!isRosterExpanded)}
                className="flex-row items-center justify-between p-4 sm:p-5 active:opacity-90"
              >
                <View className="flex-col">
                  <Text className="font-fredoka-one text-base sm:text-lg text-[#484A4B]">
                    Enrolled Students
                  </Text>
                  <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-0.5">
                    {students.length} {students.length === 1 ? 'student' : 'students'} in this class
                  </Text>
                </View>

                {/* Right Cluster: Overlapping Avatars (max 3) + 4th avatar with dark overlay "+N" */}
                <View className="flex-row items-center gap-2">
                  <View className="flex-row items-center">
                    {students.slice(0, 3).map((st, idx) => {
                      const isUrl = st.avatar?.startsWith('http') || st.avatar?.startsWith('file');
                      return (
                        <View
                          key={st.id || idx}
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-[#E0F2FE] items-center justify-center shadow-sm overflow-hidden ${
                            idx === 0 ? '' : '-ml-2.5'
                          }`}
                        >
                          {isUrl ? (
                            <Image source={{ uri: st.avatar }} className="w-full h-full" resizeMode="cover" />
                          ) : (
                            <Text className="text-base sm:text-lg">{st.avatar || '👦'}</Text>
                          )}
                        </View>
                      );
                    })}
                    {students.length > 3 && (() => {
                      const st = students[3];
                      const isUrl = st?.avatar?.startsWith('http') || st?.avatar?.startsWith('file');
                      const extraCount = students.length - 3;

                      return (
                        <View
                          key="avatar-overflow"
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-[#E0F2FE] items-center justify-center shadow-sm overflow-hidden -ml-2.5 relative"
                        >
                          {/* 4th Student Avatar Underneath */}
                          {isUrl ? (
                            <Image source={{ uri: st.avatar }} className="w-full h-full" resizeMode="cover" />
                          ) : (
                            <Text className="text-base sm:text-lg">{st?.avatar || '👦'}</Text>
                          )}

                          {/* Dark Gray Lowered Opacity Overlay with White +N Count */}
                          <View className="absolute inset-0 bg-slate-900/60 items-center justify-center">
                            <Text className="font-fredoka-one text-white text-sm sm:text-base">
                              +{extraCount}
                            </Text>
                          </View>
                        </View>
                      );
                    })()}
                  </View>

                  {/* Dropdown Chevron Arrow */}
                  <Feather
                    name={isRosterExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#9CA3AF"
                  />
                </View>
              </Pressable>

              {/* Expandable Horizontal Student List */}
              {isRosterExpanded && (
                <Animated.View
                  entering={FadeInUp.duration(200)}
                  exiting={FadeOutUp.duration(150)}
                  className="pt-2 pb-5 px-4 border-t border-[#E5E7EB]"
                >
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      gap: isTablet ? 20 : 14,
                      paddingVertical: 4,
                      paddingHorizontal: 2,
                    }}
                  >
                    {students.map((student) => {
                      const firstName = student.name ? student.name.split(' ')[0] : 'Student';
                      const isUrl = student.avatar?.startsWith('http') || student.avatar?.startsWith('file');

                      return (
                        <View key={student.id} className="items-center justify-center">
                          {/* Outer circle with grey border */}
                          <View
                            className={`items-center justify-center border-[#D9D9D9] border-[2px] ${
                              isTablet
                                ? 'w-[84px] h-[84px] rounded-[42px]'
                                : 'w-[64px] h-[64px] rounded-[32px]'
                            }`}
                          >
                            {/* Inner circle with thick white border */}
                            <View
                              className="w-full h-full items-center justify-center bg-[#E5E7EB] border-white overflow-hidden"
                              style={{
                                borderWidth: isTablet ? 4 : 3,
                                borderRadius: isTablet ? 38 : 29,
                              }}
                            >
                              {isUrl ? (
                                <Image source={{ uri: student.avatar }} className="w-full h-full" resizeMode="cover" />
                              ) : (
                                <Text style={{ fontSize: isTablet ? 36 : 24 }}>
                                  {student.avatar || '🙂'}
                                </Text>
                              )}
                            </View>
                          </View>
                          {/* First Name */}
                          <Text
                            className={`font-fredoka-one text-[#484A4B] mt-1.5 text-center ${
                              isTablet ? 'text-base' : 'text-xs'
                            }`}
                          >
                            {firstName}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                </Animated.View>
              )}
            </View>

            {/* Overview KPI Cards */}
            <OverviewCards classId={classId} />

            {/* Class Evaluation Trend Chart */}
            <ClassEvaluationTrend classId={classId} />

            {/* Developmental Domain Practice */}
            <ClassDevelopmentalDomainPractice classId={classId} />
          </View>
        )}
      </View>
    </ScreenLayout>
  );
}


