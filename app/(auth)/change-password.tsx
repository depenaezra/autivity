import React, { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { supabase } from "../../src/lib/supabase";

export default function ChangePasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {

    if (!newPassword || !confirmPassword) {
      Alert.alert(
        "Missing Fields",
        "Please fill in all fields."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Password Error",
        "Passwords do not match."
      );
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const { error } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (error) {
        throw error;
      }

      Alert.alert(
        "Success",
        "Password updated successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(auth)/login");
            },
          },
        ]
      );

    } catch (error:any) {
      Alert.alert(
        "Error",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <View className="flex-1 bg-[#F5F8FA] px-6">

      {/* BACK BUTTON */}
      <Pressable
        onPress={() => router.back()}
        className="mt-14 w-11 h-11 bg-white rounded-full items-center justify-center shadow"
      >
        <Feather 
          name="arrow-left"
          size={24}
          color="#374151"
        />
      </Pressable>


      <View className="flex-1 justify-center">

        {/* TITLE */}
        <Text className="text-[#374151] text-3xl font-bold mb-2">
          Change Password
        </Text>

        <Text className="text-[#6B7280] mb-8">
          Create a new password for your account.
        </Text>


        {/* NEW PASSWORD */}
        <Text className="text-[#374151] font-semibold mb-2">
          New Password
        </Text>

        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="Enter new password"
          placeholderTextColor="#9CA3AF"
          className="
          bg-white
          border border-[#E5E7EB]
          rounded-2xl
          px-5
          py-4
          mb-5
          text-[#374151]
          "
        />


        {/* CONFIRM PASSWORD */}
        <Text className="text-[#374151] font-semibold mb-2">
          Confirm Password
        </Text>

        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Confirm password"
          placeholderTextColor="#9CA3AF"
          className="
          bg-white
          border border-[#E5E7EB]
          rounded-2xl
          px-5
          py-4
          mb-8
          text-[#374151]
          "
        />


        {/* BUTTON */}
        <Pressable
          onPress={handleChangePassword}
          disabled={loading}
          className="
          bg-[#62A9E6]
          rounded-full
          py-4
          items-center
          "
        >

        {
          loading ? (
            <ActivityIndicator color="white"/>
          ) : (
            <Text className="
            text-white
            font-bold
            text-lg
            ">
              Update Password
            </Text>
          )
        }

        </Pressable>


      </View>

    </View>
  );
}