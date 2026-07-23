import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

interface StudentProfile {
  id: string;
  name: string;
  age: number;
  behavior: string;
  focusScore: string;
}

interface EditStudentModalProps {
  visible: boolean;
  student: StudentProfile | null;
  onClose: () => void;
  onSave: (student: StudentProfile) => void;
}

export default function EditStudentModal({
  visible,
  student,
  onClose,
  onSave,
}: EditStudentModalProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [behavior, setBehavior] = useState('');
  const [focusScore, setFocusScore] = useState('');

  useEffect(() => {
    if (student) {
      setName(student.name);
      setAge(String(student.age));
      setBehavior(student.behavior);
      setFocusScore(student.focusScore);
    }
  }, [student]);

  if (!student) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View className="flex-1 bg-black/40 justify-center items-center px-6">

        <View className="w-full max-w-xl bg-white rounded-[28px] border-[3px] border-[#D9D9D9] border-b-[7px] overflow-hidden">

          {/* Header */}

          <View className="bg-[#EBF5FF] px-6 py-5 flex-row justify-between items-center">

            <View>

              <Text className="font-fredoka-one text-2xl text-[#4B5563]">
                Edit Learner
              </Text>

              <Text className="font-quicksand-medium text-[#6B7280] mt-1">
                Update learner information
              </Text>

            </View>

            <Pressable onPress={onClose}>
              <Feather
                name="x"
                size={24}
                color="#6B7280"
              />
            </Pressable>

          </View>

          <ScrollView
            className="px-6 py-6"
            showsVerticalScrollIndicator={false}
          >
                        {/* Name */}

            <Text className="font-quicksand-bold text-[#4B5563] mb-2">
              Learner Name
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter learner name"
              placeholderTextColor="#94A3B8"
              className="h-14 rounded-2xl border border-[#D9D9D9] bg-[#FAFAFA] px-4 mb-5 font-quicksand-medium text-[#4B5563]"
            />

            {/* Age */}

            <Text className="font-quicksand-bold text-[#4B5563] mb-2">
              Age
            </Text>

            <TextInput
              value={age}
              onChangeText={setAge}
              placeholder="Age"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              className="h-14 rounded-2xl border border-[#D9D9D9] bg-[#FAFAFA] px-4 mb-5 font-quicksand-medium text-[#4B5563]"
            />

            {/* Behavior */}

            <Text className="font-quicksand-bold text-[#4B5563] mb-2">
              Current Behavior
            </Text>

            <TextInput
              value={behavior}
              onChangeText={setBehavior}
              placeholder="Ready to Learn"
              placeholderTextColor="#94A3B8"
              className="h-14 rounded-2xl border border-[#D9D9D9] bg-[#FAFAFA] px-4 mb-5 font-quicksand-medium text-[#4B5563]"
            />

            {/* Focus */}

            <Text className="font-quicksand-bold text-[#4B5563] mb-2">
              Focus Score
            </Text>

            <TextInput
              value={focusScore}
              onChangeText={setFocusScore}
              placeholder="Excellent"
              placeholderTextColor="#94A3B8"
              className="h-14 rounded-2xl border border-[#D9D9D9] bg-[#FAFAFA] px-4 mb-8 font-quicksand-medium text-[#4B5563]"
            />

                        {/* Buttons */}

            <View className="flex-row gap-3 mb-6">

              <Pressable
                onPress={onClose}
                className="flex-1 h-14 rounded-2xl bg-[#F3F4F6] border border-[#D9D9D9] items-center justify-center"
              >
                <Text className="font-quicksand-bold text-[#6B7280] text-base">
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  onSave({
                    id: student.id,
                    name,
                    age: Number(age),
                    behavior,
                    focusScore,
                  });

                  onClose();
                }}
                className="flex-1 h-14 rounded-2xl bg-[#62A9E6] items-center justify-center border-b-[4px] border-[#4A97D7]"
              >
                <Text className="font-quicksand-bold text-white text-base">
                  Save Changes
                </Text>
              </Pressable>

            </View>

          </ScrollView>

        </View>

      </View>

    </Modal>
  );
}