import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BaseModal } from '../home/base-modal';
import {
  createMilestoneTemplate,
  deleteMilestoneTemplate,
  getTeacherMilestoneTemplates,
  MilestoneTemplate,
  seedStarterMilestoneTemplates,
} from '@/src/services/milestoneTemplates';

interface StandardMilestonesModalProps {
  visible: boolean;
  onClose: () => void;
  isTablet?: boolean;
  onTemplatesUpdated?: (count: number) => void;
}

export function StandardMilestonesModal({
  visible,
  onClose,
  isTablet = false,
  onTemplatesUpdated,
}: StandardMilestonesModalProps) {
  const [templates, setTemplates] = useState<MilestoneTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      let data = await getTeacherMilestoneTemplates();
      if (data.length === 0) {
        // Auto-seed starter templates if brand new
        data = await seedStarterMilestoneTemplates().catch(() => []);
      }
      setTemplates(data);
      onTemplatesUpdated?.(data.length);
    } catch (err: any) {
      console.error('Error fetching milestone templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchTemplates();
      setIsAdding(false);
      setNewTitle('');
      setNewDescription('');
    }
  }, [visible]);

  const handleCreateTemplate = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Required', 'Please enter a milestone title.');
      return;
    }
    setIsSaving(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const created = await createMilestoneTemplate(newTitle.trim(), newDescription.trim());
      const updated = [...templates, created];
      setTemplates(updated);
      onTemplatesUpdated?.(updated.length);
      setNewTitle('');
      setNewDescription('');
      setIsAdding(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create standard milestone.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = (id: string, title: string) => {
    Alert.alert(
      'Delete Standard Milestone',
      `Are you sure you want to delete "${title}"? This will not affect milestones already assigned to students.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await deleteMilestoneTemplate(id);
              const updated = templates.filter((t) => t.id !== id);
              setTemplates(updated);
              onTemplatesUpdated?.(updated.length);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete template.');
            }
          },
        },
      ]
    );
  };

  const handleSeedDefaults = async () => {
    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const seeded = await seedStarterMilestoneTemplates();
      const updated = [...templates, ...seeded];
      setTemplates(updated);
      onTemplatesUpdated?.(updated.length);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed adding starter milestones.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Standard Milestones"
      isTablet={isTablet}
      cancelLabel="CLOSE"
      heightClassName={isTablet ? 'h-[72%]' : 'h-[78%]'}
    >
      {/* INLINE ADD FORM */}
      {isAdding ? (
        <View className="bg-[#F8FAFC] border-[2px] border-[#BBE8FB] rounded-[20px] p-4 mb-4">
          <Text className="font-fredoka-one text-xs md:text-sm text-[#0284C7] uppercase mb-2">
            New Milestone Template
          </Text>

          <TextInput
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="Milestone Title (e.g. Letter Tracing Independence)"
            placeholderTextColor="#9CA3AF"
            className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-2.5 font-quicksand-medium text-sm text-[#4B5563] mb-2.5"
          />

          <TextInput
            value={newDescription}
            onChangeText={setNewDescription}
            placeholder="Default criteria or notes (optional)"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={2}
            className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-2.5 font-quicksand-medium text-sm text-[#4B5563] min-h-[60px] mb-3"
          />

          <View className="flex-row gap-2.5 justify-end">
            <Pressable
              onPress={() => {
                setIsAdding(false);
                setNewTitle('');
                setNewDescription('');
              }}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] active:scale-95"
            >
              <Text className="font-fredoka-one text-xs text-[#6B7280]">CANCEL</Text>
            </Pressable>

            <Pressable
              onPress={handleCreateTemplate}
              disabled={isSaving || !newTitle.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#62A9E6] active:scale-95 items-center justify-center"
              style={{ opacity: isSaving || !newTitle.trim() ? 0.6 : 1 }}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="font-fredoka-one text-xs text-white uppercase">SAVE MILESTONE</Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={() => setIsAdding(true)}
          className="flex-row items-center justify-center gap-2 py-3 mb-4 rounded-xl border-[2px] border-dashed border-[#BBE8FB] bg-[#F0F9FF] active:scale-95 transition-transform"
        >
          <Feather name="plus-circle" size={16} color="#0284C7" />
          <Text className="font-fredoka-one text-xs md:text-sm text-[#0284C7] uppercase">
            Add Standard Milestone
          </Text>
        </Pressable>
      )}

      {/* TEMPLATES LIST */}
      {loading ? (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator size="large" color="#62A9E6" />
        </View>
      ) : templates.length === 0 ? (
        <View className="py-8 items-center justify-center px-4">
          <Feather name="inbox" size={36} color="#CBD5E1" />
          <Text className="font-fredoka-one text-base text-[#64748B] mt-2 text-center">
            No milestone templates yet
          </Text>
          <Text className="font-quicksand-medium text-xs text-[#94A3B8] text-center mt-1 mb-4">
            Add standard milestones or load recommended starter goals.
          </Text>
          <Pressable
            onPress={handleSeedDefaults}
            className="px-4 py-2.5 rounded-xl bg-[#E0F2FE] border border-[#BBE8FB] active:scale-95"
          >
            <Text className="font-fredoka-one text-xs text-[#0284C7] uppercase">
              Load Recommended Starters
            </Text>
          </Pressable>
        </View>
      ) : (
        templates.map((tpl) => (
          <View
            key={tpl.id}
            className="bg-[#FAFAFA] border-[1.5px] border-[#F1F1F1] rounded-[18px] p-4 mb-2.5 flex-row items-start justify-between"
          >
            <View className="flex-1 pr-3">
              <Text className="font-fredoka-one text-sm md:text-base text-[#334155]">
                {tpl.title}
              </Text>
              {tpl.description ? (
                <Text className="font-quicksand-medium text-xs text-[#64748B] mt-1 leading-relaxed">
                  {tpl.description}
                </Text>
              ) : null}
            </View>

            <Pressable
              onPress={() => handleDeleteTemplate(tpl.id, tpl.title)}
              className="w-8 h-8 rounded-lg bg-white border border-[#FEE2E2] items-center justify-center active:scale-90"
            >
              <Feather name="trash-2" size={15} color="#EF4444" />
            </Pressable>
          </View>
        ))
      )}
    </BaseModal>
  );
}

export default StandardMilestonesModal;
