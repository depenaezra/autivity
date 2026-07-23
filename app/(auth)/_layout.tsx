import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="user" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}