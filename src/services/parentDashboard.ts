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
    classInfo: { title: string; grade: string } | null;
    teacherName: string;
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
            sessions: [],
            milestones: [],
            masterDomains: [],
        };
    }

    const [classRes, teacherRes, sessionsRes, milestonesRes, domainsRes] = await Promise.all([
        supabase.from('classes').select('title, grade').eq('id', student.class_id).maybeSingle(),
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
        classInfo: classRes.data || null,
        teacherName: teacherRes.data ? `${teacherRes.data.first_name || ''} ${teacherRes.data.last_name || ''}`.trim() : 'Unknown Teacher',
        sessions,
        milestones,
        masterDomains,
    };
};
