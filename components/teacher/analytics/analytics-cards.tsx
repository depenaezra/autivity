import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { getKpiData as getDraftKpiData, KpiData } from '../../../src/services/analytics';
import IconPending from '../../../assets/images/teacher/analytics/icon-pending.svg';
import IconCompleted from '../../../assets/images/teacher/analytics/icon-completed.svg';

interface AnalyticsCardConfig {
  key: keyof KpiData;
  label: string;
  borderColor: string;
  labelColor: string;
  IconComponent: React.ComponentType<{ width: number; height: number }>;
  iconSizeMultiplier?: number;
}

const CARD_CONFIGS: AnalyticsCardConfig[] = [
  {
    key: 'pendingEvaluations',
    label: 'PENDING EVALUATIONS',
    borderColor: '#FFDBD4',
    labelColor: '#FF8870',
    IconComponent: IconPending,
    iconSizeMultiplier: 0.85,
  },
  {
    key: 'completedSessions',
    label: 'COMPLETED SESSIONS',
    borderColor: '#CBFAC4',
    labelColor: '#179D33',
    IconComponent: IconCompleted,
  },
];

function AnalyticsCardSkeletonItem({ card, isTablet }: { card: (typeof CARD_CONFIGS)[0]; isTablet: boolean }) {
  const opacity = useSharedValue(0.4);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 750 }),
        withTiming(0.4, { duration: 750 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      key={card.key}
      className={`border-[4px] bg-white justify-center items-center flex-1 ${
        isTablet ? 'rounded-[32px] p-4 h-[160px]' : 'rounded-[20px] p-3 h-[130px]'
      }`}
      style={[
        {
          borderColor: '#F1F1F1',
          shadowColor: '#F1F1F1',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 2,
        },
        animatedStyle,
      ]}
    >
      <View className={`bg-[#E5E7EB] rounded-full ${isTablet ? 'w-12 h-12 mb-2' : 'w-8 h-8 mb-1.5'}`} />
      <View className={`bg-[#E5E7EB] rounded-[4px] ${isTablet ? 'w-16 h-7 mb-2' : 'w-10 h-5 mb-1.5'}`} />
      <View className={`bg-[#E5E7EB] rounded-[4px] ${isTablet ? 'w-20 h-4' : 'w-14 h-3'}`} />
    </Animated.View>
  );
}

export function AnalyticsCards() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [kpi, setKpi] = useState<KpiData>({
    pendingEvaluations: 0,
    totalStudents: 0,
    totalClasses: 0,
    completedSessions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchKpiData();
  }, []);

  const fetchKpiData = async () => {
    setIsLoading(true);
    try {
      const data = await getDraftKpiData();
      setKpi(data);
    } catch (err) {
      console.error('AnalyticsCards: failed to fetch KPI data', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className={`w-full flex-row justify-between ${isTablet ? 'px-12 mt-10 gap-6' : 'px-6 mt-6 gap-3'}`}>
        {CARD_CONFIGS.map((card) => (
          <AnalyticsCardSkeletonItem key={card.key} card={card} isTablet={isTablet} />
        ))}
      </View>
    );
  }

  return (
    <View className={`w-full flex-row justify-between ${isTablet ? 'px-12 mt-10 gap-6' : 'px-6 mt-6 gap-3'}`}>
      {CARD_CONFIGS.map((card) => {
        const count = kpi[card.key];
        const iconSize = (isTablet ? 48 : 32) * (card.iconSizeMultiplier ?? 1);

        return (
          <View
            key={card.key}
            className={`border-[4px] bg-white justify-center items-center flex-1 ${
              isTablet ? 'rounded-[32px] p-4 h-[160px]' : 'rounded-[20px] p-3 h-[130px]'
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
                isTablet ? 'text-sm mt-2' : 'text-[10px] mt-2'
              }`}
              style={{ color: card.labelColor, letterSpacing: isTablet ? 1.2 : 0.6 }}
              numberOfLines={1}
            >
              {card.label}
            </Text>

            {/* Icon */}
            <View className={`justify-center items-center ${isTablet ? 'my-2' : 'my-1.5'}`}>
              <card.IconComponent width={iconSize} height={iconSize} />
            </View>

            {/* Count */}
            <Text
              className={`font-fredoka-one text-[#484A4B] text-center ${
                isTablet ? 'text-4xl mb-2' : 'text-[26px] mb-2'
              }`}
            >
              {count}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default AnalyticsCards;
