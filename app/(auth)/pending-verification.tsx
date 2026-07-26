import React from 'react';
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function PendingVerification() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const handleGotIt = () => {
    router.replace('/(auth)');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA] justify-center items-center px-6">
      <View className={`w-full items-center justify-center ${isTablet ? 'max-w-[600px] p-12 bg-white rounded-[40px] shadow-sm border border-[#E5E7EB]' : 'p-2'}`}>
        
        {/* 🎉 Emoji */}
        <Text className={`${isTablet ? 'text-8xl mb-8' : 'text-6xl mb-6'}`}>🎉</Text>

        {/* Title */}
        <Text
          className={`font-fredoka-one text-[#4B5563] text-center ${
            isTablet ? 'text-4xl mb-6' : 'text-2xl mb-4'
          }`}
        >
          Registration Received!
        </Text>

        {/* Subtitle */}
        <Text
          className={`font-quicksand-bold text-[#62A9E6] text-center ${
            isTablet ? 'text-2xl mb-6' : 'text-lg mb-4'
          }`}
        >
          Thanks for signing up!
        </Text>

        {/* Description */}
        <Text
          className={`font-quicksand-medium text-[#6B7280] text-center leading-relaxed ${
            isTablet ? 'text-xl mb-12' : 'text-sm mb-8'
          }`}
        >
          Your account is currently pending verification. We'll review your registration as soon as possible.{"\n\n"}
          Please check back later to sign in after your account has been approved.
        </Text>

        {/* Got It Button */}
        <Pressable
          onPress={handleGotIt}
          className={`w-full bg-[#62A9E6] flex items-center justify-center border-b-[4px] border-[#5298D4] p-[10px] ${
            isTablet ? 'h-[84px] rounded-[55px]' : 'h-[60px] rounded-full'
          }`}
        >
          <Text className={`text-white font-fredoka-regular ${isTablet ? 'text-2xl' : 'text-lg'}`}>
            Got it
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
