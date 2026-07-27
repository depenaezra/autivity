import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { exportChildReportPdf } from '../../src/services/exportReport';
import { getParentDashboardData, ParentDashboardData, ParentSessionRecord } from '../../src/services/parentDashboard';
import { ActivityBarChart, LineTrendChart, SkillRadarChart } from './DashboardCharts';

type TimeRange = 'weekly' | 'monthly' | 'semester';

const buildTrendBuckets = (sessions: ParentSessionRecord[], range: TimeRange) => {
  const now = new Date();
  const count = range === 'weekly' ? 7 : range === 'monthly' ? 4 : 6;
  const unit: 'day' | 'week' | 'month' = range === 'weekly' ? 'day' : range === 'monthly' ? 'week' : 'month';

  const starts: Date[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (unit === 'day') d.setDate(d.getDate() - i);
    if (unit === 'week') d.setDate(d.getDate() - i * 7);
    if (unit === 'month') d.setMonth(d.getMonth() - i);
    if (unit !== 'day') d.setHours(0, 0, 0, 0);
    else d.setHours(0, 0, 0, 0);
    starts.push(d);
  }

  return starts.map((start, idx) => {
    const end = new Date(start);
    if (unit === 'day') end.setDate(end.getDate() + 1);
    if (unit === 'week') end.setDate(end.getDate() + 7);
    if (unit === 'month') end.setMonth(end.getMonth() + 1);

    const inBucket = sessions.filter((s) => s.date >= start && s.date < end);
    const scored = inBucket.filter((s) => s.score != null);
    const engagement = scored.length
      ? Math.round(scored.reduce((sum, s) => sum + (s.score || 0), 0) / scored.length)
      : 0;
    const goalCompletion = inBucket.length
      ? Math.round((inBucket.filter((s) => s.status === 'validated').length / inBucket.length) * 100)
      : 0;

    let label: string;
    if (unit === 'day') label = start.toLocaleDateString('en-US', { weekday: 'short' });
    else if (unit === 'week') label = `Wk ${idx + 1}`;
    else label = start.toLocaleDateString('en-US', { month: 'short' });

    return { label, engagement, goalCompletion };
  });
};

