import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { TurnTakingPlayer } from '../types';

interface StudentSelectorProps {
  assignedStudent: TurnTakingPlayer;
  students: TurnTakingPlayer[];
  isLoading?: boolean;
  initialTier?: number;
  onStart: (
    player1: TurnTakingPlayer,
    player2: TurnTakingPlayer,
    tier: number
  ) => void;
}

export default function StudentSelector({
  assignedStudent,
  students,
  isLoading = false,
  initialTier = 1,
  onStart,
}: StudentSelectorProps) {
  const [selectedTier, setSelectedTier] = useState<number>(initialTier);
  const [selectedOpponent, setSelectedOpponent] =
    useState<TurnTakingPlayer | null>(null);

  const otherStudents = students.filter(
    (student) => String(student.id) !== String(assignedStudent.id)
  );

  const handleSelectOpponent = (student: TurnTakingPlayer) => {
    if (String(student.id) === String(assignedStudent.id)) return;
    setSelectedOpponent(student);
  };

  const handleStart = () => {
    if (selectedOpponent) {
      onStart(assignedStudent, selectedOpponent, selectedTier);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER ROW */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="people" size={28} color="#62A9E6" />
        </View>

        <Text style={styles.title}>Social & Turn-Taking</Text>
        <Text style={styles.subtitle}>
          Choose a classmate to trace paths together!
        </Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* PLAYER 1 (ASSIGNED) */}
        <Text style={styles.sectionTitle}>PLAYER 1 (ASSIGNED)</Text>

        <View style={styles.assignedCard}>
          <View style={styles.assignedAvatar}>
            <Text style={styles.assignedAvatarText}>
              {assignedStudent.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.studentInfo}>
            <Text style={styles.assignedName}>{assignedStudent.name}</Text>
            <Text style={styles.assignedLabel}>Primary Learner</Text>
          </View>

          <View style={styles.lockCircle}>
            <Ionicons name="lock-closed" size={16} color="#62A9E6" />
          </View>
        </View>

        {/* DIFFICULTY TIER SELECTION */}
        <Text style={styles.sectionTitle}>DIFFICULTY LEVEL</Text>

        <View style={styles.tierContainer}>
          {[
            { id: 1, label: 'Easy', tracks: 'Tracks 1–3' },
            { id: 2, label: 'Medium', tracks: 'Tracks 4–6' },
            { id: 3, label: 'Hard', tracks: 'Tracks 7–10' },
          ].map((tier) => {
            const isSelected = selectedTier === tier.id;
            return (
              <TouchableOpacity
                key={tier.id}
                activeOpacity={0.8}
                onPress={() => setSelectedTier(tier.id)}
                style={[
                  styles.tierButton,
                  isSelected && styles.selectedTierButton,
                ]}
              >
                <Text
                  style={[
                    styles.tierButtonText,
                    isSelected && styles.selectedTierButtonText,
                  ]}
                >
                  {tier.label}
                </Text>
                <Text
                  style={[
                    styles.tierSubText,
                    isSelected && styles.selectedTierSubText,
                  ]}
                >
                  {tier.tracks}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* PLAYER 2 SELECTION */}
        <Text style={styles.sectionTitle}>CHOOSE PLAYER 2 (CLASSMATE)</Text>

        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading classmates...</Text>
          </View>
        ) : otherStudents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={42} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No classmate found</Text>
            <Text style={styles.emptyText}>
              Another student from the same class is needed for this cooperative
              activity.
            </Text>
          </View>
        ) : (
          otherStudents.map((student) => {
            const isSelected = selectedOpponent?.id === student.id;

            return (
              <TouchableOpacity
                key={student.id}
                activeOpacity={0.8}
                onPress={() => handleSelectOpponent(student)}
                style={[
                  styles.studentCard,
                  isSelected && styles.selectedStudentCard,
                ]}
              >
                <View
                  style={[
                    styles.avatar,
                    isSelected && styles.selectedAvatar,
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      isSelected && styles.selectedAvatarText,
                    ]}
                  >
                    {student.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentLabel}>
                    {isSelected ? 'Selected as Player 2' : 'Tap to select'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.checkCircle,
                    isSelected && styles.checkedCircle,
                  ]}
                >
                  <Ionicons
                    name={isSelected ? 'checkmark' : 'add'}
                    size={20}
                    color={isSelected ? '#FFFFFF' : '#9CA3AF'}
                  />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* BOTTOM ACTION */}
      <View style={styles.bottomContainer}>
        <Text style={styles.selectedText}>
          {selectedOpponent
            ? `${assignedStudent.name} & ${selectedOpponent.name} will play together!`
            : 'Select a classmate to continue'}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!selectedOpponent || isLoading}
          onPress={handleStart}
          style={[
            styles.startButton,
            (!selectedOpponent || isLoading) && styles.disabledButton,
          ]}
        >
          <Text style={styles.startButtonText}>CONTINUE TO SPIN</Text>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* =========================================================
   STYLES - Autivity Design System Specification
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBFB',
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  header: {
    alignItems: 'center',
    marginBottom: 16,
  },

  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#BBE8FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#BBE8FB',
    shadowColor: '#BBE8FB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 2,
  },

  title: {
    fontSize: 22,
    fontFamily: 'FredokaOne-Regular',
    color: '#484A4B',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    fontFamily: 'Quicksand-Medium',
    color: '#64748B',
    marginTop: 3,
    textAlign: 'center',
  },

  scrollArea: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 16,
  },

  sectionTitle: {
    fontSize: 12,
    fontFamily: 'FredokaOne-Regular',
    color: '#62A9E6',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },

  /* Assigned Card */
  assignedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#BBE8FB',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#BBE8FB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
    elevation: 2,
  },

  assignedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#BBE8FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  assignedAvatarText: {
    fontSize: 20,
    fontFamily: 'FredokaOne-Regular',
    color: '#62A9E6',
  },

  assignedName: {
    fontSize: 16,
    fontFamily: 'FredokaOne-Regular',
    color: '#484A4B',
  },

  assignedLabel: {
    fontSize: 12,
    fontFamily: 'Quicksand-Medium',
    color: '#62A9E6',
    marginTop: 1,
  },

  lockCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#BBE8FB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Tier Selector */
  tierContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },

  tierButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F1F1F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },

  selectedTierButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BBE8FB',
    shadowColor: '#BBE8FB',
  },

  tierButtonText: {
    fontSize: 15,
    fontFamily: 'FredokaOne-Regular',
    color: '#64748B',
  },

  selectedTierButtonText: {
    color: '#62A9E6',
  },

  tierSubText: {
    fontSize: 11,
    fontFamily: 'Quicksand-Medium',
    color: '#9CA3AF',
    marginTop: 2,
  },

  selectedTierSubText: {
    color: '#62A9E6',
  },

  /* Student Cards */
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F1F1F1',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#F1F1F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },

  selectedStudentCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BBE8FB',
    shadowColor: '#BBE8FB',
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  selectedAvatar: {
    backgroundColor: '#BBE8FB',
  },

  avatarText: {
    fontSize: 18,
    fontFamily: 'FredokaOne-Regular',
    color: '#64748B',
  },

  selectedAvatarText: {
    color: '#62A9E6',
  },

  studentInfo: {
    flex: 1,
  },

  studentName: {
    fontSize: 16,
    fontFamily: 'FredokaOne-Regular',
    color: '#484A4B',
  },

  studentLabel: {
    fontSize: 12,
    fontFamily: 'Quicksand-Medium',
    color: '#9CA3AF',
    marginTop: 1,
  },

  checkCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  checkedCircle: {
    backgroundColor: '#62A9E6',
    borderColor: '#62A9E6',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F1F1F1',
    paddingHorizontal: 20,
    marginTop: 6,
  },

  emptyTitle: {
    fontSize: 16,
    fontFamily: 'FredokaOne-Regular',
    color: '#484A4B',
    marginTop: 8,
  },

  emptyText: {
    fontSize: 13,
    fontFamily: 'Quicksand-Medium',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },

  /* Bottom Area */
  bottomContainer: {
    paddingTop: 10,
    paddingBottom: 16,
  },

  selectedText: {
    fontSize: 13,
    fontFamily: 'Quicksand-Medium',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },

  startButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#62A9E6',
    borderBottomWidth: 4,
    borderBottomColor: '#5298D4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  disabledButton: {
    backgroundColor: '#D1D5DB',
    borderBottomColor: '#9CA3AF',
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'FredokaOne-Regular',
    letterSpacing: 0.5,
  },
});