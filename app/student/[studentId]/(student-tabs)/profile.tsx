import { Feather, Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

// [ADDED] Import supabase directly for fetching data
import { supabase } from '../../../../src/lib/supabase';

export default function StudentProfile() {
    const router = useRouter();
    const { studentId, studentName } = useGlobalSearchParams();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    // [ADDED] State for fetched profile details
    const [studentData, setStudentData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // [ADDED] Fetch the student, class, and teacher details from DB
    useEffect(() => {
        const fetchProfileData = async () => {
            // 1. Safely extract the ID
            const safeId = Array.isArray(studentId) ? studentId[0] : studentId;

            // 2. Stop loading immediately if no ID is found
            if (!safeId) {
                setIsLoading(false);
                return;
            }

            try {
                const { data: student } = await supabase
                    .from('students')
                    .select('*')
                    .eq('id', safeId)
                    .single();

                if (!student) {
                    setIsLoading(false);
                    return;
                }

                const { data: classData } = await supabase
                    .from('classes')
                    .select('title, grade')
                    .eq('id', student.class_id)
                    .single();

                const { data: teacherData } = await supabase
                    .from('profiles')
                    .select('first_name, last_name')
                    .eq('id', student.teacher_id)
                    .single();

                setStudentData({
                    ...student,
                    className: classData?.title || 'Unknown Class',
                    grade: classData?.grade || 'Grade 1',
                    teacherName: teacherData ? `${teacherData.first_name} ${teacherData.last_name}` : 'Unknown Teacher',
                });
            } catch (error) {
                console.error("Error fetching student profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [studentId]);

    return (
        <View className="flex-1 bg-[#F5F8FA]">
            <ScrollView
                contentContainerStyle={{ paddingBottom: isTablet ? 40 : 20 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* HEADER IMAGE SECTION */}
                <View className={`w-full ${isTablet ? 'h-[280px]' : 'h-[200px]'}`}>
                    <Image
                        source={require('../../../../assets/images/student-pink-header.png')}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                </View>

                {/* AVATAR & NAME SECTION */}
                <View className={`items-center px-6 ${isTablet ? '-mt-[100px]' : '-mt-[60px]'}`}>
                    <View className="relative">
                        {/* Avatar Image Container */}
                        <View
                            className={`rounded-full border-white shadow-sm overflow-hidden bg-[#E5E7EB] items-center justify-center ${isTablet ? 'w-[140px] h-[140px] border-[6px]' : 'w-[100px] h-[100px] border-[4px]'
                                }`}
                        >
                            <Ionicons name="person" size={isTablet ? 70 : 50} color="#9CA3AF" />
                        </View>
                        {/* [REMOVED] Camera Icon button deleted from here */}
                    </View>

                    {/* [MODIFIED] Dynamic Name */}
                    <Text className={`font-fredoka-one text-[#374151] ${isTablet ? 'text-4xl mt-3' : 'text-2xl mt-2'}`}>
                        {studentData?.name || studentName || 'Loading...'}
                    </Text>
                    <View className="bg-[#EBF5FF] border border-[#9ACBF9] rounded-full px-4 py-1 mt-2">
                        {/* [MODIFIED] Dynamic Grade */}
                        <Text className={`text-[#0284C7] font-quicksand-bold ${isTablet ? 'text-lg' : 'text-sm'}`}>
                            {studentData?.grade || 'Grade 1'} Explorer
                        </Text>
                    </View>
                </View>

                {/* MAIN CONTENT WRAPPER */}
                <View className="px-6">
                    {/* STATS SECTION */}
                    <View className={isTablet ? 'mt-8' : 'mt-6'}>
                        <View className="flex-row items-center mb-3">
                            <Text className={`text-[#6B7280] font-quicksand-semibold tracking-widest mr-2 ${isTablet ? 'text-base' : 'text-sm'}`}>
                                STUDENT STATS
                            </Text>
                            <Feather name="award" size={isTablet ? 14 : 12} color="#62A9E6" />
                        </View>

                        <View className={`bg-white rounded-[20px] shadow-sm border border-[#F3F4F6] flex-row justify-around items-center ${isTablet ? 'p-6' : 'p-4'}`}>
                            <View className="items-center">
                                {/* Dynamic Assigned Activities Count */}
                                {isLoading ? (
                                    <ActivityIndicator color="#62A9E6" size="small" />
                                ) : (
                                    <Text className={`font-fredoka-one text-[#62A9E6] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
                                        {studentData?.assigned_activities?.length || 0}
                                    </Text>
                                )}
                                <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-lg mt-1' : 'text-xs'}`}>
                                    Activities
                                </Text>
                            </View>
                            <View className="h-8 w-[1px] bg-[#F3F4F6]" />
                            <View className="items-center">
                                <Text className={`font-fredoka-one text-[#FACC15] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
                                    12
                                </Text>
                                <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-lg mt-1' : 'text-xs'}`}>
                                    Stars
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* CLASSROOM DETAILS SECTION */}
                    <View className={isTablet ? 'mt-8' : 'mt-6'}>
                        <View className="flex-row items-center mb-3">
                            <Text className={`text-[#6B7280] font-quicksand-semibold tracking-widest mr-2 ${isTablet ? 'text-base' : 'text-sm'}`}>
                                CLASSROOM DETAILS
                            </Text>
                            <Feather name="book-open" size={isTablet ? 14 : 12} color="#62A9E6" />
                        </View>

                        <View className={`bg-white rounded-[20px] shadow-sm border border-[#F3F4F6] ${isTablet ? 'p-6' : 'p-4'}`}>
                            {/* Classroom Row */}
                            <View className={`flex-row items-center justify-between border-b border-[#F3F4F6] ${isTablet ? 'pb-4 mb-4' : 'pb-3 mb-3'}`}>
                                <View className="flex-row items-center">
                                    <Ionicons name="school-outline" size={isTablet ? 24 : 18} color="#62A9E6" />
                                    <Text className={`font-quicksand-medium text-[#4B5563] ml-3 ${isTablet ? 'w-[120px] text-lg' : 'w-[90px] text-sm'}`}>
                                        Classroom
                                    </Text>
                                </View>
                                {/* Dynamic Class Name & Grade */}
                                <Text className={`font-quicksand-medium flex-1 text-right text-[#9CA3AF] ${isTablet ? 'text-lg' : 'text-sm'}`}>
                                    {studentData?.className || 'Loading...'} ({studentData?.grade || 'Grade 1'})
                                </Text>
                            </View>

                            {/* Teacher Row (Removed bottom border since it is now the last item) */}
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Ionicons name="person-circle-outline" size={isTablet ? 24 : 18} color="#62A9E6" />
                                    <Text className={`font-quicksand-medium text-[#4B5563] ml-3 ${isTablet ? 'w-[120px] text-lg' : 'w-[90px] text-sm'}`}>
                                        Teacher
                                    </Text>
                                </View>
                                {/* Dynamic Teacher Name */}
                                <Text className={`font-quicksand-medium flex-1 text-right text-[#9CA3AF] ${isTablet ? 'text-lg' : 'text-sm'}`}>
                                    Teacher {studentData?.teacherName || 'Loading...'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* FUN SETTINGS SECTION */}
                    <View className={isTablet ? 'mt-8' : 'mt-6'}>
                        <View className="flex-row items-center mb-3">
                            <Text className={`text-[#6B7280] font-quicksand-semibold tracking-widest mr-2 ${isTablet ? 'text-base' : 'text-sm'}`}>
                                FUN SETTINGS
                            </Text>
                            <Feather name="settings" size={isTablet ? 14 : 12} color="#62A9E6" />
                        </View>

                        <View className={`bg-white rounded-[20px] shadow-sm border border-[#F3F4F6] ${isTablet ? 'p-6' : 'p-4'}`}>
                            {/* Music & Sounds Row */}
                            <View className={`flex-row items-center justify-between border-b border-[#F3F4F6] ${isTablet ? 'pb-4 mb-4' : 'pb-3 mb-3'}`}>
                                <View className="flex-row items-center">
                                    <Ionicons name="volume-high-outline" size={isTablet ? 24 : 18} color="#A78BFA" />
                                    <Text className={`font-quicksand-medium text-[#4B5563] ml-3 ${isTablet ? 'text-lg' : 'text-sm'}`}>
                                        Music & Sounds
                                    </Text>
                                </View>
                                <View className={`flex-row items-center bg-[#E1F0FF] border border-[#9ACBF9] rounded-full ${isTablet ? 'px-4 py-2' : 'px-3 py-1.5'}`}>
                                    <Feather name="bell" size={isTablet ? 14 : 12} color="#0284C7" />
                                    <Text className={`text-[#0284C7] font-quicksand-bold ml-1.5 ${isTablet ? 'text-sm' : 'text-xs'}`}>ON</Text>
                                </View>
                            </View>

                            {/* Confetti Effects Row */}
                            <View className={`flex-row items-center justify-between border-b border-[#F3F4F6] ${isTablet ? 'pb-4 mb-4' : 'pb-3 mb-3'}`}>
                                <View className="flex-row items-center">
                                    <Ionicons name="sparkles-outline" size={isTablet ? 24 : 18} color="#FACC15" />
                                    <Text className={`font-quicksand-medium text-[#4B5563] ml-3 ${isTablet ? 'text-lg' : 'text-sm'}`}>
                                        Confetti Effects
                                    </Text>
                                </View>
                                <View className={`flex-row items-center bg-[#E1F0FF] border border-[#9ACBF9] rounded-full ${isTablet ? 'px-4 py-2' : 'px-3 py-1.5'}`}>
                                    <Feather name="bell" size={isTablet ? 14 : 12} color="#0284C7" />
                                    <Text className={`text-[#0284C7] font-quicksand-bold ml-1.5 ${isTablet ? 'text-sm' : 'text-xs'}`}>ON</Text>
                                </View>
                            </View>

                            {/* Daily Rewards Reminders Row */}
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Ionicons name="notifications-outline" size={isTablet ? 24 : 18} color="#62A9E6" />
                                    <Text className={`font-quicksand-medium text-[#4B5563] ml-3 ${isTablet ? 'text-lg' : 'text-sm'}`}>
                                        Daily Reminders
                                    </Text>
                                </View>
                                <View className={`flex-row items-center bg-[#E1F0FF] border border-[#9ACBF9] rounded-full ${isTablet ? 'px-4 py-2' : 'px-3 py-1.5'}`}>
                                    <Feather name="bell" size={isTablet ? 14 : 12} color="#0284C7" />
                                    <Text className={`text-[#0284C7] font-quicksand-bold ml-1.5 ${isTablet ? 'text-sm' : 'text-xs'}`}>ON</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* ACCOUNT SECTION */}
                    <View className={isTablet ? 'mt-8' : 'mt-6'}>
                        <View className="flex-row items-center mb-3">
                            <Text className={`text-[#6B7280] font-quicksand-semibold tracking-widest mr-2 ${isTablet ? 'text-base' : 'text-sm'}`}>
                                ACCOUNT
                            </Text>
                            <Feather name="user" size={isTablet ? 14 : 12} color="#62A9E6" />
                        </View>

                        <View className={`bg-white rounded-[20px] shadow-sm border border-[#F3F4F6] ${isTablet ? 'p-6' : 'p-4'}`}>
                            {/* Student ID Row */}
                            <View className={`flex-row items-center justify-between border-b border-[#F3F4F6] ${isTablet ? 'pb-4 mb-4' : 'pb-3 mb-3'}`}>
                                <Text className={`font-quicksand-medium text-[#4B5563] ${isTablet ? 'w-[140px] text-lg' : 'w-[110px] text-sm'}`}>
                                    Student ID
                                </Text>
                                <Text className={`font-quicksand-medium flex-1 text-right text-[#9CA3AF] ${isTablet ? 'text-lg' : 'text-sm'}`}>
                                    STU-{studentId?.slice(0, 6) || '2026-01'}
                                </Text>
                            </View>

                            {/* Guardian Row */}
                            <View className={`flex-row items-center justify-between border-b border-[#F3F4F6] ${isTablet ? 'pb-4 mb-4' : 'pb-3 mb-3'}`}>
                                <Text className={`font-quicksand-medium text-[#4B5563] ${isTablet ? 'w-[140px] text-lg' : 'w-[110px] text-sm'}`}>
                                    Guardian
                                </Text>
                                <Text className={`font-quicksand-medium flex-1 text-right text-[#9CA3AF] ${isTablet ? 'text-lg' : 'text-sm'}`}>
                                    Mrs. Santos
                                </Text>
                            </View>

                            {/* Emergency Contact Row */}
                            <View className="flex-row items-center justify-between">
                                <Text className={`font-quicksand-medium text-[#4B5563] ${isTablet ? 'w-[140px] text-lg' : 'w-[110px] text-sm'}`}>
                                    Parent Portal
                                </Text>
                                <View className="bg-[#DCFCE7] border border-[#86EFAC] rounded-full px-3 py-1">
                                    <Text className={`text-[#15803D] font-quicksand-bold ${isTablet ? 'text-base' : 'text-xs'}`}>Linked</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* ACTION BUTTONS */}
                    <View className={`mb-8 ${isTablet ? 'mt-10' : 'mt-8'}`}>
                        {/* Switch Student Button */}
                        <Pressable
                            onPress={() => router.back()}
                            className={`w-full bg-[#E1F0FF] rounded-full items-center justify-center ${isTablet ? 'h-[76px]' : 'h-[55px]'}`}
                        >
                            <Text className={`text-[#0284C7] font-fredoka-regular ${isTablet ? 'text-xl' : 'text-lg'}`}>Switch Student</Text>
                        </Pressable>

                        {/* [REMOVED] Log out button deleted from here */}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}