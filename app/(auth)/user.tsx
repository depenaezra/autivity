import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  Text,
  View,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function User() {
  // Tracks which card is selected: 'parent', 'teacher', or null (none)
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const router = useRouter();

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]">

      {/* Top Navigation / Back Button */}
      <View className={`w-full pt-4 pb-2 ${isTablet ? 'px-8' : 'px-6'}`}>
        <Pressable onPress={() => router.back()} className="w-10 h-10 justify-center">
          <Feather name="arrow-left" size={isTablet ? 32 : 24} color="#4B5563" />
        </Pressable>
      </View>

      {/* main container */}
      <View className={`flex-1 flex-col items-center w-full ${isTablet ? 'px-[94px] pb-[78px]' : 'px-6 pb-8'}`}>
        {/* Title */}
        <Text className={`font-fredoka-one text-[#4B5563] text-center ${isTablet ? 'text-5xl mb-10' : 'text-3xl mb-6'}`}>
          Who are you?
        </Text>

        {/* cards */}
        <View className={`w-full flex-col flex-1 ${isTablet ? 'gap-6' : 'gap-4'}`}>
          {/* PARENT CARD */}
          <Pressable
            // ADDED TOGGLE: Checks if currently 'parent'. If yes, sets to null (unclicked). If no, sets to 'parent'.
            onPress={() => setSelectedRole(selectedRole === 'parent' ? null : 'parent')}

            // SHADOW: border-[3px] generally, but border-b-[7px] when selected to show the drop shadow
            className={`w-full rounded-[32px] items-center justify-center border-[3px] ${
              isTablet ? 'p-8' : 'p-5'
            } ${selectedRole === 'parent'
              ? 'bg-[#EBF5FF] border-[#62A9E6] border-b-[7px]' // Active State: Blue background and blue shadow
              : 'bg-white border-[#E5E7EB]' // Inactive State: Thin gray border
              }`}
          >
            {/* Image and Text components remain exactly the same inside */}
            <Image
              source={require('../../assets/images/polar-bear.png')}
              className={isTablet ? 'w-32 h-32 mb-4' : 'w-20 h-20 mb-3'}
              resizeMode="contain"
            />
            <Text className={`font-fredoka-one ${isTablet ? 'text-4xl mb-3' : 'text-2xl mb-2'} ${selectedRole === 'parent' ? 'text-[#62A9E6]' : 'text-[#4B5563]'
              }`}>
              Parent
            </Text>
            <Text className={`font-quicksand-medium text-center ${isTablet ? 'text-lg leading-7' : 'text-sm leading-5'} ${selectedRole === 'parent' ? 'text-[#7CB7EC]' : 'text-[#6B7280]'
              }`}>
              Monitor your child's progress and achievements as they go on their journey.
            </Text>
          </Pressable>

          {/* TEACHER CARD */}
          <Pressable
            // ADDED TOGGLE: Same unclick logic as parent card
            onPress={() => setSelectedRole(selectedRole === 'teacher' ? null : 'teacher')}

            // SHADOW: Same conditional thick bottom border logic
            className={`w-full rounded-[32px] items-center justify-center border-[3px] ${
              isTablet ? 'p-8' : 'p-5'
            } ${selectedRole === 'teacher'
              ? 'bg-[#EBF5FF] border-[#62A9E6] border-b-[7px]'
              : 'bg-white border-[#E5E7EB]'
              }`}
          >
            {/* Image and Text components remain exactly the same inside */}
            <Image
              source={require('../../assets/images/bear.png')}
              className={isTablet ? 'w-32 h-32 mb-4' : 'w-20 h-20 mb-3'}
              resizeMode="contain"
            />
            <Text className={`font-fredoka-one ${isTablet ? 'text-4xl mb-3' : 'text-2xl mb-2'} ${selectedRole === 'teacher' ? 'text-[#62A9E6]' : 'text-[#4B5563]'
              }`}>
              Teacher
            </Text>
            <Text className={`font-quicksand-medium text-center ${isTablet ? 'text-lg leading-7' : 'text-sm leading-5'} ${selectedRole === 'teacher' ? 'text-[#7CB7EC]' : 'text-[#6B7280]'
              }`}>
              Manage classroom activities and learner profiles.
            </Text>
          </Pressable>

        </View>

        {/* CONTINUE BUTTON */}
        <View className="w-full mt-auto">
          <Pressable
            disabled={!selectedRole}

            // CONDITIONAL ROUTING: Directs to onboarding screen with selected role as param
            onPress={() => {
              if (selectedRole) {
                router.push({
                  pathname: '/(auth)/onboarding',
                  params: { role: selectedRole }
                });
              }
            }}

            className={`w-full flex items-center justify-center border-b-[4px] p-[10px] ${
              isTablet ? 'h-[84px] rounded-[55px]' : 'h-[60px] rounded-full'
            } ${selectedRole
                ? 'bg-[#62A9E6] border-[#5298D4]'
                : 'bg-[#D1D5DB] border-[#9CA3AF]'
              }`}
          >
            <Text className={`text-white font-fredoka-regular ${isTablet ? 'text-2xl' : 'text-lg'}`}>
              Continue
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}