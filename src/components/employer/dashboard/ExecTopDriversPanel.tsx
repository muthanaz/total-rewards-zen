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
  const top5Spend = spendDrivers.slice(0, 5);
  const top5Leakage = leakageDrivers.slice(0, 5);
  const maxSpend = top5Spend.length > 0 ? Math.max(...top5Spend.map(d => d.spend)) : 1;
  const maxLeakage = top5Leakage.length > 0 ? Math.max(...top5Leakage.map(d => d.leakage)) : 1;

  // Dynamic title based on actual row count
  const spendTitle = top5Spend.length === 5 
    ? 'Top 5 by Spend' 
    : `Top Drivers by Spend (showing ${top5Spend.length})`;
  
  const leakageTitle = top5Leakage.length === 5 
    ? 'Top 5 by Leakage' 
    : `Top Drivers by Leakage (showing ${top5Leakage.length})`;

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-6', className)}>
      {/* Spend Drivers */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                {spendTitle}
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
        <CardContent className="space-y-3">
          {top5Spend.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No spend data available
            </p>
          ) : (
            top5Spend.map((driver, index) => (
              <div key={driver.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground w-4">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{driver.name}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatCurrencyAED(driver.spend, { abbreviate: true })}
                  </span>
                </div>
                <DriverBar value={driver.spend} maxValue={maxSpend} color="bg-primary" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {driver.percentOfTotal.toFixed(1)}% of total
                  </span>
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
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Leakage Drivers */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  {leakageTitle}
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
        <CardContent className="space-y-3">
          {top5Leakage.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No leakage data available
            </p>
          ) : (
            top5Leakage.map((driver, index) => (
              <div key={driver.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground w-4">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{driver.name}</span>
                    <LeakageCauseBadge cause={driver.cause} />
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-warning">
                    {formatCurrencyAED(driver.leakage, { abbreviate: true })}
                  </span>
                </div>
                <DriverBar value={driver.leakage} maxValue={maxLeakage} color="bg-warning" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {driver.percentOfTotal.toFixed(1)}% of leakage
                  </span>
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
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
