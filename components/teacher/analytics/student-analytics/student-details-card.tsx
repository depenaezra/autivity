import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { StudentHeaderDetails } from '../../../../src/services/student-analytics';

interface StudentDetailsCardProps {
  student: StudentHeaderDetails;
}

export default function StudentDetailsCard({ student }: StudentDetailsCardProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const [isParentInfoExpanded, setIsParentInfoExpanded] = useState(false);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl overflow-hidden mb-1 p-4 sm:p-5">
      {/* Title & Last Session Header Row */}
      <View className="flex-row items-center justify-between flex-wrap gap-2">
        <Text className="font-fredoka-one text-lg sm:text-xl text-[#484A4B]">
          Learner Details
        </Text>

        {/* Last Session Date with Filled Calendar Icon */}
        <View className="flex-row items-center gap-1.5 bg-[#EFEFF0] px-2.5 py-1 rounded-lg">
          <Ionicons name="calendar" size={isTablet ? 18 : 16} color="#4B5563" />
          <Text className="font-quicksand-semibold text-sm sm:text-base text-[#4B5563]">
            {student.lastSessionDate ? formatDate(student.lastSessionDate) : 'No sessions recorded'}
          </Text>
        </View>
      </View>

      {/* Pills & Parent Info Row */}
      <View className="flex-row items-center justify-between flex-wrap gap-2 mt-3 pt-3 border-t border-[#E5E7EB]">
        {/* Left Side: Badges */}
        <View className="flex-row items-center flex-wrap gap-2">
          {/* Learner Code Badge */}
          <View className="bg-[#BBE8FB] px-3 py-1 rounded-[6px] justify-center items-center">
            <Text
              className="font-fredoka-one text-[#62A9E6] uppercase"
              style={{ fontSize: isTablet ? 14 : 12 }}
            >
              # {student.learnerCode || 'AUT-000'}
            </Text>
          </View>

          {/* Parent Account Linked / Not Linked Badge */}
          {student.isLinked ? (
            <View className="bg-[#CBFAC4] px-3 py-1 rounded-[6px] flex-row items-center gap-1">
              <Ionicons
                name="checkmark-circle"
                size={isTablet ? 16 : 13}
                color="#179D33"
              />
              <Text
                className="font-fredoka-one text-[#179D33] uppercase"
                style={{ fontSize: isTablet ? 14 : 12 }}
              >
                LINKED
              </Text>
            </View>
          ) : (
            <View className="bg-[#E5E7EB] px-3 py-1 rounded-[6px] flex-row items-center gap-1">
              <Ionicons
                name="close-circle-outline"
                size={isTablet ? 16 : 13}
                color="#6B7280"
              />
              <Text
                className="font-fredoka-one text-[#6B7280] uppercase"
                style={{ fontSize: isTablet ? 14 : 12 }}
              >
                NOT LINKED
              </Text>
            </View>
          )}
        </View>

        {/* Far Right: Parent Info Dropdown Toggle Button */}
        <Pressable
          onPress={() => setIsParentInfoExpanded(!isParentInfoExpanded)}
          className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] active:opacity-80"
        >
          <Text className="font-quicksand-bold text-sm sm:text-base text-[#4B5563]">
            Parent Info
          </Text>
          <Feather
            name={isParentInfoExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#6B7280"
          />
        </Pressable>
      </View>

      {/* Expandable Parent Info Panel */}
      {isParentInfoExpanded && (
        <Animated.View
          entering={FadeInUp.duration(200)}
          exiting={FadeOutUp.duration(150)}
          className="mt-3 p-3.5 bg-white border border-[#E5E7EB] rounded-xl flex-col gap-2"
        >
          <Text className="font-fredoka-one text-sm text-[#484A4B] uppercase tracking-wide">
            Parent Details
          </Text>

          {student.isLinked ? (
            <View className="flex-col gap-1.5 mt-0.5">
              {student.parentInfo?.name ? (
                <View className="flex-row items-center gap-2">
                  <Text className="font-quicksand-bold text-sm text-[#6B7280]">NAME:</Text>
                  <Text className="font-quicksand-semibold text-sm text-[#484A4B]">
                    {student.parentInfo.name}
                  </Text>
                </View>
              ) : null}

              {student.parentInfo?.email ? (
                <View className="flex-row items-center gap-2">
                  <Text className="font-quicksand-bold text-sm text-[#6B7280]">EMAIL:</Text>
                  <Text className="font-quicksand-semibold text-sm text-[#62A9E6]">
                    {student.parentInfo.email}
                  </Text>
                </View>
              ) : (
                <Text className="font-quicksand-medium text-sm text-[#6B7280]">
                  Parent account linked to this learner.
                </Text>
              )}
            </View>
          ) : (
            <Text className="font-quicksand-medium text-sm text-[#9CA3AF]">
              No parent account is currently linked to this student. Share the learner code with the parent to connect their account.
            </Text>
          )}
        </Animated.View>
      )}
    </View>
  );
}
