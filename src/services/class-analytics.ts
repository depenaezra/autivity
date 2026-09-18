import { supabase } from '../lib/supabase';
import { ActivityTypeFilter, ClassPerformanceData } from './analytics';

export const getClassPerformanceById = async (
  classId: string,
  activityType: ActivityTypeFilter = 'all'
): Promise<ClassPerformanceData> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  let sessionsQuery = supabase
    .from('student_sessions')
    .select('id, class_id, status, activity_type')
    .eq('class_id', classId)
    .eq('teacher_id', user.id);

  if (activityType !== 'all') {
    sessionsQuery = sessionsQuery.eq('activity_type', activityType);
  }

  const [classRes, studentsRes, sessionsRes] = await Promise.all([
    supabase.from('classes').select('*').eq('id', classId).eq('teacher_id', user.id).single(),
    supabase.from('students').select('id, class_id').eq('class_id', classId).eq('teacher_id', user.id),
    sessionsQuery,
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

export const getValidatedSessionsEvaluations = async (
  classId: string,
  activityType: ActivityTypeFilter = 'all'
): Promise<SessionEvaluation[]> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  let query = supabase
    .from('student_sessions')
    .select('id, student_id, created_at, rubric_evaluation, activity_type')
    .eq('class_id', classId)
    .eq('status', 'validated')
    .order('created_at', { ascending: true });

  if (activityType !== 'all') {
    query = query.eq('activity_type', activityType);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data || [];
};

export interface DevelopmentalSkillExposure {
  name: string;
  count: number;
  averageScore?: number | null;
  evaluatedCount?: number;
}

export interface MasterDomainExposure {
  masterDomain: string;
  color: string;
  averageScore?: number | null;
  evaluatedCount?: number;
  skills: DevelopmentalSkillExposure[];
}

export const getClassDevelopmentalSkillsExposure = async (
  classId: string,
  filter: 'today' | 'week' | 'month' | 'overall' = 'overall',
  activityType: ActivityTypeFilter = 'all'
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
    thresholdDate.setHours(0, 0, 0, 0);
  } else if (filter === 'month') {
    thresholdDate = new Date();
    thresholdDate.setDate(now.getDate() - 30);
    thresholdDate.setHours(0, 0, 0, 0);
  }

  // 2. Retrieve student sessions for the class and teacher
  let sessionsQuery = supabase
    .from('student_sessions')
    .select('activity_path, skill_domain, activity_type, created_at')
    .eq('class_id', classId)
    .eq('teacher_id', user.id);

  if (activityType !== 'all') {
    sessionsQuery = sessionsQuery.eq('activity_type', activityType);
  }

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

  // 4. Retrieve activities' skill_domains
  let skillDomainMap: Record<string, string[]> = {};
  if (allPaths.length > 0) {
    const expandedPaths = Array.from(new Set([
      ...allPaths,
      ...allPaths.map(p => p.startsWith('activity/tracing/') ? p.replace(/^activity\/tracing\//, '') : `activity/tracing/${p}`)
    ]));

    const { data: activities, error: actError } = await supabase
      .from('activities')
      .select('path, skill_domain')
      .in('path', expandedPaths);

    if (actError) throw new Error(actError.message);

    const normalizePath = (p: string) => p.startsWith('activity/tracing/') ? p.replace(/^activity\/tracing\//, '') : p;
    for (const act of activities || []) {
      if (act.path) {
        const norm = normalizePath(act.path);
        const skills = parseSkillDomain(act.skill_domain);
        skillDomainMap[norm] = skills;
      }
    }
  }

  // 5. Build skill counts
  const skillCounts: Record<string, number> = {};
  const skillToDomainMap: Record<string, string> = {};
  const exactSkillNameMap: Record<string, string> = {};

  // Setup domain maps from DB
  const domainColorMap: Record<string, string> = {};
  const masterDomainNameMap: Record<string, string> = {};
  for (const dom of domainsData) {
    if (dom.name) {
      domainColorMap[dom.name] = dom.color || '#62A9E6';
      masterDomainNameMap[dom.name.trim().toLowerCase()] = dom.name;
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

  // Accumulate counts for registered sub-skills or sub-skill tags
  const masterDomainNamesLower = new Set(Object.keys(masterDomainNameMap));

  for (const session of sessions) {
    const directSkills = parseSkillDomain(session.skill_domain);
    if (directSkills.length > 0) {
      for (const skill of directSkills) {
        const key = skill.trim().toLowerCase();
        if (masterDomainNamesLower.has(key)) {
          continue;
        }
        const dbName = exactSkillNameMap[key] || skill;
        skillCounts[dbName] = (skillCounts[dbName] || 0) + 1;
      }
    } else if (session.activity_path) {
      const paths = parseActivityPath(session.activity_path);
      for (const path of paths) {
        const norm = path.startsWith('activity/tracing/') ? path.replace(/^activity\/tracing\//, '') : path;
        const skills = skillDomainMap[norm] || [];
        for (const skill of skills) {
          const key = skill.trim().toLowerCase();
          if (masterDomainNamesLower.has(key)) {
            continue;
          }
          const dbName = exactSkillNameMap[key] || skill;
          skillCounts[dbName] = (skillCounts[dbName] || 0) + 1;
        }
      }
    }
  }

  // 6. Group sub-skills by master domain
  const grouped: Record<string, DevelopmentalSkillExposure[]> = {};
  for (const [skillName, count] of Object.entries(skillCounts)) {
    if (count > 0) {
      const key = skillName.trim().toLowerCase();
      const masterDomain = skillToDomainMap[key] || 'General Skills';
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
  filter: 'today' | 'week' | 'month' | 'overall' = 'overall',
  activityType: ActivityTypeFilter = 'all'
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
    .select('duration_seconds, mistakes, created_at, activity_type')
    .eq('class_id', classId)
    .eq('teacher_id', user.id);

  if (activityType !== 'all') {
    query = query.eq('activity_type', activityType);
  }

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


