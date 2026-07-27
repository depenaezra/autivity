import { supabase } from '../lib/supabase';

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
  ]);

  if (error) throw new Error(error.message);
  return data;
};

// 3. Update Status (Target Set -> In Progress -> Achieved)
export const updateIEPGoalStatus = async (goalId: string, status: string) => {
  const { error } = await supabase
    .from('iep_goals')
    .update({ status: status, updated_at: new Date().toISOString() })
    .eq('id', goalId);

  if (error) throw new Error(error.message);
};

// 4. Delete an IEP Goal
export const deleteIEPGoal = async (goalId: string) => {
  const { error } = await supabase.from('iep_goals').delete().eq('id', goalId);

  if (error) throw new Error(error.message);
};