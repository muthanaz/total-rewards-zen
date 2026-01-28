/**
 * Failing Rules Panel
 * 
 * Shows top 5 failing data quality rules with impacted KPIs and fix guidance.
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  AlertTriangle, 
  XCircle, 
  ChevronRight, 
  ChevronDown,
  ExternalLink,
  Wrench,
  Zap,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { DataQualityRule } from './types';

interface FailingRulesPanelProps {
  rules: DataQualityRule[];
  maxRules?: number;
  onAutoFix?: (ruleId: string) => void;
  className?: string;
}

const severityConfig: Record<DataQualityRule['severity'], {
  icon: typeof XCircle;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  critical: {
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20',
  },
  high: {
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20',
  },
  medium: {
    icon: AlertTriangle,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
  },
  low: {
    icon: AlertTriangle,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    borderColor: 'border-border',
  },
};

const impactConfig: Record<string, { color: string; label: string }> = {
  blocking: { color: 'text-destructive', label: 'Blocking' },
  degraded: { color: 'text-warning', label: 'Degraded' },
  minor: { color: 'text-muted-foreground', label: 'Minor' },
};

export function FailingRulesPanel({ 
  rules, 
  maxRules = 5, 
  onAutoFix,
  className 
}: FailingRulesPanelProps) {
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
  
  // Filter to failing/warning rules and sort by severity
  const failingRules = rules
    .filter(r => r.status === 'failing' || r.status === 'warning')
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, maxRules);

  const toggleRule = (ruleId: string) => {
    setExpandedRules(prev => {
      const next = new Set(prev);
      if (next.has(ruleId)) {
        next.delete(ruleId);
      } else {
        next.add(ruleId);
      }
      return next;
    });
  };

  if (failingRules.length === 0) {
    return (
      <Card className={cn('card-elevated', className)}>
        <CardContent className="py-8 text-center">
          <div className="inline-flex p-3 rounded-full bg-success/10 mb-3">
            <Zap className="w-6 h-6 text-success" />
          </div>
          <p className="font-medium text-success">All Rules Passing</p>
          <p className="text-sm text-muted-foreground mt-1">
            Data quality is within acceptable thresholds
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate total confidence impact
  const totalConfidenceImpact = failingRules.reduce((sum, rule) => {
    return sum + rule.impactedKPIs.reduce((kpiSum, kpi) => kpiSum + kpi.confidenceReduction, 0);
  }, 0);

  return (
    <Card className={cn('card-elevated', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Top Failing Rules
          </CardTitle>
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            -{totalConfidenceImpact}% confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {failingRules.map((rule) => {
          const config = severityConfig[rule.severity];
          const SeverityIcon = config.icon;
          const isExpanded = expandedRules.has(rule.id);

          return (
            <Collapsible
              key={rule.id}
              open={isExpanded}
              onOpenChange={() => toggleRule(rule.id)}
            >
              <div className={cn(
                'rounded-lg border transition-colors',
                config.borderColor,
                isExpanded && config.bgColor
              )}>
                <CollapsibleTrigger asChild>
                  <button className="w-full p-3 text-left">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <SeverityIcon className={cn('w-4 h-4 mt-0.5 shrink-0', config.color)} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{rule.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-[10px]">
                              {rule.dataSource}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {rule.violationCount} violation{rule.violationCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {rule.autoFixAvailable && (
                          <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20">
                            <Zap className="w-2.5 h-2.5" />
                            Auto-fix
                          </Badge>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-3 pb-3 space-y-3">
                    {/* Description */}
                    <p className="text-xs text-muted-foreground pl-6">
                      {rule.description}
                    </p>

                    {/* Impacted KPIs */}
                    {rule.impactedKPIs.length > 0 && (
                      <div className="pl-6">
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          Impacted KPIs
                        </p>
                        <div className="space-y-1.5">
                          {rule.impactedKPIs.map((kpi) => {
                            const impact = impactConfig[kpi.impactLevel];
                            return (
                              <div 
                                key={kpi.kpiId}
                                className="flex items-center justify-between p-2 rounded bg-background/50"
                              >
                                <div className="flex items-center gap-2">
                                  <span className={cn('text-xs font-medium', impact.color)}>
                                    {impact.label}
                                  </span>
                                  <span className="text-xs">{kpi.kpiName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    -{kpi.confidenceReduction}%
                                  </span>
                                  <Button variant="ghost" size="sm" asChild className="h-5 px-1.5">
                                    <Link to={kpi.dashboardPath}>
                                      <ExternalLink className="w-3 h-3" />
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Fix Guidance */}
                    <div className="pl-6 p-2 rounded-lg bg-muted/50 border">
                      <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <Wrench className="w-3 h-3" />
                        How to Fix
                      </p>
                      <p className="text-xs">{rule.fixGuidance}</p>
                    </div>

                    {/* Actions */}
                    <div className="pl-6 flex gap-2">
                      {rule.autoFixAvailable && onAutoFix && (
                        <Button 
                          size="sm" 
                          className="gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAutoFix(rule.id);
                          }}
                        >
                          <Zap className="w-3 h-3" />
                          Auto-Fix
                        </Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/employer/data-quality">
                          View All Rules
                        </Link>
                      </Button>
                    </div>

                    {/* Last Checked */}
                    {rule.lastChecked && (
                      <p className="pl-6 text-[10px] text-muted-foreground">
                        Last checked {formatDistanceToNow(rule.lastChecked, { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}

        {/* View All Link */}
        <Button variant="ghost" size="sm" asChild className="w-full">
          <Link to="/employer/data-quality" className="gap-2">
            View All Data Quality Rules
            <ExternalLink className="w-3 h-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
