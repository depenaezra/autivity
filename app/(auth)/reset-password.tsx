import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

export default function ResetPassword() {
  const router = useRouter();
  const { email: emailParam } = useLocalSearchParams();

  const [email] = useState((emailParam as string) || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Missing Email', 'Email is missing. Please restart the forgot password process.');
      return;
    }
    if (!code) {
      Alert.alert('Missing Code', 'Please enter the code sent to your email.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      Alert.alert('Missing Information', 'Please fill in both password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'Password should be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: I-verify yung code na tina-type ng user
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'recovery',
      });

      if (verifyError) throw verifyError;

      // Step 2: Pagkatapos ma-verify (may session na ngayon), i-update ang password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      Alert.alert('Success', 'Your password has been updated. Please log in.');
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid or expired code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-[#F5F8FA] px-6">
      <Text className="font-fredoka-one text-3xl text-[#4B5563] mb-2">Enter Code</Text>
      <Text className="font-quicksand-medium text-[#9CA3AF] text-center mb-6">
        We sent a 6-digit code to {email || 'your email'}
      </Text>

      <TextInput
        className="w-full h-[60px] border-[2px] border-[#E5E7EB] rounded-full px-6 mb-4 font-quicksand-medium text-[#4B5563] text-[18px] text-center tracking-widest"
        placeholder="000000"
        placeholderTextColor="#9CA3AF"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
      />

      <TextInput
        className="w-full h-[60px] border-[2px] border-[#E5E7EB] rounded-full px-6 mb-4 font-quicksand-medium text-[#4B5563] text-[18px]"
        placeholder="New password"
        placeholderTextColor="#9CA3AF"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <TextInput
        className="w-full h-[60px] border-[2px] border-[#E5E7EB] rounded-full px-6 mb-6 font-quicksand-medium text-[#4B5563] text-[18px]"
        placeholder="Confirm new password"
        placeholderTextColor="#9CA3AF"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Pressable
        onPress={handleResetPassword}
        disabled={isLoading}
        className={`w-full bg-[#62A9E6] h-[60px] rounded-full items-center justify-center border-b-[4px] border-[#5298D4] ${isLoading ? 'opacity-70' : 'opacity-100'}`}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-fredoka-regular text-lg">Reset Password</Text>
        )}
      </Pressable>
    </View>
  );
}