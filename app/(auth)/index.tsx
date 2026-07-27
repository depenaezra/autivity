import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  Text,
  View,
  useWindowDimensions // for adjusting layout for bigger screens (tablet)
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function Welcome() {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false); // checkbox for tnc

  // responsiveness
  const { width } = useWindowDimensions(); // check the current screen's width
  const isTablet = width >= 768; // anything 768px or wider gets the tablet styling

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]" edges={['bottom', 'left', 'right']}>

      {/* top banner */}
      <View className={`w-full ${isTablet ? 'h-[45%]' : 'h-[35%]'}`}>
        <Image
          source={require('../../assets/images/header.png')}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* main screen content */}
      <View
        className={`flex-1 flex-col items-center w-full pt-0 ${isTablet ? 'px-[94px] pb-[78px] mt-[49px]' : 'px-6 pb-8 mt-6'
          }`}
      >

        {/* main title + subtitle */}
        <View className="items-center">
          <Text
            className={`font-fredoka-one text-[#4B5563] text-center mb-2 ${isTablet ? 'text-5xl mb-4' : 'text-3xl'
              }`}
          >
            Welcome to Autivity
          </Text>
          <Text className={`font-quicksand-medium text-[#6B7280] text-center ${isTablet ? 'text-2xl' : 'text-lg'}`}>
            The right education just for you
          </Text>
        </View>

        {/* bottom section */}
        <View className={`w-full flex-col mt-auto ${isTablet ? 'gap-6' : 'gap-4'}`}>

          <View className="flex-row items-center w-full pl-2">

            {/* checkbox for tnc */}
            <Pressable
              className="flex-row items-center w-full pl-2"
              onPress={() => setIsChecked(!isChecked)}
            >
              <View
                className={`border-2 items-center justify-center ${isTablet ? 'w-8 h-8 rounded-[6px] mr-4' : 'w-6 h-6 rounded-[4px] mr-3'
                  } ${isChecked ? 'bg-[#62A9E6] border-[#62A9E6]' : 'border-[#4B5563] bg-transparent'
                  }`}
              >
                {isChecked && <Feather name="check" size={isTablet ? 22 : 16} color="white" />}
              </View>

              {/* tnc text */}
              <Text className={`font-quicksand-medium text-[#6B7280] flex-1 ${isTablet ? 'text-lg leading-7' : 'text-sm leading-5'}`}>
                I agree to {"Autivity's"} <Text className="text-[#84B9E9] underline">Terms and Conditions</Text> and acknowledge the <Text className="text-[#84B9E9] underline">Privacy Policy</Text>.
              </Text>
            </Pressable>
          </View>

          {/* get started / sign up btn */}
          <Pressable
            onPress={() => router.push('/(auth)/user')}
            disabled={!isChecked} // disabled if tnc is not checked
            className={`w-full flex items-center justify-center border-b-[4px] p-[10px] ${isChecked
              ? 'bg-[#62A9E6] border-[#5298D4]' // blue - if tnc is checked
              : 'bg-[#D1D5DB] border-[#9CA3AF]' // gray - if tnc not checked yet
              } ${isTablet ? 'h-[84px] rounded-[55px]' : 'h-[60px] rounded-full'}`}
          >
            <Text className={`font-fredoka-regular text-white ${isTablet ? 'text-2xl' : 'text-lg'}`}>
              Get started
            </Text>
          </Pressable>

          {/* login btn */}
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            className={`w-full bg-[#FEF7F7] flex items-center justify-center border-b-[4px] border-[#D5D0D2] p-[10px] ${isTablet ? 'h-[84px] rounded-[55px]' : 'h-[60px] rounded-full'
              }`}
          >
            <Text className={`text-[#4B5563] font-fredoka-regular ${isTablet ? 'text-2xl' : 'text-lg'}`}>
              I already have an account
            </Text>
          </Pressable>

        </View>
      </View>
    </SafeAreaView>
  );
}