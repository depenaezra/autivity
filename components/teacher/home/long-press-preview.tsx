import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { ActionMenu } from './action-menu';

interface LongPressPreviewProps {
  visible: boolean;
  coords: { x: number; y: number; width: number; height: number } | null;
  onClose: () => void;
  children: React.ReactNode;
  isTablet: boolean;
  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  customMenu?: React.ReactNode;
}

export function LongPressPreview({
  visible,
  coords,
  onClose,
  children,
  isTablet,
  onEdit,
  onArchive,
  onDelete,
  customMenu,
}: LongPressPreviewProps) {
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      modalOpacity.value = withTiming(1, { duration: 200 });
      modalScale.value = withTiming(1.05, { duration: 200, easing: Easing.out(Easing.ease) });
    }
  }, [visible, modalOpacity, modalScale]);

  const handleClose = () => {
    modalOpacity.value = withTiming(0, { duration: 150 });
    modalScale.value = withTiming(1, { duration: 150 }, () => {
      runOnJS(onClose)();
    });
  };

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: modalOpacity.value,
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: modalOpacity.value,
      transform: [
        {
          scale: modalScale.value,
        },
      ],
    };
  });

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={StyleSheet.absoluteFill}>
        {/* Lighter backdrop: rgba(0, 0, 0, 0.2) */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(0, 0, 0, 0.2)' },
              backdropAnimatedStyle,
            ]}
          />
        </Pressable>

        {/* Scaled Preview Item with Neutral Gray Shadow */}
        {coords && (
          <>
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  left: coords.x,
                  top: coords.y,
                  width: coords.width,
                  height: coords.height,
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.15,
                  shadowRadius: 15,
                  elevation: 10,
                },
                contentAnimatedStyle,
              ]}
            >
              {children}
            </Animated.View>

            {/* Action Menu (Extracted Component) or Custom Menu */}
            {customMenu ? (
              customMenu
            ) : (
              <ActionMenu
                coords={coords}
                isTablet={isTablet}
                modalOpacity={modalOpacity}
                onClose={handleClose}
                onEdit={onEdit}
                onArchive={onArchive}
                onDelete={onDelete}
              />
            )}
          </>
        )}
      </View>
    </Modal>
  );
}


