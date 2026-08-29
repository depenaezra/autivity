import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';

interface ExportFormatModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFormat: (format: 'pdf' | 'excel') => void;
  isExporting?: boolean;
}

export const ExportFormatModal: React.FC<ExportFormatModalProps> = ({
  visible,
  onClose,
  onSelectFormat,
  isExporting = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 bg-black/40 items-center justify-center p-5"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white border-2 border-[#E2E8F0] rounded-3xl p-6 shadow-xl"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-fredoka-one text-2xl text-[#1E293B]">
              Download Report
            </Text>
            <Pressable
              onPress={onClose}
              disabled={isExporting}
              className="p-1 rounded-full active:bg-[#F1F5F9]"
            >
              <Feather name="x" size={22} color="#64748B" />
            </Pressable>
          </View>

          <Text className="font-quicksand-bold text-sm text-[#64748B] mb-6">
            Choose your preferred format to export or share
          </Text>

          {/* PDF Format Button */}
          <Pressable
            onPress={() => onSelectFormat('pdf')}
            disabled={isExporting}
            className="w-full bg-[#F8FAFC] border-2 border-[#BBE8FB] active:bg-[#E0F2FE] rounded-2xl p-4 mb-3.5 flex-row items-center gap-4"
          >
            <View className="w-12 h-12 rounded-xl bg-[#E0F2FE] border border-[#BBE8FB] items-center justify-center">
              <Feather name="file-text" size={24} color="#0284C7" />
            </View>
            <View className="flex-1">
              <Text className="font-fredoka-one text-base text-[#0284C7]">
                PDF Document (.pdf)
              </Text>
              <Text className="font-quicksand-medium text-xs text-[#64748B] mt-0.5">
                Formatted visual report with charts, badges, and criteria breakdown.
              </Text>
            </View>
          </Pressable>

          {/* Excel Format Button */}
          <Pressable
            onPress={() => onSelectFormat('excel')}
            disabled={isExporting}
            className="w-full bg-[#F8FAFC] border-2 border-[#86EFAC] active:bg-[#ECFDF5] rounded-2xl p-4 mb-5 flex-row items-center gap-4"
          >
            <View className="w-12 h-12 rounded-xl bg-[#ECFDF5] border border-[#86EFAC] items-center justify-center">
              <Feather name="grid" size={24} color="#059669" />
            </View>
            <View className="flex-1">
              <Text className="font-fredoka-one text-base text-[#059669]">
                Excel Workbook (.xlsx)
              </Text>
              <Text className="font-quicksand-medium text-xs text-[#64748B] mt-0.5">
                Multi-tab spreadsheet with raw metrics, student lists, and milestones.
              </Text>
            </View>
          </Pressable>

          {/* Loading Indicator when exporting */}
          {isExporting && (
            <View className="flex-row items-center justify-center gap-2 mt-1 mb-2">
              <ActivityIndicator size="small" color="#0284C7" />
              <Text className="font-quicksand-bold text-xs text-[#0284C7]">
                Generating export file...
              </Text>
            </View>
          )}

          {/* Cancel Button */}
          <Pressable
            onPress={onClose}
            disabled={isExporting}
            className="w-full py-4 border-[2px] border-[#F1F1F1] rounded-[8px] items-center justify-center bg-white active:scale-95 transition-transform"
            style={{
              shadowColor: '#F1F1F1',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
            }}
          >
            <Text className="font-fredoka-one text-[#9CA3AF] text-base uppercase">
              CANCEL
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
