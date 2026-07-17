import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import your service
import FeedbackModal from '../../components/feedback-modal';
import { createMilestone, deleteMilestone, getTeacherAnalyticsOverview, updateMilestoneStatus } from '../../src/services/analytics';
import { formatActivityTitle } from '../../src/utils/format';

// Theme helper
const THEME_MAP: Record<string, { themeColor: string; shadowColor: string; lightBg: string }> = {
  green: { themeColor: '#86EFAC', shadowColor: '#4ADE80', lightBg: '#F0FDF4' },
  orange: { themeColor: '#FDBA74', shadowColor: '#FB923C', lightBg: '#FFF7ED' },
  yellow: { themeColor: '#FDE047', shadowColor: '#FACC15', lightBg: '#FEF9C3' },
  blue: { themeColor: '#93C5FD', shadowColor: '#60A5FA', lightBg: '#EFF6FF' },
};

const MASTER_DOMAINS = [
  {
    name: 'Sensory Regulation',
    color: '#A7F3D0',
    description: 'Auditory tolerance & calm task transitions',
    subSkills: ['Sensory']
  },
  {
    name: 'Cognitive & Sorting',
    color: '#93C5FD',
    description: 'Pattern recognition, shape/color matching',
    subSkills: ['Object Recognition', 'Matching', 'Categorization', 'Letter Recognition', 'Shape Recognition', 'Number Recognition']
  },
  {
    name: 'Motor Skills',
    color: '#FDE047',
    description: 'Pencil grip, tracing precision & posture',
    subSkills: ['Fine Motor Skills', 'Visual-Motor Integration', 'Hand-Eye Coordination', 'Pre-Writing Skills']
  },
  {
    name: 'Communication & AAC',
    color: '#FCA5A5',
    description: 'PECS card exchange & spontaneous requests',
    subSkills: ['Communication', 'AAC']
  },
  {
    name: 'Social & Turn-Taking',
    color: '#C084FC',
    description: 'Joint attention & shared play activities',
    subSkills: ['Social']
  }
];

// --- TYPES ---
interface ClassInfo {
  id: string;
  name: string;
  level: string;
  totalStudents: number;
  avgProgress: number;
  completedActivities: number;
  pendingFeedback: number;
  themeColor: string;
  shadowColor: string;
  lightBg: string;
}

interface StudentInfo {
  id: string;
  classId: string;
  name: string;
  age: number;
  focusScore: string;
  overallProgress: number;
  pendingCount: number;
  statusColor: string;
  avatarBg: string;
  behavior: string;
}

interface Milestone {
  id: string;
  studentId: string;
  title: string;
  status: 'Achieved' | 'In Progress' | 'Target Set';
  date: string;
}

interface SessionRecord {
  id: string;
  studentId: string;
  activityName: string;
  category: string;
  skill_domain: string[];
  date: string;
  duration: string;
  score: string;
  status: 'pending' | 'validated';
}

