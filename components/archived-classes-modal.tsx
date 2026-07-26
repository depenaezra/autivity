import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';

export interface ArchivedClassesModalProps {
  visible: boolean;
  onClose: () => void;
  archivedClasses: any[];
  onUnarchive: (classId: string) => Promise<void>;
  slideAnim: SharedValue<number>;
  isTablet: boolean;
}

export function ArchivedClassesModal({
  visible,
  onClose,
  archivedClasses = [],
  onUnarchive,
  slideAnim,
  isTablet,
}: ArchivedClassesModalProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleUnarchive = async (classId: string) => {
    setLoadingStates((prev) => ({ ...prev, [classId]: true }));
    try {
      await onUnarchive(classId);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [classId]: false }));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
          className={`bg-white rounded-t-3xl p-6 ${isTablet ? 'h-[50%]' : 'h-[60%]'}`}
        >
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
                Archived Classes
              </Text>
              <Text className={`font-quicksand-medium text-[#6B7280] ${isTablet ? 'text-xl mt-1' : 'text-sm'}`}>
                Archived: <Text className="font-quicksand-bold text-[#62A9E6]">{archivedClasses.length}</Text>
              </Text>
            </View>
            <Pressable onPress={onClose} className="p-2">
              <Feather name="x" size={isTablet ? 32 : 24} color="#9CA3AF" />
            </Pressable>
          </View>

          <ScrollView className="flex-1 mb-4" showsVerticalScrollIndicator={false}>
            {archivedClasses.length === 0 ? (
              <View className="py-8 items-center justify-center">
                <Ionicons name="archive-outline" size={isTablet ? 56 : 40} color="#9CA3AF" />
                <Text className={`font-quicksand-medium text-[#9CA3AF] text-center mt-2 ${isTablet ? 'text-xl' : 'text-base'}`}>
                  No archived classes.
                </Text>
              </View>
            ) : (
              archivedClasses.map((item) => {
                const isUnarchiving = !!loadingStates[item.id];
                return (
                  <View
                    key={item.id}
                    className={`flex-row items-center justify-between border border-[#E5E7EB] bg-[#F9FAFB] ${
                      isTablet ? 'p-5 rounded-3xl mb-4' : 'p-3.5 rounded-2xl mb-3'
                    }`}
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className={`rounded-full items-center justify-center ${
                          isTablet ? 'w-12 h-12' : 'w-9 h-9'
                        }`}
                        style={{ backgroundColor: `${item.themeColor}20` }}
                      >
                        <Ionicons name="school" size={isTablet ? 24 : 18} color={item.themeColor} />
                      </View>
                      <View>
                        <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-lg' : 'text-sm'}`}>
                          {item.title}
                        </Text>
                        <Text className={`font-quicksand-medium text-[#6B7280] ${isTablet ? 'text-sm mt-0.5' : 'text-xs'}`}>
                          {item.level}
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => handleUnarchive(item.id)}
                      disabled={isUnarchiving}
                      className={`bg-[#EBF5FF] border border-[#9ACBF9] flex items-center justify-center ${
                        isTablet ? 'px-6 py-2.5 rounded-full' : 'px-4 py-2 rounded-full'
                      }`}
                    >
                      {isUnarchiving ? (
                        <ActivityIndicator size="small" color="#62A9E6" />
                      ) : (
                        <Text className={`font-quicksand-bold text-[#62A9E6] ${isTablet ? 'text-base' : 'text-xs'}`}>
                          Unarchive
                        </Text>
                      )}
                    </Pressable>
                  </View>
                );
              })
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
