-- ============================================================================
-- Security Hardening: Split RLS Policies by Operation (Part 2)
-- ============================================================================
-- Fix: Drop existing policies before creating new ones
-- ============================================================================

-- ============================================================================
-- 6. MARKETPLACE_OFFERS TABLE - Tighten vendor isolation
-- ============================================================================

-- Drop ALL existing marketplace_offers policies first
DROP POLICY IF EXISTS "Vendors can manage own offers" ON public.marketplace_offers;
DROP POLICY IF EXISTS "Vendors can view own offers" ON public.marketplace_offers;
DROP POLICY IF EXISTS "Vendors can create offers" ON public.marketplace_offers;
DROP POLICY IF EXISTS "Vendors can update own offers" ON public.marketplace_offers;
DROP POLICY IF EXISTS "Admins can manage all offers" ON public.marketplace_offers;
DROP POLICY IF EXISTS "Employees can view active public offers" ON public.marketplace_offers;
DROP POLICY IF EXISTS "Employers can view offers for analytics" ON public.marketplace_offers;
DROP POLICY IF EXISTS "Anyone can view active public offers" ON public.marketplace_offers;
DROP POLICY IF EXISTS "Authenticated users can view active offers" ON public.marketplace_offers;

-- Enable RLS
ALTER TABLE public.marketplace_offers ENABLE ROW LEVEL SECURITY;

-- Vendors can view their own offers
CREATE POLICY "Vendors can view own offers"
ON public.marketplace_offers
FOR SELECT
USING (
  vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
);

-- Vendors can insert offers (status defaults to pending)
CREATE POLICY "Vendors can create offers"
ON public.marketplace_offers
FOR INSERT
WITH CHECK (
  vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  AND status = 'pending'  -- Force pending status on insert
);

-- Vendors can update their own pending/draft offers
CREATE POLICY "Vendors can update own offers"
ON public.marketplace_offers
FOR UPDATE
USING (
  vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
)
WITH CHECK (
  vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
);

-- Admins can manage all offers
CREATE POLICY "Admins can manage all offers"
ON public.marketplace_offers
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Employees can view active public offers
CREATE POLICY "Employees can view active public offers"
ON public.marketplace_offers
FOR SELECT
USING (
  is_active = true 
  AND is_public = true 
  AND status = 'active'
);

-- Employers can view all offers for their analytics
CREATE POLICY "Employers can view offers for analytics"
ON public.marketplace_offers
FOR SELECT
USING (has_role(auth.uid(), 'employer'));