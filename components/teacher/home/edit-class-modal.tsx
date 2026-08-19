import React, { useState, useEffect } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BaseModal } from './base-modal';
import { themeColors } from '../../../hooks/use-teacher-dashboard';

// Helper to parse schedule string
const parseScheduleStr = (scheduleStr: string) => {
  let days: string[] = [];
  let time = '08:00 AM';

  if (!scheduleStr) {
    return { days, time };
  }

  if (scheduleStr.includes(' at ')) {
    const parts = scheduleStr.split(' at ');
    const daysPart = parts[0].trim();
    time = parts[1]?.trim() || '08:00 AM';
    days = daysPart.split(',').map(d => d.trim().toUpperCase()).filter(Boolean);
  } else {
    // Try to parse old format: "Monday - Wednesday 10:00 AM" or similar
    const timeMatch = scheduleStr.match(/\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)$/i);
    if (timeMatch) {
      time = timeMatch[0].trim();
      const daysPart = scheduleStr.replace(time, '').trim();
      const parts = daysPart.split(' - ').map(d => d.trim().toLowerCase());
      const dayMap: Record<string, string> = {
        monday: 'MON', tuesday: 'TUE', wednesday: 'WED', thursday: 'THU',
        friday: 'FRI', saturday: 'SAT', sunday: 'SUN',
        mon: 'MON', tue: 'TUE', wed: 'WED', thu: 'THU', fri: 'FRI', sat: 'SAT', sun: 'SUN'
      };
      
      if (parts.length === 2) {
        const startCode = dayMap[parts[0]];
        const endCode = dayMap[parts[1]];
        if (startCode) days.push(startCode);
        if (endCode) days.push(endCode);
      } else if (parts.length === 1 && parts[0]) {
        const subParts = parts[0].split(',');
        subParts.forEach(sp => {
          const code = dayMap[sp.trim()];
          if (code) days.push(code);
        });
      }
    } else {
      time = scheduleStr;
    }
  }
  return { days, time };
};

const parseTimeToDate = (timeStr: string): Date => {
  const date = new Date();
  try {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      date.setHours(hours, minutes, 0, 0);
    }
  } catch (e) {
    console.error(e);
  }
  return date;
};

const formatDateToTime = (date: Date): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
};

interface EditClassModalProps {
  visible: boolean;
  onClose: () => void;
  isTablet: boolean;
  isUpdating: boolean;
  initialData: {
    title: string;
    grade: string;
    schedule: string;
    themeName: string;
  } | null;
  onSubmit: (updated: { title: string; grade: string; schedule: string; themeName: string }) => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

export function EditClassModal({
  visible,
  onClose,
  isTablet,
  isUpdating,
  initialData,
  onSubmit,
  onArchive,
  onDelete,
}: EditClassModalProps) {
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState('Grade 1');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState('08:00 AM');
  const [tempTime, setTempTime] = useState('08:00 AM');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [themeName, setThemeName] = useState('blue');

  // Sync initial class data to form states on open
  useEffect(() => {
    if (visible && initialData) {
      setTitle(initialData.title || '');
      setGrade(initialData.grade || 'Grade 1');
      setThemeName(initialData.themeName || 'blue');
      const parsed = parseScheduleStr(initialData.schedule);
      setSelectedDays(parsed.days);
      setSelectedTime(parsed.time || '08:00 AM');
    }
  }, [visible, initialData]);

  const handleSubmit = () => {
    const formattedSchedule = `${selectedDays.join(', ')} at ${selectedTime}`;
    onSubmit({
      title: title.trim(),
      grade,
      schedule: formattedSchedule,
      themeName,
    });
  };

  const isFormValid = title.trim().length > 0 && selectedDays.length > 0;

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Edit Class"
      isTablet={isTablet}
      onSubmit={handleSubmit}
      submitLabel="SAVE"
      submitDisabled={!isFormValid || isUpdating}
      isSubmitting={isUpdating}
      cancelLabel="CANCEL"
    >
      {/* CLASS NAME */}
      <View className="mb-4">
        <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">NAME</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Class Name"
          placeholderTextColor="#9CA3AF"
          className="bg-[#F1F1F1] rounded-xl px-4 py-3 font-quicksand-medium text-[#4B5563]"
        />
      </View>

      {/* GRADE SELECTOR */}
      <View className="mb-4">
        <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">GRADE</Text>
        <View className="flex-row flex-wrap gap-2.5">
          {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map((g) => (
            <Pressable
              key={g}
              onPress={() => setGrade(g)}
              className={`px-3 py-2 rounded-[8px] border-[2px] items-center justify-center active:scale-95 transition-transform ${
                grade === g ? 'bg-white border-[#BBE8FB]' : 'bg-white border-[#F1F1F1]'
              }`}
              style={{
                shadowColor: grade === g ? '#BBE8FB' : '#F1F1F1',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              <Text
                className="font-fredoka-one text-sm"
                style={{ color: grade === g ? '#62A9E6' : '#6B7280' }}
              >
                {g}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* SCHEDULE CARD */}
      <View className="mb-4">
        <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">SCHEDULE</Text>
        <View className="bg-[#F1F1F1] rounded-[24px] p-5">
          {/* Day Selector Row */}
          <View className="flex-row justify-around items-center mb-4">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <Pressable
                  key={day}
                  onPress={() => {
                    let updated: string[];
                    if (isSelected) {
                      updated = selectedDays.filter((d) => d !== day);
                    } else {
                      updated = [...selectedDays, day];
                    }
                    setSelectedDays(updated);
                  }}
                  className={`px-2.5 py-1.5 rounded-[8px] items-center justify-center ${
                    isSelected ? 'bg-[#BBE8FB]' : 'bg-transparent'
                  }`}
                >
                  <Text
                    className="font-fredoka-one text-sm"
                    style={{ color: isSelected ? '#62A9E6' : '#9CA3AF' }}
                  >
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Divider line */}
          <View className="h-[2px] bg-[#E5E7EB]/50 w-full mb-4" />

          {/* Time Row */}
          <View className="flex-row justify-between items-center">
            <Text className="font-fredoka-one text-[#9EA0A0] text-sm">TIME</Text>
            <Pressable
              onPress={() => {
                setTempTime(selectedTime);
                setShowTimePicker(true);
              }}
              className="bg-white rounded-[12px] px-4 py-2 border-[2px] border-[#F1F1F1]"
              style={{
                shadowColor: '#F1F1F1',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              <Text className="font-fredoka-one text-base" style={{ color: '#62A9E6' }}>
                {selectedTime}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* NATIVE TIME PICKER DIALOG */}
      {showTimePicker && (
        Platform.OS === 'ios' ? (
          <Modal
            transparent={true}
            animationType="fade"
            visible={showTimePicker}
            onRequestClose={() => setShowTimePicker(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/40">
              <View className="bg-white rounded-[24px] p-6 w-[320px] items-center">
                <Text className="font-fredoka-one text-lg text-[#4B5563] mb-4">Select Time</Text>
                
                <DateTimePicker
                  value={parseTimeToDate(tempTime)}
                  mode="time"
                  is24Hour={false}
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setTempTime(formatDateToTime(selectedDate));
                    }
                  }}
                />
                
                <View className="flex-row gap-4 mt-6 w-full">
                  <Pressable
                    onPress={() => setShowTimePicker(false)}
                    className="flex-1 py-4 border-[2px] border-[#F1F1F1] rounded-[8px] items-center justify-center bg-white active:scale-95 transition-transform"
                    style={{
                      shadowColor: '#F1F1F1',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 2,
                    }}
                  >
                    <Text className="font-fredoka-one text-[#9CA3AF] text-base">
                      CANCEL
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setSelectedTime(tempTime);
                      setShowTimePicker(false);
                    }}
                    className="flex-1 py-4 border-[2px] rounded-[8px] items-center justify-center bg-white active:scale-95 transition-transform"
                    style={{
                      borderColor: '#BBE8FB',
                      shadowColor: '#BBE8FB',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 2,
                    }}
                  >
                    <Text className="font-fredoka-one text-base" style={{ color: '#62A9E6' }}>
                      CONFIRM
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={parseTimeToDate(selectedTime)}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, selectedDate) => {
              setShowTimePicker(false);
              if (selectedDate) {
                setSelectedTime(formatDateToTime(selectedDate));
              }
            }}
          />
        )
      )}

