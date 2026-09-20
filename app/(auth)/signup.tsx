import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderButton } from "../../components/header-button";
import { supabase } from '../../src/lib/supabase';
import { register } from '../../src/services/auth';

export default function Signup() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)');
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (!router.canGoBack()) {
          router.replace('/(auth)');
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [router])
  );

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [learnerCodes, setLearnerCodes] = useState<string[]>(['']);

  // ui states
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordBlurred, setPasswordBlurred] = useState(false);
  const [confirmPasswordBlurred, setConfirmPasswordBlurred] = useState(false);

  // check if password is strong (regex)
  // checklist: 8+ chars, 1 upper, 1 lower, 1 number
  const isStrongPassword = (password: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  };

  const isPasswordInvalid = passwordBlurred && password.length > 0 && !isStrongPassword(password);
  const isConfirmPasswordInvalid = confirmPasswordBlurred && confirmPassword.length > 0 && confirmPassword !== password;

  const handleLearnerCodeChange = (text: string, index: number) => {
    const updated = [...learnerCodes];
    updated[index] = text.toUpperCase();
    setLearnerCodes(updated);
  };

  const handleAddLearnerCodeField = () => {
    setLearnerCodes([...learnerCodes, '']);
  };

  const handleRemoveLearnerCodeField = (index: number) => {
    if (learnerCodes.length <= 1) return;
    setLearnerCodes(learnerCodes.filter((_, i) => i !== index));
  };

  // registration details -> database
  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Missing Information', 'Please fill out all fields to register.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Password and Confirm Password do not match.');
      return;
    }

    const validCodes = learnerCodes
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    // parents must provide their child's learner code to register
    if (role === 'parent' && validCodes.length === 0) {
      Alert.alert('Learner Code Required', "Please enter at least one learner code (e.g. AUT-0001) to continue.");
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
    if (role === 'teacher') {
      router.push({
        pathname: '/(auth)/teacher-verification',
        params: {
          firstName,
          lastName,
          email,
          password,
          goals: params.goals,
          role,
        }
      });
      return;
    }

    setIsLoading(true);

    try {
      const signUpResult = await register(email, password, firstName, lastName, userGoals, role, validCodes);

      // Parents do not need verification, set is_verified to true immediately
      if (role === 'parent' && signUpResult?.user) {
        await supabase
          .from('profiles')
          .update({ is_verified: true })
          .eq('id', signUpResult.user.id);
      }
      router.replace({
        pathname: (role === 'parent' ? '/(parent-tabs)' : '/(teacher-tabs)') as any,
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          {/* back btn */}
          <View className={`w-full pt-4 pb-2 ${isTablet ? 'px-8' : 'px-6'}`}>
            <HeaderButton
              onPress={handleBack}
              icon={
                <View style={{ marginLeft: -3, marginTop: -1 }}>
                  <Ionicons name="caret-back" size={isTablet ? 30 : 24} color="#62A9E6" />
                </View>
              }
            />
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* main container */}
            <View
              className={`flex-1 flex-col items-center w-full ${isTablet ? 'px-[94px] pt-12 pb-[78px]' : 'px-6 pt-4 pb-8'
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
                  className={`w-full border-[2px] justify-center bg-[#F1F1F1] ${isTablet ? 'h-[76px] rounded-xl px-8' : 'h-[60px] rounded-xl px-6'
                    }`}
                  style={{
                    borderColor: focusedInput === 'firstName' ? '#62A9E6' : '#F1F1F1',
                  }}
                >
                  <TextInput
                    className={`font-quicksand-medium text-[#4B5563] w-full h-full py-1 ${isTablet ? 'text-[24px]' : 'text-[18px]'
                      }`}
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
                  className={`w-full border-[2px] justify-center bg-[#F1F1F1] ${isTablet ? 'h-[76px] rounded-xl px-8' : 'h-[60px] rounded-xl px-6'
                    }`}
                  style={{
                    borderColor: focusedInput === 'lastName' ? '#62A9E6' : '#F1F1F1',
                  }}
                >
                  <TextInput
                    className={`font-quicksand-medium text-[#4B5563] w-full h-full py-1 ${isTablet ? 'text-[24px]' : 'text-[18px]'
                      }`}
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
                  className={`w-full border-[2px] justify-center bg-[#F1F1F1] ${isTablet ? 'h-[76px] rounded-xl px-8' : 'h-[60px] rounded-xl px-6'
                    }`}
                  style={{
                    borderColor: focusedInput === 'email' ? '#62A9E6' : '#F1F1F1',
                  }}
                >
                  <TextInput
                    className={`font-quicksand-medium text-[#4B5563] w-full h-full py-1 ${isTablet ? 'text-[24px]' : 'text-[18px]'
                      }`}
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
                  className={`w-full border-[2px] flex-row items-center justify-between bg-[#F1F1F1] ${isTablet ? 'h-[76px] rounded-xl px-8' : 'h-[60px] rounded-xl px-6'
                    }`}
                  style={{
                    borderColor: focusedInput === 'password'
                      ? '#62A9E6'
                      : isPasswordInvalid
                        ? '#F43F5E'
                        : '#F1F1F1',
                  }}
                >
                  <TextInput
                    className={`font-quicksand-medium text-[#4B5563] flex-1 h-full py-1 ${isTablet ? 'text-[24px]' : 'text-[18px]'
                      }`}
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => {
                      setFocusedInput(null);
                      if (password.length > 0) {
                        setPasswordBlurred(true);
                      }
                    }}
                    secureTextEntry={!showPassword}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2">
                    <Feather name={showPassword ? "eye" : "eye-off"} size={isTablet ? 24 : 20} color="#9CA3AF" />
                  </Pressable>
                </View>

                {/* password reqs - shown directly below password input field if invalid after blur */}
                {isPasswordInvalid && (
                  <Text
                    className={`font-quicksand-medium text-[#F43F5E] text-left px-2 -mt-2 ${isTablet ? "text-base" : "text-xs"
                      }`}
                  >
                    Must be at least 8 characters with uppercase, lowercase, and number.
                  </Text>
                )}

                {/* confirm password */}
                <View
                  className={`w-full border-[2px] flex-row items-center justify-between bg-[#F1F1F1] ${isTablet ? 'h-[76px] rounded-xl px-8' : 'h-[60px] rounded-xl px-6'
                    }`}
                  style={{
                    borderColor: focusedInput === 'confirmPassword'
                      ? '#62A9E6'
                      : isConfirmPasswordInvalid
                        ? '#F43F5E'
                        : '#F1F1F1',
                  }}
                >
                  <TextInput
                    className={`font-quicksand-medium text-[#4B5563] flex-1 h-full py-1 ${isTablet ? 'text-[24px]' : 'text-[18px]'
                      }`}
                    placeholder="Confirm password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setFocusedInput('confirmPassword')}
                    onBlur={() => {
                      setFocusedInput(null);
                      if (confirmPassword.length > 0) {
                        setConfirmPasswordBlurred(true);
                      }
                    }}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-2">
                    <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={isTablet ? 24 : 20} color="#9CA3AF" />
                  </Pressable>
                </View>

                {/* confirm password error - shown directly below confirm password input field if mismatch after blur */}
                {isConfirmPasswordInvalid && (
                  <Text
                    className={`font-quicksand-medium text-[#F43F5E] text-left px-2 -mt-2 ${isTablet ? "text-base" : "text-xs"
                      }`}
                  >
                    Passwords do not match.
                  </Text>
                )}

                {/* learner codes (parents only) */}
                {role === 'parent' && (
                  <View className="w-full flex-col gap-2.5">
                    <View className="flex-row items-center justify-between px-1">
                      <Text className={`font-fredoka-one text-xs text-[#9CA3AF] uppercase ${isTablet ? 'text-sm' : 'text-xs'}`}>
                        Learner Code(s)
                      </Text>
                      <Text className="font-quicksand-medium text-xs text-[#9CA3AF]">
                        {learnerCodes.length} {learnerCodes.length === 1 ? 'Child' : 'Children'}
                      </Text>
                    </View>

                    {learnerCodes.map((code, index) => {
                      const inputId = `learnerCode_${index}`;
                      return (
                        <View key={index} className="flex-row items-center gap-2">
                          <View
                            className={`flex-1 border-[2px] justify-center bg-[#F1F1F1] ${
                              isTablet ? 'h-[76px] rounded-xl px-8' : 'h-[60px] rounded-xl px-6'
                            }`}
                            style={{
                              borderColor: focusedInput === inputId ? '#62A9E6' : '#F1F1F1',
                            }}
                          >
                            <TextInput
                              className={`font-quicksand-medium text-[#4B5563] w-full h-full py-1 ${
                                isTablet ? 'text-[24px]' : 'text-[18px]'
                              }`}
                              placeholder={
                                learnerCodes.length > 1
                                  ? `Learner code #${index + 1}`
                                  : "Learner code (e.g. AUT-0001)"
                              }
                              placeholderTextColor="#9CA3AF"
                              value={code}
                              onChangeText={(text) => handleLearnerCodeChange(text, index)}
                              onFocus={() => setFocusedInput(inputId)}
                              onBlur={() => setFocusedInput(null)}
                              autoCapitalize="characters"
                            />
                          </View>

                          {/* Remove button if more than 1 code field */}
                          {learnerCodes.length > 1 && (
                            <Pressable
                              onPress={() => handleRemoveLearnerCodeField(index)}
                              className={`items-center justify-center rounded-xl bg-[#FFF5F5] border border-[#FFDBD4] active:scale-95 transition-transform ${
                                isTablet ? 'w-14 h-[76px]' : 'w-12 h-[60px]'
                              }`}
                            >
                              <Feather name="trash-2" size={isTablet ? 22 : 18} color="#FF8870" />
                            </Pressable>
                          )}
                        </View>
                      );
                    })}

                    {/* Add Another Child Code Button */}
                    <Pressable
                      onPress={handleAddLearnerCodeField}
                      className="self-start flex-row items-center gap-1.5 bg-white border-[2px] border-[#BBE8FB] px-3.5 py-2 rounded-xl active:scale-95 transition-transform mt-0.5"
                      style={{
                        borderColor: '#BBE8FB',
                        shadowColor: '#BBE8FB',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 1,
                        shadowRadius: 0,
                        elevation: 2,
                      }}
                    >
                      <Feather name="plus" size={15} color="#62A9E6" />
                      <Text className="font-fredoka-one text-[#62A9E6] text-xs uppercase">
                        + Add Another Child Code
                      </Text>
                    </Pressable>

                    <Text
                      className={`w-full font-quicksand-medium text-[#9CA3AF] text-left px-1 mt-0.5 ${
                        isTablet ? 'text-base' : 'text-xs'
                      }`}
                    >
                      Ask each child's teacher for their unique learner code.
                    </Text>
                  </View>
                )}
              </View>

              {/* register btn */}
              <View className={`w-full ${isTablet ? 'mt-8' : 'mt-6'}`}>
                <Pressable
                  onPress={handleRegister}
                  disabled={isLoading}
                  className={`w-full bg-white border-[2px] rounded-xl items-center justify-center active:scale-95 transition-transform ${isTablet ? 'h-[76px]' : 'h-[60px]'
                    }`}
                  style={{
                    borderColor: '#BBE8FB',
                    shadowColor: '#BBE8FB',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 2,
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#62A9E6" />
                  ) : (
                    <Text
                      className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-2xl' : 'text-lg'
                        }`}
                    >
                      {role === 'teacher' ? 'NEXT' : 'REGISTER'}
                    </Text>
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
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}