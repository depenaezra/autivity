import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import HeaderBg from '../../../../assets/images/achievements-header.svg';

const MOCK_BADGES = [
    {
        id: '1',
        title: 'First Adventure',
        description: 'Completed your very first activity!',
        icon: 'star' as const,
        color: '#FACC15',
        bgColor: '#FEF9C3',
        borderColor: '#FDE047',
        unlocked: true,
    },
    {
        id: '2',
        title: 'Number Wizard',
        description: 'Mastered counting and simple numbers.',
        icon: 'sparkles' as const,
        color: '#62A9E6',
        bgColor: '#EBF5FF',
        borderColor: '#9ACBF9',
        unlocked: true,
    },
    {
        id: '3',
        title: 'Speedy Explorer',
        description: 'Finished an activity in under 5 minutes!',
        icon: 'flash' as const,
        color: '#4ADE80',
        bgColor: '#DCFCE7',
        borderColor: '#86EFAC',
        unlocked: true,
    },
    {
        id: '4',
        title: 'Super Focus',
        description: 'Stayed focused for the entire timer duration.',
        icon: 'trophy' as const,
        color: '#A78BFA',
        bgColor: '#EDE9FE',
        borderColor: '#DDD6FE',
        unlocked: false,
    },
    {
        id: '5',
        title: 'Daily Hero',
        description: 'Complete activities 3 days in a row.',
        icon: 'heart' as const,
        color: '#F43F5E',
        bgColor: '#FFE4E6',
        borderColor: '#FECDD3',
        unlocked: false,
    },
];

export default function StudentAchievements() {
    const router = useRouter();
    const { studentName } = useLocalSearchParams();
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    return (
        <View className="flex-1 bg-[#F8FAFC]">
            <ScrollView
                contentContainerStyle={{ paddingBottom: isTablet ? 120 : 80 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
            // Removed px-6 here so the header can go edge-to-edge
            >
                {/* NEW EDGE-TO-EDGE HEADER */}
                <View className={`w-full relative justify-center px-6 ${isTablet ? 'h-[320px]' : 'h-[220px]'}`}>
                    <View className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
                        {/* xMaxYMid slice anchors the image to the right so the trophy doesn't get cut off */}
                        <HeaderBg
                            width="100%"
                            height="100%"
                            preserveAspectRatio="xMaxYMid slice"
                        />
                    </View>

                    {/* Constraining width so text doesn't bleed into the trophy graphic */}
                    <View className="w-2/3 mt-4 z-10 pl-5">
                        <Text className={`font-fredoka-one text-[#374151] ${isTablet ? 'text-5xl' : 'text-4xl'}`}>
                            Achievements
                        </Text>
                        <Text className={`text-[#6B7280] font-quicksand-medium mt-1 ${isTablet ? 'text-2xl' : 'text-base'}`}>
                            Good job, {studentName || 'Monna'}! Keep earning stars.
                        </Text>
                    </View>
                </View>

                {/* CONTENT CONTAINER (Restores padding for the rest of the screen) */}
                <View className="px-6 pt-6">
                    {/* SUMMARY BANNER */}
                    <View
                        className={`w-full bg-[#FEF9C3] border-[3px] border-[#FDE047] border-b-[6px] flex-row items-center justify-between ${isTablet ? 'rounded-[28px] p-8 mb-10' : 'rounded-[20px] p-5 mb-8'
                            }`}
                    >
                        <View className="flex-row items-center">
                            <View className={`bg-[#FACC15] items-center justify-center rounded-full ${isTablet ? 'w-20 h-20 mr-6' : 'w-14 h-14 mr-4'}`}>
                                <Ionicons name="star" size={isTablet ? 40 : 28} color="white" />
                            </View>
                            <View>
                                <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
                                    12 Stars
                                </Text>
                                <Text className={`font-quicksand-semibold text-[#A16207] ${isTablet ? 'text-xl mt-1' : 'text-sm'}`}>
                                    3 of 5 Badges Unlocked
                                </Text>
                            </View>
                        </View>
                        <View className={`bg-white rounded-full border-[2px] border-[#FDE047] ${isTablet ? 'px-6 py-3' : 'px-4 py-2'}`}>
                            <Text className={`font-quicksand-bold text-[#EAB308] ${isTablet ? 'text-lg' : 'text-xs'}`}>
                                Level 2
                            </Text>
                        </View>
                    </View>

                    {/* BADGES LIST */}
                    <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-3xl mb-6' : 'text-2xl mb-4'}`}>
                        Adventure Badges
                    </Text>

                    <View className="gap-y-4">
                        {MOCK_BADGES.map((badge) => (
                            <View
                                key={badge.id}
                                className={`w-full flex-row items-center justify-between border-[2px] bg-white ${isTablet ? 'p-6 rounded-[24px] border-b-[5px]' : 'p-4 rounded-[18px] border-b-[4px]'
                                    } ${badge.unlocked ? 'border-[#E5E7EB]' : 'border-[#F3F4F6] opacity-60'}`}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View
                                        className={`items-center justify-center rounded-full border-[2px] ${isTablet ? 'w-16 h-16 mr-5' : 'w-14 h-14 mr-4'}`}
                                        style={{ backgroundColor: badge.bgColor, borderColor: badge.borderColor }}
                                    >
                                        <Ionicons name={badge.icon} size={isTablet ? 32 : 24} color={badge.color} />
                                    </View>
                                    <View className="flex-1 mr-2">
                                        <Text className={`font-quicksand-bold text-[#374151] ${isTablet ? 'text-2xl' : 'text-lg'}`}>
                                            {badge.title}
                                        </Text>
                                        <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-lg mt-1' : 'text-xs mt-0.5'}`}>
                                            {badge.description}
                                        </Text>
                                    </View>
                                </View>

                                <View
                                    className={`items-center justify-center rounded-full ${isTablet ? 'w-10 h-10' : 'w-8 h-8'} ${badge.unlocked ? 'bg-[#DCFCE7]' : 'bg-[#F3F4F6]'
                                        }`}
                                >
                                    <Ionicons
                                        name={badge.unlocked ? 'checkmark' : 'lock-closed'}
                                        size={isTablet ? 20 : 16}
                                        color={badge.unlocked ? '#16A34A' : '#9CA3AF'}
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}