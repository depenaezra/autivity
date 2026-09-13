import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { StudentSessionStats, getStudentSessionStats } from '../../../../src/services/student-analytics';
import { StudentKpiCalculationModal, MetricKey } from './student-kpi-calculation-modal';

interface StudentPerformanceCardsProps {
  studentId: string;
  filter?: string;
  refreshTrigger?: number;
}

type FilterType = 'today' | 'week' | 'month' | 'overall';

function StudentPerformanceCardsSkeleton({ isTablet }: { isTablet: boolean }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 750 }),
        withTiming(0.4, { duration: 750 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle} className="flex-row gap-2.5 sm:gap-4">
      {[1, 2, 3].map((cardKey) => (
        <View
          key={cardKey}
          className={`border-[4px] bg-white justify-between items-center flex-1 ${
            isTablet ? 'rounded-[32px] p-4 min-h-[175px]' : 'rounded-[20px] p-2.5 min-h-[148px]'
          }`}
          style={{
            borderColor: '#F1F1F1',
            shadowColor: '#F1F1F1',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          }}
        >
          <View className={`bg-[#E5E7EB] rounded-[4px] ${isTablet ? 'w-24 h-4 mt-1' : 'w-16 h-3 mt-1'}`} />
          <View className={`bg-[#E5E7EB] rounded-full ${isTablet ? 'w-9 h-9 my-1' : 'w-6 h-6 my-1'}`} />
          <View className="items-center w-full">
            <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'w-16 h-7 mb-1' : 'w-12 h-5 mb-1'}`} />
            <View className={`bg-[#E5E7EB] rounded-[4px] ${isTablet ? 'w-16 h-3' : 'w-12 h-2.5'}`} />
          </View>
          <View className={`bg-[#E5E7EB] rounded-full ${isTablet ? 'w-20 h-5 mb-1' : 'w-14 h-4 mb-1'}`} />
        </View>
      ))}
    </Animated.View>
  );
}

interface CardConfig {
  key: MetricKey;
  label: string;
  iconName: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
}

