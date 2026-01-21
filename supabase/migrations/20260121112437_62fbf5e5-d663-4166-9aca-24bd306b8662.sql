-- Add missing columns to employer_actions table
ALTER TABLE public.employer_actions 
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_ref_id TEXT,
  ADD COLUMN IF NOT EXISTS confidence_level TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS confidence_note TEXT,
  ADD COLUMN IF NOT EXISTS data_completeness_pct NUMERIC(5,2) DEFAULT 100,
  ADD COLUMN IF NOT EXISTS blockers TEXT[],
  ADD COLUMN IF NOT EXISTS linked_categories TEXT[],
  ADD COLUMN IF NOT EXISTS linked_metrics TEXT[],
  ADD COLUMN IF NOT EXISTS action_type TEXT DEFAULT 'process',
  ADD COLUMN IF NOT EXISTS created_by UUID;

-- Create activity table if not exists
CREATE TABLE IF NOT EXISTS public.employer_action_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_id UUID NOT NULL REFERENCES public.employer_actions(id) ON DELETE CASCADE,
  actor_user_id UUID,
  event_type TEXT NOT NULL,
  event_payload JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table if not exists
CREATE TABLE IF NOT EXISTS public.employer_action_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_id UUID NOT NULL REFERENCES public.employer_actions(id) ON DELETE CASCADE,
  author_user_id UUID,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employer_action_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_action_comments ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employer_actions_status ON public.employer_actions(status);
CREATE INDEX IF NOT EXISTS idx_employer_actions_priority ON public.employer_actions(priority);
CREATE INDEX IF NOT EXISTS idx_employer_action_activity_action ON public.employer_action_activity(action_id);
CREATE INDEX IF NOT EXISTS idx_employer_action_comments_action ON public.employer_action_comments(action_id);

-- RLS Policies for activity
DROP POLICY IF EXISTS "Users can view activity" ON public.employer_action_activity;
CREATE POLICY "Users can view activity" ON public.employer_action_activity
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.employer_actions a WHERE a.id = action_id AND a.organization_id = get_user_organization_id(auth.uid()))
  );

DROP POLICY IF EXISTS "Users can insert activity" ON public.employer_action_activity;
CREATE POLICY "Users can insert activity" ON public.employer_action_activity
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.employer_actions a WHERE a.id = action_id AND a.organization_id = get_user_organization_id(auth.uid()))
  );

-- RLS Policies for comments
DROP POLICY IF EXISTS "Users can view comments" ON public.employer_action_comments;
CREATE POLICY "Users can view comments" ON public.employer_action_comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.employer_actions a WHERE a.id = action_id AND a.organization_id = get_user_organization_id(auth.uid()))
  );

DROP POLICY IF EXISTS "Users can insert comments" ON public.employer_action_comments;
CREATE POLICY "Users can insert comments" ON public.employer_action_comments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.employer_actions a WHERE a.id = action_id AND a.organization_id = get_user_organization_id(auth.uid()))
  );