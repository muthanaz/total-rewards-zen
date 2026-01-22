/**
 * Top Drivers Table
 * 
 * Displays top 5 drivers with value and change vs previous period.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { TrendingUp, TrendingDown, Minus, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';

interface Driver {
  id: string;
  name: string;
  value: number;
  change: number;
  changeLabel?: string;
  category?: string;
}

interface TopDriversTableProps {
  title?: string;
  drivers: Driver[];
  onDriverClick?: (driver: Driver) => void;
  className?: string;
}

export function TopDriversTable({ 
  title = 'Top 5 Drivers', 
  drivers, 
  onDriverClick,
  className 
}: TopDriversTableProps) {
  return (
    <Card className={cn('card-elevated', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          {title}
          <InfoTooltip 
            formula="Ranked by absolute value impact" 
            dataSource="benefit_entitlements + requests"
          />
          <Badge variant="secondary" className="ml-auto text-xs">
            Top {Math.min(drivers.length, 5)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {drivers.slice(0, 5).map((driver, index) => {
            const TrendIcon = driver.change > 0 ? TrendingUp : driver.change < 0 ? TrendingDown : Minus;
            const trendColor = driver.change > 0 ? 'text-success' : driver.change < 0 ? 'text-destructive' : 'text-muted-foreground';
            
            return (
              <div 
                key={driver.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors",
                  onDriverClick && "cursor-pointer"
                )}
                onClick={() => onDriverClick?.(driver)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-5">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{driver.name}</p>
                    {driver.category && (
                      <p className="text-xs text-muted-foreground">{driver.category}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-sm tabular-nums">
                      {formatCurrencyAED(driver.value)}
                    </p>
                    <div className={cn("flex items-center gap-1 text-xs", trendColor)}>
                      <TrendIcon className="w-3 h-3" />
                      <span className="tabular-nums">
                        {driver.change > 0 ? '+' : ''}{formatPercent(driver.change)}
                      </span>
                      {driver.changeLabel && (
                        <span className="text-muted-foreground">{driver.changeLabel}</span>
                      )}
                    </div>
                  </div>
                  {onDriverClick && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
