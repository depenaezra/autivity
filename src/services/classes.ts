import { supabase } from '../lib/supabase';

// Fetch all classes for the logged-in teacher
export const getTeacherClasses = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not logged in');

    const { data, error } = await supabase
        .from('classes')
        .select('*, students(id)')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: true }); // Orders them by when they were created

    if (error) throw new Error(error.message);
    return data;
};

// Create a new class
export const createClass = async (title: string, grade: string, schedule: string, themeName: string) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not logged in');

    const { data, error } = await supabase
        .from('classes')
        .insert([
            {
                teacher_id: user.id,
                title,
                grade,
                schedule,
                theme_name: themeName,
            }
        ])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

// Fetch a single class by its ID
export const getClassById = async (classId: string) => {
    const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

    if (error) throw new Error(error.message);
    return data;
};

// Update an existing class
export const updateClass = async (classId: string, title: string, grade: string, schedule: string, themeName: string) => {
    const { data, error } = await supabase
        .from('classes')
        .update({
            title,
            grade,
            schedule,
            theme_name: themeName,
        })
        .eq('id', classId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

// Delete a class
export const deleteClass = async (classId: string) => {
    const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

    if (error) throw new Error(error.message);
    return true;
};

export const getClassCount = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return 0;

    const { count, error } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user.id);
    if (error) throw new Error(error.message);
    return count || 0;
};