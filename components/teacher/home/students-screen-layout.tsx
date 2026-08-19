import React from 'react';
import { View, useWindowDimensions, ScrollView, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../../screen-layout';
import { HeaderButton } from '../../header-button';

// SVGs - defaulting to default background SVG for Students section
import HeaderDefaultBg from '../../../assets/images/teacher/students/header-default-bg.svg';

interface StudentsScreenLayoutProps {
  title?: string;
  onBackPress: () => void;
  onAddPress?: () => void;
  children?: React.ReactNode;
  scrollable?: boolean;
  stickyHeader?: boolean;
  classes?: { id: string; title: string }[];
  selectedClassId?: string | null;
  onSelectClass?: (classId: string | null) => void;
}

export function StudentsScreenLayout({
  title = 'Students',
  onBackPress,
  onAddPress,
  children,
  scrollable = true,
  stickyHeader = false,
  classes,
  selectedClassId,
  onSelectClass,
}: StudentsScreenLayoutProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const renderHeaderBackground = () => {
    return (
      <View className="flex-1 w-full h-full relative">
        <View className="absolute inset-0">
          <HeaderDefaultBg width="100%" height="100%" preserveAspectRatio="xMidYMax slice" />
        </View>
      </View>
    );
  };

  const renderHeaderContent = () => {
    if (!classes || classes.length === 0) return null;

    const horizontalOffset = isTablet ? 48 : 24;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -horizontalOffset }}
        contentContainerStyle={{
          gap: isTablet ? 12 : 8,
          paddingHorizontal: horizontalOffset,
          paddingBottom: 4,
        }}
      >
        {/* "All" filter button */}
        <Pressable
          onPress={() => onSelectClass?.(null)}
          className={`border-[2px] rounded-[8px] justify-center items-center active:scale-95 transition-transform ${
            isTablet ? 'px-4 py-2' : 'px-3 py-1.5'
          }`}
          style={{
            backgroundColor: selectedClassId === null ? '#BBE8FB' : '#FFFFFF',
            borderColor: selectedClassId === null ? '#62A9E6' : '#BBE8FB',
            shadowColor: selectedClassId === null ? '#62A9E6' : '#BBE8FB',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          }}
        >
          <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
            All
          </Text>
        </Pressable>

        {/* Individual class filter buttons */}
        {classes.map((cls) => {
          const isSelected = selectedClassId === cls.id;
          return (
            <Pressable
              key={cls.id}
              onPress={() => onSelectClass?.(cls.id)}
              className={`border-[2px] rounded-[8px] justify-center items-center active:scale-95 transition-transform ${
                isTablet ? 'px-4 py-2' : 'px-3 py-1.5'
              }`}
              style={{
                backgroundColor: isSelected ? '#BBE8FB' : '#FFFFFF',
                borderColor: isSelected ? '#62A9E6' : '#BBE8FB',
                shadowColor: isSelected ? '#62A9E6' : '#BBE8FB',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
                {cls.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <ScreenLayout
      headerBackground={renderHeaderBackground()}
      title={title}
      leftHeaderButton={
        <HeaderButton
          onPress={onBackPress}
          icon={
            <View style={{ marginLeft: -3, marginTop: -1 }}>
              <Ionicons name="caret-back" size={isTablet ? 30 : 24} color="#62A9E6" />
            </View>
          }
        />
      }
      rightHeaderButton={
        <HeaderButton
          onPress={onAddPress || (() => console.log('Add Student Pressed'))}
          icon={
            <View style={{ width: isTablet ? 24 : 18, height: isTablet ? 24 : 18, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ position: 'absolute', width: '100%', height: isTablet ? 4 : 3, backgroundColor: '#62A9E6', borderRadius: 2 }} />
              <View style={{ position: 'absolute', width: isTablet ? 4 : 3, height: '100%', backgroundColor: '#62A9E6', borderRadius: 2 }} />
            </View>
          }
        />
      }
      headerContent={renderHeaderContent()}
      scrollable={scrollable}
      stickyHeader={stickyHeader}
    >
      {children}
    </ScreenLayout>
  );
}


