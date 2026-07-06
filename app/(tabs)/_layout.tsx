import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';

// custom icons
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Fontisto from '@expo/vector-icons/Fontisto';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        // 1. Force your specific blue for the active state
        tabBarActiveTintColor: '#62A9E6',

        // 2. Use a neutral gray for the inactive state
        tabBarInactiveTintColor: '#D1D5DB',

        // 3. Ensure the label is below the icon
        tabBarLabelPosition: 'below-icon',

        headerShown: false,
        tabBarButton: HapticTab,

        // Optional: Ensure the tab bar itself looks clean
        tabBarStyle: {
          height: 80,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome6 size={28} name="house-chimney" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Fontisto size={28} name="star" color={color} />,
        }}
      />
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
