import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { StudentPreferences } from '@/src/services/students';

interface StudentMenuSectionProps {
  isTablet?: boolean;
  // Classroom details
  classNameStr: string;
  gradeStr: string;
  teacherName: string;
  // Account details
  learnerCode: string;
  guardianName?: string | null;
  isParentLinked: boolean;
  // Preferences
  preferences: StudentPreferences;
  onTogglePreference: (key: keyof StudentPreferences) => void;
  // About / Bio
  spectrumLevel?: string;
  bio?: string;
}

export function StudentMenuSection({
  isTablet = false,
  classNameStr,
  gradeStr,
  teacherName,
  learnerCode,
  guardianName,
  isParentLinked,
  preferences,
  onTogglePreference,
  spectrumLevel,
  bio,
}: StudentMenuSectionProps) {
  const [classroomExpanded, setClassroomExpanded] = useState(true);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [accountExpanded, setAccountExpanded] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);

  return (
    <View className="gap-y-4 mb-6">
      {/* 1. CLASSROOM DETAILS ACCORDION */}
      <View
        className={`w-full bg-white ${
          isTablet ? 'rounded-[32px]' : 'rounded-[24px]'
        } border-[4px] border-[#F1F1F1] overflow-hidden`}
        style={{
          shadowColor: '#F1F1F1',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 3,
        }}
      >
        <Pressable
          onPress={() => setClassroomExpanded(!classroomExpanded)}
          className={`flex-row items-center justify-between bg-white ${
            isTablet ? 'p-6' : 'p-4'
          }`}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-[#E1F0FF] items-center justify-center">
              <Feather name="book-open" size={isTablet ? 20 : 18} color="#0284C7" />
            </View>
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-xl' : 'text-base'}`}>
              Classroom Details
            </Text>
          </View>
          <Feather
            name={classroomExpanded ? 'chevron-up' : 'chevron-down'}
            size={isTablet ? 22 : 18}
            color="#9CA3AF"
          />
        </Pressable>

        {classroomExpanded && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOutUp.duration(150)}
            className={`border-t border-[#F1F1F1] ${isTablet ? 'p-6' : 'p-4'} bg-[#FBFBFB]`}
          >
            {/* Classroom */}
            <View className="flex-row items-center justify-between pb-3 mb-3 border-b border-[#F1F1F1]">
              <View className="flex-row items-center">
                <Ionicons name="school-outline" size={isTablet ? 22 : 18} color="#62A9E6" />
                <Text className={`font-quicksand-medium text-[#4B5563] ml-2.5 ${isTablet ? 'text-base' : 'text-sm'}`}>
                  Classroom
                </Text>
              </View>
              <Text className={`font-quicksand-bold text-[#484A4B] ${isTablet ? 'text-base' : 'text-sm'}`}>
                {classNameStr} ({gradeStr})
              </Text>
            </View>

            {/* Teacher */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="person-circle-outline" size={isTablet ? 22 : 18} color="#62A9E6" />
                <Text className={`font-quicksand-medium text-[#4B5563] ml-2.5 ${isTablet ? 'text-base' : 'text-sm'}`}>
                  Teacher
                </Text>
              </View>
              <Text className={`font-quicksand-bold text-[#484A4B] ${isTablet ? 'text-base' : 'text-sm'}`}>
                Teacher {teacherName}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>

      {/* 2. FUN SETTINGS ACCORDION */}
      <View
        className={`w-full bg-white ${
          isTablet ? 'rounded-[32px]' : 'rounded-[24px]'
        } border-[4px] border-[#F1F1F1] overflow-hidden`}
        style={{
          shadowColor: '#F1F1F1',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 3,
        }}
      >
        <Pressable
          onPress={() => setSettingsExpanded(!settingsExpanded)}
          className={`flex-row items-center justify-between bg-white ${
            isTablet ? 'p-6' : 'p-4'
          }`}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-[#FFF3C4] items-center justify-center">
              <Feather name="settings" size={isTablet ? 20 : 18} color="#FFAE02" />
            </View>
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-xl' : 'text-base'}`}>
              Fun Settings
            </Text>
          </View>
          <Feather
            name={settingsExpanded ? 'chevron-up' : 'chevron-down'}
            size={isTablet ? 22 : 18}
            color="#9CA3AF"
          />
        </Pressable>

        {settingsExpanded && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOutUp.duration(150)}
            className={`border-t border-[#F1F1F1] ${isTablet ? 'p-6' : 'p-4'} bg-[#FBFBFB]`}
          >
            {/* Music */}
            <View className="flex-row items-center justify-between pb-3 mb-3 border-b border-[#F1F1F1]">
              <View className="flex-row items-center">
                <Ionicons name="volume-high-outline" size={isTablet ? 22 : 18} color="#A78BFA" />
                <Text className={`font-quicksand-medium text-[#4B5563] ml-2.5 ${isTablet ? 'text-base' : 'text-sm'}`}>
                  Music
                </Text>
              </View>
              <Pressable
                onPress={() => onTogglePreference('music_enabled')}
                className={`flex-row items-center rounded-full border ${
                  preferences.music_enabled
                    ? 'bg-[#E1F0FF] border-[#9ACBF9]'
                    : 'bg-[#F3F4F6] border-[#D1D5DB]'
                } ${isTablet ? 'px-4 py-1.5' : 'px-3 py-1'}`}
              >
                <Text
                  className={`font-fredoka-one ${
                    preferences.music_enabled ? 'text-[#0284C7]' : 'text-[#6B7280]'
                  } ${isTablet ? 'text-sm' : 'text-xs'}`}
                >
                  {preferences.music_enabled ? 'ON' : 'OFF'}
                </Text>
              </Pressable>
            </View>

            {/* Sound Effects */}
            <View className="flex-row items-center justify-between pb-3 mb-3 border-b border-[#F1F1F1]">
              <View className="flex-row items-center">
                <Ionicons name="musical-note-outline" size={isTablet ? 22 : 18} color="#FB923C" />
                <Text className={`font-quicksand-medium text-[#4B5563] ml-2.5 ${isTablet ? 'text-base' : 'text-sm'}`}>
                  Sound Effects
                </Text>
              </View>
              <Pressable
                onPress={() => onTogglePreference('sfx_enabled')}
                className={`flex-row items-center rounded-full border ${
                  preferences.sfx_enabled
                    ? 'bg-[#E1F0FF] border-[#9ACBF9]'
                    : 'bg-[#F3F4F6] border-[#D1D5DB]'
                } ${isTablet ? 'px-4 py-1.5' : 'px-3 py-1'}`}
              >
                <Text
                  className={`font-fredoka-one ${
                    preferences.sfx_enabled ? 'text-[#0284C7]' : 'text-[#6B7280]'
                  } ${isTablet ? 'text-sm' : 'text-xs'}`}
                >
                  {preferences.sfx_enabled ? 'ON' : 'OFF'}
                </Text>
              </Pressable>
            </View>

            {/* Confetti Effects */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="sparkles-outline" size={isTablet ? 22 : 18} color="#FACC15" />
                <Text className={`font-quicksand-medium text-[#4B5563] ml-2.5 ${isTablet ? 'text-base' : 'text-sm'}`}>
                  Confetti Effects
                </Text>
              </View>
              <Pressable
                onPress={() => onTogglePreference('confetti_enabled')}
                className={`flex-row items-center rounded-full border ${
                  preferences.confetti_enabled
                    ? 'bg-[#E1F0FF] border-[#9ACBF9]'
                    : 'bg-[#F3F4F6] border-[#D1D5DB]'
                } ${isTablet ? 'px-4 py-1.5' : 'px-3 py-1'}`}
              >
                <Text
                  className={`font-fredoka-one ${
                    preferences.confetti_enabled ? 'text-[#0284C7]' : 'text-[#6B7280]'
                  } ${isTablet ? 'text-sm' : 'text-xs'}`}
                >
                  {preferences.confetti_enabled ? 'ON' : 'OFF'}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        )}
      </View>

      {/* 3. ACCOUNT DETAILS ACCORDION */}
      <View
        className={`w-full bg-white ${
          isTablet ? 'rounded-[32px]' : 'rounded-[24px]'
        } border-[4px] border-[#F1F1F1] overflow-hidden`}
        style={{
          shadowColor: '#F1F1F1',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 3,
        }}
      >
        <Pressable
          onPress={() => setAccountExpanded(!accountExpanded)}
          className={`flex-row items-center justify-between bg-white ${
            isTablet ? 'p-6' : 'p-4'
          }`}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-[#CBFAC4] items-center justify-center">
              <Feather name="user" size={isTablet ? 20 : 18} color="#179D33" />
            </View>
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-xl' : 'text-base'}`}>
              Account Details
            </Text>
          </View>
          <Feather
            name={accountExpanded ? 'chevron-up' : 'chevron-down'}
            size={isTablet ? 22 : 18}
            color="#9CA3AF"
          />
        </Pressable>

        {accountExpanded && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOutUp.duration(150)}
            className={`border-t border-[#F1F1F1] ${isTablet ? 'p-6' : 'p-4'} bg-[#FBFBFB]`}
          >
            {/* Learner Code Pill */}
            <View className="flex-row items-center justify-between pb-3 mb-3 border-b border-[#F1F1F1]">
              <Text className={`font-quicksand-medium text-[#4B5563] ${isTablet ? 'text-base' : 'text-sm'}`}>
                Learner Code
              </Text>
              {learnerCode ? (
                <View
                  className={`border-[2px] rounded-[8px] justify-center items-center ${
                    isTablet ? 'px-4 py-1.5' : 'px-3 py-1'
                  }`}
                  style={{
                    backgroundColor: '#BBE8FB',
                    borderColor: '#62A9E6',
                    shadowColor: '#62A9E6',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 2,
                  }}
                >
                  <Text
                    className={`font-fredoka-one text-[#62A9E6] uppercase ${
                      isTablet ? 'text-xs' : 'text-[11px]'
                    }`}
                  >
                    {learnerCode}
                  </Text>
                </View>
              ) : (
                <Text className={`font-fredoka-one text-[#9CA3AF] ${isTablet ? 'text-base' : 'text-sm'}`}>
                  —
                </Text>
              )}
            </View>

            {/* Guardian */}
            <View className="flex-row items-center justify-between pb-3 mb-3 border-b border-[#F1F1F1]">
              <Text className={`font-quicksand-medium text-[#4B5563] ${isTablet ? 'text-base' : 'text-sm'}`}>
                Guardian
              </Text>
              <Text className={`font-quicksand-bold text-[#484A4B] ${isTablet ? 'text-base' : 'text-sm'}`}>
                {guardianName || (isParentLinked ? 'Parent / Guardian' : 'Not linked yet')}
              </Text>
            </View>

            {/* Parent Portal */}
            <View className="flex-row items-center justify-between">
              <Text className={`font-quicksand-medium text-[#4B5563] ${isTablet ? 'text-base' : 'text-sm'}`}>
                Parent Portal
              </Text>
              <View
                className={`rounded-full px-3 py-1 border ${
                  isParentLinked
                    ? 'bg-[#DCFCE7] border-[#86EFAC]'
                    : 'bg-[#FEF3C7] border-[#FDE68A]'
                }`}
              >
                <Text
                  className={`font-fredoka-one ${isTablet ? 'text-xs' : 'text-[11px]'} ${
                    isParentLinked ? 'text-[#15803D]' : 'text-[#B45309]'
                  }`}
                >
                  {isParentLinked ? 'Linked' : 'Not Linked'}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
      </View>

      {/* 4. ABOUT ACCORDION (If bio or spectrum level exists) */}
      {(spectrumLevel || bio) && (
        <View
          className={`w-full bg-white ${
            isTablet ? 'rounded-[32px]' : 'rounded-[24px]'
          } border-[4px] border-[#F1F1F1] overflow-hidden`}
          style={{
            shadowColor: '#F1F1F1',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 3,
          }}
        >
          <Pressable
            onPress={() => setAboutExpanded(!aboutExpanded)}
            className={`flex-row items-center justify-between bg-white ${
              isTablet ? 'p-6' : 'p-4'
            }`}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-[#FFDBD4] items-center justify-center">
                <Feather name="info" size={isTablet ? 20 : 18} color="#FF8870" />
              </View>
              <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-xl' : 'text-base'}`}>
                About Learner
              </Text>
            </View>
            <Feather
              name={aboutExpanded ? 'chevron-up' : 'chevron-down'}
              size={isTablet ? 22 : 18}
              color="#9CA3AF"
            />
          </Pressable>

          {aboutExpanded && (
            <Animated.View
              entering={FadeInUp.duration(200)}
              exiting={FadeOutUp.duration(150)}
              className={`border-t border-[#F1F1F1] ${isTablet ? 'p-6' : 'p-4'} bg-[#FBFBFB]`}
            >
              {spectrumLevel && (
                <View className={bio ? 'pb-3 mb-3 border-b border-[#F1F1F1]' : ''}>
                  <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                    SPECTRUM LEVEL
                  </Text>
                  <Text className={`font-quicksand-bold text-[#484A4B] mt-0.5 ${isTablet ? 'text-base' : 'text-sm'}`}>
                    {spectrumLevel}
                  </Text>
                </View>
              )}
              {bio && (
                <View>
                  <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                    BIO
                  </Text>
                  <Text className={`font-quicksand-medium text-[#484A4B] mt-0.5 leading-5 ${isTablet ? 'text-base' : 'text-sm'}`}>
                    {bio}
                  </Text>
                </View>
              )}
            </Animated.View>
          )}
        </View>
      )}
    </View>
  );
}
