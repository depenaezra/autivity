import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

import { ActivitiesSection } from '@/components/student/activities-section';
import { RecentActivityCard } from '@/components/student/recent-activity-card';
import { StudentHeader } from '@/components/student/student-header';

// Import your student services
import { getLatestStudentSession } from '../../../../../src/services/sessions';
import { getStudentActivities, getStudentById } from '../../../../../src/services/students';
import { getClassById } from '../../../../../src/services/classes';

const themeStyles: Record<string, { stroke: string; font: string; fill: string }> = {
  green: { stroke: '#CBFAC4', font: '#179D33', fill: '#CBFAC4' },
  orange: { stroke: '#FFDBD4', font: '#FF8870', fill: '#FFDBD4' },
  yellow: { stroke: '#FFF3C4', font: '#FFAE02', fill: '#FFF3C4' },
  blue: { stroke: '#BBE8FB', font: '#62A9E6', fill: '#BBE8FB' },
};

export default function StudentHome() {
    const router = useRouter();

    // 1. EXTRACT CLASS AND TEACHER IDs HERE
    const { studentId, studentName: initialStudentName, assignedActivities, classId: initialClassId, teacherId: initialTeacherId, themeName: routeThemeName } = useLocalSearchParams();

    // Screen width check for responsive scaling
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    // State for dynamic activities
    const [assignedPaths, setAssignedPaths] = useState<string[]>([]);
    const [latestSession, setLatestSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [classId, setClassId] = useState<string | null>((initialClassId as string) || null);
    const [teacherId, setTeacherId] = useState<string | null>((initialTeacherId as string) || null);
    const [studentName, setStudentName] = useState<string>((initialStudentName as string) || '');
    const [avatar, setAvatar] = useState<string>('');
    const [themeName, setThemeName] = useState<string>((routeThemeName as string) || 'yellow');

    // Fetch the paths when screen loads
    useEffect(() => {
        const loadActivities = async () => {
            if (!studentId) return;

            setIsLoading(true);
            try {
                const paths = await getStudentActivities(studentId as string);
                setAssignedPaths(paths);

                const session = await getLatestStudentSession(studentId as string);
                setLatestSession(session);

                let currentClassId = (initialClassId as string) || classId;
                let currentTeacherId = (initialTeacherId as string) || teacherId;
                let currentName = (initialStudentName as string) || studentName;

                const student = await getStudentById(studentId as string);
                let activeTheme = (routeThemeName as string) || 'yellow';
                if (student) {
                    currentClassId = student.class_id;
                    currentTeacherId = student.teacher_id;
                    currentName = student.name;
                    setAvatar(student.avatar || '');

                    // Fetch class theme as a fallback
                    if (student.class_id) {
                        try {
                            const classData = await getClassById(student.class_id);
                            if (classData && classData.theme_name) {
                                activeTheme = classData.theme_name;
                            }
                        } catch (err) {
                            console.error("Failed to fetch class theme:", err);
                        }
                    }
                }

                setClassId(currentClassId);
                setTeacherId(currentTeacherId);
                setStudentName(currentName);
                setThemeName(activeTheme);
            } catch (e) {
                console.error("Error loading student data:", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadActivities();
    }, [studentId, initialClassId, initialTeacherId, initialStudentName]);

    const isTracingPath = (path: string) => {
        if (['lines', 'shapes', 'letters', 'numbers'].includes(path.toLowerCase())) {
            return true;
        }
        const cleanPath = path.startsWith('activity/tracing/')
            ? path.replace('activity/tracing/', '')
            : path;
        return (
            cleanPath.startsWith('lines/') ||
            cleanPath.startsWith('shapes/') ||
            cleanPath.startsWith('letters/') ||
            cleanPath.startsWith('numbers/')
        );
    };

    const isMatchingPath = (path: string) => {
        const lower = path.toLowerCase();
        return lower === 'matching fruits' || lower === 'matching colors' || lower.includes('drag-drop') || lower.includes('matching') || lower.includes('drag');
    };

    const isBubblePath = (path: string) => {
        const lower = path.toLowerCase();
        return (
            lower === 'free pop' ||
            lower === 'color pop' ||
            lower.includes('bubble') ||
            lower.includes('pop')
        );
    };

    // Logic: Check if any tracing activity is assigned
    const hasTracingAssignment = assignedPaths.some(isTracingPath);

    const hasMatchingAssignment = assignedPaths.some(isMatchingPath);

    const hasBubbleAssignment = assignedPaths.some(isBubblePath);


    // Derive recent activity subtitle from assigned paths
    const tracingCategories = [
        { key: 'lines', label: 'Lines' },
        { key: 'shapes', label: 'Shapes' },
        { key: 'letters', label: 'Letters' },
        { key: 'numbers', label: 'Numbers' },
    ]
        .filter(cat => assignedPaths.some(p => {
            const cleanPath = p.startsWith('activity/tracing/')
                ? p.replace('activity/tracing/', '')
                : p.toLowerCase();
            return cleanPath === cat.key || cleanPath.startsWith(`${cat.key}/`);
        }))
        .map(cat => cat.label);

    const recentActivitySubtitle = tracingCategories.length > 0
        ? tracingCategories.join(', ')
        : null;

    const isPickChoicePath = (path: string) => {
        const lower = path.toLowerCase();
        return (
            lower.includes('pick') ||
            lower.includes('choice') ||
            lower.includes('identification') ||
            lower.includes('picture-word')
        );
    };

    // 2. PASS THE IDs TO THE LESSON ROUTE
    const navigateToLesson = (activityType: 'tracing' | 'matching' | 'bubble' | 'pick-n-choose') => {
        const targetStudentId = (studentId as string) || '1';

        // Filter to only match the activityType
        const filteredPaths = assignedPaths.filter(path => {
            if (activityType === 'tracing') {
                return isTracingPath(path);
            } else if (activityType === 'matching') {
                return isMatchingPath(path);
            } else if (activityType === 'bubble') {
                return isBubblePath(path);
            } else {
                return isPickChoicePath(path);
            }
        });

        router.push({
            pathname: `/student/${targetStudentId}/lesson` as any,
            params: {
                studentId: targetStudentId,
                studentName: studentName,
                assignedActivities: JSON.stringify(filteredPaths),
                activityType: activityType,
                classId: classId as string,
                teacherId: teacherId as string
            }
        });
    };

    return (
        <View className="flex-1 bg-[#FBFBFB]">
            <ScrollView
                contentContainerStyle={{ paddingBottom: isTablet ? 100 : 60 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* STUDENT HEADER */}
                <StudentHeader
                    name={studentName || 'Monna'}
                    avatar={avatar}
                    onBackPress={() => router.back()}
                    isTablet={isTablet}
                />

                {/* MAIN CONTENT WRAPPER */}
                <View className="px-6">
                    {/* RECENT ACTIVITY CARD */}
                    <RecentActivityCard
                        latestSession={latestSession}
                        isLoading={isLoading}
                    />
                </View>

                {/* ACTIVITIES SECTION */}
                <ActivitiesSection
                    assignedPaths={assignedPaths}
                    isLoading={isLoading}
                    isTablet={isTablet}
                    onNavigateToLesson={navigateToLesson}
                />
            </ScrollView>
        </View>
    );
}