export default function AnalyticsScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // --- NAVIGATION STATE ---
  const [currentView, setCurrentView] = useState<'overview' | 'class' | 'student'>('overview');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

  // --- DYNAMIC DATA STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [classesData, setClassesData] = useState<ClassInfo[]>([]);
  const [studentsData, setStudentsData] = useState<StudentInfo[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isMilestoneModalVisible, setMilestoneModalVisible] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  const [activeModalSession, setActiveModalSession] = useState<{
    id: string;
    studentId: string;
    classId: string;
    activityName: string;
  } | null>(null);

  // --- FETCH AND PROCESS DATA ---
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const data = await getTeacherAnalyticsOverview();

      // Process Sessions
      const processedSessions: SessionRecord[] = data.sessions.map((s: any) => ({
        id: s.id,
        studentId: s.student_id,
        activityName: s.activity_path
          ? formatActivityTitle(s.activity_path)
          : 'Unknown Activity',
        category: s.category || 'General',
        skill_domain: (() => {
          if (Array.isArray(s.skill_domain)) return s.skill_domain;

          if (typeof s.skill_domain === 'string') {
            // Changed: explicitly typed as string so TypeScript can infer the type in .map()
            const trimmed: string = s.skill_domain.trim();

            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
              try {
                return JSON.parse(trimmed);
              } catch (e) {
                // fall through
              }
            }

            if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
              return trimmed
                .slice(1, -1)
                .split(',')
                .map(item => item.trim().replace(/^"|"$/g, ''))
                .filter(Boolean);
            }

            return trimmed
              .split(',')
              .map(item => item.trim())
              .filter(Boolean);
          }

          return [];
        })(),
        date: new Date(s.created_at).toLocaleDateString(),
        duration: s.duration_seconds
          ? `${Math.floor(s.duration_seconds / 60)} mins`
          : '5 mins',
        score: s.score != null ? `${s.score}%` : 'N/A',
        status: s.status as 'pending' | 'validated',
      }));

      setSessions(processedSessions);

      // Process Milestones
      const processedMilestones: Milestone[] = data.milestones.map((m: any) => ({
        id: m.id,
        studentId: m.student_id,
        title: m.title,
        status: m.status as any,
        date: m.target_date || new Date(m.created_at).toLocaleDateString()
      }));
      setMilestones(processedMilestones);

      // Process Students 
      const processedStudents: StudentInfo[] = data.students.map((st: any) => {
        const studentSessions = processedSessions.filter((s) => s.studentId === st.id);
        const pending = studentSessions.filter((s) => s.status === 'pending').length;
        const completedSessions = studentSessions.filter((s) => s.status === 'validated' || s.status === 'pending');

        let avg = 0;
        if (completedSessions.length > 0) {
          const scores = completedSessions.map(s => parseInt(s.score.replace('%', '')) || 0);
          avg = Math.round(scores.reduce((a, b) => a + b, 0) / completedSessions.length);
        }

        return {
          id: st.id,
          classId: st.class_id,
          name: st.name,
          age: 7,
          focusScore: 'N/A',
          overallProgress: avg,
          pendingCount: pending,
          statusColor: '#62A9E6',
          avatarBg: '#EBF5FF',
          behavior: 'Ready to Learn',
        };
      });
      setStudentsData(processedStudents);

      // Process Classes
      const processedClasses: ClassInfo[] = data.classes.map((cls: any) => {
        const classStudents = processedStudents.filter((s) => s.classId === cls.id);
        const classSessions = processedSessions.filter((s) =>
          classStudents.some(cs => cs.id === s.studentId)
        );

        const pendingCount = classSessions.filter((s) => s.status === 'pending').length;
        const completedCount = classSessions.filter((s) => s.status === 'validated' || s.status === 'pending').length;

        const completedSessions = classSessions.filter((s) => s.status === 'validated' || s.status === 'pending');
        let classAvg = 0;
        if (completedSessions.length > 0) {
          const scores = completedSessions.map(s => parseInt(s.score.replace('%', '')) || 0);
          classAvg = Math.round(scores.reduce((a, b) => a + b, 0) / completedSessions.length);
        }

        const colors = THEME_MAP[cls.theme_name] || THEME_MAP.green;

        return {
          id: cls.id,
          name: cls.title,
          level: cls.grade || 'Grade 1',
          totalStudents: classStudents.length,
          avgProgress: classAvg,
          completedActivities: completedCount,
          pendingFeedback: pendingCount,
          ...colors
        };
      });

      setClassesData(processedClasses);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACTIONS ---
  const handleSelectClass = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedStudentId(null);
    setExpandedDomain(null);
    setCurrentView('class');
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setExpandedDomain(null);
    setCurrentView('student');
  };

  const handleValidateSession = (session: SessionRecord, classId: string) => {
    setActiveModalSession({
      id: session.id,
      studentId: session.studentId,
      classId: classId,
      activityName: session.activityName,
    });
  };

  const handleValidationSuccess = () => {
    if (!activeModalSession) return;
    const { id: sessionId, studentId, classId } = activeModalSession;

    // Update UI Optimistically
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'validated' } : s));
    setStudentsData(prev => prev.map(st => {
      if (st.id === studentId && st.pendingCount > 0) {
        return { ...st, pendingCount: st.pendingCount - 1 };
      }
      return st;
    }));
    setClassesData(prev => prev.map(cl => {
      if (cl.id === classId && cl.pendingFeedback > 0) {
        return { ...cl, pendingFeedback: cl.pendingFeedback - 1 };
      }
      return cl;
    }));

    setActiveModalSession(null);
    Alert.alert("Validated", "Session synced and feedback published successfully!");
  };

  // Toggle milestone logic
  const handleToggleMilestone = async (milestoneId: string, currentStatus: string) => {
    // Cycle logic: Target Set -> In Progress -> Achieved -> Target Set
    const statusCycle: any = {
      'Target Set': 'In Progress',
      'In Progress': 'Achieved',
      'Achieved': 'Target Set'
    };
    const nextStatus = statusCycle[currentStatus];

    try {
      // Optimistic UI update for snappy feel
      setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, status: nextStatus } : m));
      // Save to database
      await updateMilestoneStatus(milestoneId, nextStatus);
    } catch (error: any) {
      Alert.alert("Error", "Failed to update milestone status.");
      fetchDashboardData(); // Revert on failure
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    Alert.alert(
      "Delete Milestone",
      "Are you sure you want to delete this milestone?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Optimistic UI update
              setMilestones(prev => prev.filter(m => m.id !== milestoneId));
              await deleteMilestone(milestoneId);
            } catch (error: any) {
              Alert.alert("Error", "Failed to delete milestone.");
              fetchDashboardData(); // Revert on failure
            }
          }
        }
      ]
    );
  };

  // --- HELPERS ---
  const currentClass = classesData.find(c => c.id === selectedClassId) || classesData[0];
  const classStudents = (studentsData || []).filter(s => s.classId === currentClass?.id);
  const currentStudent = (studentsData || []).find(s => s.id === selectedStudentId) || classStudents[0] || studentsData[0];

  const studentSessions = (sessions || []).filter(s => s.studentId === currentStudent?.id);
  const studentMilestones = (milestones || []).filter(m => m.studentId === currentStudent?.id);

  const totalPendingAllClasses = classesData.reduce((sum, c) => sum + c.pendingFeedback, 0);

  // --- LOADING CHECK ---
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F8FA] justify-center items-center">
        <ActivityIndicator size="large" color="#62A9E6" />
        <Text className="mt-4 font-quicksand-bold text-[#6B7280]">Loading Analytics...</Text>
      </SafeAreaView>
    );
  }

  // ==========================================
  // RENDER 1: OVERVIEW VIEW (ALL CLASSES)
  // ==========================================
  const renderOverview = () => (
    <View className="w-full">
      {/* QUICK STATS TOP ROW */}
      <View className={`flex-row justify-between ${isTablet ? 'px-12 mt-6 gap-4' : 'px-6 mt-4 gap-2'}`}>
        <View className="flex-1 border-[2px] border-[#A3CFF1] bg-white rounded-2xl overflow-hidden shadow-sm">
          <View className={`bg-[#EBF5FF] flex-row items-center justify-center border-b-[2px] border-b-[#A3CFF1] ${isTablet ? 'py-5 gap-3' : 'py-3 gap-2'}`}>
            <Ionicons name="stats-chart" size={isTablet ? 36 : 20} color="#62A9E6" />
            <Text className={`font-quicksand-bold text-[#62A9E6] ${isTablet ? 'text-4xl' : 'text-xl'}`}>
              {classesData.length > 0 ? Math.round(classesData.reduce((sum, c) => sum + c.avgProgress, 0) / classesData.length) : 0}%
            </Text>
          </View>
          <View className="bg-white items-center justify-center py-2">
            <Text className={`text-[#4B5563] font-quicksand-semibold tracking-wider ${isTablet ? 'text-sm' : 'text-[10px]'}`}>OVERALL AVG. PROGRESS</Text>
          </View>
        </View>

        <View className="flex-1 border-[2px] border-[#FDBA74] bg-white rounded-2xl overflow-hidden shadow-sm">
          <View className={`bg-[#FFF7ED] flex-row items-center justify-center border-b-[2px] border-b-[#FDBA74] ${isTablet ? 'py-5 gap-3' : 'py-3 gap-2'}`}>
            <Ionicons name="time-outline" size={isTablet ? 36 : 20} color="#EA580C" />
            <Text className={`font-quicksand-bold text-[#EA580C] ${isTablet ? 'text-4xl' : 'text-xl'}`}>{totalPendingAllClasses}</Text>
          </View>
          <View className="bg-white items-center justify-center py-2">
            <Text className={`text-[#4B5563] font-quicksand-semibold tracking-wider ${isTablet ? 'text-sm' : 'text-[10px]'}`}>PENDING VALIDATIONS</Text>
          </View>
        </View>
      </View>

      {/* CLASS PERFORMANCE OVERVIEW CARDS */}
      <View className={isTablet ? 'px-12 mt-8' : 'px-6 mt-6'}>
        <View className="flex-row items-center justify-between mb-4">
          <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-3xl' : 'text-lg'}`}>
            Class Performance Overview
          </Text>
          <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-base' : 'text-xs'}`}>Tap class to inspect learners</Text>
        </View>

        {classesData.length === 0 ? (
          <View className="bg-white p-6 rounded-xl border border-[#E5E7EB] items-center justify-center">
            <Text className="font-quicksand-medium text-sm text-[#9CA3AF]">No classes created yet.</Text>
          </View>
        ) : (
          <View className="gap-4">
            {classesData.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                activeOpacity={0.9}
                onPress={() => handleSelectClass(cls.id)}
                className="bg-white rounded-2xl border-[2px] overflow-hidden shadow-sm"
                style={{ borderColor: cls.themeColor }}
              >
                {/* Card Header */}
                <View className="flex-row items-center justify-between px-5 py-4 border-b border-[#F3F4F6]" style={{ backgroundColor: cls.lightBg }}>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-3xl' : 'text-lg'}`}>
                        {cls.name}
                      </Text>
                      {cls.pendingFeedback > 0 && (
                        <View className="bg-[#F87171] px-2 py-0.5 rounded-full flex-row items-center gap-1">
                          <Feather name="alert-circle" size={isTablet ? 12 : 10} color="white" />
                          <Text className={`font-quicksand-bold text-white ${isTablet ? 'text-xs' : 'text-[10px]'}`}>{cls.pendingFeedback} Pending</Text>
                        </View>
                      )}
                    </View>
                    <Text className={`font-quicksand-medium text-[#6B7280] mt-0.5 ${isTablet ? 'text-base' : 'text-xs'}`}>{cls.level}</Text>
                  </View>

                  <View className="flex-row items-center bg-white px-3 py-1.5 rounded-full border border-[#E5E7EB]">
                    <Text className={`font-quicksand-bold text-[#62A9E6] mr-1 ${isTablet ? 'text-base' : 'text-xs'}`}>Inspect</Text>
                    <Feather name="chevron-right" size={isTablet ? 16 : 14} color="#62A9E6" />
                  </View>
                </View>

                {/* Card Stats Body */}
                <View className="p-5">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className={`font-quicksand-medium text-[#6B7280] ${isTablet ? 'text-lg' : 'text-sm'}`}>
                      Learners: <Text className="font-quicksand-bold text-[#4B5563]">{cls.totalStudents}</Text> • Completed Activities: <Text className="font-quicksand-bold text-[#4B5563]">{cls.completedActivities}</Text>
                    </Text>
                    <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-lg' : 'text-sm'}`}>{cls.avgProgress}% Avg</Text>
                  </View>

                  {/* Progress Bar */}
                  <View className="w-full h-3 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${cls.avgProgress}%`, backgroundColor: cls.shadowColor }}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  // ==========================================
  // RENDER 2: CLASS-LEVEL VIEW
  // ==========================================
  const renderClassView = () => {
    if (!currentClass) return null;
    return (
      <View className="w-full">
        {/* BACK BUTTON & CLASS TITLE */}
        <View className={isTablet ? 'px-12 mt-4' : 'px-6 mt-3'}>
          <TouchableOpacity
            onPress={() => setCurrentView('overview')}
            className="flex-row items-center bg-[#EBF5FF] self-start px-4 py-2 rounded-full border border-[#A3CFF1] mb-4"
          >
            <Feather name="arrow-left" size={isTablet ? 18 : 16} color="#62A9E6" />
            <Text className={`font-quicksand-bold text-[#62A9E6] ml-1.5 ${isTablet ? 'text-base' : 'text-xs'}`}>Back to All Classes</Text>
          </TouchableOpacity>

          <View className="bg-white p-5 rounded-2xl border-[2px] shadow-sm mb-6" style={{ borderColor: currentClass.themeColor, backgroundColor: currentClass.lightBg }}>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-xl'}`}>
                  {currentClass.name}
                </Text>
                <Text className={`font-quicksand-medium text-[#6B7280] mt-0.5 ${isTablet ? 'text-lg' : 'text-sm'}`}>{currentClass.level}</Text>
              </View>
              <View className="items-end">
                <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>{currentClass.avgProgress}%</Text>
                <Text className={`font-quicksand-semibold text-[#9CA3AF] ${isTablet ? 'text-sm' : 'text-[11px]'}`}>CLASS AVERAGE</Text>
              </View>
            </View>
          </View>
        </View>

        {/* TIME RANGE FILTER */}
        <View className={`flex-row justify-between items-center ${isTablet ? 'px-12' : 'px-6'}`}>
          <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-2xl' : 'text-base'}`}>
            Progress Trends & Learners
          </Text>
          <View className="flex-row bg-[#E5E7EB] p-1 rounded-full">
            {(['daily', 'weekly', 'monthly'] as const).map((range) => (
              <Pressable
                key={range}
                onPress={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-full ${timeRange === range ? 'bg-[#62A9E6]' : 'bg-transparent'}`}
              >
                <Text className={`font-quicksand-semibold capitalize ${timeRange === range ? 'text-white' : 'text-[#6B7280]'} ${isTablet ? 'text-base' : 'text-xs'}`}>
                  {range}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* TRENDS SUMMARY BOX */}
        <View className={isTablet ? 'px-12 mt-3' : 'px-6 mt-3'}>
          <View className="bg-white p-4 rounded-xl border border-[#E5E7EB] flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-10 h-10 rounded-full bg-[#ECFDF5] items-center justify-center">
                <Ionicons name="trending-up" size={isTablet ? 24 : 20} color="#10B981" />
              </View>
              <View className="flex-1 mr-2">
                <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-lg' : 'text-sm'}`}>
                  {timeRange === 'daily' ? '+0.0% Daily Growth' : timeRange === 'weekly' ? '+0.0% Weekly Growth' : '+0.0% Monthly Gain'}
                </Text>
                <Text className={`font-quicksand-medium text-[#6B7280] ${isTablet ? 'text-base' : 'text-xs'}`}>
                  Data will populate as students complete activities.
                </Text>
              </View>
            </View>
            <View className="bg-[#F3F4F6] px-3 py-1.5 rounded-lg">
              <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-base' : 'text-xs'}`}>{currentClass.completedActivities} Activities</Text>
            </View>
          </View>
        </View>

        {/* STUDENTS LIST */}
        <View className={isTablet ? 'px-12' : 'px-6'}>
          <Text className={`font-quicksand-bold text-[#9CA3AF] tracking-wider uppercase mb-3 ${isTablet ? 'text-sm' : 'text-xs'}`}>
            Learners in {currentClass.name} (Tap a Learner)
          </Text>

          {classStudents.length === 0 ? (
            <View className="bg-white p-6 rounded-xl border border-[#E5E7EB] items-center justify-center">
              <Text className="font-quicksand-medium text-sm text-[#9CA3AF]">No students added to this class yet.</Text>
            </View>
          ) : (
            <View className="gap-3">
              {classStudents.map((student) => (
                <TouchableOpacity
                  key={student.id}
                  activeOpacity={0.85}
                  onPress={() => handleSelectStudent(student.id)}
                  className="bg-white border-[1.5px] border-[#E5E7EB] rounded-2xl p-4 shadow-sm flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-12 h-12 rounded-full items-center justify-center border border-[#E5E7EB]" style={{ backgroundColor: student.avatarBg }}>
                      <Feather name="user" size={isTablet ? 24 : 20} color="#62A9E6" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-xl' : 'text-base'}`}>
                          {student.name}
                        </Text>
                        {student.pendingCount > 0 && (
                          <View className="bg-[#EA580C] px-2 py-0.5 rounded-full flex-row items-center gap-1">
                            <Text className={`font-quicksand-bold text-white ${isTablet ? 'text-xs' : 'text-[10px]'}`}>{student.pendingCount} to validate</Text>
                          </View>
                        )}
                      </View>
                      <Text className={`font-quicksand-medium text-[#6B7280] mt-0.5 ${isTablet ? 'text-base' : 'text-xs'}`}>
                        Focus: {student.focusScore} • {student.behavior}
                      </Text>
                    </View>
                  </View>

                  {/* Mini Progress Indicator */}
                  <View className="items-end ml-3 w-28">
                    <Text className={`font-quicksand-bold text-[#4B5563] mb-1 ${isTablet ? 'text-base' : 'text-sm'}`}>{student.overallProgress}% Overall</Text>
                    <View className="w-full h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <View className="h-full rounded-full" style={{ width: `${student.overallProgress}%`, backgroundColor: student.statusColor }} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  // ==========================================
  // RENDER 3: STUDENT-LEVEL VIEW
  // ==========================================
  const renderStudentView = () => {
    if (!currentStudent) return null;

    // [ADDED] TARGET A: Dynamic Skills Math (Roll-up Strategy)
    // This dynamically calculates progress for each master domain based on completed sessions
    const dynamicSkillsProgress = MASTER_DOMAINS.map(domain => {
      // Find completed sessions (validated or pending) that match any subSkill in this master domain
      const relevantSessions = studentSessions.filter(s =>
        (s.status === 'validated' || s.status === 'pending') &&
        Array.isArray(s.skill_domain) &&
        s.skill_domain.some(tag =>
          domain.subSkills.some(sub => sub.trim().toLowerCase() === tag.trim().toLowerCase())
        )
      );

      let progress = 0;
      if (relevantSessions.length > 0) {
        const scores = relevantSessions.map(s => parseInt(s.score.replace('%', '')) || 0);
        progress = Math.round(scores.reduce((a, b) => a + b, 0) / relevantSessions.length);
      }

      return {
        ...domain,
        sessionCount: relevantSessions.length,
        progress,
        relevantSessions
      };
    });

    const dynamicSkills = dynamicSkillsProgress;

    return (
      <View className="w-full">
        {/* BACK BUTTON */}
        <View className={isTablet ? 'px-12 mt-4' : 'px-6 mt-3'}>
          <TouchableOpacity
            onPress={() => {
              setExpandedDomain(null);
              setCurrentView('class');
            }}
            className="flex-row items-center bg-[#EBF5FF] self-start px-4 py-2 rounded-full border border-[#A3CFF1] mb-4"
          >
            <Feather name="arrow-left" size={isTablet ? 18 : 16} color="#62A9E6" />
            <Text className={`font-quicksand-bold text-[#62A9E6] ml-1.5 ${isTablet ? 'text-base' : 'text-xs'}`}>Back to {currentClass.name}</Text>
          </TouchableOpacity>

          {/* STUDENT HEADER CARD */}
          <View className="bg-white p-5 rounded-2xl border-[2px] border-[#A3CFF1] shadow-sm mb-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View className="w-16 h-16 rounded-full bg-[#EBF5FF] items-center justify-center border-[2px] border-[#62A9E6]">
                  <Feather name="user" size={isTablet ? 36 : 30} color="#62A9E6" />
                </View>
                <View>
                  <View className="flex-row items-center gap-2">
                    <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
                      {currentStudent.name}
                    </Text>
                    {currentStudent.pendingCount > 0 && (
                      <View className="bg-[#F87171] px-2.5 py-0.5 rounded-full">
                        <Text className={`font-quicksand-bold text-white ${isTablet ? 'text-xs' : 'text-[11px]'}`}>{currentStudent.pendingCount} Pending Reviews</Text>
                      </View>
                    )}
                  </View>
                  <Text className={`font-quicksand-medium text-[#6B7280] ${isTablet ? 'text-base' : 'text-sm'}`}>
                    Class: {currentClass.name}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: currentStudent.statusColor }} />
                    <Text className={`font-quicksand-bold text-[#4B5563] uppercase ${isTablet ? 'text-sm' : 'text-xs'}`}>{currentStudent.behavior}</Text>
                  </View>
                </View>
              </View>

              <View className="items-end">
                <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-3xl'}`}>{currentStudent.overallProgress}%</Text>
                <Text className={`font-quicksand-semibold text-[#9CA3AF] ${isTablet ? 'text-sm' : 'text-xs'}`}>DEVELOPMENT INDEX</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SKILL DEVELOPMENT REPORTS */}
        <View className={isTablet ? 'px-12 mb-6' : 'px-6 mb-6'}>
          <Text className={`font-fredoka-one text-[#4B5563] mb-1 ${isTablet ? 'text-2xl' : 'text-lg'}`}>
            Skill Development Reports
          </Text>
          <Text className={`font-quicksand-medium text-[#6B7280] mb-3 ${isTablet ? 'text-base' : 'text-sm'}`}>
            Progress calculated automatically from validated game sessions.
          </Text>

          <View className="bg-white rounded-2xl border border-[#E5E7EB] p-5 gap-5 shadow-sm">
            {dynamicSkills.map((skill, idx) => {
              const isExpanded = expandedDomain === skill.name;
              return (
                <View key={idx} className="w-full">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setExpandedDomain(isExpanded ? null : skill.name)}
                    className="w-full"
                  >
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-base' : 'text-sm'}`}>{skill.name}</Text>
                      <View className="flex-row items-center gap-2">
                        <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-base' : 'text-sm'}`}>{skill.progress}%</Text>
                        <Feather
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={isTablet ? 18 : 16}
                          color="#6B7280"
                        />
                      </View>
                    </View>
                    <Text className={`font-quicksand-medium text-[#9CA3AF] mb-2 ${isTablet ? 'text-sm' : 'text-xs'}`}>{skill.description}</Text>
                    <View className="w-full h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <View className="h-full rounded-full" style={{ width: `${skill.progress}%`, backgroundColor: skill.color }} />
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View
                      className="mt-3 ml-2 pl-3.5 py-3 pr-3 rounded-r-xl border-l-[4px] gap-3 bg-[#F8FAFC]"
                      style={{ borderColor: skill.color }}
                    >
                      {skill.subSkills.map((subskill, subIdx) => {
                        const subSessions = (skill.relevantSessions || []).filter(s =>
                          Array.isArray(s.skill_domain) && (
                            s.skill_domain.includes(subskill) ||
                            s.skill_domain.some(tag => tag.trim().toLowerCase() === subskill.trim().toLowerCase())
                          )
                        );
                        const sessionCount = subSessions.length;
                        let subTotalScore = 0;
                        if (sessionCount > 0) {
                          const scores = subSessions.map(s => parseInt(s.score.replace('%', '')) || 0);
                          subTotalScore = scores.reduce((a, b) => a + b, 0);
                        }
                        const subMasteryPercentage = sessionCount > 0
                          ? Math.round(subTotalScore / sessionCount)
                          : 0;

                        return (
                          <View key={subIdx} className="w-full">
                            <View className="flex-row justify-between items-center mb-1">
                              <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-sm' : 'text-xs'}`}>
                                {subskill}
                              </Text>
                              <View className="flex-row items-center gap-1.5">
                                <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-xs' : 'text-[10px]'}`}>
                                  ({sessionCount} {sessionCount === 1 ? 'session' : 'sessions'})
                                </Text>
                                <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-sm' : 'text-xs'}`}>
                                  {subMasteryPercentage}%
                                </Text>
                              </View>
                            </View>
                            <View className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                              <View
                                className="h-full rounded-full"
                                style={{ width: `${subMasteryPercentage}%`, backgroundColor: skill.color }}
                              />
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* DEVELOPMENT TRACKING & MILESTONES */}
        <View className={isTablet ? 'px-12 mb-6' : 'px-6 mb-6'}>
          <View className="flex-row justify-between items-center mb-3">
            <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-2xl' : 'text-lg'}`}>
              Milestone Tracking
            </Text>
            {/* [ADDED THIS BUTTON] */}
            <TouchableOpacity onPress={() => setMilestoneModalVisible(true)} className="flex-row items-center gap-1">
              <Text className={`font-quicksand-medium text-[#62A9E6] ${isTablet ? 'text-sm' : 'text-xs'}`}>Add Milestone</Text>
              <Feather name="plus-circle" size={20} color="#62A9E6" />
            </TouchableOpacity>
          </View>

          {studentMilestones.length === 0 ? (
            <View className="bg-white p-6 rounded-xl border border-[#E5E7EB] items-center justify-center">
              <Text className="font-quicksand-medium text-sm text-[#9CA3AF]">No milestones set for this learner yet.</Text>
            </View>
          ) : (
            <View className="gap-3">
              {studentMilestones.map((milestone) => (
                <View key={milestone.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex-row items-start justify-between shadow-sm">
                  <View className="flex-row items-start gap-3 flex-1 mr-2">
                    <View className={`w-6 h-6 rounded-full items-center justify-center mt-0.5 ${milestone.status === 'Achieved' ? 'bg-[#DCFCE7]' : milestone.status === 'In Progress' ? 'bg-[#FEF9C3]' : 'bg-[#F3F4F6]'
                      }`}>
                      <Ionicons
                        name={milestone.status === 'Achieved' ? 'checkmark' : milestone.status === 'In Progress' ? 'refresh' : 'flag-outline'}
                        size={isTablet ? 16 : 14}
                        color={milestone.status === 'Achieved' ? '#16A34A' : milestone.status === 'In Progress' ? '#CA8A04' : '#6B7280'}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-base' : 'text-sm'}`}>{milestone.title}</Text>
                      <Text className={`font-quicksand-medium text-[#9CA3AF] mt-0.5 ${isTablet ? 'text-sm' : 'text-xs'}`}>{milestone.date}</Text>
                    </View>
                  </View>

                  {/* [ADDED] Interactive Status Button & Delete Button */}
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleToggleMilestone(milestone.id, milestone.status)}
                      className={`px-3 py-1.5 rounded-full ${milestone.status === 'Achieved' ? 'bg-[#DCFCE7]' : milestone.status === 'In Progress' ? 'bg-[#FEF9C3]' : 'bg-[#F3F4F6]'
                        }`}
                    >
                      <Text className={`font-quicksand-bold uppercase ${isTablet ? 'text-xs' : 'text-[10px]'} ${milestone.status === 'Achieved' ? 'text-[#16A34A]' : milestone.status === 'In Progress' ? 'text-[#CA8A04]' : 'text-[#6B7280]'
                        }`}>
                        {milestone.status}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleDeleteMilestone(milestone.id)}
                      className="p-1.5 rounded-full bg-[#FEF2F2] border border-[#FEE2E2]"
                    >
                      <Feather name="trash-2" size={isTablet ? 16 : 14} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* SESSION RECORDS (PROGRESS VALIDATION LINKED) */}
        <View className={isTablet ? 'px-12 mb-4' : 'px-6 mb-4'}>
          <View className="flex-row justify-between items-center mb-1">
            <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-2xl' : 'text-lg'}`}>
              Completed Activities & Sessions
            </Text>
            <Text className={`font-quicksand-medium text-[#6B7280] ${isTablet ? 'text-base' : 'text-xs'}`}>
              {studentSessions.length} Total Records
            </Text>
          </View>
          <Text className={`font-quicksand-medium text-[#EA580C] mb-3 ${isTablet ? 'text-base' : 'text-sm'}`}>
            Validate pending sessions below to publish updates directly to the Parent Portal.
          </Text>

          <View className="gap-3">
            {studentSessions.map((session) => (
              <View
                key={session.id}
                className={`bg-white rounded-2xl border-[1.5px] p-4 shadow-sm ${session.status === 'pending' ? 'border-[#FDBA74] bg-[#FFFBF5]' : 'border-[#E5E7EB]'
                  }`}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 mr-2">
                    <View className="flex-row items-center gap-2">
                      <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-lg' : 'text-base'}`}>{session.activityName}</Text>
                    </View>
                    <Text className={`font-quicksand-semibold text-[#6B7280] mt-0.5 ${isTablet ? 'text-sm' : 'text-xs'}`}>
                      Category: {session.category} • Duration: {session.duration}
                    </Text>
                    <Text className={`font-quicksand-medium text-[#9CA3AF] mt-0.5 ${isTablet ? 'text-sm' : 'text-xs'}`}>{session.date}</Text>
                  </View>

                  <View className="items-end">
                    <Text className={`font-quicksand-bold text-[#62A9E6] ${isTablet ? 'text-xl' : 'text-lg'}`}>{session.score}</Text>
                    <Text className={`font-quicksand-medium text-[#9CA3AF] uppercase ${isTablet ? 'text-xs' : 'text-[10px]'}`}>Activity Score</Text>
                  </View>
                </View>

                {/* Validation Status / Action Bar */}
                <View className="border-t border-[#F3F4F6] pt-3 mt-1 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    <View className={`w-2 h-2 rounded-full ${session.status === 'validated' ? 'bg-[#10B981]' : 'bg-[#EA580C]'}`} />
                    <Text className={`font-quicksand-bold uppercase ${session.status === 'validated' ? 'text-[#10B981]' : 'text-[#EA580C]'} ${isTablet ? 'text-sm' : 'text-xs'}`}>
                      {session.status === 'validated' ? 'Validated & Synced' : 'Pending Teacher Review'}
                    </Text>
                  </View>

                  {session.status === 'pending' ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleValidateSession(session, currentClass.id)}
                      className="bg-[#EA580C] px-3.5 py-1.5 rounded-full flex-row items-center gap-1 shadow-sm"
                    >
                      <Feather name="check" size={13} color="white" />
                      <Text className={`font-quicksand-bold text-white ${isTablet ? 'text-sm' : 'text-xs'}`}>Validate Progress</Text>
                    </TouchableOpacity>
                  ) : (
                    <View className="bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#D1FAE5]">
                      <Text className={`font-quicksand-semibold text-[#047857] ${isTablet ? 'text-xs' : 'text-[11px]'}`}>Visible to Parent</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}

            {studentSessions.length === 0 && (
              <View className="bg-white p-6 rounded-xl border border-[#E5E7EB] items-center justify-center">
                <Text className="font-quicksand-medium text-sm text-[#9CA3AF]">No recorded sessions for this learner yet.</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: isTablet ? 50 : 30 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* HEADER TITLE */}
        <View className={`w-full flex-row justify-between items-center ${isTablet ? 'px-12 pt-6' : 'px-6 pt-5'}`}>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl mb-2' : 'text-2xl mb-1'}`}>
                {currentView === 'overview' ? 'Analytics Dashboard' : currentView === 'class' ? 'Class Inspector' : 'Learner Report'}
              </Text>
              {totalPendingAllClasses > 0 && currentView === 'overview' && (
                <View className="bg-[#F87171] px-2.5 py-1 rounded-full flex-row items-center gap-1 shadow-sm">
                  <Feather name="bell" size={isTablet ? 14 : 11} color="white" />
                  <Text className={`font-quicksand-bold text-white ${isTablet ? 'text-sm' : 'text-xs'}`}>{totalPendingAllClasses} Pending Review</Text>
                </View>
              )}
            </View>
            <Text className={`font-quicksand-medium text-[#9CA3AF] mt-0.5 ${isTablet ? 'text-lg' : 'text-sm'}`}>
              {currentView === 'overview'
                ? 'Select a class overview card below to inspect performance'
                : currentView === 'class'
                  ? `Reviewing aggregate statistics for ${currentClass?.name}`
                  : `Individual development breakdown for ${currentStudent?.name}`}
            </Text>
          </View>
        </View>

        {/* DYNAMIC VIEW SWITCHER */}
        {currentView === 'overview' && renderOverview()}
        {currentView === 'class' && renderClassView()}
        {currentView === 'student' && renderStudentView()}

        <Modal visible={isMilestoneModalVisible} transparent animationType="fade">
          <View className="flex-1 justify-center bg-black/50 p-6">
            <View className="bg-white w-full max-w-lg rounded-[24px] border-[3px] border-[#D5D0D2] border-b-[6px] p-6 shadow-xl self-center">
              <Text className="font-fredoka-one text-2xl text-[#4B5563] mb-4 border-b border-[#F3F4F6] pb-3">Set New Milestone</Text>

              <Text className="font-quicksand-bold text-[#4B5563] text-sm mb-1.5">Milestone Title</Text>
              <TextInput
                placeholder="Milestone Title"
                placeholderTextColor="#9CA3AF"
                className="w-full h-12 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 text-base text-[#4B5563] mb-4"
                value={newMilestoneTitle}
                onChangeText={setNewMilestoneTitle}
              />

              <Text className="font-quicksand-bold text-[#4B5563] text-sm mb-1.5">Target Date</Text>
              <TextInput
                placeholder="Target Date (e.g. Aug 01, 2026)"
                placeholderTextColor="#9CA3AF"
                className="w-full h-12 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 text-base text-[#4B5563] mb-6"
                value={newMilestoneDate}
                onChangeText={setNewMilestoneDate}
              />

              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setMilestoneModalVisible(false)}
                  className={`flex-1 rounded-xl bg-[#F3F4F6] border-b-[3px] border-[#D1D5DB] justify-center items-center ${isTablet ? 'h-16' : 'h-14'}`}
                >
                  <Text className="font-quicksand-bold text-[#6B7280] text-base">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    if (!currentStudent) {
                      Alert.alert("Error", "No learner selected.");
                      return;
                    }
                    if (!newMilestoneTitle.trim() || !newMilestoneDate.trim()) {
                      Alert.alert("Error", "Please fill in all fields.");
                      return;
                    }
                    try {
                      await createMilestone(currentStudent.id, newMilestoneTitle, newMilestoneDate);
                      setMilestoneModalVisible(false);
                      setNewMilestoneTitle('');
                      setNewMilestoneDate('');
                      await fetchDashboardData();
                    } catch (error: any) {
                      Alert.alert("Error", error.message || "Failed to create milestone.");
                    }
                  }}
                  className={`flex-1 rounded-xl bg-[#62A9E6] border-b-[3px] border-[#5298D4] justify-center items-center ${isTablet ? 'h-16' : 'h-14'}`}
                >
                  <Text className="font-quicksand-bold text-white text-base">Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <FeedbackModal
          visible={!!activeModalSession}
          sessionId={activeModalSession?.id || null}
          activityTitle={activeModalSession?.activityName}
          studentName={currentStudent?.name}
          onClose={() => setActiveModalSession(null)}
          onSuccess={handleValidationSuccess}
        />
      </ScrollView>
    </SafeAreaView>
  );
}