import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // get device's notch / island spacing so navigation doesn't go under it
  const insets = useSafeAreaInsets();

  return (
    // primary navigation configuration
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#62A9E6',
        tabBarInactiveTintColor: '#D1D5DB',
        tabBarLabelPosition: 'below-icon',

        headerShown: false,
        tabBarButton: HapticTab, // haptics when tab is tapped

        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 10,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        }
      }}
    >
      {/* home screen */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome6 size={28} name="house-chimney" color={color} />,
        }}
      />

      {/* analytics screen */}
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <FontAwesome6 size={28} name="chart-line" color={color} />,
        }}
      />

      {/* profile screen */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome6 size={28} name="user-large" color={color} />,
        }}
      />
    </Tabs>
  );
}
