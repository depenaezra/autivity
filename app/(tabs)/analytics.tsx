import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

interface SkillDomain {
  name: string;
  progress: number;
  color: string;
  description: string;
}

interface Milestone {
  id: string;
  title: string;
  status: 'Achieved' | 'In Progress' | 'Target Set';
  date: string;
}

interface SessionRecord {
  id: string;
  studentId: string;
  activityName: string;
  category: string;
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

  // --- MOCK DATA FOR CLASSES ---
  const [classesData, setClassesData] = useState<ClassInfo[]>([
    {
      id: 'c1',
      name: 'Autism Readiness A',
      level: 'Early Intervention • Level 1',
      totalStudents: 4,
      avgProgress: 88,
      completedActivities: 42,
      pendingFeedback: 3,
      themeColor: '#86EFAC',
      shadowColor: '#86EFAC',
      lightBg: '#F0FDF4',
    },
    {
      id: 'c2',
      name: 'Communication Basics B',
      level: 'Verbal & AAC • Level 2',
      totalStudents: 3,
      avgProgress: 75,
      completedActivities: 28,
      pendingFeedback: 1,
      themeColor: '#FDBA74',
      shadowColor: '#FDBA74',
      lightBg: '#FFF7ED',
    },
    {
      id: 'c3',
      name: 'Social & Sensory C',
      level: 'Social Interaction • Level 3',
      totalStudents: 5,
      avgProgress: 91,
      completedActivities: 55,
      pendingFeedback: 2,
      themeColor: '#FDE047',
      shadowColor: '#FDE047',
      lightBg: '#FEF9C3',
    },
  ]);

  // --- MOCK DATA FOR STUDENTS ---
  const [studentsData, setStudentsData] = useState<StudentInfo[]>([
    { id: 's1', classId: 'c1', name: 'Liam Carter', age: 7, focusScore: '92%', overallProgress: 89, pendingCount: 2, statusColor: '#86EFAC', avatarBg: '#EBF5FF', behavior: 'Consistently Engaged' },
    { id: 's2', classId: 'c1', name: 'Sophia Smith', age: 6, focusScore: '85%', overallProgress: 84, pendingCount: 1, statusColor: '#93C5FD', avatarBg: '#FEF9C3', behavior: 'Good Transitions' },
    { id: 's3', classId: 'c1', name: 'Noah Miller', age: 8, focusScore: '78%', overallProgress: 76, pendingCount: 0, statusColor: '#FDE047', avatarBg: '#F0FDF4', behavior: 'Needs Sensory Breaks' },
    { id: 's4', classId: 'c1', name: 'Emma Davis', age: 6, focusScore: '95%', overallProgress: 94, pendingCount: 0, statusColor: '#86EFAC', avatarBg: '#FCE7F3', behavior: 'High Focus Level' },
    // Class 2 & 3 learners
    { id: 's5', classId: 'c2', name: 'Oliver Brown', age: 7, focusScore: '71%', overallProgress: 72, pendingCount: 1, statusColor: '#FDE047', avatarBg: '#EBF5FF', behavior: 'AAC Practicing' },
    { id: 's6', classId: 'c2', name: 'Ava Wilson', age: 8, focusScore: '80%', overallProgress: 78, pendingCount: 0, statusColor: '#93C5FD', avatarBg: '#FCE7F3', behavior: 'Vocalizing Words' },
    { id: 's7', classId: 'c3', name: 'Lucas Taylor', age: 9, focusScore: '94%', overallProgress: 92, pendingCount: 2, statusColor: '#86EFAC', avatarBg: '#FEF9C3', behavior: 'Peer Helper' },
  ]);

