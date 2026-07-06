import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Onboarding1() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 10 }}>
      <Text>User</Text>

      <Button
        title="Next"
        onPress={() => router.push("/(auth)/teacher-onboarding")}
      />

      <Button
        title="Back"
        onPress={() => router.back()}
      />
    </View>
  );
}