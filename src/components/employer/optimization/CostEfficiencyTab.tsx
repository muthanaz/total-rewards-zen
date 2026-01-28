/**
 * Cost Efficiency Tab - The CFO View
 * 
 * Focus: Budget Leakage, policy noncompliance, duplicates, exceeded caps
 * Outputs: Recoverable AED, Root cause category, Recommended control
 * Action: "Simulate" (primary) + "Create Action" / "Open Policy"
 * Value Proposition: "Immediate Cash Recovery"
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { 
  Wallet, 
  AlertTriangle, 
  Layers,
  Receipt,
  Coins,
  ShieldAlert,
  FileWarning,
} from 'lucide-react';
import { formatCurrencyAED, cn } from '@/lib/utils';
import { CostEfficiencyItem } from './types';
import { OptimizationRecommendationCard, OptimizationRecommendation } from './OptimizationRecommendationCard';
import { TabDefinitionBanner } from './TabDefinitionBanner';

interface CostEfficiencyTabProps {
  items: CostEfficiencyItem[];
  totalRecoverableMin: number;
  totalRecoverableMax: number;
  onSimulate: (item: CostEfficiencyItem) => void;
  onCreateAction: (item: CostEfficiencyItem) => void;
  onOpenPolicy?: (policyId: string) => void;
  onInitiateRecovery?: (item: CostEfficiencyItem) => void; // Legacy support
}

const issueTypeConfig = {
  duplicate_coverage: { 
    label: 'Duplicate Coverage', 
    icon: Layers, 
    color: 'text-warning',
  },
  vendor_overcharge: { 
    label: 'Vendor Overcharge', 
    icon: Receipt, 
    color: 'text-destructive',
  },
  unclaimed_cashout: { 
    label: 'Unclaimed Cash-out', 
    icon: Coins, 
    color: 'text-info',
  },
  policy_noncompliance: {
    label: 'Policy Noncompliance',
    icon: ShieldAlert,
    color: 'text-warning',
  },
  exceeded_caps: {
    label: 'Exceeded Caps',
    icon: FileWarning,
    color: 'text-destructive',
  },
};

// Transform CostEfficiencyItem to OptimizationRecommendation
function toRecommendation(item: CostEfficiencyItem): OptimizationRecommendation {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    impactMin: item.recoveryAmountMin,
    impactMax: item.recoveryAmountMax,
    confidence: item.confidence,
    mechanism: item.mechanism,
    riskDownside: item.riskDownside,
    type: 'cost_efficiency',
    rootCause: item.rootCause,
    affectedHeadcount: item.affectedEmployees?.length,
    relatedPolicyId: item.relatedPolicyId,
  };
}

export function CostEfficiencyTab({ 
  items, 
  totalRecoverableMin,
  totalRecoverableMax,
  onSimulate,
  onCreateAction,
  onOpenPolicy,
  onInitiateRecovery,
}: CostEfficiencyTabProps) {
  // Group items by issue type for summary
  const groupedByType = items.reduce((acc, item) => {
    if (!acc[item.issueType]) {
      acc[item.issueType] = { count: 0, min: 0, max: 0 };
    }
    acc[item.issueType].count++;
    acc[item.issueType].min += item.recoveryAmountMin;
    acc[item.issueType].max += item.recoveryAmountMax || item.recoveryAmountMin;
    return acc;
  }, {} as Record<string, { count: number; min: number; max: number }>);

  const handleSimulate = (rec: OptimizationRecommendation) => {
    const item = items.find(i => i.id === rec.id);
    if (item) onSimulate(item);
  };

  const handleCreateAction = (rec: OptimizationRecommendation) => {
    const item = items.find(i => i.id === rec.id);
    if (item) onCreateAction(item);
  };

  return (
    <div className="space-y-6">
      {/* Tab Definition Banner */}
      <TabDefinitionBanner tab="cost_efficiency" />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(issueTypeConfig).map(([type, config]) => {
          const data = groupedByType[type];
          if (!data) return null;
          const Icon = config.icon;
          
          return (
            <Card key={type} className="border-l-4 border-l-muted">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn("h-4 w-4", config.color)} />
                  <span className="font-medium text-sm truncate">{config.label}</span>
                </div>
                <p className="text-lg font-bold">
                  {formatCurrencyAED(data.min, { abbreviate: true })}
                  {data.max > data.min && (
                    <span className="text-sm font-normal text-muted-foreground">
                      {' – '}{formatCurrencyAED(data.max, { abbreviate: true })}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{data.count} opportunities</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recommendations Grid */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Budget Leakage Opportunities
                <InfoTooltip 
                  formula="Identified leakage × Confidence Factor" 
                  dataSource="Policy rules + Claims analysis" 
                />
              </CardTitle>
              <CardDescription>
                Financial inefficiencies identified for recovery. Click "Simulate" to model impact.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Wallet className="h-3 w-3" />
              {formatCurrencyAED(totalRecoverableMin, { abbreviate: true })} – {formatCurrencyAED(totalRecoverableMax, { abbreviate: true })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>No Budget Leakage opportunities identified</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {items.map((item) => (
                <OptimizationRecommendationCard
                  key={item.id}
                  recommendation={toRecommendation(item)}
                  onSimulate={handleSimulate}
                  onCreateAction={handleCreateAction}
                  onOpenPolicy={onOpenPolicy}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
