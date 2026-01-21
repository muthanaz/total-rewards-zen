/**
 * Zombie Spend Metric Definitions
 * 
 * Expandable strip showing metric definitions and confidence weights.
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, BookOpen, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CONFIDENCE_FACTORS, ConfidenceLevel } from '@/hooks/useZombieSpendData';

const metricDefinitions = [
  {
    key: 'unused_entitlement',
    name: 'Unused Entitlement',
    formula: 'Entitled Value − Claimed Amount',
    description: 'The value of benefits allocated to employees that has not been claimed within the measurement period.',
    source: 'benefit_entitlements, requests',
  },
  {
    key: 'percent_budget_unused',
    name: '% Budget Unused',
    formula: 'Unused Entitlement ÷ Entitled Value × 100',
    description: 'The percentage of the total entitled benefit value that remains unclaimed.',
    source: 'benefit_entitlements',
  },
  {
    key: 'estimated_recoverable',
    name: 'Estimated Recoverable',
    formula: 'Σ(Unused by Category × Confidence Weight)',
    description: 'The weighted sum of unused entitlements across all categories, adjusted by data confidence levels.',
    source: 'benefit_entitlements, integration_runs',
  },
];

const confidenceWeightInfo: { level: ConfidenceLevel; label: string; percent: string; description: string }[] = [
  { 
    level: 'high', 
    label: 'High', 
    percent: '100%', 
    description: 'Complete data from verified sources' 
  },
  { 
    level: 'medium', 
    label: 'Medium', 
    percent: '70%', 
    description: 'Partial data or minor gaps' 
  },
  { 
    level: 'low', 
    label: 'Low', 
    percent: '40%', 
    description: 'Limited data, estimates used' 
  },
];

const confidenceBadgeStyles: Record<ConfidenceLevel, string> = {
  high: 'bg-success/10 text-success border-success/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low: 'bg-destructive/10 text-destructive border-destructive/30',
};

export function ZombieMetricDefinitions() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-muted/30 border-dashed">
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-between px-4 py-3 h-auto"
          >
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Metric Definitions</span>
              <Badge variant="secondary" className="text-xs">
                {metricDefinitions.length} metrics
              </Badge>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Metric Definitions */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Metric Definitions
                </h4>
                {metricDefinitions.map((metric) => (
                  <div 
                    key={metric.key} 
                    className="p-3 rounded-lg bg-card border"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{metric.name}</span>
                    </div>
                    <div className="mb-2">
                      <code className="text-xs px-2 py-1 rounded bg-muted font-mono">
                        {metric.formula}
                      </code>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {metric.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-muted-foreground/70">Source:</span> {metric.source}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Confidence Weights */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Confidence Weights
                </h4>
                <div className="p-3 rounded-lg bg-card border space-y-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Estimated Recoverable values are weighted by data confidence. 
                      Higher confidence means more reliable estimates.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {confidenceWeightInfo.map((item) => (
                      <div 
                        key={item.level}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline" 
                            className={cn('capitalize', confidenceBadgeStyles[item.level])}
                          >
                            {item.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                        <span className="font-bold text-sm tabular-nums">
                          {item.percent}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      <strong>Example:</strong> AED 100,000 unused with Medium confidence 
                      = AED 70,000 estimated recoverable
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