  // --- MOCK SKILL REPORT FOR AUTISM DEVELOPMENT ---
  const skillDomains: SkillDomain[] = [
    { name: 'Sensory Regulation', progress: 90, color: '#A7F3D0', description: 'Auditory tolerance & calm task transitions' },
    { name: 'Cognitive & Sorting', progress: 88, color: '#93C5FD', description: 'Pattern recognition, shape/color matching' },
    { name: 'Motor Skills (Fine & Gross)', progress: 85, color: '#FDE047', description: 'Pencil grip, tracing precision & posture' },
    { name: 'Communication & AAC', progress: 78, color: '#FCA5A5', description: 'PECS card exchange & spontaneous requests' },
    { name: 'Social & Turn-Taking', progress: 82, color: '#C084FC', description: 'Joint attention & shared play activities' },
  ];

  // --- MOCK MILESTONES ---
  const milestones: Milestone[] = [
    { id: 'm1', title: 'Independently initiates PECS communication card exchange', status: 'Achieved', date: 'Jul 10, 2026' },
    { id: 'm2', title: 'Transitions from play to desk work with single verbal prompt', status: 'Achieved', date: 'Jul 12, 2026' },
    { id: 'm3', title: 'Completes 10-minute tracing activity without redirection', status: 'In Progress', date: 'Target: Jul 20, 2026' },
    { id: 'm4', title: 'Participates in group circle time for full 15 minutes', status: 'Target Set', date: 'Target: Aug 01, 2026' },
  ];

  // --- MOCK SESSION RECORDS ---
  const [sessions, setSessions] = useState<SessionRecord[]>([
    { id: 'ses-1', studentId: 's1', activityName: 'Vowel Tracing & Vocalization', category: 'Motor Skills', date: 'Today, 10:30 AM', duration: '14 mins', score: '10/10', status: 'pending' },
    { id: 'ses-2', studentId: 's1', activityName: 'Sensory Bin Emotion Sorting', category: 'Sensory & Cognitive', date: 'Today, 09:15 AM', duration: '18 mins', score: '8/10', status: 'pending' },
    { id: 'ses-3', studentId: 's1', activityName: 'PECS Request Builder', category: 'Communication', date: 'Yesterday, 02:00 PM', duration: '20 mins', score: '9/10', status: 'validated' },
    { id: 'ses-4', studentId: 's2', activityName: 'Shape Matching Board', category: 'Cognitive', date: 'Today, 11:00 AM', duration: '12 mins', score: '10/10', status: 'pending' },
    { id: 'ses-5', studentId: 's5', activityName: 'AAC Device Greeting Practice', category: 'Communication', date: 'Today, 10:00 AM', duration: '15 mins', score: '7/10', status: 'pending' },
    { id: 'ses-6', studentId: 's7', activityName: 'Turn-Taking Ball Pass', category: 'Social Interaction', date: 'Today, 01:30 PM', duration: '22 mins', score: '10/10', status: 'pending' },
    { id: 'ses-7', studentId: 's7', activityName: 'Auditory Transition Chime', category: 'Sensory Regulation', date: 'Yesterday, 11:15 AM', duration: '10 mins', score: '9/10', status: 'pending' },
  ]);

