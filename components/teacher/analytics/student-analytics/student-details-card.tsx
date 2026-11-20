import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { StudentHeaderDetails } from '../../../../src/services/student-analytics';

interface StudentDetailsCardProps {
  student: StudentHeaderDetails;
  needsIntervention?: boolean;
}

const classColors: Record<string, { background: string; text: string }> = {
  blue: { background: '#BBE8FB', text: '#62A9E6' },
  green: { background: '#CBFAC4', text: '#179D33' },
  orange: { background: '#FFDBD4', text: '#FF8870' },
  yellow: { background: '#FFF3C4', text: '#FFAE02' },
};

export default function StudentDetailsCard({ student, needsIntervention }: StudentDetailsCardProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const [isParentInfoExpanded, setIsParentInfoExpanded] = useState(false);
  const classColor = classColors[student.theme?.toLowerCase() || 'blue'] || classColors.blue;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View
      className={`bg-white border-[4px] border-[#F1F1F1] ${
        isTablet ? 'rounded-[32px] p-6' : 'rounded-[20px] p-4'
      } overflow-hidden mb-1`}
      style={{
        shadowColor: '#F1F1F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 2,
      }}
    >
      {/* Title & Last Session Header Row */}
      <View className="flex-row items-center justify-between flex-wrap gap-2">
        <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-2xl' : 'text-xl'}`}>
          Learner Details
        </Text>

        {/* Last Session Date with Calendar Icon */}
        <View className="flex-row items-center gap-1.5 bg-[#F5F7FA] border border-[#E5E7EB]/60 px-3 py-1.5 rounded-xl">
          <Ionicons name="calendar-outline" size={isTablet ? 16 : 14} color="#62A9E6" />
          <Text className={`font-quicksand-bold text-[#484A4B] ${isTablet ? 'text-sm' : 'text-xs'}`}>
            {student.lastSessionDate ? formatDate(student.lastSessionDate) : 'No sessions recorded'}
          </Text>
        </View>
      </View>

      {/* Badges & Parent Info Row */}
      <View className="flex-row items-center justify-between flex-wrap gap-2 mt-3 pt-3 border-t border-[#F1F1F1]">
        {/* Left Side: Badges */}
        <View className="flex-row items-center flex-wrap gap-2">
          {/* Learner Code Badge */}
          <View className="bg-[#BBE8FB] px-3 py-1.5 rounded-xl justify-center items-center">
            <Text
              className="font-fredoka-one text-[#62A9E6] uppercase"
              style={{ fontSize: isTablet ? 13 : 11 }}
            >
              # {student.learnerCode || 'AUT-000'}
            </Text>
          </View>

          {/* Parent Account Linked / Not Linked Badge */}
          {student.isLinked ? (
            <View className="bg-[#CBFAC4] px-3 py-1.5 rounded-xl flex-row items-center gap-1.5">
              <Ionicons
                name="checkmark-circle"
                size={isTablet ? 15 : 13}
                color="#179D33"
              />
              <Text
                className="font-fredoka-one text-[#179D33] uppercase"
                style={{ fontSize: isTablet ? 13 : 11 }}
              >
                LINKED
              </Text>
            </View>
          ) : (
            <View className="bg-[#F1F1F1] px-3 py-1.5 rounded-xl flex-row items-center gap-1.5">
              <Ionicons
                name="close-circle-outline"
                size={isTablet ? 15 : 13}
                color="#9CA3AF"
              />
              <Text
                className="font-fredoka-one text-[#9CA3AF] uppercase"
                style={{ fontSize: isTablet ? 13 : 11 }}
              >
                NOT LINKED
              </Text>
            </View>
          )}
          {student.className ? (
            <View className="px-3 py-1.5 rounded-xl" style={{ backgroundColor: classColor.background }}>
              <Text
                className="font-fredoka-one uppercase"
                style={{ color: classColor.text, fontSize: isTablet ? 13 : 11 }}
              >
                {student.className}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Far Right: Parent Info Tactile Toggle Button */}
        <Pressable
          onPress={() => setIsParentInfoExpanded(!isParentInfoExpanded)}
          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-[2px] border-[#BBE8FB] active:scale-95 transition-transform"
          style={{
            shadowColor: '#BBE8FB',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          }}
        >
          <Text className={`font-fredoka-one uppercase text-[#62A9E6] ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
            Parent Info
          </Text>
          <Feather
            name={isParentInfoExpanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color="#62A9E6"
          />
        </Pressable>
      </View>

      {/* Expandable Parent Info Panel */}
      {isParentInfoExpanded && (
        <Animated.View
          entering={FadeInUp.duration(200)}
          exiting={FadeOutUp.duration(150)}
          className="mt-3 p-4 bg-[#F8FAFC] border-[2px] border-[#F1F1F1] rounded-2xl flex-col gap-2.5"
        >
          <Text className="font-fredoka-one text-xs text-[#9CA3AF] uppercase tracking-wider">
            Parent Details
          </Text>

          {student.isLinked ? (
            <View className="flex-col gap-2 mt-0.5">
              {student.parentInfo?.name ? (
                <View className="flex-row items-center gap-2">
                  <Text className="font-fredoka-one text-xs text-[#9CA3AF] uppercase">NAME:</Text>
                  <Text className="font-quicksand-bold text-sm text-[#484A4B]">
                    {student.parentInfo.name}
                  </Text>
                </View>
              ) : null}

              {student.parentInfo?.email ? (
                <View className="flex-row items-center gap-2">
                  <Text className="font-fredoka-one text-xs text-[#9CA3AF] uppercase">EMAIL:</Text>
                  <Text className="font-quicksand-bold text-sm text-[#62A9E6]">
                    {student.parentInfo.email}
                  </Text>
                </View>
              ) : (
                <Text className="font-quicksand-medium text-xs text-[#484A4B]">
                  Parent account linked to this learner.
                </Text>
              )}
            </View>
          ) : (
            <Text className="font-quicksand-medium text-xs text-[#9CA3AF] leading-relaxed">
              No parent account is currently linked to this student. Share the learner code with the parent to connect their account.
            </Text>
          )}
        </Animated.View>
      )}
    </View>
  );
}
