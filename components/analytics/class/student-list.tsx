import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from 'react-native';
import { getClassPendingFeedbackCounts } from '../../../src/services/class-analytics';
import { getClassStudents } from '../../../src/services/students';
import { supabase } from '../../../src/lib/supabase';

interface StudentListProps {
    classId: string;
    onBack: () => void;
    onSelectStudent?: (studentId: string) => void;
}

export default function StudentList({ classId, onBack, onSelectStudent }: StudentListProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const [students, setStudents] = useState<any[]>([]);
    const [pendingFeedbackCounts, setPendingFeedbackCounts] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchStudentsAndFeedbacks() {
            setIsLoading(true);
            try {
                if (classId === 'all') {
                    const { data: { user }, error: authError } = await supabase.auth.getUser();
                    if (authError || !user) throw new Error('User not logged in');

                    const { data, error: dbError } = await supabase
                        .from('students')
                        .select('*, classes(title, theme_name)')
                        .eq('teacher_id', user.id)
                        .order('created_at', { ascending: true });

                    if (dbError) throw dbError;

                    const studentData = (data || []).map((student: any) => ({
                        ...student,
                        assigned_activities: student.assigned_activities || [],
                        class_name: student.classes?.title || 'No Class',
                        class_theme: student.classes?.theme_name || 'blue',
                    }));

                    setStudents(studentData);
                    setPendingFeedbackCounts({});
                } else {
                    const [studentData, feedbackCounts] = await Promise.all([
                        getClassStudents(classId),
                        getClassPendingFeedbackCounts(classId)
                    ]);
                    setStudents(studentData);
                    setPendingFeedbackCounts(feedbackCounts);
                }
                setError(null);
            } catch (err: any) {
                console.error('StudentList: failed to fetch list or feedbacks', err);
                setError('Failed to load student list.');
            } finally {
                setIsLoading(false);
            }
        }
        fetchStudentsAndFeedbacks();
    }, [classId]);

    const filteredStudents = useMemo(() => {
        return students.filter((student) =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [students, searchQuery]);

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
                        {classId === 'all' ? 'Back to Dashboard' : 'Back to Class Analytics'}
                    </Text>
                </Pressable>
            </View>

            {/* Header */}
            <View className="mb-6">
                <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
                    Student List
                </Text>
                <Text className={`font-quicksand-medium text-[#9CA3AF] mt-1 ${isTablet ? 'text-lg' : 'text-sm'}`}>
                    {classId === 'all' ? 'Manage and view your students' : 'Manage and view students enrolled in this class'}
                </Text>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center bg-white border-2 border-[#E5E7EB] rounded-2xl px-4 py-3 mb-6 gap-3 shadow-sm">
                <Feather name="search" size={20} color="#9CA3AF" />
                <TextInput
                    className="flex-1 font-quicksand-bold text-sm text-[#4B5563]"
                    placeholder="Search students by name..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery('')}>
                        <Feather name="x" size={18} color="#9CA3AF" />
                    </Pressable>
                )}
            </View>

            {isLoading ? (
                <View className="w-full justify-center items-center py-20 bg-white border-2 border-[#E5E7EB] rounded-2xl shadow-sm" style={{ borderBottomWidth: 6 }}>
                    <ActivityIndicator size="large" color="#62A9E6" />
                    <Text className="mt-3 font-quicksand-semibold text-sm text-[#9CA3AF]">
                        Loading student list...
                    </Text>
                </View>
            ) : error ? (
                <View className="w-full justify-center items-center py-10 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm px-6">
                    <Feather name="alert-circle" size={36} color="#EF4444" />
                    <Text className="font-fredoka-one text-lg text-[#4B5563] mt-3 text-center">
                        Error Loading Data
                    </Text>
                    <Text className="font-quicksand-medium text-sm text-[#9CA3AF] mt-1 text-center">
                        {error}
                    </Text>
                </View>
            ) : (
                <View
                    className="bg-white rounded-2xl border-[3px] border-[#E5E7EB] overflow-hidden shadow-sm flex-col p-4"
                    style={{ borderBottomWidth: 6 }}
                >
                    {filteredStudents.length === 0 ? (
                        <View className="py-12 items-center justify-center">
                            <Feather name="users" size={36} color="#9CA3AF" />
                            <Text className="mt-3 font-quicksand-semibold text-sm text-[#4B5563]">
                                {students.length === 0 
                                    ? (classId === 'all' ? 'You have no students.' : 'No students enrolled in this class.') 
                                    : 'No students matching your search.'}
                            </Text>
                        </View>
                    ) : (
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
                            <View style={{ minWidth: isTablet ? '100%' : 630 }}>
                                {/* Table Header */}
                                <View className="flex-row bg-[#F9FAFB] border border-[#E5E7EB] rounded-t-xl px-4 py-3">
                                    <Text className="flex-1 font-quicksand-bold text-xs text-[#4B5563]">STUDENT</Text>
                                    <Text className="w-[200px] font-quicksand-bold text-xs text-[#4B5563] px-2">BIO</Text>
                                    {classId === 'all' ? (
                                        <Text className="w-[150px] font-quicksand-bold text-xs text-[#4B5563] text-right">CLASS</Text>
                                    ) : (
                                        <Text className="w-[150px] font-quicksand-bold text-xs text-[#4B5563] text-right">PENDING FEEDBACKS</Text>
                                    )}
                                </View>

                                {/* Table Rows */}
                                <ScrollView style={{ maxHeight: 450 }} showsVerticalScrollIndicator={true} bounces={true}>
                                    <View className="border-x border-b border-[#E5E7EB] rounded-b-xl overflow-hidden">
                                        {filteredStudents.map((student, idx) => {
                                            const isEven = idx % 2 === 0;
                                            const pendingCounts = pendingFeedbackCounts[student.id] || 0;
                                            return (
                                                <Pressable
                                                    key={student.id}
                                                    onPress={() => onSelectStudent?.(student.id)}
                                                    className="flex-row items-center px-4 py-3.5 border-b border-[#F3F4F6] last:border-b-0 active:opacity-85"
                                                    style={{ backgroundColor: isEven ? '#FFFFFF' : '#F9FAFB' }}
                                                >
                                                    {/* Student Profile Column */}
                                                    <View className="flex-1 flex-row items-center gap-3">
                                                        <View className="w-10 h-10 rounded-full bg-[#EFF6FF] items-center justify-center border border-[#BFDBFE]">
                                                            <Text style={{ fontSize: 20 }}>{student.avatar || '🙂'}</Text>
                                                        </View>
                                                        <View className="flex-1">
                                                            <View className="flex-row items-center">
                                                                <Text className="font-fredoka-one text-sm text-[#4B5563]">
                                                                    {student.name}
                                                                </Text>
                                                                <View className="bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded-full ml-2">
                                                                    <Text className="font-quicksand-bold text-[9px] text-[#2563EB]">
                                                                        {student.learner_code}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                            <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-0.5">
                                                                {student.spectrum_level || 'Not Specified'}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    {/* Bio Column */}
                                                    <Text
                                                        className="w-[200px] font-quicksand-medium text-xs text-[#6B7280] px-2"
                                                        numberOfLines={2}
                                                    >
                                                        {student.bio || 'No bio written.'}
                                                    </Text>

                                                    {/* Pending Feedbacks or Class Column */}
                                                    <View className="w-[150px] items-end justify-center">
                                                        {classId === 'all' ? (
                                                            (() => {
                                                                const themeName = student.class_theme || 'blue';
                                                                const colors: Record<string, { bg: string, text: string, border: string }> = {
                                                                    green: { bg: '#D1FAE5', text: '#059669', border: '#86EFAC' },
                                                                    orange: { bg: '#FFEDD5', text: '#EA580C', border: '#FDBA74' },
                                                                    yellow: { bg: '#FEF9C3', text: '#CA8A04', border: '#FDE047' },
                                                                    blue: { bg: '#DBEAFE', text: '#2563EB', border: '#93C5FD' },
                                                                };
                                                                const themeColors = colors[themeName] || colors.blue;
                                                                return (
                                                                    <View 
                                                                        style={{ backgroundColor: themeColors.bg, borderColor: themeColors.border }}
                                                                        className="px-2.5 py-1 rounded-full border"
                                                                    >
                                                                        <Text style={{ color: themeColors.text }} className="font-quicksand-bold text-[10px]">
                                                                            {student.class_name || 'No Class'}
                                                                        </Text>
                                                                    </View>
                                                                );
                                                            })()
                                                        ) : (
                                                            pendingCounts > 0 ? (
                                                                <View className="bg-[#FFF7ED] border border-[#FDBA74] px-2.5 py-1 rounded-full flex-row items-center gap-1">
                                                                    <View className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
                                                                    <Text className="font-quicksand-bold text-[10px] text-[#EA580C]">
                                                                        {pendingCounts} Pending Feedbacks
                                                                    </Text>
                                                                </View>
                                                            ) : (
                                                                <View className="bg-[#F3F4F6] border border-[#E5E7EB] px-2.5 py-1 rounded-full flex-row items-center gap-1">
                                                                    <View className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
                                                                    <Text className="font-quicksand-bold text-[10px] text-[#6B7280]">
                                                                        0 Pending Feedbacks
                                                                    </Text>
                                                                </View>
                                                            )
                                                        )}
                                                    </View>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </ScrollView>
                            </View>
                        </ScrollView>
                    )}
                </View>
            )}
        </View>
    );
}
