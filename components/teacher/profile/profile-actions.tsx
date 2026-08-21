import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface ProfileActionsProps {
  isTablet?: boolean;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export function ProfileActions({
  isTablet = false,
  onLogout,
  onDeleteAccount,
}: ProfileActionsProps) {
  return (
    <View className={`w-full mb-8 ${isTablet ? 'gap-y-4' : 'gap-y-3'}`}>
      {/* Log Out Button */}
      <Pressable
        onPress={onLogout}
        className={`w-full bg-white border-[2px] rounded-[12px] justify-center items-center active:scale-95 transition-transform ${
          isTablet ? 'py-4' : 'py-3'
        }`}
        style={{
          borderColor: '#FECDD3', // Rose 200 (same shade as mistakes card in overview-cards)
          shadowColor: '#FECDD3',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 2,
        }}
      >
        <Text
          className={`font-fredoka-one text-[#F43F5E] ${
            isTablet ? 'text-lg' : 'text-base'
          }`}
        >
          LOG OUT
        </Text>
      </Pressable>

      {/* Delete Account Button */}
      <Pressable
        onPress={onDeleteAccount}
        className={`w-full border-[2px] rounded-[12px] justify-center items-center active:scale-95 transition-transform ${
          isTablet ? 'py-4' : 'py-3'
        }`}
        style={{
          backgroundColor: '#F43F5E',
          borderColor: '#E11D48',
          shadowColor: '#E11D48',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 2,
        }}
      >
        <Text
          className={`font-fredoka-one text-white ${
            isTablet ? 'text-lg' : 'text-base'
          }`}
        >
          DELETE ACCOUNT
        </Text>
      </Pressable>
    </View>
  );
}
