import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { getDraftRecentActivity, RecentActivityData } from '../../src/services/analytics-draft';

type FilterType = 'today' | 'week' | 'month';

export default function RecentActivity() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const [filter, setFilter] = useState<FilterType>('today');
    const [activities, setActivities] = useState<RecentActivityData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRecentActivity();
    }, [filter]);

    const fetchRecentActivity = async () => {
        setIsLoading(true);
        try {
            const data = await getDraftRecentActivity(filter);
            setActivities(data);
        } catch (err) {
            console.error('RecentActivity: failed to fetch recent activity', err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (isoString: string) => {
        const d = new Date(isoString);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateShort = (isoString: string) => {
        const d = new Date(isoString);
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const formatDateTime = (isoString: string) => {
        const d = new Date(isoString);
        const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${dateStr}, ${timeStr}`;
    };

    const renderFilterButton = (type: FilterType, label: string) => {
        const isActive = filter === type;
        return (
            <Pressable
                onPress={() => setFilter(type)}
                className={`px-4 py-2 rounded-xl border-2 active:opacity-90 transition-all`}
                style={{
                    backgroundColor: isActive ? '#EBF5FF' : '#FFFFFF',
                    borderColor: isActive ? '#62A9E6' : '#E5E7EB',
                }}
            >
                <Text
                    className={`font-quicksand-bold text-sm`}
                    style={{ color: isActive ? '#62A9E6' : '#4B5563' }}
                >
                    {label}
                </Text>
            </Pressable>
        );
    };

    return (
        <View
            className={`bg-white rounded-2xl border-[3px] border-[#E5E7EB] overflow-hidden shadow-sm flex-col ${isTablet ? 'mx-12 mt-6 p-6' : 'mx-6 mt-4 p-4'}`}
            style={{ borderBottomWidth: 6 }}
        >
            {/* Header and Filter Controls */}
            <View className="flex-row flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#F3F4F6]">
                {/* Filter Buttons */}
                <View className="flex-row items-center gap-2">
                    {renderFilterButton('today', 'Today')}
                    {renderFilterButton('week', 'This Week')}
                    {renderFilterButton('month', 'This Month')}
                </View>
            </View>

            {/* Scrollable Table Content */}
            <View className="mt-4">
                {isLoading ? (
                    <View className="py-12 items-center justify-center">
                        <ActivityIndicator size="large" color="#62A9E6" />
                        <Text className="mt-3 font-quicksand-semibold text-sm text-[#4B5563]">
                            Loading sessions...
                        </Text>
                    </View>
                ) : activities.length === 0 ? (
                    <View className="py-12 items-center justify-center">
                        <Feather name="inbox" size={36} color="#9CA3AF" />
                        <Text className="mt-3 font-quicksand-semibold text-sm text-[#4B5563]">
                            No sessions recorded for this period.
                        </Text>
                    </View>
                ) : (
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
                        <View style={{ minWidth: isTablet ? '100%' : 540 }}>
                            {/* Table layout header row */}
                            <View className="flex-row bg-[#F9FAFB] border border-[#E5E7EB] rounded-t-xl px-4 py-3">
                                <Text className="w-[85px] font-quicksand-bold text-xs text-[#4B5563]">TIME</Text>
                                <Text className="flex-1 font-quicksand-bold text-xs text-[#4B5563] px-2">ACTIVITY SUMMARY</Text>
                                <Text className="w-[180px] font-quicksand-bold text-xs text-[#4B5563] text-right">STATUS</Text>
                            </View>

                            {/* Table Rows (Vertically scrollable) */}
                            <ScrollView
                                style={{ maxHeight: 300 }}
                                showsVerticalScrollIndicator={true}
                                bounces={true}
                            >
                                <View className="border-x border-b border-[#E5E7EB] rounded-b-xl overflow-hidden">
                                    {activities.map((item, idx) => {
                                        const isEven = idx % 2 === 0;
                                        const timeDisplay = filter === 'today' ? formatTime(item.createdAt) : `${formatDateShort(item.createdAt)} ${formatTime(item.createdAt)}`;

                                        return (
                                            <View
                                                key={item.id}
                                                className="flex-row items-center px-4 py-3.5 border-b border-[#F3F4F6] last:border-b-0"
                                                style={{ backgroundColor: isEven ? '#FFFFFF' : '#F9FAFB' }}
                                            >
                                                {/* Time Column */}
                                                <Text className="w-[85px] font-quicksand-bold text-xs text-[#4B5563]">
                                                    {timeDisplay}
                                                </Text>

                                                {/* Activity Summary Column */}
                                                <View className="flex-1 px-2">
                                                    <Text className="font-quicksand-semibold text-xs text-[#4B5563] leading-relaxed">
                                                        <Text className="font-fredoka-one text-xs text-[#4B5563]">{item.studentName}</Text> completed <Text className="font-fredoka-one text-xs text-[#62A9E6]">{item.category}</Text>
                                                    </Text>
                                                </View>

                                                {/* Status Column */}
                                                <View className="w-[180px] items-end justify-center">
                                                    {item.status === 'pending' ? (
                                                        <View className="bg-[#FFF7ED] border border-[#FDBA74] px-2.5 py-1 rounded-full flex-row items-center gap-1">
                                                            <View className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
                                                            <Text className="font-quicksand-bold text-[10px] text-[#EA580C]">
                                                                Awaiting teacher evaluation
                                                            </Text>
                                                        </View>
                                                    ) : (
                                                        <View className="bg-[#F0FDF4] border border-[#86EFAC] px-2.5 py-1 rounded-full flex-row items-center gap-1">
                                                            <View className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                                                            <Text className="font-quicksand-bold text-[10px] text-[#16A34A]" numberOfLines={1}>
                                                                Evaluated on {item.validatedAt ? formatDateTime(item.validatedAt) : 'N/A'}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                        </View>
                    </ScrollView>
                )}
            </View>
        </View>
    );
}
