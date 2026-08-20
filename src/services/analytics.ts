import { supabase } from '../lib/supabase';

export interface KpiData {
  pendingEvaluations: number;
  totalStudents: number;
  totalClasses: number;
  completedSessions: number;
}

export const getKpiData = async (): Promise<KpiData> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  const [
    pendingRes,
    studentsRes,
    classesRes,
    completedRes
  ] = await Promise.all([
    supabase
      .from('student_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', user.id),
    supabase
      .from('classes')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('student_sessions')
      .select('*', { count: 'exact', head: true }),
  ]);

  if (pendingRes.error) throw new Error(pendingRes.error.message);
  if (studentsRes.error) throw new Error(studentsRes.error.message);
  if (classesRes.error) throw new Error(classesRes.error.message);
  if (completedRes.error) throw new Error(completedRes.error.message);

  return {
    pendingEvaluations: pendingRes.count ?? 0,
    totalStudents: studentsRes.count ?? 0,
    totalClasses: classesRes.count ?? 0,
    completedSessions: completedRes.count ?? 0,
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

export const getClassPerformance = async (includeArchived: boolean = false): Promise<ClassPerformanceData[]> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  let classesQuery = supabase.from('classes').select('*').eq('teacher_id', user.id).order('created_at', { ascending: true });
  if (!includeArchived) {
    classesQuery = classesQuery.eq('is_archived', false);
  }

  const [classesRes, studentsRes, sessionsRes] = await Promise.all([
    classesQuery,
    supabase.from('students').select('id, class_id').eq('teacher_id', user.id),
    supabase.from('student_sessions').select('id, class_id, status').eq('teacher_id', user.id),
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
  createdAt: string;
  studentName: string;
  category: string;
  status: 'pending' | 'validated';
  validatedAt: string | null;
}

export const getRecentActivity = async (
  filter: 'today' | 'week' | 'month'
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

  const [sessionsRes, studentsRes] = await Promise.all([
    supabase
      .from('student_sessions')
      .select('*')
      .eq('teacher_id', user.id)
      .gte('created_at', thresholdISO)
      .order('created_at', { ascending: false }),
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
    createdAt: s.created_at,
    studentName: studentNameMap[s.student_id] || 'Unknown Student',
    category: s.category || 'General',
    status: s.status as 'pending' | 'validated',
    validatedAt: s.validated_at || null,
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
