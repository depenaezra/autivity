import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

import { getClassPerformanceById, getClassSessionStats, getClassDevelopmentalSkillsExposure, getValidatedSessionsEvaluations } from '../../../../src/services/class-analytics';
import { getClassStudents } from '../../../../src/services/students';
import { ClassPerformanceData } from '../../../../src/services/analytics';
import {
  exportClassAnalyticsReportPdf,
  exportClassAnalyticsReportExcel,
} from '../../../../src/services/exportReport';
import { ExportFormatModal } from '../export-format-modal';
import { calculateRubricScore, generateClassRecommendations, ClassRecommendation } from '../../../../src/services/classAnalyticsEngine';
import { FilterPeriod, getFilterLabel } from '../../../../src/utils/dashboardFilters';
import { ParentFilterModal } from '../../../parent/parent-filter-modal';
import { ScreenLayout } from '../../../screen-layout';
import { HeaderButton } from '../../../header-button';

import ClassPerformanceCards from './class-performance-cards';
import ClassEvaluationTrend from './class-evaluation-trend';
import ClassDevelopmentalDomainPractice from './class-developmental-domain-practice';
import EnrolledStudentsCard from './enrolled-students-card';
import ClassRecommendationsCard from './class-recommendations-card';
import { ClassAnalyticsHeaderSkeleton, ClassAnalyticsSkeleton } from './class-analytics-skeleton';

// SVGs for themed headers
import HeaderClassBlue from '../../../../assets/images/teacher/class/header-class-blue.svg';
import HeaderClassGreen from '../../../../assets/images/teacher/class/header-class-green.svg';
import HeaderClassOrange from '../../../../assets/images/teacher/class/header-class-orange.svg';
import HeaderClassYellow from '../../../../assets/images/teacher/class/header-class-yellow.svg';

const headerSvgs: Record<string, React.FC<any>> = {
  blue: HeaderClassBlue,
  green: HeaderClassGreen,
  orange: HeaderClassOrange,
  yellow: HeaderClassYellow,
};

interface ClassAnalyticsViewProps {
  classId: string;
  onBack: () => void;
}

