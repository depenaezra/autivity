import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SetManager from '@/components/set-manager';
import { getActivitiesBySubcategories, getDefaultActivities } from '@/src/services/materials';
import { getStudentById } from '@/src/services/students';

export default function LessonScreen() {
    const params = useLocalSearchParams();
    const studentId = Array.isArray(params.studentId) ? params.studentId[0] : params.studentId || '1';
    const initialClassId = Array.isArray(params.classId) ? params.classId[0] : params.classId;
    const initialTeacherId = Array.isArray(params.teacherId) ? params.teacherId[0] : params.teacherId;
    const activityType = Array.isArray(params.activityType) ? params.activityType[0] : params.activityType;

    const [classId, setClassId] = useState<string | null>(initialClassId || null);
    const [teacherId, setTeacherId] = useState<string | null>(initialTeacherId || null);
    const [activityPool, setActivityPool] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

                setActivityPool(pool);

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
                    setActivityPool(fallback);
                } catch {
                    setActivityPool([]);
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadAssigned();
    }, [params.assignedActivities, studentId, initialClassId, initialTeacherId, activityType]);

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#62A9E6" />
                <Text className="mt-4 font-quicksand-bold text-[#6B7280] text-lg">Loading Lesson Activities...</Text>
            </SafeAreaView>
        );
    }

    if (!activityPool || activityPool.length === 0) {
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
        <SetManager
            activityPool={activityPool}
            studentId={studentId}
            classId={classId}
            teacherId={teacherId}
            activityType={activityType}
        />
    );
}
