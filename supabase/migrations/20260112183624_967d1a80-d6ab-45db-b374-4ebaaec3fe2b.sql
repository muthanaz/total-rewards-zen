-- Create table to track failed login attempts for account lockout
CREATE TABLE public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  attempt_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT false
);

-- Create index for efficient lookups
CREATE INDEX idx_login_attempts_email_time ON public.login_attempts(email, attempt_time DESC);
CREATE INDEX idx_login_attempts_ip_time ON public.login_attempts(ip_address, attempt_time DESC);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only allow insert from edge functions (service role)
-- No public access to prevent enumeration attacks
CREATE POLICY "Service role only" ON public.login_attempts
  FOR ALL USING (false);

-- Create table to track account lockouts
CREATE TABLE public.account_lockouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  locked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  locked_until TIMESTAMP WITH TIME ZONE NOT NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  notification_sent BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.account_lockouts ENABLE ROW LEVEL SECURITY;

-- Only allow access from edge functions (service role)
CREATE POLICY "Service role only" ON public.account_lockouts
  FOR ALL USING (false);

-- Create table for MFA enrollment status tracking
CREATE TABLE public.mfa_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  mfa_enabled BOOLEAN NOT NULL DEFAULT false,
  enrolled_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mfa_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own MFA settings
CREATE POLICY "Users can view own MFA settings" ON public.mfa_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own MFA settings
CREATE POLICY "Users can update own MFA settings" ON public.mfa_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own MFA settings
CREATE POLICY "Users can insert own MFA settings" ON public.mfa_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);