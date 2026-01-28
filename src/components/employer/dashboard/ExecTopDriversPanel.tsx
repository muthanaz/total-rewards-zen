/**
 * Executive Top Drivers Panel (2 panels side-by-side)
 * 
 * Left: Top 5 Benefits by Spend (bar chart)
 * Right: Top 5 Benefits by Leakage (bar chart)
 * 
 * Each driver item has CTAs:
 * - "Open Benefit Policy"
 * - "Open Optimization Tab"
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  AlertTriangle, 
  ArrowRight, 
  FileText,
  Lightbulb,
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

const CAUSE_LABELS: Record<string, { label: string; color: string }> = {
  awareness: { label: 'Awareness Gap', color: 'text-blue-600' },
  friction: { label: 'Process Friction', color: 'text-orange-600' },
  eligibility: { label: 'Eligibility', color: 'text-purple-600' },
  policy: { label: 'Policy Design', color: 'text-amber-600' },
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

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-6', className)}>
      {/* Spend Drivers */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Top 5 by Spend
            </CardTitle>
            <Badge variant="secondary" className="text-xs tabular-nums">
              {formatCurrencyAED(totalSpend, { abbreviate: true })} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {top5Spend.map((driver, index) => (
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
          ))}
        </CardContent>
      </Card>

      {/* Leakage Drivers */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Top 5 by Leakage
            </CardTitle>
            <Badge variant="outline" className="text-xs tabular-nums bg-warning/10 text-warning border-warning/30">
              {formatCurrencyAED(totalLeakage, { abbreviate: true })} at risk
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {top5Leakage.map((driver, index) => {
            const causeInfo = CAUSE_LABELS[driver.cause] || CAUSE_LABELS.awareness;
            return (
              <div key={driver.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground w-4">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{driver.name}</span>
                    <Badge variant="outline" className={cn('text-[10px]', causeInfo.color)}>
                      {causeInfo.label}
                    </Badge>
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
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