  // --- ACTIONS ---
  const handleSelectClass = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedStudentId(null);
    setCurrentView('class');
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentView('student');
  };

  const handleValidateSession = (sessionId: string, studentId: string, classId: string) => {
    // Update session status
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'validated' } : s));

    // Decrement pending count for student
    setStudentsData(prev => prev.map(st => {
      if (st.id === studentId && st.pendingCount > 0) {
        return { ...st, pendingCount: st.pendingCount - 1 };
      }
      return st;
    }));

    // Decrement pending count for class
    setClassesData(prev => prev.map(cl => {
      if (cl.id === classId && cl.pendingFeedback > 0) {
        return { ...cl, pendingFeedback: cl.pendingFeedback - 1 };
      }
      return cl;
    }));
  };

  // --- HELPERS ---
  const currentClass = classesData.find(c => c.id === selectedClassId) || classesData[0];
  const classStudents = studentsData.filter(s => s.classId === currentClass?.id);
  const currentStudent = studentsData.find(s => s.id === selectedStudentId) || classStudents[0] || studentsData[0];
  const studentSessions = sessions.filter(s => s.studentId === currentStudent?.id);
  const totalPendingAllClasses = classesData.reduce((sum, c) => sum + c.pendingFeedback, 0);

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
            <Text className={`font-quicksand-bold text-[#62A9E6] ${isTablet ? 'text-4xl' : 'text-xl'}`}>84.6%</Text>
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
      </View>
    </View>
  );

  // ==========================================
  // RENDER 2: CLASS-LEVEL VIEW
  // ==========================================
  const renderClassView = () => (
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
                {timeRange === 'daily' ? '+2.4% Daily Growth' : timeRange === 'weekly' ? '+6.8% Weekly Growth' : '+14.2% Monthly Gain'}
              </Text>
              <Text className={`font-quicksand-medium text-[#6B7280] ${isTablet ? 'text-base' : 'text-xs'}`}>
                High consistency across motor and sensory tasks
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
          Learners in {currentClass.name} (Tap to Drill Down)
        </Text>

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
                    Age {student.age} • Focus: {student.focusScore} • {student.behavior}
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
      </View>
    </View>
  );

  // ==========================================
  // RENDER 3: STUDENT-LEVEL VIEW
  // ==========================================
  const renderStudentView = () => (
    <View className="w-full">
      {/* BACK BUTTON */}
      <View className={isTablet ? 'px-12 mt-4' : 'px-6 mt-3'}>
        <TouchableOpacity
          onPress={() => setCurrentView('class')}
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
                  Age {currentStudent.age} • Class: {currentClass.name}
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
          Skill Development Reports (Autism Readiness)
        </Text>
        <Text className={`font-quicksand-medium text-[#6B7280] mb-3 ${isTablet ? 'text-base' : 'text-sm'}`}>
          Multi-domain tracking specialized for autism cognitive and motor needs
        </Text>

        <View className="bg-white rounded-2xl border border-[#E5E7EB] p-5 gap-5 shadow-sm">
          {skillDomains.map((skill, idx) => (
            <View key={idx} className="w-full">
              <View className="flex-row justify-between items-center mb-1">
                <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-base' : 'text-sm'}`}>{skill.name}</Text>
                <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-base' : 'text-sm'}`}>{skill.progress}%</Text>
              </View>
              <Text className={`font-quicksand-medium text-[#9CA3AF] mb-2 ${isTablet ? 'text-sm' : 'text-xs'}`}>{skill.description}</Text>
              <View className="w-full h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                <View className="h-full rounded-full" style={{ width: `${skill.progress}%`, backgroundColor: skill.color }} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* DEVELOPMENT TRACKING & MILESTONES */}
      <View className={isTablet ? 'px-12 mb-6' : 'px-6 mb-6'}>
        <Text className={`font-fredoka-one text-[#4B5563] mb-3 ${isTablet ? 'text-2xl' : 'text-lg'}`}>
          Milestone Tracking
        </Text>

        <View className="gap-3">
          {milestones.map((milestone) => (
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

              <View className={`px-2.5 py-1 rounded-full ${milestone.status === 'Achieved' ? 'bg-[#DCFCE7]' : milestone.status === 'In Progress' ? 'bg-[#FEF9C3]' : 'bg-[#F3F4F6]'
                }`}>
                <Text className={`font-quicksand-bold uppercase ${isTablet ? 'text-xs' : 'text-[10px]'} ${milestone.status === 'Achieved' ? 'text-[#16A34A]' : milestone.status === 'In Progress' ? 'text-[#CA8A04]' : 'text-[#6B7280]'
                  }`}>
                  {milestone.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
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
                    onPress={() => handleValidateSession(session.id, session.studentId, currentClass.id)}
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
                  ? `Reviewing aggregate statistics for ${currentClass.name}`
                  : `Individual development breakdown for ${currentStudent.name}`}
            </Text>
          </View>
        </View>

        {/* DYNAMIC VIEW SWITCHER */}
        {currentView === 'overview' && renderOverview()}
        {currentView === 'class' && renderClassView()}
        {currentView === 'student' && renderStudentView()}

      </ScrollView>
    </SafeAreaView>
  );
}
