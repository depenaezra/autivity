import { supabase } from '../lib/supabase';
import { formatActivityTitle } from '../utils/format';

export type ActivityTypeFilter = 'all' | 'app' | 'classroom';

export interface KpiData {
  pendingEvaluations: number;
  totalStudents: number;
  totalClasses: number;
  completedSessions: number;
  totalSessions: number;
  evaluatedSessions: number;
  evaluatedPercentage: number;
}

export const getKpiData = async (activityType: ActivityTypeFilter = 'all'): Promise<KpiData> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  let pendingQuery = supabase
    .from('student_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', user.id)
    .eq('status', 'pending');

  let totalSessionsQuery = supabase
    .from('student_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', user.id);

  let evaluatedQuery = supabase
    .from('student_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', user.id)
    .neq('status', 'pending');

  if (activityType !== 'all') {
    pendingQuery = pendingQuery.eq('activity_type', activityType);
    totalSessionsQuery = totalSessionsQuery.eq('activity_type', activityType);
    evaluatedQuery = evaluatedQuery.eq('activity_type', activityType);
  }

  const [
    pendingRes,
    studentsRes,
    classesRes,
    totalSessionsRes,
    evaluatedRes
  ] = await Promise.all([
    pendingQuery,
    supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', user.id),
    supabase
      .from('classes')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', user.id),
    totalSessionsQuery,
    evaluatedQuery,
  ]);

  if (pendingRes.error) throw new Error(pendingRes.error.message);
  if (studentsRes.error) throw new Error(studentsRes.error.message);
  if (classesRes.error) throw new Error(classesRes.error.message);
  if (totalSessionsRes.error) throw new Error(totalSessionsRes.error.message);
  if (evaluatedRes.error) throw new Error(evaluatedRes.error.message);

  const totalSessions = totalSessionsRes.count ?? 0;
  const pendingEvaluations = pendingRes.count ?? 0;
  const evaluatedSessions = evaluatedRes.count ?? Math.max(0, totalSessions - pendingEvaluations);
  const evaluatedPercentage = totalSessions > 0 ? Math.round((evaluatedSessions / totalSessions) * 100) : 100;

  return {
    pendingEvaluations,
    totalStudents: studentsRes.count ?? 0,
    totalClasses: classesRes.count ?? 0,
    completedSessions: totalSessions,
    totalSessions,
    evaluatedSessions,
    evaluatedPercentage,
  };
};

export const getDraftKpiData = getKpiData;

export interface ClassPerformanceData {
  id: string;
  title: string;
  grade: string;
  schedule: string;
  theme: string;
  studentsCount: number;
  completedSessions: number;
  pendingEvaluations: number;
  evaluatedPercentage: number;
  isArchived: boolean;
}

export const getClassPerformance = async (
  includeArchived: boolean = false,
  activityType: ActivityTypeFilter = 'all'
): Promise<ClassPerformanceData[]> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  let classesQuery = supabase.from('classes').select('*').eq('teacher_id', user.id).order('created_at', { ascending: true });
  if (!includeArchived) {
    classesQuery = classesQuery.eq('is_archived', false);
  }

  let sessionsQuery = supabase.from('student_sessions').select('id, class_id, status, activity_type').eq('teacher_id', user.id);
  if (activityType !== 'all') {
    sessionsQuery = sessionsQuery.eq('activity_type', activityType);
  }

  const [classesRes, studentsRes, sessionsRes] = await Promise.all([
    classesQuery,
    supabase.from('students').select('id, class_id').eq('teacher_id', user.id),
    sessionsQuery,
  ]);

  if (classesRes.error) throw new Error(classesRes.error.message);
  if (studentsRes.error) throw new Error(studentsRes.error.message);
  if (sessionsRes.error) throw new Error(sessionsRes.error.message);

  const classes = classesRes.data || [];
  const students = studentsRes.data || [];
  const sessions = sessionsRes.data || [];

  return classes.map((cls: any) => {
    const classStudents = students.filter((s) => s.class_id === cls.id);
    const classSessions = sessions.filter((s) => s.class_id === cls.id);

    const completed = classSessions.length;
    const pending = classSessions.filter((s) => s.status === 'pending').length;
    const evaluated = Math.max(0, completed - pending);
    const evaluatedPercentage = completed > 0 ? Math.round((evaluated / completed) * 100) : 0;

    return {
      id: cls.id,
      title: cls.title,
      grade: cls.grade,
      schedule: cls.schedule || '',
      theme: cls.theme || cls.theme_name || 'green',
      studentsCount: classStudents.length,
      completedSessions: completed,
      pendingEvaluations: pending,
      evaluatedPercentage,
      isArchived: !!cls.is_archived,
    };
  });
};