      {/* THEME COLOR SELECTOR */}
      <View className="mb-6">
        <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">THEME</Text>
        <View className="flex-row gap-6">
          {themeColors.map((color) => {
            const themeVal = color.value;
            const isSelected = themeName === themeVal;
            const displayName = color.name.charAt(0).toUpperCase() + color.name.slice(1);
            return (
              <Pressable
                key={color.name}
                onPress={() => setThemeName(themeVal)}
                className="items-center justify-center"
              >
                {isSelected ? (
                  <View 
                    className="w-14 h-14 rounded-full items-center justify-center border-[2px]"
                    style={{ borderColor: color.border }}
                  >
                    <View 
                      className="w-full h-full rounded-full border-white border-[3px]"
                      style={{ backgroundColor: themeVal }}
                    />
                  </View>
                ) : (
                  <View 
                    className="w-14 h-14 rounded-full"
                    style={{ backgroundColor: themeVal }}
                  />
                )}
                <Text
                  className="font-fredoka-one text-sm mt-2 text-center"
                  style={{ color: isSelected ? color.border : '#D9D9D9' }}
                >
                  {displayName}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ARCHIVE & DELETE ACTIONS */}
      {(onArchive || onDelete) && (
        <View className="mt-2 gap-3 border-t-[2px] border-[#F1F1F1] pt-4 mb-4">
          {onArchive && (
            <Pressable
              onPress={onArchive}
              className="py-3 px-4 rounded-[8px] border-[2px] border-[#FFDBD4] bg-white flex-row items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{
                shadowColor: '#FFDBD4',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              <Ionicons name="archive-outline" size={18} color="#FF8870" />
              <Text className="font-fredoka-one text-[#FF8870] text-sm">ARCHIVE CLASS</Text>
            </Pressable>
          )}

          {onDelete && (
            <Pressable
              onPress={onDelete}
              className="py-3 px-4 rounded-[8px] border-[2px] border-[#FFDBD4] bg-white flex-row items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{
                shadowColor: '#FFDBD4',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              <Ionicons name="trash-outline" size={18} color="#FF3B3F" />
              <Text className="font-fredoka-one text-[#FF3B3F] text-sm">DELETE CLASS</Text>
            </Pressable>
          )}
        </View>
      )}
    </BaseModal>
  );
}


