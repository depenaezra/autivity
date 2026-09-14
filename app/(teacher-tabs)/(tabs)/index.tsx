import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, useWindowDimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { ArchivedClassesModal } from '../../../components/teacher/home/archived-classes-modal';
import { AddClassModal } from '../../../components/teacher/home/add-class-modal';
import { DashboardHeader } from '../../../components/teacher/home/dashboard-header';
import { StatsSection } from '../../../components/teacher/home/stats-section';
import { ClassesSection } from '../../../components/teacher/home/classes-section';
import { VideosSection } from '../../../components/teacher/home/videos-section';
import { LessonsSection } from '../../../components/teacher/home/lessons-section';
import { VideoPlayerModal } from '../../../components/teacher/home/video-player-modal';
import { AddVideoModal } from '../../../components/teacher/home/add-video-modal';
import { DEFAULT_WARMUP_VIDEOS, WarmupVideo } from '../../../constants/warmup-videos';
import {
  getStoredWarmupVideos,
  saveWarmupVideo,
  archiveWarmupVideo,
  deleteWarmupVideo,
} from '../../../src/services/warmup-videos';
import { useTeacherDashboard } from '../../../hooks/use-teacher-dashboard';
import { Alert } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [focusKey, setFocusKey] = useState(0);
  const [selectedWarmupVideo, setSelectedWarmupVideo] = useState<WarmupVideo | null>(null);
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = useState(false);

  // Video Management State
  const [warmupVideos, setWarmupVideos] = useState<WarmupVideo[]>(DEFAULT_WARMUP_VIDEOS);
  const [isAddVideoModalVisible, setIsAddVideoModalVisible] = useState(false);
  const [editingVideo, setEditingVideo] = useState<WarmupVideo | null>(null);
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  const fetchVideos = useCallback(async () => {
    try {
      const { activeVideos } = await getStoredWarmupVideos();
      setWarmupVideos(activeVideos);
    } catch (err) {
      console.error('Failed to load warmup videos:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setFocusKey((prev) => prev + 1);
      fetchVideos();
    }, [fetchVideos])
  );

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

  const handleSelectWarmupVideo = (video: WarmupVideo) => {
    setSelectedWarmupVideo(video);
    setIsVideoPlayerVisible(true);
  };

  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setIsAddVideoModalVisible(true);
  };

  const handleStartEditVideo = (video: WarmupVideo) => {
    setEditingVideo(video);
    setIsAddVideoModalVisible(true);
  };

  const handleSaveVideo = async (videoData: any) => {
    setIsSavingVideo(true);
    try {
      await saveWarmupVideo(videoData);
      await fetchVideos();
      setIsAddVideoModalVisible(false);
      setEditingVideo(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save video.');
    } finally {
      setIsSavingVideo(false);
    }
  };

  const handleDeleteVideoItem = (videoId: string) => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to remove this video from your Move & Groove collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWarmupVideo(videoId);
              await fetchVideos();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete video.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FBFBFB]" edges={['top', 'left', 'right']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isTablet ? 40 : 24 }}
      >
        {/* HEADER SECTION */}
        <Animated.View key={`header-${focusKey}`} entering={FadeInRight.delay(50).duration(300)}>
          <DashboardHeader 
            firstName={firstName} 
            isTablet={isTablet} 
            onProfilePress={() => router.push('/(teacher-tabs)/profile' as any)} 
          />
        </Animated.View>

        {/* STATS SECTION */}
        <Animated.View key={`stats-${focusKey}`} entering={FadeInRight.delay(100).duration(300)}>
          <StatsSection 
            stats={stats} 
            isTablet={isTablet} 
            router={router} 
          />
        </Animated.View>

        {/* CLASSES SECTION */}
        <Animated.View key={`classes-${focusKey}`} entering={FadeInRight.delay(150).duration(300)}>
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

        {/* MOVE & GROOVE CAROUSEL SECTION */}
        <Animated.View key={`warmup-${focusKey}`} entering={FadeInRight.delay(200).duration(300)}>
          <VideosSection
            isTablet={isTablet}
            videos={warmupVideos}
            onSelectVideo={handleSelectWarmupVideo}
            onAddVideo={handleOpenAddVideo}
            onEditVideo={handleStartEditVideo}
            onDeleteVideo={handleDeleteVideoItem}
          />
        </Animated.View>

        {/* LESSONS SECTION */}
        <Animated.View key={`lessons-${focusKey}`} entering={FadeInRight.delay(250).duration(300)}>
          <LessonsSection 
            lessonCount={stats.lessons} 
            isTablet={isTablet} 
            onPress={() => router.push('/lesson-materials' as any)} 
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
        existingClassNames={[...classesData, ...archivedClasses]
          .filter((c) => c.id !== editingClassId)
          .map((c) => c.title)}
      />

      {/* ARCHIVED CLASSES MODAL */}
      <ArchivedClassesModal
        visible={isArchivedModalVisible}
        onClose={() => setArchivedModalVisible(false)}
        archivedClasses={archivedClasses}
        onUnarchive={handleUnarchiveClass}
        isTablet={isTablet}
      />

      {/* IN-APP THEATER VIDEO PLAYER MODAL */}
      <VideoPlayerModal
        visible={isVideoPlayerVisible}
        video={selectedWarmupVideo}
        onClose={() => setIsVideoPlayerVisible(false)}
        isTablet={isTablet}
      />

      {/* ADD / EDIT VIDEO MODAL */}
      <AddVideoModal
        visible={isAddVideoModalVisible}
        onClose={() => {
          setIsAddVideoModalVisible(false);
          setEditingVideo(null);
        }}
        onSubmit={handleSaveVideo}
        isTablet={isTablet}
        isSubmitting={isSavingVideo}
        editingVideo={editingVideo}
      />
    </SafeAreaView>
  );
}
