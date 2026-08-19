import React, { useState, useEffect } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BaseModal } from './base-modal';

interface AddStudentModalProps {
  visible: boolean;
  onClose: () => void;
  isTablet: boolean;
  isCreating: boolean;
  onSubmit: (student: { name: string; avatar: string; spectrumLevel: string; bio: string }) => void;
  initialData?: { name: string; avatar: string; spectrumLevel: string; bio: string } | null;
  isEditing?: boolean;
}

const PRESET_EMOJIS = ['🙂', '🐻', '🦊', '🐨', '🦁', '🐸', '🐵', '🐱', '🐼', '🦖', '🦄', '🐝'];

const SPECTRUM_EXPLANATIONS: Record<string, string> = {
  'Level 1': 'Level 1: Requiring Support. Difficulties initiating social interactions, organization and planning challenges.',
  'Level 2': 'Level 2: Requiring Substantial Support. Marked deficits in verbal and nonverbal social communication, difficulty coping with change.',
  'Level 3': 'Level 3: Requiring Very Substantial Support. Severe communication deficits, extreme difficulty coping with change, repetitive behaviors interfere with functioning.',
};

export function AddStudentModal({
  visible,
  onClose,
  isTablet,
  isCreating,
  onSubmit,
  initialData = null,
  isEditing = false,
}: AddStudentModalProps) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🙂');
  const [spectrumLevel, setSpectrumLevel] = useState<string | null>(null);
  const [bio, setBio] = useState('');

  // Reset or fill form when modal opens
  useEffect(() => {
    if (visible) {
      if (isEditing && initialData) {
        setName(initialData.name || '');
        setAvatar(initialData.avatar || '🙂');
        setSpectrumLevel(initialData.spectrumLevel || null);
        setBio(initialData.bio || '');
      } else {
        setName('');
        setAvatar('🙂');
        setSpectrumLevel(null);
        setBio('');
      }
    }
  }, [visible, isEditing, initialData]);

  const handleSubmit = () => {
    onSubmit({
      name: name.trim(),
      avatar,
      spectrumLevel: spectrumLevel || '',
      bio: bio.trim(),
    });
  };

  const isFormValid = name.trim().length > 0 && avatar.length > 0;

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={isEditing ? "Edit Student" : "Add New Student"}
      isTablet={isTablet}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? "SAVE" : "ADD"}
      submitDisabled={!isFormValid || isCreating}
      isSubmitting={isCreating}
      cancelLabel="CANCEL"
    >
      {/* STUDENT NAME */}
      <View className="mb-4">
        <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">NAME</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Student's Name"
          placeholderTextColor="#9CA3AF"
          className="bg-[#F1F1F1] rounded-xl px-4 py-3 font-quicksand-medium text-[#4B5563]"
        />
      </View>

      {/* AVATAR SELECTOR */}
      <View className="mb-4">
        <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">AVATAR</Text>
        <View className="flex-row flex-wrap gap-3.5 justify-start py-1">
          {PRESET_EMOJIS.map((emoji) => {
            const isSelected = avatar === emoji;
            return (
              <Pressable
                key={emoji}
                onPress={() => setAvatar(emoji)}
                className="items-center justify-center"
              >
                {isSelected ? (
                  <View 
                    className="w-14 h-14 rounded-full items-center justify-center border-[2px] border-[#62A9E6]"
                  >
                    <View 
                      className="w-full h-full rounded-full border-white border-[3px] bg-[#E5E7EB] items-center justify-center"
                    >
                      <Text style={{ fontSize: 24 }}>
                        {emoji}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View 
                    className="w-14 h-14 rounded-full bg-[#E5E7EB] items-center justify-center"
                  >
                    <Text style={{ fontSize: 24 }}>
                      {emoji}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* AUTISM SPECTRUM LEVEL */}
      <View className="mb-4">
        <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">SPECTRUM LEVEL</Text>
        <View className="flex-row flex-wrap gap-2.5 mb-2">
          {['Level 1', 'Level 2', 'Level 3'].map((level) => (
            <Pressable
              key={level}
              onPress={() => setSpectrumLevel(level)}
              className={`px-4 py-2 rounded-[8px] border-[2px] items-center justify-center active:scale-95 transition-transform ${
                spectrumLevel === level ? 'bg-white border-[#BBE8FB]' : 'bg-white border-[#F1F1F1]'
              }`}
              style={{
                shadowColor: spectrumLevel === level ? '#BBE8FB' : '#F1F1F1',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              <Text
                className="font-fredoka-one text-sm"
                style={{ color: spectrumLevel === level ? '#62A9E6' : '#6B7280' }}
              >
                {level}
              </Text>
            </Pressable>
          ))}
        </View>
        {spectrumLevel && (
          <Text className="font-quicksand-medium text-xs text-[#9CA3AF] leading-4 mt-1">
            {SPECTRUM_EXPLANATIONS[spectrumLevel]}
          </Text>
        )}
      </View>

      {/* BIO / NOTES */}
      <View className="mb-6">
        <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">BIO / NOTES</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Notes about student (interests, sensory preferences, etc.)"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
          style={{ textAlignVertical: 'top' }}
          className="bg-[#F1F1F1] rounded-xl px-4 py-3 font-quicksand-medium text-[#4B5563] min-h-[80px]"
        />
      </View>
    </BaseModal>
  );
}


