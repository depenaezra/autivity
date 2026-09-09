import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  BackHandler,
  Pressable,
  Text,
  View,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderButton } from "../../components/header-button";

export default function Onboarding() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)');
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (!router.canGoBack()) {
          router.replace('/(auth)');
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [router])
  );
  const params = useLocalSearchParams();
  const role = (params.role as string) || 'teacher';

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // keeps track of selected goals
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // list of goals customized based on role (parent or teacher)
  const goals = role === 'parent'
    ? [
      "Monitor child's progress",
      'Personalized learning games',
      'Track milestones & achievements',
      'Receive performance feedbacks',
      'Understand areas for improvement'
    ]
    : [
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

  // UI
  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]">

      {/* back btn */}
      <View className={`w-full pt-4 pb-2 ${isTablet ? 'px-8' : 'px-6'}`}>
        <HeaderButton
          onPress={handleBack}
          icon={
            <View style={{ marginLeft: -3, marginTop: -1 }}>
              <Ionicons name="caret-back" size={isTablet ? 30 : 24} color="#62A9E6" />
            </View>
          }
        />
      </View>

      {/* main container */}
      <View
        className={`flex-1 flex-col items-center w-full ${
          isTablet ? 'px-[94px] pt-12 pb-[78px]' : 'px-6 pt-8 pb-8'
        }`}
      >

        {/* title */}
        <View className="items-center mb-8 w-full">
          <Text
            className={`font-fredoka-one text-[#4B5563] text-center ${isTablet ? 'text-5xl mb-4' : 'text-3xl mb-2'
              }`}
          >
            What would you like to focus on?
          </Text>

          {/* subtitle */}
          <Text className={`font-quicksand-medium text-[#6B7280] text-center ${isTablet ? 'text-2xl' : 'text-lg'}`}>
            Choose one or more goals
          </Text>
        </View>

        {/* goals list */}
        <View className={`w-full flex-col flex-1 ${isTablet ? 'gap-4' : 'gap-3'}`}>
          {goals.map((goal) => {
            const isActive = selectedGoals.includes(goal);

            // returns a pressable button for each goal
            return (
              <Pressable
                key={goal}
                onPress={() => toggleGoal(goal)}
                className={`w-full flex justify-center active:scale-95 transition-transform border-[2px] ${
                  isTablet ? 'h-[76px] rounded-xl px-8' : 'h-[60px] rounded-xl px-6'
                }`}
                style={{
                  backgroundColor: isActive ? '#EBF5FF' : '#FFFFFF',
                  borderColor: isActive ? '#62A9E6' : '#F1F1F1',
                  shadowColor: isActive ? '#62A9E6' : '#F1F1F1',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                <Text
                  className={`font-quicksand-medium ${isTablet ? 'text-2xl' : 'text-lg'}`}
                  style={{
                    color: isActive ? '#62A9E6' : '#4B5563',
                  }}
                >
                  {/* display the goal from goals array */}
                  {goal}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* continue btn */}
        <View className="w-full mt-auto pt-4">
          <Pressable
            disabled={selectedGoals.length === 0}
            onPress={() => {
              router.push({
                pathname: '/(auth)/signup',
                params: {
                  goals: JSON.stringify(selectedGoals),
                  role: role
                }
              });
            }}
            className="w-full bg-white border-[2px] rounded-xl items-center justify-center active:scale-95 transition-transform"
            style={{
              height: isTablet ? 76 : 60,
              borderColor: selectedGoals.length > 0 ? '#BBE8FB' : '#F1F1F1',
              shadowColor: selectedGoals.length > 0 ? '#BBE8FB' : '#F1F1F1',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
              opacity: selectedGoals.length > 0 ? 1 : 0.6,
            }}
          >
            <Text
              className={`font-fredoka-one uppercase ${
                isTablet ? 'text-2xl' : 'text-lg'
              }`}
              style={{
                color: selectedGoals.length > 0 ? '#62A9E6' : '#D9D9D9',
              }}
            >
              CONTINUE
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}