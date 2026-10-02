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
          nativeEv?.pageX ??
          nativeEv?.clientX ??
          (gesture.moveX !== 0 ? gesture.moveX : gesture.x0 + gesture.dx);

        const touchY =
          nativeEv?.pageY ??
          nativeEv?.clientY ??
          (gesture.moveY !== 0 ? gesture.moveY : gesture.y0 + gesture.dy);

        const dx = gesture.dx;
        const dy = gesture.dy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 2. Strict Drag Requirement:
        // Must be a deliberate drag (dist >= 40px).
        // Clicking / tapping on an item will NEVER count!
        const isDeliberateDrag = dist >= 40;

        // 3. Basket Hitbox Collision Detection:
        // Only count when the item is physically dragged into the basket!
        // Dragging out of the shelf box only will NOT reach the basket and will NOT count!
        let isInsideBasket = false;
        if (isDeliberateDrag && curBasketRect) {
          const bX = curBasketRect.pageX;
          const bY = curBasketRect.pageY;
          const bW = curBasketRect.width || 250;
          const bH = curBasketRect.height || 165;

          // Basket boundaries with child-friendly padding:
          // Horizontal: within basket width + 25px tolerance on each side
          const minX = bX - 25;
          const maxX = bX + bW + 25;

          // Vertical: must reach the basket area (opening down to bottom)
          // The top opening of the basket starts around bY.
          // Shelf items are high up (touchY < bY - 30), so dragging just out of the box fails!
          const minY = bY - 15;
          const maxY = bY + bH + 25;

          isInsideBasket =
            touchX >= minX &&
            touchX <= maxX &&
            touchY >= minY &&
            touchY <= maxY;
        }

        if (isInsideBasket) {
          // Successfully dragged and dropped into the basket!
          pan.setValue({ x: 0, y: 0 });
          curOnDropSuccess(curItem);
        } else {
          // Did NOT land inside basket: spring back to shelf slot
          if (dist > 50) {
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
