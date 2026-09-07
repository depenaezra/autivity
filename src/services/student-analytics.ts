import { supabase } from '../lib/supabase';
import { createNotification } from './notifications';
import { formatActivityTitle } from '../utils/format';


export interface ParentInfo {
  name: string;
  email?: string;
}

export interface StudentHeaderDetails {
  id: string;
  name: string;
  learnerCode: string;
  grade: string;
  lastSessionDate: string | null;
  theme?: string;
  isLinked?: boolean;
  avatar?: string;
  parentInfo?: ParentInfo | null;
}

export const getStudentHeaderDetails = async (studentId: string): Promise<StudentHeaderDetails> => {
  // 1. Fetch student details
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('id, name, learner_code, class_id, parent_id, avatar')
    .eq('id', studentId)
    .single();

  if (studentError) throw new Error(studentError.message);
  if (!student) throw new Error('Student not found');

  // 2. Fetch class grade & theme using select('*') to prevent invalid column SQL errors
  let grade = 'Not Specified';
  let theme = 'blue';
  if (student.class_id) {
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('id', student.class_id)
      .maybeSingle();

    if (!classError && classData) {
      grade = classData.grade || 'Not Specified';
      const rawTheme = (classData.theme_name || classData.theme || classData.themeColor || 'blue').toLowerCase();
      if (rawTheme.includes('yellow')) theme = 'yellow';
      else if (rawTheme.includes('green')) theme = 'green';
      else if (rawTheme.includes('orange')) theme = 'orange';
      else if (rawTheme.includes('blue')) theme = 'blue';
      else theme = rawTheme;
    } else if (classError) {
      console.error('getStudentHeaderDetails: error fetching class details', classError);
    }
  }

  // 3. Fetch latest session date from student_sessions
  const { data: latestSession, error: sessionError } = await supabase
    .from('student_sessions')
    .select('created_at')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let lastSessionDate: string | null = null;
  if (!sessionError && latestSession?.created_at) {
    lastSessionDate = latestSession.created_at;
  }

  // 4. Fetch parent info if parent_id is present
  let parentInfo: ParentInfo | null = null;
  if (student.parent_id) {
    const { data: parentProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', student.parent_id)
      .maybeSingle();

    if (parentProfile) {
      const parentName = [parentProfile.first_name, parentProfile.last_name]
        .filter(Boolean)
        .join(' ');
      parentInfo = {
        name: parentName || 'Parent Account',
        email: parentProfile.email || '',
      };
    }
  }

  return {
    id: student.id,
    name: student.name,
    learnerCode: student.learner_code || '',
    grade,
    lastSessionDate,
    theme,
    isLinked: !!student.parent_id,
    avatar: student.avatar || '',
    parentInfo,
  };
};

export interface StudentSessionStats {
  averageDuration: number;
  averageMistakes: number;
  totalSessions: number;
}

export const getStudentSessionStats = async (
  studentId: string,
  filter: 'today' | 'week' | 'month' | 'overall' = 'overall'
): Promise<StudentSessionStats> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  let thresholdDate: Date | null = null;
  const now = new Date();
  if (filter === 'today') {
    thresholdDate = new Date();
    thresholdDate.setHours(0, 0, 0, 0);
  } else if (filter === 'week') {
    thresholdDate = new Date();
    thresholdDate.setDate(now.getDate() - 7);
    thresholdDate.setHours(0, 0, 0, 0);
  } else if (filter === 'month') {
    thresholdDate = new Date();
    thresholdDate.setDate(now.getDate() - 30);
    thresholdDate.setHours(0, 0, 0, 0);
  }

  let query = supabase
    .from('student_sessions')
    .select('duration_seconds, mistakes, created_at')
    .eq('student_id', studentId)
    .eq('teacher_id', user.id);

  if (thresholdDate) {
    query = query.gte('created_at', thresholdDate.toISOString());
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const sessions = data || [];
  const totalSessions = sessions.length;

  if (totalSessions === 0) {
    return { averageDuration: 0, averageMistakes: 0, totalSessions: 0 };
  }

  const sumDuration = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
  const sumMistakes = sessions.reduce((acc, s) => acc + (s.mistakes || 0), 0);

  return {
    averageDuration: sumDuration / totalSessions,
    averageMistakes: sumMistakes / totalSessions,
    totalSessions,
  };
};

export interface DevelopmentalSkillExposure {
  name: string;
  count: number;
}

export interface MasterDomainExposure {
  masterDomain: string;
  color: string;
  skills: DevelopmentalSkillExposure[];
}

export const getStudentDevelopmentalSkillsExposure = async (
  studentId: string,
  filter: 'today' | 'week' | 'month' | 'overall' = 'overall'
): Promise<MasterDomainExposure[]> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  // 1. Determine date threshold based on filter
  let thresholdDate: Date | null = null;
  const now = new Date();
  if (filter === 'today') {
    thresholdDate = new Date();
    thresholdDate.setHours(0, 0, 0, 0);
  } else if (filter === 'week') {
    thresholdDate = new Date();
    thresholdDate.setDate(now.getDate() - 7);
  } else if (filter === 'month') {
    thresholdDate = new Date();
    thresholdDate.setDate(now.getDate() - 30);
  }

  // 2. Retrieve student sessions for the student and teacher
  let sessionsQuery = supabase
    .from('student_sessions')
    .select('activity_path, created_at')
    .eq('student_id', studentId)
    .eq('teacher_id', user.id);

  if (thresholdDate) {
    sessionsQuery = sessionsQuery.gte('created_at', thresholdDate.toISOString());
  }

  const [sessionsRes, domainsRes] = await Promise.all([
    sessionsQuery,
    supabase.from('master_domains').select('name, color, sub_skills ( name )')
  ]);

  if (sessionsRes.error) throw new Error(sessionsRes.error.message);
  if (domainsRes.error) throw new Error(domainsRes.error.message);

  const sessions = sessionsRes.data || [];
  const domainsData = domainsRes.data || [];

  // 3. Count activities practiced
  const pathCounts: Record<string, number> = {};
  for (const session of sessions) {
    const paths = parseActivityPath(session.activity_path);
    for (const path of paths) {
      if (path) {
        pathCounts[path] = (pathCounts[path] || 0) + 1;
      }
    }
  }

  const allPaths = Object.keys(pathCounts);
  if (allPaths.length === 0) {
    return [];
  }

  // 4. Retrieve activities' skill_domains
  // Expand paths for matching in Supabase (with/without activity/tracing/ prefix)
  const expandedPaths = Array.from(new Set([
    ...allPaths,
    ...allPaths.map(p => p.startsWith('activity/tracing/') ? p.replace(/^activity\/tracing\//, '') : `activity/tracing/${p}`)
  ]));

  const { data: activities, error: actError } = await supabase
    .from('activities')
    .select('path, skill_domain')
    .in('path', expandedPaths);

  if (actError) throw new Error(actError.message);

  // Helper to normalize path for mapping
  const normalizePath = (p: string) => p.startsWith('activity/tracing/') ? p.replace(/^activity\/tracing\//, '') : p;

  const skillDomainMap: Record<string, string[]> = {};
  for (const act of activities || []) {
    if (act.path) {
      const norm = normalizePath(act.path);
      const skills = parseSkillDomain(act.skill_domain);
      skillDomainMap[norm] = skills;
    }
  }

  // 5. Build skill counts
  const skillCounts: Record<string, number> = {};
  const skillToDomainMap: Record<string, string> = {};
  const exactSkillNameMap: Record<string, string> = {};

  // Setup domain maps from DB
  const domainColorMap: Record<string, string> = {};
  for (const dom of domainsData) {
    if (dom.name) {
      domainColorMap[dom.name] = dom.color || '#62A9E6';
      const subSkills = dom.sub_skills || [];
      for (const sub of subSkills) {
        if (sub.name) {
          const key = sub.name.trim().toLowerCase();
          skillToDomainMap[key] = dom.name;
          exactSkillNameMap[key] = sub.name;
        }
      }
    }
  }

  // Accumulate counts
  for (const [path, count] of Object.entries(pathCounts)) {
    const norm = normalizePath(path);
    const skills = skillDomainMap[norm] || [];
    for (const skill of skills) {
      const key = skill.trim().toLowerCase();
      const dbName = exactSkillNameMap[key] || skill;
      skillCounts[dbName] = (skillCounts[dbName] || 0) + count;
    }
  }

  // 6. Group by master domain
  const grouped: Record<string, DevelopmentalSkillExposure[]> = {};
  for (const [skillName, count] of Object.entries(skillCounts)) {
    if (count > 0) {
      const key = skillName.trim().toLowerCase();
      const masterDomain = skillToDomainMap[key] || 'Other';
      if (!grouped[masterDomain]) {
        grouped[masterDomain] = [];
      }
      grouped[masterDomain].push({ name: skillName, count });
    }
  }

  // Convert to array and sort
  const result: MasterDomainExposure[] = Object.entries(grouped).map(([masterDomain, skills]) => {
    skills.sort((a, b) => b.count - a.count);
    return {
      masterDomain,
      color: domainColorMap[masterDomain] || '#62A9E6',
      skills,
    };
  });

  // Sort domains alphabetically
  result.sort((a, b) => a.masterDomain.localeCompare(b.masterDomain));

  return result;
};

const parseActivityPath = (raw: any): string[] => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try { return JSON.parse(trimmed); } catch { /* fall through */ }
    }
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
    }
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

const parseSkillDomain = (raw: any): string[] => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try { return JSON.parse(trimmed); } catch { /* fall through */ }
    }
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
    }
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

