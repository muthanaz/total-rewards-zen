/**
 * Waiver Analytics Hook
 * 
 * Provides privacy-safe aggregated analytics for exceptions reporting:
 * - % of requests with waivers
 * - Top waiver reasons
 * - Waiver frequency by policy
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export interface WaiverSummary {
  total_requests: number;
  requests_with_waivers: number;
  waiver_rate_pct: number;
  total_documents_waived: number;
  total_documents_required: number;
}

export interface WaiverReasonBreakdown {
  reason: string;
  count: number;
  percentage: number;
  label: string;
}

export interface PolicyWaiverStats {
  policy_id: string;
  policy_title: string;
  policy_category: string;
  waiver_count: number;
  total_requests: number;
  waiver_rate_pct: number;
}

export interface WaiverTrend {
  month: string;
  waiver_count: number;
  total_documents: number;
  waiver_rate_pct: number;
}

export interface WaiverAnalyticsData {
  summary: WaiverSummary;
  topReasons: WaiverReasonBreakdown[];
  byPolicy: PolicyWaiverStats[];
  trends: WaiverTrend[];
  isLoading: boolean;
  error: Error | null;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const WAIVER_REASON_LABELS: Record<string, string> = {
  missing_receipt: 'Missing Receipt',
  employee_hardship: 'Employee Hardship',
  policy_exception: 'Policy Exception',
  duplicate_claim: 'Duplicate Claim',
  other: 'Other',
};

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Fetch aggregated waiver analytics for the organization
 */
