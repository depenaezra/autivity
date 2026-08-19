import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming, interpolate, Extrapolate } from 'react-native-reanimated';
import { LongPressPreview } from './long-press-preview';

import { ClassItem } from '../../../hooks/use-teacher-dashboard';

// import icons
import ClassBlueIcon from '../../../assets/images/teacher/class/icon-class-blue.svg';
import ClassGreenIcon from '../../../assets/images/teacher/class/icon-class-green.svg';
import ClassOrangeIcon from '../../../assets/images/teacher/class/icon-class-orange.svg';
import ClassYellowIcon from '../../../assets/images/teacher/class/icon-class-yellow.svg';

interface ClassCardProps {
  item: ClassItem;
  isTablet: boolean;
  isActive?: boolean;
  onEditClass: (item: ClassItem) => void;
  onArchiveClass: (classId: string) => void;
  onDeleteClass: (classId: string) => void;
}

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

function formatSchedule(scheduleStr: string | undefined): string {
  if (!scheduleStr) return '';
  const dayMap: Record<string, string> = {
    'monday': 'M', 'mon': 'M',
    'tuesday': 'T', 'tue': 'T',
    'wednesday': 'W', 'wed': 'W',
    'thursday': 'Th', 'thu': 'Th',
    'friday': 'F', 'fri': 'F',
    'saturday': 'Sa', 'sat': 'Sa',
    'sunday': 'Su', 'sun': 'Su'
  };

  let formatted = scheduleStr;
  const keys = Object.keys(dayMap).sort((a, b) => b.length - a.length);

  for (const day of keys) {
    const regex = new RegExp(`\\b${day}\\b`, 'gi');
    formatted = formatted.replace(regex, dayMap[day]);
  }

  // Remove hyphens between letters (e.g. M-W -> MW)
  formatted = formatted.replace(/([a-zA-Z])\s*-\s*([a-zA-Z])/g, '$1$2');

  return formatted.replace(/\s+/g, ' ').trim();
}

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

