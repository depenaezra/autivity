import { Entypo } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import LessonsIcon from '../../../assets/images/teacher/class/icon-lesson.svg';
import HeaderResourcesSvg from '../../../assets/images/teacher/lessons/header-resources.svg';

interface LessonsSectionProps {
  lessonCount: number;
  isTablet: boolean;
  onPress: () => void;
}

export function LessonsSection({ lessonCount, isTablet, onPress }: LessonsSectionProps) {
  return (
    <View className={`w-full ${isTablet ? 'px-12 mt-10 mb-8' : 'px-6 mt-6 mb-4'}`}>
      <View className={`flex-row items-center gap-2 ${isTablet ? 'mb-6' : 'mb-4'}`}>
        <LessonsIcon
          width={isTablet ? 36 : 26}
          height={isTablet ? 36 : 26}
        />
        <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
          Lessons
        </Text>
      </View>

      <Pressable
        onPress={onPress}
        className="active:scale-[0.99] transition-transform"
      >
        <View
          className={`w-full bg-white border-[4px] ${isTablet ? 'h-[220px] rounded-[32px]' : 'h-[140px] rounded-[20px]'
            }`}
          style={{
            borderColor: '#F1F1F1',
            shadowColor: '#F1F1F1',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          }}
        >
          {/* Inner clip container */}
          <View className={`flex-1 overflow-hidden ${isTablet ? 'rounded-[28px]' : 'rounded-[16px]'}`}>
            {/* Header Resources SVG */}
            <View className="w-full h-[60%]">
              <HeaderResourcesSvg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
            </View>

            {/* Bottom Row */}
            <View className={`flex-row justify-between items-center flex-1 bg-white ${isTablet ? 'px-8' : 'px-4'}`}>
              <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
                Resources
              </Text>

              {/* View Button */}
              <View
                className={`bg-white border-[2px] rounded-[8px] flex-row justify-center items-center ${isTablet ? 'px-4 py-2 gap-1.5' : 'px-3 py-1.5 gap-1'
                  }`}
                style={{
                  borderColor: '#BBE8FB',
                  shadowColor: '#BBE8FB',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                <Text className={`font-fredoka-one text-[#62A9E6] ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
                  VIEW
                </Text>
                <Entypo name="chevron-right" size={isTablet ? 16 : 12} color="#62A9E6" />
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}


