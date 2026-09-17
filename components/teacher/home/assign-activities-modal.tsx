import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BaseModal } from './base-modal';

export const ALL_TRACING_CATEGORIES = [
  { id: 'Lines', title: 'Lines Tracing', icon: 'create-outline' },
  { id: 'Shapes', title: 'Shapes Tracing', icon: 'shapes-outline' },
  { id: 'Letters', title: 'Letters Tracing', icon: 'text-outline' },
  { id: 'Numbers', title: 'Numbers Tracing', icon: 'calculator-outline' },
];

export const ALL_MATCHING_CATEGORIES = [
  { id: 'Matching Fruits', title: 'Fruits Matching', icon: 'nutrition-outline' },
  { id: 'Matching Colors', title: 'Color Matching', icon: 'color-palette-outline' },
];

export const ALL_BUBBLE_POP_CATEGORIES = [
  { id: 'Free Pop', title: 'Free Pop', icon: 'disc-outline' },
  { id: 'Color Pop', title: 'Color Pop', icon: 'color-palette-outline' },
];

export const ALL_PICK_CHOOSE_CATEGORIES = [
  {
    id: 'Picture-Word Match',
    title: 'Picture-Word Match',
    icon: 'text-outline',
  },
];

export const ALL_SEQUENCING_CATEGORIES = [
  {
    id: 'Picture Sequencing',
    title: 'Picture Sequencing',
    icon: 'list-outline',
  },
];

/* NEW */
export const ALL_TURN_TAKING_CATEGORIES = [
  {
    id: 'Turn-Taking',
    title: 'Turn-Taking',
    icon: 'people-outline',
  },
];

export interface AssignActivitiesModalProps {
  visible: boolean;
  onClose: () => void;
  studentName?: string;
  initialAssignedActivities?: string[];
  onSave: (paths: string[]) => Promise<void>;
  isTablet: boolean;
}

