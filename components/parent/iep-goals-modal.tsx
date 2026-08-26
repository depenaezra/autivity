import React from 'react';
import { Text, View } from 'react-native';
import { BaseModal } from '../teacher/home/base-modal';
import { ParentMilestone } from '../../src/services/parentDashboard';
import { Feather, Ionicons } from '@expo/vector-icons';

interface IepGoalsModalProps {
  visible: boolean;
  onClose: () => void;
  isTablet: boolean;
  studentName?: string;
  milestones?: ParentMilestone[];
}

export function IepGoalsModal({
  visible,
  onClose,
  isTablet,
  milestones = [],
}: IepGoalsModalProps) {
  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="IEP Goals"
      isTablet={isTablet}
      cancelLabel="CLOSE"
      heightClassName={isTablet ? 'h-[75%]' : 'h-[68%]'}
    >
      <View className="mb-4">
        <Text className="font-quicksand-medium text-[#6B7280] text-base mb-4 text-center">
          Individualized Education Program (IEP) goals & milestones target plan.
        </Text>

        {milestones.length === 0 ? (
          <View className="items-center justify-center py-10 bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl">
            <Feather name="clipboard" size={44} color="#9CA3AF" />
            <Text className="font-fredoka-one text-[#484A4B] text-lg mt-3">
              No IEP Goals Set Yet
            </Text>
            <Text className="font-quicksand-medium text-[#9CA3AF] text-sm text-center mt-1.5 px-6">
              Your child's teacher will add official IEP targets and milestones here.
            </Text>
          </View>
        ) : (
          <View className="gap-3.5">
            {milestones.map((m) => {
              const isAchieved = m.status?.toLowerCase().includes('achieve') || m.status?.toLowerCase().includes('complete');
              const isInProgress = m.status?.toLowerCase().includes('progress');

              return (
                <View
                  key={m.id}
                  className="bg-white border-[2px] border-[#F1F1F1] rounded-2xl p-4 sm:p-5 flex-row items-center justify-between"
                  style={{
                    shadowColor: '#F1F1F1',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row items-center gap-3.5 flex-1 pr-2">
                    <View
                      className={`w-12 h-12 rounded-full items-center justify-center ${
                        isAchieved
                          ? 'bg-[#E6F4EA]'
                          : isInProgress
                          ? 'bg-[#EBF5FF]'
                          : 'bg-[#FEF9E7]'
                      }`}
                    >
                      <Ionicons
                        name={isAchieved ? 'checkmark-circle' : isInProgress ? 'flag' : 'star-outline'}
                        size={24}
                        color={isAchieved ? '#179D33' : isInProgress ? '#62A9E6' : '#FFAE02'}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="font-fredoka-one text-[#484A4B] text-lg sm:text-xl">
                        {m.title}
                      </Text>
                      {m.targetDate ? (
                        <Text className="font-quicksand-medium text-[#9CA3AF] text-sm mt-0.5">
                          Target: {m.targetDate}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View
                    className={`px-3.5 py-1.5 rounded-full border ${
                      isAchieved
                        ? 'bg-[#E6F4EA] border-[#CBFAC4]'
                        : isInProgress
                        ? 'bg-[#EBF5FF] border-[#BBE8FB]'
                        : 'bg-[#FEF9E7] border-[#FFF3C4]'
                    }`}
                  >
                    <Text
                      className="font-fredoka-one text-xs sm:text-sm"
                      style={{
                        color: isAchieved
                          ? '#179D33'
                          : isInProgress
                          ? '#62A9E6'
                          : '#FFAE02',
                      }}
                    >
                      {m.status || 'Target Set'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </BaseModal>
  );
}
