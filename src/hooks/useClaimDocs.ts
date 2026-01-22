/**
 * @deprecated LEGACY - Use useRequestDocuments from '@/hooks/useRequestDocuments'
 * 
 * This file is maintained for backward compatibility only.
 * All new code should use the unified request_documents model.
 */

import {
  useRequestDocuments,
  useRequestDocumentCounts,
  useVerifyRequestDocument,
  useRequestDocumentUpload,
  type RequestDocument,
} from '@/hooks/useRequestDocuments';

// Re-export with legacy names for compatibility
export type ClaimDoc = RequestDocument;

export const useClaimDocs = useRequestDocuments;
export const useClaimDocCounts = useRequestDocumentCounts;
export const useMarkDocReceived = useVerifyRequestDocument;
export const useMarkDocMissing = useRequestDocumentUpload;

/**
 * @deprecated Use policy-driven document requirements
 */
export function getRequiredDocsForCategory(_category: string): { type: string; name: string }[] {
  console.warn('getRequiredDocsForCategory is deprecated. Use policy-driven document requirements.');
  return [];
}

/**
 * @deprecated Use usePolicyDrivenSubmission which handles document creation
 */
export function useCreateRequiredDocs() {
  console.warn('useCreateRequiredDocs is deprecated. Use usePolicyDrivenSubmission.');
  return {
    mutateAsync: async () => [],
    mutate: () => {},
    isLoading: false,
    isPending: false,
  };
}
