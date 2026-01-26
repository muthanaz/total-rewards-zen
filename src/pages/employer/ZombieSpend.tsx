/**
 * Recoverable Value Page (formerly "Zombie Spend" / "Optimization Opportunities")
 * 
 * Executive-grade analytics page that distinguishes unrealized value by:
 * - Awareness/Engagement
 * - Eligibility
 * - Process Friction
 * - Policy Design
 * 
 * @module RecoverableValue
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Ghost, Target, ArrowRight,
  Eye, Play, Clock, CheckCircle2, Pause, CircleDot, Info,
  Download, Calendar, TrendingUp,
} from 'lucide-react';
import { 
  EmployerGlobalFiltersBar, 
  DataConfidenceBadge, 
  PageConfidenceGate, 
  useDataCoverageMetrics,
  ExecPageHeader,
} from '@/components/employer';
import { 
  RecoverableValueInsights, 
  generateRecoverableInsights,
  RecoveryCauseType,
} from '@/components/employer/RecoverableValueInsights';
import { RecoverableValueKPIGrid } from '@/components/employer/RecoverableValueKPIGrid';
import { CauseBreakdownChart, CauseBreakdownData } from '@/components/employer/CauseBreakdownChart';
import { TopRecoveryPlays, RecoveryPlay } from '@/components/employer/TopRecoveryPlays';
import { PageLayout } from '@/components/shared';
import { ZombieCategoryDrawer } from '@/components/employer/ZombieCategoryDrawer';
import { LaunchPlaybookModal } from '@/components/employer/LaunchPlaybookModal';
import { useZombieSpendData, ROOT_CAUSE_DEFINITIONS, RecoveryPlaybook, CONFIDENCE_FACTORS } from '@/hooks/useZombieSpendData';
import { usePlaybookRuns, PlaybookRunStatus } from '@/hooks/usePlaybookRuns';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

// ============= STATUS CONFIG =============

const confidenceBadgeStyles = {
  high: 'bg-success/10 text-success border-success/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low: 'bg-destructive/10 text-destructive border-destructive/30',
};

const runStatusConfig: Record<PlaybookRunStatus, { label: string; icon: typeof CircleDot; color: string }> = {
  draft: { label: 'Draft', icon: CircleDot, color: 'text-muted-foreground' },
  active: { label: 'Active', icon: Play, color: 'text-info' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-success' },
  paused: { label: 'Paused', icon: Pause, color: 'text-warning' },
};

// Map root causes to our 4 cause types
const rootCauseToCauseType: Record<string, RecoveryCauseType> = {
  awareness: 'awareness',
  timing_mismatch: 'awareness',
  process_friction: 'friction',
  policy_constraints: 'policy',
  vendor_access: 'eligibility',
};

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
    summaryMetrics,
    playbooks,
    setShowHighConfidenceOnly,
    openCategoryDrawer,
    closeCategoryDrawer,
    getRecommendedPlaybooks,
  } = useZombieSpendData();
  
  const {
    runs: playbookRuns,
    launchPlaybook,
    updateRunStatus,
  } = usePlaybookRuns();
  
  const [launchModalOpen, setLaunchModalOpen] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState<RecoveryPlaybook | null>(null);
  const [activeTab, setActiveTab] = useState('categories');
  
  // Handle URL params for deep linking
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const cat = allCategories.find(c => c.id === categoryParam || c.name === categoryParam);
      if (cat) {
        openCategoryDrawer(cat.id);
      }
    }
  }, [searchParams, allCategories]);
  
  // Calculate cause breakdown data
  const causeBreakdownData = useMemo((): CauseBreakdownData[] => {
    const causeTotals: Record<RecoveryCauseType, number> = {
      awareness: 0,
      eligibility: 0,
      friction: 0,
      policy: 0,
    };
    
    categories.forEach(cat => {
      const causeType = rootCauseToCauseType[cat.primaryRootCause] || 'policy';
      causeTotals[causeType] += cat.unusedEntitlement;
    });
    
    const total = Object.values(causeTotals).reduce((sum, v) => sum + v, 0);
    
    return [
      { cause: 'awareness', label: 'Awareness', value: causeTotals.awareness, percent: total > 0 ? (causeTotals.awareness / total) * 100 : 0 },
      { cause: 'eligibility', label: 'Eligibility', value: causeTotals.eligibility, percent: total > 0 ? (causeTotals.eligibility / total) * 100 : 0 },
      { cause: 'friction', label: 'Friction', value: causeTotals.friction, percent: total > 0 ? (causeTotals.friction / total) * 100 : 0 },
      { cause: 'policy', label: 'Policy', value: causeTotals.policy, percent: total > 0 ? (causeTotals.policy / total) * 100 : 0 },
    ];
  }, [categories]);
  
  // Determine top cause
  const topCause = useMemo((): RecoveryCauseType => {
    const sorted = [...causeBreakdownData].sort((a, b) => b.value - a.value);
    return sorted[0]?.cause || 'awareness';
  }, [causeBreakdownData]);
  
  // Generate cause-mapped insights
  const insights = useMemo(() => {
    const awarenessCategories = categories
      .filter(c => rootCauseToCauseType[c.primaryRootCause] === 'awareness')
      .map(c => c.name);
    const awarenessUnused = causeBreakdownData.find(d => d.cause === 'awareness')?.value || 0;
    
    return generateRecoverableInsights({
      awarenessUnused,
      awarenessCategories,
      eligibilityRejectRate: 12,
      frictionMissingDocsRate: 22,
      frictionAvgApprovalDays: 4.5,
      policyRejectionCount: 28,
      policyTopCategory: categories.find(c => c.primaryRootCause === 'policy_constraints')?.name || 'Wellbeing',
    });
  }, [categories, causeBreakdownData]);
  
  // Transform playbooks to recovery plays
  const recoveryPlays = useMemo((): RecoveryPlay[] => {
    return playbooks.slice(0, 5).map(pb => {
      const targetCause = rootCauseToCauseType[pb.targetRootCauses[0]] || 'awareness';
      const avgUnused = summaryMetrics.totalUnused / categories.length || 50000;
      const minImpact = avgUnused * (pb.expectedImpactPercent / 100) * 0.7;
      const maxImpact = avgUnused * (pb.expectedImpactPercent / 100) * 1.3;
      
      return {
        id: pb.id,
        name: pb.title,
        description: pb.description,
        targetCause,
        impactRange: { min: minImpact, max: maxImpact },
        timeToImpact: pb.timeToImpact,
        effort: pb.effortLevel,
      };
    });
  }, [playbooks, summaryMetrics, categories]);
  
  const handleOpenPlaybook = (playbook: RecoveryPlaybook) => {
    setSelectedPlaybook(playbook);
    setLaunchModalOpen(true);
  };
  
  const handleLaunchFromDrawer = (playbook: RecoveryPlaybook) => {
    setSelectedPlaybook(playbook);
    closeCategoryDrawer();
    setTimeout(() => setLaunchModalOpen(true), 200);
  };
  
  const handleLaunchComplete = () => {
    setActiveTab('runs');
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
        title="Recoverable Value"
        description="Unrealized benefits value and the fastest levers to recover it"
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
                  <p>Filters to High confidence categories only.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              YTD 2024
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        }
        filters={<EmployerGlobalFiltersBar />}
      >
        {/* 1. Key Insights (4 max, cause-mapped) */}
        <RecoverableValueInsights insights={insights} isDemo={true} />
        
        {/* 2. KPI Grid (exactly 6 cards) */}
        <RecoverableValueKPIGrid
          metrics={{
            unrealizedValue: summaryMetrics.totalUnused,
            unrealizedRate: summaryMetrics.unusedPercent,
            estimatedRecoverable: summaryMetrics.estimatedRecoverable,
            missingDocsRate: 22,
            medianApprovalDays: 4.5,
            topCause,
          }}
          isDemo={true}
          onKPIClick={(kpiId) => toast.info(`Opening ${kpiId} drilldown...`)}
        />
        
        {/* 3. Cause Breakdown Chart */}
        <CauseBreakdownChart 
          data={causeBreakdownData} 
          totalUnrealized={summaryMetrics.totalUnused}
          isDemo={true}
        />
        
        {/* 4. Top Recovery Plays (exactly 5) */}
        <TopRecoveryPlays plays={recoveryPlays} isDemo={true} />
        
        {/* 5. Detailed Breakdown Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
            <TabsTrigger value="runs">
              Active Runs {playbookRuns.length > 0 && `(${playbookRuns.length})`}
            </TabsTrigger>
          </TabsList>
          
          {/* Category Breakdown Tab */}
          <TabsContent value="categories" className="mt-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Unrealized Value by Category
                      <InfoTooltip 
                        formula="Entitled Value - Claimed Amount" 
                        dataSource="benefit_entitlements + requests" 
                      />
                    </CardTitle>
                    <CardDescription>
                      Click "View details" to see root-cause analysis and recovery options
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {categories.length} categories
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Allocated</TableHead>
                        <TableHead className="text-right">Claimed</TableHead>
                        <TableHead className="text-right">Unrealized</TableHead>
                        <TableHead className="text-right">Utilization</TableHead>
                        <TableHead>Root Cause</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((cat) => {
                        const RootCauseIcon = ROOT_CAUSE_DEFINITIONS[cat.primaryRootCause].icon;
                        const isLowConfidence = cat.confidence === 'low';
                        
                        return (
                          <TableRow 
                            key={cat.id} 
                            className={cn(
                              "hover:bg-muted/30 cursor-pointer",
                              showHighConfidenceOnly && isLowConfidence && "opacity-50"
                            )}
                            onClick={() => openCategoryDrawer(cat.id)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{cat.name}</span>
                                <Badge variant="outline" className={cn("text-[10px]", confidenceBadgeStyles[cat.confidence])}>
                                  {cat.confidence}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrencyAED(cat.allocatedBudget, { abbreviate: true })}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrencyAED(cat.claimedAmount, { abbreviate: true })}
                            </TableCell>
                            <TableCell className="text-right font-medium text-warning">
                              {formatCurrencyAED(cat.unusedEntitlement, { abbreviate: true })}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className={cn(
                                  cat.utilizationRate >= 75 ? 'text-success' :
                                  cat.utilizationRate >= 50 ? 'text-foreground' :
                                  'text-warning'
                                )}>
                                  {formatPercent(cat.utilizationRate)}
                                </span>
                                <Progress value={cat.utilizationRate} className="h-1 w-12" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <RootCauseIcon 
                                  className={cn('h-4 w-4', ROOT_CAUSE_DEFINITIONS[cat.primaryRootCause].color)} 
                                />
                                <span className="text-xs text-muted-foreground">
                                  {ROOT_CAUSE_DEFINITIONS[cat.primaryRootCause].label}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCategoryDrawer(cat.id);
                                }}
                                className="gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Active Runs Tab */}
          <TabsContent value="runs" className="mt-6">
            {playbookRuns.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">No Active Recovery Runs</h3>
                  <p className="text-muted-foreground mb-4">
                    Create an action from the Recovery Plays above to start tracking
                  </p>
                  <Button onClick={() => navigate('/employer/recommendations')}>
                    View Action Plan
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recovery Runs</CardTitle>
                  <CardDescription>
                    Track launched recovery initiatives
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead>Play</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead className="text-right">Expected Impact</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {playbookRuns.map((run) => {
                          const playbook = playbooks.find(p => p.id === run.playbookType);
                          const StatusIcon = runStatusConfig[run.status].icon;
                          
                          return (
                            <TableRow key={run.id}>
                              <TableCell className="font-medium">
                                {playbook?.title || run.playbookType}
                              </TableCell>
                              <TableCell>{run.category}</TableCell>
                              <TableCell>{run.owner}</TableCell>
                              <TableCell>{format(new Date(run.dueDate), 'MMM d, yyyy')}</TableCell>
                              <TableCell className="text-right text-success font-medium">
                                {formatCurrencyAED(run.expectedImpactAed)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={runStatusConfig[run.status].color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {runStatusConfig[run.status].label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {run.status === 'draft' && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => updateRunStatus(run.id, 'active')}
                                    >
                                      Start
                                    </Button>
                                  )}
                                  {run.status === 'active' && (
                                    <>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => updateRunStatus(run.id, 'paused')}
                                      >
                                        Pause
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => updateRunStatus(run.id, 'completed')}
                                      >
                                        Complete
                                      </Button>
                                    </>
                                  )}
                                  {run.status === 'paused' && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => updateRunStatus(run.id, 'active')}
                                    >
                                      Resume
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
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
          onLaunchComplete={handleLaunchComplete}
        />
      </PageLayout>
    </PageConfidenceGate>
  );
}