export function AssignActivitiesModal({
  visible,
  onClose,
  studentName,
  initialAssignedActivities = [],
  onSave,
  isTablet,
}: AssignActivitiesModalProps) {
  const [activeActivityType, setActiveActivityType] = useState('tracing');
  const [selectedActivityPaths, setSelectedActivityPaths] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedActivityPaths([...initialAssignedActivities]);
      setActiveActivityType('tracing');
    }
  }, [visible, initialAssignedActivities]);

  const toggleSubcategory = (id: string) => {
    setSelectedActivityPaths((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await onSave(selectedActivityPaths);
    } finally {
      setIsSaving(false);
    }
  };

  const activityTypes = [
    'tracing',
    'matching',
    'bubble-pop',
    'pick-n-choose',
    'sequencing',
    'turn-taking',
  ];

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'tracing':
        return 'Tracing';

      case 'matching':
        return 'Matching';

      case 'bubble-pop':
        return 'Bubble Pop';

      case 'pick-n-choose':
        return 'Pick & Choose';

      case 'sequencing':
        return 'Sequencing';

      case 'turn-taking':
        return 'Turn Taking';

      default:
        return type;
    }
  };

  const getActivityCategories = (type: string) => {
    switch (type) {
      case 'tracing':
        return ALL_TRACING_CATEGORIES;

      case 'matching':
        return ALL_MATCHING_CATEGORIES;

      case 'bubble-pop':
        return ALL_BUBBLE_POP_CATEGORIES;

      case 'pick-n-choose':
        return ALL_PICK_CHOOSE_CATEGORIES;

      case 'sequencing':
        return ALL_SEQUENCING_CATEGORIES;

      case 'turn-taking':
        return ALL_TURN_TAKING_CATEGORIES;

      default:
        return [];
    }
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Assign Activities"
      isTablet={isTablet}
      onSubmit={handleSave}
      submitLabel="SAVE"
      submitDisabled={isSaving}
      isSubmitting={isSaving}
      heightClassName={isTablet ? 'h-[78%]' : 'h-[60%]'}
    >
      <View className="py-2">

        {/* STUDENT */}
        <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-1 uppercase">
          STUDENT:{' '}
          <Text style={{ color: '#62A9E6' }}>
            {studentName || 'Student'}
          </Text>
        </Text>

        {/* ASSIGNED COUNT */}
        <Text className="font-quicksand-bold text-[#9EA0A0] text-xs mb-4">
          ({selectedActivityPaths.length} assigned activities)
        </Text>

        {/* ACTIVITY TYPE TABS */}
        <View
          className={`mb-5 bg-[#F8FAFC] ${
            isTablet
              ? 'p-2 rounded-2xl'
              : 'p-1.5 rounded-xl'
          }`}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 6,
              flexGrow: 1,
            }}
          >
            {activityTypes.map((type) => {
              const isSelected = activeActivityType === type;

              return (
                <Pressable
                  key={type}
                  onPress={() => setActiveActivityType(type)}
                  className={`${
                    isTablet
                      ? 'px-6 py-3 rounded-xl border-b-[4px]'
                      : 'px-4 py-2 rounded-lg border-b-[3px]'
                  } items-center justify-center ${
                    isSelected
                      ? 'bg-white border-[#62A9E6]'
                      : 'bg-transparent border-transparent'
                  }`}
                >
                  <Text
                    className={`font-fredoka-one text-center ${
                      isSelected
                        ? 'text-[#62A9E6]'
                        : 'text-[#9CA3AF]'
                    } ${
                      isTablet ? 'text-base' : 'text-xs'
                    }`}
                    numberOfLines={1}
                  >
                    {getActivityLabel(type)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* CATEGORY GRID */}
        <View className="flex-row flex-wrap justify-between gap-y-3.5">
          {getActivityCategories(activeActivityType).map((cat) => {
            const isSelected =
              selectedActivityPaths.includes(cat.id);

            return (
              <Pressable
                key={cat.id}
                onPress={() => toggleSubcategory(cat.id)}
                className={`w-[48%] ${
                  isTablet
                    ? 'p-5 rounded-2xl gap-3 border-[2px]'
                    : 'p-3.5 rounded-xl gap-2 border-[2px]'
                } items-center justify-center ${
                  isSelected
                    ? 'bg-[#F0F9FF] border-[#BBE8FB]'
                    : 'bg-white border-[#F1F1F1]'
                }`}
                style={{
                  shadowColor: isSelected
                    ? '#BBE8FB'
                    : '#F1F1F1',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >

                {/* ICON */}
                <View
                  className={`rounded-full items-center justify-center ${
                    isTablet
                      ? 'w-14 h-14'
                      : 'w-10 h-10'
                  } ${
                    isSelected
                      ? 'bg-[#DBEAFE]'
                      : 'bg-[#F3F4F6]'
                  }`}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={isTablet ? 30 : 20}
                    color={
                      isSelected
                        ? '#62A9E6'
                        : '#9CA3AF'
                    }
                  />
                </View>

                {/* TITLE */}
                <Text
                  className={`font-fredoka-one text-center ${
                    isTablet
                      ? 'text-base'
                      : 'text-xs'
                  }`}
                  style={{
                    color: isSelected
                      ? '#62A9E6'
                      : '#6B7280',
                  }}
                >
                  {cat.title}
                </Text>

                {/* STATUS */}
                {isSelected ? (
                  <View className="bg-[#62A9E6] rounded-full items-center flex-row px-2.5 py-0.5 gap-1 mt-0.5">
                    <Ionicons
                      name="checkmark"
                      size={isTablet ? 14 : 10}
                      color="white"
                    />

                    <Text className="text-white font-fredoka-one text-[9px] uppercase">
                      Assigned
                    </Text>
                  </View>
                ) : (
                  <View className="bg-[#F1F1F1] rounded-full px-2 py-0.5 mt-0.5">
                    <Text className="text-[#9CA3AF] font-fredoka-one text-[9px] uppercase">
                      Assign
                    </Text>
                  </View>
                )}

              </Pressable>
            );
          })}
        </View>

      </View>
    </BaseModal>
  );
}