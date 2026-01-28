/**
 * Optimization Page (CFO-Defensible Strategic Decision Support)
 * 
 * Three executive-focused tabs with strict definitions:
 * 
 * Tab 1: "Cost Efficiency" (CFO View) - Budget Leakage, noncompliance, duplicates
 * Tab 2: "Value Activation" (CHRO View) - Unused value, adoption barriers  
 * Tab 3: "Portfolio Rebalancing" (CEO View) - Shift budget based on utilization
 * 
 * Every recommendation uses the standard card template with:
 * - Verb-led title
 * - Impact (AED range)
 * - Confidence level
 * - Mechanism + Risk/Downside
 * - Primary CTA: "Simulate"
 * - Secondary CTA: "Create Action" / "Open Policy"
 * 
 * @module Optimization
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Target, Download, Calendar, Info,
  Wallet, Users, Scale,
  CircleDollarSign,
} from 'lucide-react';
import { 
  EmployerGlobalFiltersBar, 
  DataConfidenceBadge, 
  PageConfidenceGate, 
  useDataCoverageMetrics,
  CFORecoveryKPIGrid,
} from '@/components/employer';
import { SavingsFunnel } from '@/components/employer/SavingsFunnel';
import { CreateActionModal, OpportunityData } from '@/components/employer/CreateActionModal';
import { PageLayout } from '@/components/shared';
import { ZombieCategoryDrawer } from '@/components/employer/ZombieCategoryDrawer';
import { LaunchPlaybookModal } from '@/components/employer/LaunchPlaybookModal';
import { useZombieSpendData, RecoveryPlaybook } from '@/hooks/useZombieSpendData';
import { usePlaybookRuns } from '@/hooks/usePlaybookRuns';
import { formatCurrencyAED, cn } from '@/lib/utils';
import { 
  UTILIZATION_METRICS, 
  CAUSE_BREAKDOWN, 
  QUICK_WINS,
  getTopCause,
  ORG_BASELINE,
} from '@/lib/executiveMetricsConstants';
import { toast } from 'sonner';

// Import new strategic tab components
import {
  CostEfficiencyTab,
  ValueActivationTab,
  PortfolioRebalancingTab,
  getStrategicOptimizationData,
  CostEfficiencyItem,
  ValueActivationItem,
  PortfolioRebalanceItem,
  StrategicTabType,
  RecoveryBatchReviewModal,
  OptimizationSimulatorModal,
  OptimizationRecommendation,
} from '@/components/employer/optimization';

// ============= MAIN COMPONENT =============

export default function ZombieSpendPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const coverageMetrics = useDataCoverageMetrics();
  
  const {
    categories,
    allCategories,
    selectedCategory,
    drawerOpen,
    showHighConfidenceOnly,
    playbooks,
    setShowHighConfidenceOnly,
    openCategoryDrawer,
    closeCategoryDrawer,
    getRecommendedPlaybooks,
  } = useZombieSpendData();
  
  const {
    launchPlaybook,
  } = usePlaybookRuns();
  
  const [launchModalOpen, setLaunchModalOpen] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState<RecoveryPlaybook | null>(null);
  const [activeTab, setActiveTab] = useState<StrategicTabType>('cost_efficiency');
  
  // Action modal state
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityData | null>(null);
  
  // Recovery batch review modal state
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);
  const [selectedRecoveryItem, setSelectedRecoveryItem] = useState<CostEfficiencyItem | null>(null);
  
  // Simulator modal state
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simulatorRecommendation, setSimulatorRecommendation] = useState<OptimizationRecommendation | null>(null);
  
  // Handle URL params for deep linking
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['cost_efficiency', 'value_activation', 'portfolio_rebalancing'].includes(tabParam)) {
      setActiveTab(tabParam as StrategicTabType);
    }
    
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const cat = allCategories.find(c => c.id === categoryParam || c.name === categoryParam);
      if (cat) {
        openCategoryDrawer(cat.id);
      }
    }
  }, [searchParams, allCategories]);
  
  // Get strategic optimization data
  const strategicData = useMemo(() => getStrategicOptimizationData(), []);
  
  // Use consistent metrics from constants
  const consistentUnrealizedValue = UTILIZATION_METRICS.unrealizedValue;
  const consistentRecoverable = UTILIZATION_METRICS.estimatedRecoverable;
  const consistentTopCause = getTopCause();
  const consistentTopCausePercent = CAUSE_BREAKDOWN[consistentTopCause].percent;
  
  // Quick wins from constants
  const consistentQuickWins = QUICK_WINS.reduce((sum, w) => sum + w.estimatedRecovery, 0);
  
  // Savings funnel values (demo)
  const inActionPlanValue = consistentRecoverable * 0.35;
  const realizedValue = consistentRecoverable * 0.12;

  // Calculate total opportunity across all tabs (use min values for display)
  const totalOpportunityMin = 
    strategicData.costEfficiency.totalRecoverableMin +
    strategicData.valueActivation.totalUnutilizedMin +
    strategicData.portfolioRebalancing.totalReallocationMin;
    
  const totalOpportunityMax = 
    strategicData.costEfficiency.totalRecoverableMax +
    strategicData.valueActivation.totalUnutilizedMax +
    strategicData.portfolioRebalancing.totalReallocationMax;

  // ============= SIMULATE HANDLERS =============
  
  const handleSimulateCostEfficiency = (item: CostEfficiencyItem) => {
    const rec: OptimizationRecommendation = {
      id: item.id,
      title: item.title,
      category: item.category,
      impactMin: item.recoveryAmountMin,
      impactMax: item.recoveryAmountMax,
      confidence: item.confidence,
      mechanism: item.mechanism,
      riskDownside: item.riskDownside,
      type: 'cost_efficiency',
      rootCause: item.rootCause,
      affectedHeadcount: item.affectedEmployees?.length,
      relatedPolicyId: item.relatedPolicyId,
    };
    setSimulatorRecommendation(rec);
    setSimulatorOpen(true);
  };
  
  const handleSimulateValueActivation = (item: ValueActivationItem) => {
    const rec: OptimizationRecommendation = {
      id: item.id,
      title: item.title,
      category: item.category,
      impactMin: item.unutilizedValueMin,
      impactMax: item.unutilizedValueMax,
      confidence: item.awareness === 'low' ? 'high' : 'medium',
      mechanism: item.mechanism,
      riskDownside: item.riskDownside,
      type: 'value_activation',
      affectedHeadcount: item.eligibleCount - item.claimantCount,
    };
    setSimulatorRecommendation(rec);
    setSimulatorOpen(true);
  };
  
  const handleSimulatePortfolio = (item: PortfolioRebalanceItem) => {
    const rec: OptimizationRecommendation = {
      id: item.id,
      title: item.title,
      category: `${item.sourceCategory} → ${item.suggestedTarget}`,
      impactMin: item.reallocationAmountMin,
      impactMax: item.reallocationAmountMax,
      confidence: item.targetDemand === 'high' ? 'high' : 'medium',
      mechanism: item.mechanism,
      riskDownside: item.riskDownside,
      type: 'portfolio_rebalancing',
      affectedHeadcount: item.employeeImpactEstimate,
      relatedPolicyId: item.policyChangesRequired?.[0],
    };
    setSimulatorRecommendation(rec);
    setSimulatorOpen(true);
  };

  // ============= CREATE ACTION HANDLERS =============
  
  const handleCreateActionCostEfficiency = (item: CostEfficiencyItem) => {
    setSelectedOpportunity({
      id: item.id,
      title: item.title,
      category: item.category,
      type: 'hard_savings',
      valueOpportunity: item.recoveryAmountMin,
      rootCause: item.rootCause || 'policy_gap',
      effort: item.confidence === 'high' ? 'low' : 'medium',
      timeToImpact: '2-4 weeks',
    });
    setActionModalOpen(true);
  };
  
  const handleCreateActionValueActivation = (item: ValueActivationItem) => {
    setSelectedOpportunity({
      id: item.id,
      title: item.title,
      category: item.category,
      type: 'value_realization',
      valueOpportunity: item.unutilizedValueMin,
      rootCause: 'awareness',
      effort: 'low',
      timeToImpact: '4-6 weeks',
    });
    setActionModalOpen(true);
  };

  const handleCreateActionPortfolio = (item: PortfolioRebalanceItem) => {
    setSelectedOpportunity({
      id: item.id,
      title: item.title,
      category: item.sourceCategory,
      type: 'value_realization',
      valueOpportunity: item.reallocationAmountMin,
      rootCause: 'policy',
      effort: 'high',
      timeToImpact: '8-12 weeks',
    });
    setActionModalOpen(true);
  };

  // ============= SUBMIT FOR APPROVAL =============
  
  const handleSubmitForApproval = (recommendation: OptimizationRecommendation) => {
    navigate(`/employer/actions?action=new&opportunityId=${recommendation.id}&fromSimulator=true`);
  };

  // Handle action creation
  const handleCreateAction = async (actionData: {
    title: string;
    description: string;
    owner: string;
    dueDate: string;
    priority: string;
    expectedImpact: number;
    opportunityId: string;
  }) => {
    console.log('Creating action:', actionData);
    navigate(`/employer/actions?action=new&opportunityId=${actionData.opportunityId}`);
  };
  
  const handleLaunchFromDrawer = (playbook: RecoveryPlaybook) => {
    setSelectedPlaybook(playbook);
    closeCategoryDrawer();
    setTimeout(() => setLaunchModalOpen(true), 200);
  };
  
  const handleLaunch = async (params: {
    playbookId: string;
    categoryId: string;
    categoryName: string;
    targetSegment?: string;
    owner: string;
    dueDate: string;
    expectedImpactAED: number;
    notes?: string;
  }) => {
    return launchPlaybook({
      ...params,
      playbookId: params.playbookId as any,
    });
  };

  const handleOpenPolicy = (policyId: string) => {
    navigate(`/employer/policies/${policyId}`);
  };

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <PageLayout
        title="Optimization"
        description={`FY ${ORG_BASELINE.fiscalYear} · ${formatCurrencyAED(totalOpportunityMin, { abbreviate: true })} – ${formatCurrencyAED(totalOpportunityMax, { abbreviate: true })} total potential`}
        icon={Target}
        iconClassName="bg-success/10 text-success"
        confidenceBadge={<DataConfidenceBadge metrics={coverageMetrics} />}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch 
                id="high-confidence" 
                checked={showHighConfidenceOnly}
                onCheckedChange={setShowHighConfidenceOnly}
              />
              <Label htmlFor="high-confidence" className="text-sm">
                High confidence only
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filters to High confidence items only.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              YTD {ORG_BASELINE.fiscalYear}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        }
        filters={<EmployerGlobalFiltersBar />}
      >
        {/* 1. CFO KPI GRID - 4 Core Metrics First */}
        <CFORecoveryKPIGrid
          metrics={{
            unrealizedValue: consistentUnrealizedValue,
            estimatedRecoverable: consistentRecoverable,
            topCause: consistentTopCause,
            topCausePercent: consistentTopCausePercent,
            quickWinPotential: consistentQuickWins,
            avgTimeToImpact: '2-4 weeks',
          }}
          onKPIClick={(kpiId) => toast.info(`Opening ${kpiId} drilldown...`)}
        />
        
        {/* 2. Savings Funnel - Progress Visualization */}
        <SavingsFunnel 
          identifiedValue={consistentRecoverable}
          inActionPlanValue={inActionPlanValue}
          realizedValue={realizedValue}
        />
        
        {/* 3. Strategic Decision Tabs */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Strategic Decision Framework
                  <InfoTooltip 
                    formula="Three executive lenses for budget optimization" 
                    dataSource="Policy rules + Claims + Demand analysis" 
                  />
                </CardTitle>
                <CardDescription>
                  CFO-defensible recommendations with impact simulations
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <CircleDollarSign className="h-3 w-3" />
                  {formatCurrencyAED(totalOpportunityMin, { abbreviate: true })} – {formatCurrencyAED(totalOpportunityMax, { abbreviate: true })}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StrategicTabType)}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="cost_efficiency" className="gap-2">
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">Cost Efficiency</span>
                  <span className="sm:hidden">CFO</span>
                  <Badge variant="secondary" className="ml-1 text-xs hidden md:flex">
                    {formatCurrencyAED(strategicData.costEfficiency.totalRecoverableMin, { abbreviate: true })}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="value_activation" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Value Activation</span>
                  <span className="sm:hidden">CHRO</span>
                  <Badge variant="secondary" className="ml-1 text-xs hidden md:flex">
                    {strategicData.valueActivation.benefitCount} benefits
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="portfolio_rebalancing" className="gap-2">
                  <Scale className="h-4 w-4" />
                  <span className="hidden sm:inline">Portfolio Rebalancing</span>
                  <span className="sm:hidden">CEO</span>
                  <Badge variant="secondary" className="ml-1 text-xs hidden md:flex">
                    {formatCurrencyAED(strategicData.portfolioRebalancing.totalReallocationMin, { abbreviate: true })}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Cost Efficiency (CFO View) */}
              <TabsContent value="cost_efficiency" className="mt-0">
                <CostEfficiencyTab 
                  items={strategicData.costEfficiency.items}
                  totalRecoverableMin={strategicData.costEfficiency.totalRecoverableMin}
                  totalRecoverableMax={strategicData.costEfficiency.totalRecoverableMax}
                  onSimulate={handleSimulateCostEfficiency}
                  onCreateAction={handleCreateActionCostEfficiency}
                  onOpenPolicy={handleOpenPolicy}
                />
              </TabsContent>

              {/* Tab 2: Value Activation (CHRO View) */}
              <TabsContent value="value_activation" className="mt-0">
                <ValueActivationTab 
                  items={strategicData.valueActivation.items}
                  totalUnutilizedMin={strategicData.valueActivation.totalUnutilizedMin}
                  totalUnutilizedMax={strategicData.valueActivation.totalUnutilizedMax}
                  onSimulate={handleSimulateValueActivation}
                  onCreateAction={handleCreateActionValueActivation}
                />
              </TabsContent>

              {/* Tab 3: Portfolio Rebalancing (CEO View) */}
              <TabsContent value="portfolio_rebalancing" className="mt-0">
                <PortfolioRebalancingTab 
                  items={strategicData.portfolioRebalancing.items}
                  totalReallocationMin={strategicData.portfolioRebalancing.totalReallocationMin}
                  totalReallocationMax={strategicData.portfolioRebalancing.totalReallocationMax}
                  onSimulate={handleSimulatePortfolio}
                  onCreateAction={handleCreateActionPortfolio}
                  onOpenPolicy={handleOpenPolicy}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Drawers & Modals */}
        <ZombieCategoryDrawer
          open={drawerOpen}
          onOpenChange={closeCategoryDrawer}
          category={selectedCategory}
          recommendedPlaybooks={selectedCategory ? getRecommendedPlaybooks(selectedCategory) : []}
          onLaunchPlaybook={handleLaunchFromDrawer}
        />
        
        <LaunchPlaybookModal
          open={launchModalOpen}
          onOpenChange={setLaunchModalOpen}
          playbook={selectedPlaybook}
          category={selectedCategory}
          allCategories={allCategories}
          onLaunch={handleLaunch}
          onLaunchComplete={() => {}}
        />
        
        <CreateActionModal
          open={actionModalOpen}
          onOpenChange={setActionModalOpen}
          opportunity={selectedOpportunity}
          onCreateAction={handleCreateAction}
        />
        
        <RecoveryBatchReviewModal
          open={recoveryModalOpen}
          onOpenChange={setRecoveryModalOpen}
          item={selectedRecoveryItem}
        />
        
        {/* Simulator Modal */}
        <OptimizationSimulatorModal
          open={simulatorOpen}
          onOpenChange={setSimulatorOpen}
          recommendation={simulatorRecommendation}
          onSubmitForApproval={handleSubmitForApproval}
        />
      </PageLayout>
    </PageConfidenceGate>
  );
}
