import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View, useWindowDimensions } from 'react-native';
import { BaseModal } from '../home/base-modal';
import { getSessionEvaluation, SessionEvaluationDetails } from '../../../src/services/analytics';

interface EvaluationReviewModalProps {
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
    color: '#EF4444',
    bgColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  1: {
    label: 'Oh no',
    description: 'If a student is not focusing on an object',
    color: '#FF8870',
    bgColor: '#FFDBD4',
    borderColor: '#FF8870',
  },
  2: {
    label: 'OK!',
    description: 'If the pupil views the object halfway when it is moving',
    color: '#FFAE02',
    bgColor: '#FFF3C4',
    borderColor: '#FFAE02',
  },
  3: {
    label: 'Good job!',
    description: 'The pupil looks at the object for a brief period of time',
    color: '#62A9E6',
    bgColor: '#BBE8FB',
    borderColor: '#62A9E6',
  },
  4: {
    label: 'Great job!',
    description: 'If the pupil looks at the object for an extended period of time',
    color: '#179D33',
    bgColor: '#CBFAC4',
    borderColor: '#179D33',
  },
};

export function EvaluationReviewModal({
  visible,
  sessionId,
  onClose,
  isTablet: isTabletProp,
}: EvaluationReviewModalProps) {
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
      console.error('EvaluationReviewModal: failed to load evaluation', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe parsing helper for rubric evaluation JSON/object
  const rubricObj = (() => {
    if (!details?.rubricEvaluation) return {};
    if (typeof details.rubricEvaluation === 'string') {
      try {
        return JSON.parse(details.rubricEvaluation);
      } catch (e) {
        console.error('EvaluationReviewModal: failed to parse rubric evaluation string', e);
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
      title="Evaluation Review"
      isTablet={isTablet}
      cancelLabel="CLOSE"
      heightClassName={isTablet ? 'h-[72%]' : 'h-[78%]' }
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
          {/* LEARNER INFO */}
          <View className="mb-4">
            <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">LEARNER INFO</Text>
            <View className="bg-[#F1F1F1] rounded-xl px-4 py-3 flex-row items-center justify-between">
              <View className="flex-1 mr-2">
                <Text className="font-fredoka-one text-[#4B5563] text-base" numberOfLines={1}>
                  {details.studentName}
                </Text>
                <Text className="font-quicksand-medium text-[#9CA3AF] text-xs mt-0.5" numberOfLines={1}>
                  Category: {details.category}
                </Text>
              </View>

              {/* Total Score Badge */}
              <View
                className="px-3 py-1.5 rounded-[8px] border-[2px] items-center justify-center bg-white"
                style={{
                  borderColor: '#CBFAC4',
                  shadowColor: '#CBFAC4',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                <Text className="font-fredoka-one text-sm text-[#179D33]">
                  {totalPoints} / 20
                </Text>
                <Text className="font-fredoka-one text-[9px] text-[#179D33] uppercase">
                  SCORE
                </Text>
              </View>
            </View>
          </View>

          {/* EVALUATION SCORES */}
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

                    <Text className="font-quicksand-medium text-xs text-[#9CA3AF] leading-4">
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

export default EvaluationReviewModal;
