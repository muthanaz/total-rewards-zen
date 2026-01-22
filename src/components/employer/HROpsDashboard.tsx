/**
 * HR Ops Dashboard - Queue-First Workbench
 * 
 * Operational dashboard focused on:
 * - What needs attention now
 * - SLA and bottleneck visibility
 * - Claims/Requests queue as primary content
 * - Friction reasons analysis
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  FileCheck, 
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Calendar,
  Inbox,
  FileQuestion,
  Flame,
  TrendingUp,
  Eye,
  Filter,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DataConfidenceBadge, useDataCoverageMetrics } from './DataConfidenceBadge';
import { PageConfidenceGate } from './PageConfidenceGate';
import { HROpsKPIStrip } from './HROpsKPIStrip';
import { TopFrictionReasonsPanel, FrictionReason } from './TopFrictionReasonsPanel';
import { DeflectedInquiriesKPI } from './DeflectedInquiriesKPI';
import { useClaimMetrics, useRecentActivity } from '@/hooks/useEmployerDashboard';
import { useOrganizationRequests } from '@/hooks/useSharedRequests';
import { useOrgSettings } from '@/hooks/useOrgSettings';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn, formatCurrencyAED, formatRelativeTime } from '@/lib/utils';
import { getStatusBadgeStyle, getStatusDisplayLabel } from '@/lib/crossPortalContract';

// Queue tab type
type QueueTab = 'pending' | 'sla_risk' | 'missing_docs' | 'high_value';

export function HROpsDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: claimMetrics, isLoading } = useClaimMetrics();
  const { data: recentActivity } = useRecentActivity();
  const coverageMetrics = useDataCoverageMetrics();
  
  const [activeQueueTab, setActiveQueueTab] = useState<QueueTab>('pending');

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

  // Fetch requests for queue preview
  const { data: requests = [] } = useOrganizationRequests(organizationId);

  // Calculate operational KPIs
  const opsKPIs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newToday = requests.filter(r => {
      const created = new Date(r.created_at || '');
      created.setHours(0, 0, 0, 0);
      return created.getTime() === today.getTime();
    }).length;

    const slaAtRisk = requests.filter(r => {
      if (!r.sla_due_at) return false;
      if (['approved', 'rejected', 'paid', 'closed'].includes(r.status || '')) return false;
      const sla = new Date(r.sla_due_at);
      const hoursRemaining = (sla.getTime() - new Date().getTime()) / (1000 * 60 * 60);
      return hoursRemaining < 24;
    }).length;

    const awaitingEmployee = requests.filter(r => 
      r.status === 'info_requested' || r.status === 'pending_employee' || r.hasMissingDocs
    ).length;

    return {
      newToday,
      slaAtRisk,
      awaitingEmployee,
      medianCycleTimeDays: claimMetrics?.avgProcessingDays || 2.3,
      rejectionRatePercent: 100 - (claimMetrics?.approvalRate || 87),
      newTodayTrend: 5, // Mock trend
      cycleTimeTrend: -8, // Mock - improving
    };
  }, [requests, claimMetrics]);

  // Calculate friction reasons
  const frictionReasons: FrictionReason[] = useMemo(() => {
    const missingDocsCount = requests.filter(r => r.hasMissingDocs).length;
    const rejectedRequests = requests.filter(r => r.status === 'rejected');
    const slaRiskCount = requests.filter(r => {
      if (!r.sla_due_at) return false;
      const sla = new Date(r.sla_due_at);
      const hoursRemaining = (sla.getTime() - new Date().getTime()) / (1000 * 60 * 60);
      return hoursRemaining < 24 && hoursRemaining > 0;
    }).length;

    const total = missingDocsCount + rejectedRequests.length + slaRiskCount;
    if (total === 0) return [];

    return [
      {
        type: 'missing_docs' as const,
        count: missingDocsCount,
        percentOfTotal: total > 0 ? Math.round((missingDocsCount / total) * 100) : 0,
        trend: 'stable' as const,
        avgDelayDays: 2.5,
      },
      {
        type: 'cap_exceeded' as const,
        count: Math.floor(rejectedRequests.length * 0.4),
        percentOfTotal: total > 0 ? Math.round((rejectedRequests.length * 0.4 / total) * 100) : 0,
        trend: 'down' as const,
      },
      {
        type: 'ineligible' as const,
        count: Math.floor(rejectedRequests.length * 0.35),
        percentOfTotal: total > 0 ? Math.round((rejectedRequests.length * 0.35 / total) * 100) : 0,
        trend: 'up' as const,
      },
      {
        type: 'delayed_approval' as const,
        count: slaRiskCount,
        percentOfTotal: total > 0 ? Math.round((slaRiskCount / total) * 100) : 0,
        avgDelayDays: 1.2,
      },
      {
        type: 'unclear_policy' as const,
        count: Math.floor(rejectedRequests.length * 0.25),
        percentOfTotal: total > 0 ? Math.round((rejectedRequests.length * 0.25 / total) * 100) : 0,
      },
    ].filter(r => r.count > 0);
  }, [requests]);

  // Filter queue based on active tab
  const filteredQueue = useMemo(() => {
    let result = requests.filter(r => 
      !['approved', 'rejected', 'paid', 'closed'].includes(r.status || '')
    );

    switch (activeQueueTab) {
      case 'pending':
        result = result.filter(r => r.status === 'pending' || r.status === 'submitted' || r.status === 'in_review');
        break;
      case 'sla_risk':
        result = result.filter(r => {
          if (!r.sla_due_at) return false;
          const sla = new Date(r.sla_due_at);
          const hoursRemaining = (sla.getTime() - new Date().getTime()) / (1000 * 60 * 60);
          return hoursRemaining < 24;
        });
        break;
      case 'missing_docs':
        result = result.filter(r => r.hasMissingDocs);
        break;
      case 'high_value':
        result = result.filter(r => r.amount && r.amount >= 5000);
        break;
    }

    // Sort by urgency
    result.sort((a, b) => {
      if (a.sla_due_at && b.sla_due_at) {
        return new Date(a.sla_due_at).getTime() - new Date(b.sla_due_at).getTime();
      }
      if (a.sla_due_at) return -1;
      if (b.sla_due_at) return 1;
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });

    return result.slice(0, 10);
  }, [requests, activeQueueTab]);

  // Queue counts for tabs
  const queueCounts = useMemo(() => ({
    pending: requests.filter(r => 
      r.status === 'pending' || r.status === 'submitted' || r.status === 'in_review'
    ).length,
    sla_risk: requests.filter(r => {
      if (!r.sla_due_at) return false;
      if (['approved', 'rejected', 'paid', 'closed'].includes(r.status || '')) return false;
      const sla = new Date(r.sla_due_at);
      const hoursRemaining = (sla.getTime() - new Date().getTime()) / (1000 * 60 * 60);
      return hoursRemaining < 24;
    }).length,
    missing_docs: requests.filter(r => r.hasMissingDocs).length,
    high_value: requests.filter(r => 
      r.amount && r.amount >= 5000 && 
      !['approved', 'rejected', 'paid', 'closed'].includes(r.status || '')
    ).length,
  }), [requests]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-muted rounded-xl" />
        <div className="h-24 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
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
              Operations Workbench
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <DataConfidenceBadge metrics={coverageMetrics} />
            {slaEnabled && (
              <Badge variant="outline" className={cn(
                "gap-1.5 px-3 py-1.5",
                (claimMetrics?.slaCompliance || 94) >= 90 
                  ? "bg-success/10 text-success border-success/30" 
                  : "bg-warning/10 text-warning border-warning/30"
              )}>
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">SLA: {claimMetrics?.slaCompliance || 94}%</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Operational KPIs */}
        <HROpsKPIStrip 
          data={opsKPIs} 
          slaEnabled={slaEnabled}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Claims/Requests Queue - PRIMARY */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-accent" />
                    Claims & Requests Queue
                  </CardTitle>
                  <Link to="/employer/claims">
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                      <Filter className="w-3.5 h-3.5" />
                      Full Queue
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Queue Tabs */}
                <Tabs value={activeQueueTab} onValueChange={(v) => setActiveQueueTab(v as QueueTab)} className="mb-4">
                  <TabsList className="h-9">
                    <TabsTrigger value="pending" className="text-xs gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Pending
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                        {queueCounts.pending}
                      </Badge>
                    </TabsTrigger>
                    {slaEnabled && (
                      <TabsTrigger value="sla_risk" className="text-xs gap-1.5">
                        <Flame className="w-3.5 h-3.5" />
                        SLA Risk
                        {queueCounts.sla_risk > 0 && (
                          <Badge className="ml-1 h-5 px-1.5 text-[10px] bg-destructive/10 text-destructive border-0">
                            {queueCounts.sla_risk}
                          </Badge>
                        )}
                      </TabsTrigger>
                    )}
                    <TabsTrigger value="missing_docs" className="text-xs gap-1.5">
                      <FileQuestion className="w-3.5 h-3.5" />
                      Needs Info
                      {queueCounts.missing_docs > 0 && (
                        <Badge className="ml-1 h-5 px-1.5 text-[10px] bg-warning/10 text-warning border-0">
                          {queueCounts.missing_docs}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="high_value" className="text-xs gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      High Value
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                        {queueCounts.high_value}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Queue Items */}
                <div className="space-y-2">
                  {filteredQueue.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-success" />
                      <p className="font-medium">All clear!</p>
                      <p className="text-sm">No items in this queue</p>
                    </div>
                  ) : (
                    filteredQueue.map((request) => {
                      const statusStyle = getStatusBadgeStyle(request.status);
                      const slaInfo = request.sla_due_at ? (() => {
                        const sla = new Date(request.sla_due_at);
                        const hoursRemaining = (sla.getTime() - new Date().getTime()) / (1000 * 60 * 60);
                        return {
                          hoursRemaining: Math.round(hoursRemaining),
                          isOverdue: hoursRemaining < 0,
                          isUrgent: hoursRemaining > 0 && hoursRemaining < 24,
                        };
                      })() : null;

                      return (
                        <div
                          key={request.id}
                          className={cn(
                            "flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all",
                            "hover:border-accent/30 hover:bg-accent/5",
                            request.hasMissingDocs && "border-warning/30 bg-warning/5",
                            slaInfo?.isOverdue && "border-destructive/30 bg-destructive/5",
                            slaInfo?.isUrgent && !slaInfo?.isOverdue && "border-warning/30"
                          )}
                          onClick={() => navigate(`/employer/claims?open=${request.id}`)}
                        >
                          {/* Employee & Subject */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm truncate">
                                {request.employeeName || 'Unknown'}
                              </span>
                              <Badge className={cn("text-[10px]", statusStyle.className)}>
                                {getStatusDisplayLabel(request.status)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {request.subject}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                              <span>{request.category}</span>
                              <span>•</span>
                              <span className="capitalize">{request.request_type}</span>
                            </div>
                          </div>

                          {/* Amount */}
                          {request.amount && (
                            <div className="text-right shrink-0">
                              <span className="font-semibold text-sm tabular-nums">
                                {formatCurrencyAED(request.amount)}
                              </span>
                            </div>
                          )}

                          {/* SLA / Missing Docs Indicator */}
                          <div className="shrink-0 w-20 text-right">
                            {slaInfo?.isOverdue && (
                              <Badge className="bg-destructive/10 text-destructive border-0 text-[10px]">
                                Overdue
                              </Badge>
                            )}
                            {slaInfo?.isUrgent && !slaInfo?.isOverdue && (
                              <Badge className="bg-warning/10 text-warning border-0 text-[10px]">
                                {slaInfo.hoursRemaining}h left
                              </Badge>
                            )}
                            {request.hasMissingDocs && !slaInfo?.isOverdue && !slaInfo?.isUrgent && (
                              <Badge className="bg-warning/10 text-warning border-0 text-[10px]">
                                Docs needed
                              </Badge>
                            )}
                          </div>

                          {/* View Button */}
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* View All Link */}
                {filteredQueue.length > 0 && (
                  <Link to="/employer/claims">
                    <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">
                      View all {queueCounts.pending + queueCounts.sla_risk + queueCounts.missing_docs} items
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Friction & Metrics */}
          <div className="space-y-4">
            {/* Top Friction Reasons */}
            <TopFrictionReasonsPanel 
              reasons={frictionReasons}
              totalIssues={frictionReasons.reduce((sum, r) => sum + r.count, 0)}
            />

            {/* Deflected Inquiries KPI */}
            <DeflectedInquiriesKPI
              deflectedCount={null}
              isConfigured={false}
            />

            {/* Quick Actions */}
            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-3">Quick Actions</p>
                <div className="space-y-2">
                  <Link to="/employer/claims" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start h-9 text-xs">
                      <FileCheck className="w-4 h-4 mr-2" />
                      Process Claims Queue
                    </Button>
                  </Link>
                  <Link to="/employer/policies" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start h-9 text-xs">
                      <FileQuestion className="w-4 h-4 mr-2" />
                      Review Policies
                    </Button>
                  </Link>
                  <Link to="/employer/knowledge" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start h-9 text-xs">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Answer Questions
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageConfidenceGate>
  );
}
