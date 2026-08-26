import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import HeaderClassBlue from '@/assets/images/teacher/class/header-class-blue.svg';

interface ParentProfileHeaderProps {
  name: string;
  email: string;
  avatarUrl?: string | null;
  isEditing: boolean;
  onEditPress: () => void;
  onCameraPress?: () => void;
  isTablet?: boolean;
}

export function ParentProfileHeader({
  name,
  email,
  avatarUrl,
  isEditing,
  onEditPress,
  onCameraPress,
  isTablet = false,
}: ParentProfileHeaderProps) {
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
        {/* Top Row: Overlapping Avatar on Left & Action Button on Right */}
        <View className="flex-row items-end justify-between -mt-[45px] mb-3">
          {/* Avatar Container */}
          <View className="relative">
            <View
              className={`rounded-full bg-white border-[4px] border-white shadow-sm overflow-hidden ${
                isTablet ? 'w-[110px] h-[110px]' : 'w-[88px] h-[88px]'
              }`}
            >
              <Image
                source={
                  avatarUrl
                    ? { uri: avatarUrl }
                    : require('@/assets/images/bear.png')
                }
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>

            {/* Camera Icon Badge */}
            <Pressable
              onPress={onCameraPress}
              className={`absolute bottom-0 right-0 bg-[#62A9E6] rounded-full items-center justify-center border-[2.5px] border-white active:scale-95 transition-transform ${
                isTablet ? 'w-9 h-9 border-[3px]' : 'w-8 h-8'
              }`}
            >
              <Feather name="camera" size={isTablet ? 16 : 14} color="white" />
            </Pressable>
          </View>

          {/* Edit / Done Button */}
          <Pressable
            onPress={onEditPress}
            className={`bg-white border-[2px] rounded-[8px] justify-center items-center active:scale-95 transition-transform ${
              isTablet ? 'px-4 py-2' : 'px-3 py-1.5'
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
            <Text
              className={`font-fredoka-one text-[#62A9E6] ${
                isTablet ? 'text-sm' : 'text-[11px]'
              }`}
            >
              {isEditing ? 'DONE' : 'EDIT'}
            </Text>
          </Pressable>
        </View>

        {/* Parent Name & Email */}
        <View className="mt-1">
          <Text
            className={`font-fredoka-one text-[#484A4B] ${
              isTablet ? 'text-[28px] leading-8' : 'text-[22px] leading-7'
            }`}
            numberOfLines={1}
          >
            {name || 'Parent Profile'}
          </Text>

          <Text
            className={`font-quicksand-medium text-[#9CA3AF] mt-1 ${
              isTablet ? 'text-base' : 'text-sm'
            }`}
            numberOfLines={1}
          >
            {email || 'No email specified'}
          </Text>
        </View>
      </View>
    </View>
  );
}
