-- Add employer_view_mode to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS employer_view_mode text DEFAULT 'operational' 
CHECK (employer_view_mode IN ('operational', 'executive'));