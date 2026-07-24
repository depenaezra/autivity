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
export const addStudent = async (classId: string, name: string, avatar: string) => {
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
            }
        ])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
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