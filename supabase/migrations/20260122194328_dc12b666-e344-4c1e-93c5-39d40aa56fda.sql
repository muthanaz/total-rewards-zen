-- Fix Security Definer Views - Convert to Security Invoker
-- This ensures RLS policies of the querying user are respected

-- 1. Fix waiver_analytics view
DROP VIEW IF EXISTS public.waiver_analytics;
CREATE VIEW public.waiver_analytics 
WITH (security_invoker = on)
AS
SELECT 
  rd.policy_version_id,
  pv.policy_id,
  p.title as policy_title,
  p.category as policy_category,
  p.organization_id,
  rd.waiver_reason_category,
  COUNT(*) as waiver_count,
  COUNT(*) FILTER (WHERE rd.status = 'waived') as total_waived,
  COUNT(*) FILTER (WHERE rd.was_conditionally_required = true) as conditional_waivers,
  DATE_TRUNC('month', rd.verified_at) as waiver_month
FROM public.request_documents rd
JOIN public.requests r ON r.id = rd.request_id
LEFT JOIN public.policy_versions pv ON pv.id = rd.policy_version_id
LEFT JOIN public.policies p ON p.id = pv.policy_id
WHERE rd.status = 'waived'
GROUP BY 
  rd.policy_version_id,
  pv.policy_id,
  p.title,
  p.category,
  p.organization_id,
  rd.waiver_reason_category,
  DATE_TRUNC('month', rd.verified_at);

GRANT SELECT ON public.waiver_analytics TO authenticated;

-- 2. Fix overlapping_policies view
DROP VIEW IF EXISTS public.overlapping_policies;
CREATE VIEW public.overlapping_policies 
WITH (security_invoker = on)
AS
SELECT 
  p1.id as policy_1_id,
  p1.title as policy_1_title,
  p1.category as policy_1_category,
  p1.priority as policy_1_priority,
  p2.id as policy_2_id,
  p2.title as policy_2_title,
  p2.category as policy_2_category,
  p2.priority as policy_2_priority,
  p1.organization_id,
  'Same category with overlapping effective dates' as conflict_reason
FROM public.policies p1
JOIN public.policies p2 ON 
  p1.organization_id = p2.organization_id
  AND p1.category = p2.category
  AND p1.id < p2.id
  AND p1.is_active = true
  AND p2.is_active = true
  AND p1.status = 'published'
  AND p2.status = 'published'
  AND (
    (p1.effective_to IS NULL AND p2.effective_to IS NULL)
    OR (p1.effective_to IS NULL AND p2.effective_from <= CURRENT_DATE)
    OR (p2.effective_to IS NULL AND p1.effective_from <= CURRENT_DATE)
    OR (p1.effective_from <= COALESCE(p2.effective_to, CURRENT_DATE + INTERVAL '100 years')
        AND p2.effective_from <= COALESCE(p1.effective_to, CURRENT_DATE + INTERVAL '100 years'))
  );

GRANT SELECT ON public.overlapping_policies TO authenticated;

-- 3. Fix request_document_summary view
DROP VIEW IF EXISTS public.request_document_summary;
CREATE VIEW public.request_document_summary 
WITH (security_invoker = on)
AS
SELECT 
  request_id,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_required = true) as required_count,
  COUNT(*) FILTER (WHERE status = 'provided' OR status = 'verified') as provided_count,
  COUNT(*) FILTER (WHERE status = 'missing') as missing_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  COUNT(*) FILTER (WHERE status = 'pending_review') as pending_review_count,
  COUNT(*) FILTER (WHERE status = 'waived') as waived_count,
  COUNT(*) FILTER (WHERE was_conditionally_required = true) as conditional_count,
  CASE 
    WHEN COUNT(*) FILTER (WHERE is_required = true AND status = 'missing') = 0 
    THEN true 
    ELSE false 
  END as all_required_complete,
  CASE 
    WHEN COUNT(*) FILTER (WHERE is_required = true) > 0 
    THEN ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'waived') / COUNT(*) FILTER (WHERE is_required = true), 1)
    ELSE 0
  END as waiver_rate_pct
FROM public.request_documents
GROUP BY request_id;

GRANT SELECT ON public.request_document_summary TO authenticated;