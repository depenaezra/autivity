-- ========================================================
-- 1. Create table for Standard Milestone Templates
-- ========================================================
CREATE TABLE IF NOT EXISTS public.teacher_milestone_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================================
-- 2. Link student_milestones to teacher_milestone_templates
-- ========================================================
-- Adding template_id safely without breaking existing records
ALTER TABLE public.student_milestones 
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.teacher_milestone_templates(id) ON DELETE SET NULL;

-- ========================================================
-- 3. Enable Row-Level Security (RLS)
-- ========================================================
ALTER TABLE public.teacher_milestone_templates ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- 4. Create RLS Policies (Teachers manage their own templates)
-- ========================================================
DROP POLICY IF EXISTS "Teachers can view their own milestone templates" ON public.teacher_milestone_templates;
CREATE POLICY "Teachers can view their own milestone templates"
    ON public.teacher_milestone_templates
    FOR SELECT
    USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can insert their own milestone templates" ON public.teacher_milestone_templates;
CREATE POLICY "Teachers can insert their own milestone templates"
    ON public.teacher_milestone_templates
    FOR INSERT
    WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can update their own milestone templates" ON public.teacher_milestone_templates;
CREATE POLICY "Teachers can update their own milestone templates"
    ON public.teacher_milestone_templates
    FOR UPDATE
    USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can delete their own milestone templates" ON public.teacher_milestone_templates;
CREATE POLICY "Teachers can delete their own milestone templates"
    ON public.teacher_milestone_templates
    FOR DELETE
    USING (auth.uid() = teacher_id);
