-- =============================================================================
-- UNIFIED DOCUMENT MODEL: request_documents as single source of truth
-- =============================================================================

-- 1. Add 'waived' status support and decision_reason column
ALTER TABLE public.request_documents 
  DROP CONSTRAINT IF EXISTS request_documents_status_check;

-- Add decision_reason column for unified reject/waive explanations
ALTER TABLE public.request_documents 
  ADD COLUMN IF NOT EXISTS decision_reason TEXT;

-- Add check constraint for valid statuses
ALTER TABLE public.request_documents 
  ADD CONSTRAINT request_documents_status_check 
  CHECK (status IN ('pending', 'missing', 'pending_review', 'provided', 'verified', 'rejected', 'waived'));

-- 2. Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_request_documents_request_status 
  ON public.request_documents(request_id, status);

CREATE INDEX IF NOT EXISTS idx_request_documents_policy_version 
  ON public.request_documents(policy_version_id);

-- 3. Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_request_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_request_documents_updated_at ON public.request_documents;
CREATE TRIGGER update_request_documents_updated_at
  BEFORE UPDATE ON public.request_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_request_documents_updated_at();

-- 4. Ensure RLS is enabled with proper policies
ALTER TABLE public.request_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to recreate them
DROP POLICY IF EXISTS "request_documents_employee_view" ON public.request_documents;
DROP POLICY IF EXISTS "request_documents_employee_update" ON public.request_documents;
DROP POLICY IF EXISTS "request_documents_employer_all" ON public.request_documents;
DROP POLICY IF EXISTS "request_documents_insert" ON public.request_documents;

-- Employees can view their own request documents
CREATE POLICY "request_documents_employee_view" ON public.request_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.requests r 
      WHERE r.id = request_documents.request_id 
      AND r.user_id = auth.uid()
    )
  );

-- Employees can update their own documents (upload files, change status to pending_review)
CREATE POLICY "request_documents_employee_update" ON public.request_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.requests r 
      WHERE r.id = request_documents.request_id 
      AND r.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.requests r 
      WHERE r.id = request_documents.request_id 
      AND r.user_id = auth.uid()
    )
  );

-- Employers (profiles in same org with employer_view_mode) can view/update all org documents
CREATE POLICY "request_documents_employer_all" ON public.request_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.requests r
      JOIN public.profiles p ON p.organization_id = r.organization_id
      WHERE r.id = request_documents.request_id
      AND p.user_id = auth.uid()
      AND p.employer_view_mode IS NOT NULL
    )
  );

-- System can insert documents (for submission flow)
CREATE POLICY "request_documents_insert" ON public.request_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.requests r 
      WHERE r.id = request_documents.request_id 
      AND (
        r.user_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM public.profiles p 
          WHERE p.user_id = auth.uid() 
          AND p.organization_id = r.organization_id
        )
      )
    )
  );

-- 5. Create view for document counts (useful for dashboards)
DROP VIEW IF EXISTS public.request_document_summary;
CREATE VIEW public.request_document_summary AS
SELECT 
  request_id,
  COUNT(*) FILTER (WHERE is_required = true) as required_count,
  COUNT(*) FILTER (WHERE status = 'provided' OR status = 'verified') as provided_count,
  COUNT(*) FILTER (WHERE status = 'missing') as missing_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  COUNT(*) FILTER (WHERE status = 'pending_review') as pending_review_count,
  COUNT(*) FILTER (WHERE status = 'waived') as waived_count,
  CASE 
    WHEN COUNT(*) FILTER (WHERE is_required = true AND status = 'missing') = 0 
    THEN true 
    ELSE false 
  END as all_required_complete
FROM public.request_documents
GROUP BY request_id;

-- 6. Comment on table and columns for documentation
COMMENT ON TABLE public.request_documents IS 'Unified document checklist for all requests/claims. Single source of truth, replacing legacy claim_docs.';
COMMENT ON COLUMN public.request_documents.status IS 'pending|missing|pending_review|provided|verified|rejected|waived';
COMMENT ON COLUMN public.request_documents.decision_reason IS 'Reason for rejection or waiver decision';
COMMENT ON COLUMN public.request_documents.derivation_reason IS 'Why this document was required (snapshot from policy at submission)';
COMMENT ON COLUMN public.request_documents.source_doc_id IS 'Reference to original policy_required_docs.id for audit trail';