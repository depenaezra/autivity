import { Feather } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, Keyboard, Pressable, Text, TextInput, TouchableWithoutFeedback, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabase";
// login service
import { login } from '../../src/services/auth';
export default function Login() {
  const router = useRouter();

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI State
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Loading State
  const [isLoading, setIsLoading] = useState(false);
useEffect(() => {
  loadRememberedUser();
}, []);

const loadRememberedUser = async () => {
  try {
    const savedEmail = await AsyncStorage.getItem("remember_email");
    const remembered = await AsyncStorage.getItem("remember_me");

    if (remembered === "true" && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  } catch (error) {
    console.log(error);
  }
};
const handleForgotPassword = async () => {
  if (!email) {
    Alert.alert("Email Required", "Please enter your email address first.");
    return;
  }

  try {
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) throw error;

    Alert.alert("Check your email", "We sent a 6-digit code to your email address.");

    // Pumunta sa screen kung saan ilalagay ang code + bagong password
    router.push({
      pathname: '/(auth)/reset-password' as any,
      params: { email },
    });
  } catch (error: any) {
    Alert.alert("Error", error.message);
  } finally {
    setIsLoading(false);
  }
};
  // Database Connection
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter your email and password to log in.');
      return;
    }

setIsLoading(true);

try {
  await login(email, password);

  // Save or remove remembered email
  if (rememberMe) {
    await AsyncStorage.setItem("remember_email", email);
    await AsyncStorage.setItem("remember_me", "true");
  } else {
    await AsyncStorage.removeItem("remember_email");
    await AsyncStorage.setItem("remember_me", "false");
  }

  router.replace('/(tabs)');

} catch (error: any) {
  Alert.alert('Login Failed', error.message);
} finally {
  setIsLoading(false);
}
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-[#F5F8FA]">
        {/* Top Navigation / Back Button */}
        <View className={`w-full pt-4 pb-2 ${isTablet ? 'px-8' : 'px-6'}`}>
          <Pressable onPress={() => router.back()} className="w-10 h-10 justify-center">
            <Feather name="arrow-left" size={isTablet ? 32 : 24} color="#4B5563" />
          </Pressable>
        </View>

        {/* Main Container */}
        <View
          className={`flex-1 flex-col items-center w-full ${isTablet ? 'px-[94px] pb-[78px]' : 'px-6 pb-8'
            }`}
        >
          {/* Title */}
          <Text
            className={`font-fredoka-one text-[#4B5563] text-center ${isTablet ? 'text-5xl mb-10' : 'text-3xl mb-6'
              }`}
          >
            Continue your journey
          </Text>

          {/* Form Container */}
          <View className="w-full flex-col gap-4">

            {/* Email Input */}
            <View
              className={`w-full border-[2px] justify-center bg-transparent ${isTablet ? 'h-[76px] rounded-[55px] px-8' : 'h-[60px] rounded-full px-6'
                } ${focusedInput === 'email' ? 'border-[#62A9E6]' : 'border-[#E5E7EB]'}`}
            >
              <TextInput
                className={`font-quicksand-medium text-[#4B5563] w-full p-0 ${isTablet ? 'text-[24px]' : 'text-[18px]'}`}
                placeholder="Email address"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View
              className={`w-full border-[2px] flex-row items-center justify-between bg-transparent ${isTablet ? 'h-[76px] rounded-[55px] px-8' : 'h-[60px] rounded-full px-6'
                } ${focusedInput === 'password' ? 'border-[#62A9E6]' : 'border-[#E5E7EB]'}`}
            >
              <TextInput
                className={`font-quicksand-medium text-[#4B5563] flex-1 p-0 ${isTablet ? 'text-[24px]' : 'text-[18px]'}`}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2">
                <Feather name={showPassword ? "eye" : "eye-off"} size={isTablet ? 24 : 20} color="#9CA3AF" />
              </Pressable>
            </View>

          </View>

          {/* Remember Me & Forgot Password Row */}
          <View className={`w-full flex-row justify-between items-center px-2 ${isTablet ? 'mt-6 mb-8' : 'mt-4 mb-6'}`}>
            {/* Remember Me Checkbox */}
            <Pressable
              className="flex-row items-center gap-3"
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                className={`border-2 items-center justify-center ${isTablet ? 'w-6 h-6 rounded-[4px]' : 'w-5 h-5 rounded-[4px]'
                  } ${rememberMe ? 'bg-[#62A9E6] border-[#62A9E6]' : 'border-[#9CA3AF] bg-transparent'
                  }`}
              >
                {rememberMe && <Feather name="check" size={isTablet ? 18 : 14} color="white" />}
              </View>
              <Text className={`font-quicksand-regular text-[#9CA3AF] ${isTablet ? 'text-xl' : 'text-base'}`}>
                Remember me
              </Text>
            </Pressable>

            {/* Forgot Password Link */}
            <Pressable onPress={handleForgotPassword}>
              <Text className={`font-quicksand-semibold text-[#62A9E6] ${isTablet ? 'text-xl' : 'text-base'}`}>
                Forgot password?
              </Text>
            </Pressable>
          </View>

          {/* LOG IN BUTTON */}
          <View className="w-full">
            <Pressable
              onPress={handleLogin}
              // [MODIFIED] Disable the button completely while loading
              disabled={isLoading}
              // [MODIFIED] Slightly fade the button if it is loading
              className={`w-full bg-[#62A9E6] flex items-center justify-center border-b-[4px] border-[#5298D4] p-[10px] ${isTablet ? 'h-[84px] rounded-[55px]' : 'h-[60px] rounded-full'} ${isLoading ? 'opacity-70' : 'opacity-100'}`}
            >
              {/* [MODIFIED] Show spinner if loading, otherwise show "Log in" text */}
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className={`text-white font-fredoka-regular ${isTablet ? 'text-2xl' : 'text-lg'}`}>Log in</Text>
              )}
            </Pressable>
          </View>

          {/* Bottom Create Account Link */}
          <View className="mt-auto pb-4">
            <Text className={`font-quicksand-regular text-[#9CA3AF] ${isTablet ? 'text-xl' : 'text-base'}`}>
              New here?{' '}
              <Text
                onPress={() => router.push('/(auth)/signup')}
                className="text-[#62A9E6] font-quicksand-medium"
              >
                Create an account
              </Text>
            </Text>
          </View>

        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}