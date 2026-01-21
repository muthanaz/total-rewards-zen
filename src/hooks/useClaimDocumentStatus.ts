/**
 * Unified Claim Document Status Hook
 * 
 * Provides consistent document status computation for both:
 * - Claims table "Missing Docs" badge
 * - Claim drawer "Required Documents Checklist"
 * 
 * Source of truth: benefit_required_documents table linked by category → benefit
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type RequiredDocumentRow = Database['public']['Tables']['benefit_required_documents']['Row'];
type ClaimDocRow = Database['public']['Tables']['claim_docs']['Row'];

export interface DocumentRequirement {
  id: string;
  docType: string;
  docName: string;
  docNameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  isRequired: boolean;
  requiredFor?: string | null;
  conditions?: Record<string, unknown> | null;
}

export interface ProvidedDocument {
  id: string;
  docType: string;
  docName: string;
  fileUrl: string | null;
  status: 'provided' | 'missing' | 'rejected' | 'pending';
  uploadedAt: string | null;
  reviewedAt: string | null;
  reviewerNotes: string | null;
}

export interface ClaimDocumentStatus {
  /** All documents required by policy for this category */
  requiredDocs: DocumentRequirement[];
  /** Documents that have been provided by the employee */
  providedDocs: ProvidedDocument[];
  /** Documents that are required but not yet provided */
  missingDocs: DocumentRequirement[];
  /** Summary counts */
  counts: {
    required: number;
    provided: number;
    missing: number;
    optional: number;
  };
  /** True if any required documents are missing */
  hasMissingDocs: boolean;
  /** True if no documents are required for this category */
  noDocsRequired: boolean;
  /** Loading state */
  isLoading: boolean;
}

/**
 * Maps category names to benefit life_area/name patterns
 * This enables lookup from request category to benefit_required_documents
 */
const CATEGORY_TO_BENEFIT_MAP: Record<string, string[]> = {
  'Health Insurance': ['Health Insurance', 'Health', 'Medical'],
  'Health': ['Health Insurance', 'Health', 'Medical'],
  'Education Allowance': ['Education Allowance', 'Schooling', 'Education'],
  'Schooling': ['Education Allowance', 'Schooling', 'Education'],
  'Housing': ['Housing', 'Housing Allowance'],
  'Transport': ['Transport', 'Transportation', 'Transport Allowance'],
  'Learning & Development': ['Learning & Development', 'Training', 'Professional Development'],
  'Wellbeing': ['Wellbeing', 'Wellness', 'Well-being'],
  'Leave': ['Leave', 'Annual Leave', 'Sick Leave'],
  'Per Diem': ['Per Diem', 'Travel Allowance', 'Business Travel'],
  'Other': [],
};

/**
 * Fetch required documents for a category by looking up the matching benefit
 */
