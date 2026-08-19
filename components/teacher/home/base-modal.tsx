import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  PanResponder,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title: React.ReactNode;
  isTablet: boolean;
  onSubmit?: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  isSubmitting?: boolean;
  cancelLabel?: string;
  children: React.ReactNode;
  heightClassName?: string;
}

export function BaseModal({
  visible,
  onClose,
  title,
  isTablet,
  onSubmit,
  submitLabel = 'SAVE',
  submitDisabled = false,
  isSubmitting = false,
  cancelLabel = 'CANCEL',
  children,
  heightClassName,
}: BaseModalProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const slideAnim = useSharedValue(600);

  // Pan responder for drag to close gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.value = gestureState.dy;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120) {
          slideAnim.value = withTiming(600, {
            duration: 200,
            easing: Easing.in(Easing.quad),
          }, (finished) => {
            if (finished) {
              runOnJS(onClose)();
            }
          });
        } else {
          slideAnim.value = withTiming(0, {
            duration: 200,
            easing: Easing.out(Easing.quad),
          });
        }
      },
    })
  ).current;

  // Synchronize internal rendering state with animation timing
  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      slideAnim.value = 600;
      slideAnim.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.quad),
      });
    } else {
      slideAnim.value = withTiming(600, {
        duration: 200,
        easing: Easing.in(Easing.quad),
      }, (finished) => {
        if (finished) {
          runOnJS(setShouldRender)(false);
        }
      });
    }
  }, [visible, slideAnim]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: slideAnim.value }],
    };
  });

  if (!shouldRender) return null;

  const defaultHeightClass = isTablet ? 'h-[52%]' : 'h-[60%]';
  const finalHeightClass = heightClassName || defaultHeightClass;

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-black/40"
      >
        {/* Backdrop overlay */}
        <Pressable className="flex-1" onPress={onClose} />

        {/* Modal Container */}
        <Animated.View
          style={animatedStyle}
          className={`bg-white border-[4px] border-[#F1F1F1] rounded-[32px] px-6 pt-2 pb-6 mx-6 mb-6 ${finalHeightClass}`}
        >
          {/* Top handle bar (Draggable to close) */}
          <View 
            {...panResponder.panHandlers}
            className="w-full py-3 items-center"
          >
            <View className="w-12 h-1.5 rounded-full bg-[#E5E7EB]" />
          </View>

          {/* Centered Title */}
          <Text className="font-fredoka-one text-[24px] text-[#484A4B] text-center mb-6">
            {title}
          </Text>

          {/* Form Content area */}
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {children}
          </ScrollView>

          {/* Action Buttons Footer */}
          <View className="flex-row gap-4 mt-4">
            {/* Cancel Button */}
            <Pressable
              onPress={onClose}
              className={`flex-1 py-4 border-[2px] border-[#F1F1F1] rounded-[8px] items-center justify-center bg-white active:scale-95 transition-transform`}
              style={{
                shadowColor: '#F1F1F1',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              <Text className="font-fredoka-one text-[#9CA3AF] text-base">
                {cancelLabel}
              </Text>
            </Pressable>

            {/* Submit / Save Button */}
            {onSubmit && (
              <Pressable
                onPress={onSubmit}
                disabled={submitDisabled || isSubmitting}
                className={`flex-1 py-4 border-[2px] rounded-[8px] items-center justify-center bg-white active:scale-95 transition-transform`}
                style={{
                  borderColor: submitDisabled ? '#F1F1F1' : '#BBE8FB',
                  shadowColor: submitDisabled ? '#F1F1F1' : '#BBE8FB',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#62A9E6" />
                ) : (
                  <Text className="font-fredoka-one text-base" style={{ color: submitDisabled ? '#D9D9D9' : '#62A9E6' }}>
                    {submitLabel}
                  </Text>
                )}
              </Pressable>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}


