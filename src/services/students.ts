import { supabase } from '../lib/supabase';

// Fetch all students for a specific class
export const getClassStudents = async (classId: string) => {
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    return (data || []).map((student: any) => ({
        ...student,
        assigned_activities: student.assigned_activities || [],
    }));
};

// Add a new student to a class
export const addStudent = async (
    classId: string,
    name: string,
    avatar: string,
    spectrumLevel?: string,
    bio?: string
) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not logged in');

    const { data, error } = await supabase
        .from('students')
        .insert([
            {
                class_id: classId,
                teacher_id: user.id,
                name: name,
                avatar: avatar,
                spectrum_level: spectrumLevel || null,
                bio: bio || null,
            }
        ])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

// Fetch all students linked to the currently logged-in parent account.
export const getLinkedStudentsForParent = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not logged in');

    const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    if (!students || students.length === 0) return [];

    const classIds = Array.from(new Set(students.map((s: any) => s.class_id).filter(Boolean)));
    const teacherIds = Array.from(new Set(students.map((s: any) => s.teacher_id).filter(Boolean)));

    const [classesRes, teachersRes] = await Promise.all([
        classIds.length > 0 ? supabase.from('classes').select('id, title, grade, theme_name').in('id', classIds) : { data: [] },
        teacherIds.length > 0 ? supabase.from('profiles').select('id, first_name, last_name').in('id', teacherIds) : { data: [] },
    ]);

    const classesMap = new Map((classesRes.data || []).map((c: any) => [c.id, c]));
    const teachersMap = new Map((teachersRes.data || []).map((t: any) => [t.id, t]));

    return students.map((s: any) => ({
        ...s,
        classes: classesMap.get(s.class_id) || null,
        teacher: teachersMap.get(s.teacher_id) || null,
    }));
};

// Fetch a single student linked to the currently logged-in parent account.
// If studentId is provided, returns that specific student if linked to this parent;
// otherwise returns the first linked student.
export const getLinkedStudentForParent = async (studentId?: string) => {
    const students = await getLinkedStudentsForParent();
    if (!students || students.length === 0) return null;
    if (studentId) {
        return students.find((s: any) => s.id === studentId) || null;
    }
    return students[0];
};

// Unlink a student from the currently logged-in parent
export const unlinkStudentFromParent = async (studentId: string) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not logged in');

    let result: any = null;

    // Try RPC first for security definer execution
    try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('unlink_student_from_parent', {
            p_student_id: studentId,
        });

        if (!rpcError && rpcData?.success) {
            result = rpcData;
        }
    } catch {
        // Fall back to direct table update below
    }

    if (!result) {
        // Direct table update fallback
        const { data, error } = await supabase
            .from('students')
            .update({ parent_id: null })
            .eq('id', studentId)
            .eq('parent_id', user.id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        result = data;
    }

    // Sync profiles.learner_code
    try {
        const { data: remainingStudents } = await supabase
            .from('students')
            .select('learner_code')
            .eq('parent_id', user.id)
            .order('created_at', { ascending: true });

        const codes = (remainingStudents || [])
            .map((s: any) => s.learner_code?.trim())
            .filter(Boolean);

        await supabase
            .from('profiles')
            .update({ learner_code: codes.join(', ') || null })
            .eq('id', user.id);
    } catch {
        // Best effort
    }

    return result;
};

// Delete a student
export const deleteStudent = async (studentId: string) => {
    const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

    if (error) throw new Error(error.message);
    return true;
};

// Update student details
export const updateStudent = async (
    studentId: string,
    name: string,
    avatar: string,
    spectrumLevel?: string,
    bio?: string
) => {
    const { data, error } = await supabase
        .from('students')
        .update({
            name: name,
            avatar: avatar,
            spectrum_level: spectrumLevel || null,
            bio: bio || null,
        })
        .eq('id', studentId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

// Move student to a new class
export const moveStudentClass = async (studentId: string, newClassId: string) => {
    const { data, error } = await supabase
        .from('students')
        .update({ class_id: newClassId })
        .eq('id', studentId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

// Fetch student by ID
export const getStudentById = async (studentId: string) => {
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

    if (error) throw new Error(error.message);
    return data;
};

// Fetch only the assigned activities for a student
export const getStudentActivities = async (studentId: string) => {
    const { data, error } = await supabase
        .from('students')
        .select('assigned_activities')
        .eq('id', studentId)
        .single();

    if (error) throw new Error(error.message);
    return data?.assigned_activities || [];
};

// Update assigned activities for a student
export const updateStudentActivities = async (studentId: string, assignedActivities: string[]) => {
    const { data, error } = await supabase
        .from('students')
        .update({ assigned_activities: assignedActivities })
        .eq('id', studentId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

// Get all students for a teacher
export const getTeacherStudents = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not logged in');

    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', user.id)
        .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
};

// Get students count
export const getStudentCount = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return 0;

    const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user.id);
    if (error) throw new Error(error.message);
    return count || 0;
};

export interface StudentPreferences {
    sfx_enabled: boolean;
    music_enabled: boolean;
    confetti_enabled: boolean;
}

// Update preferences for a student
export const updateStudentPreferences = async (
    studentId: string,
    preferences: Partial<StudentPreferences>
) => {
    // 1. Fetch current preferences to merge updates safely
    const { data: currentStudent, error: fetchError } = await supabase
        .from('students')
        .select('preferences')
        .eq('id', studentId)
        .single();

    if (fetchError) throw new Error(fetchError.message);

    const existingPrefs: StudentPreferences = {
        sfx_enabled: true,
        music_enabled: true,
        confetti_enabled: true,
        ...(currentStudent?.preferences || {}),
    };

    const updatedPrefs: StudentPreferences = {
        ...existingPrefs,
        ...preferences,
    };

    const { data, error } = await supabase
        .from('students')
        .update({ preferences: updatedPrefs })
        .eq('id', studentId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};
