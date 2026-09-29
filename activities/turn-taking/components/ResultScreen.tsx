import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { TurnTakingPlayer, TurnTakingResult, StudentEvaluationReport } from '../types';

interface ResultScreenProps {
  player1: TurnTakingPlayer;
  player2: TurnTakingPlayer;
  results: TurnTakingResult[];
  completedLevels: number;
  categoryTitle?: string;
  onPlayAgain: () => void;
  onFinish: () => void;
}

export function generateStudentReport(
  player: TurnTakingPlayer,
  results: TurnTakingResult[],
  totalSessionLevels: number,
  categoryTitle = 'Tracing'
): StudentEvaluationReport {
  const playerResults = results.filter((r) => r.playerId === player.id);
  const completedTurns = playerResults.filter((r) => r.completed).length;
  const totalTurns = playerResults.length || 3;
  const totalMistakes = playerResults.reduce((sum, r) => sum + (r.mistakes || 0), 0);
  const totalTimeSeconds = playerResults.reduce((sum, r) => sum + (r.timeSeconds || 12), 0);
  const avgTimePerTurnSeconds = totalTurns > 0 ? Math.round(totalTimeSeconds / totalTurns) : 0;

  const maxScore = totalTurns * 10;
  const mistakeDeductions = totalMistakes * 2;
  const rawAccuracy = Math.max(0, Math.min(100, Math.round(((maxScore - mistakeDeductions) / maxScore) * 100)));
  const turnTakingSocialScore = Math.min(100, Math.max(65, 100 - totalMistakes * 4));

  const looking_at_objects = totalMistakes === 0 ? 4 : totalMistakes <= 2 ? 3 : 2;
  const concentrating = avgTimePerTurnSeconds <= 20 ? 4 : avgTimePerTurnSeconds <= 40 ? 3 : 2;
  const performing_task = completedTurns === totalTurns ? 4 : 3;
  const following_instructions = totalMistakes <= 1 ? 4 : totalMistakes <= 3 ? 3 : 2;
  const completed_work = completedTurns === totalTurns ? 4 : 2;

  const totalRubricScore =
    looking_at_objects +
    concentrating +
    performing_task +
    following_instructions +
    completed_work;
  const rubricAvg = totalRubricScore / 5;

  let overallGrade: 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Practice' = 'Good';
  if (rubricAvg >= 3.6 && rawAccuracy >= 85) overallGrade = 'Excellent';
  else if (rubricAvg >= 3.0 && rawAccuracy >= 70) overallGrade = 'Good';
  else if (rubricAvg >= 2.4) overallGrade = 'Satisfactory';
  else overallGrade = 'Needs Practice';

  let feedback = '';
  if (overallGrade === 'Excellent') {
    feedback = `${player.name} demonstrated outstanding precision, high visual focus, and excellent turn-taking patience during ${categoryTitle} tracing!`;
  } else if (overallGrade === 'Good') {
    feedback = `${player.name} completed all tracing turns with strong engagement and cooperative turn-taking behavior.`;
  } else {
    feedback = `${player.name} actively participated in turn-taking and will benefit from continued practice with guided visual cues.`;
  }

  return {
    playerId: player.id,
    playerName: player.name,
    avatar: player.avatar,
    totalTurns,
    completedTurns,
    totalMistakes,
    totalTimeSeconds,
    avgTimePerTurnSeconds,
    accuracyPercentage: rawAccuracy,
    turnTakingSocialScore,
    rubricEvaluation: {
      looking_at_objects,
      concentrating,
      performing_task,
      following_instructions,
      completed_work,
    },
    overallGrade,
    teacherFeedback: feedback,
  };
}

