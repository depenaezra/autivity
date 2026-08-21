import React from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenLayoutProps {
  headerBackground: React.ReactNode;
  title?: string;
  leftHeaderButton?: React.ReactNode;
  rightHeaderButton?: React.ReactNode;
  headerContent?: React.ReactNode;
  children: React.ReactNode;
  scrollable?: boolean;
  bounces?: boolean;
  stickyHeader?: boolean;
  contentContainerClassName?: string;
}

export function ScreenLayout({
  headerBackground,
  title,
  leftHeaderButton,
  rightHeaderButton,
  headerContent,
  children,
  scrollable = true,
  bounces = true,
  stickyHeader = false,
  contentContainerClassName = '',
}: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  // Total height of the background gradient region
  const backgroundHeight = isTablet ? 320 : 250;

  const renderNavbar = () => (
    <View
      className={`w-full relative z-10 justify-between ${isTablet ? 'px-12 pb-6' : 'px-6 pb-4'}`}
      style={{ paddingTop: insets.top + (isTablet ? 16 : 10) }}
    >
      {/* Navigation Bar Row */}
      <View className="flex-row justify-between items-center w-full min-h-[44px]">
        {/* Left action button container */}
        <View className="w-11 items-start justify-center">
          {leftHeaderButton}
        </View>

        {/* Center Title */}
        {title ? (
          <Text className={`font-fredoka-one text-[#484A4B] text-center flex-1 mx-2 ${isTablet ? 'text-[28px]' : 'text-[22px]'}`}>
            {title}
          </Text>
        ) : (
          <View className="flex-1" />
        )}

        {/* Right action button container */}
        <View className="w-11 items-end justify-center">
          {rightHeaderButton}
        </View>
      </View>

      {/* Dynamic Header Sub-Content (Tags, filters, etc.) */}
      {headerContent && (
        <View className={isTablet ? 'mt-6' : 'mt-4'}>
          {headerContent}
        </View>
      )}
    </View>
  );

  // White Card container wrapper
  const renderCard = () => (
    <View
      className="flex-grow bg-white border-t-[4px] border-x-[4px] border-[#F1F1F1] rounded-t-[32px]"
      style={styles.cardShadow}
    >
      <View className="flex-1 rounded-t-[28px] overflow-hidden">
        {scrollable && stickyHeader ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={bounces}
            contentContainerStyle={{ flexGrow: 1 }}
            className={contentContainerClassName}
          >
            {children}
          </ScrollView>
        ) : (
          <View className={`flex-1 ${contentContainerClassName}`}>
            {children}
          </View>
        )}
      </View>
    </View>
  );

  // Mode 1: Sticky Header (Fixed header with scrollable content card)
  if (stickyHeader) {
    return (
      <View className="flex-1 bg-[#F5F7FA] relative">
        {/* Background layer behind everything */}
        <View className="absolute top-0 left-0 right-0 z-0" style={{ height: backgroundHeight }}>
          {headerBackground}
        </View>
        
        <View className="flex-1 z-10">
          {renderNavbar()}
          {renderCard()}
        </View>
      </View>
    );
  }

  // Mode 2: Scrolling Header (Whole page scrolls, header goes off-screen)
  return (
    <View className="flex-1 bg-[#F5F7FA] relative">
      {/* Background layer behind everything */}
      <View className="absolute top-0 left-0 right-0 z-0" style={{ height: backgroundHeight }}>
        {headerBackground}
      </View>

      <ScrollView
        className="flex-1 z-10"
        showsVerticalScrollIndicator={false}
        bounces={bounces}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {renderNavbar()}
        {renderCard()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#F1F1F1',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
