import React, { useEffect, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { getKpiData as getDraftKpiData, KpiData, ActivityTypeFilter } from '../../../src/services/analytics';
import IconPending from '../../../assets/images/teacher/analytics/icon-pending.svg';
import IconCompleted from '../../../assets/images/teacher/analytics/icon-completed.svg';

interface AnalyticsCardsProps {
  refreshTrigger?: number;
  activityType?: ActivityTypeFilter;
}

export function AnalyticsCards({ refreshTrigger, activityType = 'all' }: AnalyticsCardsProps = {}) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [kpi, setKpi] = useState<KpiData>({
    pendingEvaluations: 0,
    totalStudents: 0,
    totalClasses: 0,
    completedSessions: 0,
    totalSessions: 0,
    evaluatedSessions: 0,
    evaluatedPercentage: 100,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchKpiData();
  }, [refreshTrigger, activityType]);

  const fetchKpiData = async () => {
    setIsLoading(true);
    try {
      const data = await getDraftKpiData(activityType);
      setKpi(data);
    } catch (err) {
      console.error('AnalyticsCards: failed to fetch KPI data', err);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return (
      <View className={`w-full flex-row justify-between ${isTablet ? 'px-12 mt-10 gap-6' : 'px-6 mt-6 gap-3'}`}>
        {[1, 2].map((idx) => (
          <Animated.View
            key={idx}
            className={`border-[4px] bg-white justify-center items-center flex-1 ${
              isTablet ? 'rounded-[32px] p-4 h-[175px]' : 'rounded-[20px] p-3 h-[145px]'
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
        ))}
      </View>
    );
  }

  // Compliance Status Pill logic (Target: 100% evaluated, Green >= 90%, Amber 70-89%, Red < 70%)
  const compliancePct = kpi.evaluatedPercentage;
  let complianceBadge = {
    label: `● Target Met (100% Goal)`,
    color: '#179D33',
    bgColor: '#F0FDF4',
    borderColor: '#CBFAC4',
  };

  if (compliancePct < 70) {
    complianceBadge = {
      label: `● ${kpi.pendingEvaluations} Pending Evaluation${kpi.pendingEvaluations === 1 ? '' : 's'}`,
      color: '#FF8870',
      bgColor: '#FFF7ED',
      borderColor: '#FFDBD4',
    };
  } else if (compliancePct < 90) {
    complianceBadge = {
      label: `● ${kpi.pendingEvaluations} Pending (${compliancePct}%)`,
      color: '#FFAE02',
      bgColor: '#FFFBEB',
      borderColor: '#FFF3C4',
    };
  } else if (kpi.pendingEvaluations > 0) {
    complianceBadge = {
      label: `● ${kpi.pendingEvaluations} Pending of ${kpi.totalSessions}`,
      color: '#179D33',
      bgColor: '#F0FDF4',
      borderColor: '#CBFAC4',
    };
  }

  const iconSize = isTablet ? 40 : 28;

  return (
    <View className={`w-full flex-row justify-between ${isTablet ? 'px-12 mt-10 gap-6' : 'px-6 mt-6 gap-3'}`}>
      {/* Card 1: Evaluation Compliance Rate */}
      <View
        className={`border-[4px] bg-white justify-between items-center flex-1 ${
          isTablet ? 'rounded-[32px] p-4 min-h-[175px]' : 'rounded-[20px] p-3 min-h-[148px]'
        }`}
        style={{
          borderColor: '#FFDBD4',
          shadowColor: '#FFDBD4',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 2,
        }}
      >
        <Text
          className={`font-fredoka-one tracking-[0.06em] text-center ${
            isTablet ? 'text-sm mt-1' : 'text-[10px] mt-1'
          }`}
          style={{ color: '#FF8870', letterSpacing: isTablet ? 1.2 : 0.6 }}
          numberOfLines={1}
        >
          EVALUATION RATE
        </Text>

        <View className={`justify-center items-center ${isTablet ? 'my-1' : 'my-0.5'}`}>
          <IconPending width={iconSize} height={iconSize} />
        </View>

        <View className="items-center justify-center">
          <Text
            className="font-fredoka-one text-[#484A4B] text-center"
            style={{
              fontSize: isTablet ? 28 : 22,
              lineHeight: isTablet ? 32 : 24,
            }}
          >
            {compliancePct}%
          </Text>
          <Text
            className={`font-quicksand-bold text-[#9CA3AF] text-center ${
              isTablet ? 'text-xs mt-0.5' : 'text-[10px] mt-0.5'
            }`}
          >
            compliance
          </Text>
        </View>

        <View
          className={`rounded-full items-center justify-center mt-1.5 border-[1.5px] ${
            isTablet ? 'px-3 py-1' : 'px-2 py-0.5'
          }`}
          style={{ backgroundColor: complianceBadge.bgColor, borderColor: complianceBadge.borderColor }}
        >
          <Text
            className={`font-quicksand-bold text-center ${
              isTablet ? 'text-xs' : 'text-[9px]'
            }`}
            style={{ color: complianceBadge.color }}
            numberOfLines={1}
          >
            {complianceBadge.label}
          </Text>
        </View>
      </View>

      {/* Card 2: Completed Sessions */}
      <View
        className={`border-[4px] bg-white justify-between items-center flex-1 ${
          isTablet ? 'rounded-[32px] p-4 min-h-[175px]' : 'rounded-[20px] p-3 min-h-[148px]'
        }`}
        style={{
          borderColor: '#CBFAC4',
          shadowColor: '#CBFAC4',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 2,
        }}
      >
        <Text
          className={`font-fredoka-one tracking-[0.06em] text-center ${
            isTablet ? 'text-sm mt-1' : 'text-[10px] mt-1'
          }`}
          style={{ color: '#179D33', letterSpacing: isTablet ? 1.2 : 0.6 }}
          numberOfLines={1}
        >
          COMPLETED SESSIONS
        </Text>

        <View className={`justify-center items-center ${isTablet ? 'my-1' : 'my-0.5'}`}>
          <IconCompleted width={iconSize} height={iconSize} />
        </View>

        <View className="items-center justify-center">
          <Text
            className="font-fredoka-one text-[#484A4B] text-center"
            style={{
              fontSize: isTablet ? 28 : 22,
              lineHeight: isTablet ? 32 : 24,
            }}
          >
            {kpi.completedSessions}
          </Text>
          <Text
            className={`font-quicksand-bold text-[#9CA3AF] text-center ${
              isTablet ? 'text-xs mt-0.5' : 'text-[10px] mt-0.5'
            }`}
          >
            total sessions
          </Text>
        </View>

        <View
          className={`rounded-full items-center justify-center mt-1.5 border-[1.5px] ${
            isTablet ? 'px-3 py-1' : 'px-2 py-0.5'
          }`}
          style={{ backgroundColor: '#F0FDF4', borderColor: '#CBFAC4' }}
        >
          <Text
            className={`font-quicksand-bold text-center ${
              isTablet ? 'text-xs' : 'text-[9px]'
            }`}
            style={{ color: '#179D33' }}
            numberOfLines={1}
          >
            ● {kpi.evaluatedSessions} Evaluated ({compliancePct}%)
          </Text>
        </View>
      </View>
    </View>
  );
}

export default AnalyticsCards;
