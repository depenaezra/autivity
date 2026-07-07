import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function StudentTabsLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false, // Hides the top header to let you build custom ones
        tabBarActiveTintColor: '#3B82F6', // The blue color we used for the button
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
        }
      }}
    >
      {/* 1. Home / Dashboard Screen */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />

      {/* 2. Achievements Screen */}
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Rewards',
          tabBarIcon: ({ color }) => (
            <Ionicons name="star" size={24} color={color} />
          ),
        }}
      />

      {/* 3. Profile Screen */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}