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
            disabled={!isChecked}
            className="w-full bg-white border-[2px] rounded-xl items-center justify-center active:scale-95 transition-transform"
            style={{
              height: isTablet ? 76 : 60,
              borderColor: isChecked ? '#BBE8FB' : '#F1F1F1',
              shadowColor: isChecked ? '#BBE8FB' : '#F1F1F1',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
              opacity: isChecked ? 1 : 0.6,
            }}
          >
            <Text
              className={`font-fredoka-one uppercase ${
                isTablet ? 'text-2xl' : 'text-lg'
              }`}
              style={{
                color: isChecked ? '#62A9E6' : '#D9D9D9',
              }}
            >
              GET STARTED
            </Text>
          </Pressable>

          {/* login btn */}
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            className="w-full bg-white border-[2px] border-[#F1F1F1] rounded-xl items-center justify-center active:scale-95 transition-transform"
            style={{
              height: isTablet ? 76 : 60,
              shadowColor: '#F1F1F1',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
            }}
          >
            <Text
              className={`font-fredoka-one text-[#484A4B] uppercase ${
                isTablet ? 'text-2xl' : 'text-lg'
              }`}
            >
              I ALREADY HAVE AN ACCOUNT
            </Text>
          </Pressable>

        </View>
      </View>
    </SafeAreaView>
  );
}