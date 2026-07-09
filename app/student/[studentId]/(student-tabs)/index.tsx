import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

export default function StudentHome() {
    const router = useRouter();

    // Get the student's name passed from the [classId].tsx screen
    const { studentName } = useLocalSearchParams();

    // Screen width check for responsive scaling
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    // --- TIMER LOGIC ---
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    useEffect(() => {
        // This dynamically assigns the correct type based on your environment
        let interval: ReturnType<typeof setInterval>;

        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsTimerRunning(false);
        }

        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft]);

    // Format the seconds into MM:SS
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const toggleTimer = () => {
        if (timeLeft > 0) {
            setIsTimerRunning(!isTimerRunning);
        }
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
                            className={`rounded-full bg-[#E5E7EB] border-white shadow-sm ${isTablet ? 'w-[180px] h-[180px] border-[8px]' : 'w-[120px] h-[120px] border-[6px]'
                                }`}
                        />
                    </View>

                    <Text className={`font-extrabold text-[#374151] ${isTablet ? 'text-6xl mt-4' : 'text-4xl mt-3'}`}>
                        {studentName || 'Monna'}
                    </Text>
                    <Text className={`text-[#9CA3AF] font-medium ${isTablet ? 'text-2xl mt-1' : 'text-lg'}`}>
                        Grade 1
                    </Text>
                </View>

                {/* MAIN CONTENT WRAPPER */}
                <View className={`px-6 ${isTablet ? 'mt-10' : 'mt-6'}`}>

                    {/* TIMER CARD */}
                    <View className={`bg-white w-full flex-row items-center justify-between border-[2px] border-[#E5E7EB] ${isTablet ? 'rounded-[24px] p-6' : 'rounded-[16px] p-4'
                        }`}>
                        <View className="flex-row items-center">
                            {/* Timer Icon Circle */}
                            <View className={`items-center justify-center rounded-full border-[3px] border-[#62A9E6] ${isTimerRunning ? 'opacity-50' : 'opacity-100' // Visual feedback when running
                                } ${isTablet ? 'w-16 h-16 mr-4' : 'w-12 h-12 mr-3'}`}>
                                <Ionicons name="hourglass-outline" size={isTablet ? 28 : 20} color="#62A9E6" />
                            </View>

                            <Text className={`font-extrabold text-[#374151] ${isTablet ? 'text-5xl mr-6' : 'text-3xl mr-4'}`}>
                                {formattedTime}
                            </Text>

                            <View>
                                <Text className={`font-bold text-[#374151] ${isTablet ? 'text-2xl' : 'text-base'}`}>
                                    Adventure time!
                                </Text>
                                <Text className={`text-[#9CA3AF] ${isTablet ? 'text-lg mt-1' : 'text-xs'}`}>
                                    Explore and play.
                                </Text>
                            </View>
                        </View>

                        {/* Play/Pause Button for Timer */}
                        <Pressable
                            onPress={toggleTimer}
                            className={`bg-[#EBF5FF] items-center justify-center rounded-full ${isTablet ? 'w-14 h-14' : 'w-10 h-10'
                                }`}
                        >
                            <Feather
                                name={isTimerRunning ? "pause" : "play"}
                                size={isTablet ? 24 : 18}
                                color="#62A9E6"
                                // Nudge the play icon slightly to the right to visually center it
                                style={{ marginLeft: isTimerRunning ? 0 : 2 }}
                            />
                        </Pressable>
                    </View>

                    {/* START / ACTIVITIES SECTION */}
                    <View className={isTablet ? 'mt-10' : 'mt-8'}>
                        <Text className={`font-extrabold text-[#4B5563] ${isTablet ? 'text-4xl mb-6' : 'text-2xl mb-4'}`}>
                            Start
                        </Text>

                        {/* Numbers Activity Card (Yellow Theme) */}
                        <View
                            className={`w-full bg-white overflow-hidden ${isTablet
                                ? 'h-[320px] rounded-[24px] border-[3px] border-[#FDE047] border-b-[6px]'
                                : 'h-[240px] rounded-[18px] border-[2px] border-[#FDE047] border-b-[5px]'
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
                                    <Text className={`font-extrabold text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
                                        Numbers
                                    </Text>

                                    {/* Start Button */}
                                    <Pressable className={`flex-row items-center justify-center border-[2px] border-[#FDE047] bg-[#FEF9C3] rounded-full ${isTablet ? 'px-6 py-2 gap-2' : 'px-4 py-1.5 gap-1'
                                        }`}>
                                        <Ionicons name="play" size={isTablet ? 18 : 14} color="#EAB308" />
                                        <Text className={`font-bold text-[#EAB308] ${isTablet ? 'text-xl' : 'text-sm'}`}>
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

                    </View>
                </View>
            </ScrollView>
        </View>
    );
}