import ActivityBear from '@/assets/images/activity-bear.svg';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActivityRenderer from '@/components/activity-renderer';
import FeedbackModal from '@/components/feedback-modal';

// Import services
import { getActivitiesBySubcategories, getDefaultActivities } from '@/src/services/materials';
import { saveStudentSession } from '@/src/services/sessions';
import { getStudentById } from '@/src/services/students';
import { formatActivityTitle } from '@/src/utils/format';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Self-contained high performance Confetti animation component
function ConfettiEffect() {
    const particles = useRef(
        Array.from({ length: 25 }).map(() => ({
            yAnim: new Animated.Value(-50),
            left: Math.random() * screenWidth,
            rotateAnim: new Animated.Value(0),
            scaleAnim: new Animated.Value(Math.random() * 0.6 + 0.4),
            color: ['#FCA5A5', '#FCD34D', '#86EFAC', '#93C5FD', '#C084FC', '#F472B6'][Math.floor(Math.random() * 6)],
            delay: Math.random() * 800,
            shape: Math.random() > 0.5 ? 'circle' : 'square',
        }))
    ).current;

    useEffect(() => {
        particles.forEach((p) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(p.delay),
                    Animated.parallel([
                        Animated.timing(p.yAnim, {
                            toValue: screenHeight + 50,
                            duration: Math.random() * 2000 + 2000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(p.rotateAnim, {
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
                <Animated.View
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

const SET_SIZE = 3;

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

export default function LessonScreen() {
    const params = useLocalSearchParams();
    const studentId = Array.isArray(params.studentId) ? params.studentId[0] : params.studentId || '1';
    const initialClassId = Array.isArray(params.classId) ? params.classId[0] : params.classId;
    const initialTeacherId = Array.isArray(params.teacherId) ? params.teacherId[0] : params.teacherId;

    const activityType = Array.isArray(params.activityType) ? params.activityType[0] : params.activityType;

    const [classId, setClassId] = useState<string | null>(initialClassId || null);
    const [teacherId, setTeacherId] = useState<string | null>(initialTeacherId || null);

    // Set-based session state
    const [currentSet, setCurrentSet] = useState<any[]>([]);  // 3 randomly picked activities
    const [setIndex, setSetIndex] = useState(0);               // 0, 1, 2
    const [isActivityDone, setIsActivityDone] = useState(false); // onComplete fired
    const [bearMessage, setBearMessage] = useState('');
    const [successMode, setSuccessMode] = useState(false);     // CHECK pressed → bear shows praise
    const [errorMode, setErrorMode] = useState(false);         // Drag-drop mismatch error occurred
    const [isSetComplete, setIsSetComplete] = useState(false); // all 3 done → show congrats
    const [savedSetSessionId, setSavedSetSessionId] = useState<string | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15 * 60);
    const [isLoading, setIsLoading] = useState(true);

    const setStartTimeRef = useRef<number>(Date.now());

    const currentActivity = currentSet[setIndex] || {};
    const parsedContentData = typeof currentActivity.content_data === 'string'
        ? (() => { try { return JSON.parse(currentActivity.content_data); } catch { return {}; } })()
        : (currentActivity.content_data || { id: currentActivity.id, paths: [] });

    const currentTask = currentActivity.id ? {
        id: currentActivity.id || `lesson-task-${setIndex}`,
        type: parsedContentData.type || (currentActivity.category?.toLowerCase().includes('drag') ? 'drag-and-drop' : 'tracing'),
        title: currentActivity.title || formatActivityTitle(currentActivity.path || ''),
        path: currentActivity.path || '',
        data: parsedContentData,
        content_data: parsedContentData
    } : null;

    useEffect(() => {
        const loadAssigned = async () => {
            setIsLoading(true);
            try {
                // Parse assigned subcategory IDs (e.g. ['lines', 'Matching Fruits'])
                let subcategories: string[] = [];
                if (params.assignedActivities && typeof params.assignedActivities === 'string') {
                    const parsed = JSON.parse(params.assignedActivities);
                    if (Array.isArray(parsed) && parsed.length > 0) subcategories = parsed;
                }
                // Fallback: SecureStore cache
                if (subcategories.length === 0 && studentId) {
                    const stored = await SecureStore.getItemAsync(`student_activities_${studentId}`);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed) && parsed.length > 0) subcategories = parsed;
                    }
                }

                // Fetch the full pool from matching subcategories
                let pool: any[] = [];
                if (subcategories.length > 0) {
                    pool = await getActivitiesBySubcategories(subcategories);
                }
                if (!pool || pool.length === 0) {
                    pool = await getDefaultActivities(20);
                }

                // Filter pool by activityType if specified to prevent leakage of unassigned matching/tracing tasks
                if (activityType === 'tracing') {
                    pool = pool.filter(a => {
                        const path = a.path || '';
                        const isDragDrop = path.includes('drag-drop') || a.category?.toLowerCase().includes('drag');
                        return !isDragDrop;
                    });
                } else if (activityType === 'matching') {
                    pool = pool.filter(a => {
                        const path = a.path || '';
                        return path.includes('drag-drop') || a.category?.toLowerCase().includes('drag');
                    });
                }

                // Pick SET_SIZE random activities from the pool
                const shuffled = [...pool].sort(() => Math.random() - 0.5);
                const set = shuffled.slice(0, Math.min(SET_SIZE, pool.length));
                setCurrentSet(set);
                setStartTimeRef.current = Date.now();

                // Resolve classId / teacherId if missing
                let currentClassId = initialClassId || classId;
                let currentTeacherId = initialTeacherId || teacherId;
                if (studentId && (!currentClassId || !currentTeacherId)) {
                    const student = await getStudentById(studentId);
                    if (student) {
                        currentClassId = student.class_id;
                        currentTeacherId = student.teacher_id;
                    }
                }
                setClassId(currentClassId);
                setTeacherId(currentTeacherId);

                // Bear says the first activity's instruction
                const firstActivity = set[0] || {};
                const firstContentData = typeof firstActivity.content_data === 'string'
                    ? (() => { try { return JSON.parse(firstActivity.content_data); } catch { return {}; } })()
                    : (firstActivity.content_data || {});
                setBearMessage(firstContentData.instruction || "Let's play!");
            } catch (e) {
                console.error('Failed to load activities:', e);
                try {
                    let fallback = await getDefaultActivities(20);
                    if (activityType === 'tracing') {
                        fallback = fallback.filter(a => {
                            const path = a.path || '';
                            const isDragDrop = path.includes('drag-drop') || a.category?.toLowerCase().includes('drag');
                            return !isDragDrop;
                        });
                    } else if (activityType === 'matching') {
                        fallback = fallback.filter(a => {
                            const path = a.path || '';
                            return path.includes('drag-drop') || a.category?.toLowerCase().includes('drag');
                        });
                    }
                    const set = fallback.slice(0, Math.min(SET_SIZE, fallback.length));
                    setCurrentSet(set);
                } catch {
                    setCurrentSet([]);
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadAssigned();
    }, [params.assignedActivities, studentId, initialClassId, initialTeacherId, activityType]);

    // Fade/Slide entrance animation
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const triggerEntrance = () => {
        fadeAnim.setValue(0);
        slideAnim.setValue(30);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 350,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 350,
                useNativeDriver: true,
            })
        ]).start();
    };

    useEffect(() => {
        triggerEntrance();
    }, [currentSet]);

    // Sync bear message when advancing to next activity in set
    useEffect(() => {
        if (!successMode && currentActivity && Object.keys(currentActivity).length > 0) {
            setBearMessage(parsedContentData.instruction || "Let's play!");
            setErrorMode(false);
        }
    }, [setIndex, currentSet]);

    // Countdown Timer — stops when the set is complete
    useEffect(() => {
        if (isSetComplete) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isSetComplete]);

    const handleFeedback = (message: string) => {
        setBearMessage(message);
        if (message.toLowerCase().includes('not the correct') || message.toLowerCase().includes('try again')) {
            setErrorMode(true);
        } else {
            setErrorMode(false);
        }
    };

    const handleTaskComplete = () => {
        setIsActivityDone(true);
    };

    const handleCheck = async () => {
        if (!isActivityDone) return;

        if (!successMode) {
            // First press — show inline praise in bear bubble
            setSuccessMode(true);
            setBearMessage(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)]);
        } else {
            // Second press — "Next Activity" logic
            if (setIndex < currentSet.length - 1) {
                // Advance to next activity in set
                setSetIndex(prev => prev + 1);
                setIsActivityDone(false);
                setSuccessMode(false);
                setErrorMode(false);
                // bear message resets via useEffect on setIndex change
            } else {
                // All activities in set done — save combined session row
                try {
                    const duration = Math.round((Date.now() - setStartTimeRef.current) / 1000);
                    const paths = currentSet.map(a => a.path || '');
                    const category = currentActivity.category || 'Activity';
                    const skill_domain = currentActivity.skill_domain || ['Fine Motor Skills'];

                    if (studentId && classId && teacherId) {
                        const saved = await saveStudentSession({
                            student_id: studentId,
                            class_id: classId,
                            teacher_id: teacherId,
                            activity_path: paths,  // string[] — all 3 paths
                            category,
                            skill_domain,
                            score: 15 * currentSet.length,
                            duration_seconds: duration,
                        });
                        if (saved && Array.isArray(saved) && saved.length > 0) {
                            setSavedSetSessionId(saved[0].id);
                        }
                    } else {
                        console.warn('Missing required IDs — session not saved.');
                    }
                } catch (error) {
                    console.error('Failed to save set session:', error);
                } finally {
                    setIsSetComplete(true);
                }
            }
        }
    };

    // Progress tracks position within the current set (1/3, 2/3, 3/3)
    const progressPercent = `${Math.round(((setIndex + 1) / Math.max(currentSet.length, 1)) * 100)}%`;

    // Format timer
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#62A9E6" />
                <Text className="mt-4 font-quicksand-bold text-[#6B7280] text-lg">Loading Lesson Activities...</Text>
            </SafeAreaView>
        );
    }

    if (!currentSet || currentSet.length === 0 || !currentTask) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <Feather name="alert-circle" size={48} color="#9CA3AF" />
                <Text className="mt-4 font-fredoka-one text-[#535B74] text-2xl text-center">No Activities Found</Text>
                <Text className="mt-2 font-quicksand-medium text-[#6B7280] text-center text-base">There are currently no activities available for this lesson.</Text>
                <Pressable
                    onPress={() => router.back()}
                    className="mt-6 bg-[#62A9E6] px-6 py-3 rounded-full"
                >
                    <Text className="text-white font-fredoka-regular text-lg">Go Back</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
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

                    {/* Speech Bubble — turns green in success mode, red on error */}
                    <View className="flex-1 ml-5 justify-center relative">
                        <View className={`rounded-3xl p-6 justify-center z-10 border-[1.5px] ${
                            successMode
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

                {/* Tracing Area */}
                <View className="flex-1 px-6 pb-6 mt-1">
                    <View className={currentTask?.type === 'drag-and-drop' ? "flex-1" : "flex-1 bg-[#FCFCFC] border-[1.5px] border-[#EBE5E5] rounded-2xl overflow-hidden"}>
                        <ActivityRenderer
                            key={setIndex}
                            activity={currentTask}
                            onComplete={handleTaskComplete}
                            onFeedback={handleFeedback}
                        />
                    </View>
                </View>

                {/* CHECK / NEXT ACTIVITY Button */}
                <View className="px-6 pb-4">
                    <Pressable
                        disabled={!isActivityDone}
                        onPress={handleCheck}
                        className={`w-full flex items-center justify-center border-b-[4px] p-[10px] h-[60px] rounded-full ${isActivityDone ? 'bg-[#62A9E6] border-[#5298D4]' : 'bg-[#D1D5DB] border-[#9CA3AF]'}`}
                    >
                        <Text className="text-white font-fredoka-regular text-2xl">
                            {successMode ? 'Next Activity' : 'CHECK'}
                        </Text>
                    </Pressable>
                </View>

            </SafeAreaView>

            {/* End-of-Set Congratulations — full screen, only shown when all 3 activities done */}
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
                            You finished all {currentSet.length} activities! Great work! 🎉
                        </Text>

                        {/* Stars earned for the full set */}
                        <View className="flex-row items-center bg-[#FEF3C7] border border-[#FCD34D] rounded-full px-5 py-2 mb-8">
                            <Text className="text-xl mr-1.5">⭐</Text>
                            <Text className="font-quicksand-bold text-[#D97706] text-lg">
                                +{15 * currentSet.length} Stars Earned
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
                activityTitle={`Set of ${currentSet.length} Activities`}
                onClose={() => { setShowFeedbackModal(false); router.back(); }}
                onSuccess={() => { setShowFeedbackModal(false); router.back(); }}
            />
        </Animated.View>
    );
}
