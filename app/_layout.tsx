import "../global.css"; // The '../' steps out of the 'app' folder into the root

import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import {
  Fredoka_300Light,
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import {
  Quicksand_300Light,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    'Quicksand-Light': Quicksand_300Light,
    'Quicksand-Regular': Quicksand_400Regular,
    'Quicksand-Medium': Quicksand_500Medium,
    'Quicksand-SemiBold': Quicksand_600SemiBold,
    'Quicksand-Bold': Quicksand_700Bold,
    'Fredoka-Light': Fredoka_300Light,
    'Fredoka-Regular': Fredoka_400Regular,
    'Fredoka-Medium': Fredoka_500Medium,
    'Fredoka-SemiBold': Fredoka_600SemiBold,
    'Fredoka-Bold': Fredoka_700Bold,
    'FredokaOne-Regular': require('../assets/fonts/FredokaOne-Regular.ttf'),
  });

  // if (!fontsLoaded) {
  //   return null;
  // }
  
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
