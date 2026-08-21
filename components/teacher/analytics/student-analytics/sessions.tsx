import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { getStudentSessions, SessionRecord } from '../../../../src/services/student-analytics';
import FeedbackModal from '../../../feedback-modal';

interface SessionsProps {
    studentId: string;
    studentName: string;
}

type SessionFilterType = 'all' | 'unvalidated' | 'validated';

export default function Sessions({ studentId, studentName }: SessionsProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const [sessions, setSessions] = useState<SessionRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sessionFilter, setSessionFilter] = useState<SessionFilterType>('all');

    const [activeModalSession, setActiveModalSession] = useState<{
        id: string;
        studentId: string;
        activityName: string;
        status?: 'pending' | 'validated';
        rubric_evaluation?: any;
        teacher_feedback?: string;
        validated_at?: string;
    } | null>(null);

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

    const handleValidateSession = (session: SessionRecord) => {
        setActiveModalSession({
            id: session.id,
            studentId: session.studentId,
            activityName: session.activityName,
            status: session.status,
            rubric_evaluation: session.rubric_evaluation,
            teacher_feedback: session.teacher_feedback,
            validated_at: session.validated_at,
        });
    };

    const handleValidationSuccess = () => {
        fetchSessions();
    };

    const filteredSessions = useMemo(() => {
        return sessions.filter((s) => {
            if (sessionFilter === 'unvalidated') return s.status === 'pending';
            if (sessionFilter === 'validated') return s.status === 'validated';
            return true;
        });
    }, [sessions, sessionFilter]);

    if (isLoading) {
        return (
            <View className="bg-white border border-[#E5E7EB] rounded-2xl p-6 items-center justify-center min-h-[160px] mt-6">
                <ActivityIndicator size="small" color="#62A9E6" />
                <Text className="mt-3 font-quicksand-semibold text-sm text-[#9CA3AF]">
                    Loading completed sessions...
                </Text>
            </View>
        );
    }

    return (
        <View className="mt-6 flex-col">
            {/* Header and Filter Pills */}
            <View className="flex-row justify-between items-center mb-2 flex-wrap gap-2">
                <View>
                    <Text className="font-fredoka-one text-xl text-[#4B5563]">
                        Completed Sessions
                    </Text>
                    <Text className="font-quicksand-medium text-xs text-[#6B7280]">
                        {filteredSessions.length} of {sessions.length} Records
                    </Text>
                </View>

                {/* Filter Pills */}
                <View className="flex-row bg-[#E5E7EB] p-1 rounded-full">
                    {(['all', 'unvalidated', 'validated'] as const).map((filterOption) => {
                        const isActive = sessionFilter === filterOption;
                        const count =
                            filterOption === 'all'
                                  ? sessions.length
                                : filterOption === 'unvalidated'
                                    ? sessions.filter((s) => s.status === 'pending').length
                                    : sessions.filter((s) => s.status === 'validated').length;

                        return (
                            <TouchableOpacity
                                key={filterOption}
                                activeOpacity={0.7}
                                onPress={() => setSessionFilter(filterOption)}
                                className={`px-3 py-1 rounded-full flex-row items-center gap-1.5 ${isActive ? 'bg-[#62A9E6]' : 'bg-transparent'
                                    }`}
                            >
                                <Text
                                    className={`font-quicksand-bold capitalize ${isActive ? 'text-white' : 'text-[#6B7280]'} ${isTablet ? 'text-sm' : 'text-xs'
                                        }`}
                                >
                                    {filterOption === 'unvalidated' ? 'Unvalidated' : filterOption === 'validated' ? 'Validated' : 'All'}
                                </Text>
                                <View className={`px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/30' : 'bg-[#D1D5DB]'}`}>
                                    <Text className={`font-quicksand-bold text-[10px] ${isActive ? 'text-white' : 'text-[#4B5563]'}`}>
                                        {count}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <Text className={`font-quicksand-medium text-[#EA580C] mb-3 ${isTablet ? 'text-base' : 'text-sm'}`}>
                Validate pending sessions below to publish updates directly to the Parent Portal.
            </Text>

            {error ? (
                <View className="w-full justify-center items-center py-6 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
                    <Feather name="alert-circle" size={24} color="#EF4444" />
                    <Text className="font-quicksand-semibold text-sm text-[#9CA3AF] mt-2">{error}</Text>
                </View>
            ) : (
                <View className="gap-3">
                    {filteredSessions.map((session) => (
                        <View
                            key={session.id}
                            className={`bg-white rounded-2xl border-[1.5px] p-4 shadow-sm ${session.status === 'pending' ? 'border-[#FDBA74] bg-[#FFFBF5]' : 'border-[#E5E7EB]'
                                }`}
                        >
                            <View className="flex-row justify-between items-start mb-2">
                                <View className="flex-1 mr-2">
                                    <View className="flex-row items-center gap-2">
                                        <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-lg' : 'text-base'}`}>
                                            {session.activityName}
                                        </Text>
                                    </View>
                                    <Text className={`font-quicksand-semibold text-[#6B7280] mt-0.5 ${isTablet ? 'text-sm' : 'text-xs'}`}>
                                        Category: {session.category} • Duration: {session.duration}
                                    </Text>
                                    <Text className={`font-quicksand-medium text-[#9CA3AF] mt-0.5 ${isTablet ? 'text-sm' : 'text-xs'}`}>
                                        {session.date}
                                    </Text>
                                </View>


                            </View>

                            {/* validation status */}
                            <View className="border-t border-[#F3F4F6] pt-3 mt-1 flex-row items-center justify-between">
                                <View className="flex-row items-center gap-1.5">
                                    <View className={`w-2 h-2 rounded-full ${session.status === 'validated' ? 'bg-[#10B981]' : 'bg-[#EA580C]'}`} />
                                    <Text
                                        className={`font-quicksand-bold uppercase ${session.status === 'validated' ? 'text-[#10B981]' : 'text-[#EA580C]'
                                            } ${isTablet ? 'text-sm' : 'text-xs'}`}
                                    >
                                        {session.status === 'validated' ? 'Validated & Synced' : 'Pending Teacher Review'}
                                    </Text>
                                </View>

                                {session.status === 'pending' ? (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => handleValidateSession(session)}
                                        className="bg-[#EA580C] px-3.5 py-1.5 rounded-full flex-row items-center gap-1 shadow-sm"
                                    >
                                        <Feather name="check" size={13} color="white" />
                                        <Text className={`font-quicksand-bold text-white ${isTablet ? 'text-sm' : 'text-xs'}`}>
                                            Validate Progress
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View className="flex-row items-center gap-2">
                                        <View className="bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#D1FAE5]">
                                            <Text className={`font-quicksand-semibold text-[#047857] ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                                                Visible to Parent
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => handleValidateSession(session)}
                                            className="bg-[#EBF5FF] border border-[#A3CFF1] px-3 py-1 rounded-full flex-row items-center gap-1 shadow-sm"
                                        >
                                            <Feather name="eye" size={13} color="#62A9E6" />
                                            <Text className={`font-quicksand-bold text-[#62A9E6] ${isTablet ? 'text-sm' : 'text-xs'}`}>
                                                View Feedback
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}

                    {filteredSessions.length === 0 && (
                        <View className="bg-white p-6 rounded-2xl border border-[#E5E7EB] items-center justify-center shadow-sm">
                            <Text className="font-quicksand-medium text-sm text-[#9CA3AF]">
                                {sessionFilter === 'unvalidated'
                                    ? 'No unvalidated sessions for this learner.'
                                    : sessionFilter === 'validated'
                                        ? 'No validated sessions for this learner.'
                                        : 'No recorded sessions for this learner yet.'}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Validation Rubric Feedback Modal */}
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
        </View>
    );
}
