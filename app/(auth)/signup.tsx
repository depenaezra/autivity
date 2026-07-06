import { AntDesign, Feather, FontAwesome } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState } from 'react';
import { Alert, Keyboard, Pressable, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Signup() {
  const router = useRouter();

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI State
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Validation & Routing Function
  const handleRegister = () => {
    // 1. Check if any field is empty
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Missing Information', 'Please fill out all fields to register.');
      return;
    }

    // 2. If valid, push to Home screen and pass the firstName as a parameter
    // NOTE: Change '/home' to whatever your actual home path is!
    router.push({
      pathname: '/(tabs)',
      params: { firstName: firstName }
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-[#F5F8FA]">
        {/* Top Navigation / Back Button */}
        <View className="w-full px-8 pt-4 pb-2">
          <Pressable onPress={() => router.back()} className="w-10 h-10 justify-center">
            <Feather name="arrow-left" size={32} color="#4B5563" />
          </Pressable>
        </View>

        {/* Main Container */}
        <View className="flex-1 flex-col items-center w-full px-[94px] pb-[78px]">
          {/* Title */}
          <Text className="text-5xl font-extrabold text-[#4B5563] text-center mb-10">
            Create an account
          </Text>

          {/* Form Container */}
          <View className="w-full flex-col gap-4">
            {/* First Name Input */}
            <View className={`w-full h-[76px] rounded-[55px] border-[2px] px-8 justify-center bg-transparent ${focusedInput === 'firstName' ? 'border-[#62A9E6]' : 'border-[#E5E7EB]'
              }`}>
              <TextInput
                className="text-2xl text-[#4B5563] w-full"
                placeholder="First name"
                placeholderTextColor="#9CA3AF"
                value={firstName}
                onChangeText={setFirstName}
                onFocus={() => setFocusedInput('firstName')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* Last Name Input */}
            <View className={`w-full h-[76px] rounded-[55px] border-[2px] px-8 justify-center bg-transparent ${focusedInput === 'lastName' ? 'border-[#62A9E6]' : 'border-[#E5E7EB]'
              }`}>
              <TextInput
                className="text-2xl text-[#4B5563] w-full"
                placeholder="Last name"
                placeholderTextColor="#9CA3AF"
                value={lastName}
                onChangeText={setLastName}
                onFocus={() => setFocusedInput('lastName')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* Email Input */}
            <View className={`w-full h-[76px] rounded-[55px] border-[2px] px-8 justify-center bg-transparent ${focusedInput === 'email' ? 'border-[#62A9E6]' : 'border-[#E5E7EB]'
              }`}>
              <TextInput
                className="text-2xl text-[#4B5563] w-full"
                placeholder="Email address"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="email-address" // Shows the "@" symbol on mobile keyboards easily
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View className={`w-full h-[76px] rounded-[55px] border-[2px] px-8 flex-row items-center justify-between bg-transparent ${focusedInput === 'password' ? 'border-[#62A9E6]' : 'border-[#E5E7EB]'
              }`}>
              <TextInput
                className="text-2xl text-[#4B5563] flex-1"
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry={!showPassword} // Hides text if showPassword is false
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2">
                {/* Toggles between 'eye' and 'eye-off' icons */}
                <Feather name={showPassword ? "eye" : "eye-off"} size={24} color="#9CA3AF" />
              </Pressable>
            </View>
          </View>

          {/* REGISTER BUTTON */}
          <View className="w-full mt-8">
            <Pressable
              onPress={handleRegister}
              className="w-full h-[84px] bg-[#62A9E6] rounded-[55px] flex items-center justify-center border-b-[4px] border-[#5298D4] p-[10px]"
            >
              <Text className="text-white text-2xl font-semibold">
                Register
              </Text>
            </Pressable>
          </View>

          {/* Divider: OR CONTINUE WITH */}
          <View className="flex-row items-center w-full my-8">
            <View className="flex-1 h-[2px] bg-[#E5E7EB]" />
            <Text className="mx-4 text-[#9CA3AF] text-lg font-medium tracking-widest">
              OR CONTINUE WITH
            </Text>
            <View className="flex-1 h-[2px] bg-[#E5E7EB]" />
          </View>

          {/* Social Buttons */}
          <View className="flex-row w-full gap-6">
            <Pressable className="flex-1 h-[76px] rounded-[55px] border-[2px] border-[#E5E7EB] bg-white flex-row items-center justify-center gap-4">
              <FontAwesome name="facebook-f" size={28} color="#3b5998" />
              <Text className="text-2xl font-medium text-[#4B5563]">Facebook</Text>
            </Pressable>

            <Pressable className="flex-1 h-[76px] rounded-[55px] border-[2px] border-[#E5E7EB] bg-white flex-row items-center justify-center gap-4">
              {/* Standard AntDesign Google icon */}
              <AntDesign name="google" size={28} color="#DB4437" />
              <Text className="text-2xl font-medium text-[#4B5563]">Google</Text>
            </Pressable>
          </View>

          {/* Bottom Login Link */}
          <View className="mt-auto pb-4">
            <Text className="text-[#9CA3AF] text-xl">
              Already have an account?{' '}
              <Text
                onPress={() => router.push('/(auth)/login')}
                className="text-[#62A9E6] font-semibold"
              >
                Log in
              </Text>
            </Text>
          </View>
        </View>

      </SafeAreaView>
    </TouchableWithoutFeedback>

  );
}