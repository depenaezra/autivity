import { Feather, Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { getStudentCheckInsHistory } from '../../../../src/services/check-ins';
import { getStudentValidatedSessionsEvaluations } from '../../../../src/services/student-analytics';
import {
  calculateStudentEmotionRegulationAnalytics,
  generateSchoolWeekDays,
  EmotionRegulationAnalytics,
  SchoolWeekDayEmotion,
} from '../../../../src/services/studentAnalyticsEngine';
import { EMOTIONS_METADATA, REGULATION_ZONES } from '../../../../src/utils/emotionZones';

interface StudentEmotionRegulationCardProps {
  studentId: string;
  studentName?: string;
  filter?: string;
  refreshTrigger?: number;
}

const TOTAL_PAST_WEEKS = 12; // Pre-cache up to 12 past weeks for instant scrolling

export default function StudentEmotionRegulationCard({
  studentId,
  studentName = 'Learner',
  refreshTrigger = 0,
}: StudentEmotionRegulationCardProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [showInfo, setShowInfo] = useState(false);
  const [isInsightCollapsed, setIsInsightCollapsed] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [rawCheckIns, setRawCheckIns] = useState<{ student_id: string; emotion: string; check_in_date: string }[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<SchoolWeekDayEmotion | null>(null);

  // Carousel / Paging state: activeWeekIndex (0 = 12 weeks ago, ..., 12 = current week)
  const [activeWeekIndex, setActiveWeekIndex] = useState<number>(TOTAL_PAST_WEEKS);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setSelectedDay(null);
  }, [activeWeekIndex]);

  useEffect(() => {
    async function loadData() {
      if (!studentId) return;
      setIsLoading(true);
      try {
        const [checkIns, evals] = await Promise.all([
          getStudentCheckInsHistory(studentId),
          getStudentValidatedSessionsEvaluations(studentId).catch(() => []),
        ]);

        setRawCheckIns(checkIns);
        setEvaluations(evals);
      } catch (err) {
        console.error('StudentEmotionRegulationCard error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [studentId, refreshTrigger]);

  // Pre-generate all week data across the pre-cached window (from -12 to 0)
  const cachedWeeks = useMemo(() => {
    const list: {
      weekOffset: number;
      weekIndex: number;
      weekRangeLabel: string;
      schoolWeekDays: SchoolWeekDayEmotion[];
      weekLoggedCount: number;
      weekMissedLogs: number;
      weekAnalytics: EmotionRegulationAnalytics;
    }[] = [];

    for (let i = 0; i <= TOTAL_PAST_WEEKS; i++) {
      const offset = i - TOTAL_PAST_WEEKS; // e.g. -12, -11, ..., 0
      const weekData = generateSchoolWeekDays(rawCheckIns, offset, evaluations);
      const first = weekData.schoolWeekDays[0];
      const last = weekData.schoolWeekDays[weekData.schoolWeekDays.length - 1];

      let weekRangeLabel = `${first.monthDayStr} – ${last.monthDayStr}`;
      if (offset === 0) {
        weekRangeLabel = `This Week (${first.monthDayStr} – ${last.monthDayStr})`;
      } else if (offset === -1) {
        weekRangeLabel = `Last Week (${first.monthDayStr} – ${last.monthDayStr})`;
      }

      // Filter raw check-ins to only those within this 5-day school week
      const weekDateSet = new Set(weekData.schoolWeekDays.map((d) => d.fullDateStr));
      const weekCheckIns = rawCheckIns.filter((c) => weekDateSet.has(c.check_in_date));

      const weekAnalytics = calculateStudentEmotionRegulationAnalytics(
        weekCheckIns,
        evaluations,
        studentName,
        offset
      );

      list.push({
        weekOffset: offset,
        weekIndex: i,
        weekRangeLabel,
        schoolWeekDays: weekData.schoolWeekDays,
        weekLoggedCount: weekData.weekLoggedCount,
        weekMissedLogs: weekData.weekMissedLogs,
        weekAnalytics,
      });
    }

    return list;
  }, [rawCheckIns, evaluations, studentName]);

  // Overall analytics across all time for zone average scores
  const overallZoneAnalytics = useMemo(() => {
    if (rawCheckIns.length === 0) return null;
    return calculateStudentEmotionRegulationAnalytics(rawCheckIns, evaluations, studentName, 0);
  }, [rawCheckIns, evaluations, studentName]);

  // Scroll to current week initially once container width is determined
  const hasInitiallyScrolled = useRef(false);
  const onContainerLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== containerWidth) {
      setContainerWidth(w);
      if (!hasInitiallyScrolled.current || activeWeekIndex === TOTAL_PAST_WEEKS) {
        hasInitiallyScrolled.current = true;
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: TOTAL_PAST_WEEKS * w,
            animated: false,
          });
        }, 50);
      }
    }
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (containerWidth <= 0) return;
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / containerWidth);
    const clampedIndex = Math.max(0, Math.min(TOTAL_PAST_WEEKS, newIndex));
    if (clampedIndex !== activeWeekIndex) {
      setActiveWeekIndex(clampedIndex);
    }
  };

  const activeWeek = cachedWeeks[activeWeekIndex] || cachedWeeks[TOTAL_PAST_WEEKS];
  const activeAnalytics = activeWeek?.weekAnalytics;

  const scrollToCurrentWeek = () => {
    if (containerWidth > 0) {
      scrollViewRef.current?.scrollTo({
        x: TOTAL_PAST_WEEKS * containerWidth,
        animated: true,
      });
      setActiveWeekIndex(TOTAL_PAST_WEEKS);
    }
  };

  const predominantEmotion = activeAnalytics?.dominantEmotion ? activeAnalytics.dominantEmotion.toUpperCase() : 'NONE';
  const predominantMeta = activeAnalytics?.dominantEmotion ? EMOTIONS_METADATA[activeAnalytics.dominantEmotion] : null;

  const weekScopeSubtitle = activeWeek?.weekOffset === 0
    ? 'THIS WEEK'
    : activeWeek?.weekOffset === -1
    ? 'LAST WEEK'
    : activeWeek?.weekRangeLabel.toUpperCase() || 'THIS WEEK';

  return (
    <View className="flex-col mt-6">
      {/* 1. Header (OUTSIDE & ABOVE THE CARD) */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between">
          {/* Section Title & Info Icon */}
          <View className="flex-row items-center gap-2">
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
              Emotional Recognition
            </Text>
            <Pressable
              onPress={() => setShowInfo(!showInfo)}
              className="active:opacity-75 p-1"
            >
              <Feather name="info" size={isTablet ? 20 : 16} color="#62A9E6" />
            </Pressable>
          </View>

          {/* Quick "Back to This Week" action pill if browsing past weeks */}
          {activeWeekIndex < TOTAL_PAST_WEEKS && (
            <Pressable
              onPress={scrollToCurrentWeek}
              className="flex-row items-center gap-1.5 px-3 py-1.5 bg-white border-[2px] border-[#BBE8FB] rounded-xl active:scale-95"
              style={{
                shadowColor: '#BBE8FB',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              <Feather name="rotate-ccw" size={12} color="#62A9E6" />
              <Text className="font-fredoka-one text-[11px] text-[#62A9E6] uppercase">
                This Week
              </Text>
            </Pressable>
          )}
        </View>

        {/* Full-width Info Banner Row below Title */}
        {showInfo && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOutUp.duration(150)}
            className="w-full bg-[#E0F2FE] border border-[#BBE8FB] rounded-xl p-3 mt-3 flex-row items-center gap-2.5 overflow-hidden"
          >
            <Feather name="info" size={isTablet ? 22 : 18} color="#62A9E6" />
            <Text className={`font-quicksand-bold text-[#62A9E6] flex-1 leading-normal ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
              Daily classroom check-in routines and readiness-to-learn regulation zones for this student. Swipe horizontally to view past weeks.
            </Text>
          </Animated.View>
        )}
      </View>

      {/* 2. Loading State */}
      {isLoading && (
        <View
          style={{
            backgroundColor: '#F9FAFB',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: isTablet ? 32 : 24,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            height: isTablet ? 220 : 180,
          }}
        >
          <ActivityIndicator size="small" color="#62A9E6" />
          <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-2">
            Loading emotional check-in analytics...
          </Text>
        </View>
      )}

      {/* 3. Empty State (No check-ins ever) */}
      {!isLoading && rawCheckIns.length === 0 && (
        <View className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-2xl p-8 items-center justify-center">
          <Feather name="smile" size={isTablet ? 44 : 32} color="#9CA3AF" />
          <Text className="font-fredoka-one text-lg text-[#4B5563] mt-3 text-center">
            No Check-In Entries
          </Text>
          <Text className="font-quicksand-medium text-sm text-[#9CA3AF] mt-1 text-center">
            There are no emotional check-ins recorded for this student yet.
          </Text>
        </View>
      )}

      {/* 4. Main Analytics Card */}
      {!isLoading && rawCheckIns.length > 0 && activeAnalytics && (
        <View
          style={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: isTablet ? 32 : 24,
            padding: isTablet ? 24 : 20,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.03,
            shadowRadius: 10,
            elevation: 1,
          }}
        >
          {/* Top Metric Header (100% Synced with Active Swiped Week) */}
          <View className="flex-row items-center justify-between mb-4 px-1 flex-wrap gap-2">
            <View className="flex-col">
              <View className="flex-row items-center gap-3">
                <Text className="font-fredoka-one text-[32px] sm:text-[36px] text-[#484A4B] leading-tight">
                  {predominantEmotion}
                </Text>
                {predominantMeta && (
                  <View
                    className="px-3 py-1 rounded-full flex-row items-center gap-1.5"
                    style={{ backgroundColor: predominantMeta.bgColor, borderColor: predominantMeta.borderColor, borderWidth: 1 }}
                  >
                    <Text
                      className="font-quicksand-bold text-xs sm:text-sm"
                      style={{ color: predominantMeta.color }}
                    >
                      {predominantMeta.tagalogLabel}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="font-fredoka-one text-[11px] text-[#9CA3AF] uppercase tracking-[0.06em] mt-0.5">
                PREDOMINANT EMOTION ({weekScopeSubtitle})
              </Text>
            </View>

            {/* Attendance & Logged Metrics Badges (100% Synced with Active Week) */}
            <View className="flex-row items-center gap-2">
              {/* Missed Logs Pill */}
              <View className="bg-[#FFF7ED] border border-[#FFDBD4] rounded-xl px-3 py-1.5 items-end">
                <Text className="font-fredoka-one text-[10px] text-[#FF8870] uppercase tracking-wide">
                  MISSED LOGS
                </Text>
                <Text className="font-fredoka-one text-xs sm:text-sm text-[#C2410C] mt-0.5">
                  {activeWeek?.weekMissedLogs ?? 0} {(activeWeek?.weekMissedLogs ?? 0) === 1 ? 'Day' : 'Days'}
                </Text>
              </View>

              {/* Total Logged for this Week Pill */}
              <View className="bg-[#F0FDF4] border border-[#CBFAC4] rounded-xl px-3 py-1.5 items-end">
                <Text className="font-fredoka-one text-[10px] text-[#16A34A] uppercase tracking-wide">
                  TOTAL LOGGED
                </Text>
                <Text className="font-fredoka-one text-xs sm:text-sm text-[#15803D] mt-0.5">
                  {activeWeek?.weekLoggedCount ?? 0} {activeWeek?.weekLoggedCount === 1 ? 'Day' : 'Days'}
                </Text>
              </View>
            </View>
          </View>

          {/* 5-Day School Week Strip (SMOOTH HORIZONTAL PAGING CAROUSEL) */}
          <View className="mb-5" onLayout={onContainerLayout}>
            <View className="flex-row items-center justify-between mb-2 px-1">
              <Text className="font-fredoka-one text-xs sm:text-sm text-[#484A4B] uppercase tracking-wider">
                {activeWeek?.weekRangeLabel || 'School Week'}
              </Text>
            </View>

            {/* Continuous, Zero-Latency Paging ScrollView */}
            {containerWidth > 0 && (
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScrollEnd}
                scrollEventThrottle={16}
                decelerationRate="fast"
                contentContainerStyle={{ alignItems: 'center' }}
              >
                {cachedWeeks.map((w) => (
                  <View
                    key={w.weekIndex}
                    style={{ width: containerWidth }}
                    className="flex-row justify-between gap-1.5 sm:gap-2.5 pr-0.5"
                  >
                    {w.schoolWeekDays.map((day) => {
                      const hasCheckIn = !!day.checkIn;
                      const emotionMeta = hasCheckIn ? EMOTIONS_METADATA[day.checkIn!.emotion] : null;
                      const isSelected = selectedDay?.fullDateStr === day.fullDateStr;

                      return (
                        <Pressable
                          key={day.fullDateStr}
                          onPress={() => setSelectedDay(isSelected ? null : day)}
                          className={`flex-1 rounded-[16px] sm:rounded-[20px] p-2 sm:p-3 items-center justify-between border-[2px] transition-transform active:scale-95 ${
                            hasCheckIn
                              ? isSelected
                                ? 'border-[#62A9E6] bg-[#EBF5FF]'
                                : 'border-[#E5E7EB] bg-white'
                              : 'border-[#F1F1F1] bg-[#FAFAFA]'
                          }`}
                          style={{
                            minHeight: isTablet ? 130 : 105,
                            shadowColor: isSelected ? '#62A9E6' : '#F1F1F1',
                            shadowOffset: { width: 0, height: isSelected ? 2 : 1 },
                            shadowOpacity: 1,
                            shadowRadius: 0,
                            elevation: 1,
                          }}
                        >
                          {/* Day Name & Date */}
                          <View className="items-center">
                            <Text
                              className={`font-fredoka-one text-[11px] sm:text-xs ${
                                day.isToday ? 'text-[#62A9E6]' : 'text-[#6B7280]'
                              }`}
                            >
                              {day.dayName}
                            </Text>
                            <Text className="font-quicksand-medium text-[9px] sm:text-[10px] text-[#9CA3AF]">
                              {day.monthDayStr}
                            </Text>
                          </View>

                          {/* Static Emotion Icon */}
                          {hasCheckIn && emotionMeta ? (
                            <View className="items-center justify-center my-1">
                              <ExpoImage
                                source={emotionMeta.image}
                                autoplay={false}
                                style={{ width: isTablet ? 42 : 32, height: isTablet ? 42 : 32 }}
                                contentFit="contain"
                              />
                              <Text
                                className="font-fredoka-one text-[10px] sm:text-xs text-center mt-0.5 uppercase tracking-wide"
                                style={{ color: emotionMeta.color }}
                                numberOfLines={1}
                              >
                                {emotionMeta.label}
                              </Text>
                            </View>
                          ) : (
                            <View className="items-center justify-center my-1.5 opacity-40">
                              <Ionicons name="remove-outline" size={isTablet ? 24 : 18} color="#9CA3AF" />
                              <Text className="font-quicksand-medium text-[8px] sm:text-[9px] text-[#9CA3AF] text-center">
                                {day.isFuture ? 'UPCOMING' : 'NO ENTRY'}
                              </Text>
                            </View>
                          )}

                          {/* Regulation Zone Indicator Pill */}
                          {hasCheckIn && day.checkIn ? (
                            <View
                              className="px-1.5 py-0.5 rounded-full mt-0.5 border"
                              style={{
                                backgroundColor:
                                  day.checkIn.zone === 'optimal'
                                    ? '#F0FDF4'
                                    : day.checkIn.zone === 'heightened'
                                    ? '#FFF7ED'
                                    : '#F0F9FF',
                                borderColor:
                                  day.checkIn.zone === 'optimal'
                                    ? '#CBFAC4'
                                    : day.checkIn.zone === 'heightened'
                                    ? '#FFDBD4'
                                    : '#BBE8FB',
                              }}
                            >
                              <Text
                                className="font-fredoka-one text-[8px] sm:text-[9px] text-center uppercase"
                                style={{
                                  color:
                                    day.checkIn.zone === 'optimal'
                                      ? '#179D33'
                                      : day.checkIn.zone === 'heightened'
                                      ? '#FF8870'
                                      : '#62A9E6',
                                }}
                              >
                                {day.checkIn.zone === 'optimal'
                                  ? 'OPTIMAL'
                                  : day.checkIn.zone === 'heightened'
                                  ? 'ALERT'
                                  : 'LOW ENG'}
                              </Text>
                            </View>
                          ) : (
                            <View className="h-3" />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Selected Day Expanded Details Tooltip */}
            {selectedDay && (
              <View className="mt-2.5 p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex-col gap-1.5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-wrap gap-2">
                    <Text className="font-quicksand-bold text-xs text-[#6B7280]">
                      {selectedDay.dayName} ({selectedDay.fullDateStr}):
                    </Text>
                    {selectedDay.checkIn ? (
                      <>
                        <Text className="font-fredoka-one text-sm text-[#484A4B]">
                          {selectedDay.checkIn.label}{' '}
                          <Text className="font-quicksand-medium text-xs text-[#6B7280]">
                            ({selectedDay.checkIn.tagalogLabel})
                          </Text>
                        </Text>

                        {/* Subtle Regulation Zone Pill */}
                        {(() => {
                          const zoneKey = selectedDay.checkIn.zone;
                          const zoneConfig = REGULATION_ZONES[zoneKey];
                          return (
                            <View
                              className="px-2 py-0.5 rounded-full border"
                              style={{
                                backgroundColor: zoneConfig?.bgColor || '#F0F9FF',
                                borderColor: zoneConfig?.borderColor || '#BBE8FB',
                              }}
                            >
                              <Text
                                className="font-fredoka-one text-[9px] uppercase tracking-wide"
                                style={{ color: zoneConfig?.color || '#62A9E6' }}
                              >
                                {zoneConfig?.title || 'LOW ENERGY'}
                              </Text>
                            </View>
                          );
                        })()}
                      </>
                    ) : (
                      <Text className="font-quicksand-medium text-xs text-[#9CA3AF]">
                        {selectedDay.isFuture ? 'Upcoming day' : 'Missed check-in (no entry recorded)'}
                      </Text>
                    )}
                  </View>
                  <Pressable onPress={() => setSelectedDay(null)} className="p-1">
                    <Feather name="x" size={14} color="#94A3B8" />
                  </Pressable>
                </View>

                {/* Day Activity Evaluation Performance Score */}
                <View className="flex-row items-center gap-2 pt-1 border-t border-[#E2E8F0]/70">
                  <Feather name="target" size={13} color="#62A9E6" />
                  {selectedDay.evaluation ? (
                    <Text className="font-quicksand-medium text-xs text-[#484A4B]">
                      Day Evaluation Score:{' '}
                      <Text className="font-fredoka-one text-[#179D33]">
                        {selectedDay.evaluation.score.toFixed(1)} / 4.0
                      </Text>{' '}
                      <Text className="font-quicksand-bold text-[#6B7280]">
                        ({selectedDay.evaluation.percentage}% Mastery)
                      </Text>
                    </Text>
                  ) : (
                    <Text className="font-quicksand-medium text-xs text-[#9CA3AF]">
                      Day Evaluation: No session evaluated on this day
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Regulation Zones Breakdown & Performance Correlation (100% Synced with Active Swiped Week + Overall Average Score) */}
          <View className="pt-4 border-t border-[#F1F1F1]">
            <View className="mb-3">
              <Text className="font-fredoka-one text-xs sm:text-sm text-[#484A4B] uppercase tracking-wider">
                Regulation Zones Distribution ({weekScopeSubtitle})
              </Text>
            </View>

            <View className="gap-3">
              {activeAnalytics.zoneDistribution.map((z) => {
                const overallZone = overallZoneAnalytics?.zoneDistribution.find((oz) => oz.zoneKey === z.zoneKey);
                const avgScore = overallZone?.averageScore;

                return (
                  <View key={z.zoneKey} className="w-full">
                    <View className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center gap-1.5 flex-wrap">
                        <View
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: z.color }}
                        />
                        <Text className="font-fredoka-one text-xs sm:text-sm text-[#484A4B]">
                          {z.title}
                        </Text>
                        {avgScore !== null && avgScore !== undefined ? (
                          <View
                            className="px-2 py-0.5 rounded-md border flex-row items-center gap-1"
                            style={{ backgroundColor: z.bgColor, borderColor: z.borderColor }}
                          >
                            <Feather name="award" size={10} color={z.color} />
                            <Text className="font-fredoka-one text-[10px]" style={{ color: z.color }}>
                              Avg: {avgScore.toFixed(1)} / 4.0
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <Text className="font-fredoka-one text-xs sm:text-sm" style={{ color: z.color }}>
                        {z.percentage}% ({z.count} {z.count === 1 ? 'Day' : 'Days'})
                      </Text>
                    </View>

                    {/* Progress Track */}
                    <View
                      className="w-full h-2.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: z.trackBg || '#F3F4F6' }}
                    >
                      <View
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(z.percentage, z.count > 0 ? 4 : 0)}%`,
                          backgroundColor: z.color,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Collapsible Behavioral Insight Card (100% Synced with Active Swiped Week) */}
          <View className="mt-5 rounded-2xl bg-[#F0F9FF] border border-[#BBE8FB] overflow-hidden">
            <Pressable
              onPress={() => setIsInsightCollapsed(!isInsightCollapsed)}
              className="p-3.5 sm:p-4 flex-row items-center justify-between active:opacity-80"
            >
              <View className="flex-row items-center gap-2.5 flex-1">
                <View className="w-7 h-7 rounded-xl bg-white border border-[#BBE8FB] items-center justify-center shrink-0">
                  <Feather name="info" size={14} color="#62A9E6" />
                </View>
                <Text className="font-fredoka-one text-xs sm:text-sm text-[#0369A1]">
                  Behavioral Insight ({weekScopeSubtitle})
                </Text>
              </View>
              <Feather
                name={isInsightCollapsed ? 'chevron-down' : 'chevron-up'}
                size={16}
                color="#0369A1"
              />
            </Pressable>

            {!isInsightCollapsed && (
              <View className="px-4 pb-4 pt-0">
                <Text className="font-quicksand-medium text-xs sm:text-sm text-[#334155] leading-relaxed">
                  {activeAnalytics.insightSummary}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}





