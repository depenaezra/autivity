import { supabase } from '../lib/supabase';

export const getTeacherAnalyticsOverview = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not logged in');

    const [classesRes, studentsRes, sessionsRes, milestonesRes] = await Promise.all([
        supabase.from('classes').select('id, title, grade, theme_name').eq('teacher_id', user.id),
        supabase.from('students').select('id, class_id, name').eq('teacher_id', user.id),
        supabase.from('student_sessions').select('*').eq('teacher_id', user.id),
        supabase.from('student_milestones').select('*').eq('teacher_id', user.id)
    ]);

    if (classesRes.error) throw new Error(classesRes.error.message);
    if (studentsRes.error) throw new Error(studentsRes.error.message);
    if (sessionsRes.error) throw new Error(sessionsRes.error.message);
    if (milestonesRes.error) throw new Error(milestonesRes.error.message);

    return {
        classes: classesRes.data || [],
        students: studentsRes.data || [],
        sessions: sessionsRes.data || [],
        milestones: milestonesRes.data || []
    };
};

export const validateSession = async (sessionId: string, feedback?: string) => {
    const updates: any = {
        status: 'validated',
        validated_at: new Date().toISOString()
    };
    if (feedback) updates.teacher_feedback = feedback;

    const { data, error } = await supabase
        .from('student_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

export const createMilestone = async (studentId: string, title: string, targetDate: string) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not logged in');

    const { data, error } = await supabase
        .from('student_milestones')
        .insert([{
            student_id: studentId,
            teacher_id: user.id,
            title,
            target_date: targetDate,
            status: 'Target Set'
        }])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

export const updateMilestoneStatus = async (milestoneId: string, newStatus: string) => {
    const { data, error } = await supabase
        .from('student_milestones')
        .update({ status: newStatus })
        .eq('id', milestoneId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

export const deleteMilestone = async (milestoneId: string) => {
    const { error } = await supabase
        .from('student_milestones')
        .delete()
        .eq('id', milestoneId);

    if (error) throw new Error(error.message);
};

