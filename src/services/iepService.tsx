import { supabase } from '../lib/supabase';
import { createNotification } from './notifications';

export interface IEPGoal {
  id: string;
  studentId: string;
  domainName: string;
  title: string;
  description: string;
  status: 'Target Set' | 'In Progress' | 'Achieved';
  targetDate: string;
}

// 1. Fetch IEP Goals for a specific student
export const getStudentIEPGoals = async (studentId: string): Promise<IEPGoal[]> => {
  const { data, error } = await supabase
    .from('iep_goals')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching IEP Goals:', error.message);
    return [];
  }

  return (data || []).map((g: any) => ({
    id: g.id,
    studentId: g.student_id,
    domainName: g.domain_name,
    title: g.title,
    description: g.description || '',
    status: g.status,
    targetDate: g.target_date || new Date(g.created_at).toLocaleDateString(),
  }));
};

// 2. Create a new IEP Goal
export const createIEPGoal = async (
  studentId: string,
  domainName: string,
  title: string,
  description: string,
  targetDate: string
) => {
  const { data, error } = await supabase.from('iep_goals').insert([
    {
      student_id: studentId,
      domain_name: domainName,
      title: title,
      description: description,
      status: 'Target Set',
      target_date: targetDate,
    },
  ]).select().single();

  if (error) throw new Error(error.message);

  if (data?.student_id) {
    try {
      const { data: student } = await supabase
        .from('students')
        .select('name')
        .eq('id', data.student_id)
        .maybeSingle();

      const studentName = student?.name || 'Learner';

      await createNotification({
        studentId: data.student_id,
        title: 'New Milestone Goal',
        message: `Teacher added a new milestone for ${studentName}: "${title}"`,
        type: 'milestone',
        metadata: { goal_id: data.id, status: 'Target Set', target_date: data.target_date || targetDate },
      });
    } catch (notifErr) {
      console.error('[NOTIFICATIONS] Error sending IEP goal creation notification:', notifErr);
    }
  }

  return data;
};

// 3. Update Status (Target Set -> In Progress -> Achieved)
export const updateIEPGoalStatus = async (goalId: string, status: string) => {
  const { data: goalData, error } = await supabase
    .from('iep_goals')
    .update({ status: status, updated_at: new Date().toISOString() })
    .eq('id', goalId)
    .select('student_id, title, target_date')
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (goalData?.student_id) {
    try {
      const { data: student } = await supabase
        .from('students')
        .select('name')
        .eq('id', goalData.student_id)
        .maybeSingle();

      const studentName = student?.name || 'Learner';
      const goalTitle = goalData.title || 'Milestone';

      let notifTitle = 'Milestone Updated';
      let notifMsg = `Teacher updated milestone "${goalTitle}" for ${studentName}.`;

      if (status === 'In Progress') {
        notifTitle = 'Milestone In Progress';
        notifMsg = `Teacher marked milestone "${goalTitle}" for ${studentName} as In Progress.`;
      } else if (status === 'Achieved') {
        notifTitle = 'Milestone Completed! 🎉';
        notifMsg = `Teacher marked milestone "${goalTitle}" for ${studentName} as Completed!`;
      }

      await createNotification({
        studentId: goalData.student_id,
        title: notifTitle,
        message: notifMsg,
        type: 'milestone',
        metadata: { goal_id: goalId, status, target_date: goalData.target_date },
      });
    } catch (notifErr) {
      console.error('[NOTIFICATIONS] Error sending IEP goal notification:', notifErr);
    }
  }
};

// 4. Delete an IEP Goal
export const deleteIEPGoal = async (goalId: string) => {
  const { error } = await supabase.from('iep_goals').delete().eq('id', goalId);

  if (error) throw new Error(error.message);
};