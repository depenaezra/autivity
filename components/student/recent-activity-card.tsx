import React from 'react';
import { ActivityIndicator, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RecentActivityCardProps {
  latestSession: {
    category?: string;
    created_at?: string;
  } | null;
  isLoading?: boolean;
}

export function RecentActivityCard({
  latestSession,
  isLoading = false,
}: RecentActivityCardProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  };

  const getIconName = (category?: string) => {
    if (!category) return 'pencil';
    const lower = category.toLowerCase();
    if (lower.includes('matching') || lower.includes('fruit') || lower.includes('drag')) {
      return 'grid';
    }
    if (lower.includes('bubble') || lower.includes('pop')) {
      return 'sparkles';
    }
    return 'pencil';
  };

  return (
    <View className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-2xl overflow-hidden mb-6 p-4 sm:p-5">
      {/* Header Section Title */}
      <Text className="font-fredoka-one text-lg sm:text-xl text-[#484A4B] mb-3">
        Recent Activity
      </Text>

      {/* Main Details Row with horizontal divider line */}
      <View className="flex-row items-center justify-between gap-3 pt-3 border-t border-[#E2E8F0]">
        {isLoading ? (
          <View className="py-2 items-center justify-center w-full">
            <ActivityIndicator size="small" color="#62A9E6" />
          </View>
        ) : latestSession ? (
          <>
            {/* Left Icon directly matching text height */}
            <Ionicons
              name={getIconName(latestSession.category)}
              size={isTablet ? 24 : 20}
              color="#62A9E6"
            />

            {/* Activity Name */}
            <Text className="font-quicksand-bold text-lg sm:text-xl text-[#374151] flex-1">
              {latestSession.category || 'Activity Completed'}
            </Text>

            {/* Completed Date Pill on the right */}
            {latestSession.created_at && (
              <View className="flex-row items-center bg-white border-[2px] border-[#BBE8FB] rounded-[6px] px-2 py-0.5 gap-1 shrink-0">
                <Ionicons name="calendar" size={isTablet ? 16 : 12} color="#62A9E6" />
                <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-[14px]' : 'text-[11px]'}`}>
                  {formatDate(latestSession.created_at)}
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Direct Icon */}
            <Ionicons
              name="time-outline"
              size={isTablet ? 24 : 20}
              color="#9CA3AF"
            />

            {/* Empty State Text */}
            <Text className="font-quicksand-bold text-base sm:text-lg text-[#64748B] flex-1">
              No activity recorded yet
            </Text>
          </>
        )}
      </View>
    </View>
  );
}
