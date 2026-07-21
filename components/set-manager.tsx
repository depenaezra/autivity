import ActivityBear from '@/assets/images/activity-bear.svg';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated as RNAnimated, Dimensions, Pressable, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActivityRenderer from '@/components/activity-renderer';
import FeedbackModal from '@/components/feedback-modal';
import { supabase } from '@/src/lib/supabase';
import { formatActivityTitle } from '@/src/utils/format';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SUCCESS_MESSAGES = [
    "Great job! 🌟",
    "Excellent! 🎉",
    "Amazing work! ✨",
    "Well done! 👏",
    "Fantastic! 🌈",
    "You're a star! ⭐",
    "Superb! 🏆",
    "Keep it up! 💪",
];

// Confetti animation component
function ConfettiEffect() {
    const particles = useRef(
        Array.from({ length: 25 }).map(() => ({
            yAnim: new RNAnimated.Value(-50),
            left: Math.random() * screenWidth,
            rotateAnim: new RNAnimated.Value(0),
            scaleAnim: new RNAnimated.Value(Math.random() * 0.6 + 0.4),
            color: ['#FCA5A5', '#FCD34D', '#86EFAC', '#93C5FD', '#C084FC', '#F472B6'][Math.floor(Math.random() * 6)],
            delay: Math.random() * 800,
            shape: Math.random() > 0.5 ? 'circle' : 'square',
        }))
    ).current;

    useEffect(() => {
        particles.forEach((p) => {
            RNAnimated.loop(
                RNAnimated.sequence([
                    RNAnimated.delay(p.delay),
                    RNAnimated.parallel([
                        RNAnimated.timing(p.yAnim, {
                            toValue: screenHeight + 50,
                            duration: Math.random() * 2000 + 2000,
                            useNativeDriver: true,
                        }),
                        RNAnimated.timing(p.rotateAnim, {
                            toValue: 360,
                            duration: Math.random() * 2000 + 2000,
                            useNativeDriver: true,
                        }),
                    ])
                ])
            ).start();
        });
    }, []);

    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 9999 }}>
            {particles.map((p, idx) => (
                <RNAnimated.View
                    key={idx}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: p.left,
                        width: 14,
                        height: 14,
                        borderRadius: p.shape === 'circle' ? 7 : 2,
                        backgroundColor: p.color,
                        transform: [
                            { translateY: p.yAnim },
                            {
                                rotate: p.rotateAnim.interpolate({
                                    inputRange: [0, 360],
                                    outputRange: ['0deg', '360deg'],
                                })
                            },
                            { scale: p.scaleAnim }
                        ]
                    }}
                />
            ))}
        </View>
    );
}

interface SetManagerProps {
    activityPool: any[];
    studentId: string;
    classId: string | null;
    teacherId: string | null;
    activityType?: string;
}

