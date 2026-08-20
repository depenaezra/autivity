import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { getClassPerformance, ClassPerformanceData } from '../../../src/services/analytics';
import { ClassCardSkeleton } from '../home/class-card-skeleton';
import PerformanceIcon from '../../../assets/images/teacher/analytics/icon-performance.svg';

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

interface AnalyticsClassCardProps {
  item: ClassPerformanceData;
  isTablet: boolean;
  isActive: boolean;
  onPress: () => void;
}

function AnalyticsClassCard({ item, isTablet, isActive, onPress }: AnalyticsClassCardProps) {
  const themeKey = (item.theme || 'green').toLowerCase();
  const styleConfig = themeStyles[themeKey] || themeStyles.green;
  const pressScale = useSharedValue(1);

  const handlePressIn = () => {
    pressScale.value = withTiming(0.97, { duration: 100 });
  };

  const handlePressOut = () => {
    pressScale.value = withTiming(1, { duration: 150 });
  };

  const isArchived = item.isArchived;

  const animatedStyle = useAnimatedStyle(() => {
    const targetColor = !isActive
      ? '#F1F1F1'
      : isArchived
      ? '#D1D5DB'
      : styleConfig.stroke;

    const baseScale = isActive ? 1 : 0.95;
    const currentScale = baseScale * pressScale.value;

    return {
      borderColor: withTiming(targetColor, { duration: 250 }),
      shadowColor: withTiming(targetColor, { duration: 250 }),
      transform: [
        {
          scale: withTiming(currentScale, {
            duration: 150,
            easing: Easing.out(Easing.ease),
          }),
        },
      ],
    };
  });

  const badgeFill = !isActive ? '#F1F1F1' : isArchived ? '#E5E7EB' : styleConfig.fill;
  const badgeFont = !isActive ? '#9CA3AF' : isArchived ? '#6B7280' : styleConfig.font;
  const badgeStroke = !isActive ? '#F1F1F1' : isArchived ? '#D1D5DB' : styleConfig.stroke;

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View
        className={`bg-white border-[4px] justify-between items-start ${
          isTablet
            ? 'w-[420px] h-[200px] mr-3.5 rounded-[32px] p-6'
            : 'w-[290px] h-[135px] mr-2 rounded-[20px] p-3'
        }`}
        style={[
          {
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          },
          animatedStyle,
        ]}
      >
        {/* Card Content Details */}
        <View className="w-full flex-1 justify-start">
          {/* Header Row: Title & Archived Pill on Left, Percentage text on Upper Right */}
          <View className="flex-row items-start justify-between w-full">
            <View className="flex-1 flex-row items-center gap-1.5 flex-wrap mr-2">
              <Text
                className={`font-fredoka-one text-[#484A4B] ${
                  isTablet ? 'text-[32px]' : 'text-[22px]'
                }`}
                numberOfLines={1}
              >
                {item.title}
              </Text>

              {isArchived && (
                <View className="flex-row items-center rounded-[6px] px-1.5 py-0.5 bg-[#E5E7EB] border border-[#D1D5DB]">
                  <Text className={`font-fredoka-one text-[#6B7280] ${isTablet ? 'text-[11px]' : 'text-[9px]'}`}>
                    ARCHIVED
                  </Text>
                </View>
              )}
            </View>

            {/* Evaluated Percentage Text on Upper Right */}
            <Text
              className={`font-fredoka-one mt-0.5 ${
                isTablet ? 'text-sm' : 'text-[11px]'
              }`}
              style={{ color: badgeFont }}
            >
              {item.evaluatedPercentage}% Evaluated
            </Text>
          </View>

          {/* Grade Badge */}
          <View
            className="flex-row items-center rounded-[6px] px-2 py-1 self-start mt-1 gap-1"
            style={{ backgroundColor: badgeFill }}
          >
            <Ionicons
              name="document-text"
              size={isTablet ? 16 : 12}
              color={badgeFont}
            />
            <Text
              className={`font-fredoka-one ${isTablet ? 'text-[14px]' : 'text-[11px]'}`}
              style={{ color: badgeFont }}
            >
              {item.grade.toUpperCase()}
            </Text>
          </View>

          {/* Analytics Metrics Pills with Icons & Labels */}
          <View className="flex-row items-center flex-wrap gap-1.5 mt-2">
            {/* Students Pill */}
            <View
              className="flex-row items-center bg-white border-[2px] rounded-[6px] px-2 py-0.5 gap-1"
              style={{ borderColor: badgeStroke }}
            >
              <Ionicons
                name="person"
                size={isTablet ? 16 : 12}
                color={badgeFont}
              />
              <Text
                className={`font-fredoka-one ${isTablet ? 'text-[14px]' : 'text-[11px]'}`}
                style={{ color: badgeFont }}
              >
                {item.studentsCount}
              </Text>
            </View>

            {/* Pending Evaluations Pill */}
            <View
              className="flex-row items-center bg-white border-[2px] rounded-[6px] px-2 py-0.5 gap-1"
              style={{ borderColor: badgeStroke }}
            >
              <Ionicons
                name="time"
                size={isTablet ? 16 : 12}
                color={badgeFont}
              />
              <Text
                className={`font-fredoka-one ${isTablet ? 'text-[14px]' : 'text-[11px]'}`}
                style={{ color: badgeFont }}
              >
                {item.pendingEvaluations} Pending
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function ClassPerformanceSection() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const router = useRouter();

  const [showArchived, setShowArchived] = useState(false);
  const [classes, setClasses] = useState<ClassPerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const snapToInterval = isTablet ? 420 + 14 : 290 + 8;

  useEffect(() => {
    fetchClassPerformance();
  }, [showArchived]);

  const fetchClassPerformance = async () => {
    setIsLoading(true);
    try {
      const data = await getClassPerformance(showArchived);
      setClasses(data);
    } catch (err) {
      console.error('ClassPerformanceSection: failed to fetch class performance', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className={`w-full ${isTablet ? 'mt-12' : 'mt-8'}`}>
      {/* Header section with ClassIcon & Show Archived Filter Button */}
      <View className={`flex-row items-center justify-between ${isTablet ? 'px-12 mb-6' : 'px-6 mb-4'}`}>
        <View className="flex-row items-center gap-2">
          <PerformanceIcon
            width={isTablet ? 32 : 22}
            height={isTablet ? 32 : 22}
          />
          <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
            Class Performance
          </Text>
        </View>

        {/* Show Archived Filter Button */}
        <Pressable
          onPress={() => setShowArchived(!showArchived)}
          className={`border-[2px] rounded-[8px] justify-center items-center active:scale-95 transition-transform ${
            isTablet ? 'px-4 py-2' : 'px-3 py-1.5'
          }`}
          style={{
            backgroundColor: showArchived ? '#BBE8FB' : '#FFFFFF',
            borderColor: showArchived ? '#62A9E6' : '#BBE8FB',
            shadowColor: showArchived ? '#62A9E6' : '#BBE8FB',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          }}
        >
          <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
            SHOW ARCHIVED
          </Text>
        </Pressable>
      </View>

      {/* Cards Carousel or Empty/Loading State */}
      {isLoading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: isTablet ? 48 : 24, paddingBottom: 8 }}
        >
          <ClassCardSkeleton isTablet={isTablet} />
          <ClassCardSkeleton isTablet={isTablet} />
          <ClassCardSkeleton isTablet={isTablet} />
        </ScrollView>
      ) : classes.length === 0 ? (
        <View className={`bg-white border-2 border-dashed border-[#E5E7EB] rounded-2xl p-8 items-center justify-center ${isTablet ? 'mx-12 mt-6' : 'mx-6 mt-4'}`}>
          <Ionicons name="school-outline" size={isTablet ? 48 : 36} color="#9CA3AF" />
          <Text className="font-fredoka-one text-lg text-[#4B5563] mt-3 text-center">
            {showArchived ? "No Classes Found" : "No Active Classes"}
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: isTablet ? 48 : 24,
            paddingRight: Math.max(isTablet ? 48 : 24, width - (isTablet ? 420 : 290)),
            paddingBottom: 8,
          }}
          scrollEventThrottle={16}
          snapToInterval={snapToInterval}
          decelerationRate="fast"
          snapToAlignment="start"
          onScroll={(e) => {
            const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
            const x = contentOffset?.x;
            if (typeof x === 'number' && !isNaN(x)) {
              const isAtEnd = x + layoutMeasurement.width >= contentSize.width - 20;
              if (isAtEnd) {
                setActiveIndex(classes.length - 1);
              } else {
                const nextIndex = Math.round(x / snapToInterval);
                if (!isNaN(nextIndex)) {
                  setActiveIndex(Math.max(0, Math.min(classes.length - 1, nextIndex)));
                }
              }
            }
          }}
        >
          {classes.map((item, index) => {
            const isCardActive = index === activeIndex || (index === 0 && (activeIndex === 0 || isNaN(activeIndex)));
            return (
              <AnalyticsClassCard
                key={item.id}
                item={item}
                isTablet={isTablet}
                isActive={isCardActive}
                onPress={() =>
                  router.push({
                    pathname: '/class-analytics/[classId]',
                    params: { classId: item.id },
                  } as any)
                }
              />
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

export default ClassPerformanceSection;
