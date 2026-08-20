import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as Haptics from 'expo-haptics';

import DeleteIcon from '../../../assets/images/teacher/class/icon-button-delete.svg';
import EditIcon from '../../../assets/images/teacher/class/icon-button-edit.svg';

// Consistent themes with ClassCard / students components
const typeThemes: Record<string, { stroke: string; font: string; fill: string; icon: any; label: string }> = {
  ppt: { stroke: '#FFDBD4', font: '#FF8870', fill: '#FFDBD4', icon: 'presentation', label: 'PPT' },
  image: { stroke: '#CBFAC4', font: '#179D33', fill: '#CBFAC4', icon: 'cards-outline', label: 'IMAGE' },
  video: { stroke: '#BBE8FB', font: '#62A9E6', fill: '#BBE8FB', icon: 'video-outline', label: 'VIDEO' },
  pdf: { stroke: '#FFCCD5', font: '#EF4444', fill: '#FFE3E8', icon: 'file-document-outline', label: 'PDF' },
  other: { stroke: '#FFF3C4', font: '#FFAE02', fill: '#FFF3C4', icon: 'file-outline', label: 'FILE' },
};

interface LessonMaterialCardProps {
  item: {
    id: string;
    title: string;
    type: 'pdf' | 'ppt' | 'image' | 'video' | 'other';
    category: string;
    size: string;
    dateAdded: string;
    assignedClasses: string;
    description: string;
  };
  isTablet: boolean;
  onPress: () => void;
  onEdit?: () => void;
  onDelete: () => void;
  onSwipeableWillOpen?: (ref: any) => void;
}

