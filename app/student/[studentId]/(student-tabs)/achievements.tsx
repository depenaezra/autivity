import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useGlobalSearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import HeaderBg from '../../../../assets/images/achievements-header.svg';
import {
    getAllAchievements,
    getUnlockedAchievements,
    updateStudentBadgesCount,
} from '../../../../src/services/achivements';

type BadgeData = {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    bgColor: string;
    borderColor: string;
    unlocked: boolean;
};

export default function StudentAchievements() {
    const router = useRouter();

    const localParams = useLocalSearchParams();
    const globalParams = useGlobalSearchParams();

    const studentName = (
        Array.isArray(localParams.studentName) ? localParams.studentName[0] : localParams.studentName
    ) || (
            Array.isArray(globalParams.studentName) ? globalParams.studentName[0] : globalParams.studentName
        );

    const targetStudentId = (
        Array.isArray(localParams.studentId) ? localParams.studentId[0] : localParams.studentId
    ) || (
            Array.isArray(globalParams.studentId) ? globalParams.studentId[0] : globalParams.studentId
        ) || '1';

    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    const [badges, setBadges] = useState<BadgeData[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchAchievementsData = async () => {
                try {
                    // 1. Fetch student's unlocked achievements from join table
                    const unlockedData = await getUnlockedAchievements(targetStudentId);

                    // Build normalized lookup set for instant matching
                    const unlockedSet = new Set<string>();
                    unlockedData?.forEach((row: any) => {
                        if (row.achievement_id) unlockedSet.add(String(row.achievement_id).toLowerCase());
                        if (row.id) unlockedSet.add(String(row.id).toLowerCase());
                    });

                    // 2. Fetch all achievements catalog from database
                    const dbCatalog = await getAllAchievements();

                    // 3. Merge data for UI rendering
                    if (isActive) {
                        const mergedBadges = (dbCatalog || []).map((ach: any) => {
                            const achId = String(ach.id).toLowerCase();
                            const achCode = ach.code ? String(ach.code).toLowerCase() : '';
                            const achBadgeId = ach.badge_id ? String(ach.badge_id).toLowerCase() : '';

                            const isUnlocked = unlockedSet.has(achId) ||
                                (achCode !== '' && unlockedSet.has(achCode)) ||
                                (achBadgeId !== '' && unlockedSet.has(achBadgeId));

                            return {
                                id: ach.id,
                                title: ach.title || 'Badge',
                                description: ach.description || '',
                                icon: ach.icon || 'trophy',
                                color: ach.color || '#EAB308',
                                bgColor: ach.bg_color || ach.bgColor || '#FEF9C3',
                                borderColor: ach.border_color || ach.borderColor || '#FDE047',
                                unlocked: isUnlocked,
                            };
                        });

                        // Sort unlocked achievements to the top
                        const sortedBadges = mergedBadges.sort((a, b) => {
                            if (a.unlocked && !b.unlocked) return -1;
                            if (!a.unlocked && b.unlocked) return 1;
                            return 0;
                        });

                        setBadges(sortedBadges);

                        // Update student's badges count in database
                        const totalUnlockedCount = sortedBadges.filter(b => b.unlocked).length;
                        await updateStudentBadgesCount(targetStudentId, totalUnlockedCount);
                    }
                } catch (error) {
                    console.error("Error fetching achievements:", error);
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            fetchAchievementsData();

            return () => {
                isActive = false;
            };
        }, [targetStudentId])
    );

    // Dynamic stats
    const unlockedCount = badges.filter(b => b.unlocked).length;
    const totalCount = badges.length;

    // Loading spinner
    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
                <ActivityIndicator size="large" color="#FACC15" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#F8FAFC]">
            <ScrollView
                contentContainerStyle={{ paddingBottom: isTablet ? 120 : 80 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* HEADER */}
                <View className={`w-full relative justify-center px-6 ${isTablet ? 'h-[320px]' : 'h-[220px]'}`}>
                    <View className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
                        <HeaderBg
                            width="100%"
                            height="100%"
                            preserveAspectRatio="xMaxYMid slice"
                        />
                    </View>

                    <View className="w-2/3 mt-4 z-10 pl-5">
                        <Text className={`font-fredoka-one text-[#374151] ${isTablet ? 'text-5xl' : 'text-4xl'}`}>
                            Achievements
                        </Text>
                        <Text className={`text-[#6B7280] font-quicksand-medium mt-1 ${isTablet ? 'text-2xl' : 'text-base'}`}>
                            Good job, {studentName || 'Explorer'}! Keep unlocking badges.
                        </Text>
                    </View>
                </View>

                {/* CONTENT CONTAINER */}
                <View className="px-6 pt-6">

                    {/* SUMMARY BANNER CARD */}
                    <View
                        className={`w-full bg-[#FEF9C3] border-[3px] border-[#FDE047] border-b-[6px] flex-row items-center justify-between ${isTablet ? 'rounded-[28px] p-8 mb-10' : 'rounded-[20px] p-5 mb-8'
                            }`}
                    >
                        <View className="flex-row items-center">
                            <View className={`bg-[#FACC15] items-center justify-center rounded-full ${isTablet ? 'w-20 h-20 mr-6' : 'w-14 h-14 mr-4'}`}>
                                <Ionicons name="trophy" size={isTablet ? 40 : 28} color="white" />
                            </View>
                            <View>
                                <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
                                    {unlockedCount} {unlockedCount === 1 ? 'Badge' : 'Badges'} Unlocked
                                </Text>
                                <Text className={`font-quicksand-semibold text-[#A16207] ${isTablet ? 'text-xl mt-1' : 'text-sm'}`}>
                                    out of {totalCount} badges
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* BADGES LIST */}
                    <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-3xl mb-6' : 'text-2xl mb-4'}`}>
                        Adventure Badges
                    </Text>

                    <View className="gap-y-4">
                        {badges.map((badge) => (
                            <View
                                key={badge.id}
                                className={`w-full flex-row items-center justify-between border-[2px] ${isTablet ? 'p-6 rounded-[24px]' : 'p-4 rounded-[18px]'
                                    } ${badge.unlocked
                                        ? 'bg-white border-[#BFDBFE] border-b-[#62A9E6] border-b-[5px]'
                                        : 'bg-[#F9FAFB] border-[#E5E7EB] border-b-[3px] opacity-80'
                                    }`}
                            >
                                <View className="flex-row items-center flex-1 mr-3">
                                    {/* Icon Container */}
                                    <View
                                        className={`items-center justify-center rounded-full border-[2px] ${isTablet ? 'w-16 h-16 mr-5' : 'w-14 h-14 mr-4'}`}
                                        style={{
                                            backgroundColor: badge.unlocked ? badge.bgColor : '#F3F4F6',
                                            borderColor: badge.unlocked ? badge.borderColor : '#D1D5DB',
                                        }}
                                    >
                                        <Ionicons
                                            name={badge.icon}
                                            size={isTablet ? 32 : 24}
                                            color={badge.unlocked ? badge.color : '#9CA3AF'}
                                        />
                                    </View>

                                    {/* Title & Description */}
                                    <View className="flex-1 mr-2">
                                        <Text className={`font-quicksand-bold ${badge.unlocked ? 'text-[#1F2937]' : 'text-[#6B7280]'} ${isTablet ? 'text-2xl' : 'text-lg'}`}>
                                            {badge.title}
                                        </Text>
                                        <Text className={`font-quicksand-medium ${badge.unlocked ? 'text-[#4B5563]' : 'text-[#9CA3AF]'} ${isTablet ? 'text-lg mt-1' : 'text-xs mt-0.5'}`}>
                                            {badge.description}
                                        </Text>
                                    </View>
                                </View>

                                {/* Unlocked / Locked Status Badge Pill */}
                                <View
                                    className={`px-3 py-1.5 rounded-full flex-row items-center gap-1.5 ${badge.unlocked ? 'bg-[#EBF5FF] border border-[#A3CFF1]' : 'bg-[#F3F4F6] border border-[#E5E7EB]'
                                        }`}
                                >
                                    <Ionicons
                                        name={badge.unlocked ? 'checkmark-circle' : 'lock-closed'}
                                        size={isTablet ? 18 : 14}
                                        color={badge.unlocked ? '#62A9E6' : '#9CA3AF'}
                                    />
                                    <Text
                                        className={`font-quicksand-bold text-xs ${badge.unlocked ? 'text-[#62A9E6]' : 'text-[#6B7280]'
                                            }`}
                                    >
                                        {badge.unlocked ? 'Unlocked' : 'Locked'}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}