export interface SessionEvaluation {
  id: string;
  created_at: string;
  rubric_evaluation: any;
}

export const getStudentValidatedSessionsEvaluations = async (studentId: string): Promise<SessionEvaluation[]> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  const { data, error } = await supabase
    .from('student_sessions')
    .select('id, created_at, rubric_evaluation')
    .eq('student_id', studentId)
    .eq('status', 'validated')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

export interface Milestone {
  id: string;
  studentId: string;
  title: string;
  status: 'Achieved' | 'In Progress' | 'Target Set';
  targetDate: string;
  startDate: string;
}

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const toISODate = (friendlyDateStr: string): string => {
  if (!friendlyDateStr) return '';
  const d = new Date(friendlyDateStr);
  if (isNaN(d.getTime())) return friendlyDateStr;
  return d.toISOString().split('T')[0];
};

export const getStudentMilestones = async (studentId: string): Promise<Milestone[]> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  const { data, error } = await supabase
    .from('student_milestones')
    .select('*')
    .eq('student_id', studentId)
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((m: any) => ({
    id: m.id,
    studentId: m.student_id,
    title: m.title,
    status: m.status as any,
    targetDate: m.target_date ? formatDate(m.target_date) : '',
    startDate: m.created_at ? formatDate(m.created_at) : ''
  }));
};

