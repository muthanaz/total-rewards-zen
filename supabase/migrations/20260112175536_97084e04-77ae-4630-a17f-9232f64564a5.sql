-- Fix 1: Add feedback length constraint to prevent excessive data storage
ALTER TABLE public.employee_satisfaction_ratings 
ADD CONSTRAINT feedback_length CHECK (length(feedback) <= 1000);

-- Fix 2: Add write protection policies to user_roles table
-- Block all direct inserts from regular users (only SECURITY DEFINER functions can insert)
CREATE POLICY "Block direct role inserts" ON public.user_roles
  FOR INSERT WITH CHECK (false);

-- Only admins can update roles
CREATE POLICY "Only admins can update roles" ON public.user_roles
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::user_role));

-- Only admins can delete roles  
CREATE POLICY "Only admins can delete roles" ON public.user_roles
  FOR DELETE USING (has_role(auth.uid(), 'admin'::user_role));