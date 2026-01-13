-- Create per diem rates table for managing daily travel allowances
CREATE TABLE public.per_diem_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_type TEXT NOT NULL CHECK (destination_type IN ('domestic', 'international')),
  region TEXT NOT NULL, -- e.g., 'UAE', 'GCC', 'Europe', 'North America', 'Asia Pacific', etc.
  country TEXT, -- specific country for international travel
  city TEXT, -- specific city for city-specific rates
  grade TEXT NOT NULL, -- employee grade this rate applies to
  daily_accommodation NUMERIC NOT NULL DEFAULT 0,
  daily_meals NUMERIC NOT NULL DEFAULT 0,
  daily_incidentals NUMERIC NOT NULL DEFAULT 0,
  daily_transport NUMERIC NOT NULL DEFAULT 0,
  daily_total NUMERIC GENERATED ALWAYS AS (daily_accommodation + daily_meals + daily_incidentals + daily_transport) STORED,
  currency TEXT NOT NULL DEFAULT 'AED',
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_until DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create per diem claims table for tracking employee per diem requests
CREATE TABLE public.per_diem_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trip_purpose TEXT NOT NULL,
  destination_type TEXT NOT NULL CHECK (destination_type IN ('domestic', 'international')),
  destination_country TEXT NOT NULL,
  destination_city TEXT,
  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  number_of_days INTEGER GENERATED ALWAYS AS (return_date - departure_date + 1) STORED,
  rate_id UUID REFERENCES public.per_diem_rates(id),
  accommodation_amount NUMERIC NOT NULL DEFAULT 0,
  meals_amount NUMERIC NOT NULL DEFAULT 0,
  incidentals_amount NUMERIC NOT NULL DEFAULT 0,
  transport_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC GENERATED ALWAYS AS (accommodation_amount + meals_amount + incidentals_amount + transport_amount) STORED,
  currency TEXT NOT NULL DEFAULT 'AED',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  trip_reference TEXT, -- reference to travel booking or expense report
  receipts_attached BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create benefit_grade_eligibility table for detailed grade-based benefit configuration
CREATE TABLE public.benefit_grade_eligibility (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  benefit_id UUID NOT NULL REFERENCES public.benefits(id) ON DELETE CASCADE,
  grade TEXT NOT NULL,
  is_eligible BOOLEAN NOT NULL DEFAULT true,
  annual_allowance NUMERIC, -- null means use default from benefit
  max_claim_per_transaction NUMERIC,
  coverage_percent NUMERIC CHECK (coverage_percent >= 0 AND coverage_percent <= 100),
  waiting_period_days INTEGER DEFAULT 0,
  requires_documentation BOOLEAN DEFAULT true,
  dependent_coverage TEXT CHECK (dependent_coverage IN ('employee_only', 'employee_spouse', 'employee_children', 'full_family')),
  max_dependents INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(benefit_id, grade)
);

-- Enable RLS
ALTER TABLE public.per_diem_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.per_diem_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_grade_eligibility ENABLE ROW LEVEL SECURITY;

-- Policies for per_diem_rates (read by all authenticated, managed by admin/employer)
CREATE POLICY "Authenticated users can view per diem rates"
ON public.per_diem_rates FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Employers can manage per diem rates"
ON public.per_diem_rates FOR ALL
USING (has_role(auth.uid(), 'employer'::user_role) OR has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'employer'::user_role) OR has_role(auth.uid(), 'admin'::user_role));

-- Policies for per_diem_claims
CREATE POLICY "Users can view own per diem claims"
ON public.per_diem_claims FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own per diem claims"
ON public.per_diem_claims FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending claims"
ON public.per_diem_claims FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Employers can view org per diem claims"
ON public.per_diem_claims FOR SELECT
USING (has_role(auth.uid(), 'employer'::user_role) AND is_same_organization(user_id));

CREATE POLICY "Employers can update org per diem claims"
ON public.per_diem_claims FOR UPDATE
USING (has_role(auth.uid(), 'employer'::user_role) AND is_same_organization(user_id));

