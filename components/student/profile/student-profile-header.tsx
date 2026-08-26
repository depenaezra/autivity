import React from 'react';
import { Image, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HeaderClassBlue from '@/assets/images/teacher/class/header-class-blue.svg';

interface StudentProfileHeaderProps {
  name: string;
  avatar?: string | null;
  learnerCode?: string;
  avatarUrl?: string | null;
  isTablet?: boolean;
}

export function StudentProfileHeader({
  name,
  avatar,
  learnerCode,
  avatarUrl,
  isTablet = false,
}: StudentProfileHeaderProps) {
  return (
    <View
      className={`w-full bg-white ${
        isTablet ? 'rounded-[32px]' : 'rounded-[24px]'
      } border-[4px] border-[#F1F1F1] overflow-hidden mb-6`}
      style={{
        shadowColor: '#F1F1F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 3,
      }}
    >
      {/* Top Banner SVG */}
      <View className={`w-full ${isTablet ? 'h-[180px]' : 'h-[130px]'} relative bg-[#BBE8FB]`}>
        <HeaderClassBlue width="100%" height="100%" preserveAspectRatio="xMidYMax slice" />
      </View>

      {/* Header Content Container */}
      <View className={`px-5 pb-5 ${isTablet ? 'px-8 pb-6' : 'px-5 pb-5'}`}>
        {/* Overlapping Avatar Container on Left & Learner Code Pill on Right */}
        <View className="flex-row items-end justify-between -mt-[45px] mb-3">
          <View className="relative">
            <View
              className={`rounded-full bg-[#E5E7EB] items-center justify-center border-[4px] border-white shadow-sm overflow-hidden ${
                isTablet ? 'w-[110px] h-[110px]' : 'w-[88px] h-[88px]'
              }`}
            >
              {avatar ? (
                <Text style={{ fontSize: isTablet ? 60 : 46 }}>
                  {avatar}
                </Text>
              ) : avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Ionicons
                  name="person"
                  size={isTablet ? 60 : 46}
                  color="#9CA3AF"
                />
              )}
            </View>
          </View>

          {/* Learner Code Pill */}
          {learnerCode && (
            <View
              className={`bg-white border-[2px] rounded-[8px] justify-center items-center ${
                isTablet ? 'px-4 py-2' : 'px-3 py-1.5'
              }`}
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#BBE8FB',
                shadowColor: '#BBE8FB',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              <Text
                className={`font-fredoka-one text-[#62A9E6] uppercase ${
                  isTablet ? 'text-sm' : 'text-[11px]'
                }`}
              >
                {learnerCode}
              </Text>
            </View>
          )}
        </View>

        {/* Student Name */}
        <View className="mt-1">
          <Text
            className={`font-fredoka-one text-[#484A4B] ${
              isTablet ? 'text-[28px] leading-8' : 'text-[22px] leading-7'
            }`}
            numberOfLines={1}
          >
            {name || 'Student Profile'}
          </Text>
        </View>
      </View>
    </View>
  );
}
