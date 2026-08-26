import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface StudentProfileActionsProps {
  onSwitchStudent: () => void;
  isTablet?: boolean;
}

export function StudentProfileActions({
  onSwitchStudent,
  isTablet = false,
}: StudentProfileActionsProps) {
  return (
    <View className="w-full mb-8">
      <Pressable
        onPress={onSwitchStudent}
        className={`w-full bg-white border-[2px] rounded-[12px] justify-center items-center active:scale-95 transition-transform ${
          isTablet ? 'py-4' : 'py-3'
        }`}
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#BBE8FB',
          shadowColor: '#BBE8FB',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 2,
        }}
      >
        <Text
          className={`font-fredoka-one text-[#62A9E6] uppercase ${
            isTablet ? 'text-lg' : 'text-base'
          }`}
        >
          SWITCH STUDENT
        </Text>
      </Pressable>
    </View>
  );
}
