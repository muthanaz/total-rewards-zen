/**
 * Executive Dashboard (Refactored)
 * 
 * 4 vertical sections, max 12 visible metrics:
 * 1. Bottom Line (4 KPI cards) - YTD Spend, Projected, Variance, Leakage+Recovery
 * 2. Top Drivers (2 panels) - Spend Drivers, Leakage Drivers with CTAs
 * 3. Decisions (Action Plan preview) - 3 highest-impact recommended actions
 * 4. Risks & Exceptions - SLA breach, Settlement backlog, Policy compliance
 * 
 * Uses MetricsContract component for all KPIs
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataCoverageMetrics } from './DataConfidenceBadge';
import { PageConfidenceGate } from './PageConfidenceGate';
import { ExecHighlightsStrip, ConfidenceLevel } from './ExecHighlightsStrip';
import { DataTrustPanel } from '@/components/trust';
import { 
  useExecutiveMetrics, 
  useSpendAllocation,
  useClaimMetrics,
} from '@/hooks/useEmployerDashboard';
import { useEmployerActions } from '@/hooks/useEmployerActions';
import { useGlobalMetrics } from '@/contexts/DemoDataContext';
import { addDays } from 'date-fns';

// New dashboard components
import {
  ExecBottomLineKPIs,
  ExecTopDriversPanel,
  ExecDecisionsPanel,
  ExecRisksPanel,
  GenerateExecBriefButton,
  type SpendDriver,
  type LeakageDriver,
  type RecommendedAction,
  type RiskIndicator,
} from './dashboard';

export function ExecutiveDashboard() {
  const navigate = useNavigate();
  const globalMetrics = useGlobalMetrics();
  
  // Fetch data
  const { data: metrics, isLoading: metricsLoading } = useExecutiveMetrics();
  const coverageMetrics = useDataCoverageMetrics();
  const { data: spendAllocation } = useSpendAllocation();
  const { data: claimMetrics } = useClaimMetrics();
  const { filteredActions } = useEmployerActions();

  // Merge global metrics with fetched metrics for reactive updates
  const effectiveMetrics = useMemo(() => {
    if (!metrics) return null;
    return {
      ...metrics,
      totalInvestment: globalMetrics.totalBudget,
      budgetUtilized: globalMetrics.ytdSpend,
      utilizationRate: globalMetrics.utilizationRate,
      employeeCount: globalMetrics.activeEmployees,
    };
  }, [metrics, globalMetrics]);

  // Calculate confidence level
  const confidenceLevel: ConfidenceLevel = useMemo(() => {
    const avg = (coverageMetrics.employeeCoverage + 
                 coverageMetrics.entitlementCoverage + 
                 coverageMetrics.policyCoverage + 
                 coverageMetrics.claimsCoverage) / 4;
    if (avg >= 85) return 'high';
    if (avg >= 60) return 'medium';
    return 'low';
  }, [coverageMetrics]);

  // Bottom Line Metrics
  const bottomLineMetrics = useMemo(() => {
    if (!effectiveMetrics) return null;
    const monthsElapsed = new Date().getMonth() + 1;
    const ytdSpend = effectiveMetrics.totalInvestment;
    const projectedYearEnd = (ytdSpend / monthsElapsed) * 12;
    const budgetAllocated = ytdSpend * 0.95; // Demo: assume 5% variance
    const budgetLeakage = globalMetrics.unutilizedBudget;
    const recoveryPotential = Math.round(budgetLeakage * 0.65);
    
    return {
      ytdSpend,
      projectedYearEnd,
      budgetAllocated,
      budgetLeakage,
      recoveryPotential,
    };
  }, [effectiveMetrics, globalMetrics]);

  // Spend Drivers (top 5 benefits by spend)
  const spendDrivers: SpendDriver[] = useMemo(() => {
    if (!spendAllocation || !effectiveMetrics) return [];
    const total = effectiveMetrics.totalInvestment;
    
    return spendAllocation.slice(0, 5).map((item, idx) => ({
      id: item.name.toLowerCase().replace(/\s+/g, '-'),
      name: item.name,
      spend: item.amount || item.value * 50000,
      percentOfTotal: total > 0 ? ((item.amount || item.value * 50000) / total) * 100 : 0,
      delta: [8.5, -2.3, 5.1, 12.4, -4.7][idx] || 0,
    }));
  }, [spendAllocation, effectiveMetrics]);

  // Leakage Drivers (top 5 benefits by leakage)
  const leakageDrivers: LeakageDriver[] = useMemo(() => {
    if (!spendAllocation) return [];
    const totalLeakage = globalMetrics.unutilizedBudget;
    const causes: Array<'awareness' | 'friction' | 'eligibility' | 'policy'> = 
      ['awareness', 'friction', 'eligibility', 'awareness', 'policy'];
    
    // Demo: Learning & Wellbeing typically have highest leakage
    const leakageData = [
      { name: 'Learning', leakage: 130000 },
      { name: 'Wellbeing', leakage: 60000 },
      { name: 'Transport', leakage: 80000 },
      { name: 'Housing', leakage: 300000 },
      { name: 'Health', leakage: 50000 },
    ].sort((a, b) => b.leakage - a.leakage);

    return leakageData.map((item, idx) => ({
      id: item.name.toLowerCase(),
      name: item.name,
      leakage: item.leakage,
      percentOfTotal: totalLeakage > 0 ? (item.leakage / totalLeakage) * 100 : 0,
      cause: causes[idx],
    }));
  }, [spendAllocation, globalMetrics]);

  // Recommended Actions (3 highest impact) - PROMPT 07 compliant
  const recommendedActions: RecommendedAction[] = useMemo(() => {
    const thirtyDaysFromNow = addDays(new Date(), 30);
    
    // Map ActionType to LeverType
    const getLeverType = (type?: string): 'policy' | 'vendor' | 'comms' | 'process' => {
      if (type === 'policy') return 'policy';
      if (type === 'vendor') return 'vendor';
      if (type === 'comms') return 'comms';
      return 'process';
    };
    
    // Derive confidence display level from action confidence
    const getConfidence = (conf: string): 'high' | 'medium' | 'low' => {
      if (conf === 'high') return 'high';
      if (conf === 'medium') return 'medium';
      return 'low';
    };
    
    return filteredActions
      .filter(a => !['completed', 'cancelled'].includes(a.status))
      .filter(a => !a.dueDate || a.dueDate <= thirtyDaysFromNow)
      .slice(0, 3)
      .map(a => {
        const baseImpact = a.expectedImpact.costAvoidance || 0;
        const confidence = getConfidence(a.confidence);
        // Use range values if available, otherwise derive from base impact
        const impactMin = a.expectedImpact.costAvoidanceLow || (confidence === 'high' ? baseImpact : Math.round(baseImpact * 0.75));
        const impactMax = a.expectedImpact.costAvoidanceHigh || baseImpact;
        
        return {
          id: a.id,
          title: a.title,
          description: a.description,
          impactAEDMin: impactMin,
          impactAEDMax: impactMax,
          leverType: getLeverType(a.type),
          confidence,
          mechanism: a.description || `Execute ${a.title.toLowerCase()} to achieve target outcomes.`,
          owner: a.owner,
          ownerRole: a.priority === 'P0' ? 'Lead' : 'Owner',
          dueDate: a.dueDate,
        };
      });
  }, [filteredActions]);

  // Risk Indicators - renamed "Compliance Rate" to "SLA Compliance" for clarity
  const riskIndicators: RiskIndicator[] = useMemo(() => [
    {
      id: 'sla',
      type: 'sla_breach' as const,
      label: 'Claims at SLA Risk',
      value: 8,
      status: 'warning' as const,
      trend: -15,
      trendLabel: 'vs last week',
      linkTo: '/employer/ops?tab=sla_risk',
      linkLabel: 'View SLA Breaches',
    },
    {
      id: 'settlements',
      type: 'settlement_backlog' as const,
      label: 'Pending Export',
      value: 'AED 125K',
      status: 'warning' as const,
      trend: 12,
      trendLabel: 'vs last week',
      linkTo: '/employer/settlements',
      linkLabel: 'View Settlements',
    },
    {
      id: 'compliance',
      type: 'policy_compliance' as const,
      label: 'SLA Compliance',
      value: '94%',
      status: 'healthy' as const,
      trend: 2,
      trendLabel: 'vs last month',
      linkTo: '/employer/data-controls',
      linkLabel: 'View Data Quality',
    },
  ], []);

  // Loading state
  if (metricsLoading || !metrics || !bottomLineMetrics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-muted rounded-xl" />
        <div className="h-12 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-muted rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  // Exec Brief data
  const execBriefData = {
    ytdSpend: bottomLineMetrics.ytdSpend,
    projectedYearEnd: bottomLineMetrics.projectedYearEnd,
    budgetVariance: bottomLineMetrics.ytdSpend - bottomLineMetrics.budgetAllocated,
    utilizationRate: effectiveMetrics?.utilizationRate || 72,
    budgetLeakage: bottomLineMetrics.budgetLeakage,
    recoveryPotential: bottomLineMetrics.recoveryPotential,
    slaCompliance: claimMetrics?.slaCompliance || 94,
    pendingActions: recommendedActions.length,
  };

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <div className="space-y-8">
        {/* PAGE HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
              Executive Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              FY 2024 · {globalMetrics.activeEmployees} employees · Benefits portfolio overview
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <GenerateExecBriefButton data={execBriefData} />
          </div>
        </div>

        {/* DATA TRUST PANEL - Collapsible, expanded if Low confidence */}
        <DataTrustPanel pageName="dashboard" />

        {/* SECTION 1: BOTTOM LINE (4 KPI cards) - equal heights enforced */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Bottom Line
          </h2>
          <ExecBottomLineKPIs
            metrics={bottomLineMetrics}
            lastUpdated={new Date()}
            onKPIClick={(kpiId) => {
              if (kpiId === 'ytdSpend' || kpiId === 'projected' || kpiId === 'variance') {
                navigate('/employer/spend');
              } else if (kpiId === 'leakage') {
                navigate('/employer/optimization');
              }
            }}
          />
        </section>

        {/* SECTION 2: DRIVERS (left) + ACTIONS (right) - PROMPT 07 layout */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Drivers & Decisions
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Top Drivers (8 cols) */}
            <div className="lg:col-span-8">
              <ExecTopDriversPanel
                spendDrivers={spendDrivers}
                leakageDrivers={leakageDrivers}
                totalSpend={bottomLineMetrics.ytdSpend}
                totalLeakage={bottomLineMetrics.budgetLeakage}
              />
            </div>
            {/* Right: Actions (4 cols) */}
            <div className="lg:col-span-4">
              <ExecDecisionsPanel
                actions={recommendedActions}
                onAssignAction={(actionId) => navigate(`/employer/actions?open=${actionId}`)}
                onCreateAction={() => navigate('/employer/actions?create=true')}
              />
            </div>
          </div>
        </section>

        {/* SECTION 4: RISKS & EXCEPTIONS (3 compact cards in grid) */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Risks & Exceptions
          </h2>
          <ExecRisksPanel risks={riskIndicators} />
        </section>
      </div>
    </PageConfidenceGate>
  );
}
