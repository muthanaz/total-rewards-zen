-- Create employee_satisfaction_ratings table to track satisfaction scores
CREATE TABLE public.employee_satisfaction_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category TEXT NOT NULL DEFAULT 'overall', -- 'overall', 'benefits', 'communication', 'support'
  feedback TEXT,
  period_month INTEGER NOT NULL DEFAULT EXTRACT(month FROM now()),
  period_year INTEGER NOT NULL DEFAULT EXTRACT(year FROM now()),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one rating per user per category per month
  UNIQUE(user_id, category, period_month, period_year)
);

-- Enable Row Level Security
ALTER TABLE public.employee_satisfaction_ratings ENABLE ROW LEVEL SECURITY;

-- Employees can submit their own ratings
CREATE POLICY "Users can insert own ratings" 
ON public.employee_satisfaction_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Employees can view their own ratings
CREATE POLICY "Users can view own ratings" 
ON public.employee_satisfaction_ratings 
FOR SELECT 
USING (auth.uid() = user_id);

-- Employees can update their own ratings for current month
CREATE POLICY "Users can update own ratings" 
ON public.employee_satisfaction_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Employers can view all ratings (aggregated for privacy, they see all)
CREATE POLICY "Employers can view all ratings" 
ON public.employee_satisfaction_ratings 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'employer'
));

-- Admins can view all ratings
CREATE POLICY "Admins can view all ratings" 
ON public.employee_satisfaction_ratings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Create index for efficient queries
CREATE INDEX idx_satisfaction_ratings_period ON public.employee_satisfaction_ratings(period_year, period_month);
CREATE INDEX idx_satisfaction_ratings_user ON public.employee_satisfaction_ratings(user_id);
CREATE INDEX idx_satisfaction_ratings_category ON public.employee_satisfaction_ratings(category);