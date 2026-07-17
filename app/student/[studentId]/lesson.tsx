import ActivityBear from '@/assets/images/activity-bear.svg';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import the real tracing data
import { getTracingActivityByPath } from '@/activities/tracing';
import ActivityRenderer from '@/components/activity-renderer';

// Import service
import { saveStudentSession } from '@/src/services/sessions';
import { getStudentById } from '@/src/services/students';
import { formatActivityTitle } from '@/src/utils/format';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DEFAULT_TRACING_ACTIVITIES = [
    { path: "activity/tracing/lines/zigzag", title: "Zigzag Lines" },
    { path: "activity/tracing/lines/wave", title: "Wave Lines" },
    { path: "activity/tracing/lines/arc", title: "Arc Lines" },
    { path: "activity/tracing/lines/horizontal", title: "Horizontal Lines" },
    { path: "activity/tracing/lines/vertical", title: "Vertical Lines" },
    { path: "activity/tracing/lines/diagonal-down", title: "Diagonal Down Lines" },
    { path: "activity/tracing/lines/diagonal-up", title: "Diagonal Up Lines" }
];

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

export default function LessonScreen() {
    const params = useLocalSearchParams();
    const studentId = Array.isArray(params.studentId) ? params.studentId[0] : params.studentId || '1';
    const initialClassId = Array.isArray(params.classId) ? params.classId[0] : params.classId;
    const initialTeacherId = Array.isArray(params.teacherId) ? params.teacherId[0] : params.teacherId;

    const [classId, setClassId] = useState<string | null>(initialClassId || null);
    const [teacherId, setTeacherId] = useState<string | null>(initialTeacherId || null);

    const [activitiesList, setActivitiesList] = useState<any[]>(DEFAULT_TRACING_ACTIVITIES);
    const [activityIndex, setActivityIndex] = useState(0);
    const [isTaskDone, setIsTaskDone] = useState(false);
    const [showCongrats, setShowCongrats] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15 * 60);

    useEffect(() => {
        const loadAssigned = async () => {
            try {
                let paths: string[] = [];
                if (params.assignedActivities && typeof params.assignedActivities === 'string') {
                    const parsed = JSON.parse(params.assignedActivities);
                    if (Array.isArray(parsed) && parsed.length > 0) paths = parsed;
                }
                if (paths.length === 0 && studentId) {
                    const stored = await SecureStore.getItemAsync(`student_activities_${studentId}`);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed) && parsed.length > 0) paths = parsed;
                    }
                }
                if (paths.length > 0) {
                    const mapped = paths.map(p => ({
                        path: p.startsWith('activity/tracing/') ? p : `activity/tracing/${p}`,
                        title: formatActivityTitle(p)
                    }));
                    setActivitiesList(mapped);
                }

                // If classId or teacherId is missing, fetch them from DB
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
            } catch (e) {
                // Keep default on error
            }
        };
        loadAssigned();
    }, [params.assignedActivities, studentId, initialClassId, initialTeacherId]);

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
    }, [activitiesList]);

    // Countdown Timer logic
    useEffect(() => {
        if (showCongrats) return;

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
    }, [showCongrats]);
            useEffect(() => {
              console.log("Timer:", timeLeft);
    },       [timeLeft]);
    const currentActivity = activitiesList[activityIndex] || DEFAULT_TRACING_ACTIVITIES[0];
    const tracingData = getTracingActivityByPath(currentActivity.path);
    const currentTask = {
        id: `lesson-1-task-${activityIndex}`,
        type: "tracing" as const,
        data: tracingData || { id: "fallback", paths: ["M 50 200 L 350 200"] }
    };

    const handleTaskComplete = () => {
        setIsTaskDone(true);
    };

    const handleCheck = async () => {
        if (isTaskDone) {
            try {
                // Calculate how long they took (900 seconds total - timeLeft)
                const duration = (15 * 60) - timeLeft;

                // Map the category and skill domain based on the path
                // (You can adjust this mapping logic based on your exact domains)
                const isLines = currentActivity.path.includes('lines');
                const category = isLines ? 'Lines' : 'Shapes';
                const skill_domain = 'Motor'; // Tracing is primarily fine motor skills

                // Fire to Supabase ONLY if we have the required IDs
                if (studentId && classId && teacherId) {
                    await saveStudentSession({
                        student_id: studentId,
                        class_id: classId,
                        teacher_id: teacherId,
                        activity_path: currentActivity.path,
                        category: category,
                        skill_domain: skill_domain,
                        score: 15, // Matching the "+15 Stars Earned" from your UI
                        duration_seconds: duration
                    });
                } else {
                    console.warn("Missing required IDs for analytics tracking. Activity not saved.");
                }

                // Show the confetti modal after saving
                setShowCongrats(true);

            } catch (error) {
                console.error("Failed to save session:", error);
                // Still show congrats so the student isn't blocked by a network error
                setShowCongrats(true);
            }
        }
    };

