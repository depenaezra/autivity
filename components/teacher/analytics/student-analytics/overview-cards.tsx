import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { StudentSessionStats, getStudentSessionStats } from '../../../../src/services/student-analytics';

interface OverviewCardsProps {
    studentId: string;
}

type FilterType = 'today' | 'week' | 'month' | 'overall';

interface CardConfig {
    key: 'duration' | 'mistakes';
    label: string;
    sublabel: string;
    iconName: string;
    accentColor: string;
    bgColor: string;
    borderColor: string;
    iconColor: string;
}

const CARDS: CardConfig[] = [
    {
        key: 'duration',
        label: 'Average Session',
        sublabel: 'Time spent per session',
        iconName: 'clock',
        accentColor: '#06B6D4', // Cyan 500
        bgColor: '#ECFEFF',     // Cyan 50
        borderColor: '#A5F3FC', // Cyan 200
        iconColor: '#0891B2',   // Cyan 600
    },
    {
        key: 'mistakes',
        label: 'Average Mistakes',
        sublabel: 'Mistakes per session',
        iconName: 'alert-circle',
        accentColor: '#F43F5E', // Rose 500
        bgColor: '#FFF1F2',     // Rose 50
        borderColor: '#FECDD3', // Rose 200
        iconColor: '#E11D48',   // Rose 600
    },
];

export default function OverviewCards({ studentId }: OverviewCardsProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const [filter, setFilter] = useState<FilterType>('overall');
    const [stats, setStats] = useState<StudentSessionStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        async function loadStats() {
            setIsLoading(true);
            try {
                const data = await getStudentSessionStats(studentId, filter);
                if (active) {
                    setStats(data);
                    setError(null);
                }
            } catch (err: any) {
                console.error('OverviewCards: failed to load stats', err);
                if (active) {
                    setError('Failed to load card metrics.');
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }
        loadStats();
        return () => {
            active = false;
        };
    }, [studentId, filter]);

    const filterButtons: { label: string; value: FilterType }[] = [
        { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'week' },
        { label: 'This Month', value: 'month' },
        { label: 'Overall', value: 'overall' },
    ];

    const formatDuration = (avgSeconds: number) => {
        const minutes = Math.floor(avgSeconds / 60);
        const seconds = Math.round(avgSeconds % 60);
        if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        }
        return `${seconds}s`;
    };

    const formatMistakes = (avgMistakes: number) => {
        return `${avgMistakes.toFixed(1)}`;
    };

    const hasNoSessions = !stats || stats.totalSessions === 0;

    if (isLoading) {
        return (
            <View className="flex-col mt-6">
                {/* Header and Filter Controls skeleton */}
                <View className="flex-row flex-wrap justify-between items-start mb-4 gap-3">
                    <View className="flex-1 min-w-[200px]">
                        <Text className="font-fredoka-one text-xl text-[#4B5563]">
                            Student Performance Overview
                        </Text>
                        <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-0.5">
                            Key indicators for completed student sessions.
                        </Text>
                    </View>
                </View>

                <View className="flex-row gap-4">
                    {CARDS.map((card) => (
                        <View
                            key={card.key}
                            className="flex-1 bg-white rounded-2xl border-2 border-[#E5E7EB] overflow-hidden shadow-sm"
                        >
                            <View
                                className="items-center justify-center"
                                style={{ height: isTablet ? 116 : 96 }}
                            >
                                <ActivityIndicator size="small" color="#62A9E6" />
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    return (
        <View className="flex-col mt-6">
            {/* Header and Filter Controls */}
            <View className="flex-row flex-wrap justify-between items-start mb-4 gap-3">
                <View className="flex-1 min-w-[200px]">
                    <Text className="font-fredoka-one text-lg text-[#4B5563]">
                        Student Performance Overview
                    </Text>
                    <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-0.5">
                        Key indicators for completed student sessions.
                    </Text>
                </View>

                {/* Filter Pills */}
                <View className="flex-row items-center gap-1.5 flex-wrap">
                    {filterButtons.map((btn) => {
                        const isActive = filter === btn.value;
                        return (
                            <Pressable
                                key={btn.value}
                                onPress={() => setFilter(btn.value)}
                                className={`px-3 py-1.5 rounded-full active:opacity-90 border ${isActive ? 'bg-[#62A9E6] border-[#62A9E6]' : 'bg-[#F9FAFB] border-[#E5E7EB]'
                                    }`}
                            >
                                <Text
                                    className={`font-quicksand-bold text-[11px] ${isActive ? 'text-white' : 'text-[#6B7280]'
                                        }`}
                                >
                                    {btn.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {error ? (
                <View className="w-full justify-center items-center py-6 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
                    <Feather name="alert-circle" size={24} color="#EF4444" />
                    <Text className="font-quicksand-semibold text-sm text-[#9CA3AF] mt-2">
                        {error}
                    </Text>
                </View>
            ) : (
                <View className="flex-row gap-4">
                    {CARDS.map((card) => {
                        const value = hasNoSessions
                            ? 'No completed sessions'
                            : card.key === 'duration'
                                ? formatDuration(stats!.averageDuration)
                                : formatMistakes(stats!.averageMistakes);

                        const iconSize = isTablet ? 28 : 22;

                        return (
                            <View
                                key={card.key}
                                className="flex-1 bg-white rounded-2xl border-2 overflow-hidden shadow-sm"
                                style={{
                                    borderColor: card.borderColor,
                                }}
                            >
                                {/* Coloured Header Band */}
                                <View
                                    className="flex-row items-center justify-between px-4"
                                    style={{
                                        backgroundColor: card.bgColor,
                                        borderBottomWidth: 2,
                                        borderBottomColor: card.borderColor,
                                        paddingVertical: isTablet ? 16 : 12,
                                    }}
                                >
                                    <View
                                        className="rounded-xl items-center justify-center"
                                        style={{
                                            backgroundColor: `${card.accentColor}22`,
                                            width: isTablet ? 48 : 38,
                                            height: isTablet ? 48 : 38,
                                        }}
                                    >
                                        <Feather name={card.iconName as any} size={iconSize} color={card.iconColor} />
                                    </View>

                                    <Text
                                        className={hasNoSessions ? 'font-quicksand-bold text-right flex-1 ml-2' : 'font-fredoka-one'}
                                        style={{
                                            color: hasNoSessions ? '#9CA3AF' : card.accentColor,
                                            fontSize: hasNoSessions ? (isTablet ? 14 : 11) : (isTablet ? 32 : 22),
                                            lineHeight: hasNoSessions ? (isTablet ? 18 : 14) : (isTablet ? 38 : 28),
                                        }}
                                        numberOfLines={2}
                                    >
                                        {value}
                                    </Text>
                                </View>

                                {/* Label Footer */}
                                <View className="bg-white px-4 py-2.5">
                                    <Text
                                        className="font-quicksand-bold text-[#4B5563]"
                                        style={{ fontSize: isTablet ? 14 : 12 }}
                                        numberOfLines={1}
                                    >
                                        {card.label}
                                    </Text>
                                    <Text
                                        className="font-quicksand-medium text-[#9CA3AF]"
                                        style={{ fontSize: isTablet ? 12 : 10 }}
                                        numberOfLines={1}
                                    >
                                        {card.sublabel}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
}
