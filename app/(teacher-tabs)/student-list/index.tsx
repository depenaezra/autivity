import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, useWindowDimensions, Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as Haptics from 'expo-haptics';
import { StudentsScreenLayout } from '../../../components/teacher/home/students-screen-layout';
import {
  getTeacherStudents,
  updateStudent,
  deleteStudent,
  moveStudentClass,
  updateStudentActivities,
} from '../../../src/services/students';
import { getTeacherClasses } from '../../../src/services/classes';

// Modals
import { AddStudentModal } from '../../../components/teacher/home/add-student-modal';
import { AssignActivitiesModal } from '../../../components/teacher/home/assign-activities-modal';
import { BaseModal } from '../../../components/teacher/home/base-modal';

// SVGs
import EditIcon from '../../../assets/images/teacher/class/icon-button-edit.svg';
import AssignIcon from '../../../assets/images/teacher/class/icon-button-assign.svg';
import MoveIcon from '../../../assets/images/teacher/class/icon-button-move.svg';
import DeleteIcon from '../../../assets/images/teacher/class/icon-button-delete.svg';

interface Student {
  id: string;
  name: string;
  avatar: string;
  class_id?: string;
  learner_code?: string;
  parent_id?: string | null;
  assigned_activities?: string[];
}

interface ClassItem {
  id: string;
  title: string;
  grade: string;
}

