/**
 * Top 5 Drivers List
 * 
 * Each row shows:
 * - Driver name
 * - AED impact
 * - Delta %
 * - Right arrow linking to relevant page
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowRight, 
  Zap,
} from 'lucide-react';
import { cn, formatCurrencyAED, formatPercent } from '@/lib/utils';

export type DriverType = 'spend' | 'waste' | 'segment';

interface Driver {
  id: string;
  name: string;
  value: number;
  delta: number;
  type: DriverType;
}

interface TopDriversListProps {
  drivers: Driver[];
  className?: string;
}

const DRIVER_ROUTES: Record<DriverType, string> = {
  spend: '/employer/spend',
  waste: '/employer/optimization',
  segment: '/employer/segments',
};

const DRIVER_LABELS: Record<DriverType, string> = {
  spend: 'Spend',
  waste: 'Leakage',
  segment: 'Segment',
};

export function TopDriversList({ drivers, className }: TopDriversListProps) {
  const top5 = drivers.slice(0, 5);

  return (
    <Card className={cn('card-elevated h-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          Top 5 Drivers
          <Badge variant="secondary" className="ml-auto text-xs">
            Impact ranked
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {top5.map((driver, index) => {
          const TrendIcon = driver.delta > 0 ? TrendingUp : driver.delta < 0 ? TrendingDown : Minus;
          const trendColor = driver.type === 'waste' 
            ? (driver.delta < 0 ? 'text-success' : 'text-destructive') // For waste, down is good
            : (driver.delta > 0 ? 'text-success' : 'text-destructive'); // For spend/segment, up is usually good
          
          return (
            <Link 
              key={driver.id}
              to={DRIVER_ROUTES[driver.type]}
              className="block"
            >
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-5">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{driver.name}</p>
                    <Badge variant="outline" className="text-[10px] mt-1">
                      {DRIVER_LABELS[driver.type]}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-sm tabular-nums">
                      {formatCurrencyAED(driver.value)}
                    </p>
                    <div className={cn("flex items-center gap-1 text-xs justify-end", trendColor)}>
                      <TrendIcon className="w-3 h-3" />
                      <span className="tabular-nums">
                        {driver.delta > 0 ? '+' : ''}{formatPercent(driver.delta)}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
