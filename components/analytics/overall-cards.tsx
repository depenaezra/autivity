import { Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View, useWindowDimensions } from 'react-native';
import { getDraftKpiData, KpiData } from '../../src/services/analytics-draft';

interface CardConfig {
  key: keyof KpiData;
  label: string;
  sublabel: string;
  iconName: string;
  iconFamily: 'Feather' | 'Ionicons' | 'FontAwesome5' | 'MaterialIcons';
  accentColor: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
}

const CARDS: CardConfig[] = [
  {
    key: 'pendingEvaluations',
    label: 'Pending Evaluations',
    sublabel: 'Awaiting teacher review',
    iconName: 'clock',
    iconFamily: 'Feather',
    accentColor: '#FB923C',
    bgColor: '#FFF7ED',
    borderColor: '#FDBA74',
    iconColor: '#EA580C',
  },
  {
    key: 'totalStudents',
    label: 'Total Students',
    sublabel: 'Enrolled learners',
    iconName: 'users',
    iconFamily: 'Feather',
    accentColor: '#62A9E6',
    bgColor: '#EFF6FF',
    borderColor: '#93C5FD',
    iconColor: '#2563EB',
  },
  {
    key: 'totalClasses',
    label: 'Classes',
    sublabel: 'Active class groups',
    iconName: 'book-open',
    iconFamily: 'Feather',
    accentColor: '#A78BFA',
    bgColor: '#F5F3FF',
    borderColor: '#C4B5FD',
    iconColor: '#7C3AED',
  },
  {
    key: 'completedSessions',
    label: 'Completed Sessions',
    sublabel: 'Validated activities',
    iconName: 'check-circle',
    iconFamily: 'Feather',
    accentColor: '#4ADE80',
    bgColor: '#F0FDF4',
    borderColor: '#86EFAC',
    iconColor: '#16A34A',
  },
];

function renderIcon(
  iconFamily: CardConfig['iconFamily'],
  iconName: string,
  size: number,
  color: string
) {
  switch (iconFamily) {
    case 'Ionicons':
      return <Ionicons name={iconName as any} size={size} color={color} />;
    case 'FontAwesome5':
      return <FontAwesome5 name={iconName as any} size={size} color={color} />;
    case 'MaterialIcons':
      return <MaterialIcons name={iconName as any} size={size} color={color} />;
    default:
      return <Feather name={iconName as any} size={size} color={color} />;
  }
}

export default function OverallCards() {
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
      console.error('OverallCards: failed to fetch KPI data', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-row flex-wrap gap-3 px-6 mt-4">
        {CARDS.map((_, i) => (
          <View
            key={i}
            className="bg-white rounded-2xl border-2 border-[#E5E7EB] overflow-hidden"
            style={{ width: isTablet ? '48%' : '47%' }}
          >
            <View
              className="items-center justify-center"
              style={{ height: isTablet ? 110 : 90 }}
            >
              <ActivityIndicator size="small" color="#62A9E6" />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View
      className={`flex-row flex-wrap ${isTablet ? 'px-12 mt-6 gap-4' : 'px-6 mt-4 gap-3'}`}
    >
      {CARDS.map((card) => {
        const value = kpi[card.key];
        const iconSize = isTablet ? 28 : 22;

        return (
          <View
            key={card.key}
            className="bg-white rounded-2xl border-2 overflow-hidden shadow-sm"
            style={{
              borderColor: card.borderColor,
              // 2-column layout: account for the gap
              width: isTablet ? '48%' : '47%',
            }}
          >
            {/* coloured header band */}
            <View
              className="flex-row items-center justify-between px-4"
              style={{
                backgroundColor: card.bgColor,
                borderBottomWidth: 2,
                borderBottomColor: card.borderColor,
                paddingVertical: isTablet ? 16 : 12,
              }}
            >
              <View
                className="rounded-xl items-center justify-center"
                style={{
                  backgroundColor: `${card.accentColor}22`,
                  width: isTablet ? 48 : 38,
                  height: isTablet ? 48 : 38,
                }}
              >
                {renderIcon(card.iconFamily, card.iconName, iconSize, card.iconColor)}
              </View>

              <Text
                className="font-fredoka-one"
                style={{
                  color: card.accentColor,
                  fontSize: isTablet ? 42 : 32,
                  lineHeight: isTablet ? 50 : 38,
                }}
              >
                {value}
              </Text>
            </View>

            {/* label footer */}
            <View className="bg-white px-4 py-2.5">
              <Text
                className="font-quicksand-bold text-[#4B5563]"
                style={{ fontSize: isTablet ? 14 : 12 }}
                numberOfLines={1}
              >
                {card.label}
              </Text>
              <Text
                className="font-quicksand-medium text-[#9CA3AF]"
                style={{ fontSize: isTablet ? 12 : 10 }}
                numberOfLines={1}
              >
                {card.sublabel}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