const CARDS: CardConfig[] = [
  {
    key: 'duration',
    label: 'Avg Session',
    iconName: 'clock',
    accentColor: '#62A9E6',
    bgColor: '#E0F2FE',
    borderColor: '#BBE8FB',
  },
  {
    key: 'mistakes',
    label: 'Avg Mistakes',
    iconName: 'alert-circle',
    accentColor: '#F43F5E',
    bgColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  {
    key: 'hints',
    label: 'Avg Hints',
    iconName: 'help-circle',
    accentColor: '#FFAE02',
    bgColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
];

export default function StudentPerformanceCards({ studentId, filter: externalFilter, refreshTrigger }: StudentPerformanceCardsProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [filter, setFilter] = useState<FilterType>((externalFilter as any) || 'overall');
  const [stats, setStats] = useState<StudentSessionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedCardForModal, setSelectedCardForModal] = useState<MetricKey | null>(null);

  useEffect(() => {
    if (externalFilter) {
      setFilter(externalFilter as any);
    }
  }, [externalFilter]);

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
        console.error('StudentPerformanceCards: failed to load stats', err);
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
  }, [studentId, filter, refreshTrigger]);

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

  const formatHints = (avgHints: number) => {
    return `${avgHints.toFixed(1)}`;
  };

  const hasNoSessions = !stats || stats.totalSessions === 0;

  if (isLoading) {
    return (
      <View className="flex-col mt-4">
        <StudentPerformanceCardsSkeleton isTablet={isTablet} />
      </View>
    );
  }

  return (
    <View className="flex-col mt-4">
      {/* Header and Filter Controls */}
      <View className="mb-4">
        <View className="flex-row flex-wrap justify-between items-center gap-3">
          <View className="flex-row items-center gap-2">
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
              Student Performance
            </Text>
            <Pressable
              onPress={() => setShowInfo(!showInfo)}
              className="active:opacity-75 p-1"
              accessibilityLabel="Information about student performance metrics"
            >
              <Feather name="info" size={isTablet ? 20 : 16} color="#62A9E6" />
            </Pressable>
          </View>

          <View className="flex-row items-center gap-1.5 flex-wrap">
            {filterButtons.map((btn) => {
              const isActive = filter === btn.value;
              return (
                <Pressable
                  key={btn.value}
                  onPress={() => setFilter(btn.value)}
                  className="active:scale-95 transition-transform"
                  style={{
                    borderWidth: 2,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: isTablet ? 16 : 12,
                    paddingVertical: isTablet ? 8 : 6,
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
                    {btn.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Full-width Info Banner Row below Title & Filters */}
        {showInfo && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOutUp.duration(150)}
            className="w-full bg-[#E0F2FE] border border-[#BBE8FB] rounded-2xl p-3.5 mt-3 flex-row items-start gap-3 overflow-hidden"
          >
            <View className="mt-0.5">
              <Feather name="info" size={isTablet ? 22 : 18} color="#62A9E6" />
            </View>
            <View className="flex-1">
              <Text className={`font-quicksand-bold text-[#1E40AF] leading-snug ${isTablet ? 'text-sm' : 'text-xs'}`}>
                Averages are calculated per completed session (Total ÷ Sessions).
              </Text>
              <Text className={`font-quicksand-medium text-[#2563EB] mt-1 leading-relaxed ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                Unlike 1.0–4.0 rubric scores, mistakes and hints have no max cap—lower numbers indicate greater accuracy and independence. Tap any card below to view its formula and breakdown.
              </Text>
            </View>
          </Animated.View>
        )}
      </View>

      {error ? (
        <View className="w-full justify-center items-center py-6 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
          <Feather name="alert-circle" size={24} color="#EF4444" />
          <Text className="font-quicksand-semibold text-sm text-[#9CA3AF] mt-2">
            {error}
          </Text>
        </View>
      ) : (
        <View className="flex-row gap-2.5 sm:gap-4">
          {CARDS.map((card) => {
            const value = hasNoSessions
              ? 'No sessions'
              : card.key === 'duration'
                ? formatDuration(stats!.averageDuration)
                : card.key === 'mistakes'
                  ? formatMistakes(stats!.averageMistakes)
                  : formatHints(stats!.averageHints);

            const iconSize = isTablet ? 36 : 24;

            const totalSubtitle = hasNoSessions
              ? '0 sessions'
              : card.key === 'duration'
                ? `${stats?.totalSessions ?? 0} sessions`
                : card.key === 'mistakes'
                  ? `${stats?.totalMistakes ?? 0} total`
                  : `${stats?.totalHints ?? 0} total`;

            return (
              <Pressable
                key={card.key}
                onPress={() => setSelectedCardForModal(card.key)}
                className={`border-[4px] bg-white justify-between items-center flex-1 active:scale-95 transition-transform ${
                  isTablet ? 'rounded-[32px] p-4 min-h-[175px]' : 'rounded-[20px] p-2.5 min-h-[148px]'
                }`}
                style={{
                  borderColor: card.borderColor,
                  shadowColor: card.borderColor,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                {/* Label */}
                <Text
                  className={`font-fredoka-one tracking-[0.06em] text-center ${
                    isTablet ? 'text-sm mt-1' : 'text-[10px] mt-1'
                  }`}
                  style={{ color: card.accentColor, letterSpacing: isTablet ? 1.2 : 0.6 }}
                  numberOfLines={1}
                >
                  {card.label.toUpperCase()}
                </Text>

                {/* Icon */}
                <View className={`justify-center items-center ${isTablet ? 'my-1' : 'my-0.5'}`}>
                  <Feather name={card.iconName as any} size={iconSize} color={card.accentColor} />
                </View>

                {/* Value & Rate Unit */}
                <View className="items-center justify-center">
                  <Text
                    className="font-fredoka-one text-[#484A4B] text-center"
                    style={{
                      fontSize: hasNoSessions ? (isTablet ? 13 : 11) : (isTablet ? 28 : 22),
                      lineHeight: hasNoSessions ? undefined : (isTablet ? 32 : 24),
                    }}
                    numberOfLines={1}
                  >
                    {value}
                  </Text>
                  {!hasNoSessions && (
                    <Text
                      className={`font-quicksand-bold text-[#9CA3AF] text-center ${
                        isTablet ? 'text-xs mt-0.5' : 'text-[10px] mt-0.5'
                      }`}
                    >
                      per session
                    </Text>
                  )}
                </View>

                {/* Totals Pill */}
                <View
                  className={`rounded-full items-center justify-center mt-1.5 ${
                    isTablet ? 'px-2.5 py-1' : 'px-2 py-0.5'
                  }`}
                  style={{ backgroundColor: card.bgColor }}
                >
                  <Text
                    className={`font-quicksand-bold text-center ${
                      isTablet ? 'text-xs' : 'text-[9px]'
                    }`}
                    style={{ color: card.accentColor }}
                    numberOfLines={1}
                  >
                    {totalSubtitle}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* DEDICATED CALCULATION & INSIGHTS MODAL COMPONENT */}
      <StudentKpiCalculationModal
        visible={selectedCardForModal !== null}
        onClose={() => setSelectedCardForModal(null)}
        initialMetric={selectedCardForModal}
        stats={stats}
        filter={filter}
        isTablet={isTablet}
      />
    </View>
  );
}
