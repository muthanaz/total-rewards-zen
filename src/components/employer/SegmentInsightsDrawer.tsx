/**
 * Segment Insights Drawer (Enhanced)
 * 
 * Production-grade drawer showing detailed insights for a segment value with:
 * - Driver cards with evidence
 * - Category contribution charts
 * - Recommended playbooks with launch buttons
 * - Export functionality
 */

import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { 
  Lightbulb, ArrowRight, Target, Ghost, Megaphone, 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  BarChart3, Download, Users, FileText, Play
} from 'lucide-react';
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';
import { SegmentValueInsights, SpendByCategory, UtilizationByCategory, ConfidenceLevel, CONFIDENCE_FACTORS, RootCauseDriver } from '@/hooks/useSegmentData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'sonner';

interface SegmentInsightsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insights: SegmentValueInsights | null;
  chartData: { spendByCategory: SpendByCategory[]; utilizationByCategory: UtilizationByCategory[] } | null;
  dimensionName: string;
}

const confidenceBadgeStyles: Record<ConfidenceLevel, string> = {
  high: 'bg-success/10 text-success border-success/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low: 'bg-destructive/10 text-destructive border-destructive/30',
};

const COLORS = {
  accent: 'hsl(var(--accent))',
  warning: 'hsl(38 92% 50%)',
  success: 'hsl(var(--success))',
};

const PLAYBOOK_OPTIONS = [
  { id: 'awareness_campaign', name: 'Awareness Campaign', icon: Megaphone, description: 'Target segments with low awareness' },
  { id: 'friction_fix', name: 'Friction Fix', icon: Ghost, description: 'Reduce docs & SLA friction' },
  { id: 'policy_simplification', name: 'Policy Simplification', icon: FileText, description: 'Clarify confusing policies' },
  { id: 'vendor_enablement', name: 'Vendor Enablement', icon: Users, description: 'Expand provider network' },
];

