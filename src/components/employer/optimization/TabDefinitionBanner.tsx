/**
 * Tab Definition Banner
 * 
 * Displays explicit tab definitions with tooltips for CFO-defensible clarity.
 * Each tab has:
 * - Focus area
 * - Outputs
 * - Value proposition
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Wallet, Users, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

export type OptimizationTabType = 'cost_efficiency' | 'value_activation' | 'portfolio_rebalancing';

interface TabDefinition {
  id: OptimizationTabType;
  title: string;
  icon: React.ElementType;
  focus: string;
  outputs: string[];
  valueProposition: string;
  colorClass: string;
  bgClass: string;
}

export const TAB_DEFINITIONS: Record<OptimizationTabType, TabDefinition> = {
  cost_efficiency: {
    id: 'cost_efficiency',
    title: 'Cost Efficiency',
    icon: Wallet,
    focus: 'Budget Leakage, policy noncompliance, duplicates, exceeded caps',
    outputs: ['Recoverable AED', 'Root cause category', 'Recommended control'],
    valueProposition: 'Immediate Cash Recovery',
    colorClass: 'text-success',
    bgClass: 'bg-success/5 border-success/20',
  },
  value_activation: {
    id: 'value_activation',
    title: 'Value Activation',
    icon: Users,
    focus: 'Unused value, adoption barriers, employee comms triggers',
    outputs: ['Utilization lift potential', 'Segment targets', 'Suggested comms'],
    valueProposition: 'Maximize Benefit Awareness',
    colorClass: 'text-info',
    bgClass: 'bg-info/5 border-info/20',
  },
  portfolio_rebalancing: {
    id: 'portfolio_rebalancing',
    title: 'Portfolio Rebalancing',
    icon: Scale,
    focus: 'Shift budget across pillars based on utilization/need',
    outputs: ['Proposed reallocation map', 'Employee impact estimate', 'Policy changes'],
    valueProposition: 'Align Spend with Employee Needs',
    colorClass: 'text-accent',
    bgClass: 'bg-accent/5 border-accent/20',
  },
};

interface TabDefinitionBannerProps {
  tab: OptimizationTabType;
  className?: string;
}

export function TabDefinitionBanner({ tab, className }: TabDefinitionBannerProps) {
  const def = TAB_DEFINITIONS[tab];
  const Icon = def.icon;
  
  return (
    <Card className={cn('border', def.bgClass, className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Icon + Title + Focus */}
          <div className="flex items-start gap-3">
            <div className={cn('p-2 rounded-lg', def.bgClass)}>
              <Icon className={cn('h-5 w-5', def.colorClass)} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn('font-semibold', def.colorClass)}>{def.title}</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <div className="space-y-2">
                      <div>
                        <p className="font-semibold text-xs mb-1">Focus</p>
                        <p className="text-xs">{def.focus}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-xs mb-1">Outputs</p>
                        <ul className="text-xs list-disc pl-4">
                          {def.outputs.map((o, i) => <li key={i}>{o}</li>)}
                        </ul>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm text-muted-foreground">{def.focus}</p>
            </div>
          </div>
          
          {/* Right: Value Proposition */}
          <Badge 
            variant="outline" 
            className={cn(
              'shrink-0 text-xs font-medium whitespace-nowrap',
              def.colorClass,
              def.bgClass
            )}
          >
            {def.valueProposition}
          </Badge>
        </div>
        
        {/* Outputs Row */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50 flex-wrap">
          <span className="text-xs text-muted-foreground">Outputs:</span>
          {def.outputs.map((output, i) => (
            <Badge key={i} variant="secondary" className="text-[10px]">
              {output}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
