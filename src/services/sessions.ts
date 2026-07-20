import { supabase } from '../lib/supabase';

interface SessionPayload {
    student_id: string;
    class_id: string;
    teacher_id: string;
    activity_path: string[]; // text[] in DB — stores all paths of a completed set
    category: string;
    skill_domain: string | string[];
    score: number;
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
    teacherFeedback: string
) => {
    const { data, error } = await supabase
        .from('student_sessions')
        .update({
            rubric_evaluation: rubricEvaluation,
            teacher_feedback: teacherFeedback,
            status: 'validated',
            validated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();

    if (error) {
        console.error("Error validating student session:", error);
        throw new Error(error.message || "Failed to validate session");
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