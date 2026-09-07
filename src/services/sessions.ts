import { supabase } from '../lib/supabase';

import { createNotification } from './notifications';

interface SessionPayload {
    student_id: string;
    class_id: string;
    teacher_id: string;
    activity_path: string[]; // text[] in DB — stores all paths of a completed set
    category: string;
    skill_domain: string | string[];
    stars?: number;
    duration_seconds: number;
    mistakes?: number;
}

export const saveStudentSession = async (sessionData: SessionPayload) => {
    const { data, error } = await supabase
        .from('student_sessions')
        .insert([
            {
                ...sessionData,
                status: 'pending', // Flags it for the teacher to validate
            }
        ])
        .select();

    if (error) {
        console.error("Error inserting student session:", error);
        throw error;
    }

    return data;
};

export interface RubricEvaluation {
    looking_at_objects: number;
    concentrating: number;
    performing_task: number;
    following_instructions: number;
    completed_work: number;
}

export const validateSession = async (
    sessionId: string,
    rubricEvaluation: RubricEvaluation,
    teacherFeedback: string,
    isEdit: boolean = false
) => {
    const updateData: any = {
        rubric_evaluation: rubricEvaluation,
        teacher_feedback: teacherFeedback,
        status: 'validated',
    };

    if (!isEdit) {
        updateData.validated_at = new Date().toISOString();
    }

    const { data, error } = await supabase
        .from('student_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .select()
        .single();

    if (error) {
        console.error("Error validating student session:", error);
        throw new Error(error.message || "Failed to validate session");
    }

    // Trigger Notification for Parent
    if (data?.student_id) {
        try {
            const { data: student } = await supabase
                .from('students')
                .select('name')
                .eq('id', data.student_id)
                .maybeSingle();

            const studentName = student?.name || 'your child';
            const categoryName = data.category || 'an';
            const feedbackText = teacherFeedback.trim()
                ? `"${teacherFeedback.trim().slice(0, 90)}${teacherFeedback.length > 90 ? '...' : ''}"`
                : 'Teacher provided evaluation remarks.';

            await createNotification({
                studentId: data.student_id,
                title: isEdit ? 'Feedback Updated' : 'New Feedback Received',
                message: isEdit
                    ? `Teacher updated feedback for ${studentName} on ${categoryName} activity: ${feedbackText}`
                    : `Teacher submitted feedback for ${studentName} on ${categoryName} activity: ${feedbackText}`,
                type: 'feedback',
                metadata: { session_id: sessionId },
            });
        } catch (notifErr) {
            console.error('[NOTIFICATIONS] Failed sending feedback notification:', notifErr);
        }
    }

    return data;
};

// Fetch the very latest session for a specific student
export const getLatestStudentSession = async (studentId: string) => {
    const { data, error } = await supabase
        .from('student_sessions')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Error fetching latest student session:", error);
        throw new Error(error.message);
    }

    return data && data.length > 0 ? data[0] : null;
};

export const getStudentHistoricalBaseline = async (
    studentId: string,
    category: string,
    subCategory?: string
): Promise<{ lastPath: string; previousMistakes: number } | null> => {
    try {
        if (!studentId || !category) return null;

        const isTracing = category.toLowerCase().includes('tracing') || category.toLowerCase().includes('fine motor');

        const { data, error } = await supabase
            .from('student_sessions')
            .select('*')
            .eq('student_id', studentId)
            .eq('category', category)
            .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
            return null;
        }

        // For non-tracing categories (Matching, Bubble Pop, Pick 'n Choose), filter to sessions matching the specific subcategory
        let record = data[0];
        if (!isTracing && subCategory && subCategory.trim()) {
            const cleanSub = subCategory.toLowerCase().trim();
            const matchingRecord = data.find((r) => {
                if (r.sub_category && r.sub_category.toLowerCase().includes(cleanSub)) {
                    return true;
                }
                const rawPaths = r.activity_path || r.activity_paths;
                if (Array.isArray(rawPaths)) {
                    return rawPaths.some((p: string) => p.toLowerCase().includes(cleanSub));
                }
                if (typeof rawPaths === 'string') {
                    return rawPaths.toLowerCase().includes(cleanSub);
                }
                return false;
            });

            if (!matchingRecord) {
                // Student has no prior baseline for this specific subcategory, start at Level 1
                return null;
            }
            record = matchingRecord;
        }

        const rawPaths = record.activity_path || record.activity_paths;
        let lastPath: string | null = null;
        if (Array.isArray(rawPaths) && rawPaths.length > 0) {
            lastPath = rawPaths[rawPaths.length - 1];
        } else if (typeof rawPaths === 'string' && rawPaths.trim()) {
            lastPath = rawPaths.trim();
        }

        if (!lastPath) {
            return null;
        }

        const previousMistakes = typeof record.mistakes === 'number' ? record.mistakes : 0;

        return {
            lastPath,
            previousMistakes,
        };
    } catch (err) {
        console.error("Error in getStudentHistoricalBaseline:", err);
        return null;
    }
};