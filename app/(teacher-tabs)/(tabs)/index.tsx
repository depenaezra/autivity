import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, useWindowDimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { ArchivedClassesModal } from '../../../components/teacher/home/archived-classes-modal';
import { AddClassModal } from '../../../components/teacher/home/add-class-modal';
import { DashboardHeader } from '../../../components/teacher/home/dashboard-header';
import { StatsSection } from '../../../components/teacher/home/stats-section';
import { ClassesSection } from '../../../components/teacher/home/classes-section';
import { LessonsSection } from '../../../components/teacher/home/lessons-section';
import { StudentsSection } from '../../../components/teacher/home/students-section';
import { useTeacherDashboard } from '../../../hooks/use-teacher-dashboard';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const {
    firstName,
    classesData,
    archivedClasses,
    studentsData,
    isLoading,
    isCreating,
    stats,
    isAddClassModalVisible,
    setAddClassModalVisible,
    isArchivedModalVisible,
    setArchivedModalVisible,
    slideAnim,
    // Add Class Form State
    newClassName,
    setNewClassName,
    newClassSchedule,
    setNewClassSchedule,
    newClassGrade,
    setNewClassGrade,
    newClassTheme,
    setNewClassTheme,
    editingClassId,
    // Operations
    handleAddClass,
    handleUnarchiveClass,
    handleStartEditClass,
    handleArchiveClass,
    handleDeleteClass,
  } = useTeacherDashboard();

  return (
    <SafeAreaView className="flex-1 bg-[#FBFBFB]" edges={['top', 'left', 'right']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isTablet ? 40 : 24 }}
      >
        {/* HEADER SECTION */}
        <Animated.View entering={FadeInRight.delay(50).duration(300)}>
          <DashboardHeader 
            firstName={firstName} 
            isTablet={isTablet} 
            onProfilePress={() => router.push('/(teacher-tabs)/profile' as any)} 
          />
        </Animated.View>

        {/* STATS SECTION */}
        <Animated.View entering={FadeInRight.delay(100).duration(300)}>
          <StatsSection 
            stats={stats} 
            isTablet={isTablet} 
            router={router} 
          />
        </Animated.View>

        {/* CLASSES SECTION */}
        <Animated.View entering={FadeInRight.delay(150).duration(300)}>
          <ClassesSection 
            classesData={classesData}
            archivedCount={archivedClasses.length}
            isLoading={isLoading}
            isTablet={isTablet}
            onOpenArchive={() => setArchivedModalVisible(true)}
            onAddClass={() => setAddClassModalVisible(true)}
            onEditClass={handleStartEditClass}
            onArchiveClass={handleArchiveClass}
            onDeleteClass={handleDeleteClass}
          />
        </Animated.View>

        {/* LESSONS SECTION */}
        <Animated.View entering={FadeInRight.delay(200).duration(300)}>
          <LessonsSection 
            lessonCount={stats.lessons} 
            isTablet={isTablet} 
            onPress={() => router.push('/lesson-materials' as any)} 
          />
        </Animated.View>

        {/* STUDENTS SECTION */}
        <Animated.View entering={FadeInRight.delay(250).duration(300)}>
          <StudentsSection
            studentsData={studentsData}
            isTablet={isTablet}
            onPress={() => router.push('/student-list' as any)}
          />
        </Animated.View>
      </ScrollView>

      {/* ADD CLASS MODAL */}
      <AddClassModal
        visible={isAddClassModalVisible}
        onClose={() => setAddClassModalVisible(false)}
        isTablet={isTablet}
        isCreating={isCreating}
        newClassName={newClassName}
        setNewClassName={setNewClassName}
        newClassSchedule={newClassSchedule}
        setNewClassSchedule={setNewClassSchedule}
        newClassGrade={newClassGrade}
        setNewClassGrade={setNewClassGrade}
        newClassTheme={newClassTheme}
        setNewClassTheme={setNewClassTheme}
        onSubmit={handleAddClass}
        isEditing={!!editingClassId}
      />

      {/* ARCHIVED CLASSES MODAL */}
      <ArchivedClassesModal
        visible={isArchivedModalVisible}
        onClose={() => setArchivedModalVisible(false)}
        archivedClasses={archivedClasses}
        onUnarchive={handleUnarchiveClass}
        isTablet={isTablet}
      />
    </SafeAreaView>
  );
}
