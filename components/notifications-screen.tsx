import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import { Animated, Alert, Pressable, Text, useWindowDimensions, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { HeaderButton } from './header-button';
import { ScreenLayout } from './screen-layout';

import DeleteIcon from '../assets/images/teacher/class/icon-button-delete.svg';
import HeaderDefaultBg from '../assets/images/teacher/students/header-default-bg.svg';
import IconClear from '../assets/images/parent/icon-clear.svg';
import IconRead from '../assets/images/parent/icon-read.svg';
import IconUnread from '../assets/images/parent/icon-unread.svg';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead?: boolean;
  type?: 'feedback' | 'announcement' | 'alert' | 'general';
}

interface NotificationsScreenProps {
  notifications?: NotificationItem[];
  onBackPress?: () => void;
  onNotificationPress?: (notification: NotificationItem) => void;
  onClearAll?: () => void;
}

export const DEFAULT_DUMMY_NOTIFICATIONS: NotificationItem[] = [];

interface NotificationCardProps {
  item: NotificationItem;
  isTablet: boolean;
  onPress?: () => void;
  onMarkRead: (id: string) => void;
  onMarkUnread: (id: string) => void;
  onDelete: (id: string) => void;
  onSwipeableWillOpen: (ref: any) => void;
  getTypeIcon: (type?: string) => React.ReactNode;
  getTypeBgColor: (type?: string) => string;
}

