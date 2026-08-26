import React, { useCallback, useState } from 'react';
import { ActivityIndicator, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useGlobalSearchParams, useLocalSearchParams } from 'expo-router';

import { ScreenLayout } from '@/components/screen-layout';
import { AchievementsSummaryCard } from '@/components/student/achievements/achievements-summary-card';
import { BadgesList, BadgeItemData } from '@/components/student/achievements/badges-list';
import HeaderClassYellow from '@/assets/images/teacher/class/header-class-yellow.svg';
import {
    getAllAchievements,
    getUnlockedAchievements,
    updateStudentBadgesCount,
} from '../../../../../src/services/achivements';

export default function StudentAchievements() {
    const localParams = useLocalSearchParams();
    const globalParams = useGlobalSearchParams();

    const targetStudentId = (
        Array.isArray(localParams.studentId) ? localParams.studentId[0] : localParams.studentId
    ) || (
        Array.isArray(globalParams.studentId) ? globalParams.studentId[0] : globalParams.studentId
    ) || '1';

    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    const [badges, setBadges] = useState<BadgeItemData[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchAchievementsData = async () => {
                try {
                    const unlockedData = await getUnlockedAchievements(targetStudentId);

                    const unlockedMap = new Map<string, string>();
                    unlockedData?.forEach((row: any) => {
                        const rawDate = row.unlocked_at || row.created_at || row.earned_at || row.date;
                        if (row.achievement_id) unlockedMap.set(String(row.achievement_id).toLowerCase(), rawDate);
                        if (row.id) unlockedMap.set(String(row.id).toLowerCase(), rawDate);
                    });

                    const dbCatalog = await getAllAchievements();

                    if (isActive) {
                        const mergedBadges = (dbCatalog || []).map((ach: any) => {
                            const achId = String(ach.id).toLowerCase();
                            const achCode = ach.code ? String(ach.code).toLowerCase() : '';
                            const achBadgeId = ach.badge_id ? String(ach.badge_id).toLowerCase() : '';

                            const isUnlocked = unlockedMap.has(achId) ||
                                (achCode !== '' && unlockedMap.has(achCode)) ||
                                (achBadgeId !== '' && unlockedMap.has(achBadgeId));

                            const rawDate = unlockedMap.get(achId) ||
                                (achCode !== '' ? unlockedMap.get(achCode) : undefined) ||
                                (achBadgeId !== '' ? unlockedMap.get(achBadgeId) : undefined);

                            let formattedDate: string | undefined = undefined;
                            if (isUnlocked && rawDate) {
                                try {
                                    const dt = new Date(rawDate);
                                    if (!isNaN(dt.getTime())) {
                                        formattedDate = dt.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        });
                                    }
                                } catch {
                                    formattedDate = undefined;
                                }
                            }

                            return {
                                id: ach.id,
                                title: ach.title || 'Badge',
                                description: ach.description || '',
                                icon: ach.icon || 'trophy',
                                color: ach.color || '#EAB308',
                                bgColor: ach.bg_color || ach.bgColor || '#FEF9C3',
                                borderColor: ach.border_color || ach.borderColor || '#FDE047',
                                unlocked: isUnlocked,
                                unlockedDate: formattedDate,
                            };
                        });

                        const sortedBadges = mergedBadges.sort((a, b) => {
                            if (a.unlocked && !b.unlocked) return -1;
                            if (!a.unlocked && b.unlocked) return 1;
                            return 0;
                        });

                        setBadges(sortedBadges);

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

    const unlockedCount = badges.filter(b => b.unlocked).length;
    const totalCount = badges.length;

    const renderHeaderBackground = () => (
        <View className="flex-1 w-full h-full relative">
            <View className="absolute inset-0">
                <HeaderClassYellow width="100%" height="100%" preserveAspectRatio="xMidYMax slice" />
            </View>
        </View>
    );

    return (
        <ScreenLayout
            headerBackground={renderHeaderBackground()}
            title="Achievements"
            scrollable={true}
            stickyHeader={true}
        >
            <View className={`bg-white ${isTablet ? 'px-12 py-6 pb-28' : 'px-6 py-4 pb-20'}`}>
                {loading ? (
                    <View className="flex-1 items-center justify-center py-20 bg-white">
                        <ActivityIndicator size="large" color="#FACC15" />
                    </View>
                ) : (
                    <>
                        {/* SUMMARY BANNER CARD */}
                        <AchievementsSummaryCard
                            unlockedCount={unlockedCount}
                            totalCount={totalCount}
                            isTablet={isTablet}
                        />

                        {/* BADGES LIST */}
                        <BadgesList badges={badges} isTablet={isTablet} />
                    </>
                )}
            </View>
        </ScreenLayout>
    );
}
