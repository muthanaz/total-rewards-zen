/**
 * Executive Top Drivers Panel (2 panels side-by-side)
 * 
 * Left: Top N Benefits by Spend (dynamic title based on actual row count)
 * Right: Top N Benefits by Leakage (with cause tooltips)
 * 
 * Each driver item has CTAs:
 * - "Open Benefit Policy"
 * - "Open Optimization Tab"
 * 
 * Scope labels clarify what data is included
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  DollarSign, 
  AlertTriangle, 
  FileText,
  Lightbulb,
  Info,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';

export interface SpendDriver {
  id: string;
  name: string;
  spend: number;
  percentOfTotal: number;
  delta?: number;
  policyId?: string;
}

export interface LeakageDriver {
  id: string;
  name: string;
  leakage: number;
  percentOfTotal: number;
  cause: 'awareness' | 'friction' | 'eligibility' | 'policy';
  policyId?: string;
}

interface ExecTopDriversPanelProps {
  spendDrivers: SpendDriver[];
  leakageDrivers: LeakageDriver[];
  totalSpend: number;
  totalLeakage: number;
  className?: string;
}

// Leakage cause definitions with tooltips
const CAUSE_DEFINITIONS: Record<string, { 
  label: string; 
  color: string;
  definition: string;
  trigger: string;
}> = {
  awareness: { 
    label: 'Awareness Gap', 
    color: 'text-blue-600 border-blue-600/30 bg-blue-50 dark:bg-blue-950/30',
    definition: 'Employees don\'t know the benefit exists or how to use it.',
    trigger: 'Low claim frequency (<20%) with no eligibility restrictions.',
  },
  friction: { 
    label: 'Process Friction', 
    color: 'text-orange-600 border-orange-600/30 bg-orange-50 dark:bg-orange-950/30',
    definition: 'Employees know about it but find the process too difficult.',
    trigger: 'High drop-off rate on claim forms or repeated info requests.',
  },
  eligibility: { 
    label: 'Eligibility', 
    color: 'text-purple-600 border-purple-600/30 bg-purple-50 dark:bg-purple-950/30',
    definition: 'Employees are not eligible due to grade, tenure, or other policy rules.',
    trigger: 'High rejection rate with eligibility-related denial codes.',
  },
  policy: { 
    label: 'Policy Design', 
    color: 'text-amber-600 border-amber-600/30 bg-amber-50 dark:bg-amber-950/30',
    definition: 'The benefit design doesn\'t match employee needs or preferences.',
    trigger: 'Low satisfaction scores or explicit feedback indicating mismatch.',
  },
};

function DriverBar({ 
  value, 
  maxValue, 
  color = 'bg-primary' 
}: { 
  value: number; 
  maxValue: number; 
  color?: string;
}) {
  const percent = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
      <div 
        className={cn('h-full rounded-full transition-all', color)}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

function LeakageCauseBadge({ cause }: { cause: string }) {
  const causeInfo = CAUSE_DEFINITIONS[cause] || CAUSE_DEFINITIONS.awareness;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className={cn('text-[10px] cursor-help', causeInfo.color)}
        >
          {causeInfo.label}
          <Info className="w-2.5 h-2.5 ml-1 opacity-60" />
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs p-3">
        <p className="font-medium text-xs mb-1">{causeInfo.label}</p>
        <p className="text-xs text-muted-foreground mb-2">{causeInfo.definition}</p>
        <div className="pt-2 border-t">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Triggered when
          </p>
          <p className="text-xs text-muted-foreground">{causeInfo.trigger}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function ExecTopDriversPanel({
  spendDrivers,
  leakageDrivers,
  totalSpend,
  totalLeakage,
  className,
}: ExecTopDriversPanelProps) {
  // Ensure exactly 5 rows for consistent card heights
  const prepareDrivers = <T extends { id: string; name: string }>(
    drivers: T[],
    getValue: (d: T) => number,
    total: number
  ): (T | { id: string; name: string; isOther: true; value: number; percentOfTotal: number })[] => {
    if (drivers.length === 0) return [];
    
    const top4 = drivers.slice(0, 4);
    const remaining = drivers.slice(4);
    
    if (remaining.length === 0 && top4.length < 5) {
      // Fewer than 5 items - pad with empty or return as-is
      return top4 as any;
    }
    
    if (remaining.length > 0) {
      // Aggregate remaining into "Other"
      const otherValue = remaining.reduce((sum, d) => sum + getValue(d), 0);
      const otherPercent = total > 0 ? (otherValue / total) * 100 : 0;
      return [
        ...top4,
        { id: 'other', name: 'Other', isOther: true, value: otherValue, percentOfTotal: otherPercent }
      ] as any;
    }
    
    return top4 as any;
  };

  const displaySpendDrivers = prepareDrivers(
    spendDrivers,
    d => d.spend,
    totalSpend
  );
  const displayLeakageDrivers = prepareDrivers(
    leakageDrivers,
    d => d.leakage,
    totalLeakage
  );

  const maxSpend = displaySpendDrivers.length > 0 
    ? Math.max(...spendDrivers.slice(0, 5).map(d => d.spend)) 
    : 1;
  const maxLeakage = displayLeakageDrivers.length > 0 
    ? Math.max(...leakageDrivers.slice(0, 5).map(d => d.leakage)) 
    : 1;

  // Fixed row height for consistent list item sizing
  const ROW_HEIGHT = 'min-h-[68px]';

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6', className)}>
      {/* Spend Drivers */}
      <Card className="border-border/50 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Top 5 by Spend
              </CardTitle>
              {/* Scope label */}
              <p className="text-[10px] text-muted-foreground mt-1">
                Scope: Category totals (YTD actuals)
              </p>
            </div>
            <Badge variant="secondary" className="text-xs tabular-nums">
              {formatCurrencyAED(totalSpend, { abbreviate: true })} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {displaySpendDrivers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No spend data available
            </p>
          ) : (
            <div className="flex-1 flex flex-col justify-between space-y-2">
              {displaySpendDrivers.map((driver: any, index) => {
                const isOther = 'isOther' in driver && driver.isOther;
                const spend = isOther ? driver.value : driver.spend;
                const percentOfTotal = driver.percentOfTotal;
                
                return (
                  <div key={driver.id} className={cn('space-y-1.5', ROW_HEIGHT)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground w-4">
                          {index + 1}
                        </span>
                        <span className={cn(
                          "text-sm font-medium",
                          isOther && "text-muted-foreground italic"
                        )}>
                          {driver.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">
                        {formatCurrencyAED(spend, { abbreviate: true })}
                      </span>
                    </div>
                    <DriverBar value={spend} maxValue={maxSpend} color="bg-primary" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {percentOfTotal.toFixed(1)}% of total
                      </span>
                      {!isOther && (
                        <div className="flex gap-1">
                          <Link to={`/employer/policies?benefit=${driver.id}`}>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
                              <FileText className="w-3 h-3" />
                              Policy
                            </Button>
                          </Link>
                          <Link to={`/employer/optimization?category=${driver.id}`}>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
                              <Lightbulb className="w-3 h-3" />
                              Optimize
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leakage Drivers */}
      <Card className="border-border/50 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Top 5 by Leakage
                </CardTitle>
                {/* "At risk" definition tooltip */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="inline-flex">
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-3">
                    <p className="font-medium text-xs mb-1">"At Risk" Definition</p>
                    <p className="text-xs text-muted-foreground">
                      Budget allocated but likely to remain unutilized based on current claim patterns and historical trends.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {/* Scope label */}
              <p className="text-[10px] text-muted-foreground mt-1">
                Scope: Cap-based benefits only (excludes coverage/deferred)
              </p>
            </div>
            <Badge variant="outline" className="text-xs tabular-nums bg-warning/10 text-warning border-warning/30">
              {formatCurrencyAED(totalLeakage, { abbreviate: true })} at risk
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {displayLeakageDrivers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No leakage data available
            </p>
          ) : (
            <div className="flex-1 flex flex-col justify-between space-y-2">
              {displayLeakageDrivers.map((driver: any, index) => {
                const isOther = 'isOther' in driver && driver.isOther;
                const leakage = isOther ? driver.value : driver.leakage;
                const percentOfTotal = driver.percentOfTotal;
                
                return (
                  <div key={driver.id} className={cn('space-y-1.5', ROW_HEIGHT)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground w-4">
                          {index + 1}
                        </span>
                        <span className={cn(
                          "text-sm font-medium",
                          isOther && "text-muted-foreground italic"
                        )}>
                          {driver.name}
                        </span>
                        {!isOther && driver.cause && (
                          <LeakageCauseBadge cause={driver.cause} />
                        )}
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-warning">
                        {formatCurrencyAED(leakage, { abbreviate: true })}
                      </span>
                    </div>
                    <DriverBar value={leakage} maxValue={maxLeakage} color="bg-warning" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {percentOfTotal.toFixed(1)}% of leakage
                      </span>
                      {!isOther && (
                        <div className="flex gap-1">
                          <Link to={`/employer/policies?benefit=${driver.id}`}>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
                              <FileText className="w-3 h-3" />
                              Policy
                            </Button>
                          </Link>
                          <Link to={`/employer/optimization?category=${driver.id}`}>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
                              <Lightbulb className="w-3 h-3" />
                              Optimize
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
