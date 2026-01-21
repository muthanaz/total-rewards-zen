import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

export function PolicyHotspotDrawer({
  open,
  onOpenChange,
  hotspot,
  onCreateAction,
  onViewPolicy,
}: PolicyHotspotDrawerProps) {
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
        return { bg: 'bg-green-500/10', text: 'text-green-600', label: '1-2 hours' };
      case 'medium':
        return { bg: 'bg-amber-500/10', text: 'text-amber-600', label: '1-2 days' };
      case 'high':
        return { bg: 'bg-red-500/10', text: 'text-red-600', label: '1+ week' };
      default:
        return { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Unknown' };
    }
  };

  const severityConfig = getSeverityConfig(hotspot.severity);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `AED ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `AED ${(value / 1000).toFixed(0)}K`;
    return `AED ${value}`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <SheetTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className={cn("h-5 w-5", severityConfig.text)} />
                {hotspot.policyName}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-1">
                <FileText className="h-3.5 w-3.5" />
                {hotspot.clause}
                <Badge variant="outline" className="text-xs">v{hotspot.policyVersion}</Badge>
              </SheetDescription>
            </div>
            <Badge className={cn(severityConfig.bg, severityConfig.text, "border", severityConfig.border)}>
              {severityConfig.label}
            </Badge>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Clarity Score</p>
              <div className="flex items-center justify-center gap-1.5">
                <span className={cn(
                  "text-xl font-bold",
                  hotspot.clarityScore < 50 ? "text-red-600" : 
                  hotspot.clarityScore < 70 ? "text-amber-600" : "text-green-600"
                )}>
                  {hotspot.clarityScore}%
                </span>
              </div>
              <Progress 
                value={hotspot.clarityScore} 
                className="h-1.5 mt-2" 
              />
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Questions/Month</p>
              <span className="text-xl font-bold text-primary">{hotspot.questionCount}</span>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 inline mr-0.5 text-red-500" />
                vs last month
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Drop-off Rate</p>
              <span className={cn(
                "text-xl font-bold",
                hotspot.dropOffRate > 50 ? "text-red-600" : "text-amber-600"
              )}>
                {hotspot.dropOffRate}%
              </span>
              <p className="text-xs text-muted-foreground mt-1">abandon claim</p>
            </div>
          </div>

          {/* Data Confidence */}
          <div className="p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Data Confidence</span>
              </div>
              <ConfidenceBadge level={hotspot.confidence as 'measured' | 'estimated' | 'proxy' | 'missing'} showLabel size="sm" />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {hotspot.dataSources.map((source, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {source}
                </Badge>
              ))}
            </div>
            {hotspot.confidence !== 'measured' && (
              <p className="text-xs text-muted-foreground mt-2">
                Impact estimates are weighted by data completeness ({hotspot.confidence === 'estimated' ? '70%' : '40%'} confidence factor)
              </p>
            )}
          </div>

          <Separator />

          {/* Top Questions */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Top 3 Employee Questions
            </h4>
            <div className="space-y-2">
              {hotspot.whatUsersAsk.slice(0, 3).map((q, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-primary/5">
                  <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-sm">"{q}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Drop-off Point */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Where They Drop Off
            </h4>
            <p className="text-sm text-muted-foreground">{hotspot.whereTheyDropOff}</p>
          </div>

          <Separator />

          {/* Root Causes */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-500" />
              Root Causes
            </h4>
            <div className="space-y-3">
              {hotspot.rootCauses.map((cause, idx) => (
                <div key={idx} className="p-3 rounded-lg border">
                  <p className="text-sm font-medium mb-1">{cause.cause}</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    <span className="font-medium">Evidence:</span> {cause.evidence}
                  </p>
                  <p className="text-xs text-red-600">
                    <span className="font-medium">Impact:</span> {cause.impact}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Suggested Fixes */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-green-500" />
              Suggested Fixes
            </h4>
            <div className="space-y-3">
              {hotspot.suggestedFixes.map((fix, idx) => {
                const effortConfig = getEffortConfig(fix.effort);
                return (
                  <div key={idx} className="p-3 rounded-lg border bg-green-500/5 border-green-500/20">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm font-medium">{fix.fix}</p>
                      <Badge className={cn(effortConfig.bg, effortConfig.text, "shrink-0 text-xs")}>
                        {fix.effort === 'low' ? 'Quick Win' : fix.effort === 'medium' ? 'Medium' : 'Strategic'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {fix.timeToImplement}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {fix.effort === 'low' ? 'HR Ops' : fix.effort === 'medium' ? 'Policy Owner' : 'IT + Policy'}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="text-xs bg-green-500/5 text-green-600">
                        -{fix.expectedImpact.questionsReduction}% questions
                      </Badge>
                      {fix.expectedImpact.rejectionsReduction && (
                        <Badge variant="outline" className="text-xs bg-green-500/5 text-green-600">
                          -{fix.expectedImpact.rejectionsReduction}% rejections
                        </Badge>
                      )}
                      {fix.expectedImpact.utilizationUplift && (
                        <Badge variant="outline" className="text-xs bg-green-500/5 text-green-600">
                          +{fix.expectedImpact.utilizationUplift}% utilization
                        </Badge>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full gap-1.5"
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
                    {formatCurrency(hotspot.impactEstimates.estimatedCost)}
                  </p>
                  <ConfidenceBadge level={hotspot.impactEstimates.confidence as 'measured' | 'estimated' | 'proxy' | 'missing'} size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row gap-2">
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