function NotificationCard({
  item,
  isTablet,
  onPress,
  onMarkRead,
  onMarkUnread,
  onDelete,
  onSwipeableWillOpen,
  getTypeIcon,
  getTypeBgColor,
}: NotificationCardProps) {
  const swipeableRef = useRef<any>(null);

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const readScale = progress.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0.5, 1.1, 1],
      extrapolate: 'clamp',
    });
    const readOpacity = progress.interpolate({
      inputRange: [0, 0.2, 1],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });
    const readTransX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 0],
      extrapolate: 'clamp',
    });

    const unreadScale = progress.interpolate({
      inputRange: [0.1, 0.5, 1],
      outputRange: [0.5, 1.1, 1],
      extrapolate: 'clamp',
    });
    const unreadOpacity = progress.interpolate({
      inputRange: [0.1, 0.4, 1],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });
    const unreadTransX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [12, 0],
      extrapolate: 'clamp',
    });

    const deleteScale = progress.interpolate({
      inputRange: [0.2, 0.6, 1],
      outputRange: [0.5, 1.1, 1],
      extrapolate: 'clamp',
    });
    const deleteOpacity = progress.interpolate({
      inputRange: [0.2, 0.5, 1],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });
    const deleteTransX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [5, 0],
      extrapolate: 'clamp',
    });

    return (
      <View className="flex-row items-center justify-end pl-3 pr-1 bg-transparent" style={{ height: '100%' }}>
        {/* READ BUTTON */}
        <Animated.View
          style={{
            opacity: readOpacity,
            transform: [{ scale: readScale }, { translateX: readTransX }],
          }}
        >
          <Pressable
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              swipeableRef.current?.close();
              onMarkRead(item.id);
            }}
            className="flex-col items-center justify-center active:scale-95 transition-transform"
            style={{ width: isTablet ? 72 : 56 }}
          >
            <View className="items-center justify-center" style={{ height: isTablet ? 36 : 30 }}>
              <IconRead width={isTablet ? 31 : 25} height={isTablet ? 31 : 25} />
            </View>
            <Text
              className={`font-fredoka-one text-[#62A9E6] text-center w-full px-1 ${
                isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'
              }`}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              READ
            </Text>
          </Pressable>
        </Animated.View>

        {/* UNREAD BUTTON */}
        <Animated.View
          style={{
            opacity: unreadOpacity,
            transform: [{ scale: unreadScale }, { translateX: unreadTransX }],
          }}
        >
          <Pressable
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              swipeableRef.current?.close();
              onMarkUnread(item.id);
            }}
            className="flex-col items-center justify-center active:scale-95 transition-transform"
            style={{ width: isTablet ? 72 : 56 }}
          >
            <View className="items-center justify-center" style={{ height: isTablet ? 36 : 30 }}>
              <IconUnread width={isTablet ? 34 : 28} height={isTablet ? 34 : 28} />
            </View>
            <Text
              className={`font-fredoka-one text-[#62A9E6] text-center w-full px-1 ${
                isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'
              }`}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              UNREAD
            </Text>
          </Pressable>
        </Animated.View>

        {/* DELETE BUTTON */}
        <Animated.View
          style={{
            opacity: deleteOpacity,
            transform: [{ scale: deleteScale }, { translateX: deleteTransX }],
          }}
        >
          <Pressable
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } catch {}
              swipeableRef.current?.close();
              onDelete(item.id);
            }}
            className="flex-col items-center justify-center active:scale-95 transition-transform"
            style={{ width: isTablet ? 72 : 56 }}
          >
            <View className="items-center justify-center" style={{ height: isTablet ? 36 : 30 }}>
              <DeleteIcon width={isTablet ? 26 : 22} height={isTablet ? 26 : 22} />
            </View>
            <Text
              className={`font-fredoka-one text-[#FF3B3F] text-center w-full px-1 ${
                isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'
              }`}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              DELETE
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={() => onSwipeableWillOpen(swipeableRef.current)}
      friction={2}
      overshootRight={false}
      containerStyle={{ overflow: 'visible' }}
      childrenContainerStyle={{ overflow: 'visible' }}
    >
      <Pressable
        onPress={() => {
          swipeableRef.current?.close();
          onPress?.();
        }}
        className={`bg-white border-[4px] active:scale-[0.98] transition-transform ${
          isTablet ? 'rounded-[32px] p-6' : 'rounded-[20px] p-4'
        } ${item.isRead ? 'border-[#F1F1F1]' : 'border-[#BBE8FB]'}`}
        style={{
          shadowColor: item.isRead ? '#F1F1F1' : '#BBE8FB',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 2,
        }}
      >
        <View className="flex-row items-start gap-3.5">
          <View
            className={`rounded-xl border-2 items-center justify-center ${getTypeBgColor(
              item.type
            )} ${isTablet ? 'w-12 h-12' : 'w-10 h-10'}`}
          >
            {getTypeIcon(item.type)}
          </View>

          <View className="flex-1">
            <View className="flex-row items-center justify-between gap-2 mb-1">
              <View className="flex-row items-center gap-2 flex-1">
                {!item.isRead && (
                  <View className="w-2.5 h-2.5 rounded-full bg-[#62A9E6]" />
                )}
                <Text
                  className={`font-fredoka-one text-[#484A4B] flex-1 ${
                    isTablet ? 'text-xl' : 'text-lg'
                  }`}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
              </View>
              <Text
                className={`font-quicksand-medium text-[#9CA3AF] ${
                  isTablet ? 'text-sm' : 'text-xs'
                }`}
              >
                {item.timestamp}
              </Text>
            </View>

            <Text
              className={`font-quicksand-medium text-[#4B5563] leading-relaxed ${
                isTablet ? 'text-base' : 'text-sm'
              }`}
            >
              {item.message}
            </Text>
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );
}