export function LessonMaterialCard({ item, isTablet, onPress, onEdit, onDelete, onSwipeableWillOpen }: LessonMaterialCardProps) {
  const theme = typeThemes[item.type] || typeThemes.other;
  const pressScale = useSharedValue(1);
  const swipeableRef = useRef<any>(null);

  const handlePressIn = () => {
    pressScale.value = withTiming(0.97, { duration: 100 });
  };

  const handlePressOut = () => {
    pressScale.value = withTiming(1, { duration: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pressScale.value }],
    };
  });

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const editScale = progress.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0.5, 1.1, 1],
      extrapolate: 'clamp',
    });
    const editOpacity = progress.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });
    const editTransX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 0],
      extrapolate: 'clamp',
    });

    const deleteScale = progress.interpolate({
      inputRange: [0.2, 0.6, 1],
      outputRange: [0.5, 1.1, 1],
      extrapolate: 'clamp',
    });
    const deleteOpacity = progress.interpolate({
      inputRange: [0.2, 0.5, 1],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });
    const deleteTransX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [5, 0],
      extrapolate: 'clamp',
    });

    return (
      <View className="flex-row items-center justify-end pl-3 pr-1 bg-transparent" style={{ height: '100%' }}>
        {/* EDIT */}
        {onEdit && (
          <Animated.View
            style={{
              opacity: editOpacity,
              transform: [{ scale: editScale }, { translateX: editTransX }],
            }}
          >
            <Pressable
              onPress={() => {
                swipeableRef.current?.close();
                onEdit();
              }}
              className="flex-col items-center justify-center active:scale-95 transition-transform"
              style={{ width: isTablet ? 72 : 56 }}
            >
              <View className="items-center justify-center" style={{ height: isTablet ? 32 : 26 }}>
                <EditIcon width={isTablet ? 26 : 22} height={isTablet ? 26 : 22} />
              </View>
              <Text 
                className={`font-fredoka-one text-[#62A9E6] text-center w-full px-1 ${isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'}`}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                EDIT
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* DELETE */}
        <Animated.View
          style={{
            opacity: deleteOpacity,
            transform: [{ scale: deleteScale }, { translateX: deleteTransX }],
          }}
        >
          <Pressable
            onPress={() => {
              swipeableRef.current?.close();
              onDelete();
            }}
            className="flex-col items-center justify-center active:scale-95 transition-transform"
            style={{ width: isTablet ? 72 : 56 }}
          >
            <View className="items-center justify-center" style={{ height: isTablet ? 32 : 26 }}>
              <DeleteIcon width={isTablet ? 26 : 22} height={isTablet ? 26 : 22} />
            </View>
            <Text 
              className={`font-fredoka-one text-[#FF3B3F] text-center w-full px-1 ${isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'}`}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              DELETE
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  return (
    <View className={`${isTablet ? 'w-[48%]' : 'w-full'}`}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        onSwipeableWillOpen={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSwipeableWillOpen?.(swipeableRef.current);
        }}
        friction={1.5}
        overshootRight={false}
        rightThreshold={40}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          className="active:scale-[0.98] transition-transform w-full"
        >
          <Reanimated.View
            className={`bg-white border-[4px] flex-row justify-between items-start ${
              isTablet ? 'rounded-[32px] p-6 h-[200px]' : 'rounded-[20px] p-4 h-[150px]'
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
            {/* Left Container: Details */}
            <View className="flex-1 pr-3 justify-between self-stretch">
              <View>
                <View className="flex-row items-center gap-2 mb-1.5">
                  {/* Type Badge */}
                  <View 
                    className="rounded-[6px] px-2 py-0.5" 
                    style={{ backgroundColor: theme.fill }}
                  >
                    <Text 
                      className={`font-fredoka-one uppercase ${isTablet ? 'text-xs' : 'text-[11px]'}`}
                      style={{ color: theme.font }}
                    >
                      {theme.label}
                    </Text>
                  </View>

                  {/* Category */}
                  <Text className={`font-quicksand-bold text-[#9CA3AF] ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
                    {item.category}
                  </Text>
                </View>

                {/* Title */}
                <Text
                  className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[22px] mb-1' : 'text-[16px] mb-0.5'}`}
                  numberOfLines={1}
                >
                  {item.title ? item.title.replace(/\.[^/.]+$/, '') : ''}
                </Text>

                {/* Description */}
                <Text
                  className={`font-quicksand-medium text-[#9CA3AF] leading-tight ${isTablet ? 'text-sm mb-2' : 'text-[11px] mb-1.5'}`}
                  numberOfLines={2}
                >
                  {item.description || 'No description provided.'}
                </Text>
              </View>

              {/* Metadata Badges */}
              <View className="flex-row flex-wrap items-center gap-1.5 mt-auto">
                {/* Size Badge */}
                <View 
                  className="flex-row items-center bg-white border-[2px] rounded-[6px] px-2 py-0.5 gap-1"
                  style={{ borderColor: theme.stroke }}
                >
                  <MaterialCommunityIcons name="database-outline" size={isTablet ? 14 : 12} color={theme.font} />
                  <Text className={`font-fredoka-one ${isTablet ? 'text-[12px]' : 'text-[11px]'}`} style={{ color: theme.font }}>
                    {item.size}
                  </Text>
                </View>

                {/* Assigned Classes Badge */}
                <View 
                  className="flex-row items-center bg-white border-[2px] rounded-[6px] px-2 py-0.5 gap-1"
                  style={{ borderColor: theme.stroke }}
                >
                  <MaterialCommunityIcons name="account-group-outline" size={isTablet ? 14 : 12} color={theme.font} />
                  <Text className={`font-fredoka-one ${isTablet ? 'text-[12px]' : 'text-[11px]'}`} style={{ color: theme.font }} numberOfLines={1}>
                    {(item.assignedClasses || '').toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Right Container: Icon */}
            <View className="items-end justify-end self-stretch">
              <View 
                className={`rounded-[16px] items-center justify-center ${
                  isTablet ? 'w-[72px] h-[72px]' : 'w-[52px] h-[52px]'
                }`}
                style={{ backgroundColor: theme.fill }}
              >
                <MaterialCommunityIcons name={theme.icon} size={isTablet ? 36 : 26} color={theme.font} />
              </View>
            </View>
          </Reanimated.View>
        </Pressable>
      </Swipeable>
    </View>
  );
}


