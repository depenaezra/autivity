import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

import { getStudentHeaderDetails, getStudentValidatedSessionsEvaluations, getStudentDevelopmentalSkillsExposure, StudentHeaderDetails } from '../../../../src/services/student-analytics';
import {
  exportStudentAnalyticsReportPdf,
  exportStudentAnalyticsReportExcel,
} from '../../../../src/services/exportReport';
import { ExportFormatModal } from '../export-format-modal';
import { FilterPeriod, getFilterLabel } from '../../../../src/utils/dashboardFilters';
import { ParentFilterModal } from '../../../parent/parent-filter-modal';
import { ScreenLayout } from '../../../screen-layout';
import { HeaderButton } from '../../../header-button';
import { StudentAnalyticsHeaderSkeleton, StudentAnalyticsSkeleton } from './student-analytics-skeleton';

import StudentDetailsCard from './student-details-card';
import StudentPerformanceCards from './student-performance-cards';
import StudentEmotionRegulationCard from './student-emotion-regulation-card';
import StudentEvaluationTrend from './student-evaluation-trend';
import StudentDevelopmentalDomainPractice from './student-developmental-domain-practice';
import Milestones from './milestones';
import Sessions from './sessions';

import { calculateRubricScore } from '../../../../src/services/classAnalyticsEngine';
import { generateStudentRecommendations, StudentRecommendation } from '../../../../src/services/studentAnalyticsEngine';
import StudentRecommendationsCard from './student-recommendations-card';

// SVGs for themed headers matching class color
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

interface StudentViewProps {
  studentId: string;
  onBack: () => void;
}

export default function StudentView({ studentId, onBack }: StudentViewProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const [studentData, setStudentData] = useState<StudentHeaderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState<FilterPeriod>('overall');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isExportModalVisible, setExportModalVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [recommendations, setRecommendations] = useState<StudentRecommendation[]>([]);
  const [needsIntervention, setNeedsIntervention] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEvaluationValidated = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    async function loadAnalyticsData() {
      try {
        const [evals, domainExposures] = await Promise.all([
          getStudentValidatedSessionsEvaluations(studentId).catch(() => []),
          getStudentDevelopmentalSkillsExposure(studentId, globalFilter as any).catch(() => []),
        ]);
        const recs = generateStudentRecommendations(evals, domainExposures, studentData?.name || 'Student');
        setRecommendations(recs);

        const validScores = evals
          .map((e) => calculateRubricScore(e.rubric_evaluation))
          .filter((s): s is number => s !== null);
        const avg = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : null;
        setNeedsIntervention(avg !== null && avg < 3.0);
      } catch (err) {
        console.error('StudentView: error loading student recommendations', err);
      }
    }
    if (studentId) {
      loadAnalyticsData();
    }
  }, [studentId, globalFilter, studentData?.name, refreshKey]);

  useEffect(() => {
    async function fetchDetails() {
      setIsLoading(true);
      try {
        const data = await getStudentHeaderDetails(studentId);
        setStudentData(data);
        setError(null);
      } catch (err: any) {
        console.error('StudentView: error loading student details', err);
        setError('Failed to load student details.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetails();
  }, [studentId]);

  const handleSelectExportFormat = async (format: 'pdf' | 'excel') => {
    if (!studentData) return;
    setIsExporting(true);
    try {
      if (format === 'pdf') {
        await exportStudentAnalyticsReportPdf(
          studentId,
          studentData,
          globalFilter as any,
          getFilterLabel(globalFilter)
        );
      } else {
        await exportStudentAnalyticsReportExcel(
          studentId,
          studentData,
          globalFilter as any,
          getFilterLabel(globalFilter)
        );
      }
      setExportModalVisible(false);
    } catch (err: any) {
      Alert.alert('Could not export child report', err.message || 'Error creating report file.');
    } finally {
      setIsExporting(false);
    }
  };

  const themeKey = (studentData?.theme || 'blue').toLowerCase();
  const HeaderBgSvg = headerSvgs[themeKey] || headerSvgs.blue;

  const renderHeaderBackground = () => {
    if (isLoading || !studentData) {
      return <View className="flex-1 w-full h-full bg-[#E5E7EB]/50" />;
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
    if (isLoading || !studentData) {
      return <StudentAnalyticsHeaderSkeleton isTablet={isTablet} />;
    }
    return null;
  };

  return (
    <ScreenLayout
      headerBackground={renderHeaderBackground()}
      title={isLoading ? undefined : studentData?.name}
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
          <StudentAnalyticsSkeleton isTablet={isTablet} />
        ) : error || !studentData ? (
          <View className="w-full justify-center items-center py-10 bg-white border border-[#E5E7EB] rounded-2xl px-6">
            <Feather name="alert-circle" size={36} color="#EF4444" />
            <Text className="font-fredoka-one text-lg text-[#4B5563] mt-3 text-center">
              Error Loading Analytics
            </Text>
            <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-1 text-center">
              {error || 'Student details not found.'}
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

            {/* Learner Intervention Banner */}
            {needsIntervention && (
              <View className="bg-[#FFF7ED] border border-[#FFDBD4] rounded-2xl p-4 flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-[#FF8870]/20 items-center justify-center shrink-0">
                  <Feather name="alert-circle" size={22} color="#FF8870" />
                </View>
                <View className="flex-col flex-1">
                  <Text className="font-fredoka-one text-base text-[#C2410C]">
                    Attention Required
                  </Text>
                  <Text className="font-quicksand-medium text-xs sm:text-sm text-[#7C2D12] mt-0.5 leading-relaxed">
                    Learner is currently performing below target mastery (3.0 / 4.0). Review recommendations below and provide guided prompts during practice.
                  </Text>
                </View>
              </View>
            )}

            {/* Student Details Card */}
            <StudentDetailsCard student={studentData} needsIntervention={needsIntervention} />

            {/* Student Performance KPI Cards */}
            <StudentPerformanceCards studentId={studentId} filter={globalFilter} refreshTrigger={refreshKey} />

            {/* Student Recommendations Card */}
            <StudentRecommendationsCard recommendations={recommendations} />

            {/* Emotional Recognition & Self-Regulation Card */}
            <StudentEmotionRegulationCard
              studentId={studentId}
              studentName={studentData.name}
              filter={globalFilter}
              refreshTrigger={refreshKey}
            />

            {/* Student Evaluation Trend Chart */}
            <StudentEvaluationTrend studentId={studentId} filter={globalFilter} refreshTrigger={refreshKey} />

            {/* Student Developmental Domain Practice */}
            <StudentDevelopmentalDomainPractice studentId={studentId} filter={globalFilter} refreshTrigger={refreshKey} />

            {/* Milestones */}
            <Milestones studentId={studentId} />

            {/* Completed Sessions */}
            <Sessions studentId={studentId} studentName={studentData.name} filter={globalFilter} onEvaluationValidated={handleEvaluationValidated} />
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
