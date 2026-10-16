import { supabase } from '../lib/supabase';

export interface MilestoneTemplate {
  id: string;
  teacherId?: string;
  title: string;
  description: string;
  category?: string;
  createdAt?: string;
}

export const STARTER_MILESTONE_TEMPLATES: { title: string; description: string; category?: string }[] = [
  {
    title: 'Letter Tracing Independence',
    description: 'Demonstrates independent tracing of basic uppercase and lowercase letters without physical prompting.',
    category: 'Fine Motor',
  },
  {
    title: 'Object & Color Identification (80% Accuracy)',
    description: 'Accurately identifies and sorts target objects and primary colors across consecutive learning sessions.',
    category: 'Cognitive',
  },
  {
    title: 'Sustained Task Focus (5 Minutes)',
    description: 'Maintains active attention on digital interactive activities for at least 5 minutes with minimal redirection.',
    category: 'Attention',
  },
  {
    title: 'Autonomous Daily Emotion Check-In',
    description: 'Autonomously self-reports daily emotional state upon tablet launch at the start of class.',
    category: 'Socio-Emotional',
  },
  {
    title: 'Following 2-Step Verbal Instructions',
    description: 'Successfully listens and executes two-step activity prompts with visual guidance.',
    category: 'Communication',
  },
];

/**
 * Fetches all standard milestone templates created by the current teacher.
 */
export const getTeacherMilestoneTemplates = async (): Promise<MilestoneTemplate[]> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  const { data, error } = await supabase
    .from('teacher_milestone_templates')
    .select('*')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[MilestoneTemplates] Error fetching templates:', error);
    throw new Error(error.message);
  }

  return (data || []).map((t) => ({
    id: t.id,
    teacherId: t.teacher_id,
    title: t.title,
    description: t.description || '',
    category: t.category || 'general',
    createdAt: t.created_at,
  }));
};

/**
 * Adds a new milestone template to the teacher's catalog.
 */
export const createMilestoneTemplate = async (
  title: string,
  description: string = '',
  category: string = 'general'
): Promise<MilestoneTemplate> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  const { data, error } = await supabase
    .from('teacher_milestone_templates')
    .insert([
      {
        teacher_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('[MilestoneTemplates] Error creating template:', error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    teacherId: data.teacher_id,
    title: data.title,
    description: data.description || '',
    category: data.category || 'general',
    createdAt: data.created_at,
  };
};

/**
 * Updates an existing milestone template.
 */
export const updateMilestoneTemplate = async (
  id: string,
  title: string,
  description: string = '',
  category: string = 'general'
): Promise<MilestoneTemplate> => {
  const { data, error } = await supabase
    .from('teacher_milestone_templates')
    .update({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[MilestoneTemplates] Error updating template:', error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    teacherId: data.teacher_id,
    title: data.title,
    description: data.description || '',
    category: data.category || 'general',
    createdAt: data.created_at,
  };
};

/**
 * Deletes a milestone template from the teacher's catalog.
 */
export const deleteMilestoneTemplate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('teacher_milestone_templates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[MilestoneTemplates] Error deleting template:', error);
    throw new Error(error.message);
  }
};

/**
 * Seeds starter milestone templates for the teacher if their catalog is empty.
 */
export const seedStarterMilestoneTemplates = async (): Promise<MilestoneTemplate[]> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  const records = STARTER_MILESTONE_TEMPLATES.map((tpl) => ({
    teacher_id: user.id,
    title: tpl.title,
    description: tpl.description,
    category: tpl.category || 'general',
  }));

  const { data, error } = await supabase
    .from('teacher_milestone_templates')
    .insert(records)
    .select();

  if (error) {
    console.error('[MilestoneTemplates] Error seeding starter templates:', error);
    throw new Error(error.message);
  }

  return (data || []).map((t) => ({
    id: t.id,
    teacherId: t.teacher_id,
    title: t.title,
    description: t.description || '',
    category: t.category || 'general',
    createdAt: t.created_at,
  }));
};
