import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function User() {
  // Tracks which card is selected: 'parent', 'teacher', or null (none)
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]">

      {/* Top Navigation / Back Button */}
      <View className="w-full px-8 pt-4 pb-2">
        <Pressable onPress={() => router.back()} className="w-10 h-10 justify-center">
          <Feather name="arrow-left" size={32} color="#4B5563" />
        </Pressable>
      </View>

      {/* main container */}
      <View className="flex-1 flex-col items-center w-full px-[94px] pb-[78px]">
        {/* Title */}
        <Text className="text-5xl font-extrabold text-[#4B5563] text-center mb-10">
          Who are you?
        </Text>

        {/* cards */}
        <View className="w-full flex-col gap-6 flex-1">
          {/* PARENT CARD */}
          <Pressable
            // ADDED TOGGLE: Checks if currently 'parent'. If yes, sets to null (unclicked). If no, sets to 'parent'.
            onPress={() => setSelectedRole(selectedRole === 'parent' ? null : 'parent')}

            // ADDED SHADOW: border-[3px] with a border-b-[7px] creates exactly a 4px solid drop shadow.
            className={`w-full rounded-[32px] p-8 items-center justify-center border-[3px] border-b-[7px] ${selectedRole === 'parent'
              ? 'bg-[#EBF5FF] border-[#62A9E6]' // Active State: Blue background and blue shadow
              : 'bg-white border-[#E5E7EB] border-b-[#D1D5DB]' // Inactive State: Maintains 7px border so the card doesn't jump, but makes it gray
              }`}
          >
            {/* Image and Text components remain exactly the same inside */}
            <Image
              source={require('../../assets/images/polar-bear.png')}
              className="w-32 h-32 mb-4"
              resizeMode="contain"
            />
            <Text className={`text-4xl font-extrabold mb-3 ${selectedRole === 'parent' ? 'text-[#62A9E6]' : 'text-[#4B5563]'
              }`}>
              Parent
            </Text>
            <Text className={`text-lg text-center leading-7 ${selectedRole === 'parent' ? 'text-[#7CB7EC]' : 'text-[#6B7280]'
              }`}>
              Monitor your child's progress and achievements as they go on their journey.
            </Text>
          </Pressable>

          {/* TEACHER CARD */}
          <Pressable
            // ADDED TOGGLE: Same unclick logic as parent card
            onPress={() => setSelectedRole(selectedRole === 'teacher' ? null : 'teacher')}

            // ADDED SHADOW: Same 7px bottom border trick for the 4px solid drop shadow
            className={`w-full rounded-[32px] p-8 items-center justify-center border-[3px] border-b-[7px] ${selectedRole === 'teacher'
              ? 'bg-[#EBF5FF] border-[#62A9E6]'
              : 'bg-white border-[#E5E7EB] border-b-[#D1D5DB]'
              }`}
          >
            {/* Image and Text components remain exactly the same inside */}
            <Image
              source={require('../../assets/images/bear.png')}
              className="w-32 h-32 mb-4"
              resizeMode="contain"
            />
            <Text className={`text-4xl font-extrabold mb-3 ${selectedRole === 'teacher' ? 'text-[#62A9E6]' : 'text-[#4B5563]'
              }`}>
              Teacher
            </Text>
            <Text className={`text-lg text-center leading-7 ${selectedRole === 'teacher' ? 'text-[#7CB7EC]' : 'text-[#6B7280]'
              }`}>
              Manage classroom activities and learner profiles.
            </Text>
          </Pressable>

        </View>

        {/* CONTINUE BUTTON */}
        <View className="w-full mt-auto">
          <Pressable
            disabled={!selectedRole}

            // ADDED CONDITIONAL ROUTING: Checks the state to determine which file to push
            onPress={() => {
              if (selectedRole === 'teacher') {
                router.push('/(auth)/teacher-onboarding');
              } else if (selectedRole === 'parent') {
                router.push('/(auth)/signup');
              }
            }}

            className={`w-full h-[84px] rounded-[55px] flex items-center justify-center border-b-[4px] p-[10px] ${selectedRole
                ? 'bg-[#62A9E6] border-[#5298D4]'
                : 'bg-[#D1D5DB] border-[#9CA3AF]'
              }`}
          >
            <Text className="text-white text-2xl font-semibold">
              Continue
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}