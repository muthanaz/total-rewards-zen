/**
 * Optimization Opportunities Page (formerly "Zombie Spend")
 * 
 * Executive-grade analytics page following the standardized template:
 * 1. Header + Confidence Badge
 * 2. Key Insights (with deep links)
 * 3. KPI Grid
 * 4. Breakdown Charts + Tables
 * 5. Benefits Action Plan
 * 
 * @module ZombieSpend
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
  Ghost, Target, AlertTriangle, ArrowRight,
  Eye, Play, Clock, CheckCircle2, Pause, CircleDot, Info,
  Download, Calendar, Lightbulb, TrendingUp,
} from 'lucide-react';
import { 
  EmployerGlobalFiltersBar, 
  DataConfidenceBadge, 
  PageConfidenceGate, 
  useDataCoverageMetrics,
  OptimizationKPIGrid,
  OptimizationInsights,
  generateOptimizationInsights,
  BenefitsActionPlanSummary,
  generateSampleActionPlan,
} from '@/components/employer';
import { PageLayout } from '@/components/shared';
import { ZombieCategoryDrawer } from '@/components/employer/ZombieCategoryDrawer';
import { LaunchPlaybookModal } from '@/components/employer/LaunchPlaybookModal';
import { ZombieMetricDefinitions } from '@/components/employer/ZombieMetricDefinitions';
import { useZombieSpendData, ROOT_CAUSE_DEFINITIONS, RecoveryPlaybook, CONFIDENCE_FACTORS } from '@/hooks/useZombieSpendData';
import { usePlaybookRuns, PlaybookRunStatus } from '@/hooks/usePlaybookRuns';
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';
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
  
  // Generate insights
  const insights = useMemo(() => {
    const topCategories = categories.slice(0, 5).map(c => ({
      name: c.name,
      unused: c.unusedEntitlement,
      utilizationRate: c.utilizationRate,
    }));
    
    const rootCauseCounts: Record<string, number> = {};
    categories.forEach(c => {
      const cause = ROOT_CAUSE_DEFINITIONS[c.primaryRootCause]?.label || c.primaryRootCause;
      rootCauseCounts[cause] = (rootCauseCounts[cause] || 0) + 1;
    });
    const primaryRootCauses = Object.entries(rootCauseCounts)
      .map(([cause, count]) => ({ cause, count }))
      .sort((a, b) => b.count - a.count);
    
    return generateOptimizationInsights({
      topCategories,
      primaryRootCauses,
      lowUtilizationSegments: [{ name: 'New Joiners', dimension: 'Tenure', utilization: 42 }],
      processMetrics: { missingDocsRate: 22, avgApprovalDays: 4.5 },
      yoyChange: -5,
    });
  }, [categories]);
  
  // Generate action plan items
  const actionPlanItems = useMemo(() => {
    const topCategory = categories[0];
    if (!topCategory) return [];
    
    return generateSampleActionPlan({
      topCategory: { name: topCategory.name, unused: topCategory.unusedEntitlement },
      processFriction: { missingDocsRate: 22, pendingCount: 18 },
      lowSegment: { name: 'New Joiners', dimension: 'Tenure' },
    });
  }, [categories]);
  
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
        title="Optimization Opportunities"
        description="Unrealized value ('zombie spend') and actionable next steps to recover it"
        icon={Lightbulb}
        iconClassName="bg-warning/10 text-warning"
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
        {/* 1. Key Insights */}
        <OptimizationInsights insights={insights} isDemo={true} />
        
        {/* 2. KPI Grid */}
        <OptimizationKPIGrid
          metrics={{
            unrealizedValue: summaryMetrics.totalUnused,
            unrealizedRate: summaryMetrics.unusedPercent,
            estimatedRecoverable: summaryMetrics.estimatedRecoverable,
            topCategories: summaryMetrics.topCategories,
            missingDocsRate: 22,
            medianApprovalDays: 4.5,
            confidenceLevel: 'medium',
          }}
          isDemo={true}
          onKPIClick={(kpiId) => toast.info(`Opening ${kpiId} drilldown...`)}
        />
        
        {/* 3. Metric Definitions (collapsible) */}
        <ZombieMetricDefinitions />
        
        {/* 4. Breakdown Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
            <TabsTrigger value="playbooks">Recovery Playbooks</TabsTrigger>
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
                        <TableHead className="text-right">Entitled</TableHead>
                        <TableHead className="text-right">Claimed</TableHead>
                        <TableHead className="text-right">Unrealized</TableHead>
                        <TableHead className="text-right">Utilization</TableHead>
                        <TableHead>Confidence</TableHead>
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
                                <RootCauseIcon 
                                  className={cn('h-4 w-4', ROOT_CAUSE_DEFINITIONS[cat.primaryRootCause].color)} 
                                />
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrencyAED(cat.allocatedBudget, { abbreviate: true })}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrencyAED(cat.entitledValue, { abbreviate: true })}
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
                              <Badge variant="outline" className={confidenceBadgeStyles[cat.confidence]}>
                                {cat.confidence}
                              </Badge>
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
                                View details
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
          
          {/* Recovery Playbooks Tab */}
          <TabsContent value="playbooks" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playbooks.map((playbook) => {
                const PlaybookIcon = playbook.icon;
                const avgRecovery = categories.reduce((sum, c) => 
                  sum + c.unusedEntitlement * (playbook.expectedImpactPercent / 100), 0
                ) / categories.length;
                
                return (
                  <Card key={playbook.id} className="hover:border-accent/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-accent/10">
                            <PlaybookIcon className="h-5 w-5 text-accent" />
                          </div>
                          <CardTitle className="text-sm">{playbook.title}</CardTitle>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'capitalize',
                            playbook.effortLevel === 'low' ? 'border-success/50 text-success' :
                            playbook.effortLevel === 'medium' ? 'border-warning/50 text-warning' :
                            'border-destructive/50 text-destructive'
                          )}
                        >
                          {playbook.effortLevel} effort
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{playbook.description}</p>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-2 rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground">Expected Impact</p>
                          <p className="font-bold text-success">
                            {formatCurrencyAED(avgRecovery, { abbreviate: true })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            +{playbook.expectedImpactPercent}% recovery
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground">Time to Impact</p>
                          <p className="font-medium">{playbook.timeToImpact}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Outputs:</p>
                        <div className="flex flex-wrap gap-1">
                          {playbook.outputs.slice(0, 3).map((output, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {output}
                            </Badge>
                          ))}
                          {playbook.outputs.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{playbook.outputs.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full gap-2" 
                        onClick={() => handleOpenPlaybook(playbook)}
                      >
                        <Play className="h-4 w-4" />
                        Launch
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          {/* Active Runs Tab */}
          <TabsContent value="runs" className="mt-6">
            {playbookRuns.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">No Active Playbook Runs</h3>
                  <p className="text-muted-foreground mb-4">
                    Launch a recovery playbook to start tracking progress
                  </p>
                  <Button onClick={() => setActiveTab('playbooks')}>
                    View Playbooks
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Playbook Runs</CardTitle>
                  <CardDescription>
                    Track launched recovery initiatives
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead>Playbook</TableHead>
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
        
        {/* 5. Benefits Action Plan */}
        <BenefitsActionPlanSummary
          actions={actionPlanItems}
          onCreateAction={() => navigate('/employer/recommendations?create=true')}
          onUpdateStatus={(actionId, newStatus) => {
            toast.info(`Demo: Action ${actionId} marked as ${newStatus}`);
          }}
          onSendToHROps={(action) => {
            toast.info(`Demo: Sent "${action.title}" to HR Ops queue`);
          }}
        />
        
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
