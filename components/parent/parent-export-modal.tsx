import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { ActivityTypeFilter } from '../../src/services/analytics';
import { FilterPeriod, getFilterLabel } from '../../src/utils/dashboardFilters';
import { BaseModal } from '../teacher/home/base-modal';

export interface ParentExportOptions {
  period: FilterPeriod;
  startDate?: Date;
  endDate?: Date;
  timeframeLabel: string;
  activityType: ActivityTypeFilter;
}

interface ParentExportModalProps {
  visible: boolean;
  onClose: () => void;
  isTablet: boolean;
  studentName?: string;
  language?: 'en' | 'tl';
  isExporting?: boolean;
  onConfirmExport: (options: ParentExportOptions) => Promise<void> | void;
}

const PRESET_OPTIONS: { labelEn: string; labelTl: string; value: FilterPeriod; icon: keyof typeof Feather.glyphMap }[] = [
  { labelEn: 'Today', labelTl: 'Ngayong Araw', value: 'today', icon: 'sun' },
  { labelEn: 'This Week (Last 7 Days)', labelTl: 'Ngayong Linggo (Huling 7 Araw)', value: 'week', icon: 'calendar' },
  { labelEn: 'Last Week', labelTl: 'Nakaraang Linggo', value: 'last_week', icon: 'rotate-ccw' },
  { labelEn: 'This Month (Last 30 Days)', labelTl: 'Ngayong Buwan (Huling 30 Araw)', value: 'month', icon: 'clock' },
  { labelEn: 'Full School Year (All Time)', labelTl: 'Buong Taon ng Paaralan', value: 'overall', icon: 'layers' },
];

