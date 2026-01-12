-- Step 1: First add the column to profiles (without the FK initially)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS organization_id UUID;