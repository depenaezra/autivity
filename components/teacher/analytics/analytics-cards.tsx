import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View, useWindowDimensions } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getKpiData as getDraftKpiData, KpiData } from '../../../src/services/analytics';

interface AnalyticsCardConfig {
  key: keyof KpiData | 'placeholder';
  label: string;
  borderColor: string;
  labelColor: string;
  iconName: string;
  iconFamily: 'Feather' | 'Ionicons' | 'MaterialCommunityIcons';
}

const CARD_CONFIGS: AnalyticsCardConfig[] = [
  {
    key: 'pendingEvaluations',
    label: 'PENDING EVALS',
    borderColor: '#FFDBD4',
    labelColor: '#FF8870',
    iconName: 'clock',
    iconFamily: 'Feather',
  },
  {
    key: 'completedSessions',
    label: 'COMPLETED SESSIONS',
    borderColor: '#CBFAC4',
    labelColor: '#179D33',
    iconName: 'check-circle',
    iconFamily: 'Feather',
  },
  {
    key: 'placeholder',
    label: 'PLACEHOLDER',
    borderColor: '#FFF3C4',
    labelColor: '#FFAE02',
    iconName: 'help-circle',
    iconFamily: 'Feather',
  },
];

function renderCardIcon(
  family: AnalyticsCardConfig['iconFamily'],
  name: string,
  size: number,
  color: string
) {
  switch (family) {
    case 'Ionicons':
      return <Ionicons name={name as any} size={size} color={color} />;
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
    default:
      return <Feather name={name as any} size={size} color={color} />;
  }
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
      <View className={`w-full flex-row flex-wrap justify-between ${isTablet ? 'px-12 mt-6 gap-4' : 'px-6 mt-4 gap-3'}`}>
        {CARD_CONFIGS.map((card) => (
          <View
            key={card.key}
            className={`border-[4px] bg-white justify-center items-center ${
              isTablet ? 'rounded-[32px] p-4 flex-1 min-w-[160px]' : 'rounded-[20px] p-3 flex-1 min-w-[100px]'
            }`}
            style={{
              borderColor: card.borderColor,
              shadowColor: card.borderColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
              ...(!isTablet ? { aspectRatio: 1 } : { height: 155 }),
            }}
          >
            <ActivityIndicator size="small" color={card.labelColor} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className={`w-full flex-row flex-wrap justify-between ${isTablet ? 'px-12 mt-6 gap-4' : 'px-6 mt-4 gap-3'}`}>
      {CARD_CONFIGS.map((card) => {
        const count = card.key === 'placeholder' ? '-' : kpi[card.key as keyof KpiData];
        const iconSize = isTablet ? 48 : 32;

        return (
          <View
            key={card.key}
            className={`border-[4px] bg-white justify-center items-center ${
              isTablet ? 'rounded-[32px] p-4 flex-1 min-w-[160px]' : 'rounded-[20px] p-3 flex-1 min-w-[100px]'
            }`}
            style={{
              borderColor: card.borderColor,
              shadowColor: card.borderColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
              ...(!isTablet ? { aspectRatio: 1 } : { height: 155 }),
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
              {renderCardIcon(card.iconFamily, card.iconName, iconSize, card.labelColor)}
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
