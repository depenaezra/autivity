import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { LongPressPreview } from './long-press-preview';
import {
  DEFAULT_WARMUP_VIDEOS,
  THEME_COLOR_MAP,
  WarmupVideo,
} from '../../../constants/warmup-videos';

export interface VideosSectionProps {
  isTablet: boolean;
  onSelectVideo: (video: WarmupVideo) => void;
  onAddVideo: () => void;
  onEditVideo?: (video: WarmupVideo) => void;
  onDeleteVideo?: (videoId: string) => void;
  videos?: WarmupVideo[];
}

const AUTO_SCROLL_INTERVAL = 4500; // 4.5 seconds

// Animated Micro-Pill Dot Subcomponent
function AnimatedDot({
  index,
  total,
  scrollX,
  containerWidth,
  activeColor,
  isTablet,
  onPress,
}: {
  index: number;
  total: number;
  scrollX: SharedValue<number>;
  containerWidth: number;
  activeColor: string;
  isTablet: boolean;
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    // In looped list, real item `index` is at position `(index + 1) * containerWidth`
    const targetX = (index + 1) * containerWidth;
    const distance = Math.abs(scrollX.value - targetX);

    // Handle circular wrap distance for seamless transitions
    const wrapDistance1 = Math.abs(scrollX.value - (targetX + total * containerWidth));
    const wrapDistance2 = Math.abs(scrollX.value - (targetX - total * containerWidth));
    const minDistance = Math.min(distance, wrapDistance1, wrapDistance2);

    const progress = interpolate(
      minDistance,
      [0, containerWidth],
      [1, 0],
      Extrapolation.CLAMP
    );

    const baseWidth = isTablet ? 8 : 6;
    const activeWidth = isTablet ? 26 : 20;
    const width = baseWidth + (activeWidth - baseWidth) * progress;
    const opacity = 0.35 + 0.65 * progress;

    return {
      width,
      opacity,
    };
  });

  return (
    <Pressable onPress={onPress} className="py-2 px-1">
      <Animated.View
        style={[
          {
            height: isTablet ? 8 : 6,
            borderRadius: isTablet ? 4 : 3,
            backgroundColor: activeColor,
          },
          animatedStyle,
        ]}
      />
    </Pressable>
  );
}

