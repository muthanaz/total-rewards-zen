import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  AlertTriangle, 
  FileText, 
  TrendingDown, 
  TrendingUp,
  MessageSquare,
  ExternalLink,
  Lightbulb,
  Target,
  Clock,
  Users,
  XCircle,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  Plus,
  Zap,
  Ticket,
  LineChart,
  ClipboardList,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { ConfidenceBadge } from '@/components/shared';

export interface ConfusingArea {
  id: string;
  policyName: string;
  policyId: string;
  policyVersion: number;
  clause: string;
  clarityScore: number;
  questionCount: number;
  dropOffRate: number;
  whatUsersAsk: string[];
  whereTheyDropOff: string;
  recommendedFix: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: 'measured' | 'estimated' | 'proxy';
  dataSources: string[];
  rootCauses: {
    cause: string;
    evidence: string;
    impact: string;
  }[];
  suggestedFixes: {
    fix: string;
    effort: 'low' | 'medium' | 'high';
    timeToImplement: string;
    expectedImpact: {
      questionsReduction: number;
      rejectionsReduction?: number;
      cycleTimeReduction?: number;
      utilizationUplift?: number;
    };
  }[];
  impactEstimates: {
    questionsPerMonth: number;
    estimatedRejections: number;
    estimatedCost: number;
    confidence: 'measured' | 'estimated' | 'proxy';
  };
}

interface PolicyHotspotDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotspot: ConfusingArea | null;
  onCreateAction: (hotspot: ConfusingArea, fix: ConfusingArea['suggestedFixes'][0]) => void;
  onViewPolicy: (policyId: string, clause: string) => void;
}

// Data source mock data
const getDataSourceDetails = (hotspotId: string) => ({
  hrTickets: {
    coverage: 92,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2),
    recordCount: 156,
    note: 'Based on HR service desk tickets tagged with this policy',
  },
  claimAnalytics: {
    coverage: 78,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 6),
    recordCount: 423,
    note: 'Derived from claim submission patterns and rejection reasons',
  },
  surveyData: {
    coverage: 65,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    recordCount: 89,
    note: 'From annual benefits satisfaction survey responses',
  },
});

// Funnel data
const getFunnelData = (hotspot: ConfusingArea) => [
  { step: 'View Policy Page', count: 1000, rate: 100 },
  { step: 'Open Claim Form', count: 780, rate: 78 },
  { step: 'Select Provider', count: 520, rate: 52 },
  { step: 'Upload Documents', count: 380, rate: 38 },
  { step: 'Submit Claim', count: Math.round(1000 * (1 - hotspot.dropOffRate / 100)), rate: 100 - hotspot.dropOffRate },
];

