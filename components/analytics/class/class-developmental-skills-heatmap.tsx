import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { getClassDevelopmentalSkillsExposure, MasterDomainExposure } from '../../../src/services/class-analytics';

interface ClassDevelopmentalSkillsHeatmapProps {
  classId: string;
}

type FilterType = 'today' | 'week' | 'month' | 'overall';

export default function ClassDevelopmentalSkillsHeatmap({ classId }: ClassDevelopmentalSkillsHeatmapProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [data, setData] = useState<MasterDomainExposure[]>([]);
  const [filter, setFilter] = useState<FilterType>('overall');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const result = await getClassDevelopmentalSkillsExposure(classId, filter);
        setData(result);
        setError(null);
      } catch (err: any) {
        console.error('ClassDevelopmentalSkillsHeatmap: failed to load exposure data', err);
        setError('Could not load developmental skills exposure data.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [classId, filter]);

  // Find the global maximum count to normalize bar lengths
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
    <View className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm mt-6 flex-col">
      {/* Header and Filter Selector */}
      <View className="flex-row flex-wrap items-center justify-between gap-4 mb-6">
        <View className="flex-row bg-[#F3F4F6] p-1 rounded-xl gap-1">
          {filters.map((f) => {
            const isActive = filter === f.value;
            return (
              <Pressable
                key={f.value}
                onPress={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg active:opacity-90 ${isActive ? 'bg-[#62A9E6]' : 'bg-transparent'
                  }`}
              >
                <Text
                  className={`font-quicksand-bold text-xs ${isActive ? 'text-white' : 'text-[#6B7280]'
                    }`}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <View className="w-full justify-center items-center py-20">
          <ActivityIndicator size="large" color="#62A9E6" />
          <Text className="mt-3 font-quicksand-semibold text-sm text-[#9CA3AF]">
            Loading practice details...
          </Text>
        </View>
      ) : error ? (
        <View className="w-full justify-center items-center py-10 px-6">
          <Feather name="alert-circle" size={32} color="#EF4444" />
          <Text className="font-fredoka-one text-base text-[#4B5563] mt-3 text-center">
            Error Loading Data
          </Text>
          <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-1 text-center">
            {error}
          </Text>
        </View>
      ) : data.length === 0 ? (
        <View className="w-full justify-center items-center py-12 px-6 border-2 border-dashed border-[#E5E7EB] rounded-xl bg-[#F9FAFB]">
          <Feather name="activity" size={40} color="#9CA3AF" />
          <Text className="font-fredoka-one text-base text-[#4B5563] mt-3 text-center">
            No Exposure Recorded
          </Text>
          <Text className="font-quicksand-medium text-sm text-[#9CA3AF] mt-1 text-center">
            Students have not completed any activities matching this timeframe.
          </Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap gap-4 w-full">
          {data.map((domain) => {
            const domainColor = domain.color || '#62A9E6';
            return (
              <View
                key={domain.masterDomain}
                style={{
                  width: isTablet ? '48%' : '100%',
                  minWidth: 285,
                }}
                className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm flex-col flex-grow flex-shrink"
              >
                {/* Master Domain Header */}
                <View className="flex-row items-center mb-3">
                  <View
                    style={{ backgroundColor: domainColor }}
                    className="w-3.5 h-3.5 rounded-full mr-2.5 shadow-sm"
                  />
                  <Text className="font-fredoka-one text-base text-[#4B5563] flex-1">
                    {domain.masterDomain}
                  </Text>
                </View>

                {/* Horizontal Divider */}
                <View className="h-[1px] bg-[#F3F4F6] w-full mb-4" />

                {/* Subskills List */}
                <View className="flex-col gap-4">
                  {domain.skills.map((skill) => {
                    const percentage = maxCount > 0 ? (skill.count / maxCount) * 100 : 0;
                    return (
                      <View key={skill.name} className="flex-col">
                        <View className="flex-row items-center justify-between gap-2">
                          <Text className="font-quicksand-semibold text-sm text-[#4B5563] flex-1">
                            {skill.name}
                          </Text>
                          <View className="bg-[#F3F4F6] px-2 py-0.5 rounded-full">
                            <Text className="font-quicksand-bold text-[11px] text-[#6B7280]">
                              {skill.count} {skill.count === 1 ? 'practice' : 'practices'}
                            </Text>
                          </View>
                        </View>
                        {/* Heat Bar */}
                        <View className="h-2.5 bg-[#F3F4F6] rounded-full mt-1.5 overflow-hidden w-full">
                          <View
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: domainColor,
                            }}
                            className="h-full rounded-full"
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
