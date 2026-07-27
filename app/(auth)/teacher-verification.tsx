import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Pressable, Text, TextInput, TouchableWithoutFeedback, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { register } from '../../src/services/auth';
import { supabase } from '../../src/lib/supabase';

export default function TeacherVerification() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Retrieve params from signup screen
  const params = useLocalSearchParams();
  const firstName = (params.firstName as string) || '';
  const lastName = (params.lastName as string) || '';
  const email = (params.email as string) || '';
  const password = (params.password as string) || '';
  const role = (params.role as string) || 'teacher';
  const userGoals: string[] = params.goals ? JSON.parse(params.goals as string) : [];

  // Form states
  const [institution, setInstitution] = useState('');
  const [prcNumber, setPrcNumber] = useState('');

  // UI states
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!institution || !prcNumber) {
      Alert.alert('Missing Information', 'Please fill out all fields to register.');
      return;
    }

    setIsLoading(true);

    try {
      const signUpResult = await register(email, password, firstName, lastName, userGoals, role, institution, prcNumber);

      if (signUpResult?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: signUpResult.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            goals: userGoals,
            role,
            university: institution,
            prc_number: prcNumber,
            is_verified: false,
          });

        if (profileError) {
          console.error('Error saving profile details:', profileError.message);
        }
      }

      // Sign out immediately to clear the auto-logged in session
      await supabase.auth.signOut();

      router.replace('/(auth)/pending-verification');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

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
            Verification
          </Text>

          {/* subtitle */}
          <Text
            className={`font-quicksand-medium text-[#6B7280] text-center mb-8 ${isTablet ? 'text-2xl' : 'text-base'
              }`}
          >
            Please provide your details to complete your teacher registration.
          </Text>

          {/* form container */}
          <View className="w-full flex-col gap-4">

            {/* institution */}
            <View
              className={`w-full border-[2px] justify-center bg-transparent ${isTablet ? 'h-[76px] rounded-[55px] px-8' : 'h-[60px] rounded-full px-6'
                } ${focusedInput === 'institution' ? 'border-[#62A9E6]' : 'border-[#E5E7EB]'}`}
            >
              <TextInput
                className={`font-quicksand-medium text-[#4B5563] w-full p-0 ${isTablet ? 'text-[24px]' : 'text-[18px]'}`}
                placeholder="Institution / School"
                placeholderTextColor="#9CA3AF"
                value={institution}
                onChangeText={setInstitution}
                onFocus={() => setFocusedInput('institution')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* prc id number */}
            <View className="w-full flex-col">
              <View
                className={`w-full border-[2px] justify-center bg-transparent ${isTablet ? 'h-[76px] rounded-[55px] px-8' : 'h-[60px] rounded-full px-6'
                  } ${focusedInput === 'prcNumber' ? 'border-[#62A9E6]' : 'border-[#E5E7EB]'}`}
              >
                <TextInput
                  className={`font-quicksand-medium text-[#4B5563] w-full p-0 ${isTablet ? 'text-[24px]' : 'text-[18px]'}`}
                  placeholder="PRC ID Number"
                  placeholderTextColor="#9CA3AF"
                  value={prcNumber}
                  onChangeText={setPrcNumber}
                  onFocus={() => setFocusedInput('prcNumber')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="numeric"
                />
              </View>
              <Text
                className={`text-[#9CA3AF] font-quicksand-medium px-5 mt-2 ${isTablet ? "text-base" : "text-xs"}`}
              >
                For verification purposes only. Your information will remain strictly confidential.
              </Text>
            </View>
          </View>

          {/* register btn */}
          <View className={`w-full ${isTablet ? 'mt-10' : 'mt-8'}`}>
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

        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
