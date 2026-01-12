-- First migration: Just add the enum values
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'vendor';