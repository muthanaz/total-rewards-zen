-- ==============================================
-- EMPLOYER ACTIONS TABLE (B4 - Action Plan)
-- ==============================================

-- Create employer_actions table for insight-to-action tracking
CREATE TABLE public.employer_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metric_keys TEXT[] DEFAULT '{}',
  expected_impact JSONB DEFAULT '{}',
  owner_user_id UUID,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'blocked', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  due_date DATE,
  source_insight TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.employer_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employer_actions
CREATE POLICY "Users can view their org actions"
ON public.employer_actions FOR SELECT
USING (
  organization_id = public.get_user_organization_id(auth.uid())
  AND (public.has_role(auth.uid(), 'employer'::user_role) OR public.has_role(auth.uid(), 'admin'::user_role))
);

CREATE POLICY "Users can create actions for their org"
ON public.employer_actions FOR INSERT
WITH CHECK (
  organization_id = public.get_user_organization_id(auth.uid())
  AND (public.has_role(auth.uid(), 'employer'::user_role) OR public.has_role(auth.uid(), 'admin'::user_role))
);

CREATE POLICY "Users can update their org actions"
ON public.employer_actions FOR UPDATE
USING (
  organization_id = public.get_user_organization_id(auth.uid())
  AND (public.has_role(auth.uid(), 'employer'::user_role) OR public.has_role(auth.uid(), 'admin'::user_role))
);

CREATE POLICY "Users can delete their org actions"
ON public.employer_actions FOR DELETE
USING (
  organization_id = public.get_user_organization_id(auth.uid())
  AND (public.has_role(auth.uid(), 'employer'::user_role) OR public.has_role(auth.uid(), 'admin'::user_role))
);

-- Create trigger for updated_at
CREATE TRIGGER update_employer_actions_updated_at
BEFORE UPDATE ON public.employer_actions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_employer_actions_org_id ON public.employer_actions(organization_id);
CREATE INDEX idx_employer_actions_status ON public.employer_actions(status);
CREATE INDEX idx_employer_actions_due_date ON public.employer_actions(due_date);

-- ==============================================
-- SEED METRIC DEFINITIONS (C8 - Expand metrics)
-- ==============================================

