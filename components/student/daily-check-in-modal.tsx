import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { HeaderButton } from '../header-button';

export interface EmotionOption {
  id: string;
  label: string;
  tagalogLabel: string;
  image: any;
}

export const EMOTION_OPTIONS: EmotionOption[] = [
  {
    id: 'happy',
    label: 'HAPPY',
    tagalogLabel: 'Masaya',
    image: require('@/assets/images/student/emotions/happy.gif'),
  },
  {
    id: 'calm',
    label: 'CALM',
    tagalogLabel: 'Kalmado',
    image: require('@/assets/images/student/emotions/calm.gif'),
  },
  {
    id: 'excited',
    label: 'EXCITED',
    tagalogLabel: 'Masigla',
    image: require('@/assets/images/student/emotions/excited.gif'),
  },
  {
    id: 'tired',
    label: 'TIRED',
    tagalogLabel: 'Pagod',
    image: require('@/assets/images/student/emotions/tired.gif'),
  },
  {
    id: 'sad',
    label: 'SAD',
    tagalogLabel: 'Malungkot',
    image: require('@/assets/images/student/emotions/sad.gif'),
  },
  {
    id: 'nervous',
    label: 'NERVOUS',
    tagalogLabel: 'Kinakabahan',
    image: require('@/assets/images/student/emotions/nervous.gif'),
  },
];

interface DailyCheckInModalProps {
  visible: boolean;
  studentName?: string;
  onConfirm: (selectedEmotion: string) => Promise<void> | void;
  onBackPress?: () => void;
  onClose?: () => void;
  isSubmitting?: boolean;
}

