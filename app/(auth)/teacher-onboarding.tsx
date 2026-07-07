import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function TeacherOnboarding() {
  const router = useRouter();

  // Tracks multiple selected goals in an array
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // List of all available goals to map through
  const goals = [
    'Classroom-ready activities',
    'Monitor student progress',
    'Create personalized lessons',
    'Manage classes',
    'Reports and assessments'
  ];

  // Function to handle the multi-select toggle
  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      // If already selected, filter it out of the array
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      // If not selected, add it to the array
      setSelectedGoals([...selectedGoals, goal]);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]">
      {/* Top Navigation / Back Button */}
      <View className="w-full px-8 pt-4 pb-2">
        <Pressable onPress={() => router.back()} className="w-10 h-10 justify-center">
          <Feather name="arrow-left" size={32} color="#4B5563" />
        </Pressable>
      </View>

      {/* Main Container */}
      <View className="flex-1 flex-col items-center w-full px-[94px] pb-[78px]">
        {/* Title Container */}
        <View className="items-center mb-10 w-full">
          <Text className="text-5xl font-extrabold text-[#4B5563] text-center mb-4">
            What would you like to focus on?
          </Text>
          {/* Added Subtitle */}
          <Text className="text-2xl text-[#6B7280] text-center">
            Choose one or more goals
          </Text>
        </View>

        {/* Goals List */}
        <View className="w-full flex-col gap-4 flex-1">
          {goals.map((goal) => {
            // Check if this specific goal exists in our selected array
            const isActive = selectedGoals.includes(goal);

            return (
              <Pressable
                key={goal}
                onPress={() => toggleGoal(goal)}
                // Pill-shaped button (rounded-[55px]). 
                // Using justify-center and items-start with px-10 to left-align the text just like your Figma file.
                className={`w-full h-[76px] rounded-[55px] flex justify-center px-10 border-[2px] border-b-[5px] ${isActive
                  ? 'bg-[#EBF5FF] border-[#62A9E6]'
                  : 'bg-white border-[#E5E7EB] border-b-[#D1D5DB]'
                  }`}
              >
                <Text className={`text-2xl font-medium ${isActive ? 'text-[#62A9E6]' : 'text-[#6B7280]'
                  }`}>
                  {goal}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* CONTINUE BUTTON */}
        <View className="w-full mt-auto">
          <Pressable
            // Disable if the array is empty (length is 0)
            disabled={selectedGoals.length === 0}

            onPress={() => {
              // Route to whatever your next onboarding screen is!
              router.push('/(auth)/signup');
            }}

            className={`w-full h-[84px] rounded-[55px] flex items-center justify-center border-b-[4px] p-[10px] ${selectedGoals.length > 0
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