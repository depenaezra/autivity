import React, { useState, useEffect } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { BaseModal } from '../../home/base-modal';

interface AddMilestoneModalProps {
  visible: boolean;
  onClose: () => void;
  isTablet: boolean;
  isSaving: boolean;
  title: string;
  setTitle: (val: string) => void;
  targetDate: string;
  setTargetDate: (val: string) => void;
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

export function AddMilestoneModal({
  visible,
  onClose,
  isTablet,
  isSaving,
  title,
  setTitle,
  targetDate,
  setTargetDate,
  onSubmit,
  isEditing = false,
}: AddMilestoneModalProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  useEffect(() => {
    if (visible && !targetDate) {
      // Default to today if no date is set yet
      setTargetDate(formatDateToString(new Date()));
    }
  }, [visible]);

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
      heightClassName={isTablet ? 'h-[50%]' : 'h-[55%]'}
    >
      {/* MILESTONE TITLE */}
      <View className="mb-4">
        <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">MILESTONE TITLE</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Milestone Title"
          placeholderTextColor="#9CA3AF"
          className="bg-[#F1F1F1] rounded-xl px-4 py-3 font-quicksand-medium text-[#4B5563]"
        />
      </View>

      {/* TARGET DATE SELECTOR */}
      <View className="mb-4">
        <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">TARGET DATE</Text>
        <Pressable
          onPress={() => {
            setTempDate(parseStringToDate(targetDate));
            setShowDatePicker(true);
          }}
          className="bg-[#F1F1F1] rounded-xl px-4 py-3 flex-row items-center justify-between active:opacity-80 border-[2px] border-[#F1F1F1]"
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
                <Text className="font-fredoka-one text-lg text-[#4B5563] mb-4">Select Target Date</Text>

                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={(_, selectedDate) => {
                    if (selectedDate) {
                      setTempDate(selectedDate);
                    }
                  }}
                />

                <View className="flex-row gap-4 mt-6 w-full">
                  {/* Cancel Button */}
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
                    <Text className="font-fredoka-one text-[#9CA3AF] text-sm">
                      CANCEL
                    </Text>
                  </Pressable>

                  {/* Confirm Button */}
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
            minimumDate={new Date()}
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
