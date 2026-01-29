/**
 * Spend & Forecast Page - Premium Module
 * 
 * Structure:
 * 1. KPI Row (4 cards): Annual Budget, YTD Spend, Forecast Year-End, Variance
 * 2. Budget Stack Chart with legend and tooltip definitions
 * 3. Drilldown Tabs: By Pillar, By Category, By Org Segment
 * 4. What Changed Panel: Top 3 variance drivers
 * 5. Sticky Filters: Time range, segment, benefit filters
 * 
 * Every drilldown row has CTAs: Open Policy, Open Optimization, Create Action
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Download, Calendar, TrendingUp } from 'lucide-react';
import { BudgetStackChart } from '@/components/charts/BudgetStackChart';
import { formatCurrencyAED, formatInteger } from '@/lib/utils';
import { 
  INVESTMENT_METRICS, 
  UTILIZATION_METRICS,
  ORG_BASELINE,
  CATEGORY_METRICS_EXEC,
} from '@/lib/executiveMetricsConstants';
import { 
  PageConfidenceGate, 
  useDataCoverageMetrics,
  CreateActionModal,
  type OpportunityData,
} from '@/components/employer';
import { PageLayout } from '@/components/shared';
import { DataTrustPanel } from '@/components/trust';
import { toast } from 'sonner';

// Import new spend module components
import {
  SpendForecastKPIs,
  SpendDrilldownTabs,
  WhatChangedPanel,
  SpendFiltersBar,
  type SpendFilters,
  type VarianceDriver,
} from '@/components/employer/spend';

// ============================================================================
// DATA GENERATION FROM CONSTANTS
// ============================================================================

// Generate pillar data
const generatePillarData = () => {
  const pillars = ['Housing', 'Education', 'Health', 'Transport', 'Wellbeing', 'Financial'];
  return pillars.map((name, idx) => {
    const budget = INVESTMENT_METRICS.allocatedBudget * (0.3 - idx * 0.04);
    const ytdSpend = budget * (0.6 + idx * 0.05);
    const forecast = ytdSpend * 1.5; // Simplified projection
    const variance = forecast - budget;
    return {
      id: name.toLowerCase(),
      name,
      budget,
      ytdSpend,
      forecast,
      utilization: (ytdSpend / budget) * 100,
      variance,
      variancePercent: (variance / budget) * 100,
      employeeCount: Math.round(ORG_BASELINE.employeeCount * (0.8 - idx * 0.1)),
    };
  });
};

// Generate category data from CATEGORY_METRICS_EXEC
const generateCategoryData = () => {
  return Object.values(CATEGORY_METRICS_EXEC).map((cat) => {
    const forecast = cat.claimed * 1.4;
    const variance = forecast - cat.budget;
    return {
      id: cat.name.toLowerCase().replace(/\s+/g, '-'),
      name: cat.name,
      budget: cat.budget,
      ytdSpend: cat.claimed,
      forecast,
      utilization: cat.utilization,
      variance,
      variancePercent: cat.budget > 0 ? (variance / cat.budget) * 100 : 0,
      employeeCount: Math.round(ORG_BASELINE.employeeCount * 0.7),
    };
  });
};

// Generate segment data
const generateSegmentData = () => {
  const segments = [
    { name: 'Engineering', factor: 0.35 },
    { name: 'Sales', factor: 0.25 },
    { name: 'Operations', factor: 0.20 },
    { name: 'Marketing', factor: 0.12 },
    { name: 'HR & Admin', factor: 0.08 },
  ];
  return segments.map((seg) => {
    const budget = INVESTMENT_METRICS.allocatedBudget * seg.factor;
    const ytdSpend = budget * (0.65 + Math.random() * 0.2);
    const forecast = ytdSpend * 1.5;
    const variance = forecast - budget;
    return {
      id: seg.name.toLowerCase().replace(/\s+/g, '-'),
      name: seg.name,
      budget,
      ytdSpend,
      forecast,
      utilization: (ytdSpend / budget) * 100,
      variance,
      variancePercent: (variance / budget) * 100,
      employeeCount: Math.round(ORG_BASELINE.employeeCount * seg.factor),
    };
  });
};

// Generate variance drivers
const generateVarianceDrivers = (): VarianceDriver[] => [
  {
    id: 'housing-increase',
    name: 'Housing Allowance',
    type: 'benefit',
    change: 245000,
    changePercent: 12.3,
    explanation: 'Rental market inflation (+15% YoY) increased claims across all grades',
    sourceLink: '/employer/segments?pillar=housing',
    severity: 'high',
  },
  {
    id: 'engineering-growth',
    name: 'Engineering Department',
    type: 'segment',
    change: 180000,
    changePercent: 18.5,
    explanation: 'Headcount growth (+12 hires) and higher average grade mix',
    sourceLink: '/employer/segments?department=engineering',
    severity: 'high',
  },
  {
    id: 'education-policy',
    name: 'Education Policy Update',
    type: 'policy',
    change: -85000,
    changePercent: -8.2,
    explanation: 'New tuition cap policy reduced per-child maximum by 10%',
    sourceLink: '/employer/policies?search=education',
    severity: 'medium',
  },
];

// Budget stack chart data
const generateBudgetStackData = () => {
  const pillars = generatePillarData();
  return pillars.map((p) => ({
    name: p.name,
    allocated: p.budget,
    utilized: p.ytdSpend,
    runRateProjection: p.forecast,
  }));
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function Spend() {
  const navigate = useNavigate();
  const coverageMetrics = useDataCoverageMetrics();
  
  // Filters state
  const [filters, setFilters] = useState<SpendFilters>({
    timeRange: 'ytd',
    grades: [],
    departments: [],
    locations: [],
    benefitPillars: [],
  });

  // Action modal state
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    opportunity: OpportunityData | null;
  }>({ open: false, opportunity: null });

  // Data
  const pillarData = useMemo(() => generatePillarData(), []);
  const categoryData = useMemo(() => generateCategoryData(), []);
  const segmentData = useMemo(() => generateSegmentData(), []);
  const varianceDrivers = useMemo(() => generateVarianceDrivers(), []);
  const budgetStackData = useMemo(() => generateBudgetStackData(), []);

  // KPI data
  const kpiData = useMemo(() => ({
    annualBudget: INVESTMENT_METRICS.allocatedBudget,
    ytdSpend: INVESTMENT_METRICS.actualSpend,
    forecastYearEnd: INVESTMENT_METRICS.actualSpend * 1.4, // ~140% projection
    priorYearSpend: INVESTMENT_METRICS.actualSpend * 0.92, // 8% YoY growth
  }), []);

  // Handle create action from drilldown
  const handleCreateAction = (row: any, source: string) => {
    const opportunity: OpportunityData = {
      id: row.id,
      title: `Review ${row.name} Spend`,
      category: source,
      type: row.variance > 0 ? 'hard_savings' : 'value_realization',
      valueOpportunity: Math.abs(row.variance),
      rootCause: `${source} variance of ${formatCurrencyAED(row.variance)} for ${row.name}`,
      effort: 'medium',
      timeToImpact: '2-4 weeks',
    };
    setActionModal({ open: true, opportunity });
  };

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <PageLayout
        title="Spend & Forecast"
        description={`FY ${ORG_BASELINE.fiscalYear} · ${formatInteger(ORG_BASELINE.employeeCount)} employees · ${formatCurrencyAED(INVESTMENT_METRICS.costPerEmployee, { abbreviate: true })} per head`}
        icon={DollarSign}
        iconClassName="bg-primary/10 text-primary"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              FY {ORG_BASELINE.fiscalYear}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        }
      >
        {/* DATA TRUST PANEL */}
        <DataTrustPanel pageName="spend" />
        
        {/* Sticky Filters */}
        <SpendFiltersBar 
          filters={filters} 
          onFiltersChange={setFilters}
        />

        {/* 1. KPI Row */}
        <SpendForecastKPIs 
          data={kpiData}
          onKPIClick={(kpiId) => toast.info(`Opening ${kpiId} drilldown...`)}
        />

        {/* 2. Budget Stack Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Budget Allocation vs Spend
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Gray = Budget · Green = YTD Spend · Dotted = Run-Rate Projection
            </p>
          </CardHeader>
          <CardContent>
            <BudgetStackChart
              data={budgetStackData}
              showRunRate={true}
              barHeight={32}
            />
          </CardContent>
        </Card>

        {/* 3. Drilldown Tabs + 4. What Changed Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SpendDrilldownTabs
              byPillar={pillarData}
              byCategory={categoryData}
              bySegment={segmentData}
              onCreateAction={handleCreateAction}
            />
          </div>
          <div className="lg:col-span-1">
            <WhatChangedPanel 
              drivers={varianceDrivers}
              periodLabel="vs Prior Year"
            />
          </div>
        </div>

        {/* Action Create Modal */}
        <CreateActionModal
          open={actionModal.open}
          onOpenChange={(open) => setActionModal({ open, opportunity: null })}
          opportunity={actionModal.opportunity}
          onCreateAction={(actionData) => {
            toast.success(`Action created: ${actionData.title}`);
            setActionModal({ open: false, opportunity: null });
          }}
        />
      </PageLayout>
    </PageConfidenceGate>
  );
}

export default Spend;