export const getDraftClassPerformance = getClassPerformance;

export interface RecentActivityData {
  id: string;
  studentId: string;
  activityTitle: string;
  createdAt: string;
  studentName: string;
  category: string;
  activityType: 'app' | 'classroom';
  status: 'pending' | 'validated';
  validatedAt: string | null;
  rubricEvaluation?: any;
  teacherFeedback?: string;
}

export const getRecentActivity = async (
  filter: 'today' | 'week' | 'month',
  activityType: ActivityTypeFilter = 'all'
): Promise<RecentActivityData[]> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  const now = new Date();
  let thresholdDate = new Date();

  if (filter === 'today') {
    thresholdDate.setHours(0, 0, 0, 0);
  } else if (filter === 'week') {
    thresholdDate.setDate(now.getDate() - 7);
  } else if (filter === 'month') {
    thresholdDate.setDate(now.getDate() - 30);
  }

  const thresholdISO = thresholdDate.toISOString();

  let sessionsQuery = supabase
    .from('student_sessions')
    .select('*')
    .eq('teacher_id', user.id)
    .gte('created_at', thresholdISO)
    .order('created_at', { ascending: false });

  if (activityType !== 'all') {
    sessionsQuery = sessionsQuery.eq('activity_type', activityType);
  }

  const [sessionsRes, studentsRes] = await Promise.all([
    sessionsQuery,
    supabase
      .from('students')
      .select('id, name')
      .eq('teacher_id', user.id),
  ]);

  if (sessionsRes.error) throw new Error(sessionsRes.error.message);
  if (studentsRes.error) throw new Error(studentsRes.error.message);

  const sessions = sessionsRes.data || [];
  const students = studentsRes.data || [];

  const studentNameMap = students.reduce((acc, s) => {
    acc[s.id] = s.name;
    return acc;
  }, {} as Record<string, string>);

  return sessions.map((s: any) => ({
    id: s.id,
    studentId: s.student_id,
    activityTitle: (() => {
      if (s.title && s.title.trim()) {
        return s.title.trim();
      }
      if (Array.isArray(s.activity_path)) {
        return s.activity_path.length > 0
          ? s.activity_path.map((path: string) => formatActivityTitle(path)).join(', ')
          : (s.category || 'Classroom Activity');
      }
      if (typeof s.activity_path === 'string' && s.activity_path.trim()) {
        return formatActivityTitle(s.activity_path);
      }
      return s.category || 'Classroom Activity';
    })(),
    createdAt: s.created_at,
    studentName: studentNameMap[s.student_id] || 'Unknown Student',
    category: s.category || 'General',
    activityType: (s.activity_type || 'app') as 'app' | 'classroom',
    status: s.status as 'pending' | 'validated',
    validatedAt: s.validated_at || null,
    rubricEvaluation: s.rubric_evaluation || null,
    teacherFeedback: s.teacher_feedback || '',
  }));
};

export const getDraftRecentActivity = getRecentActivity;

export interface SessionEvaluationDetails {
  id: string;
  studentName: string;
  category: string;
  status: 'pending' | 'validated';
  rubricEvaluation: any;
  teacherFeedback: string | null;
  validatedAt: string | null;
}

export const getSessionEvaluation = async (sessionId: string): Promise<SessionEvaluationDetails> => {
  const { data: session, error: sessionError } = await supabase
    .from('student_sessions')
    .select('id, status, rubric_evaluation, teacher_feedback, validated_at, category, student_id')
    .eq('id', sessionId)
    .single();

  if (sessionError) throw new Error(sessionError.message);
  if (!session) throw new Error('Session not found');

  let studentName = 'Unknown Student';
  if (session.student_id) {
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('name')
      .eq('id', session.student_id)
      .single();
    if (!studentError && student) {
      studentName = student.name;
    }
  }

  return {
    id: session.id,
    studentName,
    category: session.category || 'General',
    status: session.status as 'pending' | 'validated',
    rubricEvaluation: session.rubric_evaluation,
    teacherFeedback: session.teacher_feedback,
    validatedAt: session.validated_at,
  };
};
