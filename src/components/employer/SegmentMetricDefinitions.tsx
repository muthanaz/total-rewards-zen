/**
 * Segment Metric Definitions
 * 
 * Expandable strip showing metric definitions and confidence weights for Employee Segments.
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, BookOpen, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CONFIDENCE_FACTORS, ConfidenceLevel } from '@/hooks/useSegmentData';

const metricDefinitions = [
  {
    key: 'utilization_rate',
    name: 'Utilization Rate',
    formula: '(Claimed Amount ÷ Entitled Value) × 100',
    description: 'The percentage of allocated benefits that employees have claimed and used.',
    source: 'benefit_entitlements, requests',
  },
  {
    key: 'unused_entitlement',
    name: 'Unused Entitlement',
    formula: 'Entitled Value − Claimed Amount',
    description: 'The value of benefits allocated to employees that has not been claimed within the measurement period.',
    source: 'benefit_entitlements, requests',
  },
  {
    key: 'claims_cost',
    name: 'Claims Cost',
    formula: 'Σ(Paid Claim Amounts)',
    description: 'Total value of claims paid out to or on behalf of employees in this segment.',
    source: 'requests (status = paid)',
  },
  {
    key: 'retention_risk',
    name: 'Retention Risk',
    formula: 'f(Satisfaction, Tenure, Market Factors)',
    description: 'An index combining satisfaction scores, tenure patterns, and market benchmarks to estimate attrition likelihood.',
    source: 'employee_satisfaction_ratings, profiles, platform_analytics',
  },
  {
    key: 'estimated_recoverable',
    name: 'Estimated Recoverable',
    formula: 'Σ(Unused by Segment × Confidence Weight)',
    description: 'The weighted sum of unused entitlements, adjusted by data confidence levels to provide a realistic recovery target.',
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

export function SegmentMetricDefinitions() {
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
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
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
                      Estimated Recoverable and opportunity values are weighted by data confidence. 
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
                
                {/* Driver Definitions */}
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2">
                  Root-Cause Drivers
                </h4>
                <div className="space-y-2">
                  {[
                    { name: 'Awareness Gap', desc: 'Employees may not know about benefits' },
                    { name: 'Policy Complexity', desc: 'Confusing rules or documentation' },
                    { name: 'Process Friction', desc: 'Lengthy approvals or missing docs' },
                    { name: 'Vendor Access', desc: 'Limited provider network' },
                  ].map((driver) => (
                    <div key={driver.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="text-sm font-medium">{driver.name}</span>
                      <span className="text-xs text-muted-foreground">{driver.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
