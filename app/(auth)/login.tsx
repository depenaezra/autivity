import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Login() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 10 }}>
      <Text>Login Screen</Text>

      <Button
        title="Login"
        onPress={() => router.replace("/(tabs)")}
      />

      <Button
        title="Back"
        onPress={() => router.back()}
      />
    </View>
  );
}