export function ClassCard({
  item,
  isTablet,
  isActive = true,
  onEditClass,
  onArchiveClass,
  onDeleteClass,
}: ClassCardProps) {
  const router = useRouter();
  const styleConfig = themeStyles[item.themeName || 'green'] || themeStyles.green;
  const cardRef = useRef<View>(null);

  const [isLongPressed, setIsLongPressed] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const pressScale = useSharedValue(1);

  const handlePressIn = () => {
    if (!isActive) return;
    pressScale.value = withTiming(0.97, { duration: 100 });
  };

  const handlePressOut = () => {
    pressScale.value = withTiming(1, { duration: 150 });
  };

  const handleLongPress = () => {
    if (!isActive) return;
    cardRef.current?.measureInWindow((x, y, width, height) => {
      setCoords({ x, y, width, height });
      setIsLongPressed(true);
      pressScale.value = 1; // Reset touch scale during zoom
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const targetColor = isActive ? styleConfig.stroke : '#F1F1F1';
    const baseScale = isActive ? 1 : 0.95;
    const currentScale = baseScale * pressScale.value;

    return {
      borderColor: withTiming(targetColor, { duration: 250 }),
      shadowColor: withTiming(targetColor, { duration: 250 }),
      opacity: withTiming(isLongPressed ? 0 : 1, { duration: 150 }),
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

  const animatedGradeBadgeStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(isActive ? styleConfig.fill : '#F1F1F1', { duration: 250 }),
    };
  });

  const animatedTextColorStyle = useAnimatedStyle(() => {
    return {
      color: withTiming(isActive ? styleConfig.font : '#9CA3AF', { duration: 250 }),
    };
  });

  const animatedBadgeBorderStyle = useAnimatedStyle(() => {
    return {
      borderColor: withTiming(isActive ? styleConfig.stroke : '#F1F1F1', { duration: 250 }),
    };
  });

  const animatedRightContainerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(isActive ? styleConfig.fill : '#F1F1F1', { duration: 250 }),
    };
  });

  const renderCardBody = (isZoomed = false) => (
    <>
      {/* Left Side: Details */}
      <View className="flex-1 self-stretch justify-start pr-2">
        {/* Class Title */}
        <Text
          className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}
          numberOfLines={1}
        >
          {item.title}
        </Text>

        {/* Grade Badge */}
        <Animated.View
          className="flex-row items-center rounded-[6px] px-2 py-1 self-start mt-1.5 gap-1"
          style={isZoomed ? { backgroundColor: styleConfig.fill } : animatedGradeBadgeStyle}
        >
          <AnimatedIonicons
            name="document-text"
            size={isTablet ? 16 : 12}
            style={isZoomed ? { color: styleConfig.font } : animatedTextColorStyle}
          />
          <Animated.Text
            className={`font-fredoka-one ${isTablet ? 'text-[14px]' : 'text-[11px]'}`}
            style={isZoomed ? { color: styleConfig.font } : animatedTextColorStyle}
          >
            {item.level.toUpperCase()}
          </Animated.Text>
        </Animated.View>

        {/* Info Row (Student count & Schedule) */}
        <View className="flex-row items-center gap-1.5 mt-2">
          {/* Student Count Badge */}
          <Animated.View
            className="flex-row items-center bg-white border-[2px] rounded-[6px] px-2 py-0.5 gap-1"
            style={isZoomed ? { borderColor: styleConfig.stroke } : animatedBadgeBorderStyle}
          >
            <AnimatedIonicons
              name="person"
              size={isTablet ? 16 : 12}
              style={isZoomed ? { color: styleConfig.font } : animatedTextColorStyle}
            />
            <Animated.Text
              className={`font-fredoka-one ${isTablet ? 'text-[14px]' : 'text-[11px]'}`}
              style={isZoomed ? { color: styleConfig.font } : animatedTextColorStyle}
            >
              {item.people}
            </Animated.Text>
          </Animated.View>

          {/* Schedule Badge */}
          {item.schedule && (
            <Animated.View
              className="flex-row items-center bg-white border-[2px] rounded-[6px] px-2 py-0.5 gap-1"
              style={isZoomed ? { borderColor: styleConfig.stroke } : animatedBadgeBorderStyle}
            >
              <AnimatedIonicons
                name="calendar"
                size={isTablet ? 16 : 12}
                style={isZoomed ? { color: styleConfig.font } : animatedTextColorStyle}
              />
              <Animated.Text
                className={`font-fredoka-one ${isTablet ? 'text-[14px]' : 'text-[11px]'}`}
                style={isZoomed ? { color: styleConfig.font } : animatedTextColorStyle}
                numberOfLines={1}
              >
                {formatSchedule(item.schedule)}
              </Animated.Text>
            </Animated.View>
          )}
        </View>
      </View>

      {/* Right Side: Image/Illustration Container */}
      <Animated.View
        className={`aspect-square justify-center items-center overflow-hidden rounded-[16px] self-center ${isTablet ? 'h-[152px]' : 'h-[105px]'
          }`}
        style={isZoomed ? { backgroundColor: styleConfig.fill } : animatedRightContainerStyle}
      >
        {item.themeName === 'green' ? (
          <ClassGreenIcon width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
        ) : item.themeName === 'orange' ? (
          <ClassOrangeIcon width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
        ) : item.themeName === 'yellow' ? (
          <ClassYellowIcon width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
        ) : item.themeName === 'blue' ? (
          <ClassBlueIcon width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
        ) : null}
      </Animated.View>
    </>
  );

  return (
    <>
      <Pressable
        ref={cardRef}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        delayLongPress={350}
        onPress={() => router.push({
          pathname: '/class/[classId]',
          params: {
            classId: item.id,
            name: item.title,
            grade: item.level,
            themeColor: item.themeColor,
            themeName: item.themeName,
            schedule: item.schedule
          }
        } as any)}
      >
        <Animated.View
          className={`bg-white border-[4px] flex-row justify-between items-start ${isTablet ? 'w-[420px] h-[200px] mr-3.5 rounded-[32px] p-6' : 'w-[290px] h-[135px] mr-2 rounded-[20px] p-3'
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
          {renderCardBody(false)}
        </Animated.View>
      </Pressable>

      <LongPressPreview
        visible={isLongPressed}
        coords={coords}
        onClose={() => setIsLongPressed(false)}
        isTablet={isTablet}
        onEdit={() => console.log('Edit class placeholder')}
        onArchive={() => onArchiveClass(item.id)}
        onDelete={() => onDeleteClass(item.id)}
      >
        <Animated.View
          className="bg-white border-[4px] flex-row justify-between items-start"
          style={{
            borderColor: styleConfig.stroke,
            width: '100%',
            height: '100%',
            borderRadius: isTablet ? 32 : 20,
            padding: isTablet ? 24 : 12,
          }}
        >
          {renderCardBody(true)}
        </Animated.View>
      </LongPressPreview>
    </>
  );
}