export function ParentExportModal({
  visible,
  onClose,
  isTablet,
  studentName = 'Learner',
  language = 'en',
  isExporting = false,
  onConfirmExport,
}: ParentExportModalProps) {
  const isTl = language === 'tl';

  // Mode: Quick Presets vs. Custom Date Range
  const [activeTab, setActiveTab] = useState<'quick' | 'custom'>('quick');

  // Selected Quick Preset
  const [selectedPreset, setSelectedPreset] = useState<FilterPeriod>('month');

  // Custom Dates State
  const [customStartDate, setCustomStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [customEndDate, setCustomEndDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  });

  // DatePicker state for mobile
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

  // Activity Type Filter
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityTypeFilter>('all');

  // Date formatting helpers
  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString(isTl ? 'fil-PH' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateInputValue = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const isDateRangeInvalid = activeTab === 'custom' && customStartDate > customEndDate;

  const handleDownloadPress = () => {
    if (isDateRangeInvalid || isExporting) return;

    if (activeTab === 'quick') {
      const label = isTl
        ? PRESET_OPTIONS.find((p) => p.value === selectedPreset)?.labelTl || getFilterLabel(selectedPreset)
        : PRESET_OPTIONS.find((p) => p.value === selectedPreset)?.labelEn || getFilterLabel(selectedPreset);

      onConfirmExport({
        period: selectedPreset,
        timeframeLabel: label,
        activityType: selectedActivityType,
      });
    } else {
      const label = `${formatDateDisplay(customStartDate)} – ${formatDateDisplay(customEndDate)}`;
      onConfirmExport({
        period: 'custom',
        startDate: customStartDate,
        endDate: customEndDate,
        timeframeLabel: label,
        activityType: selectedActivityType,
      });
    }
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-full bg-[#E0F2FE] border border-[#BBE8FB] items-center justify-center">
            <Feather name="file-text" size={17} color="#0284C7" />
          </View>
          <Text className="font-fredoka-one text-xl text-[#0F172A]">
            {isTl ? 'I-download ang Ulat ng Pagkatuto' : 'Download Learning Report'}
          </Text>
        </View>
      }
      isTablet={isTablet}
      submitLabel={isExporting ? (isTl ? 'GUMAGAWA...' : 'GENERATING...') : isTl ? 'I-DOWNLOAD ANG PDF' : 'DOWNLOAD PDF'}
      onSubmit={handleDownloadPress}
      submitDisabled={isDateRangeInvalid || isExporting}
      isSubmitting={isExporting}
      cancelLabel={isTl ? 'ISARA' : 'CANCEL'}
      heightClassName={isTablet ? 'h-[75%]' : 'h-[78%]'}
    >
      <View className="flex-col gap-4 pb-4">
        {/* Subtitle / Description */}
        <Text className="font-quicksand-semibold text-xs text-[#64748B]">
          {isTl
            ? `Piliin ang saklaw ng petsa at uri ng aktibidad para sa opisyal na ulat ng pag-unlad ni ${studentName}.`
            : `Select the date range and activity source for ${studentName}'s official progress report.`}
        </Text>

        {/* 1. Timeframe Mode Tabs */}
        <View className="flex-row bg-[#F1F5F9] p-1 rounded-2xl gap-1.5">
          <Pressable
            onPress={() => setActiveTab('quick')}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: activeTab === 'quick' ? '#FFFFFF' : 'transparent',
              borderWidth: activeTab === 'quick' ? 1.5 : 0,
              borderColor: activeTab === 'quick' ? '#BBE8FB' : 'transparent',
              elevation: activeTab === 'quick' ? 1 : 0,
            }}
          >
            <View className="flex-row items-center gap-1.5">
              <Feather name="zap" size={14} color={activeTab === 'quick' ? '#0284C7' : '#64748B'} />
              <Text
                className={`font-fredoka-one text-xs ${
                  activeTab === 'quick' ? 'text-[#0284C7]' : 'text-[#64748B]'
                }`}
              >
                {isTl ? 'Mabilisang Pagpipilian' : 'Quick Presets'}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('custom')}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: activeTab === 'custom' ? '#FFFFFF' : 'transparent',
              borderWidth: activeTab === 'custom' ? 1.5 : 0,
              borderColor: activeTab === 'custom' ? '#BBE8FB' : 'transparent',
              elevation: activeTab === 'custom' ? 1 : 0,
            }}
          >
            <View className="flex-row items-center gap-1.5">
              <Feather name="calendar" size={14} color={activeTab === 'custom' ? '#0284C7' : '#64748B'} />
              <Text
                className={`font-fredoka-one text-xs ${
                  activeTab === 'custom' ? 'text-[#0284C7]' : 'text-[#64748B]'
                }`}
              >
                {isTl ? 'Sariling Petsa' : 'Custom Dates'}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* 2. TAB CONTENT */}
        {activeTab === 'quick' ? (
          <View className="flex-col gap-2">
            {PRESET_OPTIONS.map((opt) => {
              const isSelected = selectedPreset === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setSelectedPreset(opt.value)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 14,
                    paddingVertical: 11,
                    borderRadius: 14,
                    backgroundColor: isSelected ? '#F0F9FF' : '#FFFFFF',
                    borderWidth: 1.5,
                    borderColor: isSelected ? '#0284C7' : '#E2E8F0',
                  }}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: isSelected ? '#E0F2FE' : '#F8FAFC',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Feather name={opt.icon} size={16} color={isSelected ? '#0284C7' : '#64748B'} />
                    </View>
                    <Text
                      className={`font-quicksand-bold text-sm ${
                        isSelected ? 'text-[#0284C7]' : 'text-[#1E293B]'
                      }`}
                    >
                      {isTl ? opt.labelTl : opt.labelEn}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      borderWidth: 2,
                      borderColor: isSelected ? '#0284C7' : '#CBD5E1',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? '#0284C7' : 'transparent',
                    }}
                  >
                    {isSelected && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' }} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          /* Custom Date Range Selectors */
          <View className="flex-col gap-3.5 bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-2xl">
            <View className="flex-row items-center justify-between">
              <Text className="font-fredoka-one text-xs text-[#475569] uppercase">
                {isTl ? 'Simulang Petsa' : 'Start Date'}
              </Text>
              <Text className="font-fredoka-one text-xs text-[#475569] uppercase">
                {isTl ? 'Huling Petsa' : 'End Date'}
              </Text>
            </View>

            {Platform.OS === 'web' ? (
              <View className="flex-row items-center gap-3">
                <input
                  type="date"
                  value={formatDateInputValue(customStartDate)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) setCustomStartDate(new Date(val + 'T00:00:00'));
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF',
                  }}
                />
                <Feather name="arrow-right" size={16} color="#94A3B8" />
                <input
                  type="date"
                  value={formatDateInputValue(customEndDate)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) setCustomEndDate(new Date(val + 'T23:59:59'));
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </View>
            ) : (
              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => setShowDatePicker('start')}
                  className="flex-1 bg-white border border-[#CBD5E1] p-3 rounded-xl flex-row items-center justify-between"
                >
                  <Text className="font-quicksand-bold text-xs text-[#1E293B]">
                    {formatDateDisplay(customStartDate)}
                  </Text>
                  <Feather name="calendar" size={14} color="#0284C7" />
                </Pressable>

                <Feather name="arrow-right" size={15} color="#94A3B8" />

                <Pressable
                  onPress={() => setShowDatePicker('end')}
                  className="flex-1 bg-white border border-[#CBD5E1] p-3 rounded-xl flex-row items-center justify-between"
                >
                  <Text className="font-quicksand-bold text-xs text-[#1E293B]">
                    {formatDateDisplay(customEndDate)}
                  </Text>
                  <Feather name="calendar" size={14} color="#0284C7" />
                </Pressable>
              </View>
            )}

            {isDateRangeInvalid && (
              <View className="flex-row items-center gap-1.5 bg-[#FEF2F2] border border-[#FCA5A5] p-2 rounded-lg">
                <Feather name="alert-circle" size={13} color="#DC2626" />
                <Text className="font-quicksand-bold text-[11px] text-[#DC2626]">
                  {isTl
                    ? 'Ang simulang petsa ay dapat mauna o katulad ng huling petsa.'
                    : 'Start date must be earlier than or equal to end date.'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 3. Activity Source Filter */}
        <View className="flex-col gap-1.5 mt-1">
          <Text className="font-fredoka-one text-xs text-[#475569] uppercase">
            {isTl ? 'Pinagmulan ng Aktibidad' : 'Activity Source'}
          </Text>
          <View className="flex-row bg-[#F1F5F9] p-1 rounded-xl gap-1">
            {[
              { id: 'all' as ActivityTypeFilter, labelEn: 'All', labelTl: 'Lahat', icon: 'grid' as const },
              { id: 'app' as ActivityTypeFilter, labelEn: 'App Games', labelTl: 'App', icon: 'tablet' as const },
              { id: 'classroom' as ActivityTypeFilter, labelEn: 'Classroom', labelTl: 'Silid-Aralan', icon: 'book-open' as const },
            ].map((src) => {
              const isSelected = selectedActivityType === src.id;
              return (
                <Pressable
                  key={src.id}
                  onPress={() => setSelectedActivityType(src.id)}
                  style={{
                    flex: 1,
                    paddingVertical: 7,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                    borderWidth: isSelected ? 1 : 0,
                    borderColor: isSelected ? '#CBD5E1' : 'transparent',
                  }}
                >
                  <View className="flex-row items-center gap-1.5">
                    <Feather name={src.icon} size={12} color={isSelected ? '#0284C7' : '#64748B'} />
                    <Text
                      className={`font-fredoka-one text-[11px] ${
                        isSelected ? 'text-[#0284C7]' : 'text-[#64748B]'
                      }`}
                    >
                      {isTl ? src.labelTl : src.labelEn}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Native Mobile DateTimePicker Dialogs */}
      {showDatePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={showDatePicker === 'start' ? customStartDate : customEndDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={(_, selectedDate) => {
            const currentTarget = showDatePicker;
            setShowDatePicker(null);
            if (selectedDate) {
              if (currentTarget === 'start') {
                selectedDate.setHours(0, 0, 0, 0);
                setCustomStartDate(selectedDate);
              } else {
                selectedDate.setHours(23, 59, 59, 999);
                setCustomEndDate(selectedDate);
              }
            }
          }}
        />
      )}
    </BaseModal>
  );
}
