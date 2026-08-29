import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

interface ParentHeaderProps {
  parentFirstName: string;
  parentLastName?: string;
  isTablet: boolean;
  onProfilePress: () => void;
  hasUnreadNotifications?: boolean;
  // Parent & Learner Info
  student?: {
    name?: string;
    avatar?: string;
    spectrum_level?: string;
    learner_code?: string;
    bio?: string;
  } | null;
  classInfo?: {
    title?: string;
    grade?: string;
    themeName?: string;
  } | null;
  teacherName?: string;
  onChildPress?: () => void;
  onGoalsPress?: () => void;
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

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

export function ParentHeader({
  parentFirstName,
  parentLastName = '',
  isTablet,
  onProfilePress,
  hasUnreadNotifications = false,
  student,
  classInfo,
  teacherName,
  onChildPress,
  onGoalsPress,
}: ParentHeaderProps) {
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

  const fullParentName = `${parentFirstName || ''} ${parentLastName || ''}`.trim() || 'Parent';
  const currentTheme = themeStyles[(classInfo?.themeName || 'blue').toLowerCase()] || themeStyles.blue;

  return (
    <View className="w-full">
      {/* HEADER BAR - EXACT MATCH TO TEACHER DASHBOARD HEADER */}
      <View className="w-full flex-row justify-between items-center">
        <View className="flex-row items-center flex-1">
          <Pressable
            onPress={onProfilePress}
            className={`rounded-full border-[2px] border-[#D9D9D9] active:scale-95 transition-transform ${
              isTablet ? 'w-24 h-24' : 'w-16 h-16'
            }`}
          >
            <View className="flex-1 rounded-full border-[2px] border-white overflow-hidden bg-white">
              <Image
                source={require('../../assets/images/bear.png')}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </Pressable>

          <View className="ml-[12px] justify-center flex-1">
            <Text className={`font-quicksand-bold text-[#62A9E6] ${isTablet ? 'text-[20px]' : 'text-[14px]'}`}>
              {getGreeting()}
            </Text>
            <Text
              className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px] mt-1' : 'text-[20px]'}`}
              numberOfLines={1}
            >
              {fullParentName}
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

      {/* CHILD & PARENT INFO CARD - TACTILE DESIGN SYSTEM FORMAT */}
      {student && (
        <View className="mt-5">
          <View
            className={`bg-white border-[4px] border-[#F1F1F1] ${
              isTablet ? 'rounded-[32px] p-6' : 'rounded-[20px] p-4'
            }`}
            style={{
              shadowColor: '#F1F1F1',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
            }}
          >
            {/* Top Row: Avatar, Name & Class/Teacher Pills */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3.5 flex-1">
                <View
                  className={`rounded-full bg-[#EBF5FF] items-center justify-center border-2 border-[#62A9E6] ${
                    isTablet ? 'w-16 h-16' : 'w-12 h-12'
                  }`}
                >
                  <Text style={{ fontSize: isTablet ? 30 : 22 }}>
                    {student.avatar || '🙂'}
                  </Text>
                </View>

                <View className="flex-1 justify-center">
                  <Text
                    className={`font-fredoka-one text-[#484A4B] ${
                      isTablet ? 'text-2xl' : 'text-lg'
                    }`}
                  >
                    {student.name}
                  </Text>

                  {/* PILLS ROW FOR CLASS TITLE & TEACHER */}
                  <View className="flex-row flex-wrap items-center gap-1.5 mt-1.5">
                    {/* Class Title Pill with Dynamic Theme Color Fill */}
                    {classInfo?.title && (
                      <View
                        className="flex-row items-center rounded-[6px] px-2 py-1 gap-1"
                        style={{ backgroundColor: currentTheme.fill }}
                      >
                        <Ionicons name="book" size={isTablet ? 14 : 11} color={currentTheme.font} />
                        <Text
                          className={`font-fredoka-one uppercase ${isTablet ? 'text-xs' : 'text-[11px]'}`}
                          style={{ color: currentTheme.font }}
                        >
                          {classInfo.title.toUpperCase()}
                        </Text>
                      </View>
                    )}

                    {/* Teacher Pill */}
                    {teacherName && (
                      <View className="flex-row items-center bg-white border-[2px] border-[#BBE8FB] rounded-[6px] px-2 py-0.5 gap-1">
                        <Ionicons name="person" size={isTablet ? 14 : 11} color="#62A9E6" />
                        <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                          {teacherName.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Bottom Row: Tactile Action Buttons with Same Stroke Color (#BBE8FB) */}
            <View className="flex-row gap-3 mt-4 pt-3 border-t border-[#E5E7EB]/50">
              {onGoalsPress && (
                <Pressable
                  onPress={onGoalsPress}
                  className="flex-1 flex-row items-center justify-center gap-2 bg-[#FFFFFF] border-[2px] border-[#BBE8FB] px-4 py-2.5 rounded-xl active:scale-95 transition-transform"
                  style={{
                    shadowColor: '#BBE8FB',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 2,
                  }}
                >
                  <Feather name="clipboard" size={16} color="#62A9E6" />
                  <Text className="font-fredoka-one text-[#62A9E6] text-xs sm:text-sm uppercase">
                    IEP Goals
                  </Text>
                </Pressable>
              )}

              {onChildPress && (
                <Pressable
                  onPress={onChildPress}
                  className="flex-1 flex-row items-center justify-center gap-2 bg-[#FFFFFF] border-[2px] border-[#BBE8FB] px-4 py-2.5 rounded-xl active:scale-95 transition-transform"
                  style={{
                    shadowColor: '#BBE8FB',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 2,
                  }}
                >
                  <Feather name="info" size={16} color="#62A9E6" />
                  <Text className="font-fredoka-one text-[#62A9E6] text-xs sm:text-sm uppercase">
                    Learner Info
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
