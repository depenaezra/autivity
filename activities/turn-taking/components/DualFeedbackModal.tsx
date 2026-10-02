import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { RubricEvaluation, validateSession } from '@/src/services/sessions';
import { speakInstruction } from '@/src/utils/speech';
import { TurnTakingPlayer } from '../types';

export const RUBRIC_CRITERIA = [
  { key: 'looking_at_objects', title: 'Looking at Objects', icon: 'eye' },
  { key: 'concentrating', title: 'Concentrating', icon: 'zap' },
  { key: 'performing_task', title: 'Performing Task', icon: 'activity' },
  { key: 'following_instructions', title: 'Following Instructions', icon: 'list' },
  { key: 'completed_work', title: 'Completed Work', icon: 'check-circle' },
] as const;

export const RUBRIC_SCALE: Record<
  number,
  {
    label: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
    iconName: keyof typeof Ionicons.glyphMap;
  }
> = {
  0: {
    label: 'Try again',
    description: 'The task will be repeated by the pupil',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    iconName: 'refresh-circle',
  },
  1: {
    label: 'Oh no',
    description: 'If a student is not focusing on an object',
    color: '#F97316',
    bgColor: '#FFF7ED',
    borderColor: '#FDBA74',
    iconName: 'alert-circle',
  },
  2: {
    label: 'OK!',
    description: 'If the pupil views the object halfway when it is moving',
    color: '#EAB308',
    bgColor: '#FEF9C3',
    borderColor: '#FDE047',
    iconName: 'thumbs-up',
  },
  3: {
    label: 'Good job!',
    description: 'The pupil looks at the object for a brief period of time',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    borderColor: '#93C5FD',
    iconName: 'star',
  },
  4: {
    label: 'Great job!',
    description: 'If the pupil looks at the object for an extended period of time',
    color: '#10B981',
    bgColor: '#ECFDF5',
    borderColor: '#6EE7B7',
    iconName: 'trophy',
  },
};

export interface TeacherDualEvaluationResult {
  p1: { scores: RubricEvaluation; feedback: string };
  p2: { scores: RubricEvaluation; feedback: string };
}

interface DualFeedbackModalProps {
  visible: boolean;
  player1: TurnTakingPlayer;
  player2: TurnTakingPlayer;
  session1Id: string | null;
  session2Id: string | null;
  categoryTitle?: string;
  onClose: () => void;
  onComplete: (evaluations: TeacherDualEvaluationResult) => void;
}

const DEFAULT_SCORES: RubricEvaluation = {
  looking_at_objects: 4,
  concentrating: 4,
  performing_task: 4,
  following_instructions: 4,
  completed_work: 4,
};

