import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  Text,
  View,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderButton } from "../../components/header-button";

export default function User() {
  // Tracks which card is selected: 'parent', 'teacher', or null (none)
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const router = useRouter();

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]">

      {/* Top Navigation / Back Button */}
      <View className={`w-full pt-4 pb-2 ${isTablet ? 'px-8' : 'px-6'}`}>
        <HeaderButton
          onPress={() => router.back()}
          icon={
            <View style={{ marginLeft: -3, marginTop: -1 }}>
              <Ionicons name="caret-back" size={isTablet ? 30 : 24} color="#62A9E6" />
            </View>
          }
        />
      </View>

      {/* main container */}
      <View
        className={`flex-1 flex-col items-center w-full ${
          isTablet ? 'px-[94px] pt-12 pb-[78px]' : 'px-6 pt-8 pb-8'
        }`}
      >
        {/* Title */}
        <Text className={`font-fredoka-one text-[#4B5563] text-center ${isTablet ? 'text-5xl mb-10' : 'text-3xl mb-6'}`}>
          Who are you?
        </Text>

        {/* cards */}
        <View className={`w-full flex-col flex-1 ${isTablet ? 'gap-6' : 'gap-4'}`}>
          {/* PARENT CARD */}
          <Pressable
            onPress={() => setSelectedRole(selectedRole === 'parent' ? null : 'parent')}
            className={`w-full rounded-[24px] items-center justify-center border-[2px] active:scale-95 transition-transform ${
              isTablet ? 'p-8' : 'p-5'
            }`}
            style={{
              backgroundColor: selectedRole === 'parent' ? '#EBF5FF' : '#FFFFFF',
              borderColor: selectedRole === 'parent' ? '#62A9E6' : '#F1F1F1',
              shadowColor: selectedRole === 'parent' ? '#62A9E6' : '#F1F1F1',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
            }}
          >
            <Image
              source={require('../../assets/images/polar-bear.png')}
              className={isTablet ? 'w-32 h-32 mb-4' : 'w-20 h-20 mb-3'}
              resizeMode="contain"
            />
            <Text
              className={`font-fredoka-one ${isTablet ? 'text-4xl mb-3' : 'text-2xl mb-2'}`}
              style={{
                color: selectedRole === 'parent' ? '#62A9E6' : '#4B5563',
              }}
            >
              Parent
            </Text>
            <Text
              className={`font-quicksand-medium text-center ${isTablet ? 'text-lg leading-7' : 'text-sm leading-5'}`}
              style={{
                color: selectedRole === 'parent' ? '#62A9E6' : '#6B7280',
              }}
            >
              Monitor your child's progress and achievements as they go on their journey.
            </Text>
          </Pressable>

          {/* TEACHER CARD */}
          <Pressable
            onPress={() => setSelectedRole(selectedRole === 'teacher' ? null : 'teacher')}
            className={`w-full rounded-[24px] items-center justify-center border-[2px] active:scale-95 transition-transform ${
              isTablet ? 'p-8' : 'p-5'
            }`}
            style={{
              backgroundColor: selectedRole === 'teacher' ? '#EBF5FF' : '#FFFFFF',
              borderColor: selectedRole === 'teacher' ? '#62A9E6' : '#F1F1F1',
              shadowColor: selectedRole === 'teacher' ? '#62A9E6' : '#F1F1F1',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
            }}
          >
            <Image
              source={require('../../assets/images/bear.png')}
              className={isTablet ? 'w-32 h-32 mb-4' : 'w-20 h-20 mb-3'}
              resizeMode="contain"
            />
            <Text
              className={`font-fredoka-one ${isTablet ? 'text-4xl mb-3' : 'text-2xl mb-2'}`}
              style={{
                color: selectedRole === 'teacher' ? '#62A9E6' : '#4B5563',
              }}
            >
              Teacher
            </Text>
            <Text
              className={`font-quicksand-medium text-center ${isTablet ? 'text-lg leading-7' : 'text-sm leading-5'}`}
              style={{
                color: selectedRole === 'teacher' ? '#62A9E6' : '#6B7280',
              }}
            >
              Manage classroom activities and learner profiles.
            </Text>
          </Pressable>

        </View>

        {/* CONTINUE BUTTON */}
        <View className="w-full mt-auto pt-4">
          <Pressable
            disabled={!selectedRole}
            onPress={() => {
              if (selectedRole) {
                router.push({
                  pathname: '/(auth)/onboarding',
                  params: { role: selectedRole }
                });
              }
            }}
            className="w-full bg-white border-[2px] rounded-xl items-center justify-center active:scale-95 transition-transform"
            style={{
              height: isTablet ? 76 : 60,
              borderColor: selectedRole ? '#BBE8FB' : '#F1F1F1',
              shadowColor: selectedRole ? '#BBE8FB' : '#F1F1F1',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
              opacity: selectedRole ? 1 : 0.6,
            }}
          >
            <Text
              className={`font-fredoka-one uppercase ${
                isTablet ? 'text-2xl' : 'text-lg'
              }`}
              style={{
                color: selectedRole ? '#62A9E6' : '#D9D9D9',
              }}
            >
              CONTINUE
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}