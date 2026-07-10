import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  Text,
  View,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function TeacherOnboarding() {
  const router = useRouter();

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const goals = [
    'Classroom-ready activities',
    'Monitor student progress',
    'Create personalized lessons',
    'Manage classes',
    'Reports and assessments'
  ];

  // multiselect toggle for goals
  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      // if already selected, filter it out of the array
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      // if not selected, add it to the array
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]">
      {/* Top Navigation / Back Button */}
      <View className={`w-full pt-4 pb-2 ${isTablet ? 'px-8' : 'px-6'}`}>
        <Pressable onPress={() => router.back()} className="w-10 h-10 justify-center">
          <Feather name="arrow-left" size={isTablet ? 32 : 24} color="#4B5563" />
        </Pressable>
      </View>

      {/* Main Container */}
      <View
        className={`flex-1 flex-col items-center w-full ${isTablet ? 'px-[94px] pb-[78px]' : 'px-6 pb-8'
          }`}
      >
        {/* Title Container */}
        <View className="items-center mb-10 w-full">
          <Text
            className={`font-fredoka-one text-[#4B5563] text-center ${isTablet ? 'text-5xl mb-4' : 'text-3xl mb-2'
              }`}
          >
            What would you like to focus on?
          </Text>
          {/* Added Subtitle */}
          <Text className={`font-quicksand-medium text-[#6B7280] text-center ${isTablet ? 'text-2xl' : 'text-lg'}`}>
            Choose one or more goals
          </Text>
        </View>

        {/* Goals List */}
        <View className={`w-full flex-col flex-1 ${isTablet ? 'gap-4' : 'gap-3'}`}>
          {goals.map((goal) => {
            const isActive = selectedGoals.includes(goal);

            return (
              <Pressable
                key={goal}
                onPress={() => toggleGoal(goal)}
                className={`w-full flex justify-center ${isTablet
                  ? 'h-[76px] rounded-[55px] px-10 border-[2px] border-b-[5px]'
                  : 'h-[60px] rounded-full px-6 border-2 border-b-[4px]'
                  } ${isActive
                    ? 'bg-[#EBF5FF] border-[#62A9E6]'
                    : 'bg-white border-[#E5E7EB] border-b-[#D1D5DB]'
                  }`}
              >
                <Text
                  className={`font-quicksand-medium ${isTablet ? 'text-2xl' : 'text-lg'} ${isActive ? 'text-[#62A9E6]' : 'text-[#6B7280]'
                    }`}
                >
                  {goal}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* CONTINUE BUTTON */}
        <View className="w-full mt-auto">
          <Pressable
            disabled={selectedGoals.length === 0}
            onPress={() => {
              router.push('/(auth)/signup');
            }}
            className={`w-full flex items-center justify-center border-b-[4px] p-[10px] ${isTablet ? 'h-[84px] rounded-[55px]' : 'h-[60px] rounded-full'
              } ${selectedGoals.length > 0
                ? 'bg-[#62A9E6] border-[#5298D4]'
                : 'bg-[#D1D5DB] border-[#9CA3AF]'
              }`}
          >
            <Text className={`text-white font-quicksand-medium ${isTablet ? 'text-2xl' : 'text-lg'}`}>
              Continue
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}