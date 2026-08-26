import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

interface Student {
  id: string;
  name: string;
  avatar?: string;
}

interface EnrolledStudentsCardProps {
  students: Student[];
}

export default function EnrolledStudentsCard({ students }: EnrolledStudentsCardProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const router = useRouter();
  const [isRosterExpanded, setIsRosterExpanded] = useState(false);

  if (!students || students.length === 0) return null;

  return (
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
          <Text className="font-quicksand-medium text-sm sm:text-base text-[#9CA3AF] mt-0.5">
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
                <Pressable
                  key={student.id}
                  className="items-center justify-center active:opacity-85"
                  onPress={() => {
                    router.push({
                      pathname: '/student-analytics/[studentId]',
                      params: { studentId: student.id },
                    } as any);
                  }}
                >
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
                      isTablet ? 'text-base' : 'text-sm'
                    }`}
                  >
                    {firstName}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}
