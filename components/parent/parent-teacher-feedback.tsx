import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Pressable, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { exportAllFeedbacksPdf, exportSingleFeedbackPdf } from '../../src/services/exportReport';
import { FilterPeriod, getFilterLabel } from '../../src/utils/dashboardFilters';
import ParentEvaluationReviewModal from './parent-evaluation-review-modal';

export interface ParentFeedbackItem {
  id: string;
  date: Date;
  category: string;
  teacherFeedback: string;
  rubricEvaluation?: any;
}

interface ParentTeacherFeedbackProps {
  feedbackList: ParentFeedbackItem[];
  studentName?: string;
  teacherName?: string;
  isTablet: boolean;
  onSelectFeedback?: (sessionId: string) => void;
  globalFilter?: FilterPeriod;
  onOpenFilterModal?: () => void;
}

function FeedbackRowItem({
  item,
  studentName,
  teacherName,
  isTablet,
  onPress,
  onSwipeableWillOpen,
}: {
  item: ParentFeedbackItem;
  studentName?: string;
  teacherName: string;
  isTablet: boolean;
  onPress: () => void;
  onSwipeableWillOpen?: (ref: any) => void;
}) {
  const swipeableRef = useRef<any>(null);
  const [isExportingSingle, setIsExportingSingle] = useState(false);

  const handleDownloadSingle = async () => {
    swipeableRef.current?.close();
    setIsExportingSingle(true);
    try {
      await exportSingleFeedbackPdf(studentName || 'Learner', teacherName, item);
    } catch (err: any) {
      Alert.alert('Export Error', err.message || 'Could not export feedback PDF');
    } finally {
      setIsExportingSingle(false);
    }
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const scale = progress.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0.5, 1.1, 1],
      extrapolate: 'clamp',
    });
    const opacity = progress.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });
    const transX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 0],
      extrapolate: 'clamp',
    });

    return (
      <View className="flex-row items-center justify-end pl-4 pr-2 bg-transparent" style={{ height: '100%' }}>
        <Animated.View style={{ opacity, transform: [{ scale }, { translateX: transX }] }}>
          <Pressable
            onPress={handleDownloadSingle}
            disabled={isExportingSingle}
            className="flex-col items-center justify-center active:scale-95 transition-transform"
            style={{ width: isTablet ? 72 : 56 }}
          >
            <View className="items-center justify-center" style={{ height: isTablet ? 32 : 26 }}>
              {isExportingSingle ? (
                <ActivityIndicator size="small" color="#62A9E6" />
              ) : (
                <Feather name="download" size={isTablet ? 26 : 22} color="#62A9E6" />
              )}
            </View>
            <Text
              className={`font-fredoka-one text-[#62A9E6] text-center w-full px-1 ${isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'
                }`}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              DOWNLOAD
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSwipeableWillOpen?.(swipeableRef.current);
      }}
      friction={1.5}
      overshootRight={false}
      rightThreshold={40}
    >
      <Pressable onPress={onPress} className="active:scale-[0.98] transition-transform">
        <View
          className={`bg-white border-[2px] border-[#F1F1F1] flex-row items-center justify-between ${isTablet ? 'rounded-[24px] p-5' : 'rounded-[16px] p-3.5'
            }`}
          style={{
            shadowColor: '#F1F1F1',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          }}
        >
          {/* Activity & Feedback Details */}
          <View className="flex-1 pr-3 flex-col gap-1.5">
            <Text className={`font-quicksand-bold text-[#484A4B] leading-relaxed ${isTablet ? 'text-base' : 'text-sm'}`}>
              "{item.teacherFeedback}"
            </Text>

            {/* Category Pill below Feedback + Teacher Name */}
            <View className="flex-row items-center gap-2 mt-0.5 flex-wrap">
              <View className="bg-[#F1F1F1] px-2 py-0.5 rounded-[6px]">
                <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-xs' : 'text-[10px]'}`}>
                  {item.category}
                </Text>
              </View>
              <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                by {teacherName}
              </Text>
            </View>
          </View>

          {/* Date Completed Badge Pill on Right */}
          <View className="flex-row items-center bg-white border-[2px] border-[#BBE8FB] rounded-[6px] px-2 py-0.5 gap-1 shrink-0">
            <Ionicons name="calendar" size={isTablet ? 16 : 12} color="#62A9E6" />
            <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-[14px]' : 'text-[11px]'}`}>
              {item.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );
}

