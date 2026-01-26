/**
 * SegmentDimensionCard - Enhanced segment tile with driver explanation
 * 
 * Shows: Headcount, Utilization %, Unrealized Value, Top category driving unrealized value
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';
import { SegmentDimension, DRIVER_DEFINITIONS } from '@/hooks/useSegmentData';

interface SegmentDimensionCardProps {
  dimension: SegmentDimension;
  isSelected: boolean;
  onClick: () => void;
}

export function SegmentDimensionCard({ dimension, isSelected, onClick }: SegmentDimensionCardProps) {
  const Icon = dimension.icon;
  const isLowCoverage = dimension.coverage < 70;
  
  // Find top driver from dimension values
  const getTopDriver = () => {
    const driverCounts: Record<string, number> = {};
    dimension.values.forEach(v => {
      if (v.drivers && v.drivers.length > 0) {
        const topDriver = v.drivers.sort((a, b) => b.percentage - a.percentage)[0];
        driverCounts[topDriver.id] = (driverCounts[topDriver.id] || 0) + topDriver.percentage;
      }
    });
    const sorted = Object.entries(driverCounts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      const driverId = sorted[0][0] as keyof typeof DRIVER_DEFINITIONS;
      return DRIVER_DEFINITIONS[driverId]?.shortName || 'Unknown';
    }
    return 'Awareness'; // default
  };
  
  const topDriver = getTopDriver();
  
  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:border-accent/50 hover:shadow-md',
        isSelected && 'ring-2 ring-accent border-accent',
        !dimension.isAvailable && 'opacity-70'
      )}
      onClick={onClick}
    >
      <CardContent className="pt-4 pb-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              'p-2 rounded-lg',
              isSelected ? 'bg-accent text-accent-foreground' : 'bg-muted'
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">{dimension.name}</h4>
              <p className="text-xs text-muted-foreground">{dimension.description}</p>
            </div>
          </div>
          {isLowCoverage && (
            <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Low data
            </Badge>
          )}
        </div>
        
        {/* KPIs Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-muted/50">
            <p className="text-muted-foreground">Headcount</p>
            <p className="font-semibold">{formatInteger(dimension.headcount)}</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <p className="text-muted-foreground">Utilization</p>
            <div className="flex items-center gap-1">
              <p className={cn(
                "font-semibold",
                dimension.utilizationRate >= 75 ? 'text-success' :
                dimension.utilizationRate >= 50 ? 'text-foreground' :
                'text-warning'
              )}>
                {formatPercent(dimension.utilizationRate)}
              </p>
              <Progress value={dimension.utilizationRate} className="h-1 w-8" />
            </div>
          </div>
          <div className="p-2 rounded bg-muted/50 col-span-2">
            <p className="text-muted-foreground">Unrealized Value</p>
            <p className="font-semibold text-warning">
              {formatCurrencyAED(dimension.unusedEntitlement, { abbreviate: true })}
            </p>
          </div>
        </div>
        
        {/* Top Category Driving Unrealized */}
        <div className="mt-3 pt-2 border-t space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Top category:</span>
            <Badge variant="secondary" className="text-xs">{dimension.topCategory}</Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Top driver:
            </span>
            <Badge variant="outline" className="text-xs border-accent/30 text-accent bg-accent/5">
              {topDriver}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
