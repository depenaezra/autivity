import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, Text, useWindowDimensions, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as Haptics from 'expo-haptics';
import AnimatedReanimated, {
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ActivityTypeFilter } from '../../../../src/services/analytics';
import { getStudentSessions, SessionRecord } from '../../../../src/services/student-analytics';
import { filterSessionsByPeriod } from '../../../../src/utils/dashboardFilters';
import FeedbackModal from '../../../feedback-modal';
import EvaluationReviewModal from '../evaluation-review-modal';
import EditIcon from '../../../../assets/images/teacher/class/icon-button-edit.svg';
import { BaseModal } from '../../home/base-modal';

interface SessionsProps {
  studentId: string;
  studentName: string;
  filter?: string;
  refreshTrigger?: number;
  activityType?: ActivityTypeFilter;
  onEvaluationValidated?: () => void;
}

type StatusFilter = 'all' | 'unvalidated' | 'validated';
type SourceFilter = 'all' | 'app' | 'classroom';
type PromptFilter = 'all' | 'independent' | 'assisted';

interface SessionFiltersState {
  status: StatusFilter;
  source: SourceFilter;
  prompt: PromptFilter;
}

const DEFAULT_FILTERS: SessionFiltersState = {
  status: 'all',
  source: 'all',
  prompt: 'all',
};

