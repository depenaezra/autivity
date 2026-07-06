import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Onboarding2() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 10 }}>
      <Text>Onboarding 2</Text>

      <Button
        title="Finish Login"
        onPress={() => router.replace("/(auth)/signup")}
      />

      <Button
        title="Back"
        onPress={() => router.back()}
      />
    </View>
  );
}