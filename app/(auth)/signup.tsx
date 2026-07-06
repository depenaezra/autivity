import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Signup() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 10 }}>
      <Text>Signup Screen</Text>

      <Button
        title="Create Account"
        onPress={() => router.push("/(tabs)/index")}
      />

      <Button
        title="Back"
        onPress={() => router.back()}
      />
    </View>
  );
}