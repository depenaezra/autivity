import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { FilterPeriod, getCurrentSchoolYearStartYear, getSchoolYearLabel } from '../../src/utils/dashboardFilters';
import { BaseModal } from '../teacher/home/base-modal';

interface ParentFilterModalProps {
  visible: boolean;
  onClose: () => void;
  isTablet: boolean;
  selectedFilter: FilterPeriod;
  onSelectFilter: (filter: FilterPeriod) => void;
}

const quickFilters: { label: string; value: FilterPeriod; icon: keyof typeof Feather.glyphMap }[] = [
  { label: 'Today', value: 'today', icon: 'sun' },
  { label: 'This Week', value: 'week', icon: 'calendar' },
  { label: 'This Month', value: 'month', icon: 'clock' },
  { label: 'All Time', value: 'overall', icon: 'layers' },
];

const quarterOptions: { label: string; subLabel: string; key: 'full' | 'q1' | 'q2' | 'q3' | 'q4' }[] = [
  { label: 'Full School Year', subLabel: 'Aug – Jul (All 4 Quarters)', key: 'full' },
  { label: 'Quarter 1 (Q1)', subLabel: 'Aug – Oct', key: 'q1' },
  { label: 'Quarter 2 (Q2)', subLabel: 'Nov – Jan', key: 'q2' },
  { label: 'Quarter 3 (Q3)', subLabel: 'Feb – Apr', key: 'q3' },
  { label: 'Quarter 4 (Q4)', subLabel: 'May – Jul', key: 'q4' },
];

