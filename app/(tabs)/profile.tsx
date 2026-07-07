import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Profile() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 10 }}>
      <Text>Profile Tab</Text>

      <Button
        title="Logout"
        onPress={() => router.replace("/(auth)")}
      />
    </View>
  );
}