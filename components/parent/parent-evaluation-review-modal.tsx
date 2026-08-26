import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, useWindowDimensions, View } from 'react-native';
import { getSessionEvaluation, SessionEvaluationDetails } from '../../src/services/analytics';
import { BaseModal } from '../teacher/home/base-modal';

interface ParentEvaluationReviewModalProps {
  visible: boolean;
  sessionId: string | null;
  onClose: () => void;
  isTablet?: boolean;
}

export const RUBRIC_CRITERIA = [
  { key: 'looking_at_objects', title: 'Looking at Objects' },
  { key: 'concentrating', title: 'Concentrating' },
  { key: 'performing_task', title: 'Performing Task' },
  { key: 'following_instructions', title: 'Following Instructions' },
  { key: 'completed_work', title: 'Completed Work' },
] as const;

export const RUBRIC_SCALE: Record<number, { label: string; description: string; color: string; bgColor: string; borderColor: string }> = {
  0: {
    label: 'Try again',
    description: 'The task will be repeated by the pupil',
    color: '#B91C1C',
    bgColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  1: {
    label: 'Oh no',
    description: 'If a student is not focusing on an object',
    color: '#C2410C',
    bgColor: '#FFEDD5',
    borderColor: '#FDBA74',
  },
  2: {
    label: 'OK!',
    description: 'If the pupil views the object halfway when it is moving',
    color: '#B45309',
    bgColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  3: {
    label: 'Good job!',
    description: 'The pupil looks at the object for a brief period of time',
    color: '#1D4ED8',
    bgColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  4: {
    label: 'Great job!',
    description: 'If the pupil looks at the object for an extended period of time',
    color: '#15803D',
    bgColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
};

export function ParentEvaluationReviewModal({
  visible,
  sessionId,
  onClose,
  isTablet: isTabletProp,
}: ParentEvaluationReviewModalProps) {
  const { width } = useWindowDimensions();
  const isTablet = isTabletProp ?? width >= 768;

  const [isLoading, setIsLoading] = useState(false);
  const [details, setDetails] = useState<SessionEvaluationDetails | null>(null);

  useEffect(() => {
    if (visible && sessionId) {
      loadEvaluationDetails();
    } else {
      setDetails(null);
    }
  }, [visible, sessionId]);

  const loadEvaluationDetails = async () => {
    setIsLoading(true);
    try {
      if (sessionId) {
        const data = await getSessionEvaluation(sessionId);
        setDetails(data);
      }
    } catch (err) {
      console.error('ParentEvaluationReviewModal: failed to load evaluation', err);
    } finally {
      setIsLoading(false);
    }
  };

  const rubricObj = (() => {
    if (!details?.rubricEvaluation) return {};
    if (typeof details.rubricEvaluation === 'string') {
      try {
        return JSON.parse(details.rubricEvaluation);
      } catch (e) {
        console.error('ParentEvaluationReviewModal: failed to parse rubric evaluation string', e);
        return {};
      }
    }
    return details.rubricEvaluation;
  })();

  const totalPoints = Object.values(rubricObj).reduce(
    (sum: number, val: any) => sum + (Number(val) || 0),
    0
  );

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Session Evaluation Details"
      isTablet={isTablet}
      cancelLabel="CLOSE"
      heightClassName={isTablet ? 'h-[72%]' : 'h-[78%]'}
    >
      {isLoading ? (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator size="large" color="#62A9E6" />
          <Text className="mt-3 font-quicksand-medium text-sm text-[#9CA3AF]">
            Loading evaluation details...
          </Text>
        </View>
      ) : !details ? (
        <View className="py-12 items-center justify-center">
          <Text className="font-fredoka-one text-base text-[#9CA3AF]">
            Unable to load evaluation details.
          </Text>
        </View>
      ) : (
        <View>
          {/* CATEGORY & SCORE HEADER */}
          <View className="mb-4">
            <View className="bg-[#F1F1F1] rounded-xl px-4 py-3 flex-row items-center justify-between">
              <View className="flex-1 mr-2">
                <Text className="font-fredoka-one text-[#4B5563] text-base" numberOfLines={1}>
                  Category: {details.category || 'General'}
                </Text>
                <Text className="font-quicksand-medium text-[#6B7280] text-xs mt-0.5" numberOfLines={1}>
                  Validated Learning Session
                </Text>
              </View>

              {/* Total Score Badge */}
              <View
                className="px-3 py-1.5 rounded-[8px] border-[2px] items-center justify-center bg-[#F0FDF4]"
                style={{
                  borderColor: '#86EFAC',
                  shadowColor: '#86EFAC',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                <Text className="font-fredoka-one text-sm text-[#15803D]">
                  {totalPoints} / 20
                </Text>
                <Text className="font-fredoka-one text-[9px] text-[#166534] uppercase">
                  SCORE
                </Text>
              </View>
            </View>
          </View>

          {/* EVALUATION SCORES BREAKDOWN */}
          <View className="mb-4">
            <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">EVALUATION SCORES</Text>
            <View className="gap-2.5">
              {RUBRIC_CRITERIA.map((criterion) => {
                const score = Number(rubricObj?.[criterion.key]) || 0;
                const scaleInfo = RUBRIC_SCALE[score] || RUBRIC_SCALE[0];

                return (
                  <View
                    key={criterion.key}
                    className="bg-white border-[2px] border-[#F1F1F1] rounded-xl p-3.5"
                    style={{
                      shadowColor: '#F1F1F1',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 2,
                    }}
                  >
                    <View className="flex-row items-center justify-between flex-wrap gap-2 mb-1">
                      <Text className="font-fredoka-one text-base text-[#4B5563]">
                        {criterion.title}
                      </Text>

                      <View
                        className="px-2.5 py-0.5 rounded-[6px] border-[2px] items-center justify-center"
                        style={{
                          backgroundColor: scaleInfo.bgColor,
                          borderColor: scaleInfo.borderColor,
                        }}
                      >
                        <Text
                          className="font-fredoka-one text-xs uppercase"
                          style={{ color: scaleInfo.color }}
                        >
                          {score} • {scaleInfo.label}
                        </Text>
                      </View>
                    </View>

                    <Text className="font-quicksand-medium text-xs text-[#4B5563] leading-4">
                      {scaleInfo.description}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* TEACHER REMARKS */}
          <View className="mb-2">
            <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">TEACHER REMARKS</Text>
            <View className="bg-[#F1F1F1] rounded-xl px-4 py-3 min-h-[70px]">
              {details.teacherFeedback?.trim() ? (
                <Text className="font-quicksand-medium text-sm text-[#4B5563] leading-5">
                  {details.teacherFeedback.trim()}
                </Text>
              ) : (
                <Text className="font-quicksand-medium text-sm text-[#9CA3AF] italic">
                  No teacher remarks entered.
                </Text>
              )}
            </View>
          </View>
        </View>
      )}
    </BaseModal>
  );
}

export default ParentEvaluationReviewModal;
