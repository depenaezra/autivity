import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { getStudentHeaderDetails, StudentHeaderDetails } from '../../../src/services/student-analytics';
import Milestones from './milestones';
import OverviewCards from './overview-cards';
import Sessions from './sessions';
import StudentDevelopmentalSkillsHeatmap from './student-developmental-skills-heatmap';
import StudentEvaluationTrend from './student-evaluation-trend';




interface StudentViewProps {
    studentId: string;
    onBack: () => void;
}

export default function StudentView({ studentId, onBack }: StudentViewProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const [studentData, setStudentData] = useState<StudentHeaderDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDetails() {
            setIsLoading(true);
            try {
                const data = await getStudentHeaderDetails(studentId);
                setStudentData(data);
                setError(null);
            } catch (err: any) {
                console.error('StudentView: error loading student details', err);
                setError('Failed to load student details.');
            } finally {
                setIsLoading(false);
            }
        }
        fetchDetails();
    }, [studentId]);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <View className={`w-full flex-col ${isTablet ? 'px-12 pt-6' : 'px-6 pt-5'}`}>
            {/* Back Button */}
            <View className="flex-row mb-4">
                <Pressable
                    onPress={onBack}
                    className="flex-row items-center gap-2 bg-white border border-[#E5E7EB] px-3.5 py-2 rounded-xl active:opacity-90"
                >
                    <Feather name="arrow-left" size={18} color="#4B5563" />
                    <Text className="font-quicksand-bold text-sm text-[#4B5563]">
                        Back to Student List
                    </Text>
                </Pressable>
            </View>

            {isLoading ? (
                <View className="w-full justify-center items-center py-20 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
                    <ActivityIndicator size="large" color="#62A9E6" />
                    <Text className="mt-3 font-quicksand-semibold text-sm text-[#9CA3AF]">
                        Loading student details...
                    </Text>
                </View>
            ) : error || !studentData ? (
                <View className="w-full justify-center items-center py-10 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm px-6">
                    <Feather name="alert-circle" size={36} color="#EF4444" />
                    <Text className="font-fredoka-one text-lg text-[#4B5563] mt-3 text-center">
                        Error Loading Data
                    </Text>
                    <Text className="font-quicksand-medium text-sm text-[#9CA3AF] mt-1 text-center">
                        {error || 'Student details not found.'}
                    </Text>
                </View>
            ) : (
                <>
                    {/* Header Info Container */}
                    <View className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
                        <View className="flex-row flex-wrap items-center justify-between gap-4">
                            <View className="flex-1 min-w-[200px]">
                                <View className="flex-row items-center flex-wrap gap-2.5">
                                    <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
                                        {studentData.name}
                                    </Text>

                                    {studentData.learnerCode ? (
                                        <View className="bg-[#EFF6FF] border border-[#BFDBFE] px-3 py-1 rounded-full flex-row items-center gap-1.5">
                                            <Text className="font-quicksand-bold text-xs text-[#2563EB]">
                                                {studentData.learnerCode}
                                            </Text>
                                        </View>
                                    ) : null}
                                </View>

                                {/* Student Details Meta Info */}
                                <View className="flex-row flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                                    <View className="flex-row items-center gap-1.5">
                                        <Ionicons name="school-outline" size={16} color="#62A9E6" />
                                        <Text className="font-quicksand-bold text-[#4B5563] text-sm">
                                            {studentData.grade}
                                        </Text>
                                    </View>

                                    <Text className="text-[#D1D5DB]">•</Text>

                                    <View className="flex-row items-center gap-1.5">
                                        <Feather name="calendar" size={16} color="#62A9E6" />
                                        <Text className="font-quicksand-medium text-[#4B5563] text-sm">
                                            Last Session: {studentData.lastSessionDate ? formatDate(studentData.lastSessionDate) : 'No sessions recorded'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Student Overview Cards */}
                    <OverviewCards studentId={studentId} />

                    {/* Student Evaluation Trend Chart */}
                    <StudentEvaluationTrend studentId={studentId} />

                    {/* Developmental Skills Exposure Heatmap */}
                    <View className="mt-6 flex-col">
                        <Text className="font-fredoka-one text-xl text-[#4B5563]">
                            Developmental Skills Exposure
                        </Text>
                        <Text className="font-quicksand-medium text-sm text-[#9CA3AF] mt-1.5">
                            Shows how frequently each developmental subskill has been practiced. This represents learning exposure, not mastery.
                        </Text>
                        <StudentDevelopmentalSkillsHeatmap studentId={studentId} />
                    </View>

                    {/* Milestones */}
                    <Milestones studentId={studentId} />

                    {/* Completed Sessions */}
                    <Sessions studentId={studentId} studentName={studentData.name} />
                </>
            )}
        </View>
    );
}
