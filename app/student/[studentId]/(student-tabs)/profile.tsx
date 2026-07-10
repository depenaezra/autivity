import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

export default function StudentProfile() {
    const router = useRouter();
    const { studentName } = useLocalSearchParams();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

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
                            className={`rounded-full border-white shadow-sm overflow-hidden ${isTablet ? 'w-[140px] h-[140px] border-[6px]' : 'w-[100px] h-[100px] border-[4px]'
                                }`}
                        >
                            {/* Profile Picture Image */}
                            <Image
                                source={require('../../../../assets/images/bear.png')}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        </View>

                        {/* Camera Icon Badge */}
                        <Pressable
                            className={`absolute bg-[#62A9E6] rounded-full items-center justify-center border-white ${isTablet ? 'w-10 h-10 bottom-1 right-2 border-[3.5px]' : 'w-8 h-8 bottom-0 right-0 border-[2.5px]'
                                }`}
                        >
                            <Feather name="camera" size={isTablet ? 16 : 14} color="white" />
                        </Pressable>
                    </View>

                    <Text className={`font-fredoka-one text-[#374151] ${isTablet ? 'text-4xl mt-3' : 'text-2xl mt-2'}`}>
                        {studentName || 'Monna'}
                    </Text>
                    <View className="bg-[#EBF5FF] border border-[#9ACBF9] rounded-full px-4 py-1 mt-2">
                        <Text className={`text-[#0284C7] font-quicksand-bold ${isTablet ? 'text-lg' : 'text-sm'}`}>
                            Grade 1 Explorer
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
                                <Text className={`font-fredoka-one text-[#62A9E6] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
                                    14
                                </Text>
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
                            <View className="h-8 w-[1px] bg-[#F3F4F6]" />
                            <View className="items-center">
                                <Text className={`font-fredoka-one text-[#4ADE80] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
                                    3
                                </Text>
                                <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-lg mt-1' : 'text-xs'}`}>
                                    Days Streak
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* CLASS & TEACHER SECTION */}
                    <View className={isTablet ? 'mt-8' : 'mt-6'}>
                        <View className="flex-row items-center mb-3">
                            <Text className={`text-[#6B7280] font-quicksand-semibold tracking-widest mr-2 ${isTablet ? 'text-base' : 'text-sm'}`}>
                                CLASS & TEACHER
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
                                <Text className={`font-quicksand-medium flex-1 text-right text-[#9CA3AF] ${isTablet ? 'text-lg' : 'text-sm'}`}>
                                    Class 1A (Level 1)
                                </Text>
                            </View>

                            {/* Teacher Row */}
                            <View className={`flex-row items-center justify-between border-b border-[#F3F4F6] ${isTablet ? 'pb-4 mb-4' : 'pb-3 mb-3'}`}>
                                <View className="flex-row items-center">
                                    <Ionicons name="person-circle-outline" size={isTablet ? 24 : 18} color="#62A9E6" />
                                    <Text className={`font-quicksand-medium text-[#4B5563] ml-3 ${isTablet ? 'w-[120px] text-lg' : 'w-[90px] text-sm'}`}>
                                        Teacher
                                    </Text>
                                </View>
                                <Text className={`font-quicksand-medium flex-1 text-right text-[#9CA3AF] ${isTablet ? 'text-lg' : 'text-sm'}`}>
                                    Ms. Anne Santos
                                </Text>
                            </View>

                            {/* School Row */}
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Ionicons name="business-outline" size={isTablet ? 24 : 18} color="#62A9E6" />
                                    <Text className={`font-quicksand-medium text-[#4B5563] ml-3 ${isTablet ? 'w-[120px] text-lg' : 'w-[90px] text-sm'}`}>
                                        School
                                    </Text>
                                </View>
                                <Text className={`font-quicksand-medium flex-1 text-right text-[#9CA3AF] ${isTablet ? 'text-lg' : 'text-sm'}`}>
                                    Nasugbu East Central School
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
                                    STU-2026-01
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
                    <View className={`mb-8 ${isTablet ? 'mt-10 gap-y-6' : 'mt-8 gap-y-4'}`}>
                        {/* Switch Student Button */}
                        <Pressable className={`w-full bg-[#E1F0FF] rounded-full items-center justify-center ${isTablet ? 'h-[76px]' : 'h-[55px]'}`}>
                            <Text className={`text-[#0284C7] font-fredoka-regular ${isTablet ? 'text-xl' : 'text-lg'}`}>Switch Student</Text>
                        </Pressable>

                        {/* Log out Button */}
                        <Pressable className={`w-full bg-[#FFE4E6] rounded-full items-center justify-center ${isTablet ? 'h-[76px]' : 'h-[55px]'}`}>
                            <Text className={`text-[#E11D48] font-fredoka-regular ${isTablet ? 'text-xl' : 'text-lg'}`}>Log out</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
