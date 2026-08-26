import React from 'react';
import { Text, View } from 'react-native';
import { BaseModal } from '../teacher/home/base-modal';
import { Ionicons, Feather } from '@expo/vector-icons';

interface LearnerInfoModalProps {
  visible: boolean;
  onClose: () => void;
  isTablet: boolean;
  student?: {
    name?: string;
    avatar?: string;
    spectrum_level?: string;
    learner_code?: string;
    bio?: string;
  } | null;
  classInfo?: {
    title?: string;
    grade?: string;
  } | null;
  teacherName?: string;
}

const SPECTRUM_EXPLANATIONS: Record<string, string> = {
  'Level 1': 'Requiring Support. Difficulties initiating social interactions, organization and planning challenges.',
  'Level 2': 'Requiring Substantial Support. Marked deficits in verbal and nonverbal social communication, difficulty coping with change.',
  'Level 3': 'Very Substantial Support. Severe communication deficits, extreme difficulty coping with change, repetitive behaviors interfere with functioning.',
};

export function LearnerInfoModal({
  visible,
  onClose,
  isTablet,
  student,
  classInfo,
  teacherName,
}: LearnerInfoModalProps) {
  if (!student) return null;

  const spectrumLevel = student.spectrum_level;
  const explanation = spectrumLevel ? (SPECTRUM_EXPLANATIONS[spectrumLevel] || '') : '';

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Learner Info"
      isTablet={isTablet}
      cancelLabel="CLOSE"
      heightClassName={isTablet ? 'h-[75%]' : 'h-[70%]'}
    >
      {/* AVATAR & STUDENT NAME HEADER */}
      <View className="items-center justify-center mb-6">
        <View className="w-20 h-20 rounded-full bg-[#EBF5FF] border-[3px] border-[#62A9E6] items-center justify-center mb-3">
          <Text style={{ fontSize: 38 }}>{student.avatar || '🙂'}</Text>
        </View>
        <Text className="font-fredoka-one text-2xl text-[#484A4B] text-center">
          {student.name}
        </Text>
      </View>

      {/* LEARNER CODE */}
      {student.learner_code ? (
        <View className="mb-4">
          <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">LEARNER CODE</Text>
          <View className="bg-[#F1F1F1] rounded-xl px-4 py-3 flex-row items-center justify-between">
            <Text className="font-quicksand-medium text-[#6B7280] text-sm">Access Code:</Text>
            <View className="bg-[#BBE8FB] px-3 py-1 rounded-[6px] justify-center items-center">
              <Text className="font-fredoka-one text-[#62A9E6] uppercase text-xs sm:text-sm">
                # {student.learner_code}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* CLASSROOM DETAILS */}
      <View className="mb-4">
        <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">CLASSROOM DETAILS</Text>
        <View className="bg-[#F1F1F1] rounded-xl p-4 gap-2.5">
          <View className="flex-row items-center justify-between">
            <Text className="font-quicksand-medium text-[#6B7280] text-sm">Grade Level:</Text>
            <Text className="font-fredoka-one text-[#62A9E6] text-sm">
              {classInfo?.grade || 'Grade 1'}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="font-quicksand-medium text-[#6B7280] text-sm">Class Name:</Text>
            <Text className="font-fredoka-one text-[#62A9E6] text-sm">
              {classInfo?.title || 'Class'}
            </Text>
          </View>
          {teacherName ? (
            <View className="flex-row items-center justify-between">
              <Text className="font-quicksand-medium text-[#6B7280] text-sm">Teacher:</Text>
              <Text className="font-fredoka-one text-[#62A9E6] text-sm">
                {teacherName}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* AUTISM SPECTRUM LEVEL */}
      <View className="mb-4">
        <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">SPECTRUM LEVEL</Text>
        {spectrumLevel ? (
          <View>
            <View
              className="self-start px-4 py-2 rounded-[8px] bg-white border-[2px] border-[#BBE8FB] mb-2"
              style={{
                shadowColor: '#BBE8FB',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              <Text className="font-fredoka-one text-[#62A9E6] text-sm">
                {spectrumLevel}
              </Text>
            </View>
            {explanation ? (
              <Text className="font-quicksand-medium text-xs sm:text-sm text-[#9CA3AF] leading-5 mt-1">
                {explanation}
              </Text>
            ) : null}
          </View>
        ) : (
          <Text className="font-quicksand-medium text-sm text-[#9CA3AF] italic">
            No spectrum level recorded yet.
          </Text>
        )}
      </View>

      {/* BIO / NOTES */}
      <View className="mb-4">
        <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">BIO / NOTES</Text>
        <View className="bg-[#F1F1F1] rounded-xl p-4 min-h-[70px]">
          {student.bio ? (
            <Text className="font-quicksand-medium text-sm text-[#4B5563] leading-5">
              {student.bio}
            </Text>
          ) : (
            <Text className="font-quicksand-medium text-sm text-[#9CA3AF] italic">
              No notes added yet.
            </Text>
          )}
        </View>
      </View>
    </BaseModal>
  );
}
