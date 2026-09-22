import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TurnTakingPlayer } from '../types';

interface StudentSelectorProps {
  assignedStudent: TurnTakingPlayer;
  students: TurnTakingPlayer[];
  isLoading?: boolean;
  onStart: (
    player1: TurnTakingPlayer,
    player2: TurnTakingPlayer
  ) => void;
}

export default function StudentSelector({
  assignedStudent,
  students,
  isLoading = false,
  onStart,
}: StudentSelectorProps) {
  const [selectedOpponent, setSelectedOpponent] =
    useState<TurnTakingPlayer | null>(null);

  const otherStudents = students.filter(
    (student) =>
      String(student.id) !==
      String(assignedStudent.id)
  );

  const handleSelectOpponent = (
    student: TurnTakingPlayer
  ) => {
    if (
      String(student.id) ===
      String(assignedStudent.id)
    ) {
      return;
    }

    setSelectedOpponent(student);
  };

  const handleStart = () => {
    if (selectedOpponent) {
      onStart(
        assignedStudent,
        selectedOpponent
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="people-outline"
            size={28}
            color="#3B82F6"
          />
        </View>

        <Text style={styles.title}>
          Social & Turn-Taking
        </Text>

        <Text style={styles.subtitle}>
          Choose a classmate to play against
        </Text>
      </View>

      {/* PLAYER 1 */}

      <Text style={styles.sectionTitle}>
        Player 1
      </Text>

      <View style={styles.assignedCard}>
        <View style={styles.assignedAvatar}>
          <Text style={styles.assignedAvatarText}>
            {assignedStudent.name
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <View style={styles.studentInfo}>
          <Text style={styles.assignedName}>
            {assignedStudent.name}
          </Text>

          <Text style={styles.assignedLabel}>
            Assigned student
          </Text>
        </View>

        <View style={styles.lockCircle}>
          <Ionicons
            name="lock-closed"
            size={17}
            color="#FFFFFF"
          />
        </View>
      </View>

      {/* INSTRUCTION */}

      <View style={styles.instructionCard}>
        <Ionicons
          name="information-circle-outline"
          size={22}
          color="#3B82F6"
        />

        <Text style={styles.instructionText}>
          Player 1 is already assigned. Select one
          classmate as Player 2.
        </Text>
      </View>

      {/* PLAYER 2 */}

      <Text style={styles.sectionTitle}>
        Choose Player 2
      </Text>

      <ScrollView
        style={styles.studentList}
        contentContainerStyle={
          styles.studentListContent
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              Loading class students...
            </Text>
          </View>
        ) : otherStudents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={45}
              color="#94A3B8"
            />

            <Text style={styles.emptyTitle}>
              No classmate available
            </Text>

            <Text style={styles.emptyText}>
              Another student from the same class
              is needed for this activity.
            </Text>
          </View>
        ) : (
          otherStudents.map((student) => {
            const isSelected =
              selectedOpponent?.id ===
              student.id;

            return (
              <TouchableOpacity
                key={student.id}
                activeOpacity={0.8}
                onPress={() =>
                  handleSelectOpponent(student)
                }
                style={[
                  styles.studentCard,
                  isSelected &&
                    styles.selectedStudentCard,
                ]}
              >
                <View
                  style={[
                    styles.avatar,
                    isSelected &&
                      styles.selectedAvatar,
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      isSelected &&
                        styles.selectedAvatarText,
                    ]}
                  >
                    {student.name
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                </View>

                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>
                    {student.name}
                  </Text>

                  <Text style={styles.studentLabel}>
                    {isSelected
                      ? 'Player 2'
                      : 'Tap to select'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.checkCircle,
                    isSelected &&
                      styles.checkedCircle,
                  ]}
                >
                  {isSelected ? (
                    <Ionicons
                      name="checkmark"
                      size={22}
                      color="#FFFFFF"
                    />
                  ) : (
                    <Ionicons
                      name="add-outline"
                      size={22}
                      color="#94A3B8"
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* BOTTOM */}

      <View style={styles.bottomContainer}>
        <Text style={styles.selectedText}>
          {selectedOpponent
            ? `${assignedStudent.name} will play against ${selectedOpponent.name}`
            : 'Select one classmate to continue'}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={
            !selectedOpponent ||
            isLoading
          }
          onPress={handleStart}
          style={[
            styles.startButton,
            (!selectedOpponent ||
              isLoading) &&
              styles.disabledButton,
          ]}
        >
          <Text style={styles.startButtonText}>
            Continue to Spin
          </Text>

          <Ionicons
            name="arrow-forward"
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },

  header: {
    alignItems: 'center',
    marginBottom: 18,
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 5,
    textAlign: 'center',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },

  assignedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF5FD',
    borderWidth: 2,
    borderColor: '#93C5FD',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },

  assignedAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  assignedAvatarText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  assignedName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  assignedLabel: {
    fontSize: 13,
    color: '#3B82F6',
    marginTop: 3,
  },

  lockCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    gap: 10,
  },

  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
  },

  studentList: {
    flex: 1,
  },

  studentListContent: {
    paddingBottom: 10,
  },

  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },

  selectedStudentCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  selectedAvatar: {
    backgroundColor: '#3B82F6',
  },

  avatarText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#475569',
  },

  selectedAvatarText: {
    color: '#FFFFFF',
  },

  studentInfo: {
    flex: 1,
  },

  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },

  studentLabel: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },

  checkCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkedCircle: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },

  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 5,
    maxWidth: 280,
    lineHeight: 20,
  },

  bottomContainer: {
    paddingTop: 12,
  },

  selectedText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 10,
  },

  startButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  disabledButton: {
    backgroundColor: '#CBD5E1',
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});