import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Pressable, Text, TextInput, TouchableWithoutFeedback, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { register } from '../../src/services/auth';

export default function Signup() {
  const router = useRouter();

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // goals from onboarding
  const params = useLocalSearchParams();
  const userGoals: string[] = params.goals ? JSON.parse(params.goals as string) : [];
  const role = (params.role as string) || 'teacher';

  // form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ui states
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // check if password is strong (regex)
  // checklist: 8+ chars, 1 upper, 1 lower, 1 number
  const isStrongPassword = (password: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  };


  // registration details -> database
  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Missing Information', 'Please fill out all fields to register.');
      return;
    }

    // if password is not strong
    if (!isStrongPassword(password)) {
      Alert.alert(
        "Weak Password",
        "Password must:\n\n• Be at least 8 characters\n• Have at least 1 uppercase letter\n• Have at least 1 lowercase letter\n• Have at least 1 number\n\nExample: Autivity123"
      );
      return;
    }
    setIsLoading(true);

    try {
      await register(email, password, firstName, lastName, userGoals, role);

      // .replace used so they can't swipe back to signup
      router.replace({
        pathname: '/(tabs)',
        params: { firstName: firstName }
      });
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // UI
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-[#F5F8FA]">

        {/* back btn */}
        <View className={`w-full pt-4 pb-2 ${isTablet ? 'px-8' : 'px-6'}`}>
          <Pressable onPress={() => router.back()} className="w-10 h-10 justify-center">
            <Feather name="arrow-left" size={isTablet ? 32 : 24} color="#4B5563" />
          </Pressable>
        </View>

        {/* main container */}
        <View
          className={`flex-1 flex-col items-center w-full ${isTablet ? 'px-[94px] pb-[78px]' : 'px-6 pb-8'
            }`}
        >
          {/* title */}
          <Text
            className={`font-fredoka-one text-[#4B5563] text-center ${isTablet ? 'text-5xl mb-10' : 'text-3xl mb-6'
              }`}
          >
            Create an account
          </Text>

          {/* form container */}
          <View className="w-full flex-col gap-4">

            {/* first name */}
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

            {/* last name */}
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

            {/* email */}
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

            {/* password */}
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

          {/* password reqs */}
          <Text
            className={`text-[#9CA3AF] px-2 ${isTablet ? "text-base mt-2" : "text-xs mt-2"
              }`}
          >
            Must be at least 8 characters with uppercase, lowercase, and number.
          </Text>

          <Text
            className={`text-[#62A9E6] px-2 ${isTablet ? "text-base" : "text-xs"
              }`}
          >
            Example: Autivity123
          </Text>

          {/* register btn */}
          <View className={`w-full ${isTablet ? 'mt-8' : 'mt-6'}`}>
            <Pressable
              onPress={handleRegister}
              disabled={isLoading}
              className={`w-full bg-[#62A9E6] flex items-center justify-center border-b-[4px] border-[#5298D4] p-[10px] ${isTablet ? 'h-[84px] rounded-[55px]' : 'h-[60px] rounded-full'} ${isLoading ? 'opacity-70' : 'opacity-100'}`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className={`text-white font-fredoka-regular ${isTablet ? 'text-2xl' : 'text-lg'}`}>Register</Text>
              )}
            </Pressable>
          </View>

          {/* login link */}
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