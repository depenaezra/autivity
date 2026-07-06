import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Welcome() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 10 }}>
      <Text>Welcome Screen</Text>

      <Button
        title="Get Started"
        onPress={() => router.push("/(auth)/user")}
      />

      <Button
        title="Already have an account"
        onPress={() => router.push("/(auth)/login")}
      />
    </View>
  );
}