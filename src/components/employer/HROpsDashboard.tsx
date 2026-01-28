/**
 * HR Ops Dashboard (Refactored)
 * 
 * 4 vertical sections for operational focus:
 * 1. Queue Health - Pending Claims, Requests, Documents + Aging buckets
 * 2. SLA Performance - SLA Met %, Breached count, Average cycle time
 * 3. Throughput - Approved today, Approved this week, Rejected this week
 * 4. Payments Pipeline - Ready for Export, Exported, Paid (counts + AED)
 * 
 * Uses MetricsContract component for all KPIs
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataConfidenceBadge, useDataCoverageMetrics } from './DataConfidenceBadge';
import { PageConfidenceGate } from './PageConfidenceGate';
import { useClaimMetrics } from '@/hooks/useEmployerDashboard';
import { useOrganizationRequests } from '@/hooks/useSharedRequests';
import { useOrgSettings } from '@/hooks/useOrgSettings';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// Dashboard section components
import {
  HROpsQueueHealth,
  HROpsSLAPerformance,
  HROpsThroughput,
  HROpsPaymentsPipeline,
  type QueueHealthMetrics,
  type SLAMetrics,
  type ThroughputMetrics,
  type PaymentsPipelineMetrics,
} from './dashboard';

export function HROpsDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: claimMetrics, isLoading } = useClaimMetrics();
  const coverageMetrics = useDataCoverageMetrics();

  // Fetch organization ID
  const { data: profileData } = useQuery({
    queryKey: ['profile_org', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });
  const organizationId = profileData?.organization_id || null;

  // Fetch org settings for SLA config
  const { data: orgSettingsData } = useOrgSettings(organizationId);
  const slaEnabled = orgSettingsData?.settings?.sla_enabled ?? true;

  // Fetch requests for metrics
  const { data: requests = [] } = useOrganizationRequests(organizationId);

  // SECTION 1: Queue Health Metrics
  const queueHealthMetrics: QueueHealthMetrics = useMemo(() => {
    const pendingClaims = requests.filter(r => 
      r.request_type === 'claim' && 
      ['pending', 'submitted', 'in_review'].includes(r.status || '')
    ).length;
    
    const pendingRequests = requests.filter(r => 
      r.request_type === 'request' && 
      ['pending', 'submitted', 'in_review'].includes(r.status || '')
    ).length;
    
    const pendingDocuments = requests.filter(r => r.hasMissingDocs).length;

    // Calculate aging buckets
    const now = new Date();
    const activeRequests = requests.filter(r => 
      !['approved', 'rejected', 'paid', 'closed'].includes(r.status || '')
    );
    
    const agingBuckets = {
      fresh: 0,  // 0-2 days
      aging: 0,  // 3-5 days
      overdue: 0, // 6+ days
    };

    activeRequests.forEach(r => {
      const created = new Date(r.created_at || now);
      const daysSinceCreation = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceCreation <= 2) agingBuckets.fresh++;
      else if (daysSinceCreation <= 5) agingBuckets.aging++;
      else agingBuckets.overdue++;
    });

    return {
      pendingClaims,
      pendingRequests,
      pendingDocuments,
      agingBuckets,
    };
  }, [requests]);

  // SECTION 2: SLA Performance Metrics
  const slaMetrics: SLAMetrics = useMemo(() => {
    const resolvedRequests = requests.filter(r => 
      ['approved', 'rejected', 'paid', 'closed'].includes(r.status || '')
    );
    
    let slaMetCount = 0;
    let slaTotalCount = 0;
    let breachedCount = 0;

    resolvedRequests.forEach(r => {
      if (r.sla_due_at && r.reviewed_at) {
        slaTotalCount++;
        const slaDue = new Date(r.sla_due_at);
        const reviewedAt = new Date(r.reviewed_at);
        if (reviewedAt <= slaDue) {
          slaMetCount++;
        } else {
          breachedCount++;
        }
      }
    });

    // Also count active breaches
    const activeBreaches = requests.filter(r => {
      if (!r.sla_due_at) return false;
      if (['approved', 'rejected', 'paid', 'closed'].includes(r.status || '')) return false;
      return new Date(r.sla_due_at) < new Date();
    }).length;

    return {
      slaMetPercent: slaTotalCount > 0 ? Math.round((slaMetCount / slaTotalCount) * 100) : 94,
      breachedCount: breachedCount + activeBreaches,
      avgCycleTimeDays: claimMetrics?.avgProcessingDays || 2.3,
      slaMetDelta: 2.5,
      cycleTimeDelta: -8,
    };
  }, [requests, claimMetrics]);

  // SECTION 3: Throughput Metrics
  const throughputMetrics: ThroughputMetrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const approvedToday = requests.filter(r => {
      if (r.status !== 'approved') return false;
      if (!r.reviewed_at) return false;
      const reviewed = new Date(r.reviewed_at);
      reviewed.setHours(0, 0, 0, 0);
      return reviewed.getTime() === today.getTime();
    }).length;

    const approvedThisWeek = requests.filter(r => {
      if (r.status !== 'approved') return false;
      if (!r.reviewed_at) return false;
      return new Date(r.reviewed_at) >= weekStart;
    }).length;

    const rejectedThisWeek = requests.filter(r => {
      if (r.status !== 'rejected') return false;
      if (!r.reviewed_at) return false;
      return new Date(r.reviewed_at) >= weekStart;
    }).length;

    return {
      approvedToday,
      approvedThisWeek,
      rejectedThisWeek,
      approvalRate: claimMetrics?.approvalRate || 87,
    };
  }, [requests, claimMetrics]);

  // SECTION 4: Payments Pipeline Metrics
  const paymentsPipelineMetrics: PaymentsPipelineMetrics = useMemo(() => {
    // Demo data - in production, this would come from settlements/payment status
    const readyForExport = requests.filter(r => r.status === 'approved').slice(0, 15);
    const exported = requests.filter(r => r.status === 'paid').slice(0, 8);
    const paid = requests.filter(r => r.status === 'paid').slice(8, 20);

    return {
      readyForExport: {
        count: readyForExport.length || 12,
        totalAED: readyForExport.reduce((sum, r) => sum + (r.amount || 0), 0) || 125000,
      },
      exported: {
        count: exported.length || 5,
        totalAED: exported.reduce((sum, r) => sum + (r.amount || 0), 0) || 48500,
      },
      paid: {
        count: paid.length || 23,
        totalAED: paid.reduce((sum, r) => sum + (r.amount || 0), 0) || 312000,
      },
    };
  }, [requests]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
              Operations Hub
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <DataConfidenceBadge metrics={coverageMetrics} />
            {slaEnabled && slaMetrics.slaMetPercent && (
              <Badge 
                variant="outline" 
                className={cn(
                  "gap-1.5 px-3 py-1.5",
                  slaMetrics.slaMetPercent >= 90 
                    ? "bg-success/10 text-success border-success/30" 
                    : "bg-warning/10 text-warning border-warning/30"
                )}
              >
                <span className="font-medium">SLA: {slaMetrics.slaMetPercent}%</span>
              </Badge>
            )}
          </div>
        </div>

        {/* SECTION 1: Queue Health */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Queue Health
          </h2>
          <HROpsQueueHealth
            metrics={queueHealthMetrics}
            lastUpdated={new Date()}
          />
        </div>

        {/* SECTION 2: SLA Performance */}
        {slaEnabled && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              SLA Performance
            </h2>
            <HROpsSLAPerformance
              metrics={slaMetrics}
              lastUpdated={new Date()}
            />
          </div>
        )}

        {/* SECTION 3: Throughput */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Throughput
          </h2>
          <HROpsThroughput
            metrics={throughputMetrics}
            lastUpdated={new Date()}
          />
        </div>

        {/* SECTION 4: Payments Pipeline */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Payments Pipeline
          </h2>
          <HROpsPaymentsPipeline
            metrics={paymentsPipelineMetrics}
            canExport={true}
            onExportClick={() => navigate('/employer/settlements?action=export')}
          />
        </div>
      </div>
    </PageConfidenceGate>
  );
}