function SessionSkeletonItem({ isTablet }: { isTablet: boolean }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 750 }),
        withTiming(0.4, { duration: 750 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedReanimated.View
      className={`bg-white border-[2px] border-[#F1F1F1] flex-row items-center justify-between overflow-hidden ${
        isTablet ? 'rounded-[24px] p-5' : 'rounded-[16px] p-3.5'
      }`}
      style={[
        {
          shadowColor: '#F1F1F1',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 2,
        },
        animatedStyle,
      ]}
    >
      <View className="w-1.5 self-stretch rounded-full mr-3 bg-[#E5E7EB]" />
      <View className="flex-1 pr-2">
        <View className={`bg-[#E5E7EB] rounded-[4px] ${isTablet ? 'h-5 w-40 mb-2' : 'h-4 w-28 mb-1.5'}`} />
        <View className={`bg-[#E5E7EB] rounded-[4px] ${isTablet ? 'h-4 w-56' : 'h-3.5 w-36'}`} />
      </View>
      <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'h-7 w-24' : 'h-5 w-16'}`} />
    </AnimatedReanimated.View>
  );
}

export default function Sessions({
  studentId,
  studentName,
  filter,
  refreshTrigger,
  activityType,
  onEvaluationValidated,
}: SessionsProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionFilters, setSessionFilters] = useState<SessionFiltersState>(DEFAULT_FILTERS);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Active open Swipeable ref
  const openSwipeableRef = useRef<any>(null);

  // Modal states for pending validation (FeedbackModal) vs validated review (EvaluationReviewModal)
  const [activeModalSession, setActiveModalSession] = useState<{
    id: string;
    studentId: string;
    activityName: string;
    status?: 'pending' | 'validated';
    rubric_evaluation?: any;
    teacher_feedback?: string;
    validated_at?: string;
  } | null>(null);

  const [isEditingSession, setIsEditingSession] = useState<SessionRecord | null>(null);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedReviewSessionId, setSelectedReviewSessionId] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const data = await getStudentSessions(studentId, activityType);
      setSessions(data);
      setError(null);
    } catch (err: any) {
      console.error('Sessions component: failed to load sessions', err);
      setError('Failed to load completed sessions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [studentId, activityType, refreshTrigger]);

  const handleCardPress = (session: SessionRecord) => {
    if (session.status === 'validated') {
      setSelectedReviewSessionId(session.id);
      setIsReviewModalVisible(true);
    } else {
      setActiveModalSession({
        id: session.id,
        studentId: session.studentId,
        activityName: session.activityName,
        status: session.status,
        rubric_evaluation: session.rubric_evaluation,
        teacher_feedback: session.teacher_feedback,
        validated_at: session.validated_at,
      });
    }
  };

  const handleEditPress = (session: SessionRecord) => {
    setIsEditingSession(session);
  };

  const handleValidationSuccess = () => {
    fetchSessions();
    onEvaluationValidated?.();
  };

  const activeFilterCount =
    (sessionFilters.status !== 'all' ? 1 : 0) +
    (sessionFilters.source !== 'all' ? 1 : 0) +
    (sessionFilters.prompt !== 'all' ? 1 : 0);

  const handleResetFilters = () => {
    setSessionFilters(DEFAULT_FILTERS);
  };

  const filteredSessions = useMemo(() => {
    let list = sessions;
    if (filter) {
      const records = sessions.map((s) => ({ ...s, rawDate: s.date, date: new Date(s.date) }));
      const filtered = filterSessionsByPeriod(records as any, filter) as any[];
      list = filtered.map((r) => ({
        ...r,
        date: r.rawDate || (r.date instanceof Date ? r.date.toLocaleDateString() : String(r.date || '')),
      }));
    }

    return list.filter((s) => {
      // 1. Status Filter
      if (sessionFilters.status === 'unvalidated' && s.status !== 'pending') return false;
      if (sessionFilters.status === 'validated' && s.status !== 'validated') return false;

      // 2. Activity Source Filter (App vs Classroom)
      if (sessionFilters.source === 'app' && s.activityType !== 'app') return false;
      if (sessionFilters.source === 'classroom' && s.activityType !== 'classroom') return false;

      // 3. Prompt / Independence Filter
      const isIndep = !s.hints_used || s.hints_used === 0;
      if (sessionFilters.prompt === 'independent' && !isIndep) return false;
      if (sessionFilters.prompt === 'assisted' && isIndep) return false;

      return true;
    });
  }, [sessions, sessionFilters, filter]);

  const getTriggerLabel = () => {
    if (activeFilterCount === 0) {
      return `ALL SESSIONS (${filteredSessions.length})`;
    }
    if (activeFilterCount === 1) {
      if (sessionFilters.status === 'unvalidated') return `PENDING (${filteredSessions.length})`;
      if (sessionFilters.status === 'validated') return `EVALUATED (${filteredSessions.length})`;
      if (sessionFilters.source === 'app') return `APP (${filteredSessions.length})`;
      if (sessionFilters.source === 'classroom') return `CLASSROOM (${filteredSessions.length})`;
      if (sessionFilters.prompt === 'independent') return `INDEPENDENT (${filteredSessions.length})`;
      if (sessionFilters.prompt === 'assisted') return `ASSISTED (${filteredSessions.length})`;
    }
    return `FILTERS (${activeFilterCount}) • ${filteredSessions.length}`;
  };

  const statusOptions: { label: string; value: StatusFilter; icon: keyof typeof Feather.glyphMap; count: number }[] = [
    { label: 'All', value: 'all', icon: 'layers', count: sessions.length },
    { label: 'Pending', value: 'unvalidated', icon: 'clock', count: sessions.filter((s) => s.status === 'pending').length },
    { label: 'Evaluated', value: 'validated', icon: 'check-circle', count: sessions.filter((s) => s.status === 'validated').length },
  ];

  const sourceOptions: { label: string; value: SourceFilter; icon: keyof typeof Feather.glyphMap; count: number }[] = [
    { label: 'All', value: 'all', icon: 'grid', count: sessions.length },
    { label: 'App', value: 'app', icon: 'tablet', count: sessions.filter((s) => s.activityType === 'app').length },
    { label: 'Classroom', value: 'classroom', icon: 'book-open', count: sessions.filter((s) => s.activityType === 'classroom').length },
  ];

  const promptOptions: { label: string; value: PromptFilter; icon: keyof typeof Feather.glyphMap; count: number }[] = [
    { label: 'All', value: 'all', icon: 'list', count: sessions.length },
    { label: 'Independent', value: 'independent', icon: 'award', count: sessions.filter((s) => !s.hints_used || s.hints_used === 0).length },
    { label: 'Assisted', value: 'assisted', icon: 'help-circle', count: sessions.filter((s) => typeof s.hints_used === 'number' && s.hints_used > 0).length },
  ];

  const renderRightActions = (
    session: SessionRecord,
    swipeableRef: any,
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    const editScale = progress.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0.5, 1.1, 1],
      extrapolate: 'clamp',
    });
    const editOpacity = progress.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });
    const editTransX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 0],
      extrapolate: 'clamp',
    });

    return (
      <View className="flex-row items-center justify-end pl-4 pr-1 bg-white" style={{ height: '100%' }}>
        {/* EDIT */}
        <Animated.View
          style={{
            opacity: editOpacity,
            transform: [{ scale: editScale }, { translateX: editTransX }],
          }}
        >
          <Pressable
            onPress={() => {
              swipeableRef?.close();
              handleEditPress(session);
            }}
            className="flex-col items-center justify-center active:scale-95 transition-transform"
            style={{ width: isTablet ? 72 : 56 }}
          >
            <View className="items-center justify-center" style={{ height: isTablet ? 32 : 26 }}>
              <EditIcon width={isTablet ? 26 : 22} height={isTablet ? 26 : 22} />
            </View>
            <Text
              className={`font-fredoka-one text-[#62A9E6] text-center w-full px-1 ${
                isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'
              }`}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              EDIT
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  return (
    <View className="w-full mt-6 mb-12 pb-6">
      {/* Header and Filter Selector */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between flex-wrap gap-2">
          <View className="flex-row items-center gap-2">
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
              Completed Sessions
            </Text>
            <Pressable
              onPress={() => setShowInfo(!showInfo)}
              className="active:opacity-75 p-1"
            >
              <Feather name="info" size={isTablet ? 20 : 16} color="#62A9E6" />
            </Pressable>
          </View>

          {/* Compact Tactile Filter Dropdown Trigger + Quick Reset */}
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => setIsFilterModalOpen(true)}
              className="flex-row items-center justify-center gap-1.5 border-[2px] px-3 h-[34px] rounded-xl active:scale-95 transition-transform"
              style={{
                backgroundColor: activeFilterCount > 0 ? '#F0F9FF' : '#FFFFFF',
                borderColor: activeFilterCount > 0 ? '#62A9E6' : '#BBE8FB',
                shadowColor: activeFilterCount > 0 ? '#62A9E6' : '#BBE8FB',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              <Feather name="filter" size={13} color="#62A9E6" />
              <Text className="font-fredoka-one text-[#62A9E6] text-[11px] uppercase" numberOfLines={1}>
                {getTriggerLabel()}
              </Text>
              <Feather name="chevron-down" size={13} color="#62A9E6" />
            </Pressable>

            {activeFilterCount > 0 && (
              <Pressable
                onPress={handleResetFilters}
                className="h-[34px] px-3 rounded-[8px] border-[2px] border-[#FFDBD4] bg-white flex-row items-center justify-center gap-1.5 active:scale-95 transition-transform"
                style={{
                  shadowColor: '#FFDBD4',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                <Feather name="rotate-ccw" size={12} color="#FF3B3F" />
                <Text className="font-fredoka-one text-[11px] text-[#FF3B3F] uppercase">
                  Reset
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Full-width Info Banner Row below Title & Filters */}
        {showInfo && (
          <AnimatedReanimated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOutUp.duration(150)}
            className="w-full bg-[#F0F9FF] border border-[#BBE8FB] rounded-2xl p-3.5 mt-3 flex-row items-start gap-2.5 overflow-hidden"
          >
            <Feather name="info" size={isTablet ? 20 : 16} color="#62A9E6" style={{ marginTop: 2 }} />
            <View className="flex-1 flex-col gap-1.5">
              <Text className={`font-fredoka-one text-[#62A9E6] ${isTablet ? 'text-sm' : 'text-xs'}`}>
                WHAT DOES THIS SECTION MEAN?
              </Text>
              <Text className={`font-quicksand-medium text-[#484A4B] leading-relaxed ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                • <Text className="font-quicksand-bold text-[#62A9E6]">Session Verification:</Text> Validate pending sessions to evaluate student progress and publish updates directly to the Parent Portal.
              </Text>
              <Text className={`font-quicksand-medium text-[#484A4B] leading-relaxed ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                • <Text className="font-quicksand-bold text-[#62A9E6]">Rubric Scoring:</Text> Fill in 5-criterion rubric evaluations to capture concentration, instruction-following, and completion quality.
              </Text>
              <Text className={`font-quicksand-medium text-[#484A4B] leading-relaxed ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                • <Text className="font-quicksand-bold text-[#62A9E6]">Editing Feedback:</Text> Tap or swipe left on evaluated sessions to revise rubrics, notes, or classroom observations.
              </Text>
            </View>
          </AnimatedReanimated.View>
        )}
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="gap-3">
          <SessionSkeletonItem isTablet={isTablet} />
          <SessionSkeletonItem isTablet={isTablet} />
          <SessionSkeletonItem isTablet={isTablet} />
        </View>
      ) : error ? (
        <View className="w-full justify-center items-center py-6 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
          <Feather name="alert-circle" size={24} color="#EF4444" />
          <Text className="font-quicksand-semibold text-sm text-[#9CA3AF] mt-2">{error}</Text>
        </View>
      ) : filteredSessions.length === 0 ? (
        <View className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-2xl p-8 items-center justify-center">
          <Feather name="layers" size={isTablet ? 44 : 32} color="#9CA3AF" />
          <Text className="font-fredoka-one text-lg text-[#4B5563] mt-3 text-center">
            No Session Records
          </Text>
          <Text className="font-quicksand-medium text-sm text-[#9CA3AF] mt-1 text-center">
            {activeFilterCount > 0
              ? 'No sessions match the selected filter criteria.'
              : 'No recorded sessions for this learner yet.'}
          </Text>
          {activeFilterCount > 0 && (
            <Pressable
              onPress={handleResetFilters}
              className="mt-4 py-2.5 px-4 rounded-[8px] border-[2px] border-[#FFDBD4] bg-white flex-row items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{
                shadowColor: '#FFDBD4',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              <Feather name="rotate-ccw" size={13} color="#FF3B3F" />
              <Text className="font-fredoka-one text-xs text-[#FF3B3F] uppercase">
                Reset Filters
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View className="gap-3">
          {filteredSessions.map((session) => {
            const isPending = session.status === 'pending';
            const isIndependent = !session.hints_used || session.hints_used === 0;
            const accentColor = isPending ? '#FF8870' : '#179D33';
            let currentSwipeableRef: any = null;

            const cardContent = (
              <Pressable
                onPress={() => handleCardPress(session)}
                className="active:scale-[0.98] transition-transform"
              >
                <View
                  className={`bg-white border-[2px] border-[#F1F1F1] flex-row items-center justify-between overflow-hidden ${
                    isTablet ? 'rounded-[24px] p-5' : 'rounded-[16px] p-3.5'
                  }`}
                  style={{
                    shadowColor: '#F1F1F1',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 2,
                  }}
                >
                  {/* Left-Side Colored Accent Bar */}
                  <View
                    className="w-1.5 self-stretch rounded-full mr-3"
                    style={{ backgroundColor: accentColor }}
                  />

                  {/* Session Details */}
                  <View className="flex-1 pr-2">
                    {/* Domain Category Eyebrow */}
                    <View className="flex-row items-center gap-1.5 mb-1 flex-wrap">
                      <Text className={`font-fredoka-one text-[#9CA3AF] uppercase tracking-wider ${isTablet ? 'text-xs' : 'text-[10px]'}`}>
                        {session.category}
                      </Text>
                      {session.is_timed_out && (
                        <>
                          <Text className="text-[#D1D5DB] text-[10px]">•</Text>
                          <Text className={`font-quicksand-bold text-[#FF8870] ${isTablet ? 'text-xs' : 'text-[10px]'}`}>
                            Timed Out ({session.completed_count || 1}/3)
                          </Text>
                        </>
                      )}
                    </View>

                    {/* Activity Title + Colored App/Classroom Pill */}
                    <View className="flex-row items-center gap-2 flex-wrap">
                      <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-lg' : 'text-base'}`}>
                        {session.activityName}
                      </Text>

                      {/* Colored Activity Source Pill */}
                      <View
                        className="px-2.5 py-0.5 rounded-full border flex-row items-center gap-1"
                        style={{
                          backgroundColor: session.activityType === 'classroom' ? '#FAF5FF' : '#F0F9FF',
                          borderColor: session.activityType === 'classroom' ? '#DDD6FE' : '#BBE8FB',
                        }}
                      >
                        <Feather
                          name={session.activityType === 'classroom' ? 'book-open' : 'tablet'}
                          size={isTablet ? 11 : 9}
                          color={session.activityType === 'classroom' ? '#8B5CF6' : '#62A9E6'}
                        />
                        <Text
                          className={`font-fredoka-one uppercase ${isTablet ? 'text-xs' : 'text-[9px]'}`}
                          style={{ color: session.activityType === 'classroom' ? '#8B5CF6' : '#62A9E6' }}
                        >
                          {session.activityType === 'classroom' ? 'CLASSROOM' : 'APP'}
                        </Text>
                      </View>
                    </View>

                    {/* Optically-aligned Date & Duration Row + Independent Achievement Badge */}
                    <View className="flex-row items-center gap-2 mt-1.5 flex-wrap">
                      {session.date ? (
                        <View className="flex-row items-center gap-1">
                          <View className="justify-center items-center">
                            <Feather name="calendar" size={isTablet ? 12 : 10} color="#9CA3AF" />
                          </View>
                          <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-sm' : 'text-xs'}`}>
                            {typeof session.date === 'object' && session.date !== null && 'toLocaleDateString' in session.date
                              ? (session.date as Date).toLocaleDateString()
                              : String(session.date || '')}
                          </Text>
                        </View>
                      ) : null}

                      {session.date && session.duration ? (
                        <Text className="text-[#D1D5DB] text-xs">•</Text>
                      ) : null}

                      {session.duration ? (
                        <View className="flex-row items-center gap-1">
                          <View className="justify-center items-center">
                            <Feather name="clock" size={isTablet ? 12 : 10} color="#9CA3AF" />
                          </View>
                          <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-sm' : 'text-xs'}`}>
                            {session.duration}
                          </Text>
                        </View>
                      ) : null}

                      <Text className="text-[#D1D5DB] text-xs">•</Text>

                      {/* Prompts / Noticeable Independent Achievement Badge */}
                      {isIndependent ? (
                        <View
                          className="px-2.5 py-0.5 rounded-full flex-row items-center gap-1"
                          style={{
                            backgroundColor: '#E8F8ED',
                            borderWidth: 1.5,
                            borderColor: '#86EFAC',
                            shadowColor: '#86EFAC',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.6,
                            shadowRadius: 1,
                            elevation: 1,
                          }}
                        >
                          <Feather name="award" size={isTablet ? 12 : 10} color="#15803D" />
                          <Text className={`font-fredoka-one uppercase text-[#15803D] tracking-wide ${isTablet ? 'text-xs' : 'text-[10px]'}`}>
                            INDEPENDENT
                          </Text>
                        </View>
                      ) : (
                        <View className="flex-row items-center gap-1">
                          <Feather name="help-circle" size={isTablet ? 12 : 10} color="#9CA3AF" />
                          <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-sm' : 'text-xs'}`}>
                            {session.hints_used} {session.hints_used === 1 ? 'hint' : 'hints'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Clean Single Status Badge on Right */}
                  <View
                    className="px-2.5 py-1 rounded-xl border flex-row items-center gap-1 shrink-0 self-center ml-2"
                    style={{
                      backgroundColor: isPending ? '#FFF7ED' : '#F8FAFC',
                      borderColor: isPending ? '#FFDBD4' : '#E2E8F0',
                    }}
                  >
                    <Feather
                      name={isPending ? 'clock' : 'check-circle'}
                      size={isTablet ? 12 : 10}
                      color={isPending ? '#FF8870' : '#179D33'}
                    />
                    <Text
                      className={`font-fredoka-one uppercase ${isTablet ? 'text-xs' : 'text-[10px]'}`}
                      style={{ color: isPending ? '#FF8870' : '#64748B' }}
                    >
                      {isPending ? 'PENDING' : 'EVALUATED'}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );

            if (!isPending) {
              return (
                <Swipeable
                  key={session.id}
                  ref={(ref) => {
                    currentSwipeableRef = ref;
                  }}
                  renderRightActions={(progress) =>
                    renderRightActions(session, currentSwipeableRef, progress)
                  }
                  onSwipeableWillOpen={() => {
                    if (openSwipeableRef.current && openSwipeableRef.current !== currentSwipeableRef) {
                      openSwipeableRef.current.close();
                    }
                    openSwipeableRef.current = currentSwipeableRef;
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  onSwipeableClose={() => {
                    if (openSwipeableRef.current === currentSwipeableRef) {
                      openSwipeableRef.current = null;
                    }
                  }}
                  friction={1.5}
                  overshootRight={false}
                  rightThreshold={40}
                >
                  {cardContent}
                </Swipeable>
              );
            }

            return <React.Fragment key={session.id}>{cardContent}</React.Fragment>;
          })}
        </View>
      )}

      {/* Validation Rubric Feedback Modal (For Pending Sessions) */}
      <FeedbackModal
        visible={!!activeModalSession}
        sessionId={activeModalSession?.id || null}
        activityTitle={activeModalSession?.activityName}
        studentName={studentName}
        onClose={() => setActiveModalSession(null)}
        onSuccess={handleValidationSuccess}
        isReadOnly={false}
        isEditing={false}
        initialScores={activeModalSession?.rubric_evaluation}
        initialFeedback={activeModalSession?.teacher_feedback}
        validatedAt={activeModalSession?.validated_at}
      />

      {/* Edit Rubric Feedback Modal (For Validated Sessions via Swipe Edit Button) */}
      <FeedbackModal
        visible={!!isEditingSession}
        sessionId={isEditingSession?.id || null}
        activityTitle={isEditingSession?.activityName}
        studentName={studentName}
        onClose={() => setIsEditingSession(null)}
        onSuccess={handleValidationSuccess}
        isReadOnly={false}
        isEditing={true}
        initialScores={isEditingSession?.rubric_evaluation}
        initialFeedback={isEditingSession?.teacher_feedback}
        validatedAt={isEditingSession?.validated_at}
      />

      {/* Evaluation Review Modal (For Validated Sessions when clicking card directly) */}
      <EvaluationReviewModal
        visible={isReviewModalVisible}
        sessionId={selectedReviewSessionId}
        onClose={() => {
          setIsReviewModalVisible(false);
          setSelectedReviewSessionId(null);
        }}
        isTablet={isTablet}
      />

      {/* Filter Selection Modal */}
      <BaseModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Sessions"
        isTablet={isTablet}
        cancelLabel="CLOSE"
        onSubmit={() => setIsFilterModalOpen(false)}
        submitLabel={`SHOW ${filteredSessions.length} SESSIONS`}
        heightClassName={isTablet ? 'h-[46%]' : 'h-[52%]'}
      >
        <View className="flex-col gap-3.5">
          {/* Top Bar with Clear High-Contrast Reset Action */}
          <View className="flex-row items-center justify-between pb-2 border-b border-[#F1F1F1]">
            <Text className="font-fredoka-one text-xs text-[#9CA3AF] uppercase tracking-wider">
              {activeFilterCount > 0 ? `${activeFilterCount} Active Filter${activeFilterCount > 1 ? 's' : ''}` : 'No Filters Applied'}
            </Text>
            {activeFilterCount > 0 ? (
              <Pressable
                onPress={handleResetFilters}
                className="py-1.5 px-3 rounded-[8px] border-[2px] border-[#FFDBD4] bg-white flex-row items-center justify-center gap-1.5 active:scale-95 transition-transform"
                style={{
                  shadowColor: '#FFDBD4',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                <Feather name="rotate-ccw" size={12} color="#FF3B3F" />
                <Text className="font-fredoka-one text-xs text-[#FF3B3F] uppercase">
                  Reset All
                </Text>
              </Pressable>
            ) : (
              <View
                className="py-1.5 px-3 rounded-[8px] border-[2px] border-[#F1F1F1] bg-white flex-row items-center justify-center gap-1.5 opacity-40"
              >
                <Feather name="rotate-ccw" size={12} color="#9CA3AF" />
                <Text className="font-fredoka-one text-xs text-[#9CA3AF] uppercase">
                  Reset All
                </Text>
              </View>
            )}
          </View>

          {/* Section 1: Evaluation Status */}
          <View>
            <Text className="font-fredoka-one text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-1.5">
              Evaluation Status
            </Text>
            <View className="flex-row gap-2">
              {statusOptions.map((opt) => {
                const isSelected = sessionFilters.status === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setSessionFilters((prev) => ({ ...prev, status: opt.value }))}
                    className="flex-1 active:scale-95 transition-transform"
                    style={{
                      paddingVertical: isTablet ? 9 : 8,
                      paddingHorizontal: isTablet ? 8 : 4,
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? '#BBE8FB' : '#FFFFFF',
                      borderWidth: 2,
                      borderColor: isSelected ? '#62A9E6' : '#BBE8FB',
                      shadowColor: isSelected ? '#62A9E6' : '#BBE8FB',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 2,
                    }}
                  >
                    <View className="flex-row items-center gap-1.5">
                      <Feather name={opt.icon} size={13} color="#62A9E6" />
                      <Text
                        className="font-fredoka-one text-[#62A9E6] text-xs uppercase"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {opt.label} ({opt.count})
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Section 2: Activity Source */}
          <View>
            <Text className="font-fredoka-one text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-1.5">
              Activity Source
            </Text>
            <View className="flex-row gap-2">
              {sourceOptions.map((opt) => {
                const isSelected = sessionFilters.source === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setSessionFilters((prev) => ({ ...prev, source: opt.value }))}
                    className="flex-1 active:scale-95 transition-transform"
                    style={{
                      paddingVertical: isTablet ? 9 : 8,
                      paddingHorizontal: isTablet ? 8 : 4,
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? '#BBE8FB' : '#FFFFFF',
                      borderWidth: 2,
                      borderColor: isSelected ? '#62A9E6' : '#BBE8FB',
                      shadowColor: isSelected ? '#62A9E6' : '#BBE8FB',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 2,
                    }}
                  >
                    <View className="flex-row items-center gap-1.5">
                      <Feather name={opt.icon} size={13} color="#62A9E6" />
                      <Text
                        className="font-fredoka-one text-[#62A9E6] text-xs uppercase"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {opt.label} ({opt.count})
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Section 3: Prompts & Independence */}
          <View>
            <Text className="font-fredoka-one text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-1.5">
              Assistance & Milestone
            </Text>
            <View className="flex-row gap-2">
              {promptOptions.map((opt) => {
                const isSelected = sessionFilters.prompt === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setSessionFilters((prev) => ({ ...prev, prompt: opt.value }))}
                    className="flex-1 active:scale-95 transition-transform"
                    style={{
                      paddingVertical: isTablet ? 9 : 8,
                      paddingHorizontal: isTablet ? 8 : 4,
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? '#BBE8FB' : '#FFFFFF',
                      borderWidth: 2,
                      borderColor: isSelected ? '#62A9E6' : '#BBE8FB',
                      shadowColor: isSelected ? '#62A9E6' : '#BBE8FB',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 2,
                    }}
                  >
                    <View className="flex-row items-center gap-1.5">
                      <Feather name={opt.icon} size={13} color="#62A9E6" />
                      <Text
                        className="font-fredoka-one text-[#62A9E6] text-xs uppercase"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {opt.label} ({opt.count})
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </BaseModal>
    </View>
  );
}
