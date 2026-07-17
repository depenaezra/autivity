import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

// Import your student services
import { getStudentActivities, getStudentById } from '../../../../src/services/students';

export default function StudentHome() {
    const router = useRouter();

    // 1. EXTRACT CLASS AND TEACHER IDs HERE
    const { studentId, studentName: initialStudentName, assignedActivities, classId: initialClassId, teacherId: initialTeacherId } = useLocalSearchParams();

    // Screen width check for responsive scaling
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    // State for dynamic activities
    const [assignedPaths, setAssignedPaths] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [classId, setClassId] = useState<string | null>((initialClassId as string) || null);
    const [teacherId, setTeacherId] = useState<string | null>((initialTeacherId as string) || null);
    const [studentName, setStudentName] = useState<string>((initialStudentName as string) || '');

    // Fetch the paths when screen loads
    useEffect(() => {
        const loadActivities = async () => {
            if (!studentId) return;

            setIsLoading(true);
            try {
                const paths = await getStudentActivities(studentId as string);
                setAssignedPaths(paths);

                let currentClassId = (initialClassId as string) || classId;
                let currentTeacherId = (initialTeacherId as string) || teacherId;
                let currentName = (initialStudentName as string) || studentName;

                if (!currentClassId || !currentTeacherId || !currentName) {
                    const student = await getStudentById(studentId as string);
                    if (student) {
                        currentClassId = student.class_id;
                        currentTeacherId = student.teacher_id;
                        currentName = student.name;
                    }
                }

                setClassId(currentClassId);
                setTeacherId(currentTeacherId);
                setStudentName(currentName);
            } catch (e) {
                console.error("Error loading student data:", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadActivities();
    }, [studentId, initialClassId, initialTeacherId, initialStudentName]);

    // Logic: Check if any tracing activity is assigned
    const hasTracingAssignment = assignedPaths.some(path =>
        path.startsWith('lines/') ||
        path.startsWith('shapes/') ||
        path.startsWith('letters/') ||
        path.startsWith('numbers/')
    );

    const hasMatchingAssignment = assignedPaths.some(path =>
        path.includes('drag-drop')
    );


    // Derive recent activity subtitle from assigned paths
    const tracingCategories = [
        { key: 'lines', label: 'Lines' },
        { key: 'shapes', label: 'Shapes' },
        { key: 'letters', label: 'Letters' },
        { key: 'numbers', label: 'Numbers' },
    ]
        .filter(cat => assignedPaths.some(p => p.startsWith(`${cat.key}/`)))
        .map(cat => cat.label);

    const recentActivitySubtitle = tracingCategories.length > 0
        ? tracingCategories.join(', ')
        : null;

    // 2. PASS THE IDs TO THE LESSON ROUTE
    const navigateToLesson = () => {
        const targetStudentId = (studentId as string) || '1';
        router.push({
            pathname: `/student/${targetStudentId}/lesson` as any,
            params: {
                studentId: targetStudentId,
                studentName: studentName,
                assignedActivities: JSON.stringify(assignedPaths),
                classId: classId as string,
                teacherId: teacherId as string
            }
        });
    };

    return (
        <View className="flex-1 bg-[#F8FAFC]">
            <View className={`absolute top-12 left-6 z-10`}>
                <Pressable
                    onPress={() => router.back()}
                    className="w-12 h-12 items-center justify-center rounded-full"
                >
                    <Feather name="arrow-left" size={28} color="#4B5563" />
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: isTablet ? 100 : 60 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* HEADER IMAGE SECTION */}
                <View className={`w-full ${isTablet ? 'h-[320px]' : 'h-[220px]'}`}>
                    <Image
                        source={require('../../../../assets/images/student-pink-header.png')}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                </View>

                {/* AVATAR & NAME SECTION */}
                <View className={`items-center px-6 ${isTablet ? '-mt-[100px]' : '-mt-[70px]'}`}>
                    <View className={`rounded-full bg-[#E5E7EB] border-white shadow-sm items-center justify-center ${isTablet ? 'w-[180px] h-[180px] border-[8px]' : 'w-[120px] h-[120px] border-[6px]'}`}>
                        <Ionicons name="person" size={isTablet ? 90 : 60} color="#9CA3AF" />
                    </View>
                    <Text className={`font-fredoka-one text-[#374151] ${isTablet ? 'text-6xl mt-4' : 'text-4xl mt-3'}`}>
                        {studentName || 'Monna'}
                    </Text>
                    <Text className={`text-[#9CA3AF] font-quicksand-medium ${isTablet ? 'text-2xl mt-1' : 'text-lg'}`}>
                        Grade 1
                    </Text>
                </View>

                {/* MAIN CONTENT WRAPPER */}
                <View className={`px-6 ${isTablet ? 'mt-10' : 'mt-6'}`}>

                    {/* RECENT ACTIVITY CARD */}
                    <View className={isTablet ? 'mb-8' : 'mb-6'}>
                        <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl mb-4' : 'text-2xl mb-3'}`}>
                            Recent Activity
                        </Text>

                        {isLoading ? (
                            <View className={`bg-white rounded-[18px] border border-[#E5E7EB] border-b-[3px] border-b-[#D1D5DB] items-center justify-center ${isTablet ? 'h-[100px]' : 'h-[80px]'}`}>
                                <ActivityIndicator size="small" color="#62A9E6" />
                            </View>
                        ) : hasTracingAssignment || hasMatchingAssignment ? (
                            <View
                                className={`bg-white flex-row items-center ${isTablet ? 'rounded-[24px] px-6 py-5 gap-5 border-[3px] border-b-[6px]' : 'rounded-[18px] px-4 py-4 gap-4 border-[2px] border-b-[5px]'}`}
                                style={{ borderColor: '#BFDBFE', borderBottomColor: '#62A9E6' }}
                            >
                                {/* Icon Badge */}
                                <View
                                    className={`items-center justify-center rounded-2xl bg-[#EFF6FF] ${isTablet ? 'w-[72px] h-[72px]' : 'w-[56px] h-[56px]'}`}
                                >
                                    <Ionicons name="pencil" size={isTablet ? 36 : 28} color="#62A9E6" />
                                </View>

                                {/* Text */}
                                <View className="flex-1">
                                    <Text className={`font-quicksand-bold text-[#374151] ${isTablet ? 'text-2xl' : 'text-lg'}`}>
                                        {hasTracingAssignment && hasMatchingAssignment ? 'Tracing & Matching' : hasTracingAssignment ? 'Tracing' : 'Matching'}
                                    </Text>
                                    <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-lg mt-1' : 'text-sm mt-0.5'}`} numberOfLines={1}>
                                        {recentActivitySubtitle || (hasMatchingAssignment ? 'Matching Activities' : '')}
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View
                                className={`bg-white flex-row items-center border border-dashed ${isTablet ? 'rounded-[24px] px-6 py-5 gap-5 border-[2px]' : 'rounded-[18px] px-4 py-4 gap-4 border-[1.5px]'}`}
                                style={{ borderColor: '#CBD5E1' }}
                            >
                                {/* Icon Badge */}
                                <View
                                    className={`items-center justify-center rounded-2xl bg-[#F8FAFC] ${isTablet ? 'w-[72px] h-[72px]' : 'w-[56px] h-[56px]'}`}
                                >
                                    <Ionicons name="time-outline" size={isTablet ? 36 : 28} color="#94A3B8" />
                                </View>

                                {/* Text */}
                                <View className="flex-1">
                                    <Text className={`font-quicksand-bold text-[#64748B] ${isTablet ? 'text-2xl' : 'text-lg'}`}>
                                        No activity yet
                                    </Text>
                                    <Text className={`font-quicksand-medium text-[#94A3B8] ${isTablet ? 'text-lg mt-1' : 'text-sm mt-0.5'}`}>
                                        Wait for your teacher to assign an activity to start playing!
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* START / ACTIVITIES SECTION */}
                    <View className={isTablet ? 'mt-10' : 'mt-8'}>
                        <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl mb-6' : 'text-2xl mb-4'}`}>
                            Activities
                        </Text>

                        {isLoading ? (
                            <ActivityIndicator size="large" color="#62A9E6" />
                        ) : (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: isTablet ? 24 : 16 }}
                                className="w-full"
                            >
                                {/* Tracing Activity Card - Only shown if assigned */}
                                {hasTracingAssignment && (
                                    <Pressable
                                        onPress={navigateToLesson}
                                        className={`bg-white overflow-hidden ${isTablet
                                            ? 'w-[440px] h-[320px] rounded-[24px] border-[3px] border-b-[6px]'
                                            : 'w-[280px] h-[240px] rounded-[18px] border-[2px] border-b-[5px]'
                                            }`}
                                        style={{ borderColor: '#FDBA74', borderBottomColor: '#FB923C' }}
                                    >
                                        <View className="w-full h-[60%] bg-[#FFF7ED]">
                                            <Image
                                                source={require('../../../../assets/images/activities/tracing-header.png')}
                                                className="w-full h-full"
                                                resizeMode="cover"
                                            />
                                        </View>
                                        <View className={`flex-1 justify-center bg-white ${isTablet ? 'px-6 py-4' : 'px-4 py-3'}`}>
                                            <View className="flex-row items-center justify-between w-full">
                                                <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-3xl'}`}>Tracing</Text>
                                                <View
                                                    className={`flex-row items-center justify-center border-[2px] rounded-full ${isTablet ? 'px-6 py-2 gap-2' : 'px-4 py-1.5 gap-1'}`}
                                                    style={{ borderColor: '#FDBA74', backgroundColor: '#FFF7ED' }}
                                                >
                                                    <Ionicons name="play" size={isTablet ? 18 : 14} color="#FB923C" />
                                                    <Text className={`font-quicksand-bold ${isTablet ? 'text-xl' : 'text-sm'}`} style={{ color: '#FB923C' }}>Start</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </Pressable>
                                )}

                                {/* Matching Activity Card - Only shown if assigned */}
                                {hasMatchingAssignment && (
                                    <Pressable
                                        onPress={navigateToLesson}
                                        className={`bg-white overflow-hidden ${isTablet
                                            ? 'w-[440px] h-[320px] rounded-[24px] border-[3px] border-b-[6px]'
                                            : 'w-[280px] h-[240px] rounded-[18px] border-[2px] border-b-[5px]'
                                            }`}
                                        style={{ borderColor: '#F7890F', borderBottomColor: '#D66F00' }}
                                    >
                                        <View className="w-full h-[60%] bg-[#FFF7ED]">
                                            <Image
                                                source={require('../../../../assets/images/activities/matching-header.png')}
                                                className="w-full h-full"
                                                resizeMode="cover"
                                            />
                                        </View>
                                        <View className={`flex-1 justify-center bg-white ${isTablet ? 'px-6 py-4' : 'px-4 py-3'}`}>
                                            <View className="flex-row items-center justify-between w-full">
                                                <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-3xl'}`}>Matching</Text>
                                                <View
                                                    className={`flex-row items-center justify-center border-[2px] rounded-full ${isTablet ? 'px-6 py-2 gap-2' : 'px-4 py-1.5 gap-1'}`}
                                                    style={{ borderColor: '#F7890F', backgroundColor: '#FFF3E0' }}
                                                >
                                                    <Ionicons name="play" size={isTablet ? 18 : 14} color="#F7890F" />
                                                    <Text className={`font-quicksand-bold ${isTablet ? 'text-xl' : 'text-sm'}`} style={{ color: '#F7890F' }}>Start</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </Pressable>
                                )}

                            </ScrollView>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}