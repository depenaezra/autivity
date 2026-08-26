import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, Text, TextInput, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

interface ParentProfileMenuSectionProps {
  isTablet?: boolean;
  // Personal Info state
  firstName: string;
  lastName: string;
  email: string;
  isEditing: boolean;
  setFirstName: (val: string) => void;
  setLastName: (val: string) => void;
  setEmail: (val: string) => void;
  onSaveProfile: () => void;
  onCancelEdit: () => void;
  // Child / Learner details state
  linkedStudent?: any;
  relinkCode: string;
  setRelinkCode: (val: string) => void;
  isLinking: boolean;
  onLinkChild: () => void;
  // Account action
  onChangePassword: () => void;
}

export function ParentProfileMenuSection({
  isTablet = false,
  firstName,
  lastName,
  email,
  isEditing,
  setFirstName,
  setLastName,
  setEmail,
  onSaveProfile,
  onCancelEdit,
  linkedStudent,
  relinkCode,
  setRelinkCode,
  isLinking,
  onLinkChild,
  onChangePassword,
}: ParentProfileMenuSectionProps) {
  // Accordion expanded states (default Personal Info open when editing)
  const [personalExpanded, setPersonalExpanded] = useState(true);
  const [learnerExpanded, setLearnerExpanded] = useState(true);
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
      className={`w-full bg-white ${isTablet ? 'rounded-[32px]' : 'rounded-[24px]'
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
          className={`flex-row items-center justify-between active:bg-[#F9FAFB] ${isTablet ? 'px-8 py-5' : 'px-5 py-4'
            }`}
        >
          <View className="flex-row items-center gap-3.5 flex-1">
            <View className="w-9 h-9 rounded-full bg-[#F5F7FA] items-center justify-center">
              <Feather name="user" size={isTablet ? 20 : 18} color="#6B7280" />
            </View>
            <Text
              className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-xl' : 'text-base'
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
            {/* Full Name */}
            <View className="flex-row items-center justify-between border-b border-[#E5E7EB] pb-3 mb-3">
              <Text
                className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'w-[140px] text-base' : 'w-[100px] text-sm'
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
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 bg-[#F1F1F1] rounded-xl px-3.5 py-2 font-quicksand-medium text-sm text-[#4B5563]"
                  />
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last Name"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 bg-[#F1F1F1] rounded-xl px-3.5 py-2 font-quicksand-medium text-sm text-[#4B5563]"
                  />
                </View>
              ) : (
                <Text
                  className={`font-quicksand-medium flex-1 text-[#9CA3AF] ${isTablet ? 'text-base' : 'text-sm'
                    }`}
                >
                  {`${firstName} ${lastName}`.trim() || 'Not specified'}
                </Text>
              )}
            </View>

            {/* Email */}
            <View className="flex-row items-center justify-between">
              <Text
                className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'w-[140px] text-base' : 'w-[100px] text-sm'
                  }`}
              >
                Email
              </Text>
              {isEditing ? (
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email Address"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 bg-[#F1F1F1] rounded-xl px-3.5 py-2 font-quicksand-medium text-sm text-[#4B5563]"
                />
              ) : (
                <Text
                  className={`font-quicksand-medium flex-1 text-[#9CA3AF] ${isTablet ? 'text-base' : 'text-sm'
                    }`}
                  numberOfLines={1}
                >
                  {email || 'Not specified'}
                </Text>
              )}
            </View>

            {/* Save / Cancel Action Buttons when Editing */}
            {isEditing && (
              <View className="flex-row justify-end mt-4 gap-3 pt-3 border-t border-[#E5E7EB]">
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

      {/* 2. LEARNER DETAILS */}
      <View className="border-b border-[#F1F1F1]">
        <Pressable
          onPress={() => setLearnerExpanded(!learnerExpanded)}
          className={`flex-row items-center justify-between active:bg-[#F9FAFB] ${isTablet ? 'px-8 py-5' : 'px-5 py-4'
            }`}
        >
          <View className="flex-row items-center gap-3.5 flex-1">
            <View className="w-9 h-9 rounded-full bg-[#F5F7FA] items-center justify-center">
              <Feather name="heart" size={isTablet ? 20 : 18} color="#6B7280" />
            </View>
            <Text
              className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-xl' : 'text-base'
                }`}
            >
              Learner details
            </Text>
          </View>
          <Feather
            name={learnerExpanded ? 'chevron-down' : 'chevron-right'}
            size={isTablet ? 24 : 20}
            color="#9CA3AF"
          />
        </Pressable>

        {learnerExpanded && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOutUp.duration(150)}
            className={`bg-[#F9FAFB] ${isTablet ? 'px-8 py-5' : 'px-5 py-4'}`}
          >
            {linkedStudent ? (
              <View className="flex-col">
                {/* Child's Name */}
                <View className="flex-row items-center justify-between border-b border-[#E5E7EB] pb-3 mb-3">
                  <Text
                    className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'w-[140px] text-base' : 'w-[100px] text-sm'
                      }`}
                  >
                    Child's Name
                  </Text>
                  <Text
                    className={`font-quicksand-medium flex-1 text-[#9CA3AF] ${isTablet ? 'text-base' : 'text-sm'
                      }`}
                  >
                    {linkedStudent.name}
                  </Text>
                </View>

                {/* Learner Code */}
                {linkedStudent.learner_code && (
                  <View className="flex-row items-center justify-between border-b border-[#E5E7EB] pb-3 mb-3">
                    <Text
                      className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'w-[140px] text-base' : 'w-[100px] text-sm'
                        }`}
                    >
                      Learner Code
                    </Text>
                    <View className="flex-1 flex-row items-center">
                      <View className="bg-[#BBE8FB] px-3 py-1 rounded-[6px] justify-center items-center">
                        <Text className="font-fredoka-one text-[#62A9E6] uppercase text-xs sm:text-sm">
                          # {linkedStudent.learner_code}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Classroom */}
                {linkedStudent.classes?.title && (
                  <View className="flex-row items-center justify-between border-b border-[#E5E7EB] pb-3 mb-3">
                    <Text
                      className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'w-[140px] text-base' : 'w-[100px] text-sm'
                        }`}
                    >
                      Classroom
                    </Text>
                    <Text
                      className={`font-quicksand-medium flex-1 text-[#9CA3AF] ${isTablet ? 'text-base' : 'text-sm'
                        }`}
                    >
                      {linkedStudent.classes.title}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-2xl p-4 items-center mb-3">
                <Text className="font-fredoka-one text-sm text-[#4B5563] text-center">
                  No Learner Linked Yet
                </Text>
                <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-1 text-center">
                  Enter the unique learner code provided by your child's teacher.
                </Text>
              </View>
            )}

            {/* Re-link / Update Learner Code Input */}
            <View className="mt-1 pt-2 flex-col gap-2">
              <Text className="font-quicksand-bold text-[#484A4B] text-sm mb-1">
                {linkedStudent ? 'Update or Re-link Learner Code' : 'Enter Learner Code'}
              </Text>
              <View className="flex-row items-center gap-2">
                <TextInput
                  value={relinkCode}
                  onChangeText={setRelinkCode}
                  placeholder="AUT-1234"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                  className="flex-1 bg-[#F1F1F1] rounded-xl px-4 py-3 font-quicksand-medium text-sm text-[#4B5563]"
                />
                <Pressable
                  onPress={onLinkChild}
                  disabled={isLinking || !relinkCode.trim()}
                  className={`bg-white border-[2px] border-[#BBE8FB] rounded-[8px] px-4 py-2 items-center justify-center active:scale-95 transition-transform ${isLinking || !relinkCode.trim() ? 'opacity-40' : 'opacity-100'
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
                  {isLinking ? (
                    <ActivityIndicator size="small" color="#62A9E6" />
                  ) : (
                    <Text className="font-fredoka-one text-[#62A9E6] text-xs uppercase">
                      LINK
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          </Animated.View>
        )}
      </View>

      {/* 3. ACCOUNT */}
      <View className="border-b border-[#F1F1F1]">
        <Pressable
          onPress={() => setAccountExpanded(!accountExpanded)}
          className={`flex-row items-center justify-between active:bg-[#F9FAFB] ${isTablet ? 'px-8 py-5' : 'px-5 py-4'
            }`}
        >
          <View className="flex-row items-center gap-3.5 flex-1">
            <View className="w-9 h-9 rounded-full bg-[#F5F7FA] items-center justify-center">
              <Feather name="shield" size={isTablet ? 20 : 18} color="#6B7280" />
            </View>
            <Text
              className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-xl' : 'text-base'
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
                  CHANGE
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
          className={`flex-row items-center justify-between active:bg-[#F9FAFB] ${isTablet ? 'px-8 py-5' : 'px-5 py-4'
            }`}
        >
          <View className="flex-row items-center gap-3.5 flex-1">
            <View className="w-9 h-9 rounded-full bg-[#F5F7FA] items-center justify-center">
              <Feather name="file-text" size={isTablet ? 20 : 18} color="#6B7280" />
            </View>
            <Text
              className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-xl' : 'text-base'
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
          className={`flex-row items-center justify-between active:bg-[#F9FAFB] ${isTablet ? 'px-8 py-5' : 'px-5 py-4'
            }`}
        >
          <View className="flex-row items-center gap-3.5 flex-1">
            <View className="w-9 h-9 rounded-full bg-[#F5F7FA] items-center justify-center">
              <Feather name="file-text" size={isTablet ? 20 : 18} color="#6B7280" />
            </View>
            <Text
              className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-xl' : 'text-base'
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
