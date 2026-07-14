import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

export default function StudentHome() {
    const router = useRouter();

    // Get the student's name passed from the [classId].tsx screen
    const { studentId, studentName } = useLocalSearchParams();

    // Screen width check for responsive scaling
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    const navigateToLesson = () => {
        const targetStudentId = (studentId as string) || '1';
        router.push({
            pathname: `/student/${targetStudentId}/lesson` as any,
            params: {
                studentId: targetStudentId,
                studentName: (studentName as string) || 'Monna'
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

                {/* HEADER IMAGE SECTION (Pink Curve) */}
                <View className={`w-full ${isTablet ? 'h-[320px]' : 'h-[220px]'}`}>
                    <Image
                        source={require('../../../../assets/images/student-pink-header.png')}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                </View>

                {/* AVATAR & NAME SECTION */}
                <View className={`items-center px-6 ${isTablet ? '-mt-[100px]' : '-mt-[70px]'}`}>
                    <View className="relative">
                        {/* Avatar Placeholder */}
                        <View
                            className={`rounded-full bg-[#E5E7EB] border-white shadow-sm items-center justify-center ${isTablet ? 'w-[180px] h-[180px] border-[8px]' : 'w-[120px] h-[120px] border-[6px]'
                                }`}
                        >
                            <Ionicons name="person" size={isTablet ? 90 : 60} color="#9CA3AF" />
                        </View>
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

                    {/* RECENT ACTIVITY FINISHED CARD */}
                    <View className={`bg-white w-full flex-row items-center justify-between border-[2px] border-[#E5E7EB] ${
                        isTablet ? 'rounded-[24px] p-6' : 'rounded-[16px] p-4'
                    }`}>
                        <View className="flex-row items-center flex-1">
                            {/* Trophy Icon Circle */}
                            <View className={`items-center justify-center rounded-full border-[3px] border-[#10B981] bg-[#D1FAE5] ${
                                isTablet ? 'w-16 h-16 mr-5' : 'w-12 h-12 mr-3.5'
                            }`}>
                                <Ionicons name="trophy" size={isTablet ? 30 : 22} color="#10B981" />
                            </View>

                            <View className="flex-1">
                                <Text className={`font-quicksand-bold text-[#10B981] tracking-wider ${isTablet ? 'text-base mb-1' : 'text-[11px] mb-0.5'}`}>
                                    RECENT ACTIVITY FINISHED
                                </Text>
                                <Text className={`font-quicksand-bold text-[#374151] ${isTablet ? 'text-3xl' : 'text-xl'}`}>
                                    Zigzag Lines Tracing
                                </Text>
                                <Text className={`text-[#9CA3AF] font-quicksand-medium ${isTablet ? 'text-lg mt-1' : 'text-xs mt-0.5'}`}>
                                    Great job! You earned +15 stars ⭐
                                </Text>
                            </View>
                        </View>

                        {/* Status Badge */}
                        <View className={`bg-[#ECFDF5] border border-[#A7F3D0] items-center justify-center rounded-full ${
                            isTablet ? 'px-5 py-2.5 ml-4' : 'px-3 py-1.5 ml-2'
                        }`}>
                            <Text className={`font-quicksand-bold text-[#059669] ${isTablet ? 'text-lg' : 'text-xs'}`}>
                                Finished
                            </Text>
                        </View>
                    </View>

                    {/* START / ACTIVITIES SECTION */}
                    <View className={isTablet ? 'mt-10' : 'mt-8'}>
                        <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl mb-6' : 'text-2xl mb-4'}`}>
                            Start
                        </Text>

                        {/* Scrollable Horizontal Activity Cards */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: isTablet ? 24 : 16 }}
                            className="w-full"
                        >
                            {/* Numbers Activity Card (Yellow Theme) */}
                            <View
                                className={`bg-white overflow-hidden ${isTablet
                                    ? 'w-[440px] h-[320px] rounded-[24px] border-[3px] border-[#FDE047] border-b-[6px]'
                                    : 'w-[280px] h-[240px] rounded-[18px] border-[2px] border-[#FDE047] border-b-[5px]'
                                }`}
                            >
                                {/* Top Image Container */}
                                <View className="w-full h-[60%] bg-[#FEF9C3]">
                                    <Image
                                        source={require('../../../../assets/images/lesson-numbers-header.png')}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                </View>

                                {/* Bottom Text & Button Container */}
                                <View className={`flex-1 justify-center bg-white ${isTablet ? 'px-6 py-4' : 'px-4 py-3'}`}>
                                    <View className="flex-row items-center justify-between w-full">
                                        <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-3xl'}`}>
                                            Numbers
                                        </Text>

                                        {/* Start Button */}
                                        <Pressable className={`flex-row items-center justify-center border-[2px] border-[#FDE047] bg-[#FEF9C3] rounded-full ${isTablet ? 'px-6 py-2 gap-2' : 'px-4 py-1.5 gap-1'
                                            }`}>
                                            <Ionicons name="play" size={isTablet ? 18 : 14} color="#EAB308" />
                                            <Text className={`font-quicksand-bold text-[#EAB308] ${isTablet ? 'text-xl' : 'text-sm'}`}>
                                                Start
                                            </Text>
                                        </Pressable>
                                    </View>

                                    {/* Progress Bar under the text */}
                                    <View className={`w-full bg-[#FEF08A] rounded-full overflow-hidden ${isTablet ? 'h-3 mt-4' : 'h-2 mt-3'}`}>
                                        {/* Assuming 30% progress for visual display */}
                                        <View className="bg-[#FACC15] h-full w-[30%] rounded-full" />
                                    </View>
                                </View>
                            </View>

                            {/* Tracing Activity Card (Orange Theme) */}
                            <Pressable
                                onPress={navigateToLesson}
                                className={`bg-white overflow-hidden ${isTablet
                                    ? 'w-[440px] h-[320px] rounded-[24px] border-[3px] border-b-[6px]'
                                    : 'w-[280px] h-[240px] rounded-[18px] border-[2px] border-b-[5px]'
                                }`}
                                style={{ borderColor: '#FDBA74', borderBottomColor: '#FB923C' }}
                            >
                                {/* Top Image Container */}
                                <View className="w-full h-[60%] bg-[#FFF7ED]">
                                    <Image
                                        source={require('../../../../assets/images/tracing-header.png')}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                </View>

                                {/* Bottom Text & Button Container */}
                                <View className={`flex-1 justify-center bg-white ${isTablet ? 'px-6 py-4' : 'px-4 py-3'}`}>
                                    <View className="flex-row items-center justify-between w-full">
                                        <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-3xl'}`}>
                                            Tracing
                                        </Text>

                                        {/* Start Button */}
                                        <View 
                                            className={`flex-row items-center justify-center border-[2px] rounded-full ${isTablet ? 'px-6 py-2 gap-2' : 'px-4 py-1.5 gap-1'}`}
                                            style={{ borderColor: '#FDBA74', backgroundColor: '#FFF7ED' }}
                                        >
                                            <Ionicons name="play" size={isTablet ? 18 : 14} color="#FB923C" />
                                            <Text className={`font-quicksand-bold ${isTablet ? 'text-xl' : 'text-sm'}`} style={{ color: '#FB923C' }}>
                                                Start
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Progress Bar under the text */}
                                    <View className={`w-full rounded-full overflow-hidden ${isTablet ? 'h-3 mt-4' : 'h-2 mt-3'}`} style={{ backgroundColor: '#FFEDD5' }}>
                                        <View className="h-full rounded-full" style={{ width: '60%', backgroundColor: '#FB923C' }} />
                                    </View>
                                </View>
                            </Pressable>
                        </ScrollView>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}