export default function ResultScreen({
  player1,
  player2,
  results,
  completedLevels,
  categoryTitle = 'Lines',
  onPlayAgain,
  onFinish,
}: ResultScreenProps) {
  const [activeTab, setActiveTab] = useState<'p1' | 'p2' | 'compare'>('p1');

  const reportP1 = generateStudentReport(player1, results, completedLevels, categoryTitle);
  const reportP2 = generateStudentReport(player2, results, completedLevels, categoryTitle);

  const activeReport = activeTab === 'p1' ? reportP1 : reportP2;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.trophyCircle}>
            <Ionicons name="trophy" size={42} color="#F59E0B" />
          </View>

          <Text style={styles.title}>Great Teamwork!</Text>
          <Text style={styles.subtitle}>
            Session finished! Two individual evaluation reports generated.
          </Text>
        </View>

        {/* TAB SELECTOR FOR 2 PLAYERS */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('p1')}
            style={[styles.tabButton, activeTab === 'p1' && styles.activeTabButton]}
          >
            <Text style={[styles.tabText, activeTab === 'p1' && styles.activeTabText]}>
              🧑 {player1.name} (P1)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('p2')}
            style={[styles.tabButton, activeTab === 'p2' && styles.activeTabButton]}
          >
            <Text style={[styles.tabText, activeTab === 'p2' && styles.activeTabText]}>
              🧒 {player2.name} (P2)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('compare')}
            style={[styles.tabButton, activeTab === 'compare' && styles.activeTabButton]}
          >
            <Text style={[styles.tabText, activeTab === 'compare' && styles.activeTabText]}>
              📊 Side-by-Side
            </Text>
          </TouchableOpacity>
        </View>

        {/* DETAILED STUDENT EVALUATION REPORT VIEW */}
        {activeTab !== 'compare' ? (
          <View style={styles.reportCard}>
            {/* STUDENT BADGE */}
            <View style={styles.studentBadgeHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {activeReport.playerName.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.studentMeta}>
                <Text style={styles.studentNameText}>
                  {activeReport.playerName}
                </Text>
                <Text style={styles.studentRoleText}>
                  {activeReport.playerId === player1.id ? 'Assigned Student (Player 1)' : 'Peer Student (Player 2)'}
                </Text>
              </View>

              <View
                style={[
                  styles.gradeBadge,
                  activeReport.overallGrade === 'Excellent'
                    ? { backgroundColor: '#DCFCE7' }
                    : activeReport.overallGrade === 'Good'
                    ? { backgroundColor: '#DBEAFE' }
                    : { backgroundColor: '#FEF3C7' },
                ]}
              >
                <Text
                  style={[
                    styles.gradeBadgeText,
                    activeReport.overallGrade === 'Excellent'
                      ? { color: '#16A34A' }
                      : activeReport.overallGrade === 'Good'
                      ? { color: '#2563EB' }
                      : { color: '#D97706' },
                  ]}
                >
                  {activeReport.overallGrade}
                </Text>
              </View>
            </View>

            {/* PERFORMANCE METRICS GRID */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>
                  {activeReport.completedTurns}/{activeReport.totalTurns}
                </Text>
                <Text style={styles.metricLabel}>Turns Done</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>
                  {activeReport.accuracyPercentage}%
                </Text>
                <Text style={styles.metricLabel}>Accuracy</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>
                  {activeReport.totalMistakes}
                </Text>
                <Text style={styles.metricLabel}>Mistakes</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>
                  {activeReport.turnTakingSocialScore}%
                </Text>
                <Text style={styles.metricLabel}>Social Score</Text>
              </View>
            </View>

            {/* SNED 5-DOMAIN RUBRIC EVALUATION BREAKDOWN */}
            <Text style={styles.rubricSectionTitle}>
              SNED Core Evaluation Criteria (0-4 Rating)
            </Text>

            <View style={styles.rubricList}>
              <View style={styles.rubricRow}>
                <View style={styles.rubricLabelContainer}>
                  <Ionicons name="eye-outline" size={18} color="#2563EB" />
                  <Text style={styles.rubricTitle}>Looking at Objects</Text>
                </View>
                <View style={styles.rubricScoreBadge}>
                  <Text style={styles.rubricScoreText}>
                    {activeReport.rubricEvaluation.looking_at_objects} / 4
                  </Text>
                </View>
              </View>

              <View style={styles.rubricRow}>
                <View style={styles.rubricLabelContainer}>
                  <Ionicons name="flash-outline" size={18} color="#D97706" />
                  <Text style={styles.rubricTitle}>Concentrating</Text>
                </View>
                <View style={styles.rubricScoreBadge}>
                  <Text style={styles.rubricScoreText}>
                    {activeReport.rubricEvaluation.concentrating} / 4
                  </Text>
                </View>
              </View>

              <View style={styles.rubricRow}>
                <View style={styles.rubricLabelContainer}>
                  <Ionicons name="hand-right-outline" size={18} color="#16A34A" />
                  <Text style={styles.rubricTitle}>Performing Task</Text>
                </View>
                <View style={styles.rubricScoreBadge}>
                  <Text style={styles.rubricScoreText}>
                    {activeReport.rubricEvaluation.performing_task} / 4
                  </Text>
                </View>
              </View>

              <View style={styles.rubricRow}>
                <View style={styles.rubricLabelContainer}>
                  <Ionicons name="list-outline" size={18} color="#9333EA" />
                  <Text style={styles.rubricTitle}>Following Instructions</Text>
                </View>
                <View style={styles.rubricScoreBadge}>
                  <Text style={styles.rubricScoreText}>
                    {activeReport.rubricEvaluation.following_instructions} / 4
                  </Text>
                </View>
              </View>

              <View style={styles.rubricRow}>
                <View style={styles.rubricLabelContainer}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#059669" />
                  <Text style={styles.rubricTitle}>Completed Work</Text>
                </View>
                <View style={styles.rubricScoreBadge}>
                  <Text style={styles.rubricScoreText}>
                    {activeReport.rubricEvaluation.completed_work} / 4
                  </Text>
                </View>
              </View>
            </View>

            {/* TEACHER FEEDBACK SUMMARY */}
            <View style={styles.feedbackBox}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#2563EB" />
              <Text style={styles.feedbackText}>
                {activeReport.teacherFeedback}
              </Text>
            </View>
          </View>
        ) : (
          /* SIDE-BY-SIDE COMPARISON VIEW FOR BOTH STUDENTS */
          <View style={styles.compareContainer}>
            <Text style={styles.compareHeaderTitle}>
              Turn-Taking Evaluation Comparison
            </Text>

            <View style={styles.compareCardRow}>
              {/* PLAYER 1 CARD */}
              <View style={[styles.compareCard, styles.compareCardP1]}>
                <Text style={styles.comparePlayerTitle}>
                  🧑 {reportP1.playerName}
                </Text>
                <Text style={styles.compareSubtitle}>Player 1</Text>

                <View style={styles.compareMetricRow}>
                  <Text style={styles.compareLabel}>Accuracy:</Text>
                  <Text style={styles.compareValue}>{reportP1.accuracyPercentage}%</Text>
                </View>

                <View style={styles.compareMetricRow}>
                  <Text style={styles.compareLabel}>Mistakes:</Text>
                  <Text style={styles.compareValue}>{reportP1.totalMistakes}</Text>
                </View>

                <View style={styles.compareMetricRow}>
                  <Text style={styles.compareLabel}>Social Score:</Text>
                  <Text style={styles.compareValue}>{reportP1.turnTakingSocialScore}%</Text>
                </View>

                <View style={styles.compareMetricRow}>
                  <Text style={styles.compareLabel}>Rubric Rating:</Text>
                  <Text style={styles.compareValue}>
                    {(
                      (reportP1.rubricEvaluation.looking_at_objects +
                        reportP1.rubricEvaluation.concentrating +
                        reportP1.rubricEvaluation.performing_task +
                        reportP1.rubricEvaluation.following_instructions +
                        reportP1.rubricEvaluation.completed_work) / 5
                    ).toFixed(1)} / 4.0
                  </Text>
                </View>
              </View>

              {/* PLAYER 2 CARD */}
              <View style={[styles.compareCard, styles.compareCardP2]}>
                <Text style={styles.comparePlayerTitle}>
                  🧒 {reportP2.playerName}
                </Text>
                <Text style={styles.compareSubtitle}>Player 2</Text>

                <View style={styles.compareMetricRow}>
                  <Text style={styles.compareLabel}>Accuracy:</Text>
                  <Text style={styles.compareValue}>{reportP2.accuracyPercentage}%</Text>
                </View>

                <View style={styles.compareMetricRow}>
                  <Text style={styles.compareLabel}>Mistakes:</Text>
                  <Text style={styles.compareValue}>{reportP2.totalMistakes}</Text>
                </View>

                <View style={styles.compareMetricRow}>
                  <Text style={styles.compareLabel}>Social Score:</Text>
                  <Text style={styles.compareValue}>{reportP2.turnTakingSocialScore}%</Text>
                </View>

                <View style={styles.compareMetricRow}>
                  <Text style={styles.compareLabel}>Rubric Rating:</Text>
                  <Text style={styles.compareValue}>
                    {(
                      (reportP2.rubricEvaluation.looking_at_objects +
                        reportP2.rubricEvaluation.concentrating +
                        reportP2.rubricEvaluation.performing_task +
                        reportP2.rubricEvaluation.following_instructions +
                        reportP2.rubricEvaluation.completed_work) / 5
                    ).toFixed(1)} / 4.0
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* SKILL / PRACTICE SUMMARY */}
        <View style={styles.skillCard}>
          <Ionicons name="people" size={24} color="#2563EB" />
          <View style={styles.skillInfo}>
            <Text style={styles.skillTitle}>Social Turn-Taking Practice</Text>
            <Text style={styles.skillDescription}>
              Practiced active listening, waiting for turns, tracing path alignment, and reciprocal play.
            </Text>
          </View>
        </View>

        {/* BUTTONS */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPlayAgain}
            style={styles.playAgainButton}
          >
            <Ionicons name="refresh-outline" size={20} color="#62A9E6" />
            <Text style={styles.playAgainText}>Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onFinish}
            style={styles.finishButton}
          >
            <Text style={styles.finishText}>Finish & Save Reports</Text>
            <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  content: {
    padding: 18,
    paddingBottom: 35,
  },

  header: {
    alignItems: 'center',
    marginBottom: 16,
  },

  trophyCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  title: {
    fontFamily: 'Fredoka-One',
    fontSize: 26,
    color: '#484A4B',
  },

  subtitle: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },

  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  tabText: {
    fontFamily: 'Fredoka-One',
    fontSize: 12,
    color: '#64748B',
  },

  activeTabText: {
    color: '#2563EB',
  },

  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },

  studentBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  avatarText: {
    fontFamily: 'Fredoka-One',
    fontSize: 20,
    color: '#2563EB',
  },

  studentMeta: {
    flex: 1,
  },

  studentNameText: {
    fontFamily: 'Fredoka-One',
    fontSize: 18,
    color: '#0F172A',
  },

  studentRoleText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  gradeBadgeText: {
    fontFamily: 'Fredoka-One',
    fontSize: 12,
    textTransform: 'uppercase',
  },

  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },

  metricItem: {
    flex: 1,
    alignItems: 'center',
  },

  metricValue: {
    fontFamily: 'Fredoka-One',
    fontSize: 18,
    color: '#2563EB',
  },

  metricLabel: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#CBD5E1',
  },

  rubricSectionTitle: {
    fontFamily: 'Fredoka-One',
    fontSize: 14,
    color: '#334155',
    marginBottom: 10,
  },

  rubricList: {
    gap: 8,
    marginBottom: 14,
  },

  rubricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  rubricLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  rubricTitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 13,
    color: '#334155',
  },

  rubricScoreBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },

  rubricScoreText: {
    fontFamily: 'Fredoka-One',
    fontSize: 12,
    color: '#2563EB',
  },

  feedbackBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    alignItems: 'center',
  },

  feedbackText: {
    flex: 1,
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    lineHeight: 17,
    color: '#1E3A8A',
  },

  compareContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },

  compareHeaderTitle: {
    fontFamily: 'Fredoka-One',
    fontSize: 16,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12,
  },

  compareCardRow: {
    flexDirection: 'row',
    gap: 10,
  },

  compareCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
  },

  compareCardP1: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },

  compareCardP2: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },

  comparePlayerTitle: {
    fontFamily: 'Fredoka-One',
    fontSize: 15,
    color: '#0F172A',
  },

  compareSubtitle: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
  },

  compareMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },

  compareLabel: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 11,
    color: '#475569',
  },

  compareValue: {
    fontFamily: 'Fredoka-One',
    fontSize: 12,
    color: '#0F172A',
  },

  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },

  skillInfo: {
    flex: 1,
  },

  skillTitle: {
    fontFamily: 'Fredoka-One',
    fontSize: 14,
    color: '#1E3A8A',
  },

  skillDescription: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },

  buttonContainer: {
    gap: 10,
  },

  playAgainButton: {
    height: 50,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#62A9E6',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  playAgainText: {
    fontFamily: 'Fredoka-One',
    fontSize: 15,
    color: '#62A9E6',
    textTransform: 'uppercase',
  },

  finishButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#62A9E6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,

    shadowColor: '#BBE8FB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },

  finishText: {
    fontFamily: 'Fredoka-One',
    fontSize: 16,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
});