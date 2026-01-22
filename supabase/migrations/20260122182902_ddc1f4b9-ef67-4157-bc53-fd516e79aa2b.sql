-- Fix security definer view by recreating with security_invoker = true
DROP VIEW IF EXISTS public.request_document_summary;
CREATE VIEW public.request_document_summary 
WITH (security_invoker = true) AS
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