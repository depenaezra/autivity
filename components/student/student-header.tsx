import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import StudentBackground from '@/assets/images/student/background.svg';
import { HeaderButton } from '../header-button';

const EMOTION_MAP: Record<string, string> = {
  happy: 'Happy (Masaya)',
  calm: 'Calm (Kalmado)',
  excited: 'Excited (Masigla)',
  tired: 'Tired (Pagod)',
  sad: 'Sad (Malungkot)',
  nervous: 'Nervous (Kinakabahan)',
};

interface StudentHeaderProps {
  name: string;
  avatar?: string | null;
  todayEmotion?: string | null;
  onBackPress?: () => void;
  isTablet?: boolean;
}

export function StudentHeader({
  name,
  avatar,
  todayEmotion,
  onBackPress,
  isTablet = false,
}: StudentHeaderProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 16);
  // Fixed height of SVG is 135px, plus topInset for status bar padding
  const svgNativeHeight = isTablet ? 180 : 135;
  const bannerHeight = svgNativeHeight + topInset;

  const emotionBadgeText = todayEmotion
    ? EMOTION_MAP[todayEmotion.toLowerCase()] || todayEmotion
    : null;

  return (
    <View className="w-full mb-6">
      {/* Full Header Background Area with fixed SVG height + safe area */}
      <View
        className="w-full relative bg-[#BBE8FB]"
        style={{ height: bannerHeight }}
      >
        <StudentBackground width="100%" height="100%" preserveAspectRatio="xMidYMax slice" />

        {/* Back Button positioned top-left with safe area inset */}
        {onBackPress && (
          <View
            className="absolute left-6 z-10"
            style={{ top: topInset + (isTablet ? 8 : 4) }}
          >
            <HeaderButton
              onPress={onBackPress}
              icon={
                <View style={{ marginLeft: -3, marginTop: -1 }}>
                  <Ionicons name="caret-back" size={isTablet ? 30 : 24} color="#62A9E6" />
                </View>
              }
            />
          </View>
        )}

        {/* Centered Avatar Circle overlapping the bottom half of the background */}
        <View className="absolute left-0 right-0 items-center -bottom-[54px]">
          <View
            className={`rounded-full bg-[#E5E7EB] items-center justify-center border-[4px] border-white shadow-sm overflow-hidden ${
              isTablet ? 'w-[140px] h-[140px] border-[6px]' : 'w-[108px] h-[108px]'
            }`}
          >
            {avatar ? (
              <Text style={{ fontSize: isTablet ? 76 : 56 }}>
                {avatar}
              </Text>
            ) : (
              <Ionicons
                name="person"
                size={isTablet ? 72 : 54}
                color="#9CA3AF"
              />
            )}
          </View>
        </View>
      </View>

      {/* Student Name centered under circle icon */}
      <View className="items-center mt-[62px]">
        <Text
          className={`font-fredoka-one text-[#484A4B] text-center ${
            isTablet ? 'text-[36px] leading-10' : 'text-[26px] leading-8'
          }`}
          numberOfLines={1}
        >
          {name || 'Student'}
        </Text>

        {/* Today's Feeling Badge */}
        {emotionBadgeText && (
          <View className="mt-2.5 px-4 py-1.5 bg-[#EBF5FF] border-[1.5px] border-[#A3CFF1] rounded-full items-center justify-center">
            <Text className="font-fredoka-one text-[#62A9E6] text-sm md:text-lg tracking-wide">
              Feeling: {emotionBadgeText}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
