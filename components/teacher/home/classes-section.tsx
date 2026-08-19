import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { ClassCard } from './class-card';
import { ClassItem } from '../../../hooks/use-teacher-dashboard';
import ClassIcon from '../../../assets/images/teacher/class/icon-class.svg';

interface ClassesSectionProps {
  classesData: ClassItem[];
  archivedCount: number;
  isLoading: boolean;
  isTablet: boolean;
  onOpenArchive: () => void;
  onAddClass: () => void;
  onEditClass: (item: ClassItem) => void;
  onArchiveClass: (classId: string) => void;
  onDeleteClass: (classId: string) => void;
}

export function ClassesSection({
  classesData,
  archivedCount,
  isLoading,
  isTablet,
  onOpenArchive,
  onAddClass,
  onEditClass,
  onArchiveClass,
  onDeleteClass,
}: ClassesSectionProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const snapToInterval = isTablet ? 420 + 14 : 290 + 8; // 434 and 298
  const isAddClassActive = classesData.length === activeIndex;

  const animatedAddStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withTiming(isAddClassActive ? 1 : 0.95, {
            duration: 250,
            easing: Easing.out(Easing.ease),
          }),
        },
      ],
    };
  });

  return (
    <View className={`w-full ${isTablet ? 'mt-12' : 'mt-8'}`}>
      <View className={`flex-row items-center justify-between ${isTablet ? 'px-12 mb-6' : 'px-6 mb-4'}`}>
        <View className="flex-row items-center gap-2">
          <ClassIcon 
            width={isTablet ? 32 : 22} 
            height={isTablet ? 32 : 22} 
          />
          <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
            Classes
          </Text>
        </View>

        {archivedCount > 0 && (
          <Pressable
            onPress={onOpenArchive}
            className={`bg-white border-[2px] rounded-[8px] justify-center items-center active:scale-95 transition-transform ${
              isTablet ? 'px-4 py-2' : 'px-3 py-1.5'
            }`}
            style={{
              borderColor: '#BBE8FB',
              shadowColor: '#BBE8FB',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
            }}
          >
            <Text className={`font-fredoka-one text-[#62A9E6] ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
              ARCHIVED
            </Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View className="items-center justify-center h-[150px]">
          <ActivityIndicator size="large" color="#62A9E6" />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: isTablet ? 48 : 24, paddingBottom: 8 }}
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
          {classesData.map((item, index) => {
            const isCardActive = index === activeIndex || (index === 0 && (activeIndex === 0 || isNaN(activeIndex)));
            return (
              <ClassCard 
                key={item.id} 
                item={item} 
                isTablet={isTablet} 
                isActive={isCardActive} 
                onEditClass={onEditClass}
                onArchiveClass={onArchiveClass}
                onDeleteClass={onDeleteClass}
              />
            );
          })}

          {/* Add Class Button Card */}
          <Pressable 
            onPress={onAddClass}
            className="active:scale-[0.98] transition-transform"
          >
            <Animated.View
              className={`bg-white border-[4px] border-dashed border-[#F1F1F1] justify-center items-center ${
                isTablet ? 'w-[420px] h-[200px] mr-3.5 rounded-[32px]' : 'w-[290px] h-[135px] mr-2 rounded-[20px]'
              }`}
              style={animatedAddStyle}
            >
              <View 
                className={`rounded-[8px] bg-[#D9D9D9] items-center justify-center ${
                  isTablet ? 'w-16 h-16 mb-4' : 'w-12 h-12 mb-2'
                }`}
              >
                <Feather name="plus" size={isTablet ? 36 : 28} color="#FFFFFF" />
              </View>
              <Text className={`font-fredoka-one text-[#D9D9D9] ${isTablet ? 'text-[26px]' : 'text-[18px]'}`}>
                Add Class
              </Text>
            </Animated.View>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}


