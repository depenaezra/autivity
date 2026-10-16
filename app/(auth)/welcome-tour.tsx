import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { markTourAsSeen } from '@/hooks/use-walkthrough';
import { HeaderButton } from '@/components/header-button';
import {
  TeacherClassDemo,
  TeacherLearnerCodeDemo,
  TeacherAssignActivityDemo,
  TeacherAnalyticsTutorialDemo,
  TeacherRangeFilterDemo,
  ParentLinkCodeDemo,
  ParentChildOverviewDemo,
  ParentMilestonesDemo,
  ParentFeedbackDemo,
} from '@/components/walkthrough/walkthrough-demos';

export default function WelcomeTourScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = (params.role as string) || 'teacher';
  const userId = params.userId as string | undefined;
  const isReplay = params.isReplay === 'true';

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [currentStep, setCurrentStep] = useState(0);

  // Teacher Tutorial Steps (Actionable & Educational)
  const teacherSteps = [
    {
      title: 'How to Create a Class',
      subtitle: 'Schedules, grades, and tactile color themes.',
      description:
        'Tap the dashed Add Class card to create a classroom, set the grade level (e.g. Kinder), and configure your weekly meeting schedule.',
      component: <TeacherClassDemo isTablet={isTablet} />,
      accentColor: '#179D33',
      accentBg: '#CBFAC4',
    },
    {
      title: 'Linking Parents with Learner Codes',
      subtitle: 'How student profiles connect to families.',
      description:
        'Every student receives an auto-generated Learner Code (e.g. # AUT-001). Share this with the parent—they enter it in their app to link their child.',
      component: <TeacherLearnerCodeDemo isTablet={isTablet} />,
      accentColor: '#62A9E6',
      accentBg: '#BBE8FB',
    },
    {
      title: 'How to Assign Activities',
      subtitle: 'Personalize learning tasks for each student.',
      description:
        'Select a student to open Assign Activities, choose a category like Counting or Tracing, and tap + Assign to customize their daily learning tasks.',
      component: <TeacherAssignActivityDemo isTablet={isTablet} />,
      accentColor: '#FF8870',
      accentBg: '#FFDBD4',
    },
    {
      title: 'How Analytics & Tiers Work',
      subtitle: 'Decoding Duration, Mistakes, and Hints.',
      description:
        'Tap any KPI card to inspect benchmark tiers: Independent (0-1 hints), Prompted (2-3 hints), or Supported (4+ hints) to gauge learner autonomy.',
      component: <TeacherAnalyticsTutorialDemo isTablet={isTablet} />,
      accentColor: '#FFAE02',
      accentBg: '#FFF3C4',
    },
    {
      title: 'Filtering Trends & Exporting Reports',
      subtitle: 'Time range controls and evaluation PDFs.',
      description:
        'Tap RANGE to filter by 7 days, 30 days, or overall history. Tap Download Analytics Report to export an official evaluation PDF.',
      component: <TeacherRangeFilterDemo isTablet={isTablet} />,
      accentColor: '#FF8870',
      accentBg: '#FFDBD4',
    },
  ];

  // Parent Tutorial Steps (Actionable & Educational)
  const parentSteps = [
    {
      title: 'How to Link Your Child',
      subtitle: 'Use the code from your child’s teacher.',
      description:
        'Enter your child’s 6-character Learner Code (e.g. AUT-0001) given by their teacher to link your account to their classroom.',
      component: <ParentLinkCodeDemo isTablet={isTablet} />,
      accentColor: '#62A9E6',
      accentBg: '#BBE8FB',
    },
    {
      title: 'Navigating Child Details & IEP Goals',
      subtitle: 'Classroom connection and learning goals.',
      description:
        'See your child’s enrolled class, teacher name, and tap IEP Goals to review personalized developmental targets.',
      component: <ParentChildOverviewDemo isTablet={isTablet} />,
      accentColor: '#179D33',
      accentBg: '#CBFAC4',
    },
    {
      title: 'How Milestone Progress Works',
      subtitle: 'Target Set, In Progress, and Completed.',
      description:
        'Milestones track developmental breakthroughs across motor, communication, and cognitive categories as tasks are completed.',
      component: <ParentMilestonesDemo isTablet={isTablet} />,
      accentColor: '#FF8870',
      accentBg: '#FFDBD4',
    },
    {
      title: 'Reading Feedback & Exporting Reports',
      subtitle: 'Teacher session notes and official PDF.',
      description:
        'Read daily feedback notes left by teachers after learning sessions, and tap Download All to save official progress documentation.',
      component: <ParentFeedbackDemo isTablet={isTablet} />,
      accentColor: '#FFAE02',
      accentBg: '#FFF3C4',
    },
  ];

  const steps = role === 'parent' ? parentSteps : teacherSteps;
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleFinish = async () => {
    if (userId) {
      await markTourAsSeen(userId);
    }
    if (isReplay) {
      router.back();
    } else {
      router.replace((role === 'parent' ? '/(parent-tabs)' : '/(teacher-tabs)') as any);
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else if (isReplay) {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]">
      {/* TOP HEADER */}
      <View className={`w-full flex-row items-center justify-between pt-3 pb-2 ${isTablet ? 'px-10' : 'px-6'}`}>
        {isReplay ? (
          <HeaderButton
            onPress={handleBack}
            icon={
              <View style={{ marginLeft: -3, marginTop: -1 }}>
                <Ionicons name="caret-back" size={isTablet ? 30 : 24} color="#62A9E6" />
              </View>
            }
          />
        ) : (
          <View style={{ width: 44 }} />
        )}

        {/* STEP PILL INDICATORS */}
        <View className="flex-row items-center gap-2">
          {steps.map((_, index) => {
            const isActive = index === currentStep;
            return (
              <View
                key={index}
                className="rounded-full transition-all"
                style={{
                  width: isActive ? 24 : 8,
                  height: 8,
                  backgroundColor: isActive ? currentStepData.accentColor : '#D9D9D9',
                }}
              />
            );
          })}
        </View>

        {/* SKIP BUTTON */}
        {!isReplay ? (
          <Pressable
            onPress={handleFinish}
            className="px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
          >
            <Text className={`font-fredoka-one text-[#9CA3AF] uppercase ${isTablet ? 'text-base' : 'text-xs'}`}>
              SKIP
            </Text>
          </Pressable>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {/* MAIN CONTENT AREA */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          paddingHorizontal: isTablet ? 48 : 24,
          paddingVertical: isTablet ? 32 : 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          key={currentStep}
          entering={FadeIn.duration(280)}
          exiting={FadeOut.duration(200)}
          className="flex-1 items-center justify-center w-full"
        >
          {/* STEP TITLES */}
          <View className="items-center mb-6 w-full">
            <View
              className="px-3 py-1 rounded-full mb-3"
              style={{ backgroundColor: currentStepData.accentBg }}
            >
              <Text
                className="font-fredoka-one text-xs uppercase"
                style={{ color: currentStepData.accentColor }}
              >
                STEP {currentStep + 1} OF {steps.length}
              </Text>
            </View>

            <Text
              className={`font-fredoka-one text-[#484A4B] text-center ${
                isTablet ? 'text-4xl mb-3' : 'text-2xl mb-2'
              }`}
            >
              {currentStepData.title}
            </Text>

            <Text
              className={`font-quicksand-bold text-[#6B7280] text-center mb-2 ${
                isTablet ? 'text-xl' : 'text-sm'
              }`}
            >
              {currentStepData.subtitle}
            </Text>

            <Text
              className={`font-quicksand-medium text-[#9CA3AF] text-center px-4 leading-5 ${
                isTablet ? 'text-lg max-w-xl' : 'text-xs'
              }`}
            >
              {currentStepData.description}
            </Text>
          </View>

          {/* 1:1 AUTHENTIC INTERACTIVE PREVIEW */}
          <View className={`w-full ${isTablet ? 'max-w-xl' : 'max-w-md'}`}>
            {currentStepData.component}
          </View>
        </Animated.View>

        {/* BOTTOM ACTION BUTTONS */}
        <View className="w-full pt-6 flex-row items-center gap-3">
          {currentStep > 0 && (
            <Pressable
              onPress={handleBack}
              className="flex-1 bg-white border-[2px] border-[#F1F1F1] rounded-xl items-center justify-center active:scale-95 transition-transform"
              style={[styles.neutralButton, { height: isTablet ? 64 : 52 }]}
            >
              <Text
                className={`font-fredoka-one text-[#9CA3AF] uppercase ${
                  isTablet ? 'text-xl' : 'text-base'
                }`}
              >
                BACK
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleNext}
            className="flex-1 bg-white border-[2px] rounded-xl items-center justify-center active:scale-95 transition-transform"
            style={[
              styles.primaryButton,
              {
                height: isTablet ? 64 : 52,
                borderColor: currentStepData.accentBg,
                shadowColor: currentStepData.accentBg,
              },
            ]}
          >
            <Text
              className={`font-fredoka-one uppercase ${
                isTablet ? 'text-xl' : 'text-base'
              }`}
              style={{ color: currentStepData.accentColor }}
            >
              {isLastStep ? 'GET STARTED' : 'NEXT'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  neutralButton: {
    shadowColor: '#F1F1F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  primaryButton: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
});
