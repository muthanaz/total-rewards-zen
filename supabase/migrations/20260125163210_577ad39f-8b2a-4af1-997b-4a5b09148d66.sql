-- Create employee_budget_items table for Money Snapshot feature
CREATE TABLE public.employee_budget_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  month text NOT NULL, -- YYYY-MM format
  item_type text NOT NULL CHECK (item_type IN ('commitment', 'savings_goal', 'other_income')),
  category text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  source text NOT NULL DEFAULT 'employee_input' CHECK (source IN ('employee_input', 'payroll', 'policy')),
  confidence text NOT NULL DEFAULT 'employee_reported' CHECK (confidence IN ('employee_reported', 'measured', 'estimated')),
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_employee_budget_items_user_month ON public.employee_budget_items(user_id, month);

-- Enable RLS
ALTER TABLE public.employee_budget_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies: ONLY the employee can access their own budget items
-- No employer/admin/vendor access allowed

CREATE POLICY "Employees can view their own budget items"
ON public.employee_budget_items
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Employees can insert their own budget items"
ON public.employee_budget_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employees can update their own budget items"
ON public.employee_budget_items
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Employees can delete their own budget items"
ON public.employee_budget_items
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_employee_budget_items_updated_at
BEFORE UPDATE ON public.employee_budget_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();