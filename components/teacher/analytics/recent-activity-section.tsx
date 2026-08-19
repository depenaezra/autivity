import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { getRecentActivity, RecentActivityData } from '../../../src/services/analytics';
import EvaluationReviewModal from './evaluation-review-modal';

type FilterType = 'today' | 'week' | 'month';

export function RecentActivitySection() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [filter, setFilter] = useState<FilterType>('today');
  const [activities, setActivities] = useState<RecentActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Modal state
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    setIsExpanded(false);
    fetchRecentActivity();
  }, [filter]);

  const fetchRecentActivity = async () => {
    setIsLoading(true);
    try {
      const data = await getRecentActivity(filter);
      setActivities(data);
    } catch (err) {
      console.error('RecentActivitySection: failed to fetch recent activity', err);
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

  const handleCardPress = (item: RecentActivityData) => {
    if (item.status === 'validated') {
      setSelectedSessionId(item.id);
      setIsModalVisible(true);
    }
  };

  const renderFilterButton = (type: FilterType, label: string) => {
    const isActive = filter === type;
    return (
      <Pressable
        key={type}
        onPress={() => setFilter(type)}
        className={`border-[2px] rounded-[8px] justify-center items-center active:scale-95 transition-transform ${
          isTablet ? 'px-4 py-2' : 'px-3 py-1.5'
        }`}
        style={{
          backgroundColor: isActive ? '#BBE8FB' : '#FFFFFF',
          borderColor: isActive ? '#62A9E6' : '#BBE8FB',
          shadowColor: isActive ? '#62A9E6' : '#BBE8FB',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 2,
        }}
      >
        <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
          {label}
        </Text>
      </Pressable>
    );
  };

  const visibleActivities = isExpanded ? activities : activities.slice(0, 4);

  return (
    <View className={`w-full ${isTablet ? 'mt-12' : 'mt-8'}`}>
      {/* Header section with Title & Filter Buttons */}
      <View className={`flex-row flex-wrap items-center justify-between gap-3 ${isTablet ? 'px-12 mb-6' : 'px-6 mb-4'}`}>
        <View className="flex-row items-center gap-2">
          <View
            className={`rounded-[8px] bg-[#BBE8FB] justify-center items-center ${
              isTablet ? 'w-8 h-8' : 'w-6 h-6'
            }`}
          >
            <Ionicons name="time" size={isTablet ? 20 : 15} color="#62A9E6" />
          </View>
          <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
            Recent Activity
          </Text>
        </View>

        {/* Filters styled like StudentsScreenLayout */}
        <View className="flex-row items-center gap-2">
          {renderFilterButton('today', 'TODAY')}
          {renderFilterButton('week', 'THIS WEEK')}
          {renderFilterButton('month', 'THIS MONTH')}
        </View>
      </View>

      {/* Activity Timeline List */}
      <View className={`w-full ${isTablet ? 'px-12' : 'px-6'}`}>
        {isLoading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#62A9E6" />
            <Text className="mt-3 font-quicksand-medium text-sm text-[#9CA3AF]">
              Loading activity logs...
            </Text>
          </View>
        ) : activities.length === 0 ? (
          <View className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-2xl p-8 items-center justify-center">
            <Feather name="inbox" size={isTablet ? 44 : 32} color="#9CA3AF" />
            <Text className="font-fredoka-one text-lg text-[#4B5563] mt-3 text-center">
              No Activities Recorded
            </Text>
            <Text className="font-quicksand-medium text-sm text-[#9CA3AF] mt-1 text-center">
              No session activities recorded for this filter.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {visibleActivities.map((item) => {
              const isPending = item.status === 'pending';
              const timeDisplay =
                filter === 'today'
                  ? formatTime(item.createdAt)
                  : `${formatDateShort(item.createdAt)}, ${formatTime(item.createdAt)}`;

              const accentColor = isPending ? '#FF8870' : '#179D33';
              const statusBg = isPending ? '#FFDBD4' : '#CBFAC4';
              const statusBorder = isPending ? '#FF8870' : '#179D33';
              const statusText = isPending ? '#FF8870' : '#179D33';

              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleCardPress(item)}
                  className="active:scale-[0.98] transition-transform"
                >
                  <View
                    className={`bg-white border-[2px] border-[#F1F1F1] flex-row items-center justify-between overflow-hidden ${
                      isTablet ? 'rounded-[24px] p-5' : 'rounded-[16px] p-3.5'
                    }`}
                    style={{
                      shadowColor: '#F1F1F1',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 2,
                    }}
                  >
                    {/* Left-Side Colored Accent Bar */}
                    <View
                      className="w-1.5 self-stretch rounded-full mr-3"
                      style={{ backgroundColor: accentColor }}
                    />

                    {/* Activity Details */}
                    <View className="flex-1 pr-2">
                      <View className="flex-row items-center gap-2 flex-wrap">
                        <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-lg' : 'text-base'}`}>
                          {item.studentName}
                        </Text>
                        <View className="bg-[#F1F1F1] px-2 py-0.5 rounded-[6px]">
                          <Text className={`font-fredoka-one text-[#62A9E6] ${isTablet ? 'text-xs' : 'text-[10px]'}`}>
                            {item.category.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <Text className={`font-quicksand-medium text-[#9CA3AF] mt-0.5 ${isTablet ? 'text-sm' : 'text-xs'}`}>
                        {timeDisplay}
                      </Text>
                    </View>

                    {/* Status Pill on Right */}
                    <View
                      className="px-3 py-1 rounded-[8px] border-[2px] flex-row items-center gap-1"
                      style={{
                        backgroundColor: statusBg,
                        borderColor: statusBorder,
                      }}
                    >
                      <Text
                        className={`font-fredoka-one uppercase ${isTablet ? 'text-xs' : 'text-[10px]'}`}
                        style={{ color: statusText }}
                      >
                        {isPending ? 'AWAITING EVALUATION' : 'EVALUATED'}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}

            {/* View More / Show Less Button */}
            {activities.length > 4 && (
              <Pressable
                onPress={() => setIsExpanded(!isExpanded)}
                className={`mt-2 self-center flex-row items-center justify-center gap-1.5 border-[2px] rounded-[12px] bg-white active:scale-95 transition-transform ${
                  isTablet ? 'px-5 py-2.5' : 'px-4 py-2'
                }`}
                style={{
                  borderColor: '#BBE8FB',
                  shadowColor: '#BBE8FB',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-sm' : 'text-xs'}`}>
                  {isExpanded ? 'SHOW LESS' : `VIEW MORE (${activities.length - 4})`}
                </Text>
                <Feather
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={isTablet ? 18 : 16}
                  color="#62A9E6"
                />
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Evaluation Review Modal */}
      <EvaluationReviewModal
        visible={isModalVisible}
        sessionId={selectedSessionId}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedSessionId(null);
        }}
      />
    </View>
  );
}

export default RecentActivitySection;
