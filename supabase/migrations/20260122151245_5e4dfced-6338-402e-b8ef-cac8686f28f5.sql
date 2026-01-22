-- 1) Table: request_documents (snapshot checklist + uploads)
CREATE TABLE IF NOT EXISTS public.request_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  policy_version_id uuid NULL,
  doc_type text NOT NULL,
  doc_name text NOT NULL,
  required_for text NULL, -- 'claim' | 'request' (optional snapshot)
  is_required boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'missing', -- missing | provided | pending_review | rejected
  file_url text NULL,
  uploaded_at timestamptz NULL,
  uploaded_by uuid NULL,
  reviewer_notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Foreign keys
ALTER TABLE public.request_documents
  ADD CONSTRAINT request_documents_request_id_fkey
  FOREIGN KEY (request_id) REFERENCES public.requests(id)
  ON DELETE CASCADE;

ALTER TABLE public.request_documents
  ADD CONSTRAINT request_documents_policy_version_id_fkey
  FOREIGN KEY (policy_version_id) REFERENCES public.policy_versions(id)
  ON DELETE SET NULL;

-- Uniqueness: one row per doc_type per request (prevents dupes)
CREATE UNIQUE INDEX IF NOT EXISTS request_documents_request_doc_type_uniq
  ON public.request_documents(request_id, doc_type);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS request_documents_request_id_idx
  ON public.request_documents(request_id);

CREATE INDEX IF NOT EXISTS request_documents_status_idx
  ON public.request_documents(status);

-- 2) updated_at trigger
DROP TRIGGER IF EXISTS set_request_documents_updated_at ON public.request_documents;
CREATE TRIGGER set_request_documents_updated_at
BEFORE UPDATE ON public.request_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Row Level Security
ALTER TABLE public.request_documents ENABLE ROW LEVEL SECURITY;

-- Employees: can read docs for their own requests
DROP POLICY IF EXISTS "Employees can view their request documents" ON public.request_documents;
CREATE POLICY "Employees can view their request documents"
ON public.request_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.requests r
    WHERE r.id = request_documents.request_id
      AND r.user_id = auth.uid()
  )
);

-- Employees: can create docs rows for their own requests (primarily system, but allow employee)
DROP POLICY IF EXISTS "Employees can insert their request documents" ON public.request_documents;
CREATE POLICY "Employees can insert their request documents"
ON public.request_documents
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.requests r
    WHERE r.id = request_documents.request_id
      AND r.user_id = auth.uid()
  )
);

-- Employees: can update upload fields for their own requests
DROP POLICY IF EXISTS "Employees can update their request documents" ON public.request_documents;
CREATE POLICY "Employees can update their request documents"
ON public.request_documents
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.requests r
    WHERE r.id = request_documents.request_id
      AND r.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.requests r
    WHERE r.id = request_documents.request_id
      AND r.user_id = auth.uid()
  )
);

-- Employers/Admin: can read/manage docs for requests in their org
DROP POLICY IF EXISTS "Employer/admin can manage org request documents" ON public.request_documents;
CREATE POLICY "Employer/admin can manage org request documents"
ON public.request_documents
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.requests r
    WHERE r.id = request_documents.request_id
      AND r.organization_id = public.get_user_organization_id(auth.uid())
      AND (public.has_role(auth.uid(), 'employer'::public.user_role) OR public.has_role(auth.uid(), 'admin'::public.user_role))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.requests r
    WHERE r.id = request_documents.request_id
      AND r.organization_id = public.get_user_organization_id(auth.uid())
      AND (public.has_role(auth.uid(), 'employer'::public.user_role) OR public.has_role(auth.uid(), 'admin'::public.user_role))
  )
);
