import { AntDesign, Feather, FontAwesome } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState } from 'react';
import { Alert, Keyboard, Pressable, Text, TextInput, TouchableWithoutFeedback, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Signup() {
  const router = useRouter();

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

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
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Missing Information', 'Please fill out all fields to register.');
      return;
    }
    router.push({
      pathname: '/(tabs)',
      params: { firstName: firstName } // pass first name as parameter for homescreen
    });
  };

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
            Create an account
          </Text>

          {/* Form Container */}
          <View className="w-full flex-col gap-4">
            {/* First Name Input */}
            <View
              className={`w-full border-[2px] justify-center bg-transparent ${isTablet ? 'h-[76px] rounded-[55px] px-8' : 'h-[60px] rounded-full px-6'
                } ${focusedInput === 'firstName' ? 'border-[#62A9E6]' : 'border-[#E5E7EB]'}`}
            >
              <TextInput
                className={`font-quicksand-medium text-[#4B5563] w-full p-0 ${isTablet ? 'text-[24px]' : 'text-[18px]'}`}
                placeholder="First name"
                placeholderTextColor="#9CA3AF"
                value={firstName}
                onChangeText={setFirstName}
                onFocus={() => setFocusedInput('firstName')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* Last Name Input */}
            <View
              className={`w-full border-[2px] justify-center bg-transparent ${isTablet ? 'h-[76px] rounded-[55px] px-8' : 'h-[60px] rounded-full px-6'
                } ${focusedInput === 'lastName' ? 'border-[#62A9E6]' : 'border-[#E5E7EB]'}`}
            >
              <TextInput
                className={`font-quicksand-medium text-[#4B5563] w-full p-0 ${isTablet ? 'text-[24px]' : 'text-[18px]'}`}
                placeholder="Last name"
                placeholderTextColor="#9CA3AF"
                value={lastName}
                onChangeText={setLastName}
                onFocus={() => setFocusedInput('lastName')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

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

          {/* REGISTER BUTTON */}
          <View className={`w-full ${isTablet ? 'mt-8' : 'mt-6'}`}>
            <Pressable
              onPress={handleRegister}
              className={`w-full bg-[#62A9E6] flex items-center justify-center border-b-[4px] border-[#5298D4] p-[10px] ${isTablet ? 'h-[84px] rounded-[55px]' : 'h-[60px] rounded-full'
                }`}
            >
              <Text className={`text-white font-fredoka-regular ${isTablet ? 'text-2xl' : 'text-lg'}`}>
                Register
              </Text>
            </Pressable>
          </View>

          {/* Divider: OR CONTINUE WITH */}
          <View className={`flex-row items-center w-full ${isTablet ? 'my-8' : 'my-6'}`}>
            <View className="flex-1 h-[2px] bg-[#E5E7EB]" />
            <Text className={`mx-4 text-[#9CA3AF] font-fredoka-regular tracking-widest ${isTablet ? 'text-lg' : 'text-sm'}`}>
              OR CONTINUE WITH
            </Text>
            <View className="flex-1 h-[2px] bg-[#E5E7EB]" />
          </View>

          {/* Social Buttons */}
          <View className={`flex-row w-full ${isTablet ? 'gap-6' : 'gap-4'}`}>
            <Pressable
              className={`flex-1 border-[2px] border-[#E5E7EB] bg-white flex-row items-center justify-center gap-3 ${isTablet ? 'h-[76px] rounded-[55px]' : 'h-[60px] rounded-full'
                }`}
            >
              <FontAwesome name="facebook-f" size={isTablet ? 28 : 20} color="#3b5998" />
              <Text className={`font-quicksand-medium text-[#4B5563] ${isTablet ? 'text-2xl' : 'text-lg'}`}>Facebook</Text>
            </Pressable>

            <Pressable
              className={`flex-1 border-[2px] border-[#E5E7EB] bg-white flex-row items-center justify-center gap-3 ${isTablet ? 'h-[76px] rounded-[55px]' : 'h-[60px] rounded-full'
                }`}
            >
              <AntDesign name="google" size={isTablet ? 28 : 20} color="#DB4437" />
              <Text className={`font-quicksand-medium text-[#4B5563] ${isTablet ? 'text-2xl' : 'text-lg'}`}>Google</Text>
            </Pressable>
          </View>

          {/* Bottom Login Link */}
          <View className="mt-auto pb-4">
            <Text className={`font-quicksand-regular text-[#9CA3AF] ${isTablet ? 'text-xl' : 'text-base'}`}>
              Already have an account?{' '}
              <Text
                onPress={() => router.push('/(auth)/login')}
                className="text-[#62A9E6] font-quicksand-medium"
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