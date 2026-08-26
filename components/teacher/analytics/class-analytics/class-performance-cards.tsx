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
import { ClassSessionStats, getClassSessionStats } from '../../../../src/services/class-analytics';

interface ClassPerformanceCardsProps {
  classId: string;
}

type FilterType = 'today' | 'week' | 'month' | 'overall';

function ClassPerformanceCardsSkeleton({ isTablet }: { isTablet: boolean }) {
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
    <Animated.View style={animatedStyle} className="flex-row gap-4">
      {[1, 2].map((cardKey) => (
        <View
          key={cardKey}
          className={`border-[4px] bg-white justify-center items-center flex-1 ${isTablet ? 'rounded-[32px] p-4 h-[160px]' : 'rounded-[20px] p-3 h-[130px]'
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
          <View className={`bg-[#E5E7EB] rounded-[4px] ${isTablet ? 'w-32 h-4 mb-3' : 'w-20 h-3 mb-2'}`} />
          <View className={`bg-[#E5E7EB] rounded-full ${isTablet ? 'w-10 h-10 mb-3' : 'w-7 h-7 mb-2'}`} />
          <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'w-20 h-8' : 'w-14 h-6'}`} />
        </View>
      ))}
    </Animated.View>
  );
}

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
    accentColor: '#62A9E6',
    bgColor: '#E0F2FE',
    borderColor: '#BBE8FB',
    iconColor: '#62A9E6',
  },
  {
    key: 'mistakes',
    label: 'Average Mistakes',
    sublabel: 'Mistakes per session',
    iconName: 'alert-circle',
    accentColor: '#F43F5E',
    bgColor: '#FFF1F2',
    borderColor: '#FECDD3',
    iconColor: '#E11D48',
  },
];

export default function ClassPerformanceCards({ classId }: ClassPerformanceCardsProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [filter, setFilter] = useState<FilterType>('overall');
  const [stats, setStats] = useState<ClassSessionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadStats() {
      setIsLoading(true);
      try {
        const data = await getClassSessionStats(classId, filter);
        if (active) {
          setStats(data);
          setError(null);
        }
      } catch (err: any) {
        console.error('ClassPerformanceCards: failed to load stats', err);
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
  }, [classId, filter]);

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
      <View className="flex-col mt-4">
        <ClassPerformanceCardsSkeleton isTablet={isTablet} />
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
              Class Performance
            </Text>
            <Pressable
              onPress={() => setShowInfo(!showInfo)}
              className="active:opacity-75 p-1"
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
            className="w-full bg-[#E0F2FE] border border-[#BBE8FB] rounded-xl p-3 mt-3 flex-row items-center gap-2.5 overflow-hidden"
          >
            <Feather name="info" size={isTablet ? 22 : 18} color="#62A9E6" />
            <Text className={`font-quicksand-bold text-[#62A9E6] flex-1 leading-normal ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
              Key indicators for completed sessions of this class.
            </Text>
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
        <View className="flex-row gap-4">
          {CARDS.map((card) => {
            const value = hasNoSessions
              ? 'No sessions'
              : card.key === 'duration'
                ? formatDuration(stats!.averageDuration)
                : formatMistakes(stats!.averageMistakes);

            const iconSize = isTablet ? 48 : 32;

            return (
              <View
                key={card.key}
                className={`border-[4px] bg-white justify-center items-center flex-1 ${isTablet ? 'rounded-[32px] p-4 h-[160px]' : 'rounded-[20px] p-3 h-[130px]'
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
                  className={`font-fredoka-one tracking-[0.06em] text-center ${isTablet ? 'text-sm mt-2' : 'text-[10px] mt-2'
                    }`}
                  style={{ color: card.accentColor, letterSpacing: isTablet ? 1.2 : 0.6 }}
                  numberOfLines={1}
                >
                  {card.label.toUpperCase()}
                </Text>

                {/* Icon */}
                <View className={`justify-center items-center ${isTablet ? 'my-2' : 'my-1.5'}`}>
                  <Feather name={card.iconName as any} size={iconSize} color={card.accentColor} />
                </View>

                {/* Value / Count */}
                <Text
                  className="font-fredoka-one text-[#484A4B] text-center mb-1"
                  style={{ fontSize: hasNoSessions ? (isTablet ? 14 : 11) : (isTablet ? 36 : 26) }}
                >
                  {value}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