export function ParentFilterModal({
  visible,
  onClose,
  isTablet,
  selectedFilter,
  onSelectFilter,
}: ParentFilterModalProps) {
  const currentSYStartYear = getCurrentSchoolYearStartYear();

  // Determine initial mode & state based on selectedFilter
  const isAcademicInitial = selectedFilter.startsWith('sy-');
  const [activeTab, setActiveTab] = useState<'quick' | 'academic'>(isAcademicInitial ? 'academic' : 'quick');

  // Academic mode internal states
  const [selectedStartYear, setSelectedStartYear] = useState<number>(() => {
    if (selectedFilter.startsWith('sy-')) {
      const parts = selectedFilter.replace('sy-', '').split('-');
      const yearParsed = parseInt(parts[0], 10);
      if (!isNaN(yearParsed)) return yearParsed;
    }
    return currentSYStartYear;
  });

  const [selectedSubScope, setSelectedSubScope] = useState<'full' | 'q1' | 'q2' | 'q3' | 'q4'>(() => {
    if (selectedFilter.startsWith('sy-')) {
      const parts = selectedFilter.replace('sy-', '').split('-');
      if (parts.length >= 3) {
        return (parts[2] as any) || 'full';
      }
    }
    return 'full';
  });

  useEffect(() => {
    if (selectedFilter.startsWith('sy-')) {
      setActiveTab('academic');
      const parts = selectedFilter.replace('sy-', '').split('-');
      const yearParsed = parseInt(parts[0], 10);
      if (!isNaN(yearParsed)) setSelectedStartYear(yearParsed);
      if (parts.length >= 3) setSelectedSubScope((parts[2] as any) || 'full');
    } else {
      setActiveTab('quick');
    }
  }, [selectedFilter]);

  const availableSchoolYears = [
    { startYear: currentSYStartYear, isCurrent: true },
    { startYear: currentSYStartYear - 1, isCurrent: false },
    { startYear: currentSYStartYear - 2, isCurrent: false },
    { startYear: currentSYStartYear - 3, isCurrent: false },
  ];

  const handleSelectQuick = (filterVal: FilterPeriod) => {
    onSelectFilter(filterVal);
    onClose();
  };

  const handleApplyAcademic = (startYear: number, subScope: 'full' | 'q1' | 'q2' | 'q3' | 'q4') => {
    const endYear = startYear + 1;
    const filterKey = `sy-${startYear}-${endYear}-${subScope}`;
    onSelectFilter(filterKey);
    onClose();
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Select Timeframe"
      isTablet={isTablet}
      cancelLabel="CLOSE"
      heightClassName={isTablet ? 'h-[72%]' : 'h-[68%]'}
    >
      <View className="flex-col gap-4">
        {/* TOP SEGMENTED TAB SELECTOR */}
        <View className="flex-row bg-[#F3F4F6] p-1 rounded-xl gap-1.5 mb-1">
          <Pressable
            onPress={() => setActiveTab('quick')}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: activeTab === 'quick' ? '#BBE8FB' : '#FFFFFF',
              borderWidth: 2,
              borderColor: activeTab === 'quick' ? '#62A9E6' : '#BBE8FB',
              shadowColor: activeTab === 'quick' ? '#62A9E6' : '#BBE8FB',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center gap-1.5">
              <Feather name="zap" size={13} color="#62A9E6" />
              <Text className="font-fredoka-one text-[#62A9E6] text-xs uppercase">
                Quick Filters
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('academic')}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: activeTab === 'academic' ? '#BBE8FB' : '#FFFFFF',
              borderWidth: 2,
              borderColor: activeTab === 'academic' ? '#62A9E6' : '#BBE8FB',
              shadowColor: activeTab === 'academic' ? '#62A9E6' : '#BBE8FB',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center gap-1.5">
              <Feather name="calendar" size={13} color="#62A9E6" />
              <Text className="font-fredoka-one text-[#62A9E6] text-xs uppercase">
                School Year
              </Text>
            </View>
          </Pressable>
        </View>

        {/* VIEW 1: QUICK TIME RANGES */}
        {activeTab === 'quick' && (
          <View className="flex-col gap-2.5">
            <Text className="font-fredoka-one text-[#9EA0A0] text-xs uppercase tracking-[0.06em]">
              Quick Time Ranges
            </Text>
            <View className="flex-row flex-wrap items-center gap-2">
              {quickFilters.map((item) => {
                const isActive = selectedFilter === item.value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => handleSelectQuick(item.value)}
                    style={{
                      borderWidth: 2,
                      borderRadius: 8,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: isTablet ? 14 : 11,
                      paddingVertical: isTablet ? 7 : 6,
                      backgroundColor: isActive ? '#BBE8FB' : '#FFFFFF',
                      borderColor: isActive ? '#62A9E6' : '#BBE8FB',
                      shadowColor: isActive ? '#62A9E6' : '#BBE8FB',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 2,
                    }}
                  >
                    <View className="flex-row items-center gap-1.5">
                      <Feather name={item.icon} size={13} color="#62A9E6" />
                      <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                        {item.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* VIEW 2: SCHOOL YEAR & QUARTERS VIEW */}
        {activeTab === 'academic' && (
          <View className="flex-col gap-3.5">
            {/* STEP 1: SELECT SCHOOL YEAR */}
            <View>
              <Text className="font-fredoka-one text-[#9EA0A0] text-xs uppercase tracking-[0.06em] mb-2">
                1. Select School Year
              </Text>
              <View className="flex-row flex-wrap items-center gap-2">
                {availableSchoolYears.map((sy) => {
                  const isSelectedSY = selectedStartYear === sy.startYear;
                  const label = getSchoolYearLabel(sy.startYear);
                  return (
                    <Pressable
                      key={sy.startYear}
                      onPress={() => {
                        setSelectedStartYear(sy.startYear);
                      }}
                      style={{
                        borderWidth: 2,
                        borderRadius: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: isTablet ? 14 : 10,
                        paddingVertical: isTablet ? 7 : 5,
                        backgroundColor: isSelectedSY ? '#BBE8FB' : '#FFFFFF',
                        borderColor: isSelectedSY ? '#62A9E6' : '#BBE8FB',
                        shadowColor: isSelectedSY ? '#62A9E6' : '#BBE8FB',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 1,
                        shadowRadius: 0,
                        elevation: 2,
                      }}
                    >
                      <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-xs' : 'text-[10px]'}`}>
                        {label} {sy.isCurrent ? '(NOW)' : ''}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* STEP 2: SELECT QUARTER / FULL YEAR FOR THAT SCHOOL YEAR */}
            <View>
              <Text className="font-fredoka-one text-[#9EA0A0] text-xs uppercase tracking-[0.06em] mb-2">
                2. Select Quarter in {getSchoolYearLabel(selectedStartYear)}
              </Text>
              <View className="flex-col gap-2">
                {quarterOptions.map((q) => {
                  const isSelectedQ = selectedSubScope === q.key;
                  return (
                    <Pressable
                      key={q.key}
                      onPress={() => {
                        setSelectedSubScope(q.key);
                        handleApplyAcademic(selectedStartYear, q.key);
                      }}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 9,
                        borderRadius: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: isSelectedQ ? '#BBE8FB' : '#FFFFFF',
                        borderWidth: 2,
                        borderColor: isSelectedQ ? '#62A9E6' : '#BBE8FB',
                        shadowColor: isSelectedQ ? '#62A9E6' : '#BBE8FB',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 1,
                        shadowRadius: 0,
                        elevation: 2,
                      }}
                    >
                      <View className="flex-col flex-1 pr-2">
                        <Text className="font-fredoka-one text-[#62A9E6] text-xs uppercase">
                          {q.label}
                        </Text>
                        <Text className="font-quicksand-medium text-[#62A9E6]/80 text-[11px] mt-0.5">
                          {q.subLabel}
                        </Text>
                      </View>
                      <Feather
                        name={isSelectedQ ? 'check-circle' : 'circle'}
                        size={16}
                        color="#62A9E6"
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        )}
      </View>
    </BaseModal>
  );
}
