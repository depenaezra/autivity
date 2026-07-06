import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function Welcome() {
  // State to track if the checkbox is checked (defaults to false)
  const [isChecked, setIsChecked] = useState(false);

  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]" edges={['bottom', 'left', 'right']}>

      {/* Header Container */}
      <View className="w-full h-[45%]">
        <Image
          source={require('../../assets/images/header.png')}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Main Content Container */}
      {/* Added flex-1 to this container so it spans the rest of the screen height */}
      <View className="flex-1 flex-col items-center w-full pt-0 px-[94px] pb-[78px] mt-[49px]">

        {/* GROUP 1: Welcome Text */}
        <View className="items-center">
          <Text className="text-5xl font-extrabold text-[#4B5563] text-center mb-4">
            Welcome to Autivity
          </Text>
          <Text className="text-2xl text-[#6B7280] text-center">
            The right education just for you
          </Text>
        </View>

        {/* GROUP 2: Actions (Checkbox & Buttons) */}
        {/* mt-auto forces this block to push all the way down to the bottom padding! */}
        <View className="w-full flex-col gap-6 mt-auto">

          {/* Checkbox Area */}
          <View className="flex-row items-center w-full pl-2">
            {/* Checkbox Area */}
            {/* 1. Changed parent View to Pressable and moved the onPress here */}
            <Pressable
              className="flex-row items-center w-full pl-2"
              onPress={() => setIsChecked(!isChecked)}
            >
              {/* 2. Changed this from Pressable to a standard View since the parent handles the tap */}
              <View
                className={`w-6 h-6 border-2 rounded-[4px] mr-4 items-center justify-center ${isChecked ? 'bg-[#62A9E6] border-[#62A9E6]' : 'border-[#4B5563] bg-transparent'
                  }`}
              >
                {isChecked && <Feather name="check" size={18} color="white" />}
              </View>

              <Text className="text-[#6B7280] text-lg flex-1 leading-7">
                I agree to Autivity's <Text className="text-[#84B9E9] underline">Terms and Conditions</Text> and acknowledge the <Text className="text-[#84B9E9] underline">Privacy Policy</Text>.
              </Text>
            </Pressable>

          </View>

          {/* "Get started" Button */}
          <Pressable
            // 3. Add the route push here
            onPress={() => router.push('/(auth)/user')}
            className="w-full h-[84px] bg-[#62A9E6] rounded-[55px] flex items-center justify-center border-b-[4px] border-[#5298D4] p-[10px]"
          >
            <Text className="text-white text-2xl font-semibold">
              Get started
            </Text>
          </Pressable>

          {/* "I already have an account" Button */}
          <Pressable
            // 4. Add the route push here
            onPress={() => router.push('/(auth)/login')}
            className="w-full h-[84px] bg-[#FEF7F7] rounded-[55px] flex items-center justify-center border-b-[4px] border-[#D5D0D2] p-[10px]"
          >
            <Text className="text-[#4B5563] text-2xl font-semibold">
              I already have an account
            </Text>
          </Pressable>

        </View>

      </View>
    </SafeAreaView>
  );
}