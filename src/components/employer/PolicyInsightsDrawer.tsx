/**
 * Policy Insights Drawer
 * 
 * Shows Policy Clarity Score and Confusion Hotspots in a drawer.
 * Content previously found on the Policy Insights page.
 */

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Lightbulb,
  MessageSquare,
  Target,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { PolicyHotspotDrawer, type ConfusingArea } from '@/components/employer';
import { toast } from 'sonner';

interface PolicyInsightsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Clarity data
const clarityData = {
  overallScore: 68,
  target: 85,
  confidence: 'estimated' as const,
  dataCompleteness: 79,
  drivers: [
    { 
      label: 'Question Volume', 
      value: 42, 
      target: 20, 
      trend: 'up' as const, 
      trendValue: 15, 
      unit: '/month', 
      isGoodUp: false 
    },
    { 
      label: 'Resolution Time', 
      value: 2.3, 
      target: 1.0, 
      trend: 'down' as const, 
      trendValue: 8, 
      unit: ' days', 
      isGoodUp: false 
    },
    { 
      label: 'Rejection Rate', 
      value: 12, 
      target: 5, 
      trend: 'up' as const, 
      trendValue: 3, 
      unit: '%', 
      isGoodUp: false 
    },
    { 
      label: 'Missing Docs', 
      value: 28, 
      target: 10, 
      trend: 'stable' as const, 
      trendValue: 0, 
      unit: '%', 
      isGoodUp: false 
    },
  ],
};

// Confusion hotspots
const confusingAreas: ConfusingArea[] = [
  {
    id: '1',
    policyName: 'Learning & Development Policy',
    policyId: 'ld-policy-001',
    policyVersion: 2,
    clause: 'Section 3.2: Eligible Course Providers',
    clarityScore: 45,
    questionCount: 32,
    dropOffRate: 67,
    whatUsersAsk: ['Is Coursera/Udemy covered?', 'Can I use L&D budget for conferences?'],
    whereTheyDropOff: 'Policy page → Claim form → Provider selection (67% abandon)',
    recommendedFix: 'Add explicit approved provider list with examples',
    severity: 'critical',
    confidence: 'estimated',
    dataSources: ['HR Tickets', 'Claim Analytics', 'Survey Data'],
    rootCauses: [
      { cause: 'Ambiguous provider list', evidence: '32 questions about Coursera/Udemy eligibility', impact: 'Employees avoid claiming, reducing utilization by ~20%' },
    ],
    suggestedFixes: [
      { fix: 'Add Coursera/Udemy to approved provider list', effort: 'low', timeToImplement: '1 hour', expectedImpact: { questionsReduction: 40, rejectionsReduction: 15 } },
    ],
    impactEstimates: { questionsPerMonth: 32, estimatedRejections: 8, estimatedCost: 45000, confidence: 'estimated' },
  },
  {
    id: '2',
    policyName: 'Health Insurance Policy',
    policyId: 'health-policy-001',
    policyVersion: 3,
    clause: 'Section 5.1: Pre-Authorization Requirements',
    clarityScore: 58,
    questionCount: 18,
    dropOffRate: 45,
    whatUsersAsk: ['Which treatments need pre-approval?', 'How long does pre-approval take?'],
    whereTheyDropOff: 'Pre-auth check → Form submission (45% submit without pre-auth)',
    recommendedFix: 'Add pre-auth checker widget',
    severity: 'high',
    confidence: 'measured',
    dataSources: ['Claims Portal', 'Insurance API', 'HR Tickets'],
    rootCauses: [
      { cause: 'No treatment list', evidence: '18 questions about which procedures need pre-auth', impact: '45% submit claims without pre-auth, causing rejections' },
    ],
    suggestedFixes: [
      { fix: 'Add pre-auth flowchart to policy page', effort: 'low', timeToImplement: '2 hours', expectedImpact: { questionsReduction: 50, rejectionsReduction: 30 } },
    ],
    impactEstimates: { questionsPerMonth: 18, estimatedRejections: 12, estimatedCost: 35000, confidence: 'measured' },
  },
  {
    id: '3',
    policyName: 'Transport Allowance Policy',
    policyId: 'transport-policy-001',
    policyVersion: 1,
    clause: 'Section 2.4: Mileage vs Allowance Eligibility',
    clarityScore: 72,
    questionCount: 8,
    dropOffRate: 23,
    whatUsersAsk: ['When should I claim mileage vs allowance?', 'Can I claim both?'],
    whereTheyDropOff: 'Claim type selection (23% select wrong type)',
    recommendedFix: 'Add decision tree for claim type',
    severity: 'medium',
    confidence: 'proxy',
    dataSources: ['HR Tickets'],
    rootCauses: [
      { cause: 'Overlapping eligibility rules', evidence: '8 questions about mileage vs allowance choice', impact: 'Wrong claim type leads to rework' },
    ],
    suggestedFixes: [
      { fix: 'Add decision tree wizard', effort: 'medium', timeToImplement: '3 days', expectedImpact: { questionsReduction: 60, rejectionsReduction: 20 } },
    ],
    impactEstimates: { questionsPerMonth: 8, estimatedRejections: 3, estimatedCost: 12000, confidence: 'proxy' },
  },
];

export function PolicyInsightsDrawer({ open, onOpenChange }: PolicyInsightsDrawerProps) {
  const [selectedHotspot, setSelectedHotspot] = useState<ConfusingArea | null>(null);
  const [hotspotDrawerOpen, setHotspotDrawerOpen] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Critical</Badge>;
      case 'high':
        return <Badge className="bg-warning/10 text-warning border-warning/20">High</Badge>;
      case 'medium':
        return <Badge className="bg-info/10 text-info border-info/20">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const handleCreateAction = (hotspot: ConfusingArea, fix: ConfusingArea['suggestedFixes'][0]) => {
    toast.success('Action created', {
      description: `Created action: "${fix.fix}" for ${hotspot.policyName}`,
    });
    setHotspotDrawerOpen(false);
  };

  const handleViewPolicy = (policyId: string, clause: string) => {
    toast.info('View policy', {
      description: `Opening policy ${policyId} at ${clause}`,
    });
  };

  const totalQuestions = confusingAreas.reduce((sum, area) => sum + area.questionCount, 0);
  const totalCost = confusingAreas.reduce((sum, area) => sum + area.impactEstimates.estimatedCost, 0);
  const criticalCount = confusingAreas.filter(a => a.severity === 'critical').length;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col">
          <SheetHeader className="pb-4 shrink-0">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <SheetTitle>Policy Insights</SheetTitle>
            </div>
            <SheetDescription>
              Clarity score analysis and confusion hotspots
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 pb-6">
              {/* Clarity Score Card */}
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Policy Clarity Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn("text-4xl font-bold", getScoreColor(clarityData.overallScore))}>
                        {clarityData.overallScore}
                      </p>
                      <p className="text-sm text-muted-foreground">out of 100</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Target</p>
                      <p className="text-xl font-semibold">{clarityData.target}</p>
                    </div>
                  </div>
                  <Progress 
                    value={(clarityData.overallScore / clarityData.target) * 100} 
                    className="h-2" 
                  />
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline" className="gap-1">
                      <BarChart3 className="h-3 w-3" /> Estimated
                    </Badge>
                    <span className="text-muted-foreground">
                      {clarityData.dataCompleteness}% data completeness
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Key Drivers */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Key Drivers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {clarityData.drivers.map((driver, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">{driver.label}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold">
                            {driver.value}{driver.unit}
                          </p>
                          {driver.trend !== 'stable' && (
                            <div className={cn(
                              "flex items-center gap-0.5 text-xs",
                              driver.isGoodUp 
                                ? (driver.trend === 'up' ? 'text-success' : 'text-destructive')
                                : (driver.trend === 'up' ? 'text-destructive' : 'text-success')
                            )}>
                              {driver.trend === 'up' ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {driver.trendValue}%
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Target: {driver.target}{driver.unit}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                  <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
                  <p className="text-xs text-muted-foreground">Critical Hotspots</p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-center">
                  <p className="text-2xl font-bold text-warning">{totalQuestions}</p>
                  <p className="text-xs text-muted-foreground">Questions/Month</p>
                </div>
                <div className="p-3 rounded-lg bg-info/10 border border-info/20 text-center">
                  <p className="text-lg font-bold text-info">{formatCurrencyAED(totalCost, { abbreviate: true })}</p>
                  <p className="text-xs text-muted-foreground">Est. Cost Impact</p>
                </div>
              </div>

              {/* Confusion Hotspots */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      Confusion Hotspots
                    </CardTitle>
                    <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                      {criticalCount} critical
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {confusingAreas.map((area) => (
                      <div
                        key={area.id}
                        className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors group"
                        onClick={() => {
                          setSelectedHotspot(area);
                          setHotspotDrawerOpen(true);
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm truncate">{area.policyName}</p>
                              {getSeverityBadge(area.severity)}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {area.clause}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className={cn("font-medium", getScoreColor(area.clarityScore))}>
                                {area.clarityScore}% clarity
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {area.questionCount} questions
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Fixes */}
              <Card className="border-success/20 bg-success/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-success" />
                    Quick Wins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {confusingAreas
                      .flatMap(area => area.suggestedFixes.filter(f => f.effort === 'low').map(f => ({ ...f, policyName: area.policyName })))
                      .slice(0, 3)
                      .map((fix, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded bg-background">
                          <Zap className="h-4 w-4 text-success shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{fix.fix}</p>
                            <p className="text-xs text-muted-foreground">{fix.policyName} • {fix.timeToImplement}</p>
                          </div>
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20 shrink-0">
                            Low Effort
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Hotspot Detail Drawer */}
      <PolicyHotspotDrawer
        open={hotspotDrawerOpen}
        onOpenChange={setHotspotDrawerOpen}
        hotspot={selectedHotspot}
        onCreateAction={handleCreateAction}
        onViewPolicy={handleViewPolicy}
      />
    </>
  );
}
