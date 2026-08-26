import React, { useEffect, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

import { getStudentHeaderDetails, StudentHeaderDetails } from '../../../../src/services/student-analytics';
import { ScreenLayout } from '../../../screen-layout';
import { HeaderButton } from '../../../header-button';
import { StudentAnalyticsHeaderSkeleton, StudentAnalyticsSkeleton } from './student-analytics-skeleton';

import StudentDetailsCard from './student-details-card';
import StudentPerformanceCards from './student-performance-cards';
import StudentEvaluationTrend from './student-evaluation-trend';
import StudentDevelopmentalDomainPractice from './student-developmental-domain-practice';
import Milestones from './milestones';
import Sessions from './sessions';

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
            {/* Student Details Card */}
            <StudentDetailsCard student={studentData} />

            {/* Student Performance KPI Cards */}
            <StudentPerformanceCards studentId={studentId} />

            {/* Student Evaluation Trend Chart */}
            <StudentEvaluationTrend studentId={studentId} />

            {/* Student Developmental Domain Practice */}
            <StudentDevelopmentalDomainPractice studentId={studentId} />

            {/* Milestones */}
            <Milestones studentId={studentId} />

            {/* Completed Sessions */}
            <Sessions studentId={studentId} studentName={studentData.name} />
          </View>
        )}
      </View>
    </ScreenLayout>
  );
}
