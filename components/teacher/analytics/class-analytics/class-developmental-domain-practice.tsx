import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { getClassDevelopmentalSkillsExposure, MasterDomainExposure } from '../../../../src/services/class-analytics';

interface ClassDevelopmentalDomainPracticeProps {
  classId: string;
}

type FilterType = 'today' | 'week' | 'month' | 'overall';

// Curated domain color themes matching Autivity's design system
const DOMAIN_THEMES = [
  {
    // Blue Theme (Primary)
    startColor: '#62A9E6',
    endColor: '#2563EB',
    trackBg: '#E0F2FE',
    accentText: '#0284C7',
    pillBg: '#F0F9FF',
    pillBorder: '#BBE8FB',
  },
  {
    // Green Theme
    startColor: '#34D399',
    endColor: '#059669',
    trackBg: '#DCFCE7',
    accentText: '#16A34A',
    pillBg: '#F0FDF4',
    pillBorder: '#CBFAC4',
  },
  {
    // Orange Theme
    startColor: '#FF8870',
    endColor: '#EA580C',
    trackBg: '#FFEDD5',
    accentText: '#EA580C',
    pillBg: '#FFF7ED',
    pillBorder: '#FFDBD4',
  },
  {
    // Yellow Theme
    startColor: '#FBBF24',
    endColor: '#D97706',
    trackBg: '#FEF3C7',
    accentText: '#D97706',
    pillBg: '#FFFBEB',
    pillBorder: '#FFF3C4',
  },
  {
    // Purple Theme
    startColor: '#A78BFA',
    endColor: '#7C3AED',
    trackBg: '#F3E8FF',
    accentText: '#7C3AED',
    pillBg: '#FAF5FF',
    pillBorder: '#DDD6FE',
  },
];