// Single Video Card Component with direct isolated Ref measurement
function VideoCardItem({
  item,
  containerWidth,
  cardHeight,
  isTablet,
  onSelect,
  onLongPress,
}: {
  item: WarmupVideo;
  containerWidth: number;
  cardHeight: number;
  isTablet: boolean;
  onSelect: (video: WarmupVideo) => void;
  onLongPress: (video: WarmupVideo, coords: { x: number; y: number; width: number; height: number }) => void;
}) {
  const cardRef = useRef<View>(null);
  const theme = THEME_COLOR_MAP[item.themeColor] || THEME_COLOR_MAP.blue;
  const thumbnailUrl = `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;
  const cleanId = item.id.replace(/-clone-(first|last)$/, '');

  const handleLongPress = () => {
    cardRef.current?.measureInWindow((x, y, width, height) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      onLongPress({ ...item, id: cleanId }, { x, y, width, height });
    });
  };

  return (
    <View ref={cardRef} style={{ width: containerWidth }} collapsable={false}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onSelect({ ...item, id: cleanId });
        }}
        onLongPress={handleLongPress}
        delayLongPress={350}
        className="w-full active:scale-[0.99] transition-transform"
      >
        <View
          className={`w-full bg-white border-[4px] overflow-hidden ${
            isTablet ? 'rounded-[32px]' : 'rounded-[20px]'
          } flex-row`}
          style={{
            height: cardHeight,
            borderColor: '#F1F1F1',
            shadowColor: '#F1F1F1',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          }}
        >
          {/* Left Thumbnail Section */}
          <View
            className="relative overflow-hidden bg-[#1F2937]"
            style={{ width: isTablet ? '38%' : '40%', height: '100%' }}
          >
            <Image
              source={{ uri: thumbnailUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />

            {/* Subtle dark tint */}
            <View className="absolute inset-0 bg-black/20" />

            {/* Centered Play Circle */}
            <View className="absolute inset-0 items-center justify-center">
              <View
                className="w-10 h-10 rounded-full bg-white items-center justify-center"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 3,
                }}
              >
                <Ionicons
                  name="play"
                  size={20}
                  color="#62A9E6"
                  style={{ marginLeft: 2 }}
                />
              </View>
            </View>

            {/* Duration Badge */}
            <View className="absolute bottom-2.5 left-2.5 bg-black/75 px-2 py-0.5 rounded-[6px]">
              <Text className="font-fredoka-one text-[10px] text-white">
                ⏱️ {item.duration}
              </Text>
            </View>
          </View>

          {/* Right Info Section */}
          <View
            className={`flex-1 justify-between bg-white ${
              isTablet ? 'p-5' : 'p-3.5'
            }`}
          >
            <View>
              {/* Category Badge */}
              <View
                className="self-start px-2 py-0.5 rounded-full border mb-1.5"
                style={{
                  backgroundColor: theme.badgeBg,
                  borderColor: theme.stroke,
                }}
              >
                <Text
                  className="font-fredoka-one uppercase"
                  style={{
                    color: theme.font,
                    fontSize: isTablet ? 11 : 9,
                  }}
                >
                  {item.categoryLabel}
                </Text>
              </View>

              {/* Video Title */}
              <Text
                className={`font-fredoka-one text-[#484A4B] ${
                  isTablet ? 'text-[20px]' : 'text-[14px]'
                } leading-tight`}
                numberOfLines={2}
              >
                {item.title}
              </Text>
            </View>

            {/* Launch Button Row */}
            <View className="flex-row items-center justify-between mt-2">
              <View
                className={`bg-white border-[2px] rounded-[8px] flex-row justify-center items-center ${
                  isTablet ? 'px-4 py-2 gap-1.5' : 'px-3 py-1.5 gap-1'
                }`}
                style={{
                  borderColor: theme.stroke,
                  shadowColor: theme.stroke,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                <Text
                  className={`font-fredoka-one uppercase ${
                    isTablet ? 'text-sm' : 'text-[11px]'
                  }`}
                  style={{ color: theme.font }}
                >
                  PLAY FOR CLASS
                </Text>
                <Ionicons
                  name="play"
                  size={isTablet ? 14 : 11}
                  color={theme.font}
                />
              </View>

              <Text className="font-fredoka-one text-[10px] text-[#9CA3AF] uppercase hidden sm:flex">
                Group Activity
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

export function VideosSection({
  isTablet,
  onSelectVideo,
  onAddVideo,
  onEditVideo,
  onDeleteVideo,
  videos = DEFAULT_WARMUP_VIDEOS,
}: VideosSectionProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Long press preview state
  const [longPressedVideo, setLongPressedVideo] = useState<WarmupVideo | null>(null);
  const [longPressCoords, setLongPressCoords] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const flatListRef = useRef<Animated.FlatList<WarmupVideo>>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentVirtualIndexRef = useRef<number>(1);

  // 1-card container width matching dashboard margins
  const horizontalPadding = isTablet ? 48 : 24;
  const containerWidth = windowWidth - horizontalPadding * 2;
  const cardHeight = isTablet ? 200 : 145;

  // Shared value for real-time micro-animation of pagination dots
  const scrollX = useSharedValue(containerWidth);

  // Build Infinite Circular Loop data: [lastItem, ...videos, firstItem]
  const loopedVideos = useMemo(() => {
    if (videos.length <= 1) return videos;
    const first = { ...videos[0], id: `${videos[0].id}-clone-first` };
    const last = { ...videos[videos.length - 1], id: `${videos[videos.length - 1].id}-clone-last` };
    return [last, ...videos, first];
  }, [videos]);

  // Reanimated scroll handler for 60fps dot animation
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  // Auto-scroll handler (Always moves forward to the right seamlessly)
  const startAutoScroll = useCallback(() => {
    if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current);

    autoScrollTimerRef.current = setInterval(() => {
      if (videos.length <= 1 || longPressedVideo) return;

      const nextVirtualIndex = currentVirtualIndexRef.current + 1;
      currentVirtualIndexRef.current = nextVirtualIndex;

      flatListRef.current?.scrollToOffset({
        offset: nextVirtualIndex * containerWidth,
        animated: true,
      });

      // Update active index for indicator/theme
      const realIndex = ((nextVirtualIndex - 1) % videos.length + videos.length) % videos.length;
      setActiveIndex(realIndex);
    }, AUTO_SCROLL_INTERVAL);
  }, [videos.length, longPressedVideo, containerWidth]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isUserInteracting && !longPressedVideo) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }

    return () => stopAutoScroll();
  }, [isUserInteracting, longPressedVideo, startAutoScroll, stopAutoScroll]);

  // Handle Infinite Loop Wrapping on Momentum Scroll End
  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const rawIndex = Math.round(offsetX / containerWidth);

    if (videos.length > 1) {
      if (rawIndex >= loopedVideos.length - 1) {
        // Reached end clone -> silently jump to real first item (index 1)
        flatListRef.current?.scrollToOffset({
          offset: 1 * containerWidth,
          animated: false,
        });
        scrollX.value = 1 * containerWidth;
        currentVirtualIndexRef.current = 1;
        setActiveIndex(0);
      } else if (rawIndex <= 0) {
        // Reached start clone -> silently jump to real last item (index N)
        const realLastIndex = videos.length;
        flatListRef.current?.scrollToOffset({
          offset: realLastIndex * containerWidth,
          animated: false,
        });
        scrollX.value = realLastIndex * containerWidth;
        currentVirtualIndexRef.current = realLastIndex;
        setActiveIndex(videos.length - 1);
      } else {
        currentVirtualIndexRef.current = rawIndex;
        setActiveIndex(rawIndex - 1);
      }
    } else {
      currentVirtualIndexRef.current = 0;
      setActiveIndex(0);
    }

    setIsUserInteracting(false);
  };

  const handleScrollBeginDrag = () => {
    setIsUserInteracting(true);
  };

  const handleDotPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const targetVirtualIndex = index + 1;
    currentVirtualIndexRef.current = targetVirtualIndex;
    setActiveIndex(index);
    flatListRef.current?.scrollToOffset({
      offset: targetVirtualIndex * containerWidth,
      animated: true,
    });
  };

  const handleCardLongPress = (
    videoItem: WarmupVideo,
    coords: { x: number; y: number; width: number; height: number }
  ) => {
    setLongPressCoords(coords);
    setLongPressedVideo(videoItem);
  };

  const currentTheme = THEME_COLOR_MAP[videos[activeIndex]?.themeColor || 'blue'];

  const renderZoomedCard = (item: WarmupVideo) => {
    const theme = THEME_COLOR_MAP[item.themeColor] || THEME_COLOR_MAP.blue;
    const thumbnailUrl = `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;

    return (
      <View
        className={`w-full bg-white border-[4px] overflow-hidden ${
          isTablet ? 'rounded-[32px]' : 'rounded-[20px]'
        } flex-row`}
        style={{
          height: cardHeight,
          borderColor: theme.stroke,
          shadowColor: theme.stroke,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 8,
        }}
      >
        <View
          className="relative overflow-hidden bg-[#1F2937]"
          style={{ width: isTablet ? '38%' : '40%', height: '100%' }}
        >
          <Image source={{ uri: thumbnailUrl }} className="w-full h-full" resizeMode="cover" />
          <View className="absolute inset-0 bg-black/20" />
          <View className="absolute inset-0 items-center justify-center">
            <View className="w-10 h-10 rounded-full bg-white items-center justify-center">
              <Ionicons name="play" size={20} color="#62A9E6" style={{ marginLeft: 2 }} />
            </View>
          </View>
          <View className="absolute bottom-2.5 left-2.5 bg-black/75 px-2 py-0.5 rounded-[6px]">
            <Text className="font-fredoka-one text-[10px] text-white">⏱️ {item.duration}</Text>
          </View>
        </View>

        <View className={`flex-1 justify-between bg-white ${isTablet ? 'p-5' : 'p-3.5'}`}>
          <View>
            <View
              className="self-start px-2 py-0.5 rounded-full border mb-1.5"
              style={{ backgroundColor: theme.badgeBg, borderColor: theme.stroke }}
            >
              <Text className="font-fredoka-one uppercase" style={{ color: theme.font, fontSize: isTablet ? 11 : 9 }}>
                {item.categoryLabel}
              </Text>
            </View>
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[20px]' : 'text-[14px]'} leading-tight`} numberOfLines={2}>
              {item.title}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <View
              className={`bg-white border-[2px] rounded-[8px] flex-row justify-center items-center ${isTablet ? 'px-4 py-2 gap-1.5' : 'px-3 py-1.5 gap-1'}`}
              style={{ borderColor: theme.stroke, shadowColor: theme.stroke, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2 }}
            >
              <Text className={`font-fredoka-one uppercase ${isTablet ? 'text-sm' : 'text-[11px]'}`} style={{ color: theme.font }}>
                PLAY FOR CLASS
              </Text>
              <Ionicons name="play" size={isTablet ? 14 : 11} color={theme.font} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View
      className={`w-full ${isTablet ? 'px-12 mt-10 mb-6' : 'px-6 mt-6 mb-4'}`}
    >
      {/* SECTION HEADER */}
      <View
        className={`flex-row items-center justify-between ${
          isTablet ? 'mb-4' : 'mb-3'
        }`}
      >
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons
            name="motion-play-outline"
            size={isTablet ? 32 : 24}
            color="#62A9E6"
          />
          <Text
            className={`font-fredoka-one text-[#484A4B] ${
              isTablet ? 'text-[32px]' : 'text-[22px]'
            }`}
          >
            Move & Groove
          </Text>
        </View>

        {/* ADD VIDEO BUTTON */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onAddVideo();
          }}
          className={`bg-white border-[2px] rounded-[8px] justify-center items-center active:scale-95 transition-transform ${
            isTablet ? 'px-4 py-2' : 'px-3 py-1.5'
          }`}
          style={{
            borderColor: '#BBE8FB',
            shadowColor: '#BBE8FB',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          }}
        >
          <Text
            className={`font-fredoka-one text-[#62A9E6] ${
              isTablet ? 'text-sm' : 'text-[11px]'
            }`}
          >
            ADD VIDEO
          </Text>
        </Pressable>
      </View>

      {/* FULL-WIDTH SINGLE CARD INFINITE CAROUSEL */}
      <View style={{ width: containerWidth, overflow: 'hidden' }}>
        <Animated.FlatList
          ref={flatListRef}
          data={loopedVideos}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onScrollBeginDrag={handleScrollBeginDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          initialScrollIndex={videos.length > 1 ? 1 : 0}
          getItemLayout={(_, index) => ({
            length: containerWidth,
            offset: containerWidth * index,
            index,
          })}
          renderItem={({ item }) => (
            <VideoCardItem
              item={item}
              containerWidth={containerWidth}
              cardHeight={cardHeight}
              isTablet={isTablet}
              onSelect={onSelectVideo}
              onLongPress={handleCardLongPress}
            />
          )}
        />
      </View>

      {/* DYNAMIC MICRO-ANIMATED PAGINATION DOTS */}
      {videos.length > 1 && (
        <View className="flex-row justify-center items-center gap-1.5 mt-3">
          {videos.map((_, index) => (
            <AnimatedDot
              key={`dot-${index}`}
              index={index}
              total={videos.length}
              scrollX={scrollX}
              containerWidth={containerWidth}
              activeColor={currentTheme.font}
              isTablet={isTablet}
              onPress={() => handleDotPress(index)}
            />
          ))}
        </View>
      )}

      {/* LONG PRESS ACTION MENU (EDIT / DELETE) */}
      {longPressedVideo && (
        <LongPressPreview
          visible={Boolean(longPressedVideo)}
          coords={longPressCoords}
          onClose={() => setLongPressedVideo(null)}
          isTablet={isTablet}
          onEdit={() => {
            const videoToEdit = longPressedVideo;
            setLongPressedVideo(null);
            if (videoToEdit && onEditVideo) {
              onEditVideo(videoToEdit);
            }
          }}
          onDelete={() => {
            const videoId = longPressedVideo?.id;
            setLongPressedVideo(null);
            if (videoId && onDeleteVideo) {
              onDeleteVideo(videoId);
            }
          }}
        >
          {renderZoomedCard(longPressedVideo)}
        </LongPressPreview>
      )}
    </View>
  );
}
