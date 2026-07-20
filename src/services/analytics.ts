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

import { RubricEvaluation, validateSession as validateSessionService } from './sessions';

export { RubricEvaluation };

export const validateSession = async (
    sessionId: string,
    rubricEvaluation?: RubricEvaluation | string,
    teacherFeedback?: string
) => {
    let rubric: RubricEvaluation;
    let feedbackStr = teacherFeedback || '';

    if (typeof rubricEvaluation === 'string') {
        // Backwards compatibility if called with (sessionId, feedbackString)
        feedbackStr = rubricEvaluation;
        rubric = {
            looking_at_objects: 4,
            concentrating: 4,
            performing_task: 4,
            following_instructions: 4,
            completed_work: 4
        };
    } else if (rubricEvaluation && typeof rubricEvaluation === 'object') {
        rubric = rubricEvaluation;
    } else {
        rubric = {
            looking_at_objects: 4,
            concentrating: 4,
            performing_task: 4,
            following_instructions: 4,
            completed_work: 4
        };
    }

    return validateSessionService(sessionId, rubric, feedbackStr);
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

