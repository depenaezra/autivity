import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring } from 'react-native-reanimated';

interface DashboardHeaderProps {
  firstName: string;
  isTablet: boolean;
  onProfilePress: () => void;
  hasUnreadNotifications?: boolean;
}

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

export function DashboardHeader({
  firstName,
  isTablet,
  onProfilePress,
  hasUnreadNotifications = false,
}: DashboardHeaderProps) {
  const router = useRouter();
  const bellRotation = useSharedValue(0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️ Good morning';
    if (hour < 18) return '☀️ Good afternoon';
    return '🌙 Good evening';
  };

  const triggerBellSwing = () => {
    bellRotation.value = 0;
    bellRotation.value = withSequence(
      withTiming(-15, { duration: 70 }),
      withTiming(15, { duration: 90 }),
      withTiming(-9, { duration: 80 }),
      withTiming(9, { duration: 80 }),
      withTiming(-4, { duration: 70 }),
      withTiming(0, { duration: 60 })
    );
    router.push('/notifications' as any);
  };

  const animatedBellStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${bellRotation.value}deg` }],
    transformOrigin: 'top',
  }));

  return (
    <View className={`w-full flex-row justify-between items-center ${isTablet ? 'px-12 pt-4' : 'px-6 pt-2'}`}>
      <View className="flex-row items-center flex-1">
        <Pressable
          onPress={onProfilePress}
          className={`rounded-full border-[2px] border-[#D9D9D9] active:scale-95 transition-transform ${
            isTablet ? 'w-24 h-24' : 'w-16 h-16'
          }`}
        >
          <View className="flex-1 rounded-full border-[2px] border-white overflow-hidden bg-white">
            <Image
              source={require('../../../assets/images/bear.png')}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        </Pressable>

        <View className="ml-[12px] justify-center">
          <Text className={`font-quicksand-bold text-[#62A9E6] ${isTablet ? 'text-[20px]' : 'text-[14px]'}`}>
            {getGreeting()}
          </Text>
          <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px] mt-1' : 'text-[20px]'}`}>
            Teacher {firstName || 'Guest'}
          </Text>
        </View>
      </View>

      <Pressable 
        onPress={triggerBellSwing}
        className="active:scale-95 transition-transform p-1 relative"
      >
        <AnimatedIonicons 
          name="notifications" 
          size={isTablet ? 36 : 28} 
          color="#62A9E6" 
          style={animatedBellStyle}
        />
        {hasUnreadNotifications && (
          <View className={`absolute top-0.5 right-0.5 rounded-full bg-[#FF3B3F] ${isTablet ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'}`} />
        )}
      </Pressable>
    </View>
  );
}



