import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

export const ALL_TRACING_CATEGORIES = [
  { id: 'Lines', title: 'Lines Tracing', icon: 'create-outline' },
  { id: 'Shapes', title: 'Shapes Tracing', icon: 'shapes-outline' },
  { id: 'Letters', title: 'Letters Tracing', icon: 'text-outline' },
  { id: 'Numbers', title: 'Numbers Tracing', icon: 'calculator-outline' },
];

export const ALL_MATCHING_CATEGORIES = [
  { id: 'Matching Fruits', title: 'Fruits Matching', icon: 'nutrition-outline' },
];

export const ALL_BUBBLE_POP_CATEGORIES = [
  { id: 'Free Pop', title: 'Free Pop', icon: 'disc-outline' },
  { id: 'Color Pop', title: 'Color Pop', icon: 'color-palette-outline' },
];

export interface AssignActivitiesModalProps {
  visible: boolean;
  onClose: () => void;
  studentName?: string;
  initialAssignedActivities?: string[];
  onSave: (paths: string[]) => Promise<void>;
  slideAnim: SharedValue<number>;
  isTablet: boolean;
}

export function AssignActivitiesModal({
  visible,
  onClose,
  studentName,
  initialAssignedActivities = [],
  onSave,
  slideAnim,
  isTablet,
}: AssignActivitiesModalProps) {
  const [activeActivityType, setActiveActivityType] = useState('tracing');
  const [selectedActivityPaths, setSelectedActivityPaths] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);



  useEffect(() => {
    if (visible) {
      setSelectedActivityPaths([...initialAssignedActivities]);
      setActiveActivityType('tracing');
    }
  }, [visible, initialAssignedActivities]);

  const toggleSubcategory = (id: string) => {
    setSelectedActivityPaths((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedActivityPaths);
    } finally {
      setIsSaving(false);
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
          className={`bg-white rounded-t-3xl p-6 ${isTablet ? 'h-[80%]' : 'h-[88%]'}`}
        >
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
                Assign Activities
              </Text>
              <Text className={`font-quicksand-medium text-[#6B7280] ${isTablet ? 'text-xl mt-1' : 'text-sm'}`}>
                Student: <Text className="font-quicksand-bold text-[#62A9E6]">{studentName}</Text> ({selectedActivityPaths.length} selected)
              </Text>
            </View>
            <Pressable onPress={onClose} className="p-2">
              <Feather name="x" size={isTablet ? 32 : 24} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Top-Level Activity Types */}
          <View className={`flex-row gap-1.5 my-3 bg-[#F3F4F6] ${isTablet ? 'p-2.5 rounded-3xl' : 'p-1.5 rounded-2xl'}`}>
            {['tracing', 'matching', 'bubble-pop', 'sound'].map((type) => {
              const isSelected = activeActivityType === type;
              const label =
                type === 'tracing'
                  ? 'Tracing'
                  : type === 'matching'
                  ? 'Matching'
                  : type === 'bubble-pop'
                  ? 'Bubble Pop'
                  : 'Sound';
              return (
                <Pressable
                  key={type}
                  onPress={() => {
                    setActiveActivityType(type);
                  }}
                  className={`flex-1 ${isTablet ? 'py-3.5 px-2 rounded-2xl border-b-[4px]' : 'py-2.5 px-1 rounded-xl border-b-[3px]'} items-center justify-center ${
                    isSelected
                      ? 'bg-white border-[#62A9E6]'
                      : 'bg-transparent border-transparent'
                  }`}
                >
                  <Text
                    className={`font-fredoka-regular text-center ${isSelected ? 'text-[#62A9E6]' : 'text-[#6B7280]'} ${isTablet ? 'text-lg' : 'text-xs'}`}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {label}
                    {type === 'sound' && ' (Soon)'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {activeActivityType === 'tracing' || activeActivityType === 'matching' || activeActivityType === 'bubble-pop' ? (
            <ScrollView className="flex-1 mb-4" showsVerticalScrollIndicator={false}>
              <Text className={`font-quicksand-bold text-[#4B5563] px-1 ${isTablet ? 'text-xl mb-4' : 'text-sm mb-3'}`}>
                Tap a category to assign the full set to this student
              </Text>
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {(activeActivityType === 'tracing'
                  ? ALL_TRACING_CATEGORIES
                  : activeActivityType === 'matching'
                  ? ALL_MATCHING_CATEGORIES
                  : ALL_BUBBLE_POP_CATEGORIES
                ).map((cat) => {
                  const isSelected = selectedActivityPaths.includes(cat.id);
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => toggleSubcategory(cat.id)}
                      className={`w-[48%] ${isTablet ? 'p-6 rounded-3xl border-2 border-b-[5px] gap-3' : 'p-4 rounded-2xl border-2 border-b-[4px] gap-2'} items-center justify-center active:border-b-[2px] active:mt-[2px] ${
                        isSelected
                          ? 'bg-[#F0F9FF] border-[#62A9E6] border-b-[#4A90D9]'
                          : 'bg-[#F9FAFB] border-[#E5E7EB] border-b-[#D1D5DB]'
                      }`}
                    >
                      <View
                        className={`rounded-full items-center justify-center ${
                          isTablet ? 'w-16 h-16' : 'w-12 h-12'
                        } ${
                          isSelected ? 'bg-[#DBEAFE]' : 'bg-[#F3F4F6]'
                        }`}
                      >
                        <Ionicons name={cat.icon as any} size={isTablet ? 36 : 26} color={isSelected ? '#62A9E6' : '#9CA3AF'} />
                      </View>
                      <Text
                        className={`font-quicksand-bold text-center ${
                          isTablet ? 'text-xl' : 'text-sm'
                        } ${
                          isSelected ? 'text-[#62A9E6]' : 'text-[#4B5563]'
                        }`}
                      >
                        {cat.title}
                      </Text>
                      {isSelected ? (
                        <View
                          className={`bg-[#62A9E6] rounded-full items-center flex-row ${
                            isTablet ? 'px-3.5 py-1 gap-1.5' : 'px-2.5 py-0.5 gap-1'
                          }`}
                        >
                          <Ionicons name="checkmark" size={isTablet ? 15 : 11} color="white" />
                          <Text className={`text-white font-quicksand-bold ${isTablet ? 'text-sm' : 'text-[10px]'}`}>Assigned</Text>
                        </View>
                      ) : (
                        <View className={`bg-[#F3F4F6] rounded-full ${isTablet ? 'px-3.5 py-1' : 'px-2.5 py-0.5'}`}>
                          <Text className={`text-[#9CA3AF] font-quicksand-bold ${isTablet ? 'text-sm' : 'text-[10px]'}`}>Tap to assign</Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <View className={`flex-1 items-center justify-center ${isTablet ? 'py-16 px-6' : 'py-10 px-4'}`}>
              <View className={`bg-[#F0F9FF] rounded-full items-center justify-center border-2 border-b-[4px] border-[#62A9E6] ${isTablet ? 'w-24 h-24 mb-6' : 'w-16 h-16 mb-4'}`}>
                <Ionicons name="lock-closed" size={isTablet ? 40 : 28} color="#62A9E6" />
              </View>
              <Text className={`font-fredoka-regular text-[#4B5563] text-center ${isTablet ? 'text-2xl mb-2' : 'text-lg mb-1'}`}>
                {activeActivityType.charAt(0).toUpperCase() + activeActivityType.slice(1)} Activities
              </Text>
              <Text className={`font-quicksand-medium text-[#6B7280] text-center ${isTablet ? 'text-lg' : 'text-sm'}`}>
                We are currently developing these games. Stay tuned for updates!
              </Text>
            </View>
          )}

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            className={`w-full flex items-center justify-center border-b-[4px] bg-[#62A9E6] border-[#5298D4] active:mt-[2px] active:border-b-[2px] ${isTablet ? 'h-[64px] rounded-2xl' : 'h-[52px] rounded-xl'}`}
          >
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className={`font-fredoka-regular text-white ${isTablet ? 'text-2xl' : 'text-lg'}`}>
                Save Assigned Activities ({selectedActivityPaths.length})
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}