export default function DualFeedbackModal({
  visible,
  player1,
  player2,
  session1Id,
  session2Id,
  categoryTitle = 'Tracing',
  onClose,
  onComplete,
}: DualFeedbackModalProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Active student evaluation: 0 = Player 1, 1 = Player 2
  const [currentStudentIndex, setCurrentStudentIndex] = useState<0 | 1>(0);
  const [step, setStep] = useState<'draft' | 'review'>('draft');

  // Player 1 evaluation state
  const [p1Scores, setP1Scores] = useState<RubricEvaluation>({ ...DEFAULT_SCORES });
  const [p1Feedback, setP1Feedback] = useState('');
  const [p1Submitted, setP1Submitted] = useState(false);

  // Player 2 evaluation state
  const [p2Scores, setP2Scores] = useState<RubricEvaluation>({ ...DEFAULT_SCORES });
  const [p2Feedback, setP2Feedback] = useState('');
  const [p2Submitted, setP2Submitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentStudentIndex(0);
      setStep('draft');
      setP1Scores({ ...DEFAULT_SCORES });
      setP1Feedback('');
      setP1Submitted(false);
      setP2Scores({ ...DEFAULT_SCORES });
      setP2Feedback('');
      setP2Submitted(false);
      setIsSubmitting(false);

      if (player1?.name) {
        speakInstruction(`Teacher evaluation for ${player1.name}. Please select your ratings.`);
      }
    }
  }, [visible, player1?.name]);

  const currentStudent = currentStudentIndex === 0 ? player1 : player2;
  const currentSessionId = currentStudentIndex === 0 ? session1Id : session2Id;
  const currentScores = currentStudentIndex === 0 ? p1Scores : p2Scores;
  const currentFeedback = currentStudentIndex === 0 ? p1Feedback : p2Feedback;

  const handleScoreSelect = (key: keyof RubricEvaluation, score: number) => {
    if (currentStudentIndex === 0) {
      setP1Scores((prev) => ({ ...prev, [key]: score }));
    } else {
      setP2Scores((prev) => ({ ...prev, [key]: score }));
    }
  };

  const handleFeedbackChange = (text: string) => {
    if (currentStudentIndex === 0) {
      setP1Feedback(text);
    } else {
      setP2Feedback(text);
    }
  };

  const handleConfirmAndSendCurrentStudent = async () => {
    setIsSubmitting(true);

    try {
      if (currentSessionId) {
        await validateSession(
          currentSessionId,
          currentScores,
          currentFeedback.trim()
        );
      }

      if (currentStudentIndex === 0) {
        // Player 1 submitted successfully -> proceed to Player 2
        setP1Submitted(true);
        setIsSubmitting(false);
        setCurrentStudentIndex(1);
        setStep('draft');

        speakInstruction(`Great! Now please evaluate ${player2.name}.`);
      } else {
        // Player 2 submitted successfully -> all done!
        setP2Submitted(true);
        setIsSubmitting(false);

        speakInstruction('Both teacher evaluations have been saved successfully!');

        onComplete({
          p1: { scores: p1Scores, feedback: p1Feedback },
          p2: { scores: p2Scores, feedback: p2Feedback },
        });
        onClose();
      }
    } catch (error: any) {
      setIsSubmitting(false);
      Alert.alert(
        'Submission Failed',
        error.message || 'Could not save feedback to database.'
      );
    }
  };

  const totalPoints = Object.values(currentScores).reduce((sum, val) => sum + val, 0);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-black/60 justify-center items-center p-4 z-50"
        style={{ flex: 1 }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: isTablet ? 700 : undefined,
            maxHeight: isTablet ? '85%' : '90%',
          }}
          className="bg-white rounded-[28px] border-[3px] border-[#D1D5DB] border-b-[6px] shadow-2xl overflow-hidden flex-col flex-1"
        >
          {/* Modal Header (Exact same design and tokens as standard FeedbackModal) */}
          <View className="bg-[#F5F8FA] px-6 py-5 border-b border-[#E5E7EB] flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              {/* 2-Student Progression Pills */}
              <View className="flex-row items-center gap-2 mb-1.5">
                <View
                  className={`px-3 py-1 rounded-full border flex-row items-center gap-1.5 ${
                    currentStudentIndex === 0
                      ? 'bg-[#EBF5FF] border-[#62A9E6]'
                      : p1Submitted
                      ? 'bg-[#ECFDF5] border-[#10B981]'
                      : 'bg-[#F3F4F6] border-[#D1D5DB]'
                  }`}
                >
                  <Ionicons
                    name={p1Submitted ? 'checkmark-circle' : 'person'}
                    size={13}
                    color={
                      p1Submitted
                        ? '#10B981'
                        : currentStudentIndex === 0
                        ? '#2563EB'
                        : '#6B7280'
                    }
                  />
                  <Text
                    className={`font-quicksand-bold text-xs ${
                      currentStudentIndex === 0
                        ? 'text-[#2563EB]'
                        : p1Submitted
                        ? 'text-[#10B981]'
                        : 'text-[#6B7280]'
                    }`}
                  >
                    1. {player1.name} {p1Submitted ? '✓' : ''}
                  </Text>
                </View>

                <Ionicons name="arrow-forward" size={12} color="#9CA3AF" />

                <View
                  className={`px-3 py-1 rounded-full border flex-row items-center gap-1.5 ${
                    currentStudentIndex === 1
                      ? 'bg-[#EBF5FF] border-[#62A9E6]'
                      : p2Submitted
                      ? 'bg-[#ECFDF5] border-[#10B981]'
                      : 'bg-[#F3F4F6] border-[#D1D5DB]'
                  }`}
                >
                  <Ionicons
                    name={p2Submitted ? 'checkmark-circle' : 'person'}
                    size={13}
                    color={
                      p2Submitted
                        ? '#10B981'
                        : currentStudentIndex === 1
                        ? '#2563EB'
                        : '#6B7280'
                    }
                  />
                  <Text
                    className={`font-quicksand-bold text-xs ${
                      currentStudentIndex === 1
                        ? 'text-[#2563EB]'
                        : p2Submitted
                        ? 'text-[#10B981]'
                        : 'text-[#6B7280]'
                    }`}
                  >
                    2. {player2.name} {p2Submitted ? '✓' : ''}
                  </Text>
                </View>
              </View>

              {/* Title & Step Badge */}
              <View className="flex-row items-center gap-2">
                <Text className="font-fredoka-one text-2xl text-[#4B5563]">
                  {step === 'draft'
                    ? 'Teacher Evaluation Rubric'
                    : 'Review & Confirm Evaluation'}
                </Text>
                <View className="bg-[#EBF5FF] border border-[#A3CFF1] px-2.5 py-0.5 rounded-full">
                  <Text className="font-quicksand-bold text-[#62A9E6] text-xs uppercase tracking-wider">
                    Student {currentStudentIndex + 1} of 2 • {step === 'draft' ? 'Step 1 of 2' : 'Step 2 of 2'}
                  </Text>
                </View>
              </View>

              <Text
                className="font-quicksand-medium text-[#6B7280] text-sm mt-1"
                numberOfLines={1}
              >
                Learner: <Text className="font-quicksand-bold text-[#4B5563]">{currentStudent.name}</Text> ({currentStudentIndex === 0 ? 'Player 1' : 'Player 2'}) • Session: Turn-Taking ({categoryTitle})
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              disabled={isSubmitting}
              className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] items-center justify-center shadow-sm"
            >
              <Feather name="x" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content Body */}
          <ScrollView
            className="flex-1 px-6 py-5"
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="always"
            bounces={false}
          >
            {step === 'draft' ? (
              <View className="gap-6 pb-6">
                <Text className="font-quicksand-bold text-[#6B7280] text-sm">
                  Select a score (0 - 4) for each rubric criterion below for{' '}
                  <Text className="text-[#2563EB]">{currentStudent.name}</Text>:
                </Text>

                {/* 5 Rubric Criteria Cards (Identical to standard FeedbackModal) */}
                {RUBRIC_CRITERIA.map((item) => {
                  const currentScore = currentScores[item.key as keyof RubricEvaluation];
                  const scaleInfo = RUBRIC_SCALE[currentScore];

                  return (
                    <View
                      key={item.key}
                      className="bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-4 shadow-sm"
                    >
                      {/* Criterion Title */}
                      <View className="flex-row items-center gap-2 mb-3">
                        <View className="w-8 h-8 rounded-full bg-[#EBF5FF] items-center justify-center border border-[#A3CFF1]">
                          <Feather name={item.icon as any} size={16} color="#62A9E6" />
                        </View>
                        <Text className="font-fredoka-one text-lg text-[#4B5563] flex-1">
                          {item.title}
                        </Text>
                        <View
                          className="px-3 py-1 rounded-full border flex-row items-center gap-1.5"
                          style={{
                            backgroundColor: scaleInfo.bgColor,
                            borderColor: scaleInfo.borderColor,
                          }}
                        >
                          <Ionicons name={scaleInfo.iconName} size={14} color={scaleInfo.color} />
                          <Text
                            className="font-quicksand-bold text-xs"
                            style={{ color: scaleInfo.color }}
                          >
                            Score {currentScore}: {scaleInfo.label}
                          </Text>
                        </View>
                      </View>

                      {/* 5 Selectable Buttons (0-4) */}
                      <View className="flex-row items-center justify-between gap-2 mb-3">
                        {[0, 1, 2, 3, 4].map((pointValue) => {
                          const isSelected = currentScore === pointValue;
                          const pointInfo = RUBRIC_SCALE[pointValue];

                          return (
                            <TouchableOpacity
                              key={pointValue}
                              activeOpacity={0.8}
                              onPress={() =>
                                handleScoreSelect(item.key as keyof RubricEvaluation, pointValue)
                              }
                              className={`flex-1 py-3 rounded-xl border-[2px] items-center justify-center transition-all ${
                                isSelected
                                  ? 'border-b-[4px]'
                                  : 'bg-[#F9FAFB] border-[#E5E7EB]'
                              }`}
                              style={
                                isSelected
                                  ? {
                                      backgroundColor: pointInfo.bgColor,
                                      borderColor: pointInfo.color,
                                    }
                                  : {}
                              }
                            >
                              <Text
                                className={`font-fredoka-one text-lg ${
                                  isSelected ? '' : 'text-[#6B7280]'
                                }`}
                                style={isSelected ? { color: pointInfo.color } : {}}
                              >
                                {pointValue}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {/* Revealed Description Card for Selected Score */}
                      <View
                        className="p-3 rounded-xl border flex-row items-start gap-2.5"
                        style={{
                          backgroundColor: scaleInfo.bgColor,
                          borderColor: scaleInfo.borderColor,
                        }}
                      >
                        <Ionicons
                          name={scaleInfo.iconName}
                          size={20}
                          color={scaleInfo.color}
                          style={{ marginTop: 1 }}
                        />
                        <View className="flex-1">
                          <Text
                            className="font-quicksand-bold text-xs mb-0.5"
                            style={{ color: scaleInfo.color }}
                          >
                            {scaleInfo.label} (Score {currentScore} of 4)
                          </Text>
                          <Text className="font-quicksand-medium text-xs text-[#4B5563] leading-4">
                            {scaleInfo.description}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}

                {/* Multiline Text Input for Teacher Feedback */}
                <View className="bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-4 shadow-sm">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Feather name="message-square" size={18} color="#62A9E6" />
                    <Text className="font-fredoka-one text-lg text-[#4B5563]">
                      Teacher Remarks & Notes for {currentStudent.name}
                    </Text>
                  </View>
                  <Text className="font-quicksand-medium text-xs text-[#6B7280] mb-3">
                    Add free-form notes on pupil performance, focus level, or recommendations for parents.
                  </Text>
                  <TextInput
                    placeholder={`E.g., Great turn-taking effort today! ${currentStudent.name} maintained focus and waited patiently...`}
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    className="w-full min-h-[110px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 text-sm font-quicksand-medium text-[#4B5563]"
                    value={currentFeedback}
                    onChangeText={handleFeedbackChange}
                  />
                </View>
              </View>
            ) : (
              /* Review View (Exact same design and tokens as standard FeedbackModal) */
              <View className="gap-6 pb-6">
                <View className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-4 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Ionicons name="shield-checkmark" size={32} color="#10B981" />
                    <View className="flex-1">
                      <Text className="font-fredoka-one text-lg text-[#065F46]">
                        Ready to Validate {currentStudent.name}'s Session
                      </Text>
                      <Text className="font-quicksand-medium text-xs text-[#047857]">
                        Please double check the 0-4 score evaluations and notes below before finalizing.
                      </Text>
                    </View>
                  </View>
                  <View className="bg-white px-3.5 py-2 rounded-xl border border-[#A7F3D0] items-center ml-2">
                    <Text className="font-fredoka-one text-xl text-[#10B981]">
                      {totalPoints}/20
                    </Text>
                    <Text className="font-quicksand-bold text-[10px] text-[#047857]">TOTAL SCORE</Text>
                  </View>
                </View>

                {/* Summary of 5 Rubric Criteria */}
                <View className="bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-4 shadow-sm gap-3">
                  <Text className="font-fredoka-one text-base text-[#4B5563] border-b border-[#F3F4F6] pb-2">
                    Rubric Criteria Evaluation Summary: {currentStudent.name}
                  </Text>
                  {RUBRIC_CRITERIA.map((item) => {
                    const value = currentScores[item.key as keyof RubricEvaluation];
                    const info = RUBRIC_SCALE[value];
                    return (
                      <View
                        key={item.key}
                        className="flex-row items-start justify-between py-2 border-b border-[#F9FAFB]"
                      >
                        <View className="flex-1 mr-3">
                          <View className="flex-row items-center gap-1.5">
                            <Text className="font-quicksand-bold text-sm text-[#4B5563]">
                              {item.title}
                            </Text>
                          </View>
                          <Text className="font-quicksand-medium text-xs text-[#6B7280] mt-0.5">
                            {info.description}
                          </Text>
                        </View>
                        <View
                          className="px-3 py-1 rounded-full border flex-row items-center gap-1 self-start"
                          style={{
                            backgroundColor: info.bgColor,
                            borderColor: info.borderColor,
                          }}
                        >
                          <Ionicons name={info.iconName} size={13} color={info.color} />
                          <Text
                            className="font-quicksand-bold text-xs"
                            style={{ color: info.color }}
                          >
                            Score {value} • {info.label}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Summary of Teacher Notes */}
                <View className="bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-4 shadow-sm">
                  <Text className="font-fredoka-one text-base text-[#4B5563] border-b border-[#F3F4F6] pb-2 mb-2">
                    Teacher Remarks Summary
                  </Text>
                  {currentFeedback.trim() ? (
                    <Text className="font-quicksand-medium text-sm text-[#4B5563] leading-5">
                      &ldquo;{currentFeedback.trim()}&rdquo;
                    </Text>
                  ) : (
                    <Text className="font-quicksand-medium text-sm text-[#9CA3AF] italic">
                      No free-form remarks entered.
                    </Text>
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Modal Footer Actions (Exact match to standard FeedbackModal) */}
          <View className="bg-[#F5F8FA] px-6 py-4 border-t border-[#E5E7EB] flex-row gap-3 items-center">
            {step === 'draft' ? (
              <>
                {/* Do Later / Cancel Button */}
                <Pressable
                  onPress={onClose}
                  disabled={isSubmitting}
                  className="flex-1 h-13 py-3.5 bg-white border border-[#D1D5DB] border-b-[3px] rounded-full items-center justify-center active:bg-[#F3F4F6]"
                >
                  <Text className="font-quicksand-bold text-[#6B7280] text-base">
                    Do Later / Cancel
                  </Text>
                </Pressable>

                {/* Next Button */}
                <Pressable
                  onPress={() => setStep('review')}
                  disabled={isSubmitting}
                  className="flex-1 h-13 py-3.5 bg-[#62A9E6] border border-[#4895D6] border-b-[4px] rounded-full items-center justify-center active:bg-[#5298D4]"
                >
                  <Text className="font-fredoka-regular text-white text-lg">Next</Text>
                </Pressable>
              </>
            ) : (
              <>
                {/* Back to Draft Button */}
                <Pressable
                  onPress={() => setStep('draft')}
                  disabled={isSubmitting}
                  className="flex-1 h-13 py-3.5 bg-white border border-[#D1D5DB] border-b-[3px] rounded-full items-center justify-center active:bg-[#F3F4F6]"
                >
                  <Text className="font-quicksand-bold text-[#6B7280] text-base">
                    Back to Edit
                  </Text>
                </Pressable>

                {/* Confirm & Send Button */}
                <Pressable
                  onPress={handleConfirmAndSendCurrentStudent}
                  disabled={isSubmitting}
                  className="flex-[1.4] h-13 py-3.5 bg-[#10B981] border border-[#059669] border-b-[4px] rounded-full items-center justify-center flex-row gap-2 active:bg-[#059669]"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Ionicons
                      name={currentStudentIndex === 0 ? 'arrow-forward' : 'send'}
                      size={18}
                      color="white"
                    />
                  )}
                  <Text className="font-fredoka-regular text-white text-lg">
                    {isSubmitting
                      ? 'Saving...'
                      : currentStudentIndex === 0
                      ? `Save & Evaluate ${player2.name}`
                      : 'Confirm & Send to Parent'}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