export default function ClassDevelopmentalDomainPractice({ classId }: ClassDevelopmentalDomainPracticeProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [data, setData] = useState<MasterDomainExposure[]>([]);
  const [filter, setFilter] = useState<FilterType>('overall');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const result = await getClassDevelopmentalSkillsExposure(classId, filter);
        setData(result);
        setError(null);
      } catch (err: any) {
        console.error('ClassDevelopmentalDomainPractice: failed to load exposure data', err);
        setError('Could not load developmental skills exposure data.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [classId, filter]);

  // Find global maximum count to normalize bar lengths
  const maxCount = useMemo(() => {
    let max = 1;
    for (const domain of data) {
      for (const skill of domain.skills) {
        if (skill.count > max) {
          max = skill.count;
        }
      }
    }
    return max;
  }, [data]);

  const filters: { label: string; value: FilterType }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Overall', value: 'overall' },
  ];

  return (
    <View className="flex-col mt-6">
      {/* Header and Filter Selector */}
      <View className="flex-row flex-wrap items-center justify-between gap-4 mb-4">
        <View className="flex-1 min-w-[200px]">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
              Developmental Domain Practice
            </Text>
            <Pressable
              onPress={() => setShowInfo(!showInfo)}
              className="active:opacity-75 mt-1"
            >
              <Feather name="info" size={isTablet ? 20 : 16} color="#62A9E6" />
            </Pressable>
          </View>
          {showInfo && (
            <Animated.View
              entering={FadeInUp.duration(200)}
              exiting={FadeOutUp.duration(150)}
              className="bg-[#E0F2FE] border border-[#BBE8FB] rounded-xl p-3 mt-2 flex-row items-center gap-2.5 overflow-hidden"
            >
              <Feather name="info" size={isTablet ? 22 : 18} color="#62A9E6" />
              <Text className={`font-quicksand-bold text-[#62A9E6] flex-1 leading-normal ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
                Total activity exposures across domain skills for this class.
              </Text>
            </Animated.View>
          )}
        </View>

        <View className="flex-row items-center gap-1.5 flex-wrap">
          {filters.map((f) => {
            const isActive = filter === f.value;
            return (
              <Pressable
                key={f.value}
                onPress={() => setFilter(f.value)}
                style={{
                  borderWidth: 2,
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: isTablet ? 16 : 12,
                  paddingVertical: isTablet ? 8 : 6,
                  backgroundColor: isActive ? '#BBE8FB' : '#FFFFFF',
                  borderColor: isActive ? '#62A9E6' : '#BBE8FB',
                  shadowColor: isActive ? '#62A9E6' : '#BBE8FB',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Content Area */}
      {isLoading ? (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: isTablet ? 32 : 24,
            padding: isTablet ? 24 : 20,
            minHeight: 180,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#62A9E6" />
        </View>
      ) : error ? (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: isTablet ? 32 : 24,
            padding: isTablet ? 24 : 20,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 180,
          }}
        >
          <Feather name="alert-circle" size={32} color="#EF4444" />
          <Text className="font-fredoka-one text-base text-[#4B5563] mt-3 text-center">
            Error Loading Data
          </Text>
          <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-1 text-center">
            {error}
          </Text>
        </View>
      ) : data.length === 0 ? (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: isTablet ? 32 : 24,
            padding: isTablet ? 24 : 20,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 180,
          }}
        >
          <Feather name="grid" size={36} color="#9CA3AF" />
          <Text className="font-fredoka-one text-base text-[#4B5563] mt-3 text-center">
            No Practice Data
          </Text>
          <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-1 text-center">
            No developmental skills practice recorded for this filter option.
          </Text>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: isTablet ? 32 : 24,
            padding: isTablet ? 24 : 20,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.03,
            shadowRadius: 10,
            elevation: 1,
          }}
        >
          <View className="flex-col gap-6">
            {data.map((domain, domainIdx) => {
              const theme = DOMAIN_THEMES[domainIdx % DOMAIN_THEMES.length];

              return (
                <View
                  key={domain.masterDomain}
                  className="flex-col bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl p-4"
                >
                  {/* Master Domain Header */}
                  <View className="flex-row items-center gap-2 mb-4">
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: theme.startColor }}
                    />
                    <Text className="font-fredoka-one text-sm text-[#374151]">
                      {domain.masterDomain}
                    </Text>
                  </View>

                  {/* Skills Progress Bars List */}
                  <View className="flex-col gap-4">
                    {domain.skills.map((skill, skillIdx) => {
                      const pct = Math.min(100, Math.round((skill.count / maxCount) * 100));
                      const gradientId = `grad-${domainIdx}-${skillIdx}`;

                      return (
                        <View key={skill.name} className="flex-col gap-1.5">
                          {/* Top Row: Title & Pill Badge */}
                          <View className="flex-row justify-between items-center">
                            <Text className="font-quicksand-bold text-xs text-[#374151]">
                              {skill.name}
                            </Text>
                            <View
                              style={{
                                backgroundColor: theme.pillBg,
                                borderColor: theme.pillBorder,
                                borderWidth: 1,
                                borderRadius: 999,
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                              }}
                            >
                              <Text
                                style={{ color: theme.accentText }}
                                className="font-fredoka-one text-[10px] uppercase"
                              >
                                {skill.count} {skill.count === 1 ? 'EXPOSURE' : 'EXPOSURES'}
                              </Text>
                            </View>
                          </View>

                          {/* Progress Bar Container with Gradient Fill */}
                          <View className="w-full h-3 rounded-full overflow-hidden my-0.5">
                            <Svg width="100%" height="12">
                              <Defs>
                                <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                                  <Stop offset="0%" stopColor={theme.startColor} stopOpacity="1" />
                                  <Stop offset="100%" stopColor={theme.endColor} stopOpacity="1" />
                                </LinearGradient>
                              </Defs>
                              {/* Soft Tinted Track Background */}
                              <Rect x="0" y="0" width="100%" height="12" rx="6" fill={theme.trackBg} />
                              {/* Gradient Filled Progress Bar */}
                              <Rect
                                x="0"
                                y="0"
                                width={`${Math.max(4, pct)}%`}
                                height="12"
                                rx="6"
                                fill={`url(#${gradientId})`}
                              />
                            </Svg>
                          </View>

                          {/* Bottom Row: Subtext */}
                          <View className="flex-row justify-between items-center">
                            <Text className="font-quicksand-medium text-[11px] text-[#9CA3AF]">
                              {pct}% practice frequency
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}