const handleContinue = () => {
    console.log("Current time:", timeLeft);

    setActivityIndex(prev => prev + 1);
    setIsTaskDone(false);
    setShowCongrats(false);

    triggerEntrance();
};

    // Format timer
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const progressPercent = `${Math.round(((activityIndex + 1) / activitiesList.length) * 100)}%`;

    return (
        <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }} edges={['top', 'bottom']}>

                {/* Header: X and Title */}
                <View className="flex-row items-center px-6 pt-4 pb-4">
                    <Pressable onPress={() => router.back()} className="mr-4">
                        <Feather name="x" size={28} color="#535B74" />
                    </Pressable>
                    <Text className="text-2xl font-fredoka-one text-[#535B74]">{currentActivity.title}</Text>
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

                    {/* Speech Bubble Container */}
                    <View className="flex-1 ml-5 justify-center relative">
                        <View className="bg-[#FCF5F5] border-[1.5px] border-[#EAD5D5] rounded-3xl p-6 justify-center z-10">
                            <Text className="text-[#6D7179] text-2xl leading-9 font-quicksand-medium">
                                Trace the line to complete the shape by dragging the blue circle!
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Tracing Area */}
                <View className="flex-1 px-6 pb-6 mt-1">
                    <View className="flex-1 bg-[#FCFCFC] border-[1.5px] border-[#EBE5E5] rounded-2xl overflow-hidden">
                        <ActivityRenderer
                            key={activityIndex}
                            activity={currentTask}
                            onComplete={handleTaskComplete}
                        />
                    </View>
                </View>

                {/* CHECK Button */}
                <View className="px-6 pb-4">
                    <Pressable
                        disabled={!isTaskDone}
                        onPress={handleCheck}
                        className={`w-full flex items-center justify-center border-b-[4px] p-[10px] h-[60px] rounded-full ${isTaskDone ? 'bg-[#62A9E6] border-[#5298D4]' : 'bg-[#D1D5DB] border-[#9CA3AF]'}`}
                    >
                        <Text className="text-white font-fredoka-regular text-2xl">CHECK</Text>
                    </Pressable>
                </View>

            </SafeAreaView>

            {/* Congratulations Modal Overlay */}
            {showCongrats && (
                <View className="absolute inset-0 bg-black/60 items-center justify-center p-6 z-[9999]" style={{ width: screenWidth, height: screenHeight }}>
                    <ConfettiEffect />

                    <View className="bg-white rounded-[32px] p-8 items-center border-[3px] border-[#FDBA74] w-full max-w-[420px] shadow-2xl">

                        {/* Trophy badge */}
                        <View className="w-24 h-24 bg-[#FFF7ED] rounded-full items-center justify-center border-4 border-[#FDBA74] mb-6">
                            <Ionicons name="trophy" size={54} color="#FB923C" />
                        </View>

                        <Text className="font-fredoka-one text-4xl text-[#FB923C] text-center mb-2">
                            Amazing!
                        </Text>
                        <Text className="font-quicksand-semibold text-lg text-[#6B7280] text-center mb-6 px-2">
                            You successfully traced the {currentActivity.title}!
                        </Text>

                        {/* Reward badges */}
                        <View className="flex-row items-center bg-[#FEF3C7] border border-[#FCD34D] rounded-full px-5 py-2 mb-8">
                            <Text className="text-xl mr-1.5">⭐</Text>
                            <Text className="font-quicksand-bold text-[#D97706] text-lg">
                                +15 Stars Earned
                            </Text>
                        </View>

                        {/* Interactive Buttons */}
                        <View className="w-full gap-4">
                            {/* Next Lesson / Continue */}
                            <Pressable
                                onPress={handleContinue}
                                className="w-full h-14 bg-[#FB923C] border-b-[4px] border-[#EA580C] rounded-full items-center justify-center active:bg-[#EA580C]"
                            >
                                <Text className="text-white font-fredoka-regular text-xl">
                                    Next Activity
                                </Text>
                            </Pressable>

                            {/* Go Home / Exit */}
                            <Pressable
                                onPress={() => router.back()}
                                className="w-full h-14 bg-[#F3F4F6] border-b-[4px] border-[#D1D5DB] rounded-full items-center justify-center active:bg-[#E5E7EB]"
                            >
                                <Text className="text-[#4B5563] font-fredoka-regular text-xl">
                                    Back to Home
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}
        </Animated.View>
    );
}