export function ParentTeacherFeedback({
  feedbackList,
  studentName,
  teacherName = 'Teacher',
  isTablet,
  onSelectFeedback,
  globalFilter,
  onOpenFilterModal,
}: ParentTeacherFeedbackProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const openSwipeableRef = useRef<any>(null);

  const handleFeedbackPress = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    onSelectFeedback?.(sessionId);
  };

  const handleSwipeableWillOpen = (ref: any) => {
    if (openSwipeableRef.current && openSwipeableRef.current !== ref) {
      openSwipeableRef.current.close();
    }
    openSwipeableRef.current = ref;
  };

  const handleDownloadAll = async () => {
    if (!feedbackList || feedbackList.length === 0) return;
    setIsExportingAll(true);
    try {
      await exportAllFeedbacksPdf(studentName || 'Learner', teacherName, feedbackList);
    } catch (err: any) {
      Alert.alert('Export Error', err.message || 'Could not export feedbacks PDF');
    } finally {
      setIsExportingAll(false);
    }
  };

  const visibleFeedbacks = isExpanded ? feedbackList : feedbackList.slice(0, 4);

  return (
    <View className="flex-col mt-6 mb-12 pb-6">
      {/* Header with Title & Action Buttons (Range Filter + Download All) */}
      <View className="mb-4">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[28px]' : 'text-[20px]'}`}>
            Teacher Feedbacks
          </Text>

          <View className="flex-row items-center gap-2 flex-wrap">
            {/* Range Filter Selector Button */}
            {onOpenFilterModal && (
              <Pressable
                onPress={onOpenFilterModal}
                className="flex-row items-center justify-center gap-1.5 bg-white border-[2px] border-[#BBE8FB] px-3 h-[36px] rounded-xl active:scale-95 transition-transform"
                style={{
                  borderColor: '#BBE8FB',
                  shadowColor: '#BBE8FB',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                <Feather name="calendar" size={13} color="#62A9E6" />
                <Text className="font-fredoka-one text-[#62A9E6] text-[11px] uppercase" numberOfLines={1}>
                  RANGE: {getFilterLabel(globalFilter || 'overall').toUpperCase()}
                </Text>
                <Feather name="chevron-down" size={13} color="#62A9E6" />
              </Pressable>
            )}

            {/* Download All Reports Button */}
            {feedbackList.length > 0 && (
              <Pressable
                onPress={handleDownloadAll}
                disabled={isExportingAll}
                className="flex-row items-center justify-center gap-1.5 bg-white border-[2px] border-[#BBE8FB] px-3 h-[36px] rounded-xl active:scale-95 transition-transform"
                style={{
                  borderColor: '#BBE8FB',
                  shadowColor: '#BBE8FB',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                {isExportingAll ? (
                  <ActivityIndicator size="small" color="#62A9E6" style={{ height: 16 }} />
                ) : (
                  <>
                    <Feather name="download" size={13} color="#62A9E6" />
                    <Text className="font-fredoka-one text-[#62A9E6] text-[11px] uppercase">
                      DOWNLOAD ALL
                    </Text>
                  </>
                )}
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Content Area */}
      {feedbackList.length === 0 ? (
        <View className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-2xl p-8 items-center justify-center">
          <Ionicons name="chatbubble-ellipses-outline" size={isTablet ? 40 : 30} color="#9CA3AF" />
          <Text className="font-fredoka-one text-base text-[#4B5563] mt-3 text-center">
            No Teacher Feedback Yet
          </Text>
          <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-1 text-center">
            Feedback notes will populate as learning sessions are validated by {teacherName}.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {visibleFeedbacks.map((f) => (
            <FeedbackRowItem
              key={f.id}
              item={f}
              studentName={studentName}
              teacherName={teacherName}
              isTablet={isTablet}
              onPress={() => handleFeedbackPress(f.id)}
              onSwipeableWillOpen={handleSwipeableWillOpen}
            />
          ))}

          {/* View More / Show Less Button */}
          {feedbackList.length > 4 && (
            <Pressable
              onPress={() => setIsExpanded(!isExpanded)}
              className={`mt-2 self-center flex-row items-center justify-center gap-1.5 border-[2px] rounded-[12px] bg-white active:scale-95 transition-transform ${isTablet ? 'px-5 py-2.5' : 'px-4 py-2'
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
                {isExpanded ? 'SHOW LESS' : `VIEW MORE (${feedbackList.length - 4})`}
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

      {/* Parent Evaluation Review Modal */}
      <ParentEvaluationReviewModal
        visible={!!selectedSessionId}
        sessionId={selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
        isTablet={isTablet}
      />
    </View>
  );
}