export default function ParentHomeDashboard() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState<ParentDashboardData | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
  const [isLearnerInfoVisible, setLearnerInfoVisible] = useState(false);
  const [isGoalsVisible, setGoalsVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        setIsLoading(true);
        try {
          const data = await getParentDashboardData();
          if (isActive) setDashboard(data);
        } catch (err: any) {
          if (isActive) Alert.alert('Error loading dashboard', err.message);
        } finally {
          if (isActive) setIsLoading(false);
        }
      })();
      return () => { isActive = false; };
    }, [])
  );

  const sessions = dashboard?.sessions || [];

  const stats = useMemo(() => {
    const scored = sessions.filter((s) => s.score != null);
    const overallPerformance = scored.length
      ? Math.round(scored.reduce((sum, s) => sum + (s.score || 0), 0) / scored.length)
      : 0;
    const withDuration = sessions.filter((s) => s.durationSeconds > 0);
    const avgSessionMinutes = withDuration.length
      ? Math.round(withDuration.reduce((sum, s) => sum + s.durationSeconds, 0) / withDuration.length / 60)
      : 0;
    return { overallPerformance, avgSessionMinutes, totalSessions: sessions.length };
  }, [sessions]);

  const trendData = useMemo(() => buildTrendBuckets(sessions, timeRange), [sessions, timeRange]);

  const activityData = useMemo(() => {
    const byCategory: Record<string, number[]> = {};
    sessions.forEach((s) => {
      if (s.score == null) return;
      if (!byCategory[s.category]) byCategory[s.category] = [];
      byCategory[s.category].push(s.score);
    });
    return Object.entries(byCategory)
      .map(([label, scores]) => ({ label, value: scores.reduce((a, b) => a + b, 0) / scores.length }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [sessions]);

  const radarData = useMemo(() => {
    const domains = dashboard?.masterDomains || [];
    return domains.map((domain) => {
      const relevant = sessions.filter(
        (s) =>
          s.score != null &&
          s.skill_domain.some((tag) => domain.subSkills.some((sub) => sub.trim().toLowerCase() === tag.trim().toLowerCase()))
      );
      const value = relevant.length
        ? Math.round(relevant.reduce((sum, s) => sum + (s.score || 0), 0) / relevant.length)
        : 0;
      return { label: domain.name, value };
    });
  }, [sessions, dashboard]);

  const recentFeedback = useMemo(
    () =>
      sessions
        .filter((s) => s.teacherFeedback && s.teacherFeedback.trim().length > 0)
        .slice(-6)
        .reverse(),
    [sessions]
  );

  const handleExportPdf = async () => {
    if (!dashboard || !dashboard.student) return;
    setIsExporting(true);
    try {
      await exportChildReportPdf(dashboard, {
        overallPerformance: stats.overallPerformance,
        avgSessionMinutes: stats.avgSessionMinutes,
        totalSessions: stats.totalSessions,
        skillBreakdown: radarData,
      });
    } catch (err: any) {
      Alert.alert(
        'Could not create PDF',
        `${err.message}\n\nMake sure the "expo-print" package is installed (npx expo install expo-print).`
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F5F8FA] items-center justify-center">
        <ActivityIndicator size="large" color="#62A9E6" />
      </View>
    );
  }

  const student = dashboard?.student;

  if (!student) {
    return (
      <View className="flex-1 bg-[#F5F8FA] items-center justify-center px-8">
        <Feather name="user-x" size={40} color="#9CA3AF" />
        <Text className="font-quicksand-bold text-[#4B5563] text-lg mt-4 text-center">
          No child linked yet
        </Text>
        <Text className="font-quicksand-medium text-[#9CA3AF] text-sm mt-2 text-center">
          Go to your Profile tab and enter the learner code your child's teacher gave you.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F8FA]">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className={isTablet ? 'px-10' : 'px-5'}>
          {/* HEADER CARD */}
          <View className="bg-white rounded-[24px] border-[2px] border-[#9ACBF9] p-5 mb-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4 flex-1">
                <View className="w-16 h-16 rounded-full bg-[#EBF5FF] items-center justify-center border-2 border-[#62A9E6]">
                  <Text style={{ fontSize: 30 }}>{student.avatar || '🙂'}</Text>
                </View>
                <View className="flex-1">
                  <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-3xl' : 'text-xl'}`}>
                    {student.name}
                  </Text>
                  <Text className="font-quicksand-medium text-[#6B7280] text-sm mt-0.5">
                    {dashboard?.classInfo?.grade || 'Grade'} • {dashboard?.classInfo?.title || 'Class'}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row gap-3 mt-4">
              <Pressable
                onPress={() => setGoalsVisible(true)}
                className="flex-row items-center gap-1.5 bg-[#F5F8FA] px-3 py-2 rounded-full"
              >
                <Feather name="clipboard" size={14} color="#62A9E6" />
                <Text className="font-quicksand-bold text-[#62A9E6] text-xs">IEP Goals</Text>
              </Pressable>
              <Pressable
                onPress={() => setLearnerInfoVisible(true)}
                className="flex-row items-center gap-1.5 bg-[#F5F8FA] px-3 py-2 rounded-full"
              >
                <Feather name="info" size={14} color="#62A9E6" />
                <Text className="font-[#62A9E6] quicksand-bold text-xs">Learner Info</Text>
              </Pressable>
            </View>
          </View>

          {/* STAT CARDS */}
          <View className="flex-row gap-3 mb-5">
            <View className="flex-1 bg-[#FEF9E7] rounded-2xl p-4">
              <Text className="font-fredoka-one text-[#4B5563] text-xl">{stats.overallPerformance}%</Text>
              <Text className="font-quicksand-medium text-[#9CA3AF] text-[11px] mt-1">Overall Performance</Text>
            </View>
            <View className="flex-1 bg-[#FEF9E7] rounded-2xl p-4">
              <Text className="font-fredoka-one text-[#4B5563] text-xl">{stats.avgSessionMinutes}m</Text>
              <Text className="font-quicksand-medium text-[#9CA3AF] text-[11px] mt-1">Avg Session</Text>
            </View>
            <View className="flex-1 bg-[#FEF9E7] rounded-2xl p-4">
              <Text className="font-fredoka-one text-[#4B5563] text-xl">{stats.totalSessions}</Text>
              <Text className="font-quicksand-medium text-[#9CA3AF] text-[11px] mt-1">Total Sessions</Text>
            </View>
          </View>

          {/* DAILY PROGRESS TREND */}
          <View className="bg-[#FEF9E7] rounded-2xl p-4 mb-5">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-quicksand-bold text-[#4B5563] text-sm">Progress Over Time</Text>
              <View className="flex-row bg-white p-1 rounded-full">
                {(['weekly', 'monthly', 'semester'] as TimeRange[]).map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setTimeRange(r)}
                    className={`px-2.5 py-1 rounded-full ${timeRange === r ? 'bg-[#62A9E6]' : ''}`}
                  >
                    <Text className={`font-quicksand-semibold text-[10px] capitalize ${timeRange === r ? 'text-white' : 'text-[#6B7280]'}`}>
                      {r}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View className="flex-row items-center gap-4 mb-1">
              <View className="flex-row items-center gap-1.5">
                <View className="w-2.5 h-2.5 rounded-full bg-[#62A9E6]" />
                <Text className="font-quicksand-medium text-[#6B7280] text-[10px]">Engagement</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-2.5 h-2.5 rounded-full bg-[#FACC15]" />
                <Text className="font-quicksand-medium text-[#6B7280] text-[10px]">Goal Completion</Text>
              </View>
            </View>
            <View className="items-center">
              <LineTrendChart
                labels={trendData.map((d) => d.label)}
                seriesA={trendData.map((d) => d.engagement)}
                seriesB={trendData.map((d) => d.goalCompletion)}
                width={isTablet ? 500 : width - 70}
              />
            </View>
          </View>

          {/* ACTIVITY + SKILL CHARTS */}
          <View className={isTablet ? 'flex-row gap-4 mb-5' : 'mb-5'}>
            <View className="bg-[#FEF9E7] rounded-2xl p-4 mb-5 flex-1">
              <Text className="font-quicksand-bold text-[#4B5563] text-sm mb-2">Activity Performance</Text>
              {activityData.length > 0 ? (
                <View className="items-center">
                  <ActivityBarChart data={activityData} width={isTablet ? 240 : width - 70} />
                </View>
              ) : (
                <Text className="font-quicksand-medium text-[#9CA3AF] text-xs">No completed activities yet.</Text>
              )}
            </View>

            <View className="bg-[#FEF9E7] rounded-2xl p-4 flex-1">
              <Text className="font-quicksand-bold text-[#4B5563] text-sm mb-2">Skill Performance</Text>
              {radarData.length >= 3 ? (
                <View className="items-center">
                  <SkillRadarChart data={radarData} size={isTablet ? 240 : width - 90} />
                </View>
              ) : (
                <Text className="font-quicksand-medium text-[#9CA3AF] text-xs">Not enough skill data yet.</Text>
              )}
            </View>
          </View>

          {/* TEACHER FEEDBACK */}
          <View className="bg-white rounded-2xl border border-[#F3F4F6] p-4 mb-5">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="chatbubble-ellipses-outline" size={16} color="#62A9E6" />
              <Text className="font-quicksand-bold text-[#4B5563] text-sm">Teacher Feedback</Text>
            </View>
            {recentFeedback.length > 0 ? (
              recentFeedback.map((f) => (
                <View key={f.id} className="mb-3 bg-[#F5F8FA] rounded-xl p-3">
                  <Text className="font-quicksand-medium text-[#9CA3AF] text-[10px] mb-1">
                    {f.date.toLocaleDateString()} • {f.category} • {dashboard?.teacherName}
                  </Text>
                  <Text className="font-quicksand-medium text-[#374151] text-xs leading-5">{f.teacherFeedback}</Text>
                </View>
              ))
            ) : (
              <Text className="font-quicksand-medium text-[#9CA3AF] text-xs">
                No teacher feedback yet — check back after your child's next validated session.
              </Text>
            )}
          </View>

          {/* DOWNLOAD REPORT */}
          <Pressable
            onPress={handleExportPdf}
            disabled={isExporting}
            className={`flex-row items-center justify-center gap-2 py-4 rounded-full ${isExporting ? 'bg-[#E5E7EB]' : 'bg-[#62A9E6]'}`}
          >
            {isExporting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Feather name="download" size={16} color="white" />
                <Text className="text-white font-quicksand-bold">Download Full Report (PDF)</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* LEARNER INFO MODAL */}
      <Modal visible={isLearnerInfoVisible} transparent animationType="fade" onRequestClose={() => setLearnerInfoVisible(false)}>
        <View className="flex-1 bg-black/40 items-center justify-center px-8">
          <View className="bg-white rounded-2xl p-5 w-full max-w-[400px]">
            <Text className="font-quicksand-bold text-[#4B5563] text-lg mb-3">Learner Info</Text>
            <Text className="font-quicksand-medium text-[#6B7280] text-xs mb-1">Spectrum Level</Text>
            <Text className="font-quicksand-bold text-[#4B5563] text-sm mb-3">
              {student.spectrum_level || 'Not specified'}
            </Text>
            <Text className="font-quicksand-medium text-[#6B7280] text-xs mb-1">Bio</Text>
            <Text className="font-quicksand-medium text-[#4B5563] text-sm mb-4">
              {student.bio || 'No bio added yet.'}
            </Text>
            <Pressable onPress={() => setLearnerInfoVisible(false)} className="bg-[#F5F8FA] py-3 rounded-xl items-center">
              <Text className="font-quicksand-bold text-[#6B7280]">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* IEP GOALS MODAL */}
      <Modal visible={isGoalsVisible} transparent animationType="fade" onRequestClose={() => setGoalsVisible(false)}>
        <View className="flex-1 bg-black/40 items-center justify-center px-8">
          <View className="bg-white rounded-2xl p-5 w-full max-w-[400px] max-h-[70%]">
            <Text className="font-quicksand-bold text-[#4B5563] text-lg mb-3">IEP Goals</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {dashboard?.milestones.length ? (
                dashboard.milestones.map((m) => (
                  <View key={m.id} className="mb-3 bg-[#F5F8FA] rounded-xl p-3">
                    <Text className="font-quicksand-bold text-[#4B5563] text-sm">{m.title}</Text>
                    <Text className="font-quicksand-medium text-[#9CA3AF] text-xs mt-1">
                      {m.status}{m.targetDate ? ` • Target: ${m.targetDate}` : ''}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="font-quicksand-medium text-[#9CA3AF] text-xs">No goals set yet.</Text>
              )}
            </ScrollView>
            <Pressable onPress={() => setGoalsVisible(false)} className="bg-[#F5F8FA] py-3 rounded-xl items-center mt-2">
              <Text className="font-quicksand-bold text-[#6B7280]">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}