export function DailyCheckInModal({
  visible,
  studentName,
  onConfirm,
  onBackPress,
  onClose,
  isSubmitting = false,
}: DailyCheckInModalProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const insets = useSafeAreaInsets();

  // Extract first name only
  const firstName = studentName ? studentName.trim().split(' ')[0].toUpperCase() : '';

  // Safe padding for hardware status bar & bottom gesture/nav bar
  const topPadding = Math.max(insets.top + 8, 36);
  const bottomPadding = Math.max(insets.bottom + 12, 24);

  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [isSuccessStep, setIsSuccessStep] = useState(false);

  if (!visible) return null;

  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedEmotion((prev) => (prev === id ? null : id));
  };

  const handleConfirmPress = async () => {
    if (!selectedEmotion || isSubmitting) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await onConfirm(selectedEmotion);
      setIsSuccessStep(true);
    } catch (err) {
      console.error('Check-in error:', err);
    }
  };

  const handleDismissCelebration = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSuccessStep(false);
    onClose?.();
  };

  const matchedEmotion = EMOTION_OPTIONS.find((e) => e.id === selectedEmotion);
  const handleBack = onBackPress || onClose;

  return (
    <Modal visible={visible} animationType="fade" transparent={false} statusBarTranslucent>
      <View
        className="flex-1 bg-[#F5F7FA]"
        style={{
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
        }}
      >
        {isSuccessStep ? (
          /* SUCCESS CELEBRATION CARD */
          <View className="flex-1 justify-center items-center px-6">
            <View
              className="bg-white rounded-[32px] border-[4px] border-[#BBE8FB] p-6 md:p-10 items-center max-w-[520px] w-full"
              style={{
                shadowColor: '#BBE8FB',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 6,
              }}
            >
              <Text className="font-fredoka-one text-2xl md:text-4xl text-[#62A9E6] text-center tracking-wide mb-2">
                SALAMAT{firstName ? `, ${firstName}` : ''}! 🎉
              </Text>

              <Text className="font-quicksand-medium text-base md:text-xl text-[#6B7280] text-center mb-6">
                Thank you for sharing how you feel today!
              </Text>

              {matchedEmotion && (
                <View className="bg-[#EBF5FF] border-[3px] border-[#62A9E6] rounded-[28px] p-6 items-center mb-6 w-[200px] h-[200px] justify-center">
                  <ExpoImage
                    source={matchedEmotion.image}
                    autoplay={true}
                    style={{ width: 100, height: 100 }}
                    contentFit="contain"
                  />
                  <Text className="font-fredoka-one text-xl text-[#62A9E6] mt-2">
                    {matchedEmotion.label}
                  </Text>
                  <Text className="font-quicksand-medium text-base text-[#62A9E6]">
                    {matchedEmotion.tagalogLabel}
                  </Text>
                </View>
              )}

              <Pressable
                onPress={handleDismissCelebration}
                className="w-full py-4 rounded-[8px] border-[2px] border-[#BBE8FB] items-center justify-center bg-white active:scale-95 transition-transform"
                style={{
                  shadowColor: '#BBE8FB',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                <Text className="font-fredoka-one text-[#62A9E6] text-base md:text-xl uppercase tracking-wider">
                  CONTINUE TO APP ✨
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          /* EMOTION SELECTION VIEW */
          <View className="flex-1 px-4 justify-between items-center max-w-[900px] w-full self-center">
            
            {/* Top Row: Back Button on left */}
            <View className="w-full flex-row items-center justify-between mb-1">
              {handleBack ? (
                <HeaderButton
                  onPress={handleBack}
                  icon={
                    <View style={{ marginLeft: -3, marginTop: -1 }}>
                      <Ionicons name="caret-back" size={isTablet ? 30 : 24} color="#62A9E6" />
                    </View>
                  }
                />
              ) : (
                <View style={{ width: 44 }} />
              )}
              <View style={{ width: 44 }} />
            </View>

            {/* Centered Title & Subtitle Below Back Button */}
            <View className="w-full px-2 items-center mb-3">
              <Text className="font-fredoka-one text-2xl md:text-4xl text-[#484A4B] text-center tracking-wide">
                HOW ARE YOU FEELING TODAY{firstName ? `, ${firstName}` : ''}?
              </Text>
              <Text className="font-quicksand-medium text-base md:text-xl text-[#6B7280] text-center mt-1.5">
                Select how you feel right now, then press confirm!
              </Text>
            </View>

            {/* 6 Emotion Cards Grid */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 8,
              }}
              className="w-full"
            >
              <View className="flex-row flex-wrap justify-center items-center gap-4 md:gap-7 w-full">
                {EMOTION_OPTIONS.map((item) => {
                  const isSelected = selectedEmotion === item.id;

                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => handleSelect(item.id)}
                      className={`items-center justify-center p-3 md:p-5 rounded-[20px] md:rounded-[28px] transition-transform active:scale-95 ${
                        isSelected
                          ? 'bg-[#EBF5FF] border-[4px] border-[#62A9E6]'
                          : 'bg-white border-[3px] border-[#D1D5DB]'
                      }`}
                      style={{
                        width: isTablet ? 210 : 148,
                        height: isTablet ? 210 : 160,
                        shadowColor: isSelected ? '#62A9E6' : '#D1D5DB',
                        shadowOffset: { width: 0, height: isSelected ? 4 : 3 },
                        shadowOpacity: 1,
                        shadowRadius: 0,
                        elevation: 3,
                      }}
                    >
                      <ExpoImage
                        source={item.image}
                        autoplay={isSelected}
                        style={{
                          width: isTablet ? 110 : 75,
                          height: isTablet ? 110 : 75,
                        }}
                        contentFit="contain"
                      />

                      {/* English Label */}
                      <Text
                        className={`font-fredoka-one text-base md:text-xl mt-1.5 text-center tracking-wider ${
                          isSelected ? 'text-[#62A9E6]' : 'text-[#484A4B]'
                        }`}
                      >
                        {item.label}
                      </Text>

                      {/* Tagalog Translation Subtitle */}
                      <Text
                        className={`font-quicksand-medium text-xs md:text-base text-center ${
                          isSelected ? 'text-[#62A9E6]' : 'text-[#9CA3AF]'
                        }`}
                      >
                        {item.tagalogLabel}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Bottom Confirm Button */}
            <View className="w-full pt-3 items-center">
              <Pressable
                onPress={handleConfirmPress}
                disabled={!selectedEmotion || isSubmitting}
                className="w-full max-w-[420px] py-4 rounded-[8px] border-[2px] items-center justify-center bg-white active:scale-95 transition-transform"
                style={{
                  borderColor: selectedEmotion && !isSubmitting ? '#BBE8FB' : '#F1F1F1',
                  shadowColor: selectedEmotion && !isSubmitting ? '#BBE8FB' : '#F1F1F1',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#62A9E6" />
                ) : (
                  <Text
                    className="font-fredoka-one text-base md:text-lg uppercase tracking-wider"
                    style={{ color: selectedEmotion ? '#62A9E6' : '#D9D9D9' }}
                  >
                    CONFIRM SELECTION
                  </Text>
                )}
              </Pressable>
            </View>

          </View>
        )}
      </View>
    </Modal>
  );
}
