/**
 * Zombie Category Drawer
 * 
 * Detailed insight drawer for a zombie spend category showing:
 * - Summary metrics
 * - Who is affected breakdown
 * - Trend chart
 * - Root cause checklist
 * - Evidence panel
 * - Action links
 */

import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Ghost, ArrowRight, TrendingDown, Users, Building2, Briefcase, Heart,
  FileWarning, Clock, XCircle, RotateCcw, AlertTriangle, Lightbulb, 
  BarChart3, FileText, Target, ExternalLink
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';
import { ZombieCategory, RootCauseId, ROOT_CAUSE_DEFINITIONS, RecoveryPlaybook } from '@/hooks/useZombieSpendData';

interface ZombieCategoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ZombieCategory | null;
  recommendedPlaybooks: RecoveryPlaybook[];
  onLaunchPlaybook: (playbook: RecoveryPlaybook) => void;
}

const confidenceBadgeStyles = {
  high: 'bg-success/10 text-success border-success/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low: 'bg-destructive/10 text-destructive border-destructive/30',
};

export function ZombieCategoryDrawer({ 
  open, 
  onOpenChange, 
  category,
  recommendedPlaybooks,
  onLaunchPlaybook,
}: ZombieCategoryDrawerProps) {
  const navigate = useNavigate();
  
  if (!category) return null;
  
  const primaryCause = ROOT_CAUSE_DEFINITIONS[category.primaryRootCause];
  const PrimaryCauseIcon = primaryCause.icon;
  
  // Calculate evidence scores
  const isHighMissingDocs = category.missingDocsRate > 20;
  const isLongProcessing = category.avgProcessingDays > 5;
  const isHighRejection = (category.rejectedCount / category.eligibleHeadcount) > 0.15;
  
  // Navigation handlers
  const handleViewClaimsFriction = () => {
    navigate(`/employer/claims?view=ops&filter_category=${category.name}&filter_status=pending,missing_docs&filter_sla=at_risk`);
    onOpenChange(false);
  };
  
  const handleViewSpendAnalytics = () => {
    navigate(`/employer/spend?filter_category=${category.name}`);
    onOpenChange(false);
  };
  
  const handleCreateRecommendation = () => {
    navigate(`/employer/recommendations?create=true&prefill_category=${category.name}&prefill_rootcause=${category.primaryRootCause}`);
    onOpenChange(false);
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Ghost className="h-5 w-5 text-amber-500" />
            <SheetTitle>{category.name}</SheetTitle>
            <Badge variant="outline" className={confidenceBadgeStyles[category.confidence]}>
              {category.confidence} confidence
            </Badge>
          </div>
          <SheetDescription>
            Unused entitlement analysis and recovery options
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Low confidence warning */}
          {category.confidence === 'low' && (
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="py-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Low confidence — insights may be incomplete</p>
                    <p className="text-xs text-muted-foreground">Improve data sources to get accurate recovery estimates</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigate('/employer/integrations?view=exec');
                      onOpenChange(false);
                    }}
                  >
                    Improve data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Summary Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Unused Entitlement</p>
                <p className="text-xl font-bold text-amber-600">
                  {formatCurrencyAED(category.unusedEntitlement)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Utilization</p>
                <div className="flex items-center gap-2">
                  <p className={cn(
                    'text-xl font-bold',
                    category.utilizationRate >= 75 ? 'text-success' :
                    category.utilizationRate >= 50 ? 'text-foreground' :
                    'text-warning'
                  )}>
                    {formatPercent(category.utilizationRate)}
                  </p>
                </div>
                <Progress value={category.utilizationRate} className="h-1 mt-2" />
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Eligible Headcount</p>
                <p className="text-xl font-bold">{formatInteger(category.eligibleHeadcount)}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Who Is Affected */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Who Is Affected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Top Departments */}
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Building2 className="h-3 w-3" />
                    Top Departments
                  </div>
                  <div className="space-y-1">
                    {category.topDepartments.map((dept, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span>{dept.name}</span>
                        <span className="text-amber-600 font-medium">
                          {formatCurrencyAED(dept.unused, { abbreviate: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Top Grades */}
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Briefcase className="h-3 w-3" />
                    Top Grades
                  </div>
                  <div className="space-y-1">
                    {category.topGrades.map((grade, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span>{grade.name}</span>
                        <span className="text-amber-600 font-medium">
                          {formatCurrencyAED(grade.unused, { abbreviate: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Life Stage */}
                {category.lifeStageBreakdown && (
                  <div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <Heart className="h-3 w-3" />
                      Life Stage
                    </div>
                    <div className="space-y-1">
                      {category.lifeStageBreakdown.map((stage, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span>{stage.name}</span>
                          <span className="text-amber-600 font-medium">
                            {formatCurrencyAED(stage.unused, { abbreviate: true })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Trend Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                Unused Entitlement Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={category.trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="unusedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(38 92% 50%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis hide />
                    <Tooltip 
                      formatter={(value: number) => formatCurrencyAED(value)}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="unused" 
                      stroke="hsl(38 92% 50%)" 
                      fill="url(#unusedGradient)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Separator />
          
          {/* Root Cause Checklist */}
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-4">
              <Lightbulb className="h-4 w-4 text-accent" />
              Root Cause Analysis
            </h4>
            <div className="space-y-2">
              {Object.values(ROOT_CAUSE_DEFINITIONS).map((cause) => {
                const isDetected = cause.id === category.primaryRootCause || 
                  category.secondaryRootCauses.includes(cause.id);
                const CauseIcon = cause.icon;
                
                return (
                  <div 
                    key={cause.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                      isDetected ? 'bg-accent/5 border-accent/30' : 'bg-muted/30 border-transparent'
                    )}
                  >
                    <Checkbox checked={isDetected} className="mt-0.5" />
                    <CauseIcon className={cn('h-4 w-4 mt-0.5', cause.color)} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{cause.label}</p>
                        {cause.id === category.primaryRootCause && (
                          <Badge variant="secondary" className="text-xs">Primary</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{cause.description}</p>
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Detection: {cause.detectionRule}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <Separator />
          
          {/* Evidence Panel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Evidence Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={cn(
                  'p-3 rounded-lg border',
                  isHighMissingDocs ? 'bg-destructive/5 border-destructive/30' : 'bg-muted/30'
                )}>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <FileWarning className="h-3 w-3" />
                    Missing Docs Rate
                  </div>
                  <p className={cn(
                    'font-bold',
                    isHighMissingDocs ? 'text-destructive' : 'text-foreground'
                  )}>
                    {formatPercent(category.missingDocsRate)}
                  </p>
                  {isHighMissingDocs && (
                    <p className="text-xs text-destructive">Above 20% threshold</p>
                  )}
                </div>
                
                <div className={cn(
                  'p-3 rounded-lg border',
                  isLongProcessing ? 'bg-destructive/5 border-destructive/30' : 'bg-muted/30'
                )}>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Clock className="h-3 w-3" />
                    Avg Processing
                  </div>
                  <p className={cn(
                    'font-bold',
                    isLongProcessing ? 'text-destructive' : 'text-foreground'
                  )}>
                    {category.avgProcessingDays.toFixed(1)} days
                  </p>
                  {isLongProcessing && (
                    <p className="text-xs text-destructive">Above 5-day SLA</p>
                  )}
                </div>
                
                <div className={cn(
                  'p-3 rounded-lg border',
                  isHighRejection ? 'bg-destructive/5 border-destructive/30' : 'bg-muted/30'
                )}>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <XCircle className="h-3 w-3" />
                    Rejected
                  </div>
                  <p className={cn(
                    'font-bold',
                    isHighRejection ? 'text-destructive' : 'text-foreground'
                  )}>
                    {formatInteger(category.rejectedCount)}
                  </p>
                </div>
                
                <div className="p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <RotateCcw className="h-3 w-3" />
                    Returned for Info
                  </div>
                  <p className="font-bold">{formatInteger(category.returnedCount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Separator />
          
          {/* Recommended Playbooks */}
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-4">
              <Target className="h-4 w-4 text-accent" />
              Recommended Playbooks
            </h4>
            <div className="space-y-2">
              {recommendedPlaybooks.map((playbook) => {
                const PlaybookIcon = playbook.icon;
                const expectedImpact = category.unusedEntitlement * (playbook.expectedImpactPercent / 100);
                
                return (
                  <div 
                    key={playbook.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:border-accent/50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-accent/10">
                      <PlaybookIcon className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{playbook.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="text-success">
                          +{formatCurrencyAED(expectedImpact, { abbreviate: true })} recovery
                        </span>
                        <span>•</span>
                        <span className="capitalize">{playbook.effortLevel} effort</span>
                        <span>•</span>
                        <span>{playbook.timeToImpact}</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => onLaunchPlaybook(playbook)}
                      className="shrink-0"
                    >
                      Launch
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
          
          <Separator />
          
          {/* Quick Links */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleViewClaimsFriction} className="gap-2">
              <FileWarning className="h-4 w-4" />
              View claims friction
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleViewSpendAnalytics} className="gap-2">
              <BarChart3 className="h-4 w-4" />
              View spend analytics
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleCreateRecommendation} className="gap-2">
              <FileText className="h-4 w-4" />
              Create recommendation
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
