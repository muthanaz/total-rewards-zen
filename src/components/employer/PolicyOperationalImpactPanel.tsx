/**
 * Policy Operational Impact Panel
 * 
 * Shows claims insights for a policy:
 * - Recent claims volume
 * - Rejection rate
 * - Top missing docs
 * - Top questions
 * 
 * Only shows data if available; otherwise shows "Connect to unlock" CTA.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  FileWarning,
  HelpCircle,
  BarChart3,
  Link2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PolicyOperationalImpactPanelProps {
  policyId: string;
  organizationId: string;
}

interface ClaimStats {
  totalClaims: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  rejectionRate: number;
  avgProcessingDays: number;
  topMissingDocs: Array<{ docType: string; count: number }>;
  topRejectionReasons: Array<{ reason: string; count: number }>;
}

export function PolicyOperationalImpactPanel({ policyId, organizationId }: PolicyOperationalImpactPanelProps) {
  // Fetch claims stats for this policy
  const { data: stats, isLoading } = useQuery({
    queryKey: ['policy_claims_stats', policyId],
    queryFn: async (): Promise<ClaimStats | null> => {
      // Get claims linked to this policy
      const { data: claims, error } = await supabase
        .from('requests')
        .select('id, status, created_at, reviewed_at, reviewer_notes')
        .eq('policy_id', policyId)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      if (!claims || claims.length === 0) return null;
      
      const totalClaims = claims.length;
      const approvedCount = claims.filter(c => c.status === 'approved' || c.status === 'paid').length;
      const rejectedCount = claims.filter(c => c.status === 'rejected').length;
      const pendingCount = claims.filter(c => c.status === 'pending' || c.status === 'in_review').length;
      const rejectionRate = totalClaims > 0 ? (rejectedCount / totalClaims) * 100 : 0;
      
      // Calculate average processing time
      const processedClaims = claims.filter(c => c.reviewed_at && c.created_at);
      let avgProcessingDays = 0;
      if (processedClaims.length > 0) {
        const totalDays = processedClaims.reduce((sum, c) => {
          const created = new Date(c.created_at);
          const reviewed = new Date(c.reviewed_at!);
          return sum + (reviewed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        }, 0);
        avgProcessingDays = totalDays / processedClaims.length;
      }
      
      // Get missing docs from claim_docs
      const { data: docsData } = await supabase
        .from('claim_docs')
        .select('doc_type, status')
        .in('request_id', claims.map(c => c.id))
        .eq('status', 'missing');
      
      const docCounts: Record<string, number> = {};
      (docsData || []).forEach(d => {
        docCounts[d.doc_type] = (docCounts[d.doc_type] || 0) + 1;
      });
      
      const topMissingDocs = Object.entries(docCounts)
        .map(([docType, count]) => ({ docType, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      
      // Get rejection reasons from reviewer_notes
      const rejectedClaims = claims.filter(c => c.status === 'rejected' && c.reviewer_notes);
      const reasonCounts: Record<string, number> = {};
      rejectedClaims.forEach(c => {
        const reason = c.reviewer_notes?.substring(0, 50) || 'Not specified';
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      });
      
      const topRejectionReasons = Object.entries(reasonCounts)
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      
      return {
        totalClaims,
        approvedCount,
        rejectedCount,
        pendingCount,
        rejectionRate,
        avgProcessingDays,
        topMissingDocs,
        topRejectionReasons,
      };
    },
    enabled: !!policyId,
  });

  if (isLoading) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-6 text-center text-muted-foreground">
          Loading operational insights...
        </CardContent>
      </Card>
    );
  }

  // No data - show connect CTA
  if (!stats) {
    return (
      <Card className="bg-muted/20 border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            Operational Impact
          </CardTitle>
          <CardDescription>
            Claims data not available for this policy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center text-center py-4">
            <Link2 className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Connect claims to this policy to unlock insights on volume, rejection rates, and common issues.
            </p>
            <Button variant="outline" size="sm">
              View Claims Queue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Operational Impact
        </CardTitle>
        <CardDescription>
          Based on {stats.totalClaims} claims in the last 90 days
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key metrics row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{stats.totalClaims}</div>
            <div className="text-xs text-muted-foreground">Total Claims</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-bold text-foreground">{stats.rejectionRate.toFixed(1)}%</span>
              {stats.rejectionRate > 20 ? (
                <TrendingUp className="w-4 h-4 text-destructive" />
              ) : (
                <TrendingDown className="w-4 h-4 text-success" />
              )}
            </div>
            <div className="text-xs text-muted-foreground">Rejection Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{stats.avgProcessingDays.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Avg. Days</div>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Claim status breakdown</span>
          </div>
          <Progress 
            value={(stats.approvedCount / stats.totalClaims) * 100} 
            className="h-2"
          />
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-success" />
              <span>Approved: {stats.approvedCount}</span>
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-destructive" />
              <span>Rejected: {stats.rejectedCount}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-warning" />
              <span>Pending: {stats.pendingCount}</span>
            </span>
          </div>
        </div>

        {/* Top missing docs */}
        {stats.topMissingDocs.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium">
              <FileWarning className="w-3 h-3 text-warning" />
              Top Missing Documents
            </div>
            <div className="flex flex-wrap gap-1">
              {stats.topMissingDocs.map((doc, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {doc.docType} ({doc.count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Top rejection reasons */}
        {stats.topRejectionReasons.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium">
              <HelpCircle className="w-3 h-3 text-destructive" />
              Common Rejection Reasons
            </div>
            <div className="space-y-1">
              {stats.topRejectionReasons.map((reason, idx) => (
                <div key={idx} className="text-xs text-muted-foreground">
                  • {reason.reason} ({reason.count})
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