export function NotificationsScreen({
  notifications = [],
  onBackPress,
  onNotificationPress,
  onClearAll,
}: NotificationsScreenProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const [items, setItems] = useState<NotificationItem[]>(notifications);
  const openSwipeableRef = useRef<any>(null);

  useEffect(() => {
    setItems(notifications);
  }, [notifications]);

  const handleSwipeableWillOpen = (ref: any) => {
    if (openSwipeableRef.current && openSwipeableRef.current !== ref) {
      openSwipeableRef.current.close();
    }
    openSwipeableRef.current = ref;
  };

  const handleMarkRead = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRead: true } : item
      )
    );
  };

  const handleMarkUnread = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRead: false } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setItems((prev) => prev.filter((item) => item.id !== id));
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setItems([]);
            onClearAll?.();
          },
        },
      ]
    );
  };

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'feedback':
        return <Ionicons name="chatbubble-ellipses" size={isTablet ? 24 : 20} color="#62A9E6" />;
      case 'general':
        return <Ionicons name="checkmark-circle" size={isTablet ? 24 : 20} color="#179D33" />;
      case 'announcement':
        return <Ionicons name="ribbon" size={isTablet ? 24 : 20} color="#FFAE02" />;
      case 'alert':
        return <Ionicons name="alert-circle" size={isTablet ? 24 : 20} color="#FF8870" />;
      default:
        return <Ionicons name="notifications" size={isTablet ? 24 : 20} color="#62A9E6" />;
    }
  };

  const getTypeBgColor = (type?: string) => {
    switch (type) {
      case 'feedback':
        return 'bg-[#EBF5FF] border-[#BBE8FB]';
      case 'general':
        return 'bg-[#E8F8E5] border-[#CBFAC4]';
      case 'announcement':
        return 'bg-[#FFF8E5] border-[#FFF3C4]';
      case 'alert':
        return 'bg-[#FFEBE8] border-[#FFDBD4]';
      default:
        return 'bg-[#EBF5FF] border-[#BBE8FB]';
    }
  };

  const renderHeaderBackground = () => (
    <View className="flex-1 w-full h-full relative">
      <View className="absolute inset-0">
        <HeaderDefaultBg width="100%" height="100%" preserveAspectRatio="xMidYMax slice" />
      </View>
    </View>
  );

  return (
    <ScreenLayout
      headerBackground={renderHeaderBackground()}
      title="Notifications"
      leftHeaderButton={
        <HeaderButton
          onPress={handleBack}
          icon={
            <View style={{ marginLeft: -3, marginTop: -1 }}>
              <Ionicons name="caret-back" size={isTablet ? 30 : 24} color="#62A9E6" />
            </View>
          }
        />
      }
      rightHeaderButton={
        items.length > 0 ? (
          <HeaderButton
            onPress={handleClearAll}
            icon={
              <IconClear width={isTablet ? 26 : 22} height={isTablet ? 26 : 22} />
            }
          />
        ) : undefined
      }
      scrollable={true}
      stickyHeader={true}
    >
      <View className={`flex-1 ${isTablet ? 'p-8' : 'p-5'}`}>
        {items.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-6">
            <View
              className={`rounded-full bg-[#EBF5FF] items-center justify-center mb-6 border-[3px] border-[#BBE8FB] ${
                isTablet ? 'w-28 h-28' : 'w-24 h-24'
              }`}
            >
              <Ionicons
                name="notifications-off-outline"
                size={isTablet ? 48 : 40}
                color="#62A9E6"
              />
            </View>
            <Text
              className={`font-fredoka-one text-[#484A4B] text-center mb-2 ${
                isTablet ? 'text-3xl' : 'text-2xl'
              }`}
            >
              You have no notifications yet.
            </Text>
            <Text
              className={`font-quicksand-medium text-[#9CA3AF] text-center max-w-md ${
                isTablet ? 'text-xl' : 'text-base'
              }`}
            >
              You're all caught up! Check back later for new updates.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {items.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                isTablet={isTablet}
                onPress={() => onNotificationPress?.(item)}
                onMarkRead={handleMarkRead}
                onMarkUnread={handleMarkUnread}
                onDelete={handleDelete}
                onSwipeableWillOpen={handleSwipeableWillOpen}
                getTypeIcon={getTypeIcon}
                getTypeBgColor={getTypeBgColor}
              />
            ))}
          </View>
        )}
      </View>
    </ScreenLayout>
  );
}
