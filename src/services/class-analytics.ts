import { supabase } from '../lib/supabase';
import { ClassPerformanceData } from './analytics';

export const getClassPerformanceById = async (classId: string): Promise<ClassPerformanceData> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  const [classRes, studentsRes, sessionsRes] = await Promise.all([
    supabase.from('classes').select('*').eq('id', classId).eq('teacher_id', user.id).single(),
    supabase.from('students').select('id, class_id').eq('class_id', classId).eq('teacher_id', user.id),
    supabase.from('student_sessions').select('id, class_id, status').eq('class_id', classId).eq('teacher_id', user.id),
  ]);

  if (classRes.error) throw new Error(classRes.error.message);
  if (studentsRes.error) throw new Error(studentsRes.error.message);
  if (sessionsRes.error) throw new Error(sessionsRes.error.message);

  const cls = classRes.data;
  const students = studentsRes.data || [];
  const sessions = sessionsRes.data || [];

  const completed = sessions.length;
  const pending = sessions.filter((s) => s.status === 'pending').length;
  const evaluated = Math.max(0, completed - pending);
  const evaluatedPercentage = completed > 0 ? Math.round((evaluated / completed) * 100) : 0;

  return {
    id: cls.id,
    title: cls.title,
    grade: cls.grade,
    schedule: cls.schedule || '',
    theme: cls.theme || cls.theme_name || 'green',
    studentsCount: students.length,
    completedSessions: completed,
    pendingEvaluations: pending,
    evaluatedPercentage,
    isArchived: !!cls.is_archived,
  };
};

export interface SessionEvaluation {
  id: string;
  student_id?: string;
  created_at: string;
  rubric_evaluation: any;
}

export const getValidatedSessionsEvaluations = async (classId: string): Promise<SessionEvaluation[]> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  const { data, error } = await supabase
    .from('student_sessions')
    .select('id, student_id, created_at, rubric_evaluation')
    .eq('class_id', classId)
    .eq('status', 'validated')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
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

export const getClassDevelopmentalSkillsExposure = async (
  classId: string,
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

  // 2. Retrieve student sessions for the class and teacher
  let sessionsQuery = supabase
    .from('student_sessions')
    .select('activity_path, created_at')
    .eq('class_id', classId)
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

export interface ClassSessionStats {
  averageDuration: number;
  averageMistakes: number;
  totalSessions: number;
}

export const getClassSessionStats = async (
  classId: string,
  filter: 'today' | 'week' | 'month' | 'overall' = 'overall'
): Promise<ClassSessionStats> => {
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
    .eq('class_id', classId)
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

export const getClassPendingFeedbackCounts = async (
  classId: string
): Promise<Record<string, number>> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  const { data, error } = await supabase
    .from('student_sessions')
    .select('student_id')
    .eq('class_id', classId)
    .eq('teacher_id', user.id)
    .eq('status', 'pending');

  if (error) throw new Error(error.message);

  const counts: Record<string, number> = {};
  for (const session of data || []) {
    if (session.student_id) {
      counts[session.student_id] = (counts[session.student_id] || 0) + 1;
    }
  }
  return counts;
};


