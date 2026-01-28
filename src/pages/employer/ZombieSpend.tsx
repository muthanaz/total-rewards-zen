/**
 * Optimization Page (Strategic Decision Support)
 * 
 * Three executive-focused tabs that guide strategic budget decisions:
 * 
 * Tab 1: "Cost Efficiency" (CFO View) - Hard financial waste recovery
 * Tab 2: "Value Activation" (CHRO View) - Low adoption awareness campaigns
 * Tab 3: "Portfolio Rebalancing" (CEO View) - Moving idle money to high-demand areas
 * 
 * Uses enterprise-grade language without false retention promises.
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
  Target, ArrowRight,
  Download, Calendar, Info,
  Wallet, Users, Scale,
  TrendingUp,
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

  // Calculate total opportunity across all tabs
  const totalOpportunity = 
    strategicData.costEfficiency.totalRecoverable +
    strategicData.valueActivation.totalUnutilized +
    strategicData.portfolioRebalancing.totalReallocationPotential;

  // Handle Cost Efficiency action - opens the batch review modal
  const handleInitiateRecovery = (item: CostEfficiencyItem) => {
    setSelectedRecoveryItem(item);
    setRecoveryModalOpen(true);
  };

  // Handle Value Activation action
  const handleLaunchCampaign = (item: ValueActivationItem) => {
    setSelectedOpportunity({
      id: item.id,
      title: `Awareness Campaign: ${item.benefitName}`,
      category: item.category,
      type: 'value_realization',
      valueOpportunity: item.unutilizedValue,
      rootCause: 'awareness',
      effort: 'low',
      timeToImpact: '4-6 weeks',
    });
    setActionModalOpen(true);
  };

  // Handle Portfolio Rebalancing action
  const handleEvaluatePolicyShift = (item: PortfolioRebalanceItem) => {
    setSelectedOpportunity({
      id: item.id,
      title: `Policy Shift: ${item.sourceCategory} → ${item.suggestedTarget}`,
      category: item.sourceCategory,
      type: 'value_realization',
      valueOpportunity: item.reallocationAmount,
      rootCause: 'policy',
      effort: 'high',
      timeToImpact: '8-12 weeks',
    });
    setActionModalOpen(true);
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

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <PageLayout
        title="Optimization"
        description={`FY ${ORG_BASELINE.fiscalYear} · ${formatCurrencyAED(totalOpportunity, { abbreviate: true })} total optimization potential`}
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
                  Three perspectives for strategic budget decisions
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <CircleDollarSign className="h-3 w-3" />
                  {formatCurrencyAED(totalOpportunity, { abbreviate: true })} Total Opportunity
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
                    {formatCurrencyAED(strategicData.costEfficiency.totalRecoverable, { abbreviate: true })}
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
                    {formatCurrencyAED(strategicData.portfolioRebalancing.totalReallocationPotential, { abbreviate: true })}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Cost Efficiency (CFO View) */}
              <TabsContent value="cost_efficiency" className="mt-0">
                <div className="mb-4 p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-semibold text-sm">The CFO View</p>
                      <p className="text-xs text-muted-foreground">
                        Hard financial waste: Duplicate coverage, Vendor overcharges, Unclaimed cash-out options
                      </p>
                    </div>
                  </div>
                </div>
                <CostEfficiencyTab 
                  items={strategicData.costEfficiency.items}
                  totalRecoverable={strategicData.costEfficiency.totalRecoverable}
                  onInitiateRecovery={handleInitiateRecovery}
                />
              </TabsContent>

              {/* Tab 2: Value Activation (CHRO View) */}
              <TabsContent value="value_activation" className="mt-0">
                <div className="mb-4 p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-info" />
                    <div>
                      <p className="font-semibold text-sm">The CHRO View</p>
                      <p className="text-xs text-muted-foreground">
                        Benefits with &lt;20% adoption rate - Ensuring employees know what they're entitled to
                      </p>
                    </div>
                  </div>
                </div>
                <ValueActivationTab 
                  items={strategicData.valueActivation.items}
                  totalUnutilized={strategicData.valueActivation.totalUnutilized}
                  onLaunchCampaign={handleLaunchCampaign}
                />
              </TabsContent>

              {/* Tab 3: Portfolio Rebalancing (CEO View) */}
              <TabsContent value="portfolio_rebalancing" className="mt-0">
                <div className="mb-4 p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-semibold text-sm">The CEO View</p>
                      <p className="text-xs text-muted-foreground">
                        Moving idle money to high-demand areas - Aligning spend with what employees actually use
                      </p>
                    </div>
                  </div>
                </div>
                <PortfolioRebalancingTab 
                  items={strategicData.portfolioRebalancing.items}
                  totalReallocationPotential={strategicData.portfolioRebalancing.totalReallocationPotential}
                  onEvaluatePolicyShift={handleEvaluatePolicyShift}
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
      </PageLayout>
    </PageConfidenceGate>
  );
}
