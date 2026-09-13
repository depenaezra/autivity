import React, { useEffect, useRef, useState } from 'react';
import { Image, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { DraxProvider, DraxView } from 'react-native-drax';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playCorrectSound } from '@/src/utils/sound';
import { speakInstruction } from '@/src/utils/speech';
import { SequencingActivityProps, SequencingRoutine, SequencingStep } from '../types';
import { getSequencingAsset } from '../utils/assetDictionary';

interface PlacedStep {
  slotIndex: number;
  step: SequencingStep;
}

export default function SequencingActivity({
  contentData,
  onComplete,
  onFeedback,
  onIncorrectAttempt,
  hintSignal,
}: SequencingActivityProps) {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;

  const [currentRoutine, setCurrentRoutine] = useState<SequencingRoutine | null>(null);
  const [shuffledCards, setShuffledCards] = useState<SequencingStep[]>([]);
  const [placedSlots, setPlacedSlots] = useState<(SequencingStep | null)[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const mistakesRef = useRef(0);
  const startTimeRef = useRef<number>(Date.now());
  const hintsUsedCountRef = useRef(0);

  // Animations
  const shakeOffset = useSharedValue(0);
  const animatedBoardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }],
  }));

  const initializeGame = () => {
    const routines = contentData?.routines || [];
    if (routines.length === 0) return;

    // Pick a random routine from the activity's routine pool
    const selectedRoutine = routines[Math.floor(Math.random() * routines.length)];
    setCurrentRoutine(selectedRoutine);

    const stepCount = contentData?.step_count || selectedRoutine.steps.length;
    
    // Initialize empty target slots (1..N)
    setPlacedSlots(new Array(stepCount).fill(null));

    // Shuffle the steps for dragging
    const shuffled = [...selectedRoutine.steps].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);

    setIsCompleted(false);
    mistakesRef.current = 0;
    startTimeRef.current = Date.now();
    hintsUsedCountRef.current = 0;

    const msg = contentData?.instruction || `Drag the pictures into order from 1 to ${stepCount}!`;
    onFeedback?.(msg);
  };

  useEffect(() => {
    initializeGame();
  }, [JSON.stringify(contentData)]);

  // Hint signal support
  useEffect(() => {
    if (hintSignal && hintSignal > 0 && !isCompleted && currentRoutine) {
      hintsUsedCountRef.current += 1;

      // Find first empty slot
      const firstEmptyIndex = placedSlots.findIndex((s) => s === null);
      if (firstEmptyIndex !== -1) {
        const correctTargetStepNumber = firstEmptyIndex + 1;
        const correctStep = currentRoutine.steps.find((s) => s.step_number === correctTargetStepNumber);
        if (correctStep) {
          const hintMsg = `Hint: Step ${correctTargetStepNumber} is "${correctStep.label}"!`;
          onFeedback?.(hintMsg);
          speakInstruction(hintMsg);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
    }
  }, [hintSignal]);

  const triggerIncorrectFeedback = () => {
    mistakesRef.current += 1;
    onIncorrectAttempt?.();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    shakeOffset.value = withSequence(
      withTiming(-12, { duration: 50 }),
      withTiming(12, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );

    onFeedback?.('Not quite in order! Try placing that step in a different position.');
  };

  const handleDropOnSlot = (slotIndex: number, draggedStep: SequencingStep) => {
    const expectedStepNumber = slotIndex + 1;

    // Check if the dropped step matches the expected step position
    if (draggedStep.step_number === expectedStepNumber) {
      // Correct drop
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const newSlots = [...placedSlots];
      newSlots[slotIndex] = draggedStep;
      setPlacedSlots(newSlots);

      // Remove card from available shuffled pool
      setShuffledCards((prev) => prev.filter((item) => item.id !== draggedStep.id));

      onFeedback?.(`Great job! Step ${expectedStepNumber} is correct!`);

      // Check if all slots are now filled
      const allFilled = newSlots.every((s) => s !== null);
      if (allFilled) {
        setIsCompleted(true);
        playCorrectSound();
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        const finalScore = 15; // 15 stars standard payout

        setTimeout(() => {
          onComplete(finalScore, timeSpent, mistakesRef.current, hintsUsedCountRef.current);
        }, 1200);
      }
    } else {
      // Incorrect drop position
      triggerIncorrectFeedback();
    }
  };

  // Allow removing a placed card back to pool if needed
  const handleRemoveFromSlot = (slotIndex: number) => {
    const stepToRemove = placedSlots[slotIndex];
    if (!stepToRemove || isCompleted) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSlots = [...placedSlots];
    newSlots[slotIndex] = null;
    setPlacedSlots(newSlots);

    setShuffledCards((prev) => [...prev, stepToRemove]);
  };

  const stepCount = placedSlots.length || 3;

  return (
    <DraxProvider style={{ flex: 1 }}>
      <View className="flex-1 bg-[#F8FAFC] items-center justify-between p-4">
        {/* TOP: Title */}
        <View className="w-full items-center mb-2">
          <Text className="font-fredoka-one text-[#535B74] text-xl md:text-2xl text-center">
            {currentRoutine?.title || 'Sequence the Activity'}
          </Text>
        </View>

        {/* MIDDLE: TARGET DROP SLOTS (1..N) */}
        <Animated.View
          style={[animatedBoardStyle]}
          className="w-full flex-row justify-center items-center gap-3 md:gap-6 my-auto"
        >
          {placedSlots.map((placedStep, idx) => {
            const stepNum = idx + 1;
            return (
              <DraxView
                key={`slot-${idx}`}
                style={{
                  width: isTablet ? 140 : 100,
                  height: isTablet ? 160 : 115,
                  borderRadius: isTablet ? 24 : 18,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: placedStep ? '#22C55E' : '#CBD5E1',
                  backgroundColor: placedStep ? '#DCFCE7' : '#FFFFFF',
                }}
                className="flex-col items-center justify-between p-2.5"
                receivingStyle={{ opacity: 0.7, transform: [{ scale: 1.04 }] }}
                onReceiveDragDrop={({ dragged: { payload } }) => {
                  if (payload && !placedStep) {
                    handleDropOnSlot(idx, payload as SequencingStep);
                  }
                }}
              >
                {/* Slot Badge Number */}
                <View className={`w-7 h-7 rounded-full items-center justify-center self-start ${placedStep ? 'bg-[#22C55E]' : 'bg-[#EAB308]'}`}>
                  <Text className="font-fredoka-one text-white text-xs md:text-sm">
                    {stepNum}
                  </Text>
                </View>

                {placedStep ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleRemoveFromSlot(idx)}
                    className="w-full flex-1 items-center justify-center p-1"
                  >
                    <Image
                      source={getSequencingAsset(placedStep.asset_key)}
                      style={{
                        width: isTablet ? 95 : 68,
                        height: isTablet ? 95 : 68,
                        borderRadius: isTablet ? 14 : 10,
                      }}
                      resizeMode="contain"
                    />
                    <Text
                      numberOfLines={1}
                      className="font-quicksand-bold text-[#1E293B] text-xs text-center mt-1"
                    >
                      {placedStep.label}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View className="absolute inset-0 items-center justify-center">
                    <Text className="font-fredoka-one text-[#94A3B8] text-base md:text-xl text-center">
                      Step {stepNum}
                    </Text>
                  </View>
                )}
              </DraxView>
            );
          })}
        </Animated.View>

        {/* BOTTOM: SHUFFLED CARDS ROW (NO CONTAINER BOX) */}
        <View className="w-full flex-row flex-wrap justify-center items-center gap-3 md:gap-6 my-4">
          {shuffledCards.map((step) => {
            const imageAsset = getSequencingAsset(step.asset_key);
            return (
              <DraxView
                key={`card-${step.id}`}
                dragPayload={step}
                longPressDelay={0}
                style={{
                  width: isTablet ? 140 : 105,
                  height: isTablet ? 155 : 115,
                  borderRadius: isTablet ? 24 : 18,
                  borderWidth: 2,
                  borderBottomWidth: isTablet ? 5 : 4,
                  borderColor: '#E2E8F0',
                  borderBottomColor: '#CBD5E1',
                  backgroundColor: '#FFFFFF',
                }}
                draggingStyle={{ opacity: 0.15 }}
                dragReleasedStyle={{ opacity: 0.15 }}
                className="p-2 items-center justify-between"
              >
                {imageAsset && (
                  <Image
                    source={imageAsset}
                    style={{
                      width: isTablet ? 95 : 68,
                      height: isTablet ? 95 : 68,
                      borderRadius: isTablet ? 14 : 10,
                    }}
                    resizeMode="contain"
                  />
                )}
                <Text
                  numberOfLines={1}
                  className="font-quicksand-bold text-[#334155] text-xs md:text-sm text-center mt-1"
                >
                  {step.label}
                </Text>
              </DraxView>
            );
          })}

          {shuffledCards.length === 0 && !isCompleted && (
            <Text className="font-quicksand-bold text-[#94A3B8] text-sm">
              All steps placed!
            </Text>
          )}
        </View>
      </View>
    </DraxProvider>
  );
}
