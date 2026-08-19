import React from 'react';
import { Pressable, Text, View } from 'react-native';

import ClassesIcon from '../../../assets/images/teacher/home/icons/icon-classes.svg';
import LessonsIcon from '../../../assets/images/teacher/home/icons/icon-lessons.svg';
import StudentsIcon from '../../../assets/images/teacher/home/icons/icon-students.svg';

interface StatsCardProps {
  type: 'students' | 'classes' | 'lessons';
  count: number;
  isTablet: boolean;
  onPress?: () => void;
}

const cardConfigs = {
  students: {
    label: 'STUDENTS',
    borderColor: '#BBE8FB',
    labelColor: '#62A9E6',
    Icon: StudentsIcon,
  },
  classes: {
    label: 'CLASSES',
    borderColor: '#FFB9ED',
    labelColor: '#FFB9ED',
    Icon: ClassesIcon,
  },
  lessons: {
    label: 'LESSONS',
    borderColor: '#F7D27A',
    labelColor: '#F7D27A',
    Icon: LessonsIcon,
  },
};

export function StatsCard({ type, count, isTablet, onPress }: StatsCardProps) {
  const CardContainer = onPress ? Pressable : View;
  const config = cardConfigs[type];
  const { Icon, borderColor, labelColor, label } = config;

  return (
    <CardContainer
      onPress={onPress}
      className={`border-[4px] bg-white justify-center items-center ${
        onPress ? 'active:opacity-90 active:scale-95' : ''
      } ${
        isTablet ? 'rounded-[32px] p-4 flex-1 min-w-[160px]' : 'rounded-[20px] p-3 flex-1 min-w-[100px]'
      }`}
      style={{
        borderColor,
        shadowColor: borderColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 2,
        ...(!isTablet ? { aspectRatio: 1 } : { height: 155 }),
      }}
    >
      {/* Label */}
      <Text
        className={`font-fredoka-one tracking-[0.06em] text-center ${
          isTablet ? 'text-sm mt-2' : 'text-[10px] mt-2'
        }`}
        style={{ color: labelColor, letterSpacing: isTablet ? 1.2 : 0.6 }}
        numberOfLines={1}
      >
        {label}
      </Text>

      {/* Icon */}
      <View className={`justify-center items-center ${isTablet ? 'my-2' : 'my-1.5'}`}>
        <Icon
          width={isTablet ? 48 : 32}
          height={isTablet ? 48 : 32}
        />
      </View>

      {/* Count */}
      <Text
        className={`font-fredoka-one text-[#484A4B] text-center ${
          isTablet ? 'text-4xl mb-2' : 'text-[26px] mb-2'
        }`}
      >
        {count}
      </Text>
    </CardContainer>
  );
}