export function useWaiverAnalytics(options?: {
  startDate?: string;
  endDate?: string;
  policyId?: string;
}): WaiverAnalyticsData {
  const { user } = useAuth();

  // Fetch document-level waiver data
  const { data: documentData, isLoading: docsLoading, error: docsError } = useQuery({
    queryKey: ['waiver_analytics_docs', user?.id, options],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get user's org
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) return null;

      // Get requests with their documents
      let requestsQuery = supabase
        .from('requests')
        .select(`
          id,
          policy_id,
          policy_ref,
          category,
          created_at
        `)
        .eq('organization_id', profile.organization_id);

      if (options?.startDate) {
        requestsQuery = requestsQuery.gte('created_at', options.startDate);
      }
      if (options?.endDate) {
        requestsQuery = requestsQuery.lte('created_at', options.endDate);
      }
      if (options?.policyId) {
        requestsQuery = requestsQuery.eq('policy_id', options.policyId);
      }

      const { data: requests, error: reqError } = await requestsQuery;
      if (reqError) throw reqError;

      const requestIds = (requests || []).map(r => r.id);
      if (requestIds.length === 0) return { requests: [], documents: [] };

      // Get documents for these requests
      const { data: documents, error: docError } = await supabase
        .from('request_documents')
        .select(`
          id,
          request_id,
          is_required,
          status,
          waiver_reason_category,
          was_conditionally_required,
          verified_at,
          policy_version_id
        `)
        .in('request_id', requestIds);

      if (docError) throw docError;

      return { requests, documents };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch policy titles
  const { data: policies } = useQuery({
    queryKey: ['policies_for_waiver_analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) return [];

      const { data } = await supabase
        .from('policies')
        .select('id, title, category')
        .eq('organization_id', profile.organization_id);

      return data || [];
    },
    enabled: !!user?.id,
  });

  // Calculate analytics
  const analytics = useMemo((): Omit<WaiverAnalyticsData, 'isLoading' | 'error'> => {
    if (!documentData) {
      return {
        summary: {
          total_requests: 0,
          requests_with_waivers: 0,
          waiver_rate_pct: 0,
          total_documents_waived: 0,
          total_documents_required: 0,
        },
        topReasons: [],
        byPolicy: [],
        trends: [],
      };
    }

    const { requests, documents } = documentData;

    // Summary calculation
    const waivedDocs = documents.filter(d => d.status === 'waived');
    const requiredDocs = documents.filter(d => d.is_required);
    const requestsWithWaivers = new Set(waivedDocs.map(d => d.request_id)).size;

    const summary: WaiverSummary = {
      total_requests: requests.length,
      requests_with_waivers: requestsWithWaivers,
      waiver_rate_pct: requests.length > 0 
        ? Math.round((requestsWithWaivers / requests.length) * 100 * 10) / 10
        : 0,
      total_documents_waived: waivedDocs.length,
      total_documents_required: requiredDocs.length,
    };

    // Top reasons breakdown
    const reasonCounts: Record<string, number> = {};
    waivedDocs.forEach(doc => {
      const reason = doc.waiver_reason_category || 'other';
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    const topReasons: WaiverReasonBreakdown[] = Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: waivedDocs.length > 0 
          ? Math.round((count / waivedDocs.length) * 100)
          : 0,
        label: WAIVER_REASON_LABELS[reason] || reason,
      }))
      .sort((a, b) => b.count - a.count);

    // By policy breakdown
    const policyMap = new Map(policies?.map(p => [p.id, p]) || []);
    const policyWaivers: Record<string, { waivers: number; requests: Set<string> }> = {};

    requests.forEach(req => {
      if (!req.policy_id) return;
      if (!policyWaivers[req.policy_id]) {
        policyWaivers[req.policy_id] = { waivers: 0, requests: new Set() };
      }
      policyWaivers[req.policy_id].requests.add(req.id);
    });

    waivedDocs.forEach(doc => {
      const request = requests.find(r => r.id === doc.request_id);
      if (!request?.policy_id) return;
      policyWaivers[request.policy_id].waivers++;
    });

    const byPolicy: PolicyWaiverStats[] = Object.entries(policyWaivers)
      .map(([policyId, stats]) => {
        const policy = policyMap.get(policyId);
        return {
          policy_id: policyId,
          policy_title: policy?.title || 'Unknown Policy',
          policy_category: policy?.category || 'Unknown',
          waiver_count: stats.waivers,
          total_requests: stats.requests.size,
          waiver_rate_pct: stats.requests.size > 0
            ? Math.round((stats.waivers / stats.requests.size) * 100 * 10) / 10
            : 0,
        };
      })
      .sort((a, b) => b.waiver_count - a.waiver_count);

    // Monthly trends
    const monthlyData: Record<string, { waivers: number; total: number }> = {};
    documents.forEach(doc => {
      if (!doc.verified_at) return;
      const month = doc.verified_at.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { waivers: 0, total: 0 };
      }
      monthlyData[month].total++;
      if (doc.status === 'waived') {
        monthlyData[month].waivers++;
      }
    });

    const trends: WaiverTrend[] = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        waiver_count: data.waivers,
        total_documents: data.total,
        waiver_rate_pct: data.total > 0
          ? Math.round((data.waivers / data.total) * 100 * 10) / 10
          : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { summary, topReasons, byPolicy, trends };
  }, [documentData, policies]);

  return {
    ...analytics,
    isLoading: docsLoading,
    error: docsError as Error | null,
  };
}

/**
 * Hook to get waiver rate for a specific request (for HR review display)
 */
export function useRequestWaiverInfo(requestId: string | null) {
  return useQuery({
    queryKey: ['request_waiver_info', requestId],
    queryFn: async () => {
      if (!requestId) return null;

      const { data, error } = await supabase
        .from('request_documents')
        .select('id, status, waiver_reason_category, decision_reason, was_conditionally_required')
        .eq('request_id', requestId);

      if (error) throw error;

      const docs = data || [];
      const waivedDocs = docs.filter(d => d.status === 'waived');

      return {
        total_docs: docs.length,
        waived_count: waivedDocs.length,
        waiver_reasons: waivedDocs.map(d => ({
          category: d.waiver_reason_category || 'other',
          reason: d.decision_reason,
          was_conditional: d.was_conditionally_required,
        })),
        has_waivers: waivedDocs.length > 0,
      };
    },
    enabled: !!requestId,
  });
}
