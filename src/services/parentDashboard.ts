import { supabase } from '../lib/supabase';
import { MasterDomainExposure } from './class-analytics';

export interface ParentSessionRecord {
    id: string;
    studentId: string;
    category: string;
    activityType?: 'app' | 'classroom';
    skill_domain: string[];
    date: Date;
    durationSeconds: number;
    stars: number | null;
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
    linkedStudents: any[];
    classInfo: { title: string; grade: string; themeName?: string } | null;
    teacherName: string;
    parentFirstName: string;
    parentLastName: string;
    parentEmail: string;
    sessions: ParentSessionRecord[];
    milestones: ParentMilestone[];
    masterDomains: MasterDomainInfo[];
    domainExposure?: MasterDomainExposure[];
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
// logged-in parent's linked child (or a specific linked child if selectedStudentId is passed).
export const getParentDashboardData = async (selectedStudentId?: string): Promise<ParentDashboardData> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not logged in');

    const { data: parentProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, learner_code')
        .eq('id', user.id)
        .maybeSingle();

    const metaFirstName = user.user_metadata?.first_name
        || (user.user_metadata?.name ? user.user_metadata.name.split(' ')[0] : '')
        || (user.user_metadata?.full_name ? user.user_metadata.full_name.split(' ')[0] : '');

    const resolvedParentFirstName = parentProfile?.first_name || metaFirstName || '';
    const resolvedParentLastName = parentProfile?.last_name || user.user_metadata?.last_name || '';

    // Fetch all students linked to this parent
    const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: true });

    if (studentsError) throw new Error(studentsError.message);

    const rawStudents = students || [];

    if (rawStudents.length === 0) {
        return {
            student: null,
            linkedStudents: [],
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

    // Populate class & teacher info for all linked students
    const classIds = Array.from(new Set(rawStudents.map((s: any) => s.class_id).filter(Boolean)));
    const teacherIds = Array.from(new Set(rawStudents.map((s: any) => s.teacher_id).filter(Boolean)));

    const [allClassesRes, allTeachersRes] = await Promise.all([
        classIds.length > 0 ? supabase.from('classes').select('id, title, grade, theme_name').in('id', classIds) : { data: [] },
        teacherIds.length > 0 ? supabase.from('profiles').select('id, first_name, last_name').in('id', teacherIds) : { data: [] },
    ]);

    const classesMap = new Map((allClassesRes.data || []).map((c: any) => [c.id, c]));
    const teachersMap = new Map((allTeachersRes.data || []).map((t: any) => [t.id, t]));

    const linkedStudents = rawStudents.map((s: any) => ({
        ...s,
        classes: classesMap.get(s.class_id) || null,
        teacher: teachersMap.get(s.teacher_id) || null,
    }));

    // Auto-sync profiles.learner_code if needed
    if (user && linkedStudents.length > 0) {
        const codes = linkedStudents.map((s: any) => s.learner_code?.trim()).filter(Boolean);
        const joinedCodes = codes.join(', ');
        if (joinedCodes && parentProfile?.learner_code !== joinedCodes) {
            supabase.from('profiles').update({ learner_code: joinedCodes }).eq('id', user.id).then();
        }
    }

    // Determine target student
    let student = linkedStudents[0];
    if (selectedStudentId) {
        const found = linkedStudents.find((s) => s.id === selectedStudentId);
        if (found) student = found;
    }

    const [classRes, teacherRes, sessionsRes, milestonesRes, domainsRes] = await Promise.all([
        student.class_id ? supabase.from('classes').select('title, grade, theme_name').eq('id', student.class_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
        student.teacher_id ? supabase.from('profiles').select('first_name, last_name').eq('id', student.teacher_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
        supabase.from('student_sessions').select('*').eq('student_id', student.id).order('created_at', { ascending: true }),
        supabase.from('student_milestones').select('*').eq('student_id', student.id),
        supabase.from('master_domains').select('name, color, description, sub_skills ( name )'),
    ]);

    if (sessionsRes.error) throw new Error(sessionsRes.error.message);

    const sessions: ParentSessionRecord[] = (sessionsRes.data || []).map((s: any) => ({
        id: s.id,
        studentId: s.student_id,
        category: s.category || 'General',
        activityType: (s.activity_type as 'app' | 'classroom') || 'app',
        skill_domain: parseSkillDomain(s.skill_domain),
        date: new Date(s.created_at),
        durationSeconds: s.duration_seconds || 0,
        stars: s.stars ?? null,
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
        linkedStudents,
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

// Fetches dashboard data for ALL linked children concurrently (for multi-child dual analytics)
export const getAllLinkedChildrenDashboardData = async (): Promise<{
    linkedStudents: any[];
    childrenData: Record<string, ParentDashboardData>;
    masterDomains: MasterDomainInfo[];
}> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not logged in');

    const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: true });

    if (studentsError) throw new Error(studentsError.message);
    const linkedStudents = students || [];

    if (linkedStudents.length === 0) {
        return {
            linkedStudents: [],
            childrenData: {},
            masterDomains: [],
        };
    }

    const results = await Promise.all(
        linkedStudents.map((st) => getParentDashboardData(st.id))
    );

    const childrenData: Record<string, ParentDashboardData> = {};
    results.forEach((res) => {
        if (res.student?.id) {
            childrenData[res.student.id] = res;
        }
    });

    const masterDomains = results[0]?.masterDomains || [];

    return {
        linkedStudents,
        childrenData,
        masterDomains,
    };
};
