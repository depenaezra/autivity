import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BaseModal } from './base-modal';

export interface ArchivedClassesModalProps {
  visible: boolean;
  onClose: () => void;
  archivedClasses: any[];
  onUnarchive: (classId: string) => Promise<void>;
  isTablet: boolean;
}

export function ArchivedClassesModal({
  visible,
  onClose,
  archivedClasses = [],
  onUnarchive,
  isTablet,
}: ArchivedClassesModalProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleUnarchive = async (classId: string) => {
    setLoadingStates((prev) => ({ ...prev, [classId]: true }));
    try {
      await onUnarchive(classId);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [classId]: false }));
    }
  };

  const themeStyles: Record<string, { stroke: string; font: string; fill: string }> = {
    green: {
      stroke: '#CBFAC4',
      font: '#179D33',
      fill: '#CBFAC4',
    },
    orange: {
      stroke: '#FFDBD4',
      font: '#FF8870',
      fill: '#FFDBD4',
    },
    yellow: {
      stroke: '#FFF3C4',
      font: '#FFAE02',
      fill: '#FFF3C4',
    },
    blue: {
      stroke: '#BBE8FB',
      font: '#62A9E6',
      fill: '#BBE8FB',
    },
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Archived Classes"
      isTablet={isTablet}
      cancelLabel="CLOSE"
    >
      <View className="mb-4">
        <Text className="font-fredoka-one text-[#9EA0A0] text-sm mb-2">
          ARCHIVED ({archivedClasses.length})
        </Text>
        {archivedClasses.length === 0 ? (
          <View 
            className="py-8 items-center justify-center bg-white border-[2px] border-[#F1F1F1] rounded-[24px]"
            style={{
              shadowColor: '#F1F1F1',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
            }}
          >
            <Ionicons name="archive-outline" size={isTablet ? 56 : 40} color="#9CA3AF" />
            <Text className={`font-quicksand-medium text-[#9CA3AF] text-center mt-2 ${isTablet ? 'text-xl' : 'text-base'}`}>
              No archived classes.
            </Text>
          </View>
        ) : (
          archivedClasses.map((item) => {
            const isUnarchiving = !!loadingStates[item.id];
            const themeName = item.themeName || 'blue';
            const colors = themeStyles[themeName] || themeStyles.blue;

            return (
              <View
                key={item.id}
                className={`flex-row items-center justify-between bg-white border-[2px] border-[#F1F1F1] ${
                  isTablet ? 'p-5 rounded-[24px] mb-4' : 'p-3.5 rounded-[16px] mb-3'
                }`}
                style={{
                  shadowColor: '#F1F1F1',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className={`rounded-full items-center justify-center ${
                      isTablet ? 'w-12 h-12' : 'w-9 h-9'
                    }`}
                    style={{ backgroundColor: colors.fill }}
                  >
                    <Ionicons name="school" size={isTablet ? 24 : 18} color={colors.font} />
                  </View>
                  <View>
                    <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-xl' : 'text-base'}`}>
                      {item.title}
                    </Text>
                    <Text className={`font-quicksand-medium text-[#6B7280] ${isTablet ? 'text-sm mt-0.5' : 'text-xs'}`}>
                      {item.level}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => handleUnarchive(item.id)}
                  disabled={isUnarchiving}
                  className={`border-[2px] flex items-center justify-center bg-white active:scale-95 transition-transform ${
                    isTablet ? 'px-6 py-2.5 rounded-[12px]' : 'px-4 py-2 rounded-[8px]'
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
                  {isUnarchiving ? (
                    <ActivityIndicator size="small" color="#62A9E6" />
                  ) : (
                    <Text
                      className={`font-fredoka-one text-[#62A9E6] ${isTablet ? 'text-base' : 'text-xs'}`}
                    >
                      UNARCHIVE
                    </Text>
                  )}
                </Pressable>
              </View>
            );
          })
        )}
      </View>
    </BaseModal>
  );
}


