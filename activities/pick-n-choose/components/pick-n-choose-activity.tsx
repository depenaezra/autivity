import React, { useEffect, useRef, useState } from 'react';
import { Image, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playCorrectSound } from '@/src/utils/sound';
import { useActivityHint } from '@/hooks/use-activity-hint';
import { OBJECT_IDENTIFICATION_POOL } from '../data/object-identification';
import { PickChoiceActivityProps, PickChoiceOption, PickChoiceQuestion } from '../types';
import { getPickChoiceAsset } from '../utils/assetDictionary';
import { generatePickChoiceQuestions } from '../utils/shuffler';

const GUIDING_MESSAGES = [
    "Not quite! Look closely at the picture and try again!",
    "Give it another go! Which word matches this picture?",
    "Almost! Read the choices carefully and tap the right word!",
    "Let's try again! You can do it!",
];

export default function PickChoiceActivity({
    contentData,
    onComplete,
    onFeedback,
    onIncorrectAttempt,
    hintSignal,
}: PickChoiceActivityProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const [questions, setQuestions] = useState<PickChoiceQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [isCorrectState, setIsCorrectState] = useState<boolean | null>(null);

    const mistakesRef = useRef(0);
    const startTimeRef = useRef<number>(Date.now());
    const lastMessageIdxRef = useRef<number>(-1);

    // Reanimated values for 3D card animations
    const cardScale = useSharedValue(1);
    const shakeOffset = useSharedValue(0);

    const animatedCardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.value }, { translateX: shakeOffset.value }],
    }));

    const getNextGuidingMessage = () => {
        let nextIdx = Math.floor(Math.random() * GUIDING_MESSAGES.length);
        if (nextIdx === lastMessageIdxRef.current) {
            nextIdx = (nextIdx + 1) % GUIDING_MESSAGES.length;
        }
        lastMessageIdxRef.current = nextIdx;
        return GUIDING_MESSAGES[nextIdx];
    };

    const initializeGame = () => {
        const pool = contentData?.pool && contentData.pool.length > 0
            ? contentData.pool
            : OBJECT_IDENTIFICATION_POOL;

        const count = contentData?.item_count || 3;
        const optionsCount = contentData?.choice_count || 3;

        const generatedQuestions = generatePickChoiceQuestions(pool, count, optionsCount);
        setQuestions(generatedQuestions);
        setCurrentIndex(0);
        setSelectedOptionId(null);
        setIsCorrectState(null);
        mistakesRef.current = 0;
        startTimeRef.current = Date.now();

        if (generatedQuestions.length > 0) {
            onFeedback?.("Tap the word that matches the picture!");
        }
    };

    const contentDataKey = JSON.stringify(contentData);

    useEffect(() => {
        initializeGame();
    }, [contentDataKey]);

    const currentQuestion = questions[currentIndex];

    const { isHintActive, hintLevel, hintsUsed, triggerHint, recordAttempt, resetForNextQuestion } = useActivityHint({
        getClueText: () => {
            if (!currentQuestion) return "Look closely at the choices!";
            const label = currentQuestion.targetItem.label;
            return `Clue: The correct word starts with ${label[0].toUpperCase()} and ends with ${label[label.length - 1].toUpperCase()}!`;
        },
        onFeedback,
    });

    // Listen to manual hintSignal button from top header
    const lastHintSignalRef = useRef(hintSignal);
    useEffect(() => {
        if (hintSignal !== undefined && hintSignal !== lastHintSignalRef.current) {
            lastHintSignalRef.current = hintSignal;
            triggerHint();
        }
    }, [hintSignal, triggerHint]);

    const handleOptionPress = (option: PickChoiceOption) => {
        if (selectedOptionId !== null) return; // Prevent double taps during transition

        setSelectedOptionId(option.id);
        const hintTriggered = recordAttempt(option.isCorrect);

        if (option.isCorrect) {
            setIsCorrectState(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            playCorrectSound();

            cardScale.value = withSequence(
                withSpring(1.06, { damping: 10, stiffness: 200 }),
                withSpring(1, { damping: 12, stiffness: 150 })
            );

            onFeedback?.("Great job! That's correct! ⭐");

            setTimeout(() => {
                if (currentIndex + 1 < questions.length) {
                    const nextIdx = currentIndex + 1;
                    setCurrentIndex(nextIdx);
                    setSelectedOptionId(null);
                    setIsCorrectState(null);
                    resetForNextQuestion();
                    onFeedback?.("Tap the word that matches the picture!");
                } else {
                    const timeSpent = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
                    const score = 15; // 15 stars per completion
                    onComplete?.(score, timeSpent, mistakesRef.current, hintsUsed);
                }
            }, 1100);

        } else {
            setIsCorrectState(false);
            mistakesRef.current += 1;
            onIncorrectAttempt?.();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});

            // Shake Animation
            shakeOffset.value = withSequence(
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(-8, { duration: 50 }),
                withTiming(8, { duration: 50 }),
                withTiming(0, { duration: 50 })
            );

            if (!hintTriggered) {
                onFeedback?.(getNextGuidingMessage());
            }

            setTimeout(() => {
                setSelectedOptionId(null);
                setIsCorrectState(null);
            }, 900);
        }
    };

    if (!currentQuestion) {
        return (
            <View className="flex-1 items-center justify-center p-6 bg-[#FAFAFA]">
                <Text className="text-xl font-fredoka text-[#64748B]">Loading Picture-Word Match...</Text>
            </View>
        );
    }

    const promptAsset = getPickChoiceAsset(currentQuestion.targetItem.asset_key);

    return (
        <View className="flex-1 bg-[#FAFAFA] p-4 sm:p-6 justify-between items-center w-full">
            {/* Header Question Counter */}
            <View className="w-full max-w-lg items-start px-1 pt-1 mb-2">
                <Text className="font-quicksand-bold text-[#475569] text-xl sm:text-2xl">
                    Question {currentIndex + 1} of {questions.length}
                </Text>
            </View>

            {/* Prompt Picture Display Card matching Drag-Drop 3D Aesthetic */}
            <Animated.View
                style={[
                    animatedCardStyle,
                    {
                        shadowColor: '#64748B',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                        elevation: 3,
                    }
                ]}
                className={`w-full max-w-lg bg-white rounded-3xl items-center justify-center border-2 border-[#E2E8F0] border-b-[5px] border-b-[#CBD5E1] my-auto ${
                    isTablet ? 'p-8 min-h-[260px]' : 'p-6 min-h-[200px]'
                }`}
            >
                {promptAsset ? (
                    <Image
                        source={promptAsset}
                        style={{
                            width: isTablet ? 200 : 140,
                            height: isTablet ? 200 : 140,
                        }}
                        resizeMode="contain"
                    />
                ) : (
                    <View
                        style={{
                            width: isTablet ? 200 : 140,
                            height: isTablet ? 200 : 140,
                        }}
                        className="bg-[#F8FAFC] rounded-2xl items-center justify-center p-4 border-2 border-dashed border-[#CBD5E1]"
                    >
                        <Text className="text-xl font-quicksand-bold text-[#64748B] text-center">
                            {currentQuestion.targetItem.label}
                        </Text>
                    </View>
                )}
            </Animated.View>

            {/* Tactile 3D Choice Button Cards matching Drag-Drop Aesthetics */}
            <View className={`w-full max-w-lg ${isTablet ? 'gap-4 mb-4' : 'gap-3 mb-2'}`}>
                {currentQuestion.options.map((option) => {
                    const isSelected = selectedOptionId === option.id;
                    const isCorrectAnswer = option.isCorrect;
                    const showLevel2Highlight = isHintActive && hintLevel === 2 && isCorrectAnswer;

                    let bgStyle = 'bg-white border-[#E2E8F0] border-b-[#CBD5E1]';
                    let textStyle = 'text-[#334155]';

                    if (showLevel2Highlight) {
                        bgStyle = 'bg-[#FFF3C4] border-[#FFAE02] border-b-[#FF9800]';
                        textStyle = 'text-[#9A6200] font-quicksand-bold';
                    } else if (isHintActive && hintLevel === 2 && !isCorrectAnswer) {
                        bgStyle = 'bg-white/60 border-[#E2E8F0] opacity-50';
                    }

                    if (isSelected) {
                        if (isCorrectState === true) {
                            bgStyle = 'bg-[#DCFCE7] border-[#22C55E] border-b-[#16A34A]';
                            textStyle = 'text-[#15803D]';
                        } else if (isCorrectState === false) {
                            bgStyle = 'bg-[#FEE2E2] border-[#EF4444] border-b-[#DC2626]';
                            textStyle = 'text-[#B91C1C]';
                        }
                    }

                    return (
                        <TouchableOpacity
                            key={option.id}
                            activeOpacity={0.8}
                            disabled={selectedOptionId !== null}
                            onPress={() => handleOptionPress(option)}
                            className={`w-full ${
                                isTablet ? 'py-5 px-8 rounded-2xl border-2 border-b-[5px]' : 'py-4 px-6 rounded-2xl border-2 border-b-[4px]'
                            } items-center justify-center active:scale-98 transition-transform ${bgStyle}`}
                            style={{
                                shadowColor: showLevel2Highlight ? '#FFAE02' : '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: showLevel2Highlight ? 0.3 : 0.05,
                                shadowRadius: showLevel2Highlight ? 6 : 3,
                                elevation: showLevel2Highlight ? 4 : 2,
                            }}
                        >
                            <Text
                                className={`font-quicksand-bold text-center tracking-wide ${
                                    isTablet ? 'text-2xl' : 'text-xl'
                                } ${textStyle}`}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}
