import React from 'react';
import { View, useWindowDimensions, ScrollView, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../../screen-layout';
import { HeaderButton } from '../../header-button';

// SVGs - defaulting to default background SVG for Students section (blue gradient)
import HeaderDefaultBg from '../../../assets/images/teacher/students/header-default-bg.svg';

interface ResourcesScreenLayoutProps {
  title?: string;
  onBackPress: () => void;
  onAddPress?: () => void;
  children?: React.ReactNode;
  scrollable?: boolean;
  stickyHeader?: boolean;
  categories?: string[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export function ResourcesScreenLayout({
  title = 'Resources',
  onBackPress,
  onAddPress,
  children,
  scrollable = true,
  stickyHeader = true,
  categories,
  selectedCategory,
  onSelectCategory,
}: ResourcesScreenLayoutProps) {
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
    if (!categories || categories.length === 0) return null;

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
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <Pressable
              key={category}
              onPress={() => onSelectCategory?.(category)}
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
                {category}
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
        onAddPress ? (
          <HeaderButton
            onPress={onAddPress}
            icon={
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="cloud-upload" size={isTablet ? 26 : 20} color="#62A9E6" />
              </View>
            }
          />
        ) : undefined
      }
      headerContent={renderHeaderContent()}
      scrollable={scrollable}
      stickyHeader={stickyHeader}
    >
      <View className="mb-12 pb-8">{children}</View>
    </ScreenLayout>
  );
}