-- Policies for benefit_grade_eligibility
CREATE POLICY "Authenticated users can view benefit eligibility"
ON public.benefit_grade_eligibility FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Employers can manage benefit eligibility"
ON public.benefit_grade_eligibility FOR ALL
USING (has_role(auth.uid(), 'employer'::user_role) OR has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'employer'::user_role) OR has_role(auth.uid(), 'admin'::user_role));

-- Create indexes for performance
CREATE INDEX idx_per_diem_rates_grade ON public.per_diem_rates(grade);
CREATE INDEX idx_per_diem_rates_region ON public.per_diem_rates(region);
CREATE INDEX idx_per_diem_claims_user ON public.per_diem_claims(user_id);
CREATE INDEX idx_per_diem_claims_status ON public.per_diem_claims(status);
CREATE INDEX idx_benefit_grade_eligibility_grade ON public.benefit_grade_eligibility(grade);
CREATE INDEX idx_benefit_grade_eligibility_benefit ON public.benefit_grade_eligibility(benefit_id);

-- Add trigger for updated_at
CREATE TRIGGER update_per_diem_rates_updated_at
BEFORE UPDATE ON public.per_diem_rates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_per_diem_claims_updated_at
BEFORE UPDATE ON public.per_diem_claims
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_benefit_grade_eligibility_updated_at
BEFORE UPDATE ON public.benefit_grade_eligibility
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample per diem rates
INSERT INTO public.per_diem_rates (destination_type, region, country, grade, daily_accommodation, daily_meals, daily_incidentals, daily_transport, currency) VALUES
-- Domestic UAE rates by grade
('domestic', 'UAE', 'United Arab Emirates', 'G3', 0, 100, 50, 50, 'AED'),
('domestic', 'UAE', 'United Arab Emirates', 'G4', 0, 120, 60, 60, 'AED'),
('domestic', 'UAE', 'United Arab Emirates', 'G5', 0, 150, 75, 75, 'AED'),
('domestic', 'UAE', 'United Arab Emirates', 'G6', 200, 180, 90, 100, 'AED'),
('domestic', 'UAE', 'United Arab Emirates', 'G7', 300, 200, 100, 120, 'AED'),
('domestic', 'UAE', 'United Arab Emirates', 'G8', 400, 250, 125, 150, 'AED'),
-- International GCC rates by grade
('international', 'GCC', NULL, 'G5', 400, 200, 100, 150, 'AED'),
('international', 'GCC', NULL, 'G6', 500, 250, 125, 175, 'AED'),
('international', 'GCC', NULL, 'G7', 600, 300, 150, 200, 'AED'),
('international', 'GCC', NULL, 'G8', 800, 400, 200, 250, 'AED'),
-- International Europe rates by grade
('international', 'Europe', NULL, 'G5', 600, 300, 150, 200, 'AED'),
('international', 'Europe', NULL, 'G6', 800, 400, 200, 250, 'AED'),
('international', 'Europe', NULL, 'G7', 1000, 500, 250, 300, 'AED'),
('international', 'Europe', NULL, 'G8', 1200, 600, 300, 350, 'AED'),
-- International North America rates by grade
('international', 'North America', NULL, 'G5', 700, 350, 175, 225, 'AED'),
('international', 'North America', NULL, 'G6', 900, 450, 225, 275, 'AED'),
('international', 'North America', NULL, 'G7', 1100, 550, 275, 325, 'AED'),
('international', 'North America', NULL, 'G8', 1400, 700, 350, 400, 'AED'),
-- International Asia Pacific rates by grade
('international', 'Asia Pacific', NULL, 'G5', 500, 250, 125, 175, 'AED'),
('international', 'Asia Pacific', NULL, 'G6', 650, 325, 160, 215, 'AED'),
('international', 'Asia Pacific', NULL, 'G7', 800, 400, 200, 250, 'AED'),
('international', 'Asia Pacific', NULL, 'G8', 1000, 500, 250, 300, 'AED');