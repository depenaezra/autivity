import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { createStudentMilestone, deleteStudentMilestone, getStudentMilestones, Milestone, updateStudentMilestoneStatus } from '../../../../src/services/student-analytics';

interface MilestonesProps {
    studentId: string;
}

export default function Milestones({ studentId }: MilestonesProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Milestone creation states
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState('');

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
            'Achieved': 'Target Set'
        };
        const nextStatus = statusCycle[currentStatus] || 'Target Set';

        try {
            setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, status: nextStatus } : m));
            await updateStudentMilestoneStatus(milestoneId, nextStatus);
        } catch (err: any) {
            Alert.alert('Error', 'Failed to update milestone status.');
            fetchMilestones();
        }
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
                            setMilestones(prev => prev.filter(m => m.id !== milestoneId));
                            await deleteStudentMilestone(milestoneId);
                        } catch (err: any) {
                            Alert.alert('Error', 'Failed to delete milestone.');
                            fetchMilestones();
                        }
                    }
                }
            ]
        );
    };

    const handleAddMilestone = async () => {
        if (!newTitle.trim() || !newDate.trim()) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        try {
            const added = await createStudentMilestone(studentId, newTitle, newDate);
            setMilestones(prev => [added, ...prev]);
            setIsModalVisible(false);
            setNewTitle('');
            setNewDate('');
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to create milestone.');
        }
    };

    if (isLoading) {
        return (
            <View className="bg-white border border-[#E5E7EB] rounded-2xl p-6 items-center justify-center min-h-[140px] mt-6">
                <ActivityIndicator size="small" color="#62A9E6" />
                <Text className="mt-3 font-quicksand-semibold text-sm text-[#9CA3AF]">
                    Loading milestones...
                </Text>
            </View>
        );
    }

    return (
        <View className="mt-6 flex-col">
            <View className="flex-row justify-between items-center mb-3">
                <Text className="font-fredoka-one text-xl text-[#4B5563]">
                    Milestone Tracking
                </Text>

                <TouchableOpacity onPress={() => setIsModalVisible(true)} className="flex-row items-center gap-1">
                    <Text className={`font-quicksand-medium text-[#62A9E6] ${isTablet ? 'text-sm' : 'text-xs'}`}>
                        Add Milestone
                    </Text>
                    <Feather name="plus-circle" size={20} color="#62A9E6" />
                </TouchableOpacity>
            </View>

            {error ? (
                <View className="w-full justify-center items-center py-6 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
                    <Feather name="alert-circle" size={24} color="#EF4444" />
                    <Text className="font-quicksand-semibold text-sm text-[#9CA3AF] mt-2">
                        {error}
                    </Text>
                </View>
            ) : milestones.length === 0 ? (
                <View className="bg-white p-6 rounded-2xl border border-[#E5E7EB] items-center justify-center shadow-sm">
                    <Text className="font-quicksand-medium text-sm text-[#9CA3AF]">
                        No milestones set for this learner yet.
                    </Text>
                </View>
            ) : (
                <View className="gap-3">
                    {milestones.map((milestone) => (
                        <View
                            key={milestone.id}
                            className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex-row items-start justify-between shadow-sm"
                        >
                            <View className="flex-row items-start gap-3 flex-1 mr-2">
                                <View
                                    className={`w-6 h-6 rounded-full items-center justify-center mt-0.5 ${milestone.status === 'Achieved'
                                        ? 'bg-[#DCFCE7]'
                                        : milestone.status === 'In Progress'
                                            ? 'bg-[#FEF9C3]'
                                            : 'bg-[#F3F4F6]'
                                        }`}
                                >
                                    <Ionicons
                                        name={milestone.status === 'Achieved' ? 'checkmark' : milestone.status === 'In Progress' ? 'refresh' : 'flag-outline'}
                                        size={isTablet ? 16 : 14}
                                        color={milestone.status === 'Achieved' ? '#16A34A' : milestone.status === 'In Progress' ? '#CA8A04' : '#6B7280'}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-base' : 'text-sm'}`}>
                                        {milestone.title}
                                    </Text>
                                    <Text className={`font-quicksand-medium text-[#9CA3AF] mt-0.5 ${isTablet ? 'text-sm' : 'text-xs'}`}>
                                        Started: {milestone.startDate} • Target: {milestone.targetDate}
                                    </Text>
                                </View>
                            </View>

                            {/* milestone status button + delete button */}
                            <View className="flex-row items-center gap-2">
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => handleToggleMilestone(milestone.id, milestone.status)}
                                    className={`px-3 py-1.5 rounded-full ${milestone.status === 'Achieved'
                                        ? 'bg-[#DCFCE7]'
                                        : milestone.status === 'In Progress'
                                            ? 'bg-[#FEF9C3]'
                                            : 'bg-[#F3F4F6]'
                                        }`}
                                >
                                    <Text
                                        className={`font-quicksand-bold uppercase ${isTablet ? 'text-xs' : 'text-[10px]'} ${milestone.status === 'Achieved'
                                            ? 'text-[#16A34A]'
                                            : milestone.status === 'In Progress'
                                                ? 'text-[#CA8A04]'
                                                : 'text-[#6B7280]'
                                            }`}
                                    >
                                        {milestone.status}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => handleDeleteMilestone(milestone.id)}
                                    className="p-1.5 rounded-full bg-[#FEF2F2] border border-[#FEE2E2]"
                                >
                                    <Feather name="trash-2" size={isTablet ? 16 : 14} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Set New Milestone Modal */}
            <Modal visible={isModalVisible} transparent animationType="fade">
                <View className="flex-1 justify-center bg-black/50 p-6">
                    <View className="bg-white w-full max-w-lg rounded-[24px] border-[3px] border-[#D5D0D2] border-b-[6px] p-6 shadow-xl self-center">
                        <Text className="font-fredoka-one text-2xl text-[#4B5563] mb-4 border-b border-[#F3F4F6] pb-3">Set New Milestone</Text>

                        <Text className="font-quicksand-bold text-[#4B5563] text-sm mb-1.5">Milestone Title</Text>
                        <TextInput
                            placeholder="Milestone Title"
                            placeholderTextColor="#9CA3AF"
                            className="w-full h-12 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 text-base text-[#4B5563] mb-4"
                            value={newTitle}
                            onChangeText={setNewTitle}
                        />

                        <Text className="font-quicksand-bold text-[#4B5563] text-sm mb-1.5">Target Date</Text>
                        <TextInput
                            placeholder="Target Date (e.g. Aug 01, 2026)"
                            placeholderTextColor="#9CA3AF"
                            className="w-full h-12 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 text-base text-[#4B5563] mb-6"
                            value={newDate}
                            onChangeText={setNewDate}
                        />

                        <View className="flex-row gap-3">
                            <Pressable
                                onPress={() => {
                                    setIsModalVisible(false);
                                    setNewTitle('');
                                    setNewDate('');
                                }}
                                className={`flex-1 rounded-xl bg-[#F3F4F6] border-b-[3px] border-[#D1D5DB] justify-center items-center ${isTablet ? 'h-16' : 'h-14'}`}
                            >
                                <Text className="font-quicksand-bold text-[#6B7280] text-base">Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleAddMilestone}
                                className={`flex-1 rounded-xl bg-[#62A9E6] border-b-[3px] border-[#5298D4] justify-center items-center ${isTablet ? 'h-16' : 'h-14'}`}
                            >
                                <Text className="font-quicksand-bold text-white text-base">Save</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