export default function ClassAnalyticsView({ classId, onBack }: ClassAnalyticsViewProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const [classData, setClassData] = useState<ClassPerformanceData | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState<FilterPeriod>('overall');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isExportModalVisible, setExportModalVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [recommendations, setRecommendations] = useState<ClassRecommendation[]>([]);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        const [evals, domainExposures, stats] = await Promise.all([
          getValidatedSessionsEvaluations(classId).catch(() => []),
          getClassDevelopmentalSkillsExposure(classId, globalFilter as any).catch(() => []),
          getClassSessionStats(classId, globalFilter as any).catch(() => null),
        ]);
        const recs = generateClassRecommendations(evals, domainExposures, stats);
        setRecommendations(recs);
      } catch (err) {
        console.error('ClassAnalyticsView: error loading recommendations', err);
      }
    }
    if (classId) {
      loadRecommendations();
    }
  }, [classId, globalFilter]);

  useEffect(() => {
    async function fetchDetails() {
      setIsLoading(true);
      try {
        const [data, classStudents, validatedSessions] = await Promise.all([
          getClassPerformanceById(classId),
          getClassStudents(classId),
          getValidatedSessionsEvaluations(classId).catch(() => []),
        ]);

        const studentScores: Record<string, number[]> = {};
        (validatedSessions || []).forEach((s: any) => {
          if (s.student_id && s.rubric_evaluation) {
            const score = calculateRubricScore(s.rubric_evaluation);
            if (score !== null) {
              if (!studentScores[s.student_id]) studentScores[s.student_id] = [];
              studentScores[s.student_id].push(score);
            }
          }
        });

        const enhancedStudents = (classStudents || []).map((st: any) => {
          const scores = studentScores[st.id] || [];
          const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
          return {
            ...st,
            averageScore: avg !== null ? Number(avg.toFixed(2)) : undefined,
            needsIntervention: !!(st.needs_intervention || st.needsIntervention || (avg !== null && avg < 3.0)),
          };
        });

        setClassData(data);
        setStudents(enhancedStudents);
        setError(null);
      } catch (err: any) {
        console.error('ClassAnalyticsView: error loading class details', err);
        setError('Failed to load class analytics details.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetails();
  }, [classId]);

  const handleSelectExportFormat = async (format: 'pdf' | 'excel') => {
    if (!classData) return;
    setIsExporting(true);
    try {
      const stats = await getClassSessionStats(classId, globalFilter as any).catch(() => null);
      if (format === 'pdf') {
        await exportClassAnalyticsReportPdf(
          classId,
          classData.title,
          classData.grade,
          students,
          stats,
          getFilterLabel(globalFilter),
          globalFilter as any
        );
      } else {
        await exportClassAnalyticsReportExcel(
          classId,
          classData.title,
          classData.grade,
          students,
          stats,
          getFilterLabel(globalFilter),
          globalFilter as any
        );
      }
      setExportModalVisible(false);
    } catch (err: any) {
      Alert.alert('Could not export class report', err.message || 'Error creating report file.');
    } finally {
      setIsExporting(false);
    }
  };

  const themeKey = (classData?.theme || 'blue').toLowerCase();
  const HeaderBgSvg = headerSvgs[themeKey] || headerSvgs.blue;

  const renderHeaderBackground = () => {
    if (isLoading || !classData) {
      return (
        <View className="flex-1 w-full h-full bg-[#E5E7EB]/50" />
      );
    }

    return (
      <View className="flex-1 w-full h-full relative">
        <View className="absolute inset-0">
          <HeaderBgSvg width="100%" height="100%" preserveAspectRatio="xMidYMax slice" />
        </View>
      </View>
    );
  };

  const renderHeaderContent = () => {
    if (isLoading || !classData) {
      return <ClassAnalyticsHeaderSkeleton isTablet={isTablet} />;
    }

    if (!classData.isArchived) return null;

    return (
      <View className="flex-row items-center flex-wrap gap-2 pt-1">
        {/* Archived Badge */}
        <View className="bg-red-100 border border-red-300 px-2.5 py-1 rounded-[6px] flex-row items-center gap-1">
          <View className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <Text
            className="font-fredoka-one text-red-600 uppercase"
            style={{ fontSize: isTablet ? 12 : 10 }}
          >
            ARCHIVED
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenLayout
      headerBackground={renderHeaderBackground()}
      title={isLoading ? undefined : classData?.title}
      leftHeaderButton={
        <HeaderButton
          onPress={onBack}
          icon={
            <View style={{ marginLeft: -3, marginTop: -1 }}>
              <Ionicons name="caret-back" size={isTablet ? 30 : 24} color="#62A9E6" />
            </View>
          }
        />
      }
      headerContent={renderHeaderContent()}
      scrollable={true}
      stickyHeader={true}
    >
      <View className={`bg-white ${isTablet ? 'px-12 py-6' : 'px-6 py-4'}`}>
        {isLoading ? (
          <ClassAnalyticsSkeleton isTablet={isTablet} />
        ) : error || !classData ? (
          <View className="w-full justify-center items-center py-10 bg-white border border-[#E5E7EB] rounded-2xl px-6">
            <Feather name="alert-circle" size={36} color="#EF4444" />
            <Text className="font-fredoka-one text-lg text-[#4B5563] mt-3 text-center">
              Error Loading Analytics
            </Text>
            <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-1 text-center">
              {error || 'Class details not found.'}
            </Text>
          </View>
        ) : (
          <View className="flex-col gap-4">
            {/* CONTROL ROW: RANGE FILTER & DOWNLOAD REPORT */}
            <View className="flex-row items-center justify-end gap-2 flex-wrap sm:flex-nowrap mb-1">
              {/* Range Filter Selector */}
              <Pressable
                onPress={() => setFilterModalVisible(true)}
                className="flex-row items-center justify-center gap-1.5 bg-white border-[2px] border-[#BBE8FB] px-3 h-[36px] rounded-xl active:scale-95 transition-transform"
                style={{
                  borderColor: '#BBE8FB',
                  shadowColor: '#BBE8FB',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                <Feather name="calendar" size={13} color="#62A9E6" />
                <Text className="font-fredoka-one text-[#62A9E6] text-[11px] uppercase" numberOfLines={1}>
                  RANGE: {getFilterLabel(globalFilter).toUpperCase()}
                </Text>
                <Feather name="chevron-down" size={13} color="#62A9E6" />
              </Pressable>

              {/* Master Download Report Button */}
              <Pressable
                onPress={() => setExportModalVisible(true)}
                disabled={isExporting}
                className="flex-row items-center justify-center gap-1.5 bg-white border-[2px] border-[#BBE8FB] px-3 h-[36px] rounded-xl active:scale-95 transition-transform"
                style={{
                  borderColor: '#BBE8FB',
                  shadowColor: '#BBE8FB',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                {isExporting ? (
                  <>
                    <ActivityIndicator size="small" color="#62A9E6" style={{ height: 16 }} />
                    <Text className="font-fredoka-one text-[#62A9E6] text-[11px] uppercase" numberOfLines={1}>
                      EXPORTING...
                    </Text>
                  </>
                ) : (
                  <>
                    <Feather name="download" size={13} color="#62A9E6" />
                    <Text className="font-fredoka-one text-[#62A9E6] text-[11px] uppercase" numberOfLines={1}>
                      DOWNLOAD REPORT
                    </Text>
                  </>
                )}
              </Pressable>
            </View>

            {/* Enrolled Class Students Roster Card */}
            <EnrolledStudentsCard students={students} />

            {/* Class Performance KPI Cards */}
            <ClassPerformanceCards classId={classId} filter={globalFilter} />

            {/* Actionable SPED Recommendations Card */}
            <ClassRecommendationsCard recommendations={recommendations} />

            {/* Class Evaluation Trend Chart */}
            <ClassEvaluationTrend classId={classId} filter={globalFilter} />

            {/* Developmental Domain Practice */}
            <ClassDevelopmentalDomainPractice classId={classId} filter={globalFilter} />
          </View>
        )}
      </View>

      {/* RANGE FILTER MODAL */}
      <ParentFilterModal
        visible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        isTablet={isTablet}
        selectedFilter={globalFilter}
        onSelectFilter={setGlobalFilter}
      />
      {/* EXPORT FORMAT MODAL */}
      <ExportFormatModal
        visible={isExportModalVisible}
        onClose={() => setExportModalVisible(false)}
        onSelectFormat={handleSelectExportFormat}
        isExporting={isExporting}
      />
    </ScreenLayout>
  );
}


