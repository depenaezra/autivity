import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View, useWindowDimensions, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ClassScreenLayout } from '../../../components/teacher/home/class-screen-layout';
import { EditClassModal } from '../../../components/teacher/home/edit-class-modal';
import { AddStudentModal } from '../../../components/teacher/home/add-student-modal';
import { StudentActionMenu } from '../../../components/teacher/home/student-action-menu';
import { AssignActivitiesModal } from '../../../components/teacher/home/assign-activities-modal';
import { BaseModal } from '../../../components/teacher/home/base-modal';
import { LongPressPreview } from '../../../components/teacher/home/long-press-preview';
import {
  getClassById,
  updateClass,
  archiveClass,
  deleteClass,
  getTeacherClasses,
} from '../../../src/services/classes';
import {
  getClassStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  moveStudentClass,
  updateStudentActivities,
} from '../../../src/services/students';

export default function ClassScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const params = useLocalSearchParams();

  const safeId = Array.isArray(params.classId)
    ? params.classId[0]
    : params.classId || (Array.isArray(params.id) ? params.id[0] : (params.id as string));

  const paramName = Array.isArray(params.name) ? params.name[0] : params.name;
  const paramGrade = Array.isArray(params.grade)
    ? params.grade[0]
    : params.grade || (Array.isArray(params.level) ? params.level[0] : params.level);
  const paramThemeName = Array.isArray(params.themeName) ? params.themeName[0] : params.themeName;
  const paramSchedule = Array.isArray(params.schedule) ? params.schedule[0] : params.schedule;

  const [classDetails, setClassDetails] = useState({
    id: safeId as string,
    name: (paramName as string) || 'My Class',
    level: (paramGrade as string) || 'Grade 1',
    schedule: (paramSchedule as string) || '',
    themeName: (paramThemeName as any) || 'blue',
  });

  const [students, setStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [actionMenuCoords, setActionMenuCoords] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [longPressedStudentId, setLongPressedStudentId] = useState<string | null>(null);
  const [longPressedStudentCoords, setLongPressedStudentCoords] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Modals state
  const [isAddStudentModalVisible, setAddStudentModalVisible] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);

  const [isEditClassModalVisible, setEditClassModalVisible] = useState(false);
  const [isUpdatingClass, setIsUpdatingClass] = useState(false);

  const [isMoveModalVisible, setMoveModalVisible] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [selectedTargetClassId, setSelectedTargetClassId] = useState<string | null>(null);
  const [isMovingStudent, setIsMovingStudent] = useState(false);

  const [isAssignModalVisible, setAssignModalVisible] = useState(false);

  useEffect(() => {
    if (safeId) {
      fetchClassDetails();
      fetchStudents();
    }
  }, [safeId]);

  const fetchClassDetails = async () => {
    try {
      const data = await getClassById(safeId as string);
      if (!data) return;
      setClassDetails({
        id: data.id,
        name: data.title,
        level: data.grade || 'Grade 1',
        schedule: data.schedule || '',
        themeName: data.theme_name || 'blue',
      });
    } catch (e) {
      console.log('Error fetching class details:', e);
    }
  };

  const fetchStudents = async () => {
    try {
      setIsLoadingStudents(true);
      const data = await getClassStudents(safeId as string);
      setStudents(data);
    } catch (error: any) {
      Alert.alert('Error fetching students', error.message);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Add / Edit student handlers
  const handleAddStudent = async (studentData: { name: string; avatar: string; spectrumLevel: string; bio: string }) => {
    setIsCreatingStudent(true);
    try {
      const newStudent = await addStudent(
        classDetails.id,
        studentData.name,
        studentData.avatar,
        studentData.spectrumLevel || undefined,
        studentData.bio || undefined
      );
      await fetchStudents();
      setAddStudentModalVisible(false);

      if (newStudent?.learner_code) {
        Alert.alert(
          'Student Added!',
          `${newStudent.name}'s learner code is:\n\n${newStudent.learner_code}\n\nShare this code with the parent so they can link their dashboard.`
        );
      }
    } catch (error: any) {
      Alert.alert('Error adding student', error.message);
    } finally {
      setIsCreatingStudent(false);
    }
  };

  const handleEditStudent = async (studentData: { name: string; avatar: string; spectrumLevel: string; bio: string }) => {
    if (!selectedStudent) return;
    setIsCreatingStudent(true);
    try {
      await updateStudent(
        selectedStudent,
        studentData.name,
        studentData.avatar,
        studentData.spectrumLevel || undefined,
        studentData.bio || undefined
      );
      await fetchStudents();
      setAddStudentModalVisible(false);
      setIsEditingStudent(false);
      Alert.alert('Success', 'Student updated successfully!');
    } catch (error: any) {
      Alert.alert('Error updating student', error.message);
    } finally {
      setIsCreatingStudent(false);
    }
  };

  // Edit Class handlers
  const handleSaveClassEdit = async (updated: { title: string; grade: string; schedule: string; themeName: string }) => {
    setIsUpdatingClass(true);
    try {
      await updateClass(
        classDetails.id,
        updated.title,
        updated.grade,
        updated.schedule,
        updated.themeName
      );

      setClassDetails({
        id: classDetails.id,
        name: updated.title,
        level: updated.grade,
        schedule: updated.schedule,
        themeName: updated.themeName as any,
      });

      setEditClassModalVisible(false);
      Alert.alert('Success', 'Class updated successfully!');
    } catch (error: any) {
      Alert.alert('Update Failed', error.message);
    } finally {
      setIsUpdatingClass(false);
    }
  };

  const handleArchiveClass = () => {
    Alert.alert(
      'Archive Class',
      `Are you sure you want to archive "${classDetails.name}"? This class will be hidden from active classes.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              await archiveClass(classDetails.id, true);
              setEditClassModalVisible(false);
              router.back();
            } catch (error: any) {
              Alert.alert('Error archiving class', error.message);
            }
          },
        },
      ]
    );
  };

  const handleDeleteClass = () => {
    Alert.alert(
      'Delete Class',
      `Are you sure you want to permanently delete "${classDetails.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteClass(classDetails.id);
              setEditClassModalVisible(false);
              router.back();
            } catch (error: any) {
              Alert.alert('Error deleting class', error.message);
            }
          },
        },
      ]
    );
  };

  // Student actions
  const handleDeleteStudent = () => {
    const studentObj = students.find((s) => s.id === selectedStudent);
    if (!studentObj) return;

    Alert.alert(
      'Delete Student',
      `Are you sure you want to remove ${studentObj.name} from this class?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStudent(studentObj.id);
              setSelectedStudent(null);
              setActionMenuCoords(null);
              await fetchStudents();
              Alert.alert('Deleted', `${studentObj.name} removed from class.`);
            } catch (error: any) {
              Alert.alert('Error deleting student', error.message);
            }
          },
        },
      ]
    );
  };

  const handleOpenMoveStudent = async () => {
    try {
      const allTeacherClasses = await getTeacherClasses();
      const filtered = allTeacherClasses.filter((c: any) => c.id !== classDetails.id);
      setAvailableClasses(filtered);
      setSelectedTargetClassId(null);
      setMoveModalVisible(true);
    } catch (error: any) {
      Alert.alert('Error loading classes', error.message);
    }
  };

  const handleConfirmMoveStudent = async () => {
    if (!selectedStudent || !selectedTargetClassId) return;
    setIsMovingStudent(true);
    try {
      await moveStudentClass(selectedStudent, selectedTargetClassId);
      const studentObj = students.find((s) => s.id === selectedStudent);
      setSelectedStudent(null);
      setActionMenuCoords(null);
      await fetchStudents();
      setMoveModalVisible(false);
      Alert.alert('Moved!', `${studentObj?.name || 'Student'} moved to target class.`);
    } catch (error: any) {
      Alert.alert('Error moving student', error.message);
    } finally {
      setIsMovingStudent(false);
    }
  };

  const handleSaveAssignedActivities = async (newPaths: string[]) => {
    if (!selectedStudent) return;
    try {
      await updateStudentActivities(selectedStudent, newPaths);
      await fetchStudents();
      setAssignModalVisible(false);
      Alert.alert('Success', 'Assigned activities updated!');
    } catch (error: any) {
      Alert.alert('Error saving activities', error.message);
    }
  };

  const handleStartActivity = () => {
    const studentObj = students.find((s) => s.id === selectedStudent);
    if (!studentObj) return;

    router.push({
      pathname: '/(teacher-tabs)/student/[studentId]' as any,
      params: {
        studentId: studentObj.id,
        studentName: studentObj.name,
        assignedActivities: JSON.stringify(studentObj.assigned_activities || []),
        classId: studentObj.class_id,
        teacherId: studentObj.teacher_id,
      },
    });
  };

  const selectedStudentObj = students.find((s) => s.id === selectedStudent);

  return (
    <ClassScreenLayout
      title={classDetails.name}
      level={classDetails.level}
      schedule={classDetails.schedule}
      themeName={classDetails.themeName as any}
      onBackPress={() => router.back()}
      onEditPress={() => setEditClassModalVisible(true)}
      students={students}
      selectedStudentId={selectedStudent}
      longPressedStudentId={longPressedStudentId}
      onStudentPress={(id) => {
        const studentObj = students.find((s) => s.id === id);
        if (!studentObj) return;
        router.push({
          pathname: '/(teacher-tabs)/student/[studentId]' as any,
          params: {
            studentId: studentObj.id,
            studentName: studentObj.name,
            assignedActivities: JSON.stringify(studentObj.assigned_activities || []),
            classId: studentObj.class_id,
            teacherId: studentObj.teacher_id,
          },
        });
      }}
      onStudentLongPress={(id, coords) => {
        setSelectedStudent(id);
        setLongPressedStudentId(id);
        setLongPressedStudentCoords(coords);
      }}
      onAddStudentPress={() => {
        setIsEditingStudent(false);
        setAddStudentModalVisible(true);
      }}
    >
      {isLoadingStudents && (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator size="large" color="#62A9E6" />
        </View>
      )}

      {/* STUDENT LONG PRESS PREVIEW */}
      <LongPressPreview
        visible={!!longPressedStudentId}
        coords={longPressedStudentCoords}
        onClose={() => {
          setLongPressedStudentId(null);
          setLongPressedStudentCoords(null);
          setSelectedStudent(null);
        }}
        isTablet={isTablet}
        customMenu={
          <StudentActionMenu
            visible={!!longPressedStudentId}
            studentName={selectedStudentObj?.name || 'Student'}
            learnerCode={selectedStudentObj?.learner_code}
            onEditPress={() => {
              setLongPressedStudentId(null);
              setLongPressedStudentCoords(null);
              setIsEditingStudent(true);
              setAddStudentModalVisible(true);
            }}
            onAssignPress={() => {
              setLongPressedStudentId(null);
              setLongPressedStudentCoords(null);
              setAssignModalVisible(true);
            }}
            onMovePress={() => {
              setLongPressedStudentId(null);
              setLongPressedStudentCoords(null);
              handleOpenMoveStudent();
            }}
            onDeletePress={() => {
              setLongPressedStudentId(null);
              setLongPressedStudentCoords(null);
              handleDeleteStudent();
            }}
            onDeselectPress={() => {
              setLongPressedStudentId(null);
              setLongPressedStudentCoords(null);
              setSelectedStudent(null);
            }}
            onStartActivityPress={() => {
              setLongPressedStudentId(null);
              setLongPressedStudentCoords(null);
              handleStartActivity();
            }}
            isTablet={isTablet}
            coords={longPressedStudentCoords}
          />
        }
      >
        {selectedStudentObj && (
          <View className="items-center justify-center w-full h-full">
            {/* Outer circle with theme border */}
            <View 
              className="items-center justify-center border-[4px] relative bg-white"
              style={{ 
                borderColor: '#62A9E6',
                width: isTablet ? 140 : 90,
                height: isTablet ? 140 : 90,
                borderRadius: isTablet ? 70 : 45
              }}
            >
              {/* Inner circle with thick white border */}
              <View 
                className="w-full h-full items-center justify-center bg-[#E5E7EB] border-white"
                style={{
                  borderWidth: isTablet ? 4 : 3,
                  borderRadius: isTablet ? 66 : 42,
                }}
              >
                <Text style={{ fontSize: isTablet ? 64 : 40 }}>
                  {selectedStudentObj.avatar || '🙂'}
                </Text>
              </View>

              {/* Assigned Activities Badge */}
              {(selectedStudentObj.assigned_activities?.length || 0) > 0 && (
                <View 
                  className="absolute -top-1 -right-1 bg-[#62A9E6] border-2 border-white rounded-full px-2 py-0.5 items-center justify-center z-10"
                >
                  <Text className="text-white font-fredoka-one text-[11px]">
                    {selectedStudentObj.assigned_activities.length}
                  </Text>
                </View>
              )}
            </View>

            {/* First Name */}
            <Text 
              className="font-fredoka-one mt-2 text-center text-[#484A4B]" 
              style={{ 
                fontSize: isTablet ? 22 : 16
              }}
              numberOfLines={1}
            >
              {selectedStudentObj.name ? selectedStudentObj.name.split(' ')[0] : 'Student'}
            </Text>
          </View>
        )}
      </LongPressPreview>

      {/* EDIT CLASS MODAL */}
      <EditClassModal
        visible={isEditClassModalVisible}
        onClose={() => setEditClassModalVisible(false)}
        isTablet={isTablet}
        isUpdating={isUpdatingClass}
        initialData={{
          title: classDetails.name,
          grade: classDetails.level,
          schedule: classDetails.schedule,
          themeName: classDetails.themeName,
        }}
        onSubmit={handleSaveClassEdit}
        onArchive={handleArchiveClass}
        onDelete={handleDeleteClass}
      />

      {/* ADD / EDIT STUDENT MODAL */}
      <AddStudentModal
        visible={isAddStudentModalVisible}
        onClose={() => {
          setAddStudentModalVisible(false);
          setIsEditingStudent(false);
        }}
        isTablet={isTablet}
        isCreating={isCreatingStudent}
        onSubmit={isEditingStudent ? handleEditStudent : handleAddStudent}
        initialData={
          isEditingStudent && selectedStudentObj
            ? {
                name: selectedStudentObj.name,
                avatar: selectedStudentObj.avatar || '🙂',
                spectrumLevel: selectedStudentObj.spectrum_level || '',
                bio: selectedStudentObj.bio || '',
              }
            : null
        }
        isEditing={isEditingStudent}
      />

      {/* MOVE STUDENT MODAL */}
      <BaseModal
        visible={isMoveModalVisible}
        onClose={() => setMoveModalVisible(false)}
        title={`Move ${selectedStudentObj?.name || 'Student'}`}
        isTablet={isTablet}
        onSubmit={handleConfirmMoveStudent}
        submitLabel="MOVE"
        submitDisabled={!selectedTargetClassId || isMovingStudent}
        isSubmitting={isMovingStudent}
        cancelLabel="CANCEL"
      >
        <Text className="font-quicksand-medium text-[#6B7280] mb-4 text-sm">
          Select a class below to move this student to:
        </Text>
        {availableClasses.length === 0 ? (
          <View className="py-8 items-center justify-center">
            <Ionicons name="folder-open-outline" size={40} color="#9CA3AF" />
            <Text className="font-quicksand-medium text-[#9CA3AF] text-center mt-2 text-sm">
              No other classes available. Create another class first!
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {availableClasses.map((cls) => {
              const isChosen = selectedTargetClassId === cls.id;
              return (
                <Pressable
                  key={cls.id}
                  onPress={() => setSelectedTargetClassId(cls.id)}
                  className={`flex-row items-center justify-between p-4 rounded-xl border-[2px] active:scale-95 transition-transform ${
                    isChosen ? 'bg-white border-[#BBE8FB]' : 'bg-white border-[#F1F1F1]'
                  }`}
                  style={{
                    shadowColor: isChosen ? '#BBE8FB' : '#F1F1F1',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full bg-[#F1F1F1] items-center justify-center">
                      <Ionicons name="school" size={20} color="#62A9E6" />
                    </View>
                    <View>
                      <Text className={`font-fredoka-one text-base ${isChosen ? 'text-[#62A9E6]' : 'text-[#484A4B]'}`}>
                        {cls.title}
                      </Text>
                      <Text className="font-quicksand-medium text-xs text-[#9CA3AF]">
                        {cls.grade || 'Grade 1'} {cls.schedule ? `• ${cls.schedule}` : ''}
                      </Text>
                    </View>
                  </View>
                  {isChosen && <Ionicons name="checkmark-circle" size={24} color="#62A9E6" />}
                </Pressable>
              );
            })}
          </View>
        )}
      </BaseModal>

      {/* ASSIGN ACTIVITIES MODAL */}
      <AssignActivitiesModal
        visible={isAssignModalVisible}
        onClose={() => setAssignModalVisible(false)}
        studentName={selectedStudentObj?.name}
        initialAssignedActivities={selectedStudentObj?.assigned_activities || []}
        onSave={handleSaveAssignedActivities}
        isTablet={isTablet}
      />
    </ClassScreenLayout>
  );
}