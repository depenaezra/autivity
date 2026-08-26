import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as Haptics from 'expo-haptics';
import AnimatedReanimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {
  createStudentMilestone,
  deleteStudentMilestone,
  getStudentMilestones,
  Milestone,
  updateStudentMilestone,
  updateStudentMilestoneStatus,
} from '../../../../src/services/student-analytics';

import EditIcon from '../../../../assets/images/teacher/class/icon-button-edit.svg';
import DeleteIcon from '../../../../assets/images/teacher/class/icon-button-delete.svg';
import AddMilestoneModal from './add-milestone-modal';

interface MilestonesProps {
  studentId: string;
}

function MilestoneSkeletonItem({ isTablet }: { isTablet: boolean }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 750 }),
        withTiming(0.4, { duration: 750 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedReanimated.View
      className={`bg-white border-[2px] border-[#F1F1F1] flex-row items-center justify-between overflow-hidden ${
        isTablet ? 'rounded-[24px] p-5' : 'rounded-[16px] p-3.5'
      }`}
      style={[
        {
          shadowColor: '#F1F1F1',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 2,
        },
        animatedStyle,
      ]}
    >
      <View className="w-1.5 self-stretch rounded-full mr-3 bg-[#E5E7EB]" />
      <View className="flex-1 pr-2">
        <View className={`bg-[#E5E7EB] rounded-[4px] ${isTablet ? 'h-5 w-40 mb-2' : 'h-4 w-28 mb-1.5'}`} />
        <View className={`bg-[#E5E7EB] rounded-[4px] ${isTablet ? 'h-4 w-56' : 'h-3.5 w-36'}`} />
      </View>
      <View className={`bg-[#E5E7EB] rounded-[6px] ${isTablet ? 'h-7 w-20' : 'h-5 w-14'}`} />
    </AnimatedReanimated.View>
  );
}

