import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BaseModal } from '../../home/base-modal';
import {
  getTeacherMilestoneTemplates,
  MilestoneTemplate,
  seedStarterMilestoneTemplates,
} from '@/src/services/milestoneTemplates';

interface AddMilestoneModalProps {
  visible: boolean;
  onClose: () => void;
  isTablet: boolean;
  isSaving: boolean;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  targetDate: string;
  setTargetDate: (val: string) => void;
  templateId?: string | null;
  setTemplateId?: (id: string | null) => void;
  onSubmit: () => void;
  isEditing?: boolean;
}

const formatDateToString = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

const parseStringToDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

// Start-of-day normalization to allow picking today (same-day target date)
const getTodayStart = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export function AddMilestoneModal({
  visible,
  onClose,
  isTablet,
  isSaving,
  title,
  setTitle,
  description,
  setDescription,
  targetDate,
  setTargetDate,
  templateId,
  setTemplateId,
  onSubmit,
  isEditing = false,
}: AddMilestoneModalProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  // Template dropdown state
  const [templates, setTemplates] = useState<MilestoneTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      if (!targetDate) {
        // Default to today
        setTargetDate(formatDateToString(new Date()));
      }
      setIsDropdownOpen(false);

      // Fetch teacher's milestone templates from Supabase
      const fetchTemplates = async () => {
        setLoadingTemplates(true);
        try {
          let list = await getTeacherMilestoneTemplates();
          if (list.length === 0) {
            // Auto-seed if brand new
            list = await seedStarterMilestoneTemplates().catch(() => []);
          }
          setTemplates(list);
        } catch (err) {
          console.error('[AddMilestoneModal] Error loading templates:', err);
        } finally {
          setLoadingTemplates(false);
        }
      };

      fetchTemplates();
    }
  }, [visible]);

  const handleSelectTemplate = (tpl: MilestoneTemplate) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTitle(tpl.title);
    setTemplateId?.(tpl.id);
    if (!description.trim() && tpl.description) {
      setDescription(tpl.description);
    }
    setIsDropdownOpen(false);
  };

  const handleSeedDefaults = async () => {
    setLoadingTemplates(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const seeded = await seedStarterMilestoneTemplates();
      setTemplates(seeded);
    } catch (err) {
      console.error('[AddMilestoneModal] Error seeding defaults:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const isSubmitDisabled = !title.trim() || !targetDate.trim() || isSaving;

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={isEditing ? 'Edit Milestone' : 'Set New Milestone'}
      isTablet={isTablet}
      onSubmit={onSubmit}
      submitLabel="SAVE"
      submitDisabled={isSubmitDisabled}
      isSubmitting={isSaving}
      cancelLabel="CANCEL"
      heightClassName={isTablet ? 'h-[68%]' : 'h-[75%]'}
    >
      {/* MILESTONE SELECTION (DROPDOWN ONLY) */}
      <View className="mb-3.5">
        <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">
          STANDARD MILESTONE
        </Text>

        {isEditing ? (
          // In edit mode, display title as read-only badge
          <View className="bg-[#F8FAFC] border-[2px] border-[#E2E8F0] rounded-xl px-4 py-3">
            <Text className="font-fredoka-one text-[#334155] text-base">{title}</Text>
          </View>
        ) : (
          <View>
            {/* Dropdown Trigger Button */}
            <Pressable
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-white border-[2px] rounded-xl px-4 py-3 flex-row items-center justify-between active:scale-95 transition-transform"
              style={{
                borderColor: title ? '#BBE8FB' : '#E2E8F0',
                shadowColor: title ? '#BBE8FB' : '#F1F1F1',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                <Feather name="flag" size={17} color={title ? '#0284C7' : '#9CA3AF'} />
                <Text
                  className={`font-fredoka-one text-sm md:text-base ${
                    title ? 'text-[#334155]' : 'text-[#9CA3AF]'
                  }`}
                  numberOfLines={1}
                >
                  {title || 'Select a Standard Milestone...'}
                </Text>
              </View>
              <Feather
                name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={title ? '#0284C7' : '#9CA3AF'}
              />
            </Pressable>

            {/* Dropdown Options List */}
            {isDropdownOpen && (
              <View
                className="bg-white border-[2px] border-[#BBE8FB] rounded-2xl mt-1.5 p-2 max-h-[220px]"
                style={{
                  shadowColor: '#62A9E6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  elevation: 5,
                }}
              >
                {loadingTemplates ? (
                  <View className="py-6 items-center justify-center">
                    <ActivityIndicator size="small" color="#62A9E6" />
                  </View>
                ) : templates.length === 0 ? (
                  <View className="p-4 items-center justify-center">
                    <Text className="font-quicksand-medium text-xs text-[#9CA3AF] text-center mb-2">
                      No standard milestones configured in Settings.
                    </Text>
                    <Pressable
                      onPress={handleSeedDefaults}
                      className="px-3 py-1.5 rounded-lg bg-[#E0F2FE] border border-[#BBE8FB] active:scale-95"
                    >
                      <Text className="font-fredoka-one text-[11px] text-[#0284C7] uppercase">
                        Load Recommended Starters
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                    {templates.map((tpl) => {
                      const isSelected = title === tpl.title;
                      return (
                        <Pressable
                          key={tpl.id}
                          onPress={() => handleSelectTemplate(tpl)}
                          className={`p-3 rounded-xl mb-1 flex-row items-center justify-between active:bg-[#F0F9FF] ${
                            isSelected ? 'bg-[#F0F9FF] border border-[#BBE8FB]' : 'bg-transparent'
                          }`}
                        >
                          <View className="flex-1 pr-2">
                            <Text
                              className={`font-fredoka-one text-xs md:text-sm ${
                                isSelected ? 'text-[#0284C7]' : 'text-[#334155]'
                              }`}
                            >
                              {tpl.title}
                            </Text>
                            {tpl.description ? (
                              <Text
                                className="font-quicksand-medium text-[11px] text-[#94A3B8] mt-0.5"
                                numberOfLines={1}
                              >
                                {tpl.description}
                              </Text>
                            ) : null}
                          </View>
                          {isSelected && <Ionicons name="checkmark-circle" size={18} color="#0284C7" />}
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            )}
          </View>
        )}
      </View>

      {/* MILESTONE DESCRIPTION / CRITERIA */}
      <View className="mb-3.5">
        <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">
          DESCRIPTION / CRITERIA
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Detailed milestone goal, instructions, or criteria..."
          placeholderTextColor="#9CA3AF"
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
          className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 font-quicksand-medium text-[#4B5563] min-h-[70px]"
        />
      </View>

      {/* TARGET DATE SELECTOR (SAME-DAY ENABLED) */}
      <View className="mb-4">
        <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">TARGET DATE</Text>
        <Pressable
          onPress={() => {
            setTempDate(parseStringToDate(targetDate));
            setShowDatePicker(true);
          }}
          className="bg-[#F8FAFC] border-[2px] border-[#E2E8F0] rounded-xl px-4 py-3 flex-row items-center justify-between active:opacity-80"
        >
          <Text className={`font-quicksand-medium ${targetDate ? 'text-[#4B5563]' : 'text-[#9CA3AF]'}`}>
            {targetDate || 'Select Target Date'}
          </Text>
          <Feather name="calendar" size={18} color="#62A9E6" />
        </Pressable>
      </View>

      {/* NATIVE DATE PICKER DIALOG */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal
            transparent={true}
            animationType="fade"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/40">
              <View className="bg-white rounded-[24px] p-6 w-[320px] items-center">
                <Text className="font-fredoka-one text-lg text-[#4B5563] mb-4">
                  Select Target Date
                </Text>

                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  minimumDate={getTodayStart()}
                  onChange={(_, selectedDate) => {
                    if (selectedDate) {
                      setTempDate(selectedDate);
                    }
                  }}
                />

                <View className="flex-row gap-4 mt-6 w-full">
                  <Pressable
                    onPress={() => setShowDatePicker(false)}
                    className="flex-1 py-3.5 border-[2px] border-[#F1F1F1] rounded-[8px] items-center justify-center bg-white active:scale-95 transition-transform"
                    style={{
                      shadowColor: '#F1F1F1',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 2,
                    }}
                  >
                    <Text className="font-fredoka-one text-[#9CA3AF] text-sm">CANCEL</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setTargetDate(formatDateToString(tempDate));
                      setShowDatePicker(false);
                    }}
                    className="flex-1 py-3.5 border-[2px] rounded-[8px] items-center justify-center bg-white active:scale-95 transition-transform"
                    style={{
                      borderColor: '#BBE8FB',
                      shadowColor: '#BBE8FB',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 2,
                    }}
                  >
                    <Text className="font-fredoka-one text-sm" style={{ color: '#62A9E6' }}>
                      CONFIRM
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={parseStringToDate(targetDate)}
            mode="date"
            display="default"
            minimumDate={getTodayStart()}
            onChange={(_, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setTargetDate(formatDateToString(selectedDate));
              }
            }}
          />
        )
      )}
    </BaseModal>
  );
}

export default AddMilestoneModal;
