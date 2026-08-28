import React, { useState } from 'react';
import { Linking, Pressable, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

interface ProfileMenuSectionProps {
  isTablet?: boolean;
  // Personal Info state
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  isEditing: boolean;
  setFirstName: (val: string) => void;
  setLastName: (val: string) => void;
  setEmail: (val: string) => void;
  setUniversity: (val: string) => void;
  onSaveProfile: () => void;
  onCancelEdit: () => void;
  // Classroom stats
  goals?: string[];
  studentCount: number;
  classCount: number;
  // Account action
  onChangePassword: () => void;
}

export function ProfileMenuSection({
  isTablet = false,
  firstName,
  lastName,
  email,
  university,
  isEditing,
  setFirstName,
  setLastName,
  setEmail,
  setUniversity,
  onSaveProfile,
  onCancelEdit,
  goals = [],
  studentCount,
  classCount,
  onChangePassword,
}: ProfileMenuSectionProps) {
  // Accordion expanded states (default all sections closed)
  const [personalExpanded, setPersonalExpanded] = useState(false);
  const [classroomExpanded, setClassroomExpanded] = useState(false);
  const [accountExpanded, setAccountExpanded] = useState(false);

  // Auto-expand Personal Info when edit is triggered from header
  React.useEffect(() => {
    if (isEditing) {
      setPersonalExpanded(true);
    }
  }, [isEditing]);

  const openPrivacyPolicy = () => {
    Linking.openURL('https://autivity.vercel.app/privacy').catch((err) =>
      console.log('Error opening privacy policy:', err)
    );
  };

  const openTerms = () => {
    Linking.openURL('https://autivity.vercel.app/terms').catch((err) =>
      console.log('Error opening terms:', err)
    );
  };

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
      {/* 1. PERSONAL INFORMATION */}
      <View className="border-b border-[#F1F1F1]">
        <Pressable
          onPress={() => setPersonalExpanded(!personalExpanded)}
          className={`flex-row items-center justify-between active:bg-[#F9FAFB] ${
            isTablet ? 'px-8 py-5' : 'px-5 py-4'
          }`}
        >
          <View className="flex-row items-center gap-3.5 flex-1">
            <View className="w-9 h-9 rounded-full bg-[#F5F7FA] items-center justify-center">
              <Feather name="user" size={isTablet ? 20 : 18} color="#6B7280" />
            </View>
            <Text
              className={`font-fredoka-one text-[#4B5563] ${
                isTablet ? 'text-xl' : 'text-base'
              }`}
            >
              Personal information
            </Text>
          </View>
          <Feather
            name={personalExpanded ? 'chevron-down' : 'chevron-right'}
            size={isTablet ? 24 : 20}
            color="#9CA3AF"
          />
        </Pressable>

        {personalExpanded && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOutUp.duration(150)}
            className={`bg-[#F9FAFB] ${isTablet ? 'px-8 py-5' : 'px-5 py-4'}`}
          >
            {/* Name */}
            <View className="flex-row items-center justify-between border-b border-[#E5E7EB] pb-3 mb-3">
              <Text
                className={`font-quicksand-bold text-[#4B5563] ${
                  isTablet ? 'w-[140px] text-base' : 'w-[100px] text-sm'
                }`}
              >
                Full Name
              </Text>
              {isEditing ? (
                <View className="flex-1 flex-row gap-2">
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First Name"
                    className="flex-1 bg-white border border-[#D1D5DB] rounded-xl px-3 py-2 font-quicksand-medium text-sm text-[#484A4B]"
                  />
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last Name"
                    className="flex-1 bg-white border border-[#D1D5DB] rounded-xl px-3 py-2 font-quicksand-medium text-sm text-[#484A4B]"
                  />
                </View>
              ) : (
                <Text
                  className={`font-quicksand-medium flex-1 text-[#9CA3AF] ${
                    isTablet ? 'text-base' : 'text-sm'
                  }`}
                >
                  {firstName} {lastName}
                </Text>
              )}
            </View>

            {/* Email */}
            <View className="flex-row items-center justify-between border-b border-[#E5E7EB] pb-3 mb-3">
              <Text
                className={`font-quicksand-bold text-[#4B5563] ${
                  isTablet ? 'w-[140px] text-base' : 'w-[100px] text-sm'
                }`}
              >
                Email
              </Text>
              {isEditing ? (
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email Address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 bg-white border border-[#D1D5DB] rounded-xl px-3 py-2 font-quicksand-medium text-sm text-[#484A4B]"
                />
              ) : (
                <Text
                  className={`font-quicksand-medium flex-1 text-[#9CA3AF] ${
                    isTablet ? 'text-base' : 'text-sm'
                  }`}
                >
                  {email}
                </Text>
              )}
            </View>

            {/* Password */}
            <View className="flex-row items-center justify-between border-b border-[#E5E7EB] pb-3 mb-3">
              <Text
                className={`font-quicksand-bold text-[#4B5563] ${
                  isTablet ? 'w-[140px] text-base' : 'w-[100px] text-sm'
                }`}
              >
                Password
              </Text>
              <Text
                className={`flex-1 text-[#9CA3AF] leading-none ${
                  isTablet ? 'text-lg' : 'text-base'
                }`}
              >
                ••••••••
              </Text>
              <Pressable
                onPress={onChangePassword}
                className="bg-white border-[2px] rounded-[8px] justify-center items-center active:scale-95 transition-transform px-3 py-1"
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
                    isTablet ? 'text-xs' : 'text-[10px]'
                  }`}
                >
                  CHANGE
                </Text>
              </Pressable>
            </View>

            {/* University */}
            <View className="flex-row items-center justify-between">
              <Text
                className={`font-quicksand-bold text-[#4B5563] ${
                  isTablet ? 'w-[140px] text-base' : 'w-[100px] text-sm'
                }`}
              >
                University
              </Text>
              {isEditing ? (
                <TextInput
                  value={university}
                  onChangeText={setUniversity}
                  placeholder="University / School"
                  className="flex-1 bg-white border border-[#D1D5DB] rounded-xl px-3 py-2 font-quicksand-medium text-sm text-[#484A4B]"
                />
              ) : (
                <Text
                  className={`font-quicksand-medium flex-1 text-[#9CA3AF] ${
                    isTablet ? 'text-base' : 'text-sm'
                  }`}
                >
                  {university || 'Not specified'}
                </Text>
              )}
            </View>

            {/* Editing Action Buttons */}
            {isEditing && (
              <View className="flex-row justify-end mt-4 gap-3">
                <Pressable
                  onPress={onCancelEdit}
                  className="bg-[#E5E7EB] border border-[#D1D5DB] rounded-xl px-4 py-2 active:scale-95 transition-transform"
                >
                  <Text className="font-fredoka-one text-[#4B5563] text-sm">
                    CANCEL
                  </Text>
                </Pressable>

                <Pressable
                  onPress={onSaveProfile}
                  className="bg-[#62A9E6] border border-[#3B82F6] rounded-xl px-5 py-2 active:scale-95 transition-transform"
                  style={{
                    shadowColor: '#62A9E6',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.8,
                    shadowRadius: 0,
                    elevation: 2,
                  }}
                >
                  <Text className="font-fredoka-one text-white text-sm">
                    SAVE
                  </Text>
                </Pressable>
              </View>
            )}
          </Animated.View>
        )}
      </View>

      {/* 2. CLASSROOM */}
      <View className="border-b border-[#F1F1F1]">
        <Pressable
          onPress={() => setClassroomExpanded(!classroomExpanded)}
          className={`flex-row items-center justify-between active:bg-[#F9FAFB] ${
            isTablet ? 'px-8 py-5' : 'px-5 py-4'
          }`}
        >
          <View className="flex-row items-center gap-3.5 flex-1">
            <View className="w-9 h-9 rounded-full bg-[#F5F7FA] items-center justify-center">
              <Feather name="book-open" size={isTablet ? 20 : 18} color="#6B7280" />
            </View>
            <Text
              className={`font-fredoka-one text-[#4B5563] ${
                isTablet ? 'text-xl' : 'text-base'
              }`}
            >
              Classroom
            </Text>
          </View>
          <Feather
            name={classroomExpanded ? 'chevron-down' : 'chevron-right'}
            size={isTablet ? 24 : 20}
            color="#9CA3AF"
          />
        </Pressable>

        {classroomExpanded && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOutUp.duration(150)}
            className={`bg-[#F9FAFB] ${isTablet ? 'px-8 py-5' : 'px-5 py-4'}`}
          >
            {/* Goals */}
            <View className="border-b border-[#E5E7EB] pb-3 mb-3">
              <Text className="font-quicksand-bold text-[#484A4B] text-sm mb-2">
                Classroom Goals
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {goals && goals.length > 0 ? (
                  goals.map((goal, idx) => (
                    <View
                      key={idx}
                      className="bg-[#E1F0FF] border border-[#9ACBF9] rounded-full px-3 py-1"
                    >
                      <Text className="text-[#0284C7] font-quicksand-bold text-xs">
                        {goal}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text className="font-quicksand-medium text-[#9CA3AF] text-sm">
                    No goals selected
                  </Text>
                )}
              </View>
            </View>

            {/* Students */}
            <View className="flex-row items-center justify-between border-b border-[#E5E7EB] pb-3 mb-3">
              <Text className="font-quicksand-bold text-[#484A4B] text-sm">
                Total Students
              </Text>
              <Text className="font-fredoka-one text-[#62A9E6] text-base">
                {studentCount}
              </Text>
            </View>

            {/* Classes */}
            <View className="flex-row items-center justify-between">
              <Text className="font-quicksand-bold text-[#484A4B] text-sm">
                Total Classes
              </Text>
              <Text className="font-fredoka-one text-[#62A9E6] text-base">
                {classCount}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>

      {/* 3. ACCOUNT */}
      <View className="border-b border-[#F1F1F1]">
        <Pressable
          onPress={() => setAccountExpanded(!accountExpanded)}
          className={`flex-row items-center justify-between active:bg-[#F9FAFB] ${
            isTablet ? 'px-8 py-5' : 'px-5 py-4'
          }`}
        >
          <View className="flex-row items-center gap-3.5 flex-1">
            <View className="w-9 h-9 rounded-full bg-[#F5F7FA] items-center justify-center">
              <Feather name="shield" size={isTablet ? 20 : 18} color="#6B7280" />
            </View>
            <Text
              className={`font-fredoka-one text-[#4B5563] ${
                isTablet ? 'text-xl' : 'text-base'
              }`}
            >
              Account
            </Text>
          </View>
          <Feather
            name={accountExpanded ? 'chevron-down' : 'chevron-right'}
            size={isTablet ? 24 : 20}
            color="#9CA3AF"
          />
        </Pressable>

        {accountExpanded && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOutUp.duration(150)}
            className={`bg-[#F9FAFB] ${isTablet ? 'px-8 py-5' : 'px-5 py-4'}`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="font-quicksand-bold text-[#484A4B] text-sm">
                  Password Security
                </Text>
                <Text className="font-quicksand-medium text-[#9CA3AF] text-xs mt-0.5">
                  Update or reset your login password
                </Text>
              </View>
              <Pressable
                onPress={onChangePassword}
                className="bg-white border-[2px] border-[#BBE8FB] rounded-[8px] px-3 py-1.5 items-center justify-center active:scale-95 transition-transform"
                style={{
                  borderColor: '#BBE8FB',
                  shadowColor: '#BBE8FB',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                <Text className="font-fredoka-one text-[#62A9E6] text-xs">
                  CHANGE PASSWORD
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        )}
      </View>

      {/* 4. PRIVACY POLICY */}
      <View className="border-b border-[#F1F1F1]">
        <Pressable
          onPress={openPrivacyPolicy}
          className={`flex-row items-center justify-between active:bg-[#F9FAFB] ${
            isTablet ? 'px-8 py-5' : 'px-5 py-4'
          }`}
        >
          <View className="flex-row items-center gap-3.5 flex-1">
            <View className="w-9 h-9 rounded-full bg-[#F5F7FA] items-center justify-center">
              <Feather name="file-text" size={isTablet ? 20 : 18} color="#6B7280" />
            </View>
            <Text
              className={`font-fredoka-one text-[#4B5563] ${
                isTablet ? 'text-xl' : 'text-base'
              }`}
            >
              Privacy Policy
            </Text>
          </View>
          <Feather
            name="external-link"
            size={isTablet ? 22 : 18}
            color="#62A9E6"
          />
        </Pressable>
      </View>

      {/* 5. TERMS AND CONDITIONS */}
      <View>
        <Pressable
          onPress={openTerms}
          className={`flex-row items-center justify-between active:bg-[#F9FAFB] ${
            isTablet ? 'px-8 py-5' : 'px-5 py-4'
          }`}
        >
          <View className="flex-row items-center gap-3.5 flex-1">
            <View className="w-9 h-9 rounded-full bg-[#F5F7FA] items-center justify-center">
              <Feather name="file-text" size={isTablet ? 20 : 18} color="#6B7280" />
            </View>
            <Text
              className={`font-fredoka-one text-[#4B5563] ${
                isTablet ? 'text-xl' : 'text-base'
              }`}
            >
              Terms and Conditions
            </Text>
          </View>
          <Feather
            name="external-link"
            size={isTablet ? 22 : 18}
            color="#62A9E6"
          />
        </Pressable>
      </View>
    </View>
  );
}