export default function Milestones({ studentId }: MilestonesProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active open Swipeable ref
  const openSwipeableRef = useRef<any>(null);

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchMilestones = async () => {
    setIsLoading(true);
    try {
      const data = await getStudentMilestones(studentId);
      setMilestones(data);
      setError(null);
    } catch (err: any) {
      console.error('Milestones component: failed to load milestones', err);
      setError('Failed to load milestones.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [studentId]);

  const handleToggleMilestone = async (milestoneId: string, currentStatus: string) => {
    const statusCycle: Record<string, 'Target Set' | 'In Progress' | 'Achieved'> = {
      'Target Set': 'In Progress',
      'In Progress': 'Achieved',
      'Achieved': 'Target Set',
    };
    const nextStatus = statusCycle[currentStatus] || 'Target Set';

    try {
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestoneId ? { ...m, status: nextStatus } : m))
      );
      await updateStudentMilestoneStatus(milestoneId, nextStatus);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update milestone status.');
      fetchMilestones();
    }
  };

  const handleEditPress = (milestone: Milestone) => {
    setEditingMilestoneId(milestone.id);
    setNewTitle(milestone.title);
    setNewDate(milestone.targetDate);
    setIsModalVisible(true);
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    Alert.alert(
      'Delete Milestone',
      'Are you sure you want to delete this milestone?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
              await deleteStudentMilestone(milestoneId);
            } catch (err: any) {
              Alert.alert('Error', 'Failed to delete milestone.');
              fetchMilestones();
            }
          },
        },
      ]
    );
  };

  const handleSaveMilestone = async () => {
    if (!newTitle.trim() || !newDate.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setIsSaving(true);
    try {
      if (editingMilestoneId) {
        const updated = await updateStudentMilestone(editingMilestoneId, newTitle.trim(), newDate.trim());
        setMilestones((prev) =>
          prev.map((m) => (m.id === editingMilestoneId ? updated : m))
        );
      } else {
        const added = await createStudentMilestone(studentId, newTitle.trim(), newDate.trim());
        setMilestones((prev) => [added, ...prev]);
      }
      setIsModalVisible(false);
      setEditingMilestoneId(null);
      setNewTitle('');
      setNewDate('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save milestone.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderRightActions = (
    milestone: Milestone,
    swipeableRef: any,
    progress: Animated.AnimatedInterpolation<number>
  ) => {
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
              handleEditPress(milestone);
            }}
            className="flex-col items-center justify-center active:scale-95 transition-transform"
            style={{ width: isTablet ? 72 : 56 }}
          >
            <View className="items-center justify-center" style={{ height: isTablet ? 32 : 26 }}>
              <EditIcon width={isTablet ? 26 : 22} height={isTablet ? 26 : 22} />
            </View>
            <Text
              className={`font-fredoka-one text-[#62A9E6] text-center w-full px-1 ${
                isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'
              }`}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              EDIT
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
              handleDeleteMilestone(milestone.id);
            }}
            className="flex-col items-center justify-center active:scale-95 transition-transform"
            style={{ width: isTablet ? 72 : 56 }}
          >
            <View className="items-center justify-center" style={{ height: isTablet ? 32 : 26 }}>
              <DeleteIcon width={isTablet ? 26 : 22} height={isTablet ? 26 : 22} />
            </View>
            <Text
              className={`font-fredoka-one text-[#FF3B3F] text-center w-full px-1 ${
                isTablet ? 'text-[12px] mt-2' : 'text-[10px] mt-1.5'
              }`}
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
    <View className="w-full mt-6">
      {/* Header section with Title & "ADD" Button matching ClassesSection Archived button */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
          Milestone Tracking
        </Text>

        <Pressable
          onPress={() => {
            setEditingMilestoneId(null);
            setNewTitle('');
            setNewDate('');
            setIsModalVisible(true);
          }}
          className={`bg-white border-[2px] rounded-[8px] justify-center items-center active:scale-95 transition-transform ${
            isTablet ? 'px-4 py-2' : 'px-3 py-1.5'
          }`}
          style={{
            borderColor: '#BBE8FB',
            shadowColor: '#BBE8FB',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          }}
        >
          <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
            ADD
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="gap-3">
          <MilestoneSkeletonItem isTablet={isTablet} />
          <MilestoneSkeletonItem isTablet={isTablet} />
          <MilestoneSkeletonItem isTablet={isTablet} />
        </View>
      ) : error ? (
        <View className="w-full justify-center items-center py-6 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
          <Feather name="alert-circle" size={24} color="#EF4444" />
          <Text className="font-quicksand-semibold text-sm text-[#9CA3AF] mt-2">
            {error}
          </Text>
        </View>
      ) : milestones.length === 0 ? (
        <View className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-2xl p-8 items-center justify-center">
          <Feather name="flag" size={isTablet ? 44 : 32} color="#9CA3AF" />
          <Text className="font-fredoka-one text-lg text-[#4B5563] mt-3 text-center">
            No Milestones Set
          </Text>
          <Text className="font-quicksand-medium text-sm text-[#9CA3AF] mt-1 text-center">
            No milestones set for this learner yet.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {milestones.map((milestone) => {
            const isAchieved = milestone.status === 'Achieved';
            const isInProgress = milestone.status === 'In Progress';

            const accentColor = isAchieved ? '#179D33' : isInProgress ? '#FFAE02' : '#62A9E6';
            const statusBg = isAchieved ? '#CBFAC4' : isInProgress ? '#FFF3C4' : '#E0F2FE';
            const statusBorder = isAchieved ? '#179D33' : isInProgress ? '#FFAE02' : '#62A9E6';
            const statusText = isAchieved ? '#179D33' : isInProgress ? '#D97706' : '#62A9E6';

            let currentSwipeableRef: any = null;

            return (
              <Swipeable
                key={milestone.id}
                ref={(ref) => {
                  currentSwipeableRef = ref;
                }}
                renderRightActions={(progress) =>
                  renderRightActions(milestone, currentSwipeableRef, progress)
                }
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
                <View
                  className={`bg-white border-[2px] border-[#F1F1F1] flex-row items-center justify-between overflow-hidden ${
                    isTablet ? 'rounded-[24px] p-5' : 'rounded-[16px] p-3.5'
                  }`}
                  style={{
                    shadowColor: '#F1F1F1',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 2,
                  }}
                >
                  {/* Left-Side Colored Accent Bar */}
                  <View
                    className="w-1.5 self-stretch rounded-full mr-3"
                    style={{ backgroundColor: accentColor }}
                  />

                  {/* Milestone Details */}
                  <View className="flex-1 pr-2">
                    <Text
                      className={`font-fredoka-one text-[#484A4B] ${
                        isTablet ? 'text-lg' : 'text-base'
                      }`}
                    >
                      {milestone.title}
                    </Text>
                    {/* Optically-aligned Start & Target Date Row */}
                    <View className="flex-row items-center gap-2 mt-1 flex-wrap">
                      {milestone.startDate ? (
                        <View className="flex-row items-center gap-1">
                          <View className="justify-center items-center">
                            <Feather name="calendar" size={isTablet ? 12 : 10} color="#9CA3AF" />
                          </View>
                          <Text
                            className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-sm' : 'text-[11px]'}`}
                            numberOfLines={1}
                          >
                            {isTablet ? `Started: ${milestone.startDate}` : milestone.startDate}
                          </Text>
                        </View>
                      ) : null}

                      {milestone.startDate && milestone.targetDate ? (
                        <Text className="text-[#D1D5DB] text-xs">•</Text>
                      ) : null}

                      {milestone.targetDate ? (
                        <View className="flex-row items-center gap-1">
                          <View className="justify-center items-center">
                            <Feather name="flag" size={isTablet ? 12 : 10} color="#9CA3AF" />
                          </View>
                          <Text
                            className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-sm' : 'text-[11px]'}`}
                            numberOfLines={1}
                          >
                            {isTablet ? `Target: ${milestone.targetDate}` : milestone.targetDate}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {/* Status Pill on Right */}
                  <Pressable
                    onPress={() => handleToggleMilestone(milestone.id, milestone.status)}
                    className="px-3 py-1 rounded-[8px] border-[2px] flex-row items-center gap-1 active:scale-95 transition-transform"
                    style={{
                      backgroundColor: statusBg,
                      borderColor: statusBorder,
                    }}
                  >
                    <Text
                      className={`font-fredoka-one uppercase ${isTablet ? 'text-xs' : 'text-[10px]'}`}
                      style={{ color: statusText }}
                    >
                      {milestone.status}
                    </Text>
                  </Pressable>
                </View>
              </Swipeable>
            );
          })}
        </View>
      )}

      {/* Set / Edit Milestone Modal */}
      <AddMilestoneModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setEditingMilestoneId(null);
          setNewTitle('');
          setNewDate('');
        }}
        isTablet={isTablet}
        isSaving={isSaving}
        title={newTitle}
        setTitle={setNewTitle}
        targetDate={newDate}
        setTargetDate={setNewDate}
        onSubmit={handleSaveMilestone}
        isEditing={!!editingMilestoneId}
      />
    </View>
  );
}
