import "../global.css"; // The '../' steps out of the 'app' folder into the root

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" /> {/* expo will start here as its the first screen in stack */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="class/[classId]"
          options={{ 
            headerShown: false,
            presentation: 'card'
          }}
        />
        <Stack.Screen name="student/[studentId]/(student-tabs)" 
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom'
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
