import React from 'react';
import { Image as ExpoImage } from 'expo-image';
import { Text, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BaseModal } from '../teacher/home/base-modal';
import {
  EMOTIONS_METADATA,
  getEmotionMeta,
  REGULATION_ZONES,
  RegulationZoneKey,
} from '../../src/utils/emotionZones';

export interface ParentEmotionData {
  emotion: string;
  studentName?: string;
  checkInDate?: string;
  timestamp?: string;
}

interface ParentEmotionModalProps {
  visible: boolean;
  data: ParentEmotionData | null;
  onClose: () => void;
  isTablet?: boolean;
}

const SUPPORT_TIPS: Record<string, { summary: string; tips: string[] }> = {
  happy: {
    summary: 'Your learner arrived ready, joyful, and confident for school activities.',
    tips: [
      'Celebrate their positive attitude with high-fives or praise.',
      'Ask them about their favorite activity or friend from today.',
      'Maintain the positive momentum with enjoyable evening routines.',
    ],
  },
  calm: {
    summary: 'Your learner is in an optimal, relaxed, and focused learning zone.',
    tips: [
      'Great time for calm bonding, reading books, or quiet puzzles together.',
      'Acknowledge how well they self-regulated their emotions.',
      'Maintain a peaceful, predictable evening routine at home.',
    ],
  },
  excited: {
    summary: 'Your learner is feeling high energy and extra stimulated.',
    tips: [
      'Provide structured physical movement (outdoor play, jumping, or dancing).',
      'Help transition to evening with grounding sensory activities.',
      'Channel extra excitement into creative arts or interactive storytelling.',
    ],
  },
  nervous: {
    summary: 'Your learner expressed feeling anxious or uncertain today.',
    tips: [
      'Offer gentle reassuring hugs, active listening, and undivided attention.',
      'Practice slow deep breaths (smell the flower, blow the candle).',
      'Reassure them that making mistakes is a normal part of learning.',
    ],
  },
  tired: {
    summary: 'Your learner reported low physical or cognitive energy.',
    tips: [
      'Encourage an early, relaxing bedtime with soothing sounds or stories.',
      'Provide light hydration and healthy nourishing snacks.',
      'Reduce screen time and avoid high-stimulation activities tonight.',
    ],
  },
  sad: {
    summary: 'Your learner reported feeling down or emotional today.',
    tips: [
      'Create a cozy, pressure-free space for them to rest and open up.',
      'Validate their feelings without rushing to correct or dismiss them.',
      'Engage in favorite comforting activities (favorite toy, music, drawing).',
    ],
  },
};

export function ParentEmotionModal({
  visible,
  data,
  onClose,
  isTablet: isTabletProp,
}: ParentEmotionModalProps) {
  const { width } = useWindowDimensions();
  const isTablet = isTabletProp ?? width >= 768;

  if (!data) return null;

  const emotionKey = data.emotion?.toLowerCase() || 'happy';
  const meta = getEmotionMeta(emotionKey) || EMOTIONS_METADATA.happy;
  const zoneKey = (meta.zone || 'optimal') as RegulationZoneKey;
  const zoneInfo = REGULATION_ZONES[zoneKey] || REGULATION_ZONES.optimal;
  const supportInfo = SUPPORT_TIPS[emotionKey] || SUPPORT_TIPS.happy;

  const formattedDate = data.checkInDate
    ? new Date(data.checkInDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Today';

  const studentFirstName = data.studentName
    ? data.studentName.trim().split(' ')[0]
    : 'Your learner';

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Daily Emotion Check-in"
      isTablet={isTablet}
      cancelLabel="CLOSE"
      heightClassName={isTablet ? 'h-[75%]' : 'h-[82%]'}
    >
      <View className="gap-4 pb-2">
        {/* EMOTION HERO CARD */}
        <View
          className="rounded-2xl p-5 items-center justify-center border-[3px]"
          style={{
            backgroundColor: meta.bgColor,
            borderColor: meta.borderColor,
            shadowColor: meta.borderColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          }}
        >
          {/* Animated Emotion GIF */}
          <View
            className="rounded-full bg-white items-center justify-center mb-3 border-2 border-white overflow-hidden"
            style={{
              width: isTablet ? 110 : 90,
              height: isTablet ? 110 : 90,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <ExpoImage
              source={meta.image}
              style={{ width: isTablet ? 86 : 72, height: isTablet ? 86 : 72 }}
              contentFit="contain"
            />
          </View>

          {/* Bilingual Emotion Labels */}
          <Text
            className={`font-fredoka-one text-center ${
              isTablet ? 'text-2xl' : 'text-xl'
            }`}
            style={{ color: meta.color }}
          >
            {meta.label} • {meta.tagalogLabel.toUpperCase()}
          </Text>

          <Text className="font-quicksand-medium text-xs text-[#6B7280] text-center mt-1">
            {studentFirstName} checked in on {formattedDate}
          </Text>

          {/* Regulation Zone Pill */}
          <View
            className="flex-row items-center gap-1.5 px-3 py-1 rounded-full mt-3 border"
            style={{
              backgroundColor: zoneInfo.bgColor,
              borderColor: zoneInfo.borderColor,
            }}
          >
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: zoneInfo.color }}
            />
            <Text
              className="font-fredoka-one text-xs uppercase"
              style={{ color: zoneInfo.color }}
            >
              {zoneInfo.title}
            </Text>
          </View>
        </View>

        {/* REGULATION STATE INSIGHT */}
        <View className="bg-[#F9FAFB] border-[2px] border-[#F1F1F1] rounded-xl p-4">
          <View className="flex-row items-center gap-2 mb-1.5">
            <Ionicons name="sparkles" size={18} color={meta.color} />
            <Text className="font-fredoka-one text-sm text-[#484A4B]">
              Classroom Regulation State
            </Text>
          </View>
          <Text className="font-quicksand-medium text-xs text-[#4B5563] leading-relaxed">
            {supportInfo.summary}
          </Text>
        </View>

        {/* SUPPORT AT HOME RECOMMENDATIONS */}
        <View className="bg-white border-[2px] border-[#BBE8FB] rounded-xl p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="heart" size={18} color="#62A9E6" />
            <Text className="font-fredoka-one text-sm text-[#62A9E6]">
              Home Support Strategies
            </Text>
          </View>

          <View className="gap-2">
            {supportInfo.tips.map((tip, idx) => (
              <View key={idx} className="flex-row items-start gap-2">
                <View className="w-4 h-4 rounded-full bg-[#EBF5FF] items-center justify-center mt-0.5 border border-[#BBE8FB]">
                  <Text className="font-fredoka-one text-[9px] text-[#62A9E6]">
                    {idx + 1}
                  </Text>
                </View>
                <Text className="font-quicksand-medium text-xs text-[#4B5563] flex-1 leading-relaxed">
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </BaseModal>
  );
}