-- Upsert additional metric definitions
INSERT INTO public.metric_definitions (key, name_en, name_ar, definition_en, definition_ar, formula_en, formula_ar, source, owner_role, min_sample_size, confidence_rules)
VALUES 
  ('utilization_rate', 'Utilization Rate', 'معدل الاستخدام', 
   'Percentage of allocated benefits budget actually claimed by employees.',
   'نسبة ميزانية المزايا المخصصة التي طالب بها الموظفون فعلياً.',
   '(Total Claimed / Total Allocated) × 100',
   '(إجمالي المطالبات / إجمالي المخصص) × 100',
   'benefit_entitlements + utilization_events', 'employer', 10,
   '{"high": "n >= 50 and data_age < 7d", "medium": "n >= 10 and data_age < 30d", "low": "n < 10 or data_age >= 30d"}'),
  
  ('effective_spend', 'Effective Spend', 'الإنفاق الفعال',
   'Budget spent on benefits that were actually used by employees (excluding waste).',
   'الميزانية المنفقة على المزايا التي استخدمها الموظفون فعلياً (باستثناء الهدر).',
   'Total Spend - Identified Waste',
   'إجمالي الإنفاق - الهدر المحدد',
   'utilization_events + waste_analysis', 'employer', 20,
   '{"high": "waste_audit_complete", "medium": "estimated", "low": "no_waste_data"}'),
  
  ('waste_spend', 'Waste Spend', 'الإنفاق المهدر',
   'Budget allocated but not claimed, or spent on unused benefits.',
   'الميزانية المخصصة ولكن لم تُطالب، أو أُنفقت على مزايا غير مستخدمة.',
   'Unused Allocations + Expired Claims + Over-provisions',
   'المخصصات غير المستخدمة + المطالبات المنتهية + الإفراط في التوفير',
   'benefit_entitlements + utilization_events', 'employer', 20,
   '{"high": "audit_complete", "medium": "estimated_15pct", "low": "no_audit"}'),
  
  ('satisfaction_score', 'Employee Satisfaction', 'رضا الموظفين',
   'Average rating from employee satisfaction surveys (1-5 scale). Requires minimum 5 responses for anonymity.',
   'متوسط التقييم من استطلاعات رضا الموظفين (مقياس 1-5). يتطلب 5 ردود على الأقل للحفاظ على السرية.',
   'AVG(rating) where sample_size >= 5',
   'متوسط(التقييم) حيث حجم العينة >= 5',
   'employee_satisfaction_ratings', 'employer', 5,
   '{"high": "n >= 30", "medium": "n >= 5 and n < 30", "low": "n < 5"}'),
  
  ('program_score', 'Program Health Index', 'مؤشر صحة البرنامج',
   'Composite score indicating overall benefits program health. Weighted average of utilization, satisfaction, cost efficiency, and compliance.',
   'درجة مركبة تشير إلى صحة برنامج المزايا الإجمالية. المتوسط المرجح للاستخدام والرضا وكفاءة التكلفة والامتثال.',
   '(Utilization × 0.25) + (Satisfaction × 0.25) + (CostEfficiency × 0.30) + (Compliance × 0.20)',
   '(الاستخدام × 0.25) + (الرضا × 0.25) + (كفاءة التكلفة × 0.30) + (الامتثال × 0.20)',
   'calculated_composite', 'employer', 10,
   '{"high": "all_sources_high", "medium": "some_sources_medium", "low": "any_source_low"}'),
  
  ('retention_rate', 'Employee Retention Rate', 'معدل الاحتفاظ بالموظفين',
   'Percentage of employees retained over a period. Requires HRIS integration for accurate data.',
   'نسبة الموظفين المحتفظ بهم خلال فترة زمنية. يتطلب تكامل نظام الموارد البشرية للبيانات الدقيقة.',
   '((Employees at End - New Hires) / Employees at Start) × 100',
   '((الموظفون في النهاية - التعيينات الجديدة) / الموظفون في البداية) × 100',
   'hris_integration_required', 'employer', 50,
   '{"high": "hris_integrated", "medium": "manual_entry", "low": "not_integrated"}'),
  
  ('cost_per_employee', 'Cost Per Employee', 'التكلفة لكل موظف',
   'Average benefits cost per employee for the selected period.',
   'متوسط تكلفة المزايا لكل موظف للفترة المحددة.',
   'Total Benefits Spend / Active Employees',
   'إجمالي إنفاق المزايا / الموظفون النشطون',
   'org_budgets + profiles', 'employer', 10,
   '{"high": "budget_set", "medium": "estimated", "low": "no_budget"}'),
  
  ('processing_time', 'Average Processing Time', 'متوسط وقت المعالجة',
   'Average number of days to process and approve/reject employee requests.',
   'متوسط عدد الأيام لمعالجة طلبات الموظفين والموافقة عليها أو رفضها.',
   'AVG(reviewed_at - created_at) in days',
   'متوسط(تاريخ المراجعة - تاريخ الإنشاء) بالأيام',
   'requests', 'employer', 5,
   '{"high": "n >= 20", "medium": "n >= 5", "low": "n < 5"}'),
  
  ('total_requests', 'Total Requests', 'إجمالي الطلبات',
   'Count of all employee requests and claims.',
   'عدد جميع طلبات ومطالبات الموظفين.',
   'COUNT(requests)',
   'عدد(الطلبات)',
   'requests', 'employer', 1,
   '{"high": "n >= 1", "medium": "n >= 1", "low": "n = 0"}')
ON CONFLICT (key) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  definition_en = EXCLUDED.definition_en,
  definition_ar = EXCLUDED.definition_ar,
  formula_en = EXCLUDED.formula_en,
  formula_ar = EXCLUDED.formula_ar,
  source = EXCLUDED.source,
  owner_role = EXCLUDED.owner_role,
  min_sample_size = EXCLUDED.min_sample_size,
  confidence_rules = EXCLUDED.confidence_rules,
  updated_at = now();