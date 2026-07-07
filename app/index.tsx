import { Redirect } from 'expo-router';

export default function Index() {
  // This forces the app to immediately skip the old test screen 
  // and jump straight to your Teacher Homescreen!
  return <Redirect href="/(tabs)" />;
}