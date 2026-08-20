import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

import { getClassPerformanceById } from '../../../../src/services/class-analytics';
import { ClassPerformanceData } from '../../../../src/services/analytics';
import { ScreenLayout } from '../../../screen-layout';
import { HeaderButton } from '../../../header-button';

import OverviewCards from './overview-cards';
import ClassEvaluationTrend from './class-evaluation-trend';
import ClassDevelopmentalDomainPractice from './class-developmental-domain-practice';
import { ClassAnalyticsHeaderSkeleton, ClassAnalyticsSkeleton } from './class-analytics-skeleton';

// SVGs for themed headers
import HeaderClassBlue from '../../../../assets/images/teacher/class/header-class-blue.svg';
import HeaderClassGreen from '../../../../assets/images/teacher/class/header-class-green.svg';
import HeaderClassOrange from '../../../../assets/images/teacher/class/header-class-orange.svg';
import HeaderClassYellow from '../../../../assets/images/teacher/class/header-class-yellow.svg';

const headerSvgs: Record<string, React.FC<any>> = {
  blue: HeaderClassBlue,
  green: HeaderClassGreen,
  orange: HeaderClassOrange,
  yellow: HeaderClassYellow,
};

const themeStyles: Record<string, { stroke: string; font: string; fill: string }> = {
  green: {
    stroke: '#CBFAC4',
    font: '#179D33',
    fill: '#CBFAC4',
  },
  orange: {
    stroke: '#FFDBD4',
    font: '#FF8870',
    fill: '#FFDBD4',
  },
  yellow: {
    stroke: '#FFF3C4',
    font: '#FFAE02',
    fill: '#FFF3C4',
  },
  blue: {
    stroke: '#BBE8FB',
    font: '#62A9E6',
    fill: '#BBE8FB',
  },
};

interface ClassAnalyticsViewProps {
  classId: string;
  onBack: () => void;
}

export default function ClassAnalyticsView({ classId, onBack }: ClassAnalyticsViewProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const [classData, setClassData] = useState<ClassPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      setIsLoading(true);
      try {
        const data = await getClassPerformanceById(classId);
        setClassData(data);
        setError(null);
      } catch (err: any) {
        console.error('ClassAnalyticsView: error loading class details', err);
        setError('Failed to load class analytics details.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetails();
  }, [classId]);

  const themeKey = (classData?.theme || 'blue').toLowerCase();
  const HeaderBgSvg = headerSvgs[themeKey] || headerSvgs.blue;

  const renderHeaderBackground = () => {
    if (isLoading || !classData) {
      return (
        <View className="flex-1 w-full h-full bg-[#E5E7EB]/50" />
      );
    }

    return (
      <View className="flex-1 w-full h-full relative">
        <View className="absolute inset-0">
          <HeaderBgSvg width="100%" height="100%" preserveAspectRatio="xMidYMax slice" />
        </View>
      </View>
    );
  };

  const renderHeaderContent = () => {
    if (isLoading || !classData) {
      return <ClassAnalyticsHeaderSkeleton isTablet={isTablet} />;
    }

    if (!classData.isArchived) return null;

    return (
      <View className="flex-row items-center flex-wrap gap-2 pt-1">
        {/* Archived Badge */}
        <View className="bg-red-100 border border-red-300 px-2.5 py-1 rounded-[6px] flex-row items-center gap-1">
          <View className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <Text
            className="font-fredoka-one text-red-600 uppercase"
            style={{ fontSize: isTablet ? 12 : 10 }}
          >
            ARCHIVED
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenLayout
      headerBackground={renderHeaderBackground()}
      title={isLoading ? undefined : classData?.title}
      leftHeaderButton={
        <HeaderButton
          onPress={onBack}
          icon={
            <View style={{ marginLeft: -3, marginTop: -1 }}>
              <Ionicons name="caret-back" size={isTablet ? 30 : 24} color="#62A9E6" />
            </View>
          }
        />
      }
      headerContent={renderHeaderContent()}
      scrollable={true}
    >
      <View className={`bg-white min-h-screen ${isTablet ? 'px-12 py-6' : 'px-6 py-4'}`}>
        {isLoading ? (
          <ClassAnalyticsSkeleton isTablet={isTablet} />
        ) : error || !classData ? (
          <View className="w-full justify-center items-center py-10 bg-white border border-[#E5E7EB] rounded-2xl px-6">
            <Feather name="alert-circle" size={36} color="#EF4444" />
            <Text className="font-fredoka-one text-lg text-[#4B5563] mt-3 text-center">
              Error Loading Analytics
            </Text>
            <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-1 text-center">
              {error || 'Class details not found.'}
            </Text>
          </View>
        ) : (
          <View className="flex-col gap-6">
            {/* Overview KPI Cards */}
            <OverviewCards classId={classId} />

            {/* Class Evaluation Trend Chart */}
            <ClassEvaluationTrend classId={classId} />

            {/* Developmental Domain Practice */}
            <ClassDevelopmentalDomainPractice classId={classId} />
          </View>
        )}
      </View>
    </ScreenLayout>
  );
}

