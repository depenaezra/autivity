import React from 'react';
import { Pressable } from 'react-native';

interface HeaderButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  borderColor?: string;
  shadowColor?: string;
  disabled?: boolean;
}

export function HeaderButton({
  onPress,
  icon,
  borderColor = '#BBE8FB',
  shadowColor = '#BBE8FB',
  disabled = false,
}: HeaderButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="w-[44px] h-[44px] rounded-xl bg-white border-[2px] items-center justify-center active:scale-95 transition-transform"
      style={{
        borderColor,
        shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 2,
      }}
    >
      {icon}
    </Pressable>
  );
}
