import React from 'react';
import { Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';

import EditIcon from '../../../assets/images/teacher/class/icon-button-edit.svg';
import ArchiveIcon from '../../../assets/images/teacher/class/icon-button-archive.svg';
import DeleteIcon from '../../../assets/images/teacher/class/icon-button-delete.svg';

interface ActionMenuProps {
  coords: { x: number; y: number; width: number; height: number } | null;
  isTablet: boolean;
  modalOpacity: SharedValue<number>;
  onClose: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

export function ActionMenu({
  coords,
  isTablet,
  modalOpacity,
  onClose,
  onEdit,
  onArchive,
  onDelete,
}: ActionMenuProps) {
  const menuAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: modalOpacity.value,
      transform: [
        {
          translateY: (1 - modalOpacity.value) * 12,
        },
      ],
    };
  });

  if (!coords) return null;

  const menuWidth = isTablet ? 280 : 190;
  const menuHeight = isTablet ? 84 : 70;
  const menuLeft = coords.x + coords.width - menuWidth;
  const menuTop = coords.y + coords.height + 12;

  return (
    <Animated.View
      className="bg-white border-[4px] border-[#F1F1F1] flex-row justify-around items-center"
      style={[
        {
          position: 'absolute',
          left: menuLeft,
          top: menuTop,
          width: menuWidth,
          height: menuHeight,
          borderRadius: isTablet ? 24 : 16,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 15,
          elevation: 10,
          paddingHorizontal: isTablet ? 12 : 6,
        },
        menuAnimatedStyle,
      ]}
    >
      {/* EDIT BUTTON */}
      <Pressable
        onPress={() => {
          onClose();
          onEdit?.();
        }}
        className="flex-col items-center justify-center flex-1 active:scale-95 transition-transform"
      >
        <EditIcon width={isTablet ? 28 : 20} height={isTablet ? 28 : 20} />
        <Text className={`font-fredoka-one text-[#62A9E6] ${isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'}`}>
          EDIT
        </Text>
      </Pressable>

      {/* ARCHIVE BUTTON */}
      <Pressable
        onPress={() => {
          onClose();
          onArchive?.();
        }}
        className="flex-col items-center justify-center flex-1 active:scale-95 transition-transform"
      >
        <ArchiveIcon width={isTablet ? 28 : 20} height={isTablet ? 28 : 20} />
        <Text className={`font-fredoka-one text-[#62A9E6] ${isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'}`}>
          ARCHIVE
        </Text>
      </Pressable>

      {/* DELETE BUTTON */}
      <Pressable
        onPress={() => {
          onClose();
          onDelete?.();
        }}
        className="flex-col items-center justify-center flex-1 active:scale-95 transition-transform"
      >
        <DeleteIcon width={isTablet ? 28 : 20} height={isTablet ? 28 : 20} />
        <Text className={`font-fredoka-one text-[#FF3B3F] ${isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'}`}>
          DELETE
        </Text>
      </Pressable>
    </Animated.View>
  );
}