export default function StudentListScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active open Swipeable ref
  const openSwipeableRef = React.useRef<any>(null);

  // Modals state
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isAddStudentModalVisible, setAddStudentModalVisible] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [isAssignModalVisible, setAssignModalVisible] = useState(false);
  const [isMoveModalVisible, setMoveModalVisible] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<ClassItem[]>([]);
  const [selectedTargetClassId, setSelectedTargetClassId] = useState<string | null>(null);
  const [isMovingStudent, setIsMovingStudent] = useState(false);
  const [isSavingStudent, setIsSavingStudent] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [studentList, classList] = await Promise.all([
        getTeacherStudents(),
        getTeacherClasses(),
      ]);
      setStudents(studentList.map((s: any) => ({
        ...s,
        assigned_activities: s.assigned_activities || [],
      })));
      setClasses(classList.map((c: any) => ({ id: c.id, title: c.title, grade: c.grade || '' })));
    } catch (error) {
      console.error('Error fetching student list data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditPress = (student: Student) => {
    setSelectedStudentId(student.id);
    setIsEditingStudent(true);
    setAddStudentModalVisible(true);
  };

  const handleEditStudent = async (studentData: { name: string; avatar: string; spectrumLevel: string; bio: string }) => {
    if (!selectedStudentId) return;
    setIsSavingStudent(true);
    try {
      await updateStudent(
        selectedStudentId,
        studentData.name,
        studentData.avatar,
        studentData.spectrumLevel || undefined,
        studentData.bio || undefined
      );
      await loadData();
      setAddStudentModalVisible(false);
      setIsEditingStudent(false);
      setSelectedStudentId(null);
      Alert.alert('Success', 'Student updated successfully!');
    } catch (error: any) {
      Alert.alert('Error updating student', error.message);
    } finally {
      setIsSavingStudent(false);
    }
  };

  const handleSaveActivities = async (paths: string[]) => {
    if (!selectedStudentId) return;
    try {
      await updateStudentActivities(selectedStudentId, paths);
      await loadData();
      setAssignModalVisible(false);
      setSelectedStudentId(null);
      Alert.alert('Success', 'Activities updated successfully!');
    } catch (error: any) {
      Alert.alert('Error assigning activities', error.message);
    }
  };

  const handleMovePress = async (student: Student) => {
    setSelectedStudentId(student.id);
    try {
      const allClasses = await getTeacherClasses();
      const filtered = allClasses.filter((c: any) => c.id !== student.class_id);
      setAvailableClasses(filtered.map((c: any) => ({ id: c.id, title: c.title, grade: c.grade || '' })));
      setSelectedTargetClassId(null);
      setMoveModalVisible(true);
    } catch (error: any) {
      Alert.alert('Error loading classes', error.message);
    }
  };

  const handleConfirmMoveStudent = async () => {
    if (!selectedStudentId || !selectedTargetClassId) return;
    setIsMovingStudent(true);
    try {
      await moveStudentClass(selectedStudentId, selectedTargetClassId);
      await loadData();
      setMoveModalVisible(false);
      setSelectedStudentId(null);
      Alert.alert('Success', 'Student moved successfully!');
    } catch (error: any) {
      Alert.alert('Error moving student', error.message);
    } finally {
      setIsMovingStudent(false);
    }
  };

  const handleDeletePress = (student: Student) => {
    Alert.alert(
      'Delete Student',
      `Are you sure you want to remove ${student.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStudent(student.id);
              await loadData();
              Alert.alert('Deleted', `${student.name} removed successfully.`);
            } catch (error: any) {
              Alert.alert('Error deleting student', error.message);
            }
          },
        },
      ]
    );
  };

  const handleStudentPress = (student: Student) => {
    router.push({
      pathname: '/student/[studentId]',
      params: {
        studentId: student.id,
        studentName: student.name,
        classId: student.class_id || '',
        themeName: 'blue', // default/fallback theme for students list navigation
      },
    });
  };

  const filteredStudents = selectedClassId
    ? students.filter((s) => s.class_id === selectedClassId)
    : students;

  const countText = selectedClassId === null
    ? `${students.length} students total`
    : `${filteredStudents.length} students`;

  const renderRightActions = (
    student: Student,
    swipeableRef: any,
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    // Staggered springy scale, opacity, and translation for each button
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

    const assignScale = progress.interpolate({
      inputRange: [0.1, 0.5, 1],
      outputRange: [0.5, 1.1, 1],
      extrapolate: 'clamp',
    });
    const assignOpacity = progress.interpolate({
      inputRange: [0.1, 0.4, 1],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });
    const assignTransX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 0],
      extrapolate: 'clamp',
    });

    const moveScale = progress.interpolate({
      inputRange: [0.2, 0.6, 1],
      outputRange: [0.5, 1.1, 1],
      extrapolate: 'clamp',
    });
    const moveOpacity = progress.interpolate({
      inputRange: [0.2, 0.5, 1],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });
    const moveTransX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [10, 0],
      extrapolate: 'clamp',
    });

    const deleteScale = progress.interpolate({
      inputRange: [0.3, 0.7, 1],
      outputRange: [0.5, 1.1, 1],
      extrapolate: 'clamp',
    });
    const deleteOpacity = progress.interpolate({
      inputRange: [0.3, 0.6, 1],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });
    const deleteTransX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [5, 0],
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
              handleEditPress(student);
            }}
            className="flex-col items-center justify-center active:scale-95 transition-transform"
            style={{ width: isTablet ? 72 : 56 }}
          >
            <View className="items-center justify-center" style={{ height: isTablet ? 32 : 26 }}>
              <EditIcon width={isTablet ? 26 : 22} height={isTablet ? 26 : 22} />
            </View>
            <Text 
              className={`font-fredoka-one text-[#62A9E6] text-center w-full px-1 ${isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'}`}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              EDIT
            </Text>
          </Pressable>
        </Animated.View>

        {/* ASSIGN */}
        <Animated.View
          style={{
            opacity: assignOpacity,
            transform: [{ scale: assignScale }, { translateX: assignTransX }],
          }}
        >
          <Pressable
            onPress={() => {
              swipeableRef?.close();
              setSelectedStudentId(student.id);
              setAssignModalVisible(true);
            }}
            className="flex-col items-center justify-center active:scale-95 transition-transform"
            style={{ width: isTablet ? 72 : 56 }}
          >
            <View className="items-center justify-center" style={{ height: isTablet ? 32 : 26 }}>
              <AssignIcon width={isTablet ? 26 : 22} height={isTablet ? 26 : 22} />
            </View>
            <Text 
              className={`font-fredoka-one text-[#62A9E6] text-center w-full px-1 ${isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'}`}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              ASSIGN
            </Text>
          </Pressable>
        </Animated.View>

        {/* MOVE */}
        <Animated.View
          style={{
            opacity: moveOpacity,
            transform: [{ scale: moveScale }, { translateX: moveTransX }],
          }}
        >
          <Pressable
            onPress={() => {
              swipeableRef?.close();
              handleMovePress(student);
            }}
            className="flex-col items-center justify-center active:scale-95 transition-transform"
            style={{ width: isTablet ? 72 : 56 }}
          >
            <View className="items-center justify-center" style={{ height: isTablet ? 32 : 26 }}>
              <MoveIcon width={isTablet ? 26 : 22} height={isTablet ? 26 : 22} />
            </View>
            <Text 
              className={`font-fredoka-one text-[#62A9E6] text-center w-full px-1 ${isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'}`}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              MOVE
            </Text>
          </Pressable>
        </Animated.View>

        {/* DELETE */}
        <Animated.View
          style={{
            opacity: deleteOpacity,
            transform: [{ scale: deleteScale }, { translateX: deleteTransX }],
          }}
        >
          <Pressable
            onPress={() => {
              swipeableRef?.close();
              handleDeletePress(student);
            }}
            className="flex-col items-center justify-center active:scale-95 transition-transform"
            style={{ width: isTablet ? 72 : 56 }}
          >
            <View className="items-center justify-center" style={{ height: isTablet ? 32 : 26 }}>
              <DeleteIcon width={isTablet ? 26 : 22} height={isTablet ? 26 : 22} />
            </View>
            <Text 
              className={`font-fredoka-one text-[#FF3B3F] text-center w-full px-1 ${isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'}`}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              DELETE
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  return (
    <StudentsScreenLayout
      onBackPress={() => router.back()}
      classes={classes}
      selectedClassId={selectedClassId}
      onSelectClass={setSelectedClassId}
    >
      {isLoading ? (
        <View className="flex-1 items-center justify-center py-20 bg-white">
          <ActivityIndicator size="large" color="#62A9E6" />
        </View>
      ) : filteredStudents.length === 0 ? (
        <View className="flex-1 items-center justify-center py-20 bg-white px-6">
          <Text className="font-fredoka-one text-gray-400 text-lg text-center">
            {selectedClassId ? 'No students in this class.' : 'No students registered yet.'}
          </Text>
        </View>
      ) : (
        <View className={`bg-white ${isTablet ? 'px-12 py-6' : 'px-6 py-4'}`}>
          {/* Dynamic count badge */}
          <View 
            className="flex-row items-center bg-white border-[2px] border-[#BBE8FB] rounded-[6px] self-start px-2 py-0.5 gap-1"
            style={{ marginBottom: isTablet ? 16 : 12 }}
          >
            <Ionicons name="people" size={isTablet ? 16 : 12} color="#62A9E6" />
            <Text 
              className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-[14px]' : 'text-[11px]'}`}
            >
              {countText}
            </Text>
          </View>

          {filteredStudents.map((student, index) => {
            const studentClass = classes.find((c) => c.id === student.class_id);
            const classText = studentClass
              ? `${studentClass.grade} • ${studentClass.title}`
              : '';

            let currentSwipeableRef: any = null;

            return (
              <View key={student.id}>
                <Swipeable
                  ref={(ref) => {
                    currentSwipeableRef = ref;
                  }}
                  renderRightActions={(progress) => renderRightActions(student, currentSwipeableRef, progress)}
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
                  <Pressable
                    onPress={() => handleStudentPress(student)}
                    className="flex-row items-center py-4 active:scale-95 transition-transform bg-white"
                  >
                    {/* Outer circle with grey border */}
                    <View 
                      className="items-center justify-center border-[2px] border-[#D9D9D9]"
                      style={{ 
                        width: isTablet ? 96 : 64,
                        height: isTablet ? 96 : 64,
                        borderRadius: isTablet ? 48 : 32
                      }}
                    >
                      {/* Inner circle with thick white border */}
                      <View 
                        className="w-full h-full items-center justify-center bg-[#E5E7EB] border-white"
                        style={{
                          borderWidth: isTablet ? 3 : 2,
                          borderRadius: isTablet ? 45 : 30,
                        }}
                      >
                        <Text style={{ fontSize: isTablet ? 40 : 28 }}>
                          {student.avatar || '🙂'}
                        </Text>
                      </View>
                    </View>

                    {/* Content on the right */}
                    <View className="flex-1 ml-4 justify-center">
                      {/* Name and class/grade details */}
                      <View className="flex-row items-center flex-wrap gap-x-2">
                        <Text 
                          className="font-fredoka-one text-[#484A4B]" 
                          style={{ fontSize: isTablet ? 24 : 18 }}
                        >
                          {student.name || 'Student'}
                        </Text>
                        {classText ? (
                          <Text 
                            className="font-quicksand-medium text-[#9CA3AF]"
                            style={{ fontSize: isTablet ? 16 : 12 }}
                          >
                            {classText}
                          </Text>
                        ) : null}
                      </View>

                      {/* Badges Row */}
                      <View className="flex-row items-center gap-2 mt-1.5">
                        {/* Learner Code Badge */}
                        <View className="bg-[#BBE8FB] px-2.5 py-1 rounded-[6px] justify-center items-center">
                          <Text 
                            className="font-fredoka-one text-[#62A9E6] uppercase"
                            style={{ fontSize: isTablet ? 12 : 9 }}
                          >
                            # {student.learner_code || 'AUT-000'}
                          </Text>
                        </View>

                        {/* Parent Linked Badge */}
                        {student.parent_id ? (
                          <View className="bg-[#CBFAC4] px-2.5 py-1 rounded-[6px] flex-row items-center gap-1">
                            <Ionicons 
                              name="checkmark-circle" 
                              size={isTablet ? 14 : 11} 
                              color="#179D33" 
                            />
                            <Text 
                              className="font-fredoka-one text-[#179D33] uppercase"
                              style={{ fontSize: isTablet ? 12 : 9 }}
                            >
                              LINKED
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </Pressable>
                </Swipeable>

                {/* Divider Line */}
                {index < filteredStudents.length - 1 && (
                  <View className="h-[1px] bg-[#E5E7EB] opacity-50" />
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Modals */}
      <AddStudentModal
        visible={isAddStudentModalVisible}
        onClose={() => {
          setAddStudentModalVisible(false);
          setIsEditingStudent(false);
          setSelectedStudentId(null);
        }}
        isTablet={isTablet}
        isCreating={isSavingStudent}
        onSubmit={handleEditStudent}
        isEditing={isEditingStudent}
        initialData={
          selectedStudentId
            ? (() => {
                const s = students.find((st) => st.id === selectedStudentId);
                return s
                  ? {
                      name: s.name,
                      avatar: s.avatar,
                      spectrumLevel: (s as any).spectrum_level || '',
                      bio: (s as any).bio || '',
                    }
                  : null;
              })()
            : null
        }
      />

      <AssignActivitiesModal
        visible={isAssignModalVisible}
        onClose={() => {
          setAssignModalVisible(false);
          setSelectedStudentId(null);
        }}
        studentName={students.find((s) => s.id === selectedStudentId)?.name || 'Student'}
        initialAssignedActivities={students.find((s) => s.id === selectedStudentId)?.assigned_activities || []}
        onSave={handleSaveActivities}
        isTablet={isTablet}
      />

      <BaseModal
        visible={isMoveModalVisible}
        onClose={() => {
          setMoveModalVisible(false);
          setSelectedStudentId(null);
        }}
        title="Move Student"
        isTablet={isTablet}
      >
        <View className="p-4">
          <Text className="font-fredoka-one text-gray-500 mb-3">Select the class to move the student to:</Text>
          {availableClasses.map((cls) => (
            <Pressable
              key={cls.id}
              onPress={() => setSelectedTargetClassId(cls.id)}
              className="p-3 my-1 border rounded-lg flex-row justify-between items-center"
              style={{
                borderColor: selectedTargetClassId === cls.id ? '#62A9E6' : '#E5E7EB',
                backgroundColor: selectedTargetClassId === cls.id ? '#F0F9FF' : '#FFFFFF',
              }}
            >
              <Text className="font-fredoka-one text-gray-700">{cls.title}</Text>
              {selectedTargetClassId === cls.id && (
                <Ionicons name="checkmark-circle" size={20} color="#62A9E6" />
              )}
            </Pressable>
          ))}
          
          <Pressable
            onPress={handleConfirmMoveStudent}
            disabled={!selectedTargetClassId || isMovingStudent}
            className={`mt-4 py-3 rounded-lg justify-center items-center ${
              !selectedTargetClassId ? 'bg-gray-300' : 'bg-[#62A9E6] active:scale-95'
            }`}
          >
            <Text className="font-fredoka-one text-white">
              {isMovingStudent ? 'MOVING...' : 'MOVE STUDENT'}
            </Text>
          </Pressable>
        </View>
      </BaseModal>
    </StudentsScreenLayout>
  );
}
