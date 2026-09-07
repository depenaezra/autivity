import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, Easing, useSharedValue } from 'react-native-reanimated';

// SVG Icon
import ActivitySectionIcon from '@/assets/images/teacher/class/icon-class.svg';

export interface ActivityCardItem {
  id: 'tracing' | 'matching' | 'bubble' | 'pick-n-choose';
  title: string;
  imageSource: any;
  headerBgColor: string;
  themeColor: string;
  themeFontColor: string;
  themeFillColor: string;
}

interface ActivityCardProps {
  item: ActivityCardItem;
  isTablet: boolean;
  isActive: boolean;
  onPress: () => void;
}

function SingleActivityCard({ item, isTablet, isActive, onPress }: ActivityCardProps) {
  const pressScale = useSharedValue(1);

  const handlePressIn = () => {
    if (!isActive) return;
    pressScale.value = withTiming(0.97, { duration: 100 });
  };

  const handlePressOut = () => {
    pressScale.value = withTiming(1, { duration: 150 });
  };

  const animatedCardStyle = useAnimatedStyle(() => {
    const targetColor = isActive ? item.themeColor : '#F1F1F1';
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

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      className="active:scale-[0.98] transition-transform"
    >
      <Animated.View
        className={`bg-white border-[4px] flex-col justify-between ${
          isTablet
            ? 'w-[420px] h-[260px] mr-3.5 rounded-[32px]'
            : 'w-[290px] h-[190px] mr-2 rounded-[20px]'
        }`}
        style={[
          {
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          },
          animatedCardStyle,
        ]}
      >
        {/* Top Half: Activity Header Image with top rounded corners */}
        <View
          className={`w-full h-[58%] overflow-hidden ${
            isTablet ? 'rounded-t-[26px]' : 'rounded-t-[14px]'
          }`}
          style={{ backgroundColor: item.headerBgColor }}
        >
          <Image
            source={item.imageSource}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Bottom Half: Name & Start Button with bottom rounded corners */}
        <View className={`flex-1 flex-row items-center justify-between bg-white ${
          isTablet ? 'px-6 py-3 rounded-b-[26px]' : 'px-4 py-2 rounded-b-[14px]'
        }`}>
          <Text
            className={`font-fredoka-one text-[#484A4B] flex-1 mr-2 ${
              isTablet ? 'text-[28px]' : 'text-[18px]'
            }`}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          {/* Start Button matching "VIEW" button design */}
          <View
            className={`bg-white border-[2px] rounded-[8px] flex-row justify-center items-center ${
              isTablet ? 'px-4 py-2 gap-1.5' : 'px-3 py-1.5 gap-1'
            }`}
            style={{
              borderColor: item.themeColor,
              shadowColor: item.themeColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
            }}
          >
            <Text
              className={`font-fredoka-one uppercase ${isTablet ? 'text-sm' : 'text-[11px]'}`}
              style={{ color: item.themeFontColor }}
            >
              START
            </Text>
            <Ionicons name="play" size={isTablet ? 14 : 11} color={item.themeFontColor} />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

interface ActivitiesSectionProps {
  assignedPaths: string[];
  isLoading: boolean;
  isTablet: boolean;
  onNavigateToLesson: (type: 'tracing' | 'matching' | 'bubble' | 'pick-n-choose') => void;
}

export function ActivitiesSection({
  assignedPaths,
  isLoading,
  isTablet,
  onNavigateToLesson,
}: ActivitiesSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const snapToInterval = isTablet ? 420 + 14 : 290 + 8; // 434 (tablet) and 298 (mobile)

  const isTracingPath = (path: string) => {
    if (['lines', 'shapes', 'letters', 'numbers'].includes(path.toLowerCase())) {
      return true;
    }
    const cleanPath = path.startsWith('activity/tracing/')
      ? path.replace('activity/tracing/', '')
      : path;
    return (
      cleanPath.startsWith('lines/') ||
      cleanPath.startsWith('shapes/') ||
      cleanPath.startsWith('letters/') ||
      cleanPath.startsWith('numbers/')
    );
  };

  const isMatchingPath = (path: string) => {
    const lower = path.toLowerCase();
    return lower === 'matching fruits' || lower === 'matching colors' || lower.includes('drag-drop') || lower.includes('matching') || lower.includes('drag');
  };

  const isBubblePath = (path: string) => {
    const lower = path.toLowerCase();
    return (
      lower === 'free pop' ||
      lower === 'color pop' ||
      lower.includes('bubble') ||
      lower.includes('pop')
    );
  };

  const isPickChoicePath = (path: string) => {
    const lower = path.toLowerCase();
    return (
      lower.includes('pick') ||
      lower.includes('choice') ||
      lower.includes('identification') ||
      lower.includes('picture-word')
    );
  };

  const allActivities: ActivityCardItem[] = [
    {
      id: 'tracing',
      title: 'Tracing',
      imageSource: require('@/assets/images/activities/tracing-header.png'),
      headerBgColor: '#FFF7ED',
      themeColor: '#FB923C',
      themeFontColor: '#FB923C',
      themeFillColor: '#FFF7ED',
    },
    {
      id: 'matching',
      title: 'Drag and Drop',
      imageSource: require('@/assets/images/activities/matching-header.png'),
      headerBgColor: '#FFF7ED',
      themeColor: '#F7890F',
      themeFontColor: '#F7890F',
      themeFillColor: '#FFF3E0',
    },
    {
      id: 'bubble',
      title: 'Bubble Pop',
      imageSource: require('@/assets/images/activities/drag-drop/bubble-pop-header.png'),
      headerBgColor: '#E6D8F2',
      themeColor: '#B893DA',
      themeFontColor: '#8A57BE',
      themeFillColor: '#E6D8F2',
    },
    {
      id: 'pick-n-choose',
      title: "Pick 'n Choose",
      imageSource: require('@/assets/images/activities/pick-n-choose-header.png'),
      headerBgColor: '#DCFCE7',
      themeColor: '#22C55E',
      themeFontColor: '#15803D',
      themeFillColor: '#F0FDF4',
    },
  ];

  const assignedActivities = allActivities.filter((item) => {
    if (item.id === 'tracing') return assignedPaths.some(isTracingPath);
    if (item.id === 'matching') return assignedPaths.some(isMatchingPath);
    if (item.id === 'bubble') return assignedPaths.some(isBubblePath);
    if (item.id === 'pick-n-choose') return assignedPaths.some(isPickChoicePath);
    return false;
  });

  return (
    <View className={`w-full ${isTablet ? 'mt-10' : 'mt-8'}`}>
      {/* Title Header Row with icon on left matching ClassCard section */}
      <View className={`flex-row items-center justify-between ${isTablet ? 'mb-6' : 'mb-4'}`}>
        <View className="flex-row items-center gap-2">
          <ActivitySectionIcon
            width={isTablet ? 32 : 22}
            height={isTablet ? 32 : 22}
          />
          <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
            Activities
          </Text>
        </View>
      </View>

      {/* Cards List or Loading State */}
      {isLoading ? (
        <View className="py-8 items-center justify-center">
          <ActivityIndicator size="large" color="#62A9E6" />
        </View>
      ) : assignedActivities.length === 0 ? (
        <View className="bg-white border-[2px] border-dashed border-[#E5E7EB] rounded-2xl p-6 items-center justify-center">
          <Text className="font-quicksand-medium text-gray-400 text-sm text-center">
            No activities currently assigned.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8 }}
          scrollEventThrottle={16}
          snapToInterval={snapToInterval}
          decelerationRate="fast"
          snapToAlignment="start"
          onScroll={(e) => {
            const x = e.nativeEvent?.contentOffset?.x;
            if (typeof x === 'number' && !isNaN(x)) {
              const nextIndex = Math.round(x / snapToInterval);
              if (!isNaN(nextIndex)) {
                setActiveIndex(nextIndex);
              }
            }
          }}
        >
          {assignedActivities.map((item, index) => {
            const isCardActive =
              index === activeIndex || (index === 0 && (activeIndex === 0 || isNaN(activeIndex)));
            return (
              <SingleActivityCard
                key={item.id}
                item={item}
                isTablet={isTablet}
                isActive={isCardActive}
                onPress={() => onNavigateToLesson(item.id)}
              />
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
