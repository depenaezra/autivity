import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import YoutubePlayer from 'react-native-youtube-iframe';
import { THEME_COLOR_MAP, WarmupVideo } from '../../../constants/warmup-videos';

interface VideoPlayerModalProps {
  visible: boolean;
  video: WarmupVideo | null;
  onClose: () => void;
  isTablet: boolean;
}

export function VideoPlayerModal({
  visible,
  video,
  onClose,
  isTablet,
}: VideoPlayerModalProps) {
  const { width } = useWindowDimensions();
  const [shouldRender, setShouldRender] = useState(false);
  const [playing, setPlaying] = useState(true);
  const slideAnim = useSharedValue(600);

  useEffect(() => {
    if (visible && video) {
      setShouldRender(true);
      setPlaying(true);
      slideAnim.value = 600;
      slideAnim.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.quad),
      });
    } else {
      setPlaying(false);
      slideAnim.value = withTiming(
        600,
        {
          duration: 200,
          easing: Easing.in(Easing.quad),
        },
        (finished) => {
          if (finished) {
            runOnJS(setShouldRender)(false);
          }
        }
      );
    }
  }, [visible, video, slideAnim]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPlaying(false);
    onClose();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnim.value }],
  }));

  if (!shouldRender || !video) return null;

  const themeColors = THEME_COLOR_MAP[video.themeColor] || THEME_COLOR_MAP.blue;
  const playerWidth = isTablet ? Math.min(width * 0.75, 760) : width - 48;
  const playerHeight = Math.round((playerWidth * 9) / 16);

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        {/* Backdrop Tap to Close */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleClose}
          accessibilityLabel="Close video overlay"
        />

        {/* Modal Container */}
        <Animated.View
          style={[animatedStyle, { maxHeight: isTablet ? '90%' : '92%' }]}
          className="bg-white border-[4px] border-[#F1F1F1] rounded-[32px] px-6 pt-3 pb-6 mx-4 mb-5 shadow-2xl"
        >
          {/* Top Pill Handle */}
          <View className="w-full items-center py-2">
            <View className="w-12 h-1.5 rounded-full bg-[#E5E7EB]" />
          </View>

          {/* Header Row */}
          <View className="flex-row items-center justify-between mt-1 mb-4">
            <View className="flex-1 pr-3">
              <View
                className="self-start px-2.5 py-1 rounded-full border mb-1.5"
                style={{
                  backgroundColor: themeColors.badgeBg,
                  borderColor: themeColors.stroke,
                }}
              >
                <Text
                  className="font-fredoka-one uppercase"
                  style={{
                    color: themeColors.font,
                    fontSize: isTablet ? 12 : 10,
                  }}
                >
                  {video.categoryLabel}
                </Text>
              </View>
              <Text
                className={`font-fredoka-one text-[#484A4B] ${
                  isTablet ? 'text-[24px]' : 'text-[18px]'
                }`}
                numberOfLines={2}
              >
                {video.title}
              </Text>
            </View>

            {/* Tactile Close Button */}
            <Pressable
              onPress={handleClose}
              className="w-[42px] h-[42px] rounded-xl bg-white border-[2px] border-[#F1F1F1] items-center justify-center active:scale-95 transition-transform"
              style={{
                shadowColor: '#F1F1F1',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              <Ionicons name="close" size={isTablet ? 26 : 22} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Scrollable Content (Player + Description) */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {/* Video Player Container */}
            <View
              className="w-full rounded-[20px] overflow-hidden bg-black border-[3px] border-[#F1F1F1] items-center justify-center"
              style={{
                shadowColor: '#F1F1F1',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
                minHeight: playerHeight,
              }}
            >
              {Platform.OS === 'web' ? (
                // Web HTML5 iframe Embed
                <iframe
                  title={video.title}
                  src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&playsinline=1&rel=0`}
                  width="100%"
                  height={playerHeight}
                  style={{ border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                // Mobile YouTube Player
                <YoutubePlayer
                  height={playerHeight}
                  width={playerWidth}
                  play={playing}
                  videoId={video.youtubeId}
                  initialPlayerParams={{
                    preventFullScreen: false,
                    controls: true,
                    modestbranding: true,
                    rel: false,
                  }}
                  onChangeState={(state: string) => {
                    if (state === 'ended') {
                      setPlaying(false);
                    }
                  }}
                />
              )}
            </View>

            {/* Video Details & Classroom Tip */}
            <View className="mt-4 bg-[#F9FAFB] border-[2px] border-[#F1F1F1] rounded-[16px] p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-fredoka-one text-xs text-[#9CA3AF] uppercase">
                  Duration: {video.duration} min
                </Text>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="people" size={14} color="#62A9E6" />
                  <Text className="font-fredoka-one text-xs text-[#62A9E6]">
                    Whole-Class Activity
                  </Text>
                </View>
              </View>

              <Text
                className={`font-quicksand-medium text-[#4B5563] ${
                  isTablet ? 'text-base' : 'text-sm'
                } leading-5`}
              >
                {video.description}
              </Text>

              <View className="mt-3 pt-3 border-t border-[#E5E7EB] flex-row items-center gap-2">
                <Text className="text-base">💡</Text>
                <Text className="font-quicksand-medium text-xs text-[#6B7280] flex-1">
                  Project this on your smartboard or classroom display so students can follow along together!
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Dismiss Button */}
          <Pressable
            onPress={handleClose}
            className="w-full py-3.5 border-[2px] border-[#F1F1F1] rounded-[12px] items-center justify-center bg-white active:scale-95 transition-transform mt-2"
            style={{
              shadowColor: '#F1F1F1',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
            }}
          >
            <Text className="font-fredoka-one text-[#9CA3AF] text-sm uppercase">
              DONE & BACK TO DASHBOARD
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}
