import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TurnTakingPlayer, TurnTakingResult } from '../types'

interface ResultScreenProps {
  player1: TurnTakingPlayer;
  player2: TurnTakingPlayer;
  results: TurnTakingResult[];
  completedLevels: number;
  onPlayAgain: () => void;
  onFinish: () => void;
}

export default function ResultScreen({
  player1,
  player2,
  results,
  completedLevels,
  onPlayAgain,
  onFinish,
}: ResultScreenProps) {
  const player1Results = results.filter(
    (result) => result.playerId === player1.id
  );

  const player2Results = results.filter(
    (result) => result.playerId === player2.id
  );

  const player1Completed = player1Results.filter(
    (result) => result.completed
  ).length;

  const player2Completed = player2Results.filter(
    (result) => result.completed
  ).length;

  const totalTurns = results.length;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Success Header */}
        <View style={styles.header}>
          <View style={styles.trophyCircle}>
            <Ionicons
              name="trophy"
              size={42}
              color="#F59E0B"
            />
          </View>

          <Text style={styles.title}>
            Great Teamwork!
          </Text>

          <Text style={styles.subtitle}>
            Both students completed their turns.
          </Text>
        </View>

        {/* Skill Card */}
        <View style={styles.skillCard}>
          <View style={styles.skillIcon}>
            <Ionicons
              name="people"
              size={23}
              color="#3B82F6"
            />
          </View>

          <View style={styles.skillInfo}>
            <Text style={styles.skillTitle}>
              Social & Turn-Taking
            </Text>

            <Text style={styles.skillDescription}>
              Practiced waiting, taking turns, and completing
              an activity together.
            </Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>
            Activity Summary
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {completedLevels}
              </Text>

              <Text style={styles.summaryLabel}>
                Levels Completed
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {totalTurns}
              </Text>

              <Text style={styles.summaryLabel}>
                Turns Taken
              </Text>
            </View>
          </View>
        </View>

        {/* Student Results */}
        <Text style={styles.sectionHeading}>
          Student Results
        </Text>

        {/* Player 1 */}
        <View style={styles.studentCard}>
          <View style={styles.studentHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                1
              </Text>
            </View>

            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>
                {player1.name}
              </Text>

              <Text style={styles.turnCount}>
                {player1Results.length} turn
                {player1Results.length !== 1 ? 's' : ''}
              </Text>
            </View>

            <View style={styles.completedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={17}
                color="#16A34A"
              />

              <Text style={styles.completedText}>
                {player1Completed}
              </Text>
            </View>
          </View>

          <View style={styles.studentProgress}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width:
                      completedLevels > 0
                        ? `${Math.min(
                            100,
                            (player1Completed / completedLevels) *
                              100
                          )}%`
                        : '0%',
                  },
                ]}
              />
            </View>

            <Text style={styles.progressText}>
              {player1Completed}/{completedLevels || 0} completed
            </Text>
          </View>
        </View>

        {/* Player 2 */}
        <View style={styles.studentCard}>
          <View style={styles.studentHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                2
              </Text>
            </View>

            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>
                {player2.name}
              </Text>

              <Text style={styles.turnCount}>
                {player2Results.length} turn
                {player2Results.length !== 1 ? 's' : ''}
              </Text>
            </View>

            <View style={styles.completedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={17}
                color="#16A34A"
              />

              <Text style={styles.completedText}>
                {player2Completed}
              </Text>
            </View>
          </View>

          <View style={styles.studentProgress}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width:
                      completedLevels > 0
                        ? `${Math.min(
                            100,
                            (player2Completed / completedLevels) *
                              100
                          )}%`
                        : '0%',
                  },
                ]}
              />
            </View>

            <Text style={styles.progressText}>
              {player2Completed}/{completedLevels || 0} completed
            </Text>
          </View>
        </View>

        {/* Turn-Taking Reminder */}
        <View style={styles.reminderCard}>
          <Ionicons
            name="heart-outline"
            size={22}
            color="#3B82F6"
          />

          <View style={styles.reminderInfo}>
            <Text style={styles.reminderTitle}>
              What they practiced
            </Text>

            <Text style={styles.reminderText}>
              Taking turns • Waiting • Sharing an activity •
              Following directions
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPlayAgain}
            style={styles.playAgainButton}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color="#3B82F6"
            />

            <Text style={styles.playAgainText}>
              Play Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onFinish}
            style={styles.finishButton}
          >
            <Text style={styles.finishText}>
              Finish Activity
            </Text>

            <Ionicons
              name="checkmark"
              size={20}
              color="#FFFFFF"
            />
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
    padding: 20,
    paddingBottom: 35,
  },

  header: {
    alignItems: 'center',
    marginBottom: 20,
  },

  trophyCircle: {
    width: 85,
    height: 85,
    borderRadius: 43,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0F172A',
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 5,
    textAlign: 'center',
  },

  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
  },

  skillIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  skillInfo: {
    flex: 1,
    marginLeft: 11,
  },

  skillTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E3A8A',
  },

  skillDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#475569',
    marginTop: 3,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 17,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 15,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryValue: {
    fontSize: 25,
    fontWeight: '800',
    color: '#3B82F6',
  },

  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    textAlign: 'center',
  },

  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },

  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },

  studentCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 17,
    padding: 15,
    marginBottom: 10,
  },

  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2563EB',
  },

  studentInfo: {
    flex: 1,
    marginLeft: 11,
  },

  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },

  turnCount: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 6,
    gap: 4,
  },

  completedText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16A34A',
  },

  studentProgress: {
    marginTop: 13,
  },

  progressTrack: {
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 10,
  },

  progressText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5,
  },

  reminderCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 16,
    padding: 15,
    marginTop: 10,
    marginBottom: 20,
  },

  reminderInfo: {
    flex: 1,
    marginLeft: 10,
  },

  reminderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },

  reminderText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    marginTop: 3,
  },

  buttonContainer: {
    gap: 10,
  },

  playAgainButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  playAgainText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3B82F6',
  },

  finishButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  finishText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});