/**
 * Zombie Spend Page (Recovery Workspace)
 * 
 * Action-oriented recovery workspace with:
 * - Metric definitions strip
 * - Category breakdown table with drilldowns
 * - Root cause analysis
 * - 5 recovery playbooks with real tracking
 * - Cross-page linking to Claims, Spend, Recommendations
 */

import { useState, useEffect } from 'react';
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
  Ghost, TrendingDown, Target, DollarSign, AlertTriangle, ArrowRight,
  Eye, Play, Clock, CheckCircle2, XCircle, Pause, CircleDot, Info
} from 'lucide-react';
import { 
  EmployerGlobalFiltersBar, 
  DataConfidenceBadge, 
  PageConfidenceGate, 
  useDataCoverageMetrics,
  NarrativeInsights
} from '@/components/employer';
import { ZombieCategoryDrawer } from '@/components/employer/ZombieCategoryDrawer';
import { LaunchPlaybookModal } from '@/components/employer/LaunchPlaybookModal';
import { ZombieMetricDefinitions } from '@/components/employer/ZombieMetricDefinitions';
import { useZombieSpendData, ROOT_CAUSE_DEFINITIONS, RecoveryPlaybook, PlaybookStatus, CONFIDENCE_FACTORS } from '@/hooks/useZombieSpendData';
import { usePlaybookRuns, PlaybookRunStatus } from '@/hooks/usePlaybookRuns';
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

// ============= CONFIDENCE BADGE STYLES =============

const confidenceBadgeStyles = {
  high: 'bg-success/10 text-success border-success/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low: 'bg-destructive/10 text-destructive border-destructive/30',
};

const runStatusConfig: Record<PlaybookRunStatus, { label: string; icon: typeof CircleDot; color: string }> = {
  draft: { label: 'Draft', icon: CircleDot, color: 'text-muted-foreground' },
  active: { label: 'Active', icon: Play, color: 'text-blue-500' },
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
    rootCauseDefinitions,
    setShowHighConfidenceOnly,
    openCategoryDrawer,
    closeCategoryDrawer,
    getRecommendedPlaybooks,
  } = useZombieSpendData();
  
  // Use real playbook runs hook
  const {
    runs: playbookRuns,
    isLoading: runsLoading,
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
  
  // Narrative insights
  const narrativeInsights = [
    {
      id: 'top-zombie',
      change: `${categories[0]?.name || 'L&D'} has the highest unused entitlement`,
      metricValue: formatCurrencyAED(categories[0]?.unusedEntitlement || 0),
      impact: `${formatInteger(categories[0]?.eligibleHeadcount || 0)} employees eligible. Primary cause: ${ROOT_CAUSE_DEFINITIONS[categories[0]?.primaryRootCause || 'awareness'].label}.`,
      action: 'Launch awareness campaign for this category',
      actionPath: `/employer/zombie?category=${categories[0]?.id}`,
      trend: 'down' as const,
      trendIsPositive: false,
      confidence: 'high' as const,
    },
    {
      id: 'recovery-potential',
      change: 'Estimated recoverable value based on confidence',
      metricValue: formatCurrencyAED(summaryMetrics.estimatedRecoverable),
      impact: `Recovery potential is weighted by data confidence. High confidence = 100%, Medium = 70%, Low = 40%.`,
      action: 'Prioritize high-confidence categories first',
      trend: 'up' as const,
      trendIsPositive: true,
      confidence: 'medium' as const,
    },
    {
      id: 'process-friction',
      change: 'Process friction detected in multiple categories',
      impact: 'High missing docs rates and long processing times are causing drop-offs in claims submission.',
      action: 'Review documentation requirements and SLA targets',
      actionPath: '/employer/claims?view=ops&filter_status=missing_docs',
      trend: 'down' as const,
      trendIsPositive: false,
      confidence: 'high' as const,
    },
  ];
  
  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Ghost className="h-8 w-8 text-amber-500" />
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Zombie Spend</h1>
              <p className="text-muted-foreground">
                Identify unused budget and convert it into employee value or cost savings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch 
                id="high-confidence" 
                checked={showHighConfidenceOnly}
                onCheckedChange={setShowHighConfidenceOnly}
              />
              <Label htmlFor="high-confidence" className="text-sm">
                Show only high-confidence data
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filters to High confidence categories only.</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Medium and Low confidence categories will be hidden.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <DataConfidenceBadge metrics={coverageMetrics} />
          </div>
        </div>
        
        {/* Global Filters */}
        <EmployerGlobalFiltersBar />
        
        {/* Metric Definitions Strip */}
        <ZombieMetricDefinitions />
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-elevated border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10">
                  <Ghost className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">
                    {formatCurrencyAED(summaryMetrics.totalUnused)}
                  </p>
                  <p className="text-sm text-muted-foreground">Unused Entitlement</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-warning/10">
                  <TrendingDown className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{formatPercent(summaryMetrics.unusedPercent)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">% Budget Unused</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Top 3 Categories</p>
                <div className="flex flex-wrap gap-1">
                  {summaryMetrics.topCategories.map((cat, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-elevated border-l-4 border-l-success">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-success/10">
                  <Target className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">
                    {formatCurrencyAED(summaryMetrics.estimatedRecoverable)}
                  </p>
                  <p className="text-sm text-muted-foreground">Estimated Recoverable</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Weighted by data confidence (High 100%, Medium 70%, Low 40%)
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Narrative Insights */}
        <NarrativeInsights
          insights={narrativeInsights}
          coverageMetrics={coverageMetrics}
          title="Recovery Insights"
          subtitle="AI-identified opportunities to recapture benefit value"
          onCreateRecommendation={(insight) => {
            navigate(`/employer/recommendations?create=true&source=${insight.id}`);
          }}
        />
        
        {/* Tabs */}
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
                      Unused Entitlement by Category
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
                        <TableHead className="text-right">Unused</TableHead>
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
                            <TableCell className="text-right font-medium text-amber-600">
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
        
        {/* Category Drawer */}
        <ZombieCategoryDrawer
          open={drawerOpen}
          onOpenChange={closeCategoryDrawer}
          category={selectedCategory}
          recommendedPlaybooks={selectedCategory ? getRecommendedPlaybooks(selectedCategory) : []}
          onLaunchPlaybook={handleLaunchFromDrawer}
        />
        
        {/* Launch Playbook Modal */}
        <LaunchPlaybookModal
          open={launchModalOpen}
          onOpenChange={setLaunchModalOpen}
          playbook={selectedPlaybook}
          category={selectedCategory}
          allCategories={allCategories}
          onLaunch={handleLaunch}
          onLaunchComplete={handleLaunchComplete}
        />
      </div>
    </PageConfidenceGate>
  );
}
