import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ClassView from '../../components/analytics/ClassView';
import OverviewView from '../../components/analytics/OverviewView';
import StudentView from '../../components/analytics/StudentView';

// import services
import FeedbackModal from '../../components/feedback-modal';
import { createMilestone, deleteMilestone, getTeacherAnalyticsOverview, updateMilestoneStatus } from '../../src/services/analytics';
import { formatActivityTitle } from '../../src/utils/format';

// color themes
const THEME_MAP: Record<string, { themeColor: string; shadowColor: string; lightBg: string }> = {
  green: { themeColor: '#86EFAC', shadowColor: '#4ADE80', lightBg: '#F0FDF4' },
  orange: { themeColor: '#FDBA74', shadowColor: '#FB923C', lightBg: '#FFF7ED' },
  yellow: { themeColor: '#FDE047', shadowColor: '#FACC15', lightBg: '#FEF9C3' },
  blue: { themeColor: '#93C5FD', shadowColor: '#60A5FA', lightBg: '#EFF6FF' },
};

export const MASTER_DOMAINS = [
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

export interface ClassInfo {
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

export interface StudentInfo {
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

export interface Milestone {
  id: string;
  studentId: string;
  title: string;
  status: 'Achieved' | 'In Progress' | 'Target Set';
  date: string;
}

export interface SessionRecord {
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

  // navigation states  
  const [currentView, setCurrentView] = useState<'overview' | 'class' | 'student'>('overview');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // dynamic data states
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

  // fetch and process data
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const data = await getTeacherAnalyticsOverview();

      // process sessions
      const processedSessions: SessionRecord[] = data.sessions.map((s: any) => ({
        id: s.id,
        studentId: s.student_id,
        activityName: (() => {
          if (Array.isArray(s.activity_path)) {
            return s.activity_path.length > 0
              ? formatActivityTitle(s.activity_path[0])
              : 'Unknown Activity';
          }
          if (typeof s.activity_path === 'string') {
            return formatActivityTitle(s.activity_path);
          }
          return 'Unknown Activity';
        })(),
        category: s.category || 'General',
        skill_domain: (() => {
          if (Array.isArray(s.skill_domain)) return s.skill_domain;

          if (typeof s.skill_domain === 'string') {
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

      // process milestones
      const processedMilestones: Milestone[] = data.milestones.map((m: any) => ({
        id: m.id,
        studentId: m.student_id,
        title: m.title,
        status: m.status as any,
        date: m.target_date || new Date(m.created_at).toLocaleDateString()
      }));
      setMilestones(processedMilestones);

      // process students
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

      // process classes
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

  // actions
  const handleSelectClass = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedStudentId(null);

    setCurrentView('class');
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);

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

  // toggle milestone logic
  const handleToggleMilestone = async (milestoneId: string, currentStatus: string) => {
    const statusCycle: any = {
      'Target Set': 'In Progress',
      'In Progress': 'Achieved',
      'Achieved': 'Target Set'
    };
    const nextStatus = statusCycle[currentStatus];

    try {
      setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, status: nextStatus } : m));
      await updateMilestoneStatus(milestoneId, nextStatus);
    } catch (error: any) {
      Alert.alert("Error", "Failed to update milestone status.");
      fetchDashboardData();
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
              setMilestones(prev => prev.filter(m => m.id !== milestoneId));
              await deleteMilestone(milestoneId);
            } catch (error: any) {
              Alert.alert("Error", "Failed to delete milestone.");
              fetchDashboardData();
            }
          }
        }
      ]
    );
  };

  // helpers
  const currentClass = classesData.find(c => c.id === selectedClassId) || classesData[0];
  const classStudents = (studentsData || []).filter(s => s.classId === currentClass?.id);
  const currentStudent = (studentsData || []).find(s => s.id === selectedStudentId) || classStudents[0] || studentsData[0];

  const studentSessions = (sessions || []).filter(s => s.studentId === currentStudent?.id);
  const studentMilestones = (milestones || []).filter(m => m.studentId === currentStudent?.id);

  const totalPendingAllClasses = classesData.reduce((sum, c) => sum + c.pendingFeedback, 0);

  // loading check
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F8FA] justify-center items-center">
        <ActivityIndicator size="large" color="#62A9E6" />
        <Text className="mt-4 font-quicksand-bold text-[#6B7280]">Loading Analytics...</Text>
      </SafeAreaView>
    );
  }

  // main layout
  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: isTablet ? 50 : 30 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* header */}
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

        {/* view switcher */}
        {currentView === 'overview' && (
          <OverviewView
            classesData={classesData}
            totalPendingAllClasses={totalPendingAllClasses}
            isTablet={isTablet}
            onSelectClass={handleSelectClass}
          />
        )}
        {currentView === 'class' && (
          <ClassView
            currentClass={currentClass}
            classStudents={classStudents}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            isTablet={isTablet}
            onBack={() => setCurrentView('overview')}
            onSelectStudent={handleSelectStudent}
          />
        )}
        {currentView === 'student' && (
          <StudentView
            currentStudent={currentStudent}
            studentSessions={studentSessions}
            studentMilestones={studentMilestones}
            currentClass={currentClass}
            isTablet={isTablet}
            onBack={() => setCurrentView('class')}
            onAddMilestone={() => setMilestoneModalVisible(true)}
            onToggleMilestone={handleToggleMilestone}
            onDeleteMilestone={handleDeleteMilestone}
            onValidateSession={handleValidateSession}
          />
        )}

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