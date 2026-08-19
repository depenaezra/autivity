import React from 'react';
import { View, Text, Pressable, useWindowDimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// SVGs
import EditIcon from '../../../assets/images/teacher/class/icon-button-edit.svg';
import AssignIcon from '../../../assets/images/teacher/class/icon-button-assign.svg';
import MoveIcon from '../../../assets/images/teacher/class/icon-button-move.svg';
import DeleteIcon from '../../../assets/images/teacher/class/icon-button-delete.svg';

interface StudentActionMenuProps {
  visible: boolean;
  studentName: string;
  learnerCode?: string;
  onEditPress: () => void;
  onAssignPress: () => void;
  onMovePress: () => void;
  onDeletePress: () => void;
  onDeselectPress: () => void;
  onStartActivityPress?: () => void;
  isTablet: boolean;
  coords?: { x: number; y: number; width: number; height: number } | null;
}

export function StudentActionMenu({
  visible,
  studentName,
  learnerCode,
  onEditPress,
  onAssignPress,
  onMovePress,
  onDeletePress,
  onDeselectPress,
  onStartActivityPress,
  isTablet,
  coords,
}: StudentActionMenuProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const { width: screenWidth } = useWindowDimensions();
  const margin = 16;

  // Make menu wider to fit 4 buttons nicely
  const menuWidth = isTablet ? 340 : 280;
  const menuHeight = isTablet ? 84 : 70;

  // Center the menu underneath the student item coordinates, clamped within margins
  let menuLeft = coords ? coords.x + (coords.width - menuWidth) / 2 : 0;
  if (coords) {
    menuLeft = Math.max(margin, Math.min(screenWidth - menuWidth - margin, menuLeft));
  }
  const menuTop = coords ? coords.y + coords.height + 12 : 0;

  const renderButtons = () => (
    <>
      {/* EDIT */}
      <Pressable
        onPress={onEditPress}
        className="flex-col items-center justify-center flex-1 active:scale-95 transition-transform"
      >
        <View className="items-center justify-center" style={{ height: isTablet ? 32 : 26 }}>
          <EditIcon width={isTablet ? 26 : 22} height={isTablet ? 26 : 22} />
        </View>
        <Text 
          className={`font-fredoka-one text-[#62A9E6] text-center w-full px-1 ${isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'}`}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          EDIT
        </Text>
      </Pressable>

      {/* ASSIGN */}
      <Pressable
        onPress={onAssignPress}
        className="flex-col items-center justify-center flex-1 active:scale-95 transition-transform"
      >
        <View className="items-center justify-center" style={{ height: isTablet ? 32 : 26 }}>
          <AssignIcon width={isTablet ? 26 : 22} height={isTablet ? 26 : 22} />
        </View>
        <Text 
          className={`font-fredoka-one text-[#62A9E6] text-center w-full px-1 ${isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'}`}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          ASSIGN
        </Text>
      </Pressable>

      {/* MOVE */}
      <Pressable
        onPress={onMovePress}
        className="flex-col items-center justify-center flex-1 active:scale-95 transition-transform"
      >
        <View className="items-center justify-center" style={{ height: isTablet ? 32 : 26 }}>
          <MoveIcon width={isTablet ? 26 : 22} height={isTablet ? 26 : 22} />
        </View>
        <Text 
          className={`font-fredoka-one text-[#62A9E6] text-center w-full px-1 ${isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'}`}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          MOVE
        </Text>
      </Pressable>

      {/* DELETE */}
      <Pressable
        onPress={onDeletePress}
        className="flex-col items-center justify-center flex-1 active:scale-95 transition-transform"
      >
        <View className="items-center justify-center" style={{ height: isTablet ? 32 : 26 }}>
          <DeleteIcon width={isTablet ? 26 : 22} height={isTablet ? 26 : 22} />
        </View>
        <Text 
          className={`font-fredoka-one text-[#FF3B3F] text-center w-full px-1 ${isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'}`}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          DELETE
        </Text>
      </Pressable>
    </>
  );

  if (coords) {
    return (
      <View
        className="bg-white border-[4px] border-[#F1F1F1] flex-row justify-around items-center"
        style={{
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
          zIndex: 9999,
        }}
      >
        {renderButtons()}
      </View>
    );
  }

  // Fallback: Bottom sheet overlay if no coordinates are supplied
  return (
    <View 
      className="bg-white border-t-[4px] border-x-[4px] border-[#F1F1F1] rounded-t-[32px] pt-4 px-6 shadow-lg absolute bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 24 }}
    >
      {/* Selected Student Banner */}
      <View className="flex-row justify-between items-center mb-4 px-1">
        <View>
          <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-xl' : 'text-base'}`}>
            Selected: <Text style={{ color: '#62A9E6' }}>{studentName}</Text>
          </Text>
          {learnerCode && (
            <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-sm mt-0.5' : 'text-xs'}`}>
              Learner code: {learnerCode}
            </Text>
          )}
        </View>
        <Pressable 
          onPress={onDeselectPress} 
          className="bg-[#F1F1F1] px-3.5 py-1.5 rounded-full active:scale-95 transition-transform"
        >
          <Text className={`font-fredoka-one text-[#9CA3AF] ${isTablet ? 'text-sm' : 'text-xs'}`}>DESELECT</Text>
        </Pressable>
      </View>

      {/* Action Row */}
      <View className="bg-white border-[4px] border-[#F1F1F1] rounded-2xl flex-row justify-around items-center py-4">
        {renderButtons()}
      </View>

      {/* Start Activity Button */}
      {onStartActivityPress && (
        <Pressable
          onPress={onStartActivityPress}
          className="w-full mt-3 flex-row items-center justify-center bg-[#62A9E6] border-[2px] border-[#BBE8FB] rounded-xl py-3.5 active:scale-95 transition-transform"
          style={{
            shadowColor: '#BBE8FB',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          }}
        >
          <Ionicons name="play" size={18} color="white" style={{ marginRight: 6 }} />
          <Text className="font-fredoka-one text-white text-base uppercase">
            START ACTIVITY FOR {studentName}
          </Text>
        </Pressable>
      )}
    </View>
  );
}


