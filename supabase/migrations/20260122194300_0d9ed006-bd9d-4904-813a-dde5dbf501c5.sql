-- =============================================================================
-- ENTERPRISE FLEXIBILITY: Schema enhancements for conditional docs, proration,
-- pilot programs, exceptions reporting, and policy conflict resolution
-- =============================================================================

-- 1. Add proration support to policies table (via logic_json in policy_versions)
-- No schema change needed - proration config will be stored in limits_caps within logic_json

-- 2. Add pilot/applicability window and priority fields to policies table
ALTER TABLE public.policies
  ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_pilot boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS pilot_group_ids uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pilot_end_date date DEFAULT NULL;

COMMENT ON COLUMN public.policies.priority IS 'Explicit priority for conflict resolution (higher = takes precedence)';
COMMENT ON COLUMN public.policies.is_pilot IS 'Indicates this is a pilot/temporary benefit';
COMMENT ON COLUMN public.policies.pilot_group_ids IS 'User IDs or group IDs eligible for pilot';
COMMENT ON COLUMN public.policies.pilot_end_date IS 'End date for pilot program (after which reverts to normal)';

-- 3. Add waiver tracking columns to request_documents
ALTER TABLE public.request_documents
  ADD COLUMN IF NOT EXISTS waiver_reason_category text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS was_conditionally_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS condition_evaluation_json jsonb DEFAULT NULL;

COMMENT ON COLUMN public.request_documents.waiver_reason_category IS 'Categorized waiver reason for analytics: missing_receipt, employee_hardship, policy_exception, other';
COMMENT ON COLUMN public.request_documents.was_conditionally_required IS 'True if this doc was required due to condition evaluation (amount threshold, location, etc)';
COMMENT ON COLUMN public.request_documents.condition_evaluation_json IS 'Snapshot of conditions that triggered this doc requirement';

-- Add check constraint for waiver_reason_category
ALTER TABLE public.request_documents
  ADD CONSTRAINT request_documents_waiver_reason_check
  CHECK (waiver_reason_category IS NULL OR waiver_reason_category IN ('missing_receipt', 'employee_hardship', 'policy_exception', 'duplicate_claim', 'other'));

-- 4. Add proration tracking to requests table
ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS prorated_amount numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS proration_factor numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS proration_reason text DEFAULT NULL;

COMMENT ON COLUMN public.requests.prorated_amount IS 'The prorated cap/limit applied (if proration was used)';
COMMENT ON COLUMN public.requests.proration_factor IS 'The proration multiplier applied (0.0-1.0)';
COMMENT ON COLUMN public.requests.proration_reason IS 'Human-readable explanation of proration calculation';

-- 5. Add policy selection reason to requests table
ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS policy_selection_reason text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS had_policy_conflict boolean DEFAULT false;

COMMENT ON COLUMN public.requests.policy_selection_reason IS 'Explanation of why this policy was selected (for conflict resolution audit)';
COMMENT ON COLUMN public.requests.had_policy_conflict IS 'True if multiple policies matched and conflict resolution was applied';

-- 6. Create exceptions analytics view (privacy-safe aggregation)
CREATE OR REPLACE VIEW public.waiver_analytics AS
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

-- Grant select on the view
GRANT SELECT ON public.waiver_analytics TO authenticated;

-- 7. Create policy conflict detection view
CREATE OR REPLACE VIEW public.overlapping_policies AS
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
  AND p1.id < p2.id  -- Avoid duplicates
  AND p1.is_active = true
  AND p2.is_active = true
  AND p1.status = 'published'
  AND p2.status = 'published'
  -- Check for date overlap
  AND (
    (p1.effective_to IS NULL AND p2.effective_to IS NULL)
    OR (p1.effective_to IS NULL AND p2.effective_from <= CURRENT_DATE)
    OR (p2.effective_to IS NULL AND p1.effective_from <= CURRENT_DATE)
    OR (p1.effective_from <= COALESCE(p2.effective_to, CURRENT_DATE + INTERVAL '100 years')
        AND p2.effective_from <= COALESCE(p1.effective_to, CURRENT_DATE + INTERVAL '100 years'))
  );

GRANT SELECT ON public.overlapping_policies TO authenticated;

-- 8. Update request_document_summary view to include waiver analytics
DROP VIEW IF EXISTS public.request_document_summary;
CREATE VIEW public.request_document_summary AS
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
  -- Waiver rate for this request
  CASE 
    WHEN COUNT(*) FILTER (WHERE is_required = true) > 0 
    THEN ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'waived') / COUNT(*) FILTER (WHERE is_required = true), 1)
    ELSE 0
  END as waiver_rate_pct
FROM public.request_documents
GROUP BY request_id;

GRANT SELECT ON public.request_document_summary TO authenticated;