export default function SetManager({
    activityPool: initialPool,
    studentId,
    classId,
    teacherId,
    activityType,
}: SetManagerProps) {
    // State Requirements
    const [activityPool, setActivityPool] = useState<any[]>([]);
    const [playedActivityIds, setPlayedActivityIds] = useState<string[]>([]);
    const [completedCount, setCompletedCount] = useState(0);
    const [currentActivity, setCurrentActivity] = useState<any | null>(null);
    const [globalTimer, setGlobalTimer] = useState(900); // 15 minutes

    const [isSetComplete, setIsSetComplete] = useState(false);
    const [bearMessage, setBearMessage] = useState('');
    const [errorMode, setErrorMode] = useState(false);
    const [successMode, setSuccessMode] = useState(false);
    const [isActivityDone, setIsActivityDone] = useState(false);
    const [completedMetrics, setCompletedMetrics] = useState<{ score: number; timeSpent: number; mistakes: number } | null>(null);
    const [savedSetSessionId, setSavedSetSessionId] = useState<string | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    // Accumulator State Trackers
    const [totalMistakesAccumulator, setTotalMistakesAccumulator] = useState(0);
    const [totalScoreAccumulator, setTotalScoreAccumulator] = useState(0);
    const [playedActivityPaths, setPlayedActivityPaths] = useState<string[]>([]);

    // Initialization Logic
    useEffect(() => {
        if (!initialPool || initialPool.length === 0) return;

        setActivityPool(initialPool);

        // Dynamically identify absolute lowest difficulty_level present among fetched items
        const levels = initialPool
            .map(a => a.difficulty_level)
            .filter(d => typeof d === 'number');
        const lowestDiff = levels.length > 0 ? Math.min(...levels) : 21;

        // Set a matching item from the pool as currentActivity
        const matchingItems = initialPool.filter(a => a.difficulty_level === lowestDiff);
        const startingActivity = matchingItems[Math.floor(Math.random() * matchingItems.length)] || initialPool[0];

        setCurrentActivity(startingActivity);
        setPlayedActivityIds([startingActivity.id]);
        setPlayedActivityPaths([startingActivity.path || '']);
        setCompletedCount(0);
        setGlobalTimer(900);
        setIsSetComplete(false);
        setSuccessMode(false);
        setIsActivityDone(false);
        setCompletedMetrics(null);
        setSavedSetSessionId(null);
        setTotalMistakesAccumulator(0);
        setTotalScoreAccumulator(0);
    }, [initialPool]);

    // Countdown Timer - runs smoothly and freezes when completedCount is 3 or set is complete
    useEffect(() => {
        if (isSetComplete || completedCount >= 3) return;

        const interval = setInterval(() => {
            setGlobalTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isSetComplete, completedCount]);

    // Sync bear instruction message when currentActivity swaps
    useEffect(() => {
        if (!currentActivity) return;

        const parsedContent = typeof currentActivity.content_data === 'string'
            ? (() => { try { return JSON.parse(currentActivity.content_data); } catch { return {}; } })()
            : (currentActivity.content_data || {});

        setBearMessage(parsedContent.instruction || "Let's play!");
        setErrorMode(false);
    }, [currentActivity]);

    // Handle feedback from drag-and-drop mismatch
    const handleFeedback = (message: string) => {
        setBearMessage(message);
        if (message.toLowerCase().includes('not the correct') || message.toLowerCase().includes('try again')) {
            setErrorMode(true);
        } else {
            setErrorMode(false);
        }
    };

    // Callback caught from finished game loop
    const handleActivityComplete = (score: number, timeSpent: number, mistakes: number) => {
        setCompletedMetrics({ score, timeSpent, mistakes });
        // Immediately add activity finished score and mistakes to accumulators
        setTotalScoreAccumulator(prev => prev + score);
        setTotalMistakesAccumulator(prev => prev + mistakes);

        // Choose a random praise message and update confirmation button UI state
        setBearMessage(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)]);
        setIsActivityDone(true);
        setSuccessMode(true);
    };

    // CHECK / Next Activity double-click transition logic
    const handleCheckPress = async () => {
        if (!isActivityDone || !completedMetrics || !currentActivity) return;

        // successMode will be true because it's immediately set on completion.
        if (!successMode) {
            setSuccessMode(true);
            setBearMessage(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)]);
        } else {
            const { score, timeSpent, mistakes } = completedMetrics;
            const currentDiff = currentActivity.difficulty_level;

            // 1. Extract unique difficulty levels and sort in ascending order
            const uniqueDiffs = Array.from(
                new Set(activityPool.map(a => a.difficulty_level).filter(d => typeof d === 'number'))
            ).sort((a, b) => a - b);

            // 2. Locate current difficulty index
            const currentIndex = uniqueDiffs.indexOf(currentDiff);

            // 3. Shift index based on mistakes count
            let nextIndex = currentIndex;
            if (mistakes === 0) {
                nextIndex = currentIndex + 1; // Upshift tier for perfect mastery
            } else if (mistakes === 1) {
                nextIndex = currentIndex; // Maintain tier for acceptable performance
            } else if (mistakes >= 2) {
                nextIndex = currentIndex - 1; // Bailout downgrade tier to prevent student frustration
            }

            // 4. Clamp index securely
            const clampedIndex = Math.max(0, Math.min(uniqueDiffs.length - 1, nextIndex));
            const nextDiff = uniqueDiffs[clampedIndex] !== undefined ? uniqueDiffs[clampedIndex] : currentDiff;

            if (completedCount < 2) {
                // Transitions for Activity 1 & 2
                // 1. Try to find an unplayed activity of nextDiff difficulty level
                let nextActivity = activityPool.find(
                    a => a.difficulty_level === nextDiff && !playedActivityIds.includes(a.id)
                );

                // 2. Try to find ANY activity of nextDiff difficulty level (even if already played)
                if (!nextActivity) {
                    nextActivity = activityPool.find(a => a.difficulty_level === nextDiff);
                }

                // 3. Fallback to closest available difficulty
                if (!nextActivity) {
                    let unplayed = activityPool.filter(a => !playedActivityIds.includes(a.id));
                    if (mistakes > 0) {
                        const filtered = unplayed.filter(a => (a.difficulty_level || 0) <= currentActivity.difficulty_level);
                        if (filtered.length > 0) {
                            unplayed = filtered;
                        }
                    }
                    if (unplayed.length > 0) {
                        unplayed.sort((a, b) => {
                            const diffA = Math.abs((a.difficulty_level || 0) - nextDiff);
                            const diffB = Math.abs((b.difficulty_level || 0) - nextDiff);
                            if (diffA !== diffB) {
                                return diffA - diffB;
                            }
                            // Tie breaker: if distance is identical, pick lower difficulty if student made mistakes, higher otherwise
                            if (mistakes > 0) {
                                return (a.difficulty_level || 0) - (b.difficulty_level || 0);
                            } else {
                                return (b.difficulty_level || 0) - (a.difficulty_level || 0);
                            }
                        });
                        nextActivity = unplayed[0];
                    }
                }

                // 4. Ultimate fallback: replay current activity
                if (!nextActivity) {
                    nextActivity = currentActivity;
                }

                if (nextActivity) {
                    const parsedContent = typeof nextActivity.content_data === 'string'
                        ? (() => { try { return JSON.parse(nextActivity.content_data); } catch { return {}; } })()
                        : (nextActivity.content_data || {});

                    setBearMessage(parsedContent.instruction || "Let's play!");
                    setCurrentActivity(nextActivity);
                    setPlayedActivityIds((prev) => [...prev, nextActivity.id]);
                    setPlayedActivityPaths((prev) => [...prev, nextActivity.path || '']);
                    setIsActivityDone(false);
                    setSuccessMode(false);
                    setErrorMode(false);
                    setCompletedMetrics(null);
                    setCompletedCount((prev) => prev + 1);
                } else {
                    console.warn("[SET_MANAGER] No more unplayed activities left in pool.");
                }
            } else if (completedCount === 2) {
                // TASK: Unified Database Payload Insertion on completedCount === 2 (finished 3rd activity)
                const finalMistakes = totalMistakesAccumulator;
                const finalScore = totalScoreAccumulator;
                const totalDuration = 900 - globalTimer; // unified elapsed global session time
                const allPaths = [...playedActivityPaths, currentActivity.path || ''];

                try {
                    const payload: any = {
                        student_id: studentId,
                        class_id: classId,
                        teacher_id: teacherId,
                        activity_path: allPaths,
                        category: currentActivity.category || 'Activity',
                        skill_domain: currentActivity.skill_domain || ['Fine Motor Skills'],
                        score: finalScore,
                        duration_seconds: totalDuration, // Final duration
                        status: 'pending', // Hardcoded status string
                        mistakes: finalMistakes, // Combined sum of all hidden mistakes
                        activity_id: currentActivity.id // Fallback points to final activity UUID
                    };

                    const { data, error } = await supabase
                        .from('student_sessions')
                        .insert([payload])
                        .select();

                    if (error) {
                        console.warn("[DATABASE] Supabase insert failed, trying fallback without activity_id:", error.message);
                        const { activity_id, ...fallbackPayload } = payload;
                        const { data: fbData, error: fbErr } = await supabase
                            .from('student_sessions')
                            .insert([fallbackPayload])
                            .select();

                        if (fbErr) {
                            console.error("[DATABASE] Fallback student_sessions insertion failed:", fbErr.message);
                        } else if (fbData && fbData.length > 0) {
                            console.log("[DATABASE] Fallback session insertion succeeded:", fbData[0]);
                            setSavedSetSessionId(fbData[0].id);
                        }
                    } else if (data && data.length > 0) {
                        console.log("[DATABASE] Session insertion succeeded:", data[0]);
                        setSavedSetSessionId(data[0].id);
                    }
                } catch (e) {
                    console.error("[DATABASE] Error inserting student session:", e);
                }

                // Increment to 3, freeze global timer, and display visual confetti praise card
                setCompletedCount(3);
                setIsSetComplete(true);
                setBearMessage("Incredible job! You finished all 3 activities! 🎉");
            }
        }
    };

    // Fade/Slide entrance animation
    const fadeAnim = useSharedValue(1);
    const slideAnim = useSharedValue(0);

    const animatedContentStyle = useAnimatedStyle(() => ({
        opacity: fadeAnim.value,
        transform: [{ translateY: slideAnim.value }],
    }));

    useEffect(() => {
        // Trigger a subtle entrance reset on activity change
        fadeAnim.value = 0;
        slideAnim.value = 15;
        fadeAnim.value = withTiming(1, { duration: 300 });
        slideAnim.value = withTiming(0, { duration: 300 });
    }, [currentActivity]);

    // Format timer
    const minutes = Math.floor(globalTimer / 60);
    const seconds = globalTimer % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (!currentActivity) return null;

    // Build the format currentTask expects
    const parsedContentData = typeof currentActivity.content_data === 'string'
        ? (() => { try { return JSON.parse(currentActivity.content_data); } catch { return {}; } })()
        : (currentActivity.content_data || { id: currentActivity.id, paths: [] });

    const currentTask = {
        id: currentActivity.id || `set-activity-${completedCount}`,
        type: parsedContentData.type || (
            currentActivity.category?.toLowerCase().includes('drag') ? 'drag-and-drop' :
            (currentActivity.category?.toLowerCase().includes('bubble') || currentActivity.path?.toLowerCase().includes('bubble')) ? 'bubble-pop' :
            'tracing'
        ),
        title: currentActivity.title || formatActivityTitle(currentActivity.path || ''),
        path: currentActivity.path || '',
        data: parsedContentData,
        content_data: parsedContentData
    };

    const progressPercent = `${Math.round(((completedCount + 1) / 3) * 100)}%`;

    return (
        <Animated.View style={[{ flex: 1 }, animatedContentStyle]}>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }} edges={['top', 'bottom']}>

                {/* Header: X and Title */}
                <View className="flex-row items-center px-6 pt-4 pb-4">
                    <Pressable onPress={() => router.back()} className="mr-4">
                        <Feather name="x" size={28} color="#535B74" />
                    </Pressable>
                    <Text className="text-2xl font-fredoka-one text-[#535B74]">{currentActivity.title || 'Lesson Activity'}</Text>
                </View>

                {/* Progress Bar & Timer */}
                <View className="flex-row items-center px-6 pb-6">
                    <View className="flex-1 h-[18px] bg-[#C4E0F9] rounded-full overflow-hidden">
                        <View className="h-full bg-[#69AEE3] rounded-full" style={{ width: progressPercent as any }} />
                    </View>
                    <View className="flex-row items-center ml-4">
                        <Feather name="clock" size={20} color="#69AEE3" />
                        <Text className="text-[#535B74] font-quicksand-bold ml-1.5 text-[17px]">{formattedTime}</Text>
                    </View>
                </View>

                {/* Bear & Dialog */}
                <View className="flex-row items-center px-6 pb-4">
                    <ActivityBear width={180} height={180} />

                    {/* Speech Bubble */}
                    <View className="flex-1 ml-5 justify-center relative">
                        <View className={`rounded-3xl p-6 justify-center z-10 border-[1.5px] ${successMode
                                ? 'bg-[#F0FDF4] border-[#86EFAC]'
                                : errorMode
                                    ? 'bg-[#FEF2F2] border-[#FCA5A5]'
                                    : 'bg-[#FCF5F5] border-[#EAD5D5]'
                            }`}>
                            <Text className="text-[#6D7179] text-2xl leading-9 font-quicksand-medium">
                                {bearMessage}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Tracing / Matching Area */}
                <View className="flex-1 px-6 pb-6 mt-1">
                    <View className={currentTask.type === 'drag-and-drop' ? "flex-1" : "flex-1 bg-[#FCFCFC] border-[1.5px] border-[#EBE5E5] rounded-2xl overflow-hidden"}>
                        <ActivityRenderer
                            key={`${currentActivity.id}-${completedCount}`}
                            activity={currentTask}
                            onComplete={handleActivityComplete}
                            onFeedback={handleFeedback}
                        />
                    </View>
                </View>

                {/* CHECK / NEXT ACTIVITY Button */}
                {!isSetComplete && (
                    <View className="px-6 pb-4">
                        <Pressable
                            disabled={!isActivityDone}
                            onPress={handleCheckPress}
                            className={`w-full flex items-center justify-center border-b-[4px] p-[10px] h-[60px] rounded-full ${isActivityDone ? 'bg-[#62A9E6] border-[#5298D4]' : 'bg-[#D1D5DB] border-[#9CA3AF]'}`}
                        >
                            <Text className="text-white font-fredoka-regular text-2xl">
                                {successMode ? 'Next Activity' : 'CHECK'}
                            </Text>
                        </Pressable>
                    </View>
                )}

            </SafeAreaView>

            {/* End-of-Set Congratulations Overlay */}
            {isSetComplete && (
                <View className="absolute inset-0 bg-black/60 items-center justify-center p-6 z-[9999]" style={{ width: screenWidth, height: screenHeight }}>
                    <ConfettiEffect />

                    <View className="bg-white rounded-[32px] p-8 items-center border-[3px] border-[#FDBA74] w-full max-w-[420px] shadow-2xl">

                        {/* Trophy badge */}
                        <View className="w-24 h-24 bg-[#FFF7ED] rounded-full items-center justify-center border-4 border-[#FDBA74] mb-6">
                            <Ionicons name="trophy" size={54} color="#FB923C" />
                        </View>

                        <Text className="font-fredoka-one text-4xl text-[#FB923C] text-center mb-2">
                            Session Complete!
                        </Text>
                        <Text className="font-quicksand-semibold text-lg text-[#6B7280] text-center mb-6 px-2">
                            You finished all 3 activities! Great work! 🎉
                        </Text>

                        {/* Stars earned for the full set */}
                        <View className="flex-row items-center bg-[#FEF3C7] border border-[#FCD34D] rounded-full px-5 py-2 mb-8">
                            <Text className="text-xl mr-1.5">⭐</Text>
                            <Text className="font-quicksand-bold text-[#D97706] text-lg">
                                +{totalScoreAccumulator} Stars Earned
                            </Text>
                        </View>

                        {/* Action Buttons */}
                        <View className="w-full gap-4">
                            <Pressable
                                onPress={() => setShowFeedbackModal(true)}
                                className="w-full h-14 bg-[#10B981] border-b-[4px] border-[#059669] rounded-full items-center justify-center flex-row gap-2 active:bg-[#059669]"
                            >
                                <Feather name="check-circle" size={22} color="white" />
                                <Text className="text-white font-fredoka-regular text-xl">
                                    Add Feedback Now
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => router.back()}
                                className="w-full h-14 bg-[#F3F4F6] border-b-[4px] border-[#D1D5DB] rounded-full items-center justify-center active:bg-[#E5E7EB]"
                            >
                                <Text className="text-[#4B5563] font-fredoka-regular text-xl">
                                    Maybe Later
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}

            <FeedbackModal
                visible={showFeedbackModal}
                sessionId={savedSetSessionId}
                activityTitle={`Set of 3 Activities`}
                onClose={() => { setShowFeedbackModal(false); router.back(); }}
                onSuccess={() => { setShowFeedbackModal(false); router.back(); }}
            />
        </Animated.View>
    );
}
