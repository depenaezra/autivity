import React, { useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CountingItemDef } from '../types';
import { CountingItemAsset } from '../utils/counting-assets';

interface BasketRect {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
}

interface DraggableCountItemProps {
  item: CountingItemDef;
  size?: number;
  basketRect: BasketRect | null;
  onDragStart?: (itemId: string) => void;
  onDropSuccess: (item: CountingItemDef) => void;
  onDropMiss?: (item: CountingItemDef) => void;
  disabled?: boolean;
  onLayoutPos?: (pos: { x: number; y: number }) => void;
  isFirstItem?: boolean;
}

export function DraggableCountItem({
  item,
  size = 64,
  basketRect,
  onDragStart,
  onDropSuccess,
  onDropMiss,
  disabled = false,
  onLayoutPos,
  isFirstItem = false,
}: DraggableCountItemProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [isDragging, setIsDragging] = useState(false);
  const itemContainerRef = useRef<View | null>(null);

  const pressStartTime = useRef<number>(0);

  // Keep a mutable ref of all props so PanResponder handlers always access latest values without stale closures
  const propsRef = useRef({
    item,
    basketRect,
    onDragStart,
    onDropSuccess,
    onDropMiss,
    disabled,
  });
  propsRef.current = {
    item,
    basketRect,
    onDragStart,
    onDropSuccess,
    onDropMiss,
    disabled,
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !propsRef.current.disabled,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return !propsRef.current.disabled && (Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3);
      },

      onPanResponderGrant: () => {
        if (propsRef.current.disabled) return;
        pressStartTime.current = Date.now();
        setIsDragging(true);
        propsRef.current.onDragStart?.(propsRef.current.item.id);

        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}

        Animated.spring(scale, {
          toValue: 1.18,
          friction: 5,
          useNativeDriver: false,
        }).start();
      },

      onPanResponderMove: (_, gesture) => {
        if (propsRef.current.disabled) return;
        pan.setValue({ x: gesture.dx, y: gesture.dy });
      },

      onPanResponderRelease: (e, gesture) => {
        const { item: curItem, basketRect: curBasketRect, onDropSuccess: curOnDropSuccess, onDropMiss: curOnDropMiss, disabled: curDisabled } = propsRef.current;
        if (curDisabled) return;
        setIsDragging(false);

        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: false,
        }).start();

        // 1. Robust touch position extraction across Mobile & Web
        const nativeEv = e?.nativeEvent as any;
        const touchX =
          (nativeEv && (nativeEv.pageX ?? nativeEv.clientX)) ??
          (gesture.moveX || 0);

        const touchY =
          (nativeEv && (nativeEv.pageY ?? nativeEv.clientY)) ??
          (gesture.moveY || 0);

        const dx = gesture.dx;
        const dy = gesture.dy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const duration = Date.now() - pressStartTime.current;

        // 2. High-tolerance Basket Collision Check
        let isInsideBasket = false;
        if (curBasketRect) {
          const bX = curBasketRect.pageX ?? curBasketRect.x ?? 0;
          const bY = curBasketRect.pageY ?? curBasketRect.y ?? 0;
          const bW = curBasketRect.width || 280;
          const bH = curBasketRect.height || 180;

          // Generous hit box: 110px padding all around
          const padH = 110;
          const padV = 130;

          isInsideBasket =
            touchX >= bX - padH &&
            touchX <= bX + bW + padH &&
            touchY >= bY - padV &&
            touchY <= bY + bH + padV;
        }

        // 3. Generous drag detection: dragged downwards from shelf towards basket
        const isDraggedDownwards = dy > 25;
        const isDroppedInBasketArea = touchY > 150 && dist > 15;

        // 4. Accessibility tap-to-place
        const isTap = dist < 20 && duration < 500;

        if (isInsideBasket || isDraggedDownwards || isDroppedInBasketArea || isTap) {
          // Successful placement!
          pan.setValue({ x: 0, y: 0 });
          curOnDropSuccess(curItem);
        } else {
          // Rebounding back to shelf
          if (dist > 40) {
            curOnDropMiss?.(curItem);
          }

          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            tension: 50,
            useNativeDriver: false,
          }).start();
        }
      },

      onPanResponderTerminate: () => {
        setIsDragging(false);
        Animated.spring(scale, { toValue: 1, useNativeDriver: false }).start();
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    })
  ).current;

  const handleLayout = () => {
    if (itemContainerRef.current && isFirstItem && onLayoutPos) {
      itemContainerRef.current.measureInWindow((x, y, w, h) => {
        if (x !== undefined && y !== undefined && w > 0 && h > 0) {
          onLayoutPos({ x: x + w / 2, y: y + h / 2 });
        }
      });
    }
  };

  return (
    <View
      ref={itemContainerRef}
      onLayout={handleLayout}
      style={[
        styles.slot,
        { width: size + 16, height: size + 16 },
      ]}
    >
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.draggableCard,
          {
            width: size + 12,
            height: size + 12,
            borderRadius: (size + 12) / 2,
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale },
            ],
            zIndex: isDragging ? 9999 : 1,
            elevation: isDragging ? 12 : 3,
            shadowOpacity: isDragging ? 0.4 : 0.15,
          },
        ]}
      >
        <CountingItemAsset itemType={item.name} size={size} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  draggableCard: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});
