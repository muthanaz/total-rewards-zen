-- Create enum types
CREATE TYPE public.user_role AS ENUM ('employee', 'employer');
CREATE TYPE public.benefit_type AS ENUM ('cash_allowances', 'health_protection', 'time_off_flex', 'growth_career', 'wealth_ownership', 'wellbeing');
CREATE TYPE public.life_area AS ENUM ('home_living', 'family_parenting', 'health', 'money', 'career', 'lifestyle', 'mobility');
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.request_type AS ENUM ('claim', 'request', 'question');

-- User roles table (secure role management)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    date_of_birth DATE,
    nationality TEXT,
    emirates_id TEXT,
    passport_number TEXT,
    blood_type TEXT,
    preferred_language TEXT DEFAULT 'en',
    work_location TEXT,
    home_location TEXT,
    position TEXT,
    department TEXT,
    grade TEXT,
    manager_name TEXT,
    employment_date DATE,
    monthly_salary DECIMAL(12,2),
    marital_status TEXT,
    spouse_name TEXT,
    spouse_employer TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    interests TEXT[],
    pets TEXT[],
    cars TEXT[],
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employers can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'employer'
        )
    );

-- Children table
CREATE TABLE public.children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    school_name TEXT,
    grade TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own children" ON public.children
    FOR ALL USING (auth.uid() = user_id);

-- Benefits table
CREATE TABLE public.benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    benefit_type benefit_type NOT NULL,
    life_area life_area NOT NULL,
    annual_value DECIMAL(12,2),
    policy_bullets TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view benefits" ON public.benefits
    FOR SELECT USING (true);

-- Employee benefit entitlements
CREATE TABLE public.benefit_entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    benefit_id UUID REFERENCES public.benefits(id) ON DELETE CASCADE NOT NULL,
    annual_allowance DECIMAL(12,2) NOT NULL,
    utilized_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, benefit_id)
);

ALTER TABLE public.benefit_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entitlements" ON public.benefit_entitlements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Employers can view all entitlements" ON public.benefit_entitlements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'employer'
        )
    );

-- Utilization events
CREATE TABLE public.utilization_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    benefit_id UUID REFERENCES public.benefits(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    amount DECIMAL(12,2),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.utilization_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events" ON public.utilization_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON public.utilization_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employers can view all events" ON public.utilization_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'employer'
        )
    );

-- Housing listings
CREATE TABLE public.housing_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    area TEXT NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    annual_rent DECIMAL(12,2) NOT NULL,
    rating DECIMAL(3,2),
    amenities TEXT[],
    image_url TEXT,
    bayut_url TEXT,
    property_finder_url TEXT,
    dubizzle_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.housing_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view listings" ON public.housing_listings
    FOR SELECT USING (true);

-- Housing areas with avg rents
CREATE TABLE public.housing_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    avg_rent_studio DECIMAL(12,2),
    avg_rent_1br DECIMAL(12,2),
    avg_rent_2br DECIMAL(12,2),
    avg_rent_3br DECIMAL(12,2),
    commute_to_difc_mins INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.housing_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view areas" ON public.housing_areas
    FOR SELECT USING (true);

-- Schools
CREATE TABLE public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    curriculum TEXT NOT NULL,
    location TEXT NOT NULL,
    grade_range TEXT NOT NULL,
    annual_fee DECIMAL(12,2) NOT NULL,
    rating DECIMAL(3,2),
    facilities TEXT[],
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view schools" ON public.schools
    FOR SELECT USING (true);

-- Health providers
CREATE TABLE public.health_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    provider_type TEXT NOT NULL,
    specialty TEXT,
    area TEXT NOT NULL,
    rating DECIMAL(3,2),
    in_network BOOLEAN DEFAULT true,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.health_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view providers" ON public.health_providers
    FOR SELECT USING (true);

-- Marketplace offers (Perks)
CREATE TABLE public.marketplace_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    merchant TEXT NOT NULL,
    category TEXT NOT NULL,
    discount_percent INTEGER,
    description TEXT,
    terms TEXT,
    image_url TEXT,
    rating DECIMAL(3,2),
    is_active BOOLEAN DEFAULT true,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.marketplace_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view offers" ON public.marketplace_offers
    FOR SELECT USING (true);

-- Perk activations
CREATE TABLE public.perk_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    offer_id UUID REFERENCES public.marketplace_offers(id) ON DELETE CASCADE NOT NULL,
    activated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.perk_activations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own activations" ON public.perk_activations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Employers can view all activations" ON public.perk_activations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'employer'
        )
    );

-- Requests/Claims
CREATE TABLE public.requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    request_type request_type NOT NULL,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(12,2),
    status request_status DEFAULT 'pending',
    reviewer_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests" ON public.requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own requests" ON public.requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employers can view all requests" ON public.requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'employer'
        )
    );

CREATE POLICY "Employers can update requests" ON public.requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'employer'
        )
    );

-- Document generation audit log
CREATE TABLE public.document_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL,
    document_variant TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.document_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audits" ON public.document_audit
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audits" ON public.document_audit
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employers can view all audits" ON public.document_audit
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'employer'
        )
    );

-- Leave balances
CREATE TABLE public.leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    leave_type TEXT NOT NULL,
    total_days INTEGER NOT NULL,
    used_days INTEGER DEFAULT 0,
    year INTEGER DEFAULT EXTRACT(YEAR FROM now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, leave_type, year)
);

ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leave" ON public.leave_balances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Employers can view all leave" ON public.leave_balances
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'employer'
        )
    );

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data ->> 'first_name',
        NEW.raw_user_meta_data ->> 'last_name'
    );
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
        NEW.id,
        COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'employee')
    );
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();