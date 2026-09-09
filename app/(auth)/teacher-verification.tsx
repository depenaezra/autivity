import { Feather, Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
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

// Helper to decode base64 string to ArrayBuffer in React Native
const decodeBase64 = (base64: string): ArrayBuffer => {
  const cleanBase64 = base64.replace(/\s/g, '');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  let bufferLength = cleanBase64.length * 0.75;
  if (cleanBase64.endsWith('==')) {
    bufferLength -= 2;
  } else if (cleanBase64.endsWith('=')) {
    bufferLength -= 1;
  }
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);

  let p = 0;
  for (let i = 0; i < cleanBase64.length; i += 4) {
    const encoded1 = lookup[cleanBase64.charCodeAt(i)];
    const encoded2 = lookup[cleanBase64.charCodeAt(i + 1)];
    const encoded3 = lookup[cleanBase64.charCodeAt(i + 2)];
    const encoded4 = lookup[cleanBase64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (p < bufferLength) {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (p < bufferLength) {
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
  }

  return arrayBuffer;
};

interface SelectedImage {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

export default function TeacherVerification() {
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
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  // UI states
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'image/webp'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileName = file.name || '';
        const fileMime = (file.mimeType || '').toLowerCase();
        const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

        const isValidType = allowedMimeTypes.includes(fileMime) || allowedExtensions.includes(fileExt);

        if (!isValidType) {
          Alert.alert(
            'Invalid File Type',
            'Only JPEG, PNG, and WEBP file types are accepted.'
          );
          return;
        }

        const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
        if (file.size && file.size > MAX_SIZE_BYTES) {
          Alert.alert(
            'File Too Large',
            'The selected file exceeds the 5MB size limit. Please upload a smaller image.'
          );
          return;
        }

        setSelectedImage({
          uri: file.uri,
          name: fileName || 'id_image.png',
          mimeType: fileMime || 'image/png',
          size: file.size,
        });
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to pick image file. Please try again.');
    }
  };

  const handleRegister = async () => {
    if (!institution || !prcNumber || !selectedImage) {
      Alert.alert('Missing Information', 'Please fill out all fields and upload your ID image to register.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Register the user
      const signUpResult = await register(email, password, firstName, lastName, userGoals, role, institution, prcNumber);

      let idImageUrl: string | null = null;

      if (signUpResult?.user) {
        // 2. Upload the ID image to Supabase Storage bucket 'teacher-ids'
        try {
          const base64 = await FileSystem.readAsStringAsync(selectedImage.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const arrayBuffer = decodeBase64(base64);
          const uniqueFilePath = `${signUpResult.user.id}/${Date.now()}_${selectedImage.name}`;

          const { error: uploadError } = await supabase.storage
            .from('teacher-ids')
            .upload(uniqueFilePath, arrayBuffer, {
              contentType: selectedImage.mimeType,
              upsert: true,
            });

          if (uploadError) {
            throw new Error(`ID image upload failed: ${uploadError.message}`);
          }

          const { data: publicUrlData } = supabase.storage
            .from('teacher-ids')
            .getPublicUrl(uniqueFilePath);

          idImageUrl = publicUrlData.publicUrl;
        } catch (uploadErr: any) {
          Alert.alert('Upload Failed', uploadErr.message || 'Failed to upload ID image.');
          setIsLoading(false);
          return;
        }

        // 3. Upsert into profiles table with id_image_url
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
            id_image_url: idImageUrl,
            is_verified: false,
          });

        if (profileError) {
          console.error('Error saving profile details:', profileError.message);
          throw new Error(profileError.message);
        }
      }

      // 4. Sign out immediately to clear the auto-logged in session
      await supabase.auth.signOut();

      Alert.alert(
        'Upload Successful',
        'Your ID image was uploaded successfully and your account has been submitted for verification.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/pending-verification'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

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
              className={`flex-1 flex-col items-center w-full ${isTablet ? 'px-[94px] pt-12 pb-[78px]' : 'px-6 pt-8 pb-8'
                }`}
            >
              {/* title */}
              <Text
                className={`font-fredoka-one text-[#4B5563] text-center ${isTablet ? 'text-5xl mb-4' : 'text-3xl mb-2'
                  }`}
              >
                Verification
              </Text>

              {/* subtitle */}
              <Text
                className={`font-quicksand-medium text-[#6B7280] text-center mb-8 ${isTablet ? 'text-2xl' : 'text-base'
                  }`}
              >
                Provide your details to complete your registration
              </Text>

              {/* form container */}
              <View className="w-full flex-col gap-4">

                {/* institution */}
                <View
                  className={`w-full border-[2px] justify-center bg-[#F1F1F1] ${isTablet ? 'h-[76px] rounded-xl px-8' : 'h-[60px] rounded-xl px-6'
                    }`}
                  style={{
                    borderColor: focusedInput === 'institution' ? '#62A9E6' : '#F1F1F1',
                  }}
                >
                  <TextInput
                    className={`font-quicksand-medium text-[#4B5563] w-full h-full py-1 ${isTablet ? 'text-[24px]' : 'text-[18px]'
                      }`}
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
                    className={`w-full border-[2px] justify-center bg-[#F1F1F1] ${isTablet ? 'h-[76px] rounded-xl px-8' : 'h-[60px] rounded-xl px-6'
                      }`}
                    style={{
                      borderColor: focusedInput === 'prcNumber' ? '#62A9E6' : '#F1F1F1',
                    }}
                  >
                    <TextInput
                      className={`font-quicksand-medium text-[#4B5563] w-full h-full py-1 ${isTablet ? 'text-[24px]' : 'text-[18px]'
                        }`}
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
                    className={`text-[#9CA3AF] font-quicksand-medium px-2 mt-2 ${isTablet ? "text-base" : "text-xs"
                      }`}
                  >
                    For verification purposes only. Your information will remain strictly confidential.
                  </Text>
                </View>

                {/* ID Image Upload Field */}
                <View className="w-full flex-col">
                  <Pressable
                    onPress={handlePickImage}
                    className={`w-full border-[2px] flex-row items-center justify-between ${isTablet ? 'h-[76px] rounded-xl px-8' : 'h-[60px] rounded-xl px-6'
                      }`}
                    style={{
                      backgroundColor: selectedImage ? '#F0F7FF' : '#F1F1F1',
                      borderColor: selectedImage ? '#62A9E6' : '#F1F1F1',
                    }}
                  >
                    <View className="flex-row items-center gap-3 flex-1 mr-2">
                      <Feather
                        name={selectedImage ? "check-circle" : "upload-cloud"}
                        size={isTablet ? 28 : 22}
                        color={selectedImage ? "#62A9E6" : "#9CA3AF"}
                      />
                      <Text
                        numberOfLines={1}
                        className={`font-quicksand-medium flex-1 ${selectedImage ? 'text-[#3B82F6]' : 'text-[#9CA3AF]'
                          } ${isTablet ? 'text-[24px]' : 'text-[18px]'}`}
                      >
                        {selectedImage ? selectedImage.name : 'Upload ID Image'}
                      </Text>
                    </View>
                    {selectedImage ? (
                      <Pressable onPress={() => setSelectedImage(null)} className="p-1">
                        <Feather name="x" size={isTablet ? 24 : 20} color="#9CA3AF" />
                      </Pressable>
                    ) : (
                      <Feather name="image" size={isTablet ? 24 : 20} color="#9CA3AF" />
                    )}
                  </Pressable>
                  <Text
                    className={`text-[#9CA3AF] font-quicksand-medium px-2 mt-2 ${isTablet ? "text-base" : "text-xs"
                      }`}
                  >
                    Accepted file types: JPEG, PNG, and WEBP. Maximum file size: 5MB.
                  </Text>
                </View>

              </View>

              {/* register btn */}
              <View className={`w-full ${isTablet ? 'mt-10' : 'mt-8'}`}>
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
                      REGISTER
                    </Text>
                  )}
                </Pressable>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
