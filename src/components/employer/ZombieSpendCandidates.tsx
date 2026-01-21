/**
 * ZombieSpendCandidates Component
 * 
 * Displays rule-based flags for zombie spend:
 * - High budget + low utilization + low awareness
 * - High unused + low claims velocity
 * 
 * Each candidate is clickable to open filtered drilldowns
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Ghost,
  AlertTriangle,
  Eye,
  TrendingDown,
  Clock,
  FileWarning,
  Lightbulb,
  ArrowRight,
  ChevronRight,
  Zap,
  Building2,
  Users,
  Target,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';
import { toast } from 'sonner';

// Rule types for zombie detection
type ZombieRule = 
  | 'high_budget_low_util' 
  | 'high_unused_low_velocity' 
  | 'declining_trend' 
  | 'low_awareness';

interface EvidenceSignal {
  type: 'faq_views' | 'doc_friction' | 'approval_delay' | 'claim_velocity' | 'awareness_score';
  value: number;
  threshold: number;
  description: string;
}

interface ZombieCandidate {
  id: string;
  benefit: string;
  category: string;
  allocated: number;
  entitled: number;
  claimed: number;
  unused: number;
  utilizationRate: number;
  affectedEmployees: number;
  rules: ZombieRule[];
  evidenceSignals: EvidenceSignal[];
  potentialRecovery: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  breakdown?: {
    byDepartment: Array<{ name: string; unused: number; utilization: number }>;
    byGrade: Array<{ name: string; unused: number; utilization: number }>;
    byLocation: Array<{ name: string; unused: number; utilization: number }>;
  };
}

interface ZombieSpendCandidatesProps {
  candidates: ZombieCandidate[];
  totalZombieSpend: number;
  yearEndProjection?: number;
  onViewDetails?: (candidate: ZombieCandidate) => void;
  onCreateAction?: (candidate: ZombieCandidate) => void;
  onDrilldown?: (candidate: ZombieCandidate, dimension: string, value: string) => void;
}

const RULE_LABELS: Record<ZombieRule, { label: string; icon: React.ElementType; color: string }> = {
  high_budget_low_util: { 
    label: 'High Budget, Low Utilization', 
    icon: TrendingDown, 
    color: 'text-destructive' 
  },
  high_unused_low_velocity: { 
    label: 'High Unused, Low Claims Velocity', 
    icon: Clock, 
    color: 'text-warning' 
  },
  declining_trend: { 
    label: 'Declining Utilization Trend', 
    icon: TrendingDown, 
    color: 'text-amber-500' 
  },
  low_awareness: { 
    label: 'Low Awareness Score', 
    icon: Eye, 
    color: 'text-blue-500' 
  },
};

const URGENCY_STYLES = {
  low: { bg: 'bg-muted/50', text: 'text-muted-foreground', badge: 'secondary' as const },
  medium: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', badge: 'outline' as const },
  high: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400', badge: 'outline' as const },
  critical: { bg: 'bg-destructive/10', text: 'text-destructive', badge: 'destructive' as const },
};

// Zombie candidate drilldown sheet
function ZombieDrilldownSheet({
  open,
  onOpenChange,
  candidate,
  onDrilldown,
  onCreateAction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: ZombieCandidate | null;
  onDrilldown?: (candidate: ZombieCandidate, dimension: string, value: string) => void;
  onCreateAction?: (candidate: ZombieCandidate) => void;
}) {
  const [activeTab, setActiveTab] = useState<'department' | 'grade' | 'location'>('department');

  if (!candidate) return null;

  const breakdown = candidate.breakdown || {
    byDepartment: [
      { name: 'Engineering', unused: 45000, utilization: 42 },
      { name: 'Sales', unused: 32000, utilization: 51 },
      { name: 'Marketing', unused: 28000, utilization: 48 },
      { name: 'Operations', unused: 15000, utilization: 67 },
    ],
    byGrade: [
      { name: 'Junior', unused: 55000, utilization: 38 },
      { name: 'Mid-Level', unused: 40000, utilization: 52 },
      { name: 'Senior', unused: 25000, utilization: 68 },
    ],
    byLocation: [
      { name: 'Dubai', unused: 65000, utilization: 48 },
      { name: 'Abu Dhabi', unused: 35000, utilization: 55 },
      { name: 'Remote', unused: 20000, utilization: 42 },
    ],
  };

  const currentData = activeTab === 'department' 
    ? breakdown.byDepartment 
    : activeTab === 'grade' 
      ? breakdown.byGrade 
      : breakdown.byLocation;

  const dimensionIcon = activeTab === 'department' 
    ? Building2 
    : activeTab === 'grade' 
      ? Target 
      : MapPin;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Ghost className="h-5 w-5 text-warning" />
            {candidate.benefit}
          </SheetTitle>
          <SheetDescription>
            Zombie spend analysis and breakdown
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Unused Amount</p>
              <p className="text-lg font-bold text-warning">{formatCurrencyAED(candidate.unused)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Utilization</p>
              <p className="text-lg font-bold">{formatPercent(candidate.utilizationRate)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Affected Employees</p>
              <p className="text-lg font-bold">{candidate.affectedEmployees}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Potential Recovery</p>
              <p className="text-lg font-bold text-success">{formatCurrencyAED(candidate.potentialRecovery)}</p>
            </div>
          </div>

          {/* Rules triggered */}
          <div>
            <p className="text-sm font-medium mb-2">Detection Rules Triggered</p>
            <div className="space-y-2">
              {candidate.rules.map((rule) => {
                const config = RULE_LABELS[rule];
                const Icon = config.icon;
                return (
                  <div key={rule} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <Icon className={cn('h-4 w-4', config.color)} />
                    <span className="text-sm">{config.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Evidence signals */}
          <div>
            <p className="text-sm font-medium mb-2">Evidence Signals</p>
            <div className="space-y-2">
              {candidate.evidenceSignals.map((signal, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{signal.description}</span>
                    <Badge variant={signal.value > signal.threshold ? 'destructive' : 'secondary'}>
                      {signal.value} / {signal.threshold}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown tabs */}
          <div>
            <p className="text-sm font-medium mb-2">Breakdown Analysis</p>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="department" className="text-xs">
                  <Building2 className="h-3 w-3 mr-1" />
                  Dept
                </TabsTrigger>
                <TabsTrigger value="grade" className="text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  Grade
                </TabsTrigger>
                <TabsTrigger value="location" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  Location
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4 space-y-2">
                {currentData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onDrilldown?.(candidate, activeTab, item.name)}
                  >
                    <div className="flex items-center gap-2">
                      {React.createElement(dimensionIcon, { className: 'h-4 w-4 text-muted-foreground' })}
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-mono text-warning">{formatCurrencyAED(item.unused)}</p>
                        <p className="text-xs text-muted-foreground">{item.utilization}% util</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              onClick={() => {
                onCreateAction?.(candidate);
                toast.success('Creating recovery action...');
              }}
            >
              <Zap className="h-4 w-4 mr-2" />
              Create Recovery Action
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                window.location.href = `/employer/zombie-spend?benefit=${candidate.id}`;
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Import React for createElement
import React from 'react';

export function ZombieSpendCandidates({
  candidates,
  totalZombieSpend,
  yearEndProjection,
  onViewDetails,
  onCreateAction,
  onDrilldown,
}: ZombieSpendCandidatesProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<ZombieCandidate | null>(null);
  const [drilldownOpen, setDrilldownOpen] = useState(false);

  const criticalCount = candidates.filter(c => c.urgency === 'critical').length;
  const highCount = candidates.filter(c => c.urgency === 'high').length;
  const totalRecoveryPotential = candidates.reduce((sum, c) => sum + c.potentialRecovery, 0);

  const handleCandidateClick = (candidate: ZombieCandidate) => {
    setSelectedCandidate(candidate);
    setDrilldownOpen(true);
    onViewDetails?.(candidate);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ghost className="h-5 w-5 text-warning" />
              <div>
                <CardTitle className="text-lg">Zombie Spend Candidates</CardTitle>
                <CardDescription>Rule-based detection of underutilized benefits</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {criticalCount > 0 && (
                <Badge variant="destructive">{criticalCount} Critical</Badge>
              )}
              {highCount > 0 && (
                <Badge variant="outline" className="border-orange-500 text-orange-500">
                  {highCount} High
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary alert */}
          <Alert className="bg-warning/5 border-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertTitle className="text-warning">
              {formatCurrencyAED(totalZombieSpend)} at risk of going unused
            </AlertTitle>
            <AlertDescription className="text-muted-foreground">
              {candidates.length} benefits flagged • Potential recovery: {formatCurrencyAED(totalRecoveryPotential)}
              {yearEndProjection && (
                <span className="ml-2">• Year-end projection: {formatCurrencyAED(yearEndProjection)}</span>
              )}
            </AlertDescription>
          </Alert>

          {/* Rule legend */}
          <div className="flex flex-wrap gap-2">
            <InfoTooltip>
              <div className="space-y-2 max-w-xs">
                <p className="font-medium">Detection Rules</p>
                {Object.entries(RULE_LABELS).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <config.icon className={cn('h-3 w-3', config.color)} />
                    <span>{config.label}</span>
                  </div>
                ))}
              </div>
            </InfoTooltip>
            <span className="text-xs text-muted-foreground">
              Click any candidate to see breakdown and create actions
            </span>
          </div>

          {/* Candidates list */}
          <div className="space-y-3">
            {candidates.map((candidate) => {
              const urgencyStyle = URGENCY_STYLES[candidate.urgency];
              return (
                <div
                  key={candidate.id}
                  className={cn(
                    'p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                    urgencyStyle.bg
                  )}
                  onClick={() => handleCandidateClick(candidate)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{candidate.benefit}</h4>
                        <Badge variant={urgencyStyle.badge} className="text-xs capitalize">
                          {candidate.urgency}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {candidate.category} • {candidate.affectedEmployees} employees affected
                      </p>
                      
                      {/* Rule flags */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {candidate.rules.map((rule) => {
                          const config = RULE_LABELS[rule];
                          return (
                            <Badge key={rule} variant="outline" className="text-xs gap-1">
                              <config.icon className={cn('h-3 w-3', config.color)} />
                              {config.label.split(',')[0]}
                            </Badge>
                          );
                        })}
                      </div>

                      {/* Utilization bar */}
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={candidate.utilizationRate} 
                          className="h-2 flex-1" 
                        />
                        <span className={cn(
                          'text-xs font-medium',
                          candidate.utilizationRate < 50 ? 'text-destructive' : 
                          candidate.utilizationRate < 70 ? 'text-warning' : 
                          'text-success'
                        )}>
                          {formatPercent(candidate.utilizationRate)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-warning">
                        {formatCurrencyAED(candidate.unused)}
                      </p>
                      <p className="text-xs text-muted-foreground">unused</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 h-7 text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCandidateClick(candidate);
                        }}
                      >
                        Analyze
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View all link */}
          {candidates.length > 0 && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/employer/zombie-spend'}
            >
              View Full Zombie Spend Analysis
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Drilldown sheet */}
      <ZombieDrilldownSheet
        open={drilldownOpen}
        onOpenChange={setDrilldownOpen}
        candidate={selectedCandidate}
        onDrilldown={onDrilldown}
        onCreateAction={onCreateAction}
      />
    </>
  );
}

// Helper to generate zombie candidates from benefit data
export function detectZombieCandidates(
  benefits: Array<{
    id: string;
    name: string;
    category: string;
    allocated: number;
    entitled: number;
    claimed: number;
    employees: number;
    faqViews?: number;
    claimVelocity?: number; // claims per month
    awarenessScore?: number;
  }>
): ZombieCandidate[] {
  return benefits
    .map((b) => {
      const unused = b.entitled - b.claimed;
      const utilizationRate = b.entitled > 0 ? (b.claimed / b.entitled) * 100 : 0;
      const rules: ZombieRule[] = [];
      const evidenceSignals: EvidenceSignal[] = [];

      // Rule: High budget + low utilization + low awareness
      if (b.allocated > 100000 && utilizationRate < 60 && (b.awarenessScore ?? 50) < 40) {
        rules.push('high_budget_low_util');
        rules.push('low_awareness');
      }

      // Rule: High unused + low claims velocity
      if (unused > 50000 && (b.claimVelocity ?? 5) < 3) {
        rules.push('high_unused_low_velocity');
      }

      // Rule: Low utilization alone
      if (utilizationRate < 50) {
        if (!rules.includes('high_budget_low_util')) {
          rules.push('declining_trend');
        }
      }

      // Add evidence signals
      if (b.faqViews && b.faqViews > 50) {
        evidenceSignals.push({
          type: 'faq_views',
          value: b.faqViews,
          threshold: 50,
          description: 'High FAQ views indicate confusion',
        });
      }

      if ((b.claimVelocity ?? 5) < 3) {
        evidenceSignals.push({
          type: 'claim_velocity',
          value: b.claimVelocity ?? 2,
          threshold: 3,
          description: 'Low claims velocity suggests friction',
        });
      }

      if ((b.awarenessScore ?? 50) < 40) {
        evidenceSignals.push({
          type: 'awareness_score',
          value: b.awarenessScore ?? 35,
          threshold: 40,
          description: 'Low awareness score from surveys',
        });
      }

      // Determine urgency
      let urgency: ZombieCandidate['urgency'] = 'low';
      if (unused > 100000 || (rules.length >= 2 && utilizationRate < 40)) {
        urgency = 'critical';
      } else if (unused > 50000 || utilizationRate < 50) {
        urgency = 'high';
      } else if (rules.length > 0) {
        urgency = 'medium';
      }

      // Estimate recovery potential (30-50% of unused based on urgency)
      const recoveryRate = urgency === 'critical' ? 0.35 : urgency === 'high' ? 0.4 : 0.5;
      const potentialRecovery = unused * recoveryRate;

      return {
        id: b.id,
        benefit: b.name,
        category: b.category,
        allocated: b.allocated,
        entitled: b.entitled,
        claimed: b.claimed,
        unused,
        utilizationRate,
        affectedEmployees: b.employees,
        rules,
        evidenceSignals,
        potentialRecovery,
        urgency,
      } as ZombieCandidate;
    })
    .filter((c) => c.rules.length > 0)
    .sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
}

export default ZombieSpendCandidates;