export function useRequiredDocsForCategory(category: string | null) {
  return useQuery({
    queryKey: ['required_docs_by_category', category],
    queryFn: async (): Promise<DocumentRequirement[]> => {
      if (!category) return [];
      
      // Get potential benefit names for this category
      const benefitNames = CATEGORY_TO_BENEFIT_MAP[category] || [category];
      
      // Find matching benefit
      const { data: benefits, error: benefitError } = await supabase
        .from('benefits')
        .select('id, name')
        .or(benefitNames.map(n => `name.ilike.%${n}%`).join(','))
        .eq('is_active', true)
        .limit(1);
      
      if (benefitError) throw benefitError;
      
      const benefitId = benefits?.[0]?.id;
      if (!benefitId) {
        // No matching benefit found - return empty (no docs required)
        return [];
      }
      
      // Fetch required documents for this benefit
      const { data: docs, error: docsError } = await supabase
        .from('benefit_required_documents')
        .select('*')
        .eq('benefit_id', benefitId)
        .order('is_required', { ascending: false });
      
      if (docsError) throw docsError;
      
      return (docs || []).map((doc): DocumentRequirement => ({
        id: doc.id,
        docType: doc.document_type,
        docName: doc.document_name,
        docNameAr: doc.document_name_ar,
        description: doc.description,
        descriptionAr: doc.description_ar,
        isRequired: doc.is_required ?? true,
        requiredFor: doc.required_for,
        conditions: doc.conditions as Record<string, unknown> | null,
      }));
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Fetch provided documents for a specific claim
 */
export function useProvidedDocs(requestId: string | null) {
  return useQuery({
    queryKey: ['claim_docs_provided', requestId],
    queryFn: async (): Promise<ProvidedDocument[]> => {
      if (!requestId) return [];
      
      const { data, error } = await supabase
        .from('claim_docs')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map((doc): ProvidedDocument => ({
        id: doc.id,
        docType: doc.doc_type,
        docName: doc.doc_name,
        fileUrl: doc.file_url,
        status: doc.status as ProvidedDocument['status'],
        uploadedAt: doc.uploaded_at,
        reviewedAt: doc.reviewed_at,
        reviewerNotes: doc.reviewer_notes,
      }));
    },
    enabled: !!requestId,
  });
}

/**
 * Main hook: Compute unified document status for a claim
 * 
 * @param requestId - The claim/request ID
 * @param category - The benefit category of the claim
 * @returns ClaimDocumentStatus with all computed fields
 */
export function useClaimDocumentStatus(
  requestId: string | null,
  category: string | null
): ClaimDocumentStatus {
  const { data: requiredDocs = [], isLoading: reqLoading } = useRequiredDocsForCategory(category);
  const { data: providedDocs = [], isLoading: provLoading } = useProvidedDocs(requestId);
  
  const status = useMemo((): Omit<ClaimDocumentStatus, 'isLoading'> => {
    // Get only required docs (not optional)
    const requiredOnly = requiredDocs.filter(d => d.isRequired);
    const optionalDocs = requiredDocs.filter(d => !d.isRequired);
    
    // Build set of provided document types
    const providedTypes = new Set(
      providedDocs
        .filter(d => d.status === 'provided' || d.status === 'pending')
        .map(d => d.docType.toLowerCase())
    );
    
    // Compute missing docs: required but not provided
    const missingDocs = requiredOnly.filter(
      req => !providedTypes.has(req.docType.toLowerCase())
    );
    
    const noDocsRequired = requiredOnly.length === 0;
    const hasMissingDocs = !noDocsRequired && missingDocs.length > 0;
    
    return {
      requiredDocs,
      providedDocs,
      missingDocs,
      counts: {
        required: requiredOnly.length,
        provided: providedDocs.filter(d => d.status === 'provided').length,
        missing: missingDocs.length,
        optional: optionalDocs.length,
      },
      hasMissingDocs,
      noDocsRequired,
    };
  }, [requiredDocs, providedDocs]);
  
  return {
    ...status,
    isLoading: reqLoading || provLoading,
  };
}

/**
 * Lightweight version for table display - only checks if docs are missing
 * Uses category to determine if docs are required, without fetching claim_docs
 */
export function useClaimDocumentStatusBatch(
  claims: Array<{ id: string; category: string; missing_docs?: unknown }>
): Map<string, { hasMissingDocs: boolean; noDocsRequired: boolean; missingCount: number }> {
  // Get unique categories
  const categories = [...new Set(claims.map(c => c.category))];
  
  // Fetch required docs for all categories
  const { data: allRequiredDocs } = useQuery({
    queryKey: ['required_docs_batch', categories.sort().join(',')],
    queryFn: async () => {
      const results: Record<string, DocumentRequirement[]> = {};
      
      for (const category of categories) {
        const benefitNames = CATEGORY_TO_BENEFIT_MAP[category] || [category];
        
        const { data: benefits } = await supabase
          .from('benefits')
          .select('id, name')
          .or(benefitNames.map(n => `name.ilike.%${n}%`).join(','))
          .eq('is_active', true)
          .limit(1);
        
        const benefitId = benefits?.[0]?.id;
        if (!benefitId) {
          results[category] = [];
          continue;
        }
        
        const { data: docs } = await supabase
          .from('benefit_required_documents')
          .select('*')
          .eq('benefit_id', benefitId)
          .eq('is_required', true);
        
        results[category] = (docs || []).map(doc => ({
          id: doc.id,
          docType: doc.document_type,
          docName: doc.document_name,
          docNameAr: doc.document_name_ar,
          description: doc.description,
          descriptionAr: doc.description_ar,
          isRequired: doc.is_required ?? true,
          requiredFor: doc.required_for,
          conditions: doc.conditions as Record<string, unknown> | null,
        }));
      }
      
      return results;
    },
    enabled: categories.length > 0,
    staleTime: 5 * 60 * 1000,
  });
  
  return useMemo(() => {
    const result = new Map<string, { hasMissingDocs: boolean; noDocsRequired: boolean; missingCount: number }>();
    
    for (const claim of claims) {
      const requiredForCategory = allRequiredDocs?.[claim.category] || [];
      const noDocsRequired = requiredForCategory.length === 0;
      
      // Check missing_docs from the request record
      const missingDocsFromDb = claim.missing_docs;
      const missingCount = Array.isArray(missingDocsFromDb) 
        ? missingDocsFromDb.length 
        : (noDocsRequired ? 0 : requiredForCategory.length);
      
      result.set(claim.id, {
        hasMissingDocs: !noDocsRequired && missingCount > 0,
        noDocsRequired,
        missingCount,
      });
    }
    
    return result;
  }, [claims, allRequiredDocs]);
}