export const createStudentMilestone = async (studentId: string, title: string, targetDate: string): Promise<Milestone> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  const { data, error } = await supabase
    .from('student_milestones')
    .insert([{
      student_id: studentId,
      teacher_id: user.id,
      title,
      target_date: toISODate(targetDate),
      status: 'Target Set'
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Send milestone creation notification to parent
  if (data?.student_id) {
    try {
      const { data: student } = await supabase
        .from('students')
        .select('name')
        .eq('id', data.student_id)
        .maybeSingle();

      const studentName = student?.name || 'Learner';

      await createNotification({
        studentId: data.student_id,
        title: 'New Milestone Goal',
        message: `Teacher added a new milestone for ${studentName}: "${data.title}"`,
        type: 'milestone',
        metadata: { milestone_id: data.id, status: 'Target Set', target_date: data.target_date },
      });
    } catch (notifErr) {
      console.error('[NOTIFICATIONS] Failed sending milestone creation notification:', notifErr);
    }
  }
  
  return {
    id: data.id,
    studentId: data.student_id,
    title: data.title,
    status: data.status,
    targetDate: data.target_date ? formatDate(data.target_date) : '',
    startDate: data.created_at ? formatDate(data.created_at) : ''
  };
};

export const updateStudentMilestoneStatus = async (milestoneId: string, newStatus: string): Promise<Milestone> => {
  const { data, error } = await supabase
    .from('student_milestones')
    .update({ status: newStatus })
    .eq('id', milestoneId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Send milestone status update notification to parent
  if (data?.student_id) {
    try {
      const { data: student } = await supabase
        .from('students')
        .select('name')
        .eq('id', data.student_id)
        .maybeSingle();

      const studentName = student?.name || 'Learner';
      const milestoneTitle = data.title || 'Milestone';

      let notifTitle = 'Milestone Updated';
      let notifMsg = `Teacher updated milestone "${milestoneTitle}" for ${studentName}.`;

      if (newStatus === 'In Progress') {
        notifTitle = 'Milestone In Progress';
        notifMsg = `Teacher marked milestone "${milestoneTitle}" for ${studentName} as In Progress.`;
      } else if (newStatus === 'Achieved') {
        notifTitle = 'Milestone Completed! 🎉';
        notifMsg = `Teacher marked milestone "${milestoneTitle}" for ${studentName} as Completed!`;
      }

      await createNotification({
        studentId: data.student_id,
        title: notifTitle,
        message: notifMsg,
        type: 'milestone',
        metadata: { milestone_id: data.id, status: newStatus, target_date: data.target_date },
      });
    } catch (notifErr) {
      console.error('[NOTIFICATIONS] Failed sending milestone status update notification:', notifErr);
    }
  }
  
  return {
    id: data.id,
    studentId: data.student_id,
    title: data.title,
    status: data.status,
    targetDate: data.target_date ? formatDate(data.target_date) : '',
    startDate: data.created_at ? formatDate(data.created_at) : ''
  };
};

export const deleteStudentMilestone = async (milestoneId: string): Promise<void> => {
  const { error } = await supabase
    .from('student_milestones')
    .delete()
    .eq('id', milestoneId);

  if (error) throw new Error(error.message);
};

export const updateStudentMilestone = async (milestoneId: string, title: string, targetDate: string): Promise<Milestone> => {
  const { data, error } = await supabase
    .from('student_milestones')
    .update({ title, target_date: toISODate(targetDate) })
    .eq('id', milestoneId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  return {
    id: data.id,
    studentId: data.student_id,
    title: data.title,
    status: data.status,
    targetDate: data.target_date ? formatDate(data.target_date) : '',
    startDate: data.created_at ? formatDate(data.created_at) : ''
  };
};

export interface SessionRecord {
  id: string;
  studentId: string;
  activityName: string;
  category: string;
  skill_domain: string[];
  date: string;
  duration: string;
  stars: number;
  score: string;
  status: 'pending' | 'validated';
  rubric_evaluation?: any;
  teacher_feedback?: string;
  validated_at?: string;
}

const normalizeDepEdScore = (rawScore: any): number => {
  if (rawScore == null) return 0;
  
  let numericScore = typeof rawScore === 'string' 
    ? parseFloat(rawScore.replace('%', '')) 
    : Number(rawScore);

  if (isNaN(numericScore)) return 0;

  // If rubric level scale (0 to 4) is passed
  if (numericScore > 0 && numericScore <= 4) {
    numericScore = (numericScore / 4) * 100;
  }

  // Strict DepEd Percentage Clamping [0% - 100%]
  return Math.min(100, Math.max(0, numericScore));
};

export const getStudentSessions = async (studentId: string): Promise<SessionRecord[]> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  const { data, error } = await supabase
    .from('student_sessions')
    .select('*')
    .eq('student_id', studentId)
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((s: any) => {
    const stars = s.stars || 0;
    const normalized = normalizeDepEdScore(s.stars);
    return {
      id: s.id,
      studentId: s.student_id,
      activityName: (() => {
        if (Array.isArray(s.activity_path)) {
          return s.activity_path.length > 0
            ? s.activity_path.map((path: string) => formatActivityTitle(path)).join(', ')
            : 'Unknown Session';
        }
        if (typeof s.activity_path === 'string') {
          return formatActivityTitle(s.activity_path);
        }
        return 'Unknown Session';
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
      date: s.created_at
        ? new Date(s.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : '',
      duration: s.duration_seconds
        ? s.duration_seconds >= 60
          ? `${Math.floor(s.duration_seconds / 60)} min${Math.floor(s.duration_seconds / 60) === 1 ? '' : 's'}${s.duration_seconds % 60 > 0 ? ` ${s.duration_seconds % 60}s` : ''}`
          : `${s.duration_seconds}s`
        : '5 mins',
      stars: stars,
      score: `${Math.round(normalized)}%`,
      status: s.status as 'pending' | 'validated',
      rubric_evaluation: s.rubric_evaluation || null,
      teacher_feedback: s.teacher_feedback || '',
      validated_at: s.validated_at || null,
    };
  });
};




