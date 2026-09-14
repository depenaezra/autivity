import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BaseModal } from './base-modal';
import {
  CATEGORY_OPTIONS,
  extractYoutubeId,
  THEME_COLOR_MAP,
  VideoCategoryKey,
  WarmupVideo,
} from '../../../constants/warmup-videos';

interface AddVideoModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (videoData: {
    id?: string;
    title: string;
    youtubeId: string;
    category: VideoCategoryKey;
    categoryLabel: string;
    themeColor: 'blue' | 'yellow' | 'green' | 'orange';
    duration: string;
    description: string;
  }) => void;
  isTablet: boolean;
  isSubmitting?: boolean;
  editingVideo?: WarmupVideo | null;
}

export function AddVideoModal({
  visible,
  onClose,
  onSubmit,
  isTablet,
  isSubmitting = false,
  editingVideo = null,
}: AddVideoModalProps) {
  const [youtubeInput, setYoutubeInput] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VideoCategoryKey>('dance');
  const [description, setDescription] = useState('');
  const [fetchedVideoTitle, setFetchedVideoTitle] = useState<string | null>(null);
  const [isLoadingTitle, setIsLoadingTitle] = useState(false);

  const detectedYoutubeId = extractYoutubeId(youtubeInput);
  const isValidUrl = Boolean(detectedYoutubeId);
  const isEditing = Boolean(editingVideo);

  // Pre-fill form on edit or reset on add
  useEffect(() => {
    if (editingVideo) {
      setYoutubeInput(`https://youtu.be/${editingVideo.youtubeId}`);
      setTitle(editingVideo.title);
      setSelectedCategory(editingVideo.category);
      setDescription(editingVideo.description || '');
      setFetchedVideoTitle(editingVideo.title);
    } else {
      setYoutubeInput('');
      setTitle('');
      setSelectedCategory('dance');
      setDescription('');
      setFetchedVideoTitle(null);
    }
  }, [editingVideo, visible]);

  // Fetch actual YouTube video title when a valid link/ID is entered
  useEffect(() => {
    let isCancelled = false;

    async function fetchTitle(videoId: string) {
      setIsLoadingTitle(true);
      try {
        const response = await fetch(
          `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
        );
        const data = await response.json();
        if (!isCancelled && data && data.title) {
          setFetchedVideoTitle(data.title);
          // Auto-fill title input if user hasn't typed one yet
          setTitle((prev) => (prev.trim() === '' ? data.title : prev));
        }
      } catch (err) {
        if (!isCancelled) {
          setFetchedVideoTitle(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingTitle(false);
        }
      }
    }

    if (detectedYoutubeId) {
      fetchTitle(detectedYoutubeId);
    } else {
      setFetchedVideoTitle(null);
    }

    return () => {
      isCancelled = true;
    };
  }, [detectedYoutubeId]);

  const handleCategorySelect = (catKey: VideoCategoryKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedCategory(catKey);
  };

  const handleSubmit = () => {
    if (!title.trim() || !detectedYoutubeId) return;

    const matchedCat = CATEGORY_OPTIONS.find((c) => c.key === selectedCategory) || CATEGORY_OPTIONS[0];

    onSubmit({
      id: editingVideo?.id,
      title: title.trim(),
      youtubeId: detectedYoutubeId,
      category: matchedCat.key,
      categoryLabel: matchedCat.badgeText,
      themeColor: matchedCat.themeColor,
      duration: editingVideo?.duration || '3:00',
      description: description.trim(),
    });
  };

  const isFormValid = title.trim().length > 0 && isValidUrl;

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={isEditing ? 'EDIT VIDEO' : 'ADD VIDEO'}
      isTablet={isTablet}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? 'SAVE CHANGES' : 'ADD VIDEO'}
      submitDisabled={!isFormValid || isSubmitting}
      isSubmitting={isSubmitting}
      heightClassName={isTablet ? 'h-[75%]' : 'h-[85%]'}
    >
      <View className="gap-5">
        {/* 1. YOUTUBE LINK / URL */}
        <View>
          <Text className="font-fredoka-one text-sm text-[#484A4B] mb-2 uppercase">
            YouTube Link / Video ID *
          </Text>
          <View
            className="w-full bg-white border-[2px] rounded-[12px] px-3.5 py-3 flex-row items-center justify-between"
            style={{
              borderColor: youtubeInput.length > 0 && !isValidUrl ? '#FF8870' : isValidUrl ? '#62A9E6' : '#F1F1F1',
              shadowColor: '#F1F1F1',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
            }}
          >
            <TextInput
              value={youtubeInput}
              onChangeText={setYoutubeInput}
              placeholder="https://youtu.be/... or watch?v=..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 font-quicksand-medium text-sm text-[#484A4B] mr-2"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isValidUrl && (
              <Ionicons name="checkmark-circle" size={20} color="#179D33" />
            )}
          </View>

          {/* Live Video Preview Box (Actual Title Only) */}
          {isValidUrl && detectedYoutubeId && (
            <View className="mt-3 flex-row items-center gap-3 bg-[#F9FAFB] border-[2px] border-[#F1F1F1] rounded-[12px] p-2.5">
              <Image
                source={{
                  uri: `https://img.youtube.com/vi/${detectedYoutubeId}/hqdefault.jpg`,
                }}
                className="w-20 h-12 rounded-[8px] bg-black"
                resizeMode="cover"
              />
              <View className="flex-1 justify-center">
                {isLoadingTitle && !fetchedVideoTitle ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="#62A9E6" />
                    <Text className="font-quicksand-medium text-xs text-[#9CA3AF]">
                      Loading video details...
                    </Text>
                  </View>
                ) : (
                  <Text
                    className="font-fredoka-one text-xs text-[#484A4B] leading-tight"
                    numberOfLines={2}
                  >
                    {fetchedVideoTitle || title || 'YouTube Video'}
                  </Text>
                )}
              </View>
            </View>
          )}

          {youtubeInput.length > 0 && !isValidUrl && (
            <Text className="font-quicksand-medium text-xs text-[#FF8870] mt-1.5 ml-1">
              Please paste a valid YouTube URL (e.g. youtu.be/... or youtube.com/watch?v=...)
            </Text>
          )}
        </View>

        {/* 2. VIDEO TITLE */}
        <View>
          <Text className="font-fredoka-one text-sm text-[#484A4B] mb-2 uppercase">
            Video Title *
          </Text>
          <View
            className="w-full bg-white border-[2px] border-[#F1F1F1] rounded-[12px] px-3.5 py-3"
            style={{
              shadowColor: '#F1F1F1',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
            }}
          >
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Morning Stretch & Animal Dance"
              placeholderTextColor="#9CA3AF"
              className="font-quicksand-medium text-sm text-[#484A4B]"
            />
          </View>
        </View>

        {/* 3. CATEGORY SELECTOR PILLS */}
        <View>
          <Text className="font-fredoka-one text-sm text-[#484A4B] mb-2.5 uppercase">
            Video Type (Pill Category) *
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              const theme = THEME_COLOR_MAP[cat.themeColor];

              return (
                <Pressable
                  key={cat.key}
                  onPress={() => handleCategorySelect(cat.key)}
                  className="active:scale-95 transition-transform"
                >
                  <View
                    className="flex-row items-center px-3 py-2 rounded-full border-[2px]"
                    style={{
                      backgroundColor: isSelected ? theme.badgeBg : '#FFFFFF',
                      borderColor: isSelected ? theme.stroke : '#F1F1F1',
                      shadowColor: isSelected ? theme.stroke : '#F1F1F1',
                      shadowOffset: { width: 0, height: 1.5 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 1.5,
                    }}
                  >
                    <Text
                      className="font-fredoka-one text-xs uppercase mr-1"
                      style={{
                        color: isSelected ? theme.font : '#6B7280',
                      }}
                    >
                      {cat.badgeText}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={theme.font}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 4. DESCRIPTION (OPTIONAL) */}
        <View>
          <Text className="font-fredoka-one text-sm text-[#484A4B] mb-2 uppercase">
            Description / Instructions (Optional)
          </Text>
          <View
            className="w-full bg-white border-[2px] border-[#F1F1F1] rounded-[12px] px-3.5 py-3"
            style={{
              shadowColor: '#F1F1F1',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
            }}
          >
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Follow the movements and freeze when music stops!"
              placeholderTextColor="#9CA3AF"
              className="font-quicksand-medium text-sm text-[#484A4B] min-h-[60px]"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>
      </View>
    </BaseModal>
  );
}
