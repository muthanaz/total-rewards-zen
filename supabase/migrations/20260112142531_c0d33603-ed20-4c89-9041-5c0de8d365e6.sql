-- Create a vendors table to store vendor information
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  commission_rate NUMERIC DEFAULT 10,
  logo_url TEXT,
  description TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  total_revenue NUMERIC DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a table for vendor transactions (for commission tracking)
CREATE TABLE public.vendor_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES public.marketplace_offers(id),
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'redemption',
  code_used TEXT,
  original_amount NUMERIC NOT NULL,
  discount_amount NUMERIC,
  commission_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  settled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create platform analytics table (for admin benchmarking data)
CREATE TABLE public.platform_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  region TEXT,
  industry TEXT,
  company_size TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create saved reports table for admin
CREATE TABLE public.admin_saved_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  filters JSONB,
  data_snapshot JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_saved_reports ENABLE ROW LEVEL SECURITY;

-- Vendors RLS: Vendors can view/update their own record, admins can view all
CREATE POLICY "Vendors can view own record" ON public.vendors
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Vendors can update own record" ON public.vendors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert vendors" ON public.vendors
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete vendors" ON public.vendors
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Vendor transactions RLS
CREATE POLICY "Vendors can view own transactions" ON public.vendor_transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.vendors WHERE vendors.id = vendor_transactions.vendor_id AND vendors.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage transactions" ON public.vendor_transactions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Platform analytics RLS: Only admins
CREATE POLICY "Only admins can view analytics" ON public.platform_analytics
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert analytics" ON public.platform_analytics
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update analytics" ON public.platform_analytics
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete analytics" ON public.platform_analytics
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin saved reports RLS
CREATE POLICY "Admins can view own reports" ON public.admin_saved_reports
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') AND auth.uid() = admin_user_id);

CREATE POLICY "Admins can insert own reports" ON public.admin_saved_reports
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') AND auth.uid() = admin_user_id);

CREATE POLICY "Admins can update own reports" ON public.admin_saved_reports
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin') AND auth.uid() = admin_user_id);

CREATE POLICY "Admins can delete own reports" ON public.admin_saved_reports
  FOR DELETE USING (public.has_role(auth.uid(), 'admin') AND auth.uid() = admin_user_id);

-- Add vendor_id to marketplace_offers for vendor management
ALTER TABLE public.marketplace_offers ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.vendors(id);

-- Create policy for vendors to manage their own offers
CREATE POLICY "Vendors can view own offers" ON public.marketplace_offers
  FOR SELECT USING (
    vendor_id IS NULL OR 
    EXISTS (SELECT 1 FROM public.vendors WHERE vendors.id = marketplace_offers.vendor_id AND vendors.user_id = auth.uid())
  );

CREATE POLICY "Vendors can insert own offers" ON public.marketplace_offers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.vendors WHERE vendors.id = vendor_id AND vendors.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Vendors can update own offers" ON public.marketplace_offers
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.vendors WHERE vendors.id = marketplace_offers.vendor_id AND vendors.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Vendors can delete own offers" ON public.marketplace_offers
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.vendors WHERE vendors.id = marketplace_offers.vendor_id AND vendors.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );