import { supabase } from '../lib/supabase';

export interface ParentSessionRecord {
    id: string;
    studentId: string;
    category: string;
    skill_domain: string[];
    date: Date;
    durationSeconds: number;
    score: number | null;
    status: 'pending' | 'validated';
    teacherFeedback: string;
    validatedAt: string | null;
    rubricEvaluation?: {
        looking_at_objects?: number;
        concentrating?: number;
        performing_task?: number;
        following_instructions?: number;
        completed_work?: number;
    } | null;
}

export interface ParentMilestone {
    id: string;
    title: string;
    status: string;
    targetDate: string | null;
}

export interface MasterDomainInfo {
    name: string;
    color: string;
    description: string;
    subSkills: string[];
}

export interface ParentDashboardData {
    student: any | null;
    classInfo: { title: string; grade: string; themeName?: string } | null;
    teacherName: string;
    parentFirstName: string;
    parentLastName: string;
    parentEmail: string;
    sessions: ParentSessionRecord[];
    milestones: ParentMilestone[];
    masterDomains: MasterDomainInfo[];
}

// Parses the same flexible skill_domain shape used elsewhere in the app
// (sometimes a real array, sometimes a stringified array/set/csv).
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

// Fetches everything the parent dashboard needs, scoped to the currently
// logged-in parent's linked child (students.parent_id = auth.uid()).
export const getParentDashboardData = async (): Promise<ParentDashboardData> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not logged in');

    const { data: parentProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .maybeSingle();

    const metaFirstName = user.user_metadata?.first_name
        || (user.user_metadata?.name ? user.user_metadata.name.split(' ')[0] : '')
        || (user.user_metadata?.full_name ? user.user_metadata.full_name.split(' ')[0] : '');

    const resolvedParentFirstName = parentProfile?.first_name || metaFirstName || '';
    const resolvedParentLastName = parentProfile?.last_name || user.user_metadata?.last_name || '';

    const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', user.id)
        .maybeSingle();

    if (studentError) throw new Error(studentError.message);

    if (!student) {
        return {
            student: null,
            classInfo: null,
            teacherName: '',
            parentFirstName: resolvedParentFirstName,
            parentLastName: resolvedParentLastName,
            parentEmail: parentProfile?.email || user.email || '',
            sessions: [],
            milestones: [],
            masterDomains: [],
        };
    }

    const [classRes, teacherRes, sessionsRes, milestonesRes, domainsRes] = await Promise.all([
        supabase.from('classes').select('title, grade, theme_name').eq('id', student.class_id).maybeSingle(),
        supabase.from('profiles').select('first_name, last_name').eq('id', student.teacher_id).maybeSingle(),
        supabase.from('student_sessions').select('*').eq('student_id', student.id).order('created_at', { ascending: true }),
        supabase.from('student_milestones').select('*').eq('student_id', student.id),
        supabase.from('master_domains').select('name, color, description, sub_skills ( name )'),
    ]);

    if (sessionsRes.error) throw new Error(sessionsRes.error.message);

    const sessions: ParentSessionRecord[] = (sessionsRes.data || []).map((s: any) => ({
        id: s.id,
        studentId: s.student_id,
        category: s.category || 'General',
        skill_domain: parseSkillDomain(s.skill_domain),
        date: new Date(s.created_at),
        durationSeconds: s.duration_seconds || 0,
        score: s.score ?? null,
        status: s.status as 'pending' | 'validated',
        teacherFeedback: s.teacher_feedback || '',
        validatedAt: s.validated_at || null,
        rubricEvaluation: s.rubric_evaluation || null,
    }));

    const milestones: ParentMilestone[] = (milestonesRes.data || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        status: m.status || 'Target Set',
        targetDate: m.target_date || null,
    }));

    const masterDomains: MasterDomainInfo[] = (domainsRes.data || []).map((d: any) => ({
        name: d.name,
        color: d.color,
        description: d.description,
        subSkills: (d.sub_skills || []).map((s: any) => s.name),
    }));

    return {
        student,
        classInfo: classRes.data ? { title: classRes.data.title, grade: classRes.data.grade, themeName: classRes.data.theme_name } : null,
        teacherName: teacherRes.data ? `${teacherRes.data.first_name || ''} ${teacherRes.data.last_name || ''}`.trim() : 'Unknown Teacher',
        parentFirstName: resolvedParentFirstName,
        parentLastName: resolvedParentLastName,
        parentEmail: parentProfile?.email || user.email || '',
        sessions,
        milestones,
        masterDomains,
    };
};
