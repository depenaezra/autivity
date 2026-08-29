import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { getStudentSessions, SessionRecord } from '../../../../src/services/student-analytics';
import { filterSessionsByPeriod } from '../../../../src/utils/dashboardFilters';
import FeedbackModal from '../../../feedback-modal';
import EvaluationReviewModal from '../evaluation-review-modal';

interface SessionsProps {
  studentId: string;
  studentName: string;
  filter?: string;
}

type SessionFilterType = 'all' | 'unvalidated' | 'validated';

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
    <Animated.View
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
    </Animated.View>
  );
}

export default function Sessions({ studentId, studentName, filter }: SessionsProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionFilter, setSessionFilter] = useState<SessionFilterType>('all');
  const [showInfo, setShowInfo] = useState(false);

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

  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedReviewSessionId, setSelectedReviewSessionId] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const data = await getStudentSessions(studentId);
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
  }, [studentId]);

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

  const handleValidationSuccess = () => {
    fetchSessions();
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
      if (sessionFilter === 'unvalidated') return s.status === 'pending';
      if (sessionFilter === 'validated') return s.status === 'validated';
      return true;
    });
  }, [sessions, sessionFilter, filter]);

  const filterOptions: { label: string; value: SessionFilterType; count: number }[] = [
    { label: 'ALL', value: 'all', count: sessions.length },
    { label: 'PENDING', value: 'unvalidated', count: sessions.filter((s) => s.status === 'pending').length },
    { label: 'EVALUATED', value: 'validated', count: sessions.filter((s) => s.status === 'validated').length },
  ];

  return (
    <View className="w-full mt-6 mb-12 pb-6">
      {/* Header and Filter Buttons */}
      <View className="mb-4">
        <View className="flex-row flex-wrap items-center justify-between gap-4">
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

          <View className="flex-row items-center gap-1.5 flex-wrap">
            {filterOptions.map((btn) => {
              const isActive = sessionFilter === btn.value;
              return (
                <Pressable
                  key={btn.value}
                  onPress={() => setSessionFilter(btn.value)}
                  style={{
                    borderWidth: 2,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: isTablet ? 16 : 12,
                    paddingVertical: isTablet ? 8 : 6,
                    backgroundColor: isActive ? '#BBE8FB' : '#FFFFFF',
                    borderColor: isActive ? '#62A9E6' : '#BBE8FB',
                    shadowColor: isActive ? '#62A9E6' : '#BBE8FB',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 2,
                  }}
                >
                  <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
                    {btn.label} ({btn.count})
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Full-width Info Banner Row below Title & Filters */}
        {showInfo && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOutUp.duration(150)}
            className="w-full bg-[#E0F2FE] border border-[#BBE8FB] rounded-xl p-3 mt-3 flex-row items-center gap-2.5 overflow-hidden"
          >
            <Feather name="info" size={isTablet ? 22 : 18} color="#62A9E6" />
            <Text className={`font-quicksand-bold text-[#62A9E6] flex-1 leading-normal ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
              Validate pending sessions to evaluate student progress and publish updates directly to the Parent Portal.
            </Text>
          </Animated.View>
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
            {sessionFilter === 'unvalidated'
              ? 'No unvalidated sessions for this learner.'
              : sessionFilter === 'validated'
              ? 'No validated sessions for this learner.'
              : 'No recorded sessions for this learner yet.'}
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {filteredSessions.map((session) => {
            const isPending = session.status === 'pending';
            const accentColor = isPending ? '#FF8870' : '#179D33';

            return (
              <Pressable
                key={session.id}
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
                    <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-lg' : 'text-base'}`}>
                      {session.activityName}
                    </Text>

                    {/* Optically-aligned Date & Duration Row */}
                    <View className="flex-row items-center gap-2.5 mt-1 flex-wrap">
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
                    </View>
                  </View>

                  {/* Category Pill on Top Right */}
                  <View className="bg-[#F1F1F1] px-2.5 py-1 rounded-[6px] ml-2 self-start">
                    <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-xs' : 'text-[10px]'}`}>
                      {session.category}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
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
        isReadOnly={activeModalSession?.status === 'validated'}
        initialScores={activeModalSession?.rubric_evaluation}
        initialFeedback={activeModalSession?.teacher_feedback}
        validatedAt={activeModalSession?.validated_at}
      />

      {/* Evaluation Review Modal (For Validated Sessions - Matching recent-activity-section) */}
      <EvaluationReviewModal
        visible={isReviewModalVisible}
        sessionId={selectedReviewSessionId}
        onClose={() => {
          setIsReviewModalVisible(false);
          setSelectedReviewSessionId(null);
        }}
        isTablet={isTablet}
      />
    </View>
  );
}
