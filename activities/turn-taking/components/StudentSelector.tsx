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
  students: TurnTakingPlayer[];
  onStart: (player1: TurnTakingPlayer, player2: TurnTakingPlayer) => void;
}

export default function StudentSelector({
  students,
  onStart,
}: StudentSelectorProps) {
  const [selectedStudents, setSelectedStudents] = useState<
    TurnTakingPlayer[]
  >([]);

  const handleSelectStudent = (student: TurnTakingPlayer) => {
    const alreadySelected = selectedStudents.some(
      (item) => item.id === student.id
    );

    if (alreadySelected) {
      setSelectedStudents((current) =>
        current.filter((item) => item.id !== student.id)
      );
      return;
    }

    if (selectedStudents.length < 2) {
      setSelectedStudents((current) => [...current, student]);
    }
  };

  const handleStart = () => {
    if (selectedStudents.length === 2) {
      onStart(selectedStudents[0], selectedStudents[1]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="people-outline"
            size={28}
            color="#3B82F6"
          />
        </View>

        <Text style={styles.title}>Social & Turn-Taking</Text>

        <Text style={styles.subtitle}>
          Select two students to play together
        </Text>
      </View>

      <View style={styles.instructionCard}>
        <Ionicons
          name="information-circle-outline"
          size={22}
          color="#3B82F6"
        />

        <Text style={styles.instructionText}>
          Choose exactly two students. They will take turns completing the
          activity.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        Select Students ({selectedStudents.length}/2)
      </Text>

      <ScrollView
        style={styles.studentList}
        contentContainerStyle={styles.studentListContent}
        showsVerticalScrollIndicator={false}
      >
        {students.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={45}
              color="#94A3B8"
            />

            <Text style={styles.emptyTitle}>
              No students available
            </Text>

            <Text style={styles.emptyText}>
              Add students to the class before starting this activity.
            </Text>
          </View>
        ) : (
          students.map((student, index) => {
            const isSelected = selectedStudents.some(
              (item) => item.id === student.id
            );

            const selectionNumber =
              selectedStudents.findIndex(
                (item) => item.id === student.id
              ) + 1;

            return (
              <TouchableOpacity
                key={student.id}
                activeOpacity={0.8}
                onPress={() => handleSelectStudent(student)}
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
                  <Text style={styles.studentName}>
                    {student.name}
                  </Text>

                  <Text style={styles.studentLabel}>
                    {isSelected
                      ? `Player ${selectionNumber}`
                      : 'Tap to select'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.checkCircle,
                    isSelected && styles.checkedCircle,
                  ]}
                >
                  {isSelected ? (
                    <Text style={styles.checkNumber}>
                      {selectionNumber}
                    </Text>
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

      <View style={styles.bottomContainer}>
        <Text style={styles.selectedText}>
          {selectedStudents.length === 2
            ? `${selectedStudents[0].name} and ${selectedStudents[1].name} are ready!`
            : 'Select two students to continue'}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={selectedStudents.length !== 2}
          onPress={handleStart}
          style={[
            styles.startButton,
            selectedStudents.length !== 2 && styles.disabledButton,
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
    marginBottom: 20,
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

  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },

  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
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

  checkNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
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