export function PolicyHotspotDrawer({
  open,
  onOpenChange,
  hotspot,
  onCreateAction,
  onViewPolicy,
}: PolicyHotspotDrawerProps) {
  const [dataTab, setDataTab] = useState('hrTickets');

  if (!hotspot) return null;

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-600', label: 'Critical' };
      case 'high':
        return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-600', label: 'High' };
      case 'medium':
        return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-600', label: 'Medium' };
      default:
        return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-600', label: 'Low' };
    }
  };

  const getEffortConfig = (effort: string) => {
    switch (effort) {
      case 'low':
        return { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Quick Win', owner: 'HR Ops' };
      case 'medium':
        return { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Medium', owner: 'Policy Owner' };
      case 'high':
        return { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Strategic', owner: 'IT + Policy' };
      default:
        return { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Unknown', owner: 'TBD' };
    }
  };

  const severityConfig = getSeverityConfig(hotspot.severity);
  const dataSourceDetails = getDataSourceDetails(hotspot.id);
  const funnelData = getFunnelData(hotspot);

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getOwnerSuggestion = (effort: string) => {
    switch (effort) {
      case 'low': return 'HR Ops';
      case 'medium': return 'Benefits Manager';
      case 'high': return 'Vendor Management / IT';
      default: return 'TBD';
    }
  };

  const getDueDateSuggestion = (timeToImplement: string): Date => {
    const now = new Date();
    if (timeToImplement.includes('hour')) return new Date(now.setDate(now.getDate() + 1));
    if (timeToImplement.includes('day')) return new Date(now.setDate(now.getDate() + 3));
    if (timeToImplement.includes('week')) return new Date(now.setDate(now.getDate() + 14));
    return new Date(now.setDate(now.getDate() + 30));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        {/* Header */}
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <SheetTitle className="text-lg">{hotspot.policyName}</SheetTitle>
                <Badge variant="outline" className="text-xs">v{hotspot.policyVersion}</Badge>
              </div>
              <SheetDescription className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                {hotspot.clause}
              </SheetDescription>
            </div>
            <Badge className={cn(severityConfig.bg, severityConfig.text, "border", severityConfig.border)}>
              {severityConfig.label}
            </Badge>
          </div>
        </SheetHeader>

        <div className="space-y-5 pb-4">
          {/* KPI Tiles with trends */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-[10px] text-muted-foreground mb-1">Clarity Score</p>
              <div className="flex items-center justify-center gap-1">
                <span className={cn(
                  "text-xl font-bold",
                  hotspot.clarityScore < 50 ? "text-red-600" : 
                  hotspot.clarityScore < 70 ? "text-amber-600" : "text-green-600"
                )}>
                  {hotspot.clarityScore}%
                </span>
              </div>
              <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mt-1">
                <TrendingDown className="h-3 w-3 text-red-500" />
                <span>-5% vs last month</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-[10px] text-muted-foreground mb-1">Questions/Month</p>
              <span className="text-xl font-bold text-primary">{hotspot.questionCount}</span>
              <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 text-red-500" />
                <span>+12% vs last month</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-[10px] text-muted-foreground mb-1">Drop-off Rate</p>
              <span className={cn(
                "text-xl font-bold",
                hotspot.dropOffRate > 50 ? "text-red-600" : "text-amber-600"
              )}>
                {hotspot.dropOffRate}%
              </span>
              <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 text-red-500" />
                <span>+8% vs last month</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Data Confidence Module with Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Data Confidence
              </h4>
              <ConfidenceBadge level={hotspot.confidence} showLabel size="sm" />
            </div>
            
            <Tabs value={dataTab} onValueChange={setDataTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 h-8">
                <TabsTrigger value="hrTickets" className="text-xs gap-1">
                  <Ticket className="h-3 w-3" />
                  HR Tickets
                </TabsTrigger>
                <TabsTrigger value="claimAnalytics" className="text-xs gap-1">
                  <LineChart className="h-3 w-3" />
                  Claim Analytics
                </TabsTrigger>
                <TabsTrigger value="surveyData" className="text-xs gap-1">
                  <ClipboardList className="h-3 w-3" />
                  Survey Data
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="hrTickets" className="mt-2">
                <div className="p-3 rounded-lg bg-muted/30 border text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Coverage</span>
                    <span className="font-medium text-emerald-600">{dataSourceDetails.hrTickets.coverage}%</span>
                  </div>
                  <Progress value={dataSourceDetails.hrTickets.coverage} className="h-1" />
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{dataSourceDetails.hrTickets.recordCount} records</span>
                    <span>Updated {formatLastSync(dataSourceDetails.hrTickets.lastUpdated)}</span>
                  </div>
                  <p className="text-muted-foreground italic pt-1 border-t">
                    {dataSourceDetails.hrTickets.note}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="claimAnalytics" className="mt-2">
                <div className="p-3 rounded-lg bg-muted/30 border text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Coverage</span>
                    <span className="font-medium text-amber-600">{dataSourceDetails.claimAnalytics.coverage}%</span>
                  </div>
                  <Progress value={dataSourceDetails.claimAnalytics.coverage} className="h-1 [&>div]:bg-amber-500" />
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{dataSourceDetails.claimAnalytics.recordCount} records</span>
                    <span>Updated {formatLastSync(dataSourceDetails.claimAnalytics.lastUpdated)}</span>
                  </div>
                  <p className="text-muted-foreground italic pt-1 border-t">
                    {dataSourceDetails.claimAnalytics.note}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="surveyData" className="mt-2">
                <div className="p-3 rounded-lg bg-muted/30 border text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Coverage</span>
                    <span className="font-medium text-red-600">{dataSourceDetails.surveyData.coverage}%</span>
                  </div>
                  <Progress value={dataSourceDetails.surveyData.coverage} className="h-1 [&>div]:bg-red-500" />
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{dataSourceDetails.surveyData.recordCount} records</span>
                    <span>Updated {formatLastSync(dataSourceDetails.surveyData.lastUpdated)}</span>
                  </div>
                  <p className="text-muted-foreground italic pt-1 border-t">
                    {dataSourceDetails.surveyData.note}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            
            <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Impact estimates weighted by data completeness ({hotspot.confidence === 'measured' ? '100%' : hotspot.confidence === 'estimated' ? '70%' : '40%'} confidence factor)
            </p>
          </div>

          <Separator />

          {/* Top Employee Questions */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Top Employee Questions
            </h4>
            <div className="space-y-2">
              {hotspot.whatUsersAsk.slice(0, 3).map((q, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-primary/5">
                  <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm">"{q}"</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span>{Math.round(hotspot.questionCount / (idx + 1))} times/mo</span>
                      <TrendingUp className="h-3 w-3 text-red-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Where They Drop Off - Funnel */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Where They Drop Off
            </h4>
            <div className="space-y-1">
              {funnelData.map((step, idx) => {
                const isDropOff = idx > 0 && funnelData[idx - 1].count - step.count > 100;
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <div 
                      className={cn(
                        "h-6 rounded-r-sm flex items-center px-2 text-xs font-medium transition-all",
                        isDropOff ? "bg-red-500/20 text-red-700" : "bg-primary/10 text-primary"
                      )}
                      style={{ width: `${Math.max(step.rate, 20)}%` }}
                    >
                      {step.step}
                    </div>
                    <span className={cn(
                      "text-xs shrink-0",
                      isDropOff ? "text-red-600 font-medium" : "text-muted-foreground"
                    )}>
                      {step.rate}%
                    </span>
                    {isDropOff && (
                      <Badge variant="outline" className="text-[10px] text-red-600 border-red-500/30 bg-red-500/5">
                        -{funnelData[idx - 1].rate - step.rate}% drop
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{hotspot.whereTheyDropOff}</p>
          </div>

          <Separator />

          {/* Root Causes */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-500" />
              Root Causes
            </h4>
            <div className="space-y-2">
              {hotspot.rootCauses.map((cause, idx) => (
                <div key={idx} className="p-3 rounded-lg border bg-muted/20">
                  <p className="text-sm font-medium mb-1.5">{cause.cause}</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Evidence:</span> {cause.evidence}
                    </p>
                    <p className="text-red-600">
                      <span className="font-medium">Impact:</span> {cause.impact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Suggested Fixes */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-green-500" />
              Suggested Fixes
            </h4>
            <div className="space-y-3">
              {hotspot.suggestedFixes.map((fix, idx) => {
                const effortConfig = getEffortConfig(fix.effort);
                return (
                  <div key={idx} className="p-3 rounded-lg border bg-green-500/5 border-green-500/20">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium flex-1">{fix.fix}</p>
                      <Badge className={cn(effortConfig.bg, effortConfig.text, "shrink-0 text-[10px]")}>
                        {effortConfig.label}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>ETA: {fix.timeToImplement}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{getOwnerSuggestion(fix.effort)}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <Badge variant="outline" className="text-[10px] bg-green-500/5 text-green-600 border-green-500/30">
                        -{fix.expectedImpact.questionsReduction}% questions
                      </Badge>
                      {fix.expectedImpact.rejectionsReduction && (
                        <Badge variant="outline" className="text-[10px] bg-green-500/5 text-green-600 border-green-500/30">
                          -{fix.expectedImpact.rejectionsReduction}% rejections
                        </Badge>
                      )}
                      {fix.expectedImpact.utilizationUplift && (
                        <Badge variant="outline" className="text-[10px] bg-green-500/5 text-green-600 border-green-500/30">
                          +{fix.expectedImpact.utilizationUplift}% utilization
                        </Badge>
                      )}
                      {fix.expectedImpact.cycleTimeReduction && (
                        <Badge variant="outline" className="text-[10px] bg-green-500/5 text-green-600 border-green-500/30">
                          -{fix.expectedImpact.cycleTimeReduction}% cycle time
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full gap-1.5 h-8"
                      onClick={() => onCreateAction(hotspot, fix)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add to Action Plan
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Impact Summary */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Estimated Impact of Fixing
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Questions Saved/Month</p>
                <p className="text-lg font-bold text-primary">~{hotspot.impactEstimates.questionsPerMonth}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rejections Prevented</p>
                <p className="text-lg font-bold text-primary">~{hotspot.impactEstimates.estimatedRejections}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Estimated Cost Avoidance</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrencyAED(hotspot.impactEstimates.estimatedCost)}
                  </p>
                  <ConfidenceBadge level={hotspot.impactEstimates.confidence} size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewPolicy(hotspot.policyId, hotspot.clause)}
          >
            <ExternalLink className="h-4 w-4 mr-1.5" />
            View in Policy
          </Button>
          <Button 
            className="flex-1"
            onClick={() => hotspot.suggestedFixes[0] && onCreateAction(hotspot, hotspot.suggestedFixes[0])}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create Action
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
