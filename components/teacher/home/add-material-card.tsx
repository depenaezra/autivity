import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface AddMaterialCardProps {
  isTablet: boolean;
  onPress: () => void;
}

export function AddMaterialCard({ isTablet, onPress }: AddMaterialCardProps) {
  const pressScale = useSharedValue(1);

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

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      className={`active:scale-[0.98] transition-transform ${
        isTablet ? 'w-[48%]' : 'w-full'
      }`}
    >
      <Animated.View
        className={`bg-white border-[4px] border-dashed border-[#F1F1F1] justify-center items-center ${
          isTablet ? 'rounded-[32px] h-[200px] p-6' : 'rounded-[20px] h-[150px] p-4'
        }`}
        style={animatedStyle}
      >
        <View 
          className={`rounded-[8px] bg-[#D9D9D9] items-center justify-center ${
            isTablet ? 'w-14 h-14 mb-3' : 'w-10 h-10 mb-2'
          }`}
        >
          <Feather name="plus" size={isTablet ? 32 : 24} color="#FFFFFF" />
        </View>
        <Text className={`font-fredoka-one text-[#D9D9D9] ${isTablet ? 'text-[22px]' : 'text-[16px]'}`}>
          Add Material
        </Text>
      </Animated.View>
    </Pressable>
  );
}