export function SegmentInsightsDrawer({ 
  open, 
  onOpenChange, 
  insights, 
  chartData,
  dimensionName 
}: SegmentInsightsDrawerProps) {
  const navigate = useNavigate();
  
  if (!insights) return null;
  
  const { segmentValue, insights: insightsList, drivers, categoryBreakdown, suggestedActions, impactedSegments } = insights;
  
  const utilizationColor = segmentValue.utilizationRate >= 80 ? 'text-success' :
    segmentValue.utilizationRate >= 60 ? 'text-foreground' : 'text-warning';
  
  const handleLaunchPlaybook = (playbookId: string) => {
    navigate(`/employer/zombie?tab=playbooks&prefill_playbook=${playbookId}&prefill_segment=${segmentValue.id}`);
    onOpenChange(false);
    toast.success('Opening Recovery Playbooks', {
      description: `Pre-filtered for ${segmentValue.name}`,
    });
  };
  
  const handleCreateRecommendation = () => {
    navigate(`/employer/recommendations?prefill_segment=${segmentValue.id}&prefill_rationale=${encodeURIComponent(`Address low utilization in ${segmentValue.name} segment`)}`);
    onOpenChange(false);
    toast.success('Creating Recommendation');
  };
  
  const handleExportEmployees = () => {
    // Demo export
    const csvContent = `Employee ID,Name,Department,Grade,Utilization %\nEMP001,Demo Employee 1,Engineering,M2,${segmentValue.utilizationRate}%\nEMP002,Demo Employee 2,Operations,M3,${segmentValue.utilizationRate - 5}%\nEMP003,Demo Employee 3,Sales,M2,${segmentValue.utilizationRate + 3}%`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${segmentValue.name.replace(/\s+/g, '_')}_employees.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Exported employee list (demo data)');
  };
  
  const handleViewClaims = () => {
    navigate(`/employer/claims?filter_segment=${segmentValue.id}&filter_status=pending`);
    onOpenChange(false);
  };
  
  const handleViewSpend = () => {
    navigate(`/employer/spend?filter_segment=${segmentValue.id}`);
    onOpenChange(false);
  };
  
  // Top unused categories for chart
  const topUnusedCategories = categoryBreakdown.slice(0, 5);
  const topClaimsCostCategories = [...categoryBreakdown].sort((a, b) => b.claimsCost - a.claimsCost).slice(0, 5);
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent" />
            {segmentValue.name}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            {dimensionName} • {formatInteger(segmentValue.headcount)} employees
            <Badge 
              variant="outline" 
              className={cn('capitalize ml-2', confidenceBadgeStyles[segmentValue.confidence])}
            >
              {segmentValue.confidence} confidence
            </Badge>
          </SheetDescription>
        </SheetHeader>
        
        <Tabs defaultValue="summary" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>
          
          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4 mt-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-muted/30">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground">Utilization</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={cn('text-xl font-bold', utilizationColor)}>
                      {formatPercent(segmentValue.utilizationRate)}
                    </p>
                    {segmentValue.utilizationRate >= 80 ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : segmentValue.utilizationRate < 60 ? (
                      <TrendingDown className="h-4 w-4 text-warning" />
                    ) : null}
                  </div>
                  <Progress value={segmentValue.utilizationRate} className="h-1 mt-2" />
                </CardContent>
              </Card>
              
              <Card className="bg-muted/30">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground">Unused Entitlement</p>
                  <p className="text-xl font-bold text-amber-600 mt-1">
                    {formatCurrencyAED(segmentValue.unusedEntitlement)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Recoverable: {formatCurrencyAED(segmentValue.unusedEntitlement * CONFIDENCE_FACTORS[segmentValue.confidence])}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/30">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground">Claims Cost</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xl font-bold">
                      {formatCurrencyAED(segmentValue.claimsCost)}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={cn('text-xs', segmentValue.claimsCostDelta > 10 ? 'text-destructive' : 'text-success')}
                    >
                      {segmentValue.claimsCostDelta > 0 ? '+' : ''}{segmentValue.claimsCostDelta}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/30">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground">Retention Risk</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="outline"
                      className={cn('capitalize', 
                        segmentValue.retentionRisk === 'high' ? 'bg-destructive/10 text-destructive border-destructive/30' :
                        segmentValue.retentionRisk === 'medium' ? 'bg-warning/10 text-warning border-warning/30' :
                        'bg-success/10 text-success border-success/30'
                      )}
                    >
                      {segmentValue.retentionRisk}
                    </Badge>
                    {segmentValue.satisfactionScore && (
                      <span className="text-sm text-muted-foreground">
                        {segmentValue.satisfactionScore.toFixed(1)}/5 satisfaction
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/30">
              <div className="text-center">
                <p className="text-lg font-bold">{segmentValue.slaRiskCount}</p>
                <p className="text-xs text-muted-foreground">SLA Risk</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{segmentValue.missingDocsCount}</p>
                <p className="text-xs text-muted-foreground">Missing Docs</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{segmentValue.overLimitCount}</p>
                <p className="text-xs text-muted-foreground">Over Limit</p>
              </div>
            </div>
            
            {/* Key Insights */}
            <div>
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-accent" />
                Key Insights
              </h4>
              <div className="space-y-2">
                {insightsList.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-medium text-sm">{insight.title}</span>
                      <Badge variant="secondary" className="text-xs shrink-0">{insight.metric}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Drivers Tab */}
          <TabsContent value="drivers" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Root-cause analysis based on utilization patterns and friction signals.
            </p>
            
            <div className="space-y-3">
              {drivers.map((driver) => (
                <Card key={driver.id} className="border-l-4 border-l-accent">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-medium">{driver.name}</h5>
                        <p className="text-xs text-muted-foreground mt-1">{driver.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-accent">{driver.percentage}%</span>
                        <p className="text-xs text-muted-foreground">contribution</p>
                      </div>
                    </div>
                    <Progress value={driver.percentage} className="h-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Impacted Segments */}
            <Separator />
            <div>
              <h4 className="font-medium text-sm mb-3">Who is affected?</h4>
              <div className="grid grid-cols-1 gap-3">
                {impactedSegments.map((seg) => (
                  <div key={seg.dimension} className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-2">{seg.dimension}</p>
                    <div className="space-y-1">
                      {seg.values.map((val) => (
                        <div key={val.name} className="flex items-center gap-2">
                          <Progress value={val.percentage} className="h-1.5 flex-1" />
                          <span className="text-xs font-medium w-20">{val.name}</span>
                          <span className="text-xs text-muted-foreground w-8">{val.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Unused by Category */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    Unused by Category
                    <InfoTooltip formula="Top 5 categories by unused entitlement" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topUnusedCategories} layout="vertical" margin={{ left: 0, right: 10 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="category" width={70} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip 
                          formatter={(value: number) => formatCurrencyAED(value)}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Bar dataKey="unusedEntitlement" name="Unused" fill={COLORS.warning} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Claims Cost by Category */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    Claims Cost by Category
                    <InfoTooltip formula="Top 5 categories by claims cost" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topClaimsCostCategories} layout="vertical" margin={{ left: 0, right: 10 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="category" width={70} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip 
                          formatter={(value: number) => formatCurrencyAED(value)}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Bar dataKey="claimsCost" name="Cost" fill={COLORS.accent} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Full Category Table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">All Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categoryBreakdown.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="text-sm font-medium">{cat.category}</span>
                      <div className="flex items-center gap-4 text-xs">
                        <span>
                          <span className="text-muted-foreground">Unused:</span>{' '}
                          <span className="text-amber-600 font-medium">{formatCurrencyAED(cat.unusedEntitlement, { abbreviate: true })}</span>
                        </span>
                        <span>
                          <span className="text-muted-foreground">Cost:</span>{' '}
                          <span className="font-medium">{formatCurrencyAED(cat.claimsCost, { abbreviate: true })}</span>
                        </span>
                        <span className="w-12 text-right">{formatPercent(cat.utilizationRate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4 mt-4">
            {/* Recommended Playbooks */}
            <div>
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Play className="h-4 w-4 text-accent" />
                Recommended Playbooks
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {PLAYBOOK_OPTIONS.map((playbook) => {
                  const Icon = playbook.icon;
                  return (
                    <Button
                      key={playbook.id}
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-start gap-1"
                      onClick={() => handleLaunchPlaybook(playbook.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-accent" />
                        <span className="font-medium text-sm">{playbook.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground text-left">{playbook.description}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
            
            <Separator />
            
            {/* Quick Actions */}
            <div className="space-y-2">
              <Button className="w-full justify-start gap-2" onClick={handleCreateRecommendation}>
                <Target className="h-4 w-4" />
                Create Recommendation
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
              
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleViewClaims}>
                <Ghost className="h-4 w-4" />
                View Claims Friction
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
              
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleViewSpend}>
                <BarChart3 className="h-4 w-4" />
                View Spend Analytics
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
              
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleExportEmployees}>
                <Download className="h-4 w-4" />
                Export Impacted Employees
                <Badge variant="secondary" className="ml-auto text-xs">Demo